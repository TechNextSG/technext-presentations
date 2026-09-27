/* TechNext HTML decks: shared engine.
   Slides are <section class="slide" id="..."> inside .stage. Keys: → Space PgDn next · ← PgUp prev · Home End ·
   O overview · F fullscreen · N speaker notes · ? help. Click empty space to advance, swipe on touch.
   [data-in] animates when a slide opens; [data-step="n"] builds on the n-th press ([data-until="m"] hides it again).
   Slides register behaviour with Deck.on(id, {init, enter(ctx, slide), step(n, ctx, slide), leave(slide), settle(slide)});
   settle runs once the slide has faded out, to leave it in its finished state for the overview and for print.
   every timer, loop and listener made through ctx is cleaned up when the slide closes. */
(function () {
  'use strict';
  var W = 1600, H = 900;
  var root = document.querySelector('.deck'), stage = root.querySelector('.stage');
  var slides = [].slice.call(stage.querySelectorAll('.slide'));
  var hooks = {}, cur = -1, step = 0, ctx = null, scale = 1, overview = false, oCursor = 0;
  var params = new URLSearchParams(location.search);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- helpers */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var ease = {
    out: function (t) { return 1 - Math.pow(1 - t, 3); },
    io: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    lin: function (t) { return t; }
  };
  function lpos(el, stop) { var x = 0, y = 0; while (el && el !== stop) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return [x, y, el === stop]; }
  // layout box of el relative to ref, in stage pixels, ignoring transforms (so entrance animations don't skew it)
  function lbox(el, ref) {
    var a = lpos(el, ref);
    if (!a[2]) { var s = el.closest('.slide'); a = lpos(el, s); var b = lpos(ref, s); a[0] -= b[0]; a[1] -= b[1]; }
    var w = el.offsetWidth, h = el.offsetHeight;
    return { x: a[0], y: a[1], w: w, h: h, cx: a[0] + w / 2, cy: a[1] + h / 2, r: a[0] + w, b: a[1] + h };
  }
  // visual box (includes transforms) in stage pixels
  function vbox(el, ref) {
    var a = el.getBoundingClientRect(), b = (ref || stage).getBoundingClientRect();
    return { x: (a.left - b.left) / scale, y: (a.top - b.top) / scale, w: a.width / scale, h: a.height / scale,
      cx: (a.left - b.left + a.width / 2) / scale, cy: (a.top - b.top + a.height / 2) / scale };
  }
  function money(n, cur) {
    return (cur || 'S$') + Number(n).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ---------------------------------------------------------------- per-activation context */
  function Ctx(slide) { this.slide = slide; this.alive = true; this._t = []; this._l = []; this._r = []; }
  Ctx.prototype.after = function (ms, fn) { var me = this, id = setTimeout(function () { if (me.alive) fn(); }, reduce ? Math.min(ms, 60) : ms); this._t.push(id); return id; };
  Ctx.prototype.every = function (ms, fn) { var me = this, id = setInterval(function () { if (me.alive) fn(); }, ms); this._t.push(-id); return id; };
  Ctx.prototype.wait = function (ms) { var me = this; return new Promise(function (res) { me.after(ms, res); }); };
  Ctx.prototype.on = function (el, ev, fn, opt) { el.addEventListener(ev, fn, opt); this._l.push([el, ev, fn, opt]); };
  // fn(elapsed ms, now) each frame until it returns false or the slide closes
  Ctx.prototype.frame = function (fn) {
    var me = this, t0 = performance.now(), rec = { id: 0 };
    function f(now) { if (!me.alive) return; if (fn(now - t0, now) !== false) rec.id = requestAnimationFrame(f); }
    rec.id = requestAnimationFrame(f); this._r.push(rec); return rec;
  };
  Ctx.prototype.tween = function (dur, fn, e) {
    var me = this, ez = ease[e || 'out'] || e;
    if (reduce) dur = Math.min(dur, 120);
    return new Promise(function (res) {
      me.frame(function (t) { var p = clamp(t / dur, 0, 1); fn(ez(p), p); if (p >= 1) { res(); return false; } });
    });
  };
  // count an element's number up to `to`; opts: from, dur, dec, pre, suf, sep
  Ctx.prototype.count = function (el, to, o) {
    o = o || {}; var from = o.from != null ? o.from : 0, dec = o.dec || 0;
    function fmt(v) { var s = v.toFixed(dec); if (o.sep !== false) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); return (o.pre || '') + s + (o.suf || ''); }
    el.textContent = fmt(from);
    return this.tween(o.dur || 1400, function (p) { el.textContent = fmt(from + (to - from) * p); }, o.ease || 'out');
  };
  // typewriter; resolves when done
  Ctx.prototype.type = function (el, text, speed) {
    var me = this, i = 0; speed = speed || 28; el.textContent = '';
    if (reduce) { el.textContent = text; return Promise.resolve(); }
    return new Promise(function (res) {
      (function tick() { if (!me.alive) return; i++; el.textContent = text.slice(0, i); if (i < text.length) me.after(speed + (text[i - 1] === ' ' ? speed * .6 : 0), tick); else res(); })();
    });
  };
  Ctx.prototype.kill = function () {
    this.alive = false;
    this._t.forEach(function (id) { if (id < 0) clearInterval(-id); else clearTimeout(id); });
    this._l.forEach(function (x) { x[0].removeEventListener(x[1], x[2], x[3]); });
    this._r.forEach(function (r) { cancelAnimationFrame(r.id); });
  };

  /* ---------------------------------------------------------------- chrome */
  var label = document.body.dataset.label || '';
  var logo = document.body.dataset.logo || 'assets/img/logo-horizontal.png', logoW = document.body.dataset.logoWhite || 'assets/img/logo-horizontal-white.png';
  var total = slides.length;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  slides.forEach(function (s, i) {
    s.dataset.num = pad(i + 1);
    if (!s.id) s.id = 's' + (i + 1);
    if (!s.dataset.title) { var h = s.querySelector('h1,h2'); s.dataset.title = h ? h.textContent.trim().replace(/\s+/g, ' ') : ''; }
    var c = document.createElement('div'); c.className = 's-chrome'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<img class="s-logo" src="' + (s.classList.contains('dark') ? logoW : logo) + '" alt="" width="150" height="30"><span class="s-label">' + label + '</span>';
    var f = document.createElement('div'); f.className = 's-foot'; f.setAttribute('aria-hidden', 'true');
    f.innerHTML = '<b>technext.asia</b><span>' + pad(i + 1) + ' / ' + pad(total) + '</span>';
    s.insertBefore(c, s.firstChild); s.appendChild(f);
    s.setAttribute('aria-roledescription', 'slide');
    s.setAttribute('aria-label', (i + 1) + ' of ' + total + ': ' + s.dataset.title);
  });
  var bg = document.createElement('div'); bg.className = 'stage-bg'; bg.innerHTML = '<i></i><i></i>'; stage.insertBefore(bg, stage.firstChild);
  var prog = document.createElement('div'); prog.className = 'progress'; prog.innerHTML = '<i></i>'; stage.appendChild(prog);

  var I = {
    prev: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    next: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    grid: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    full: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
    notes: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M4 10h16M4 15h10M4 20h7"/></svg>',
    help: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.3-2.5 3.8"/><path d="M12 17.2h.01"/></svg>',
    home: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>'
  };
  var ui = document.createElement('div'); ui.className = 'ui'; ui.setAttribute('role', 'toolbar'); ui.setAttribute('aria-label', 'Presentation controls');
  ui.innerHTML =
    (document.body.dataset.home ? '<button type="button" data-ui="home" title="All presentations" aria-label="All presentations">' + I.home + '</button><span class="sep"></span>' : '') +
    '<button type="button" data-ui="prev" title="Previous (←)" aria-label="Previous">' + I.prev + '</button>' +
    '<span class="count" aria-live="polite">1 / ' + total + '</span>' +
    '<button type="button" data-ui="next" title="Next (→ or Space)" aria-label="Next">' + I.next + '</button><span class="sep"></span>' +
    '<button type="button" data-ui="overview" title="All slides (O)" aria-label="All slides" aria-pressed="false">' + I.grid + '</button>' +
    '<button type="button" data-ui="notes" title="Speaker notes (N)" aria-label="Speaker notes" aria-pressed="false">' + I.notes + '</button>' +
    '<button type="button" data-ui="full" title="Full screen (F)" aria-label="Full screen">' + I.full + '</button>' +
    '<button type="button" data-ui="help" title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">' + I.help + '</button>';
  document.body.appendChild(ui);
  var countEl = $('.count', ui);
  var notesEl = document.createElement('div'); notesEl.className = 'notes-panel'; notesEl.setAttribute('aria-live', 'polite'); document.body.appendChild(notesEl);
  var helpEl = document.createElement('div'); helpEl.className = 'help'; helpEl.setAttribute('role', 'dialog'); helpEl.setAttribute('aria-label', 'Keyboard shortcuts');
  helpEl.innerHTML = '<div class="help-card"><h2>Keyboard shortcuts</h2><dl>' +
    '<dt><kbd>→</kbd><kbd>Space</kbd><kbd>PgDn</kbd></dt><dd>Next build or slide</dd>' +
    '<dt><kbd>←</kbd><kbd>PgUp</kbd></dt><dd>Back</dd>' +
    '<dt><kbd>Home</kbd><kbd>End</kbd></dt><dd>First or last slide</dd>' +
    '<dt><kbd>O</kbd></dt><dd>All slides (arrows + Enter to pick)</dd>' +
    '<dt><kbd>F</kbd></dt><dd>Full screen</dd>' +
    '<dt><kbd>N</kbd></dt><dd>Speaker notes</dd>' +
    '<dt><kbd>1</kbd>–<kbd>9</kbd> then <kbd>Enter</kbd></dt><dd>Jump to a slide</dd>' +
    '</dl><p class="small muted" style="margin:18px 0 0">Click empty space to advance · swipe on touch screens · add <b>?kiosk</b> to the address to loop on its own.</p></div>';
  document.body.appendChild(helpEl);
  var rot = document.createElement('div'); rot.className = 'rotate-hint'; rot.textContent = 'Turn your phone sideways for a bigger view'; document.body.appendChild(rot);

  /* ---------------------------------------------------------------- fit */
  function fit() {
    scale = Math.min(innerWidth / W, innerHeight / H);
    root.style.setProperty('--s', scale);
  }

  /* ---------------------------------------------------------------- steps */
  function stepsOf(i) {
    var s = slides[i];
    if (s._steps == null) { var m = +s.dataset.steps || 0; $$('[data-step]', s).forEach(function (e) { m = Math.max(m, +e.dataset.step || 0); }); s._steps = m; }
    return s._steps;
  }
  function paint(s, n) {
    s.dataset.cur = n;
    $$('[data-step]', s).forEach(function (e) {
      var a = +e.dataset.step, u = e.dataset.until != null ? +e.dataset.until : Infinity;
      e.classList.toggle('is-shown', n >= a && n <= u);
      if (e.hasAttribute('data-dim')) e.classList.toggle('is-past', n > a);
    });
  }

  /* ---------------------------------------------------------------- navigation */
  function go(i, s) {
    i = clamp(i | 0, 0, total - 1);
    var n = stepsOf(i);
    s = s == null ? 0 : s < 0 ? n : clamp(s, 0, n);
    if (i === cur) { setStep(s); return; }
    var prev = cur;
    if (prev >= 0) {
      var ps = slides[prev];
      ps.classList.remove('is-active');
      if (ctx) ctx.kill();
      var h0 = hooks[ps.id]; if (h0 && h0.leave) try { h0.leave(ps); } catch (e) { console.error(e); }
      setTimeout(function () {
        if (slides[cur] === ps) return;
        ps.classList.remove('is-in');
        if (h0 && h0.settle) try { h0.settle(ps); } catch (e) { console.error(e); }
      }, 900);
    }
    cur = i; step = s;
    slides.forEach(function (sl, k) { sl.classList.toggle('is-before', k < i); sl.classList.toggle('is-after', k > i); sl.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    var sl = slides[i];
    paint(sl, s);
    sl.classList.add('is-active');
    root.dataset.theme = sl.classList.contains('dark') ? 'dark' : 'light';
    ctx = new Ctx(sl);
    var c = ctx;
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (c.alive) sl.classList.add('is-in'); }); });
    var h = hooks[sl.id];
    if (h && h.enter) try { h.enter(c, sl); } catch (e) { console.error(e); }
    if (h && h.step) try { h.step(s, c, sl, true); } catch (e) { console.error(e); }
    ui_update();
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) {}
    kiosk_reset();
  }
  function setStep(s) {
    var sl = slides[cur]; s = clamp(s, 0, stepsOf(cur));
    if (s === step) return;
    step = s; paint(sl, s);
    var h = hooks[sl.id]; if (h && h.step) try { h.step(s, ctx, sl, false); } catch (e) { console.error(e); }
    ui_update(); kiosk_reset();
  }
  function next() { if (step < stepsOf(cur)) setStep(step + 1); else if (cur < total - 1) go(cur + 1, 0); }
  function prev() { if (step > 0) setStep(step - 1); else if (cur > 0) go(cur - 1, -1); }

  function ui_update() {
    countEl.textContent = (cur + 1) + ' / ' + total;
    var built = 0, all = 0;
    for (var k = 0; k < total; k++) { var n = stepsOf(k) + 1; all += n; if (k < cur) built += n; }
    built += step + 1;
    prog.style.setProperty('--p', total > 1 ? (built - 1) / (all - 1) : 1);
    if (notesEl.classList.contains('is-open')) notes_fill();
  }

  /* ---------------------------------------------------------------- overview */
  function layoutOverview() {
    var n = total, cols = n <= 4 ? 2 : n <= 9 ? 3 : n <= 16 ? 4 : 5, rows = Math.ceil(n / cols), gap = 30;
    var k = Math.min((W - gap * (cols + 1)) / cols / W, (H - gap * (rows + 1)) / rows / H);
    var tw = W * k, th = H * k, ox = (W - (cols * tw + (cols - 1) * gap)) / 2, oy = (H - (rows * th + (rows - 1) * gap)) / 2;
    slides.forEach(function (s, i) {
      var c = i % cols, r = (i / cols) | 0;
      s.style.setProperty('--ox', (ox + c * (tw + gap)) + 'px'); s.style.setProperty('--oy', (oy + r * (th + gap)) + 'px'); s.style.setProperty('--ok', k);
    });
    return cols;
  }
  var oCols = 4;
  function setOverview(on) {
    overview = on; oCols = layoutOverview();
    root.classList.toggle('is-overview', on);
    $('[data-ui=overview]', ui).setAttribute('aria-pressed', on);
    oCursor = cur; slides.forEach(function (s, i) { s.classList.toggle('is-cursor', on && i === oCursor); });
  }
  function moveCursor(d) { oCursor = clamp(oCursor + d, 0, total - 1); slides.forEach(function (s, i) { s.classList.toggle('is-cursor', i === oCursor); }); }

  /* ---------------------------------------------------------------- notes, help, fullscreen */
  function notes_fill() {
    var n = slides[cur].querySelector('.notes');
    notesEl.innerHTML = '<b>Speaker notes · slide ' + (cur + 1) + '</b>' + (n ? n.innerHTML : '<p>No notes for this slide.</p>');
  }
  function toggleNotes() { var on = !notesEl.classList.contains('is-open'); notesEl.classList.toggle('is-open', on); $('[data-ui=notes]', ui).setAttribute('aria-pressed', on); if (on) notes_fill(); }
  function toggleHelp(on) { helpEl.classList.toggle('is-open', on == null ? !helpEl.classList.contains('is-open') : on); }
  function toggleFull() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    } catch (e) {}
  }

  /* ---------------------------------------------------------------- input */
  var typed = '', typedT = 0;
  addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target, k = e.key;
    if (t.closest && t.closest('input,textarea,select,[contenteditable=true]')) return;
    var onCtl = t.closest && t.closest('.slide button,.slide a,.slide [role=button],.slide [tabindex]');
    if (helpEl.classList.contains('is-open')) { if (k === 'Escape' || k === '?') { toggleHelp(false); e.preventDefault(); } return; }
    if (overview) {
      if (k === 'ArrowRight') moveCursor(1); else if (k === 'ArrowLeft') moveCursor(-1);
      else if (k === 'ArrowDown') moveCursor(oCols); else if (k === 'ArrowUp') moveCursor(-oCols);
      else if (k === 'Enter' || k === ' ') { setOverview(false); go(oCursor, 0); }
      else if (k === 'Escape' || k === 'o' || k === 'O') setOverview(false);
      else return;
      e.preventDefault(); return;
    }
    if (/^[0-9]$/.test(k)) { typed += k; clearTimeout(typedT); typedT = setTimeout(function () { typed = ''; }, 1500); return; }
    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': next(); break;
      case ' ': case 'Enter':
        if (onCtl) return;
        if (k === 'Enter' && typed) { go(+typed - 1, 0); typed = ''; break; }
        if (e.shiftKey) prev(); else next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': prev(); break;
      case 'Home': go(0, 0); break;
      case 'End': go(total - 1, -1); break;
      case 'o': case 'O': case 'Escape': if (k === 'Escape' && !overview) { if (notesEl.classList.contains('is-open')) { toggleNotes(); break; } } setOverview(!overview); break;
      case 'f': case 'F': toggleFull(); break;
      case 'n': case 'N': toggleNotes(); break;
      case '?': toggleHelp(); break;
      default: return;
    }
    e.preventDefault();
  });

  var INTERACTIVE = 'a,button,input,select,textarea,label,summary,[role=button],[role=slider],[role=tab],[tabindex],[data-i]';
  stage.addEventListener('click', function (e) {
    if (overview) {
      var s = e.target.closest('.slide'); if (s) { setOverview(false); go(slides.indexOf(s), 0); }
      return;
    }
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.target.closest(INTERACTIVE)) return;
    var sel = window.getSelection && getSelection(); if (sel && String(sel).length) return;
    if (root.dataset.noclick != null) return;
    next();
  });
  // mouse clicks on slide controls shouldn't keep focus, so Space/Enter keep driving the deck
  stage.addEventListener('pointerup', function (e) {
    if (e.pointerType !== 'mouse') return;
    var b = e.target.closest('button,a,[role=button],[role=tab]'); if (b) setTimeout(function () { if (document.activeElement === b) b.blur(); }, 0);
  });
  var tx = 0, ty = 0, tOk = false;
  stage.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { tOk = false; return; }
    // swipes work over the demos too; only elements that drag ([data-drag], sliders) keep the gesture
    tOk = !e.target.closest('[data-drag],[role=slider],input,textarea');
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (!tOk || overview) return;
    var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { if (dx < 0) next(); else prev(); }
  }, { passive: true });

  ui.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ui]'); if (!b) return;
    var a = b.dataset.ui;
    if (a === 'prev') prev(); else if (a === 'next') next();
    else if (a === 'overview') setOverview(!overview);
    else if (a === 'notes') toggleNotes();
    else if (a === 'full') toggleFull();
    else if (a === 'help') toggleHelp();
    else if (a === 'home') location.href = document.body.dataset.home;
  });
  helpEl.addEventListener('click', function (e) { if (e.target === helpEl) toggleHelp(false); });

  // the control bar fades out while nobody moves the mouse
  var idleT = 0;
  function wake() { ui.classList.remove('is-idle'); clearTimeout(idleT); idleT = setTimeout(function () { if (!ui.matches(':hover') && !ui.contains(document.activeElement)) ui.classList.add('is-idle'); }, 2800); }
  addEventListener('mousemove', wake, { passive: true }); addEventListener('touchstart', wake, { passive: true }); addEventListener('keydown', function (e) { if (e.key === 'Tab') wake(); });

  addEventListener('resize', function () { fit(); if (overview) layoutOverview(); });
  addEventListener('hashchange', function () { var n = parseInt(location.hash.slice(1), 10); if (n && n - 1 !== cur) go(n - 1, 0); });

  /* ---------------------------------------------------------------- kiosk: ?kiosk (or ?kiosk=8 seconds) loops on its own */
  var kiosk = params.has('kiosk') ? (+params.get('kiosk') || 9) * 1000 : 0, kT = 0;
  function kiosk_reset() {
    if (!kiosk) return; clearTimeout(kT);
    var sl = slides[cur], dur = (+sl.dataset.dur || kiosk) / (stepsOf(cur) + 1);
    kT = setTimeout(function () { if (step < stepsOf(cur)) next(); else go(cur < total - 1 ? cur + 1 : 0, 0); }, dur);
  }

  /* ---------------------------------------------------------------- print: every build shown, then back */
  addEventListener('beforeprint', function () { slides.forEach(function (s, i) { paint(s, stepsOf(i)); s.classList.add('is-in'); }); });
  addEventListener('afterprint', function () { slides.forEach(function (s, i) { if (i !== cur) { paint(s, 0); s.classList.remove('is-in'); } else paint(s, step); }); });

  /* ---------------------------------------------------------------- public API */
  window.Deck = {
    on: function (id, h) { hooks[id] = h; },
    go: function (i, s) { if (overview) setOverview(false); go(i, s); },
    goId: function (id, s) { var i = slides.findIndex(function (x) { return x.id === id; }); if (i >= 0) Deck.go(i, s); },
    next: next, prev: prev,
    get index() { return cur; }, get step() { return step; }, get scale() { return scale; },
    slides: slides, $: $, $$: $$, lbox: lbox, vbox: vbox, clamp: clamp, ease: ease, money: money, reduce: reduce
  };

  function start() {
    fit();
    Object.keys(hooks).forEach(function (id) { var s = document.getElementById(id); if (s && hooks[id].init) try { hooks[id].init(s); } catch (e) { console.error(e); } });
    var n = parseInt(location.hash.slice(1), 10);
    go(n && n <= total ? n - 1 : 0, 0);
    if (params.has('print')) slides.forEach(function (s, i) { paint(s, stepsOf(i)); s.classList.add('is-in'); });
    wake();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else setTimeout(start, 0);
})();

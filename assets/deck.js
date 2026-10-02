/* TechNext HTML decks: shared engine.
   Slides are <section class="slide" id="..."> inside .stage. Keys: → Space PgDn next · ← PgUp prev · Home End ·
   O overview · F fullscreen (F5 too) · N speaker notes · P presenter view · B black screen · T display (HDMI / Wi-Fi) · ? help. Click empty space to advance, swipe on touch.
   [data-in] animates when a slide opens; [data-step="n"] builds on the n-th press ([data-until="m"] hides it again).
   Slides register behaviour with Deck.on(id, {init, enter(ctx, slide), step(n, ctx, slide), leave(slide), settle(slide)});
   settle runs once the slide has faded out, to leave it in its finished state for the overview; ?print and printing
   settle every slide (enter never runs there), so the PDF shows each one finished.
   Phones held upright: the whole deck turns 90° to fill the screen; Deck.rect/Deck.point give positions in the deck's axes.
   every timer, loop and listener made through ctx is cleaned up when the slide closes. */
(function () {
  'use strict';
  var W = 1600, H = 900;
  var root = document.querySelector('.deck'), stage = root.querySelector('.stage');
  var slides = [].slice.call(stage.querySelectorAll('.slide'));
  var hooks = {}, cur = -1, step = 0, ctx = null, scale = 1, overview = false, oCursor = 0;
  var params = new URLSearchParams(location.search);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PRINT = params.has('print'), PRESENTER = params.has('presenter');
  // Display: 'full' (HDMI cable: every animation), 'cast' (Wi-Fi casting and TV browsers: less motion, so the video stream
  // stays sharp; deck.css .is-tv) or 'auto' (lighter on its own for TV browsers, 4K outputs, low-core machines and ?kiosk).
  // Picked from the screen button in the control bar or with T, remembered on this browser; ?display=full|cast|auto, ?tv, ?tv=0.
  var DKEY = 'tn-deck-display', MODES = ['auto', 'full', 'cast'];
  function tvAuto() {
    if (params.has('kiosk')) return true;
    if (/SMART-TV|SmartTV|Tizen|Web0S|webOS|BRAVIA|Android TV|GoogleTV|AFT[A-Z]|CrKey|HbbTV|NetCast|Roku|VIDAA|Viera/i.test(navigator.userAgent || '')) return true;
    return Math.max(screen.width, screen.height) * (window.devicePixelRatio || 1) >= 3000 || (navigator.hardwareConcurrency || 8) <= 4;
  }
  function modeSaved() {
    try { var v = localStorage.getItem(DKEY), old = localStorage.getItem('tn-deck-tv'); return MODES.indexOf(v) >= 0 ? v : old === '1' ? 'cast' : old === '0' ? 'full' : null; }
    catch (e) { return null; }
  }
  var mode = MODES.indexOf(params.get('display')) >= 0 ? params.get('display') : params.has('tv') ? (params.get('tv') !== '0' ? 'cast' : 'full') : modeSaved() || 'auto';
  function lightFor(m) { return m === 'cast' || (m === 'auto' && tvAuto()); }
  var tv = lightFor(mode);
  // a phone (coarse pointer, short side up to 600 px) held upright gets the deck turned 90°, filling the screen
  var rotated = false, rotW = 0;
  function isPhone() { return !!(window.matchMedia && matchMedia('(pointer: coarse)').matches) && Math.min(screen.width, screen.height) <= 600; }

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
  // an element's box and a pointer's position in the deck's own axes: the screen's, unless the deck is turned for a phone
  function rect(el) {
    var a = el.getBoundingClientRect();
    if (!rotated) return a;
    var l = a.top, t = rotW - a.right;
    return { left: l, top: t, right: l + a.height, bottom: t + a.width, width: a.height, height: a.width, x: l, y: t };
  }
  function point(e) { return rotated ? { x: e.clientY, y: rotW - e.clientX } : { x: e.clientX, y: e.clientY }; }
  // visual box (includes transforms) in stage pixels
  function vbox(el, ref) {
    var a = rect(el), b = rect(ref || stage);
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
  // a client proposal shows the client's logo beside TechNext's: body data-cobrand (light slides), data-cobrand-white (dark)
  var co = document.body.dataset.cobrand, coW = document.body.dataset.cobrandWhite || co;
  var total = slides.length;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  slides.forEach(function (s, i) {
    s.dataset.num = pad(i + 1);
    if (!s.id) s.id = 's' + (i + 1);
    if (!s.dataset.title) { var h = s.querySelector('h1,h2'); s.dataset.title = h ? h.textContent.trim().replace(/\s+/g, ' ') : ''; }
    var c = document.createElement('div'); c.className = 's-chrome'; c.setAttribute('aria-hidden', 'true');
    var dk = s.classList.contains('dark');
    c.innerHTML = '<span class="s-brand"><img class="s-logo" src="' + (dk ? logoW : logo) + '" alt="" width="150" height="30">' +
      (co ? '<i class="s-x"></i><img class="s-co" src="' + (dk ? coW : co) + '" alt="">' : '') + '</span><span class="s-label">' + label + '</span>';
    var f = document.createElement('div'); f.className = 's-foot'; f.setAttribute('aria-hidden', 'true');
    f.innerHTML = '<b>technext.asia</b><span>' + pad(i + 1) + ' / ' + pad(total) + '</span>';
    s.insertBefore(c, s.firstChild); s.appendChild(f);
    s.setAttribute('aria-roledescription', 'slide');
    s.setAttribute('aria-label', (i + 1) + ' of ' + total + ': ' + s.dataset.title);
  });
  root.classList.toggle('is-tv', tv && !PRINT);
  var tvToast = document.createElement('div'); tvToast.className = 'tv-toast'; tvToast.setAttribute('role', 'status'); root.appendChild(tvToast);
  var tvT = 0;
  // the Display menu, opened from the screen button in the control bar
  var disp = document.createElement('div'); disp.className = 'disp'; disp.setAttribute('role', 'menu'); disp.setAttribute('aria-label', 'Display');
  disp.innerHTML = '<p class="disp-h">Display</p>' +
    '<button type="button" role="menuitemradio" data-mode="full"><b>HDMI cable</b><small>Full quality, every animation. A cable sends the picture to the TV untouched.</small></button>' +
    '<button type="button" role="menuitemradio" data-mode="cast"><b>Wi-Fi / casting</b><small>Less motion, so the picture stays sharp and smooth over Wi-Fi. Also for a TV\'s own browser.</small></button>' +
    '<button type="button" role="menuitemradio" data-mode="auto"><b>Auto</b><small>Less motion on 4K and TV screens and slower laptops, full quality elsewhere.</small></button>' +
    '<p class="disp-now"></p>' +
    '<button type="button" role="menuitem" class="disp-act" data-act="presenter"><b>Presenter view (P)</b><small>Your notes, the next slide and a timer in a second window. Put the slides on the TV.</small></button>' +
    '<p class="disp-off"></p>';
  root.appendChild(disp);
  function paintDisp() {
    $$('[data-mode]', disp).forEach(function (b) { b.setAttribute('aria-checked', b.dataset.mode === mode ? 'true' : 'false'); });
    $('.disp-now', disp).textContent = 'Now: ' + (tv ? 'less motion' : 'full quality') + (mode === 'auto' ? ', picked for this screen' : '');
  }
  function setMode(m, quiet) {
    mode = m; tv = lightFor(m); root.classList.toggle('is-tv', tv && !PRINT);
    try { localStorage.setItem(DKEY, m); } catch (e) {}
    paintDisp();
    if (quiet) return;
    note(m === 'full' ? 'HDMI cable: full quality' : m === 'cast' ? 'Wi-Fi / casting: less motion, sharper picture' : 'Auto: ' + (tv ? 'less motion on this screen' : 'full quality on this screen'));
  }
  function note(t, ms) { tvToast.textContent = t; tvToast.classList.add('is-on'); clearTimeout(tvT); tvT = setTimeout(function () { tvToast.classList.remove('is-on'); }, ms || 1800); }
  paintDisp();

  /* ---------------------------------------------------------------- black or white screen: B or . / W or , (clickers' blank button) */
  var blackMode = '';
  var blk = document.createElement('div'); blk.className = 'blackout'; blk.setAttribute('aria-hidden', 'true'); root.appendChild(blk);
  blk.addEventListener('click', function () { setBlack(''); });
  function setBlack(v) {
    blackMode = v || '';
    root.classList.toggle('is-black', blackMode === 'black'); root.classList.toggle('is-white', blackMode === 'white');
    share({ t: 'black', v: blackMode }); pvUpdate();
  }

  /* ---------------------------------------------------------------- presenter view: P opens a second window with the notes, the next
     slide and a timer. Every window of this deck follows the others (BroadcastChannel), so the slides can sit full screen on the TV. */
  var bc = null, remote = false, pv = null, pvT0 = Date.now();
  try { bc = new BroadcastChannel('tn-deck:' + location.pathname); } catch (e) {}
  function share(m) { if (bc && !remote) try { bc.postMessage(m); } catch (e) {} }
  if (bc) bc.onmessage = function (e) {
    var m = e.data || {};
    if (m.t === 'hello') { share({ t: 'go', i: cur, s: step }); if (blackMode) share({ t: 'black', v: blackMode }); return; }
    remote = true;
    try { if (m.t === 'go' && cur >= 0) go(m.i, m.s); else if (m.t === 'black') setBlack(m.v); } finally { remote = false; }
  };
  function openPresenter() {
    var w = null;
    try { w = window.open(location.pathname + '?presenter#' + (cur + 1), 'tn-presenter', 'popup,width=1200,height=740'); } catch (e) {}
    if (w) note('Presenter view open. Put this window on the TV and press F.', 3600); else note('Allow pop-ups for this site to open the presenter view.', 3600);
  }
  // built from start(), once the icons below exist
  function pvBuild() {
    if (!PRESENTER || PRINT) return;
    root.classList.add('is-presenter', 'is-tv');
    document.title = 'Presenter · ' + document.title;
    pv = document.createElement('aside'); pv.className = 'pv'; pv.setAttribute('aria-label', 'Presenter view');
    pv.innerHTML = '<div class="pv-top"><span class="pv-n"></span><span class="pv-clock"></span><button type="button" class="pv-timer" title="Reset the timer">00:00</button></div>' +
      '<p class="pv-title"></p><p class="pv-step"></p><div class="pv-notes"></div><p class="pv-next"><small>Next</small><b></b></p>' +
      '<div class="pv-acts"><button type="button" data-pv="prev">' + I.prev + 'Back</button><button type="button" data-pv="black" aria-pressed="false">Black screen</button><button type="button" data-pv="next">Next' + I.next + '</button></div>' +
      '<p class="pv-hint">This window follows the slides and steers them: put the other window on the TV and press F there. A demo you click runs in the window you click.</p>';
    root.appendChild(pv);
    pv.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pv],.pv-timer'); if (!b) return;
      e.stopPropagation();
      if (b.classList.contains('pv-timer')) { pvT0 = Date.now(); pvTick(); return; }
      var a = b.dataset.pv; if (a === 'next') next(); else if (a === 'prev') prev(); else if (a === 'black') setBlack(blackMode ? '' : 'black');
    });
    setInterval(pvTick, 1000);
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function pvTick() {
    if (!pv) return;
    var s = Math.floor((Date.now() - pvT0) / 1000), d = new Date();
    $('.pv-timer', pv).textContent = (s >= 3600 ? Math.floor(s / 3600) + ':' : '') + pad2(Math.floor(s / 60) % 60) + ':' + pad2(s % 60);
    $('.pv-clock', pv).textContent = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function pvUpdate() {
    if (!pv || cur < 0) return;
    var s = slides[cur], n = s.querySelector('.notes'), nx = slides[cur + 1], st = stepsOf(cur);
    $('.pv-n', pv).textContent = 'Slide ' + (cur + 1) + ' of ' + total;
    $('.pv-title', pv).textContent = s.dataset.title || '';
    $('.pv-step', pv).textContent = st ? 'Build ' + step + ' of ' + st + (step < st ? ': the next press shows the next build' : '') : '';
    $('.pv-notes', pv).innerHTML = n ? n.innerHTML : '<p class="pv-none">No notes for this slide.</p>';
    $('.pv-next b', pv).textContent = nx ? (cur + 2) + ' · ' + nx.dataset.title : 'End of the deck';
    var bb = $('[data-pv=black]', pv); bb.setAttribute('aria-pressed', blackMode ? 'true' : 'false'); bb.textContent = blackMode ? 'Show the slides' : 'Black screen';
    pvTick();
  }

  /* ---------------------------------------------------------------- keep the screen awake while presenting (full screen, kiosk, presenter) */
  var wakeLock = null;
  function holdScreen() {
    if (!('wakeLock' in navigator)) return;
    var want = (!!document.fullscreenElement || !!kiosk || PRESENTER) && document.visibilityState === 'visible';
    if (want && !wakeLock) navigator.wakeLock.request('screen').then(function (l) { wakeLock = l; l.addEventListener('release', function () { wakeLock = null; }); }).catch(function () {});
    else if (!want && wakeLock) { wakeLock.release().catch(function () {}); wakeLock = null; }
  }
  document.addEventListener('fullscreenchange', holdScreen); document.addEventListener('visibilitychange', holdScreen);

  /* ---------------------------------------------------------------- offline: once opened online, a deck opens and runs with no
     connection on this device (sw.js). Only on the live https site, so a local preview never serves a stale copy. */
  function saveOffline() {
    if (!('serviceWorker' in navigator) || location.protocol !== 'https:' || PRINT) return;
    navigator.serviceWorker.register('sw.js').then(function () { return navigator.serviceWorker.ready; }).then(function (reg) {
      navigator.serviceWorker.addEventListener('message', function (e) { if (e.data && e.data.warmed) $('.disp-off', disp).textContent = 'Saved on this device: opens with no internet.'; });
      if (reg.active) reg.active.postMessage({ warm: [location.href.split('#')[0]] });
    }).catch(function () {});
  }

  var bg = document.createElement('div'); bg.className = 'stage-bg'; bg.innerHTML = '<i></i><i></i>'; stage.insertBefore(bg, stage.firstChild);
  var prog = document.createElement('div'); prog.className = 'progress'; prog.innerHTML = '<i></i>'; stage.appendChild(prog);

  var I = {
    prev: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    next: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    grid: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    full: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
    notes: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M4 10h16M4 15h10M4 20h7"/></svg>',
    help: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.3-2.5 3.8"/><path d="M12 17.2h.01"/></svg>',
    screen: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
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
    '<button type="button" data-ui="display" title="Display: HDMI cable or Wi-Fi (T)" aria-label="Display" aria-haspopup="menu" aria-expanded="false">' + I.screen + '</button>' +
    '<button type="button" data-ui="help" title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">' + I.help + '</button>';
  root.appendChild(ui);
  // no full screen for pages on iPhone Safari, and no keyboard on a phone: those two buttons go
  if (!document.documentElement.requestFullscreen) $('[data-ui=full]', ui).hidden = true;
  if (isPhone()) $('[data-ui=help]', ui).hidden = true;
  var countEl = $('.count', ui);
  var notesEl = document.createElement('div'); notesEl.className = 'notes-panel'; notesEl.setAttribute('aria-live', 'polite'); root.appendChild(notesEl);
  var helpEl = document.createElement('div'); helpEl.className = 'help'; helpEl.setAttribute('role', 'dialog'); helpEl.setAttribute('aria-label', 'Keyboard shortcuts');
  helpEl.innerHTML = '<div class="help-card"><h2>Keyboard shortcuts</h2><dl>' +
    '<dt><kbd>→</kbd><kbd>Space</kbd><kbd>PgDn</kbd></dt><dd>Next build or slide</dd>' +
    '<dt><kbd>←</kbd><kbd>PgUp</kbd></dt><dd>Back</dd>' +
    '<dt><kbd>Home</kbd><kbd>End</kbd></dt><dd>First or last slide</dd>' +
    '<dt><kbd>O</kbd></dt><dd>All slides (arrows + Enter to pick, O or Esc to close)</dd>' +
    '<dt><kbd>F</kbd></dt><dd>Full screen</dd>' +
    '<dt><kbd>N</kbd></dt><dd>Speaker notes</dd>' +
    '<dt><kbd>P</kbd></dt><dd>Presenter view: notes, next slide and a timer in a second window</dd>' +
    '<dt><kbd>B</kbd><kbd>.</kbd></dt><dd>Black screen (<kbd>W</kbd> or <kbd>,</kbd> for white); any key brings the slide back</dd>' +
    '<dt><kbd>T</kbd></dt><dd>Display: Auto, HDMI cable (full quality) or Wi-Fi casting (less motion)</dd>' +
    '<dt><kbd>1</kbd>–<kbd>9</kbd> then <kbd>Enter</kbd></dt><dd>Jump to a slide</dd>' +
    '</dl><p class="small muted" style="margin:18px 0 0">Click empty space to advance · swipe on touch screens · clickers and TV remotes work (Page Down / Up, arrows, OK; F5 starts full screen) · add <b>?kiosk</b> to the address to loop on its own.</p></div>';
  root.appendChild(helpEl);
  // shown upright for a few seconds when the deck turns for a phone
  var rot = document.createElement('div'); rot.className = 'rotate-hint'; rot.setAttribute('aria-hidden', 'true');
  rot.innerHTML = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2.5"/><path d="M1.5 9.5a8 8 0 0 1 3-4.8M22.5 14.5a8 8 0 0 1-3 4.8"/><path d="M4.4 2.4v2.4H2M19.6 21.6v-2.4H22"/></svg>Turn your phone sideways';
  document.body.appendChild(rot);

  /* ---------------------------------------------------------------- fit */
  var hintT = 0, hinted = false;
  function fit() {
    var vw = innerWidth, vh = innerHeight;
    rotated = !PRINT && vh > vw && isPhone();
    root.classList.toggle('is-rotated', rotated);
    if (rotated) { rotW = vw; root.style.left = vw + 'px'; root.style.width = vh + 'px'; root.style.height = vw + 'px'; var t = vw; vw = vh; vh = t; }
    else { root.style.left = root.style.width = root.style.height = ''; }
    root.style.setProperty('--vw', vw + 'px'); root.style.setProperty('--vh', vh + 'px');
    // phones: a smaller control bar, so it covers less of the slide
    root.classList.toggle('is-compact', vh < 520);
    if (PRESENTER) { var pw = Math.round(Math.min(480, Math.max(330, vw * .36))); root.style.setProperty('--pvw', pw + 'px'); vw = Math.max(200, vw - pw - 32); vh = Math.max(200, vh - 32); }
    scale = Math.min(vw / W, vh / H);
    root.style.setProperty('--s', scale);
    if (!rotated) { hinted = false; rot.classList.remove('is-on'); }
    else if (!hinted) { hinted = true; rot.classList.add('is-on'); clearTimeout(hintT); hintT = setTimeout(function () { rot.classList.remove('is-on'); }, 4200); }
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
    // print never plays a slide: settleAll leaves every one finished instead
    if (h && h.enter && !PRINT) try { h.enter(c, sl); } catch (e) { console.error(e); }
    if (h && h.step && !PRINT) try { h.step(s, c, sl, true); } catch (e) { console.error(e); }
    ui_update();
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) {}
    kiosk_reset();
    // other scripts (lazy images) follow along
    try { root.dispatchEvent(new CustomEvent('deck:slide', { detail: { index: i } })); } catch (e) {}
    share({ t: 'go', i: cur, s: step });
  }
  function setStep(s) {
    var sl = slides[cur]; s = clamp(s, 0, stepsOf(cur));
    if (s === step) return;
    step = s; paint(sl, s);
    var h = hooks[sl.id]; if (h && h.step) try { h.step(s, ctx, sl, false); } catch (e) { console.error(e); }
    ui_update(); kiosk_reset();
    share({ t: 'go', i: cur, s: step });
  }
  // with the screen blacked out, the first press (or click) brings the slide back without moving on
  function next() { if (blackMode) { setBlack(''); return; } if (step < stepsOf(cur)) setStep(step + 1); else if (cur < total - 1) go(cur + 1, 0); }
  function prev() { if (blackMode) { setBlack(''); return; } if (step > 0) setStep(step - 1); else if (cur > 0) go(cur - 1, -1); }

  function ui_update() {
    countEl.textContent = (cur + 1) + ' / ' + total;
    var built = 0, all = 0;
    for (var k = 0; k < total; k++) { var n = stepsOf(k) + 1; all += n; if (k < cur) built += n; }
    built += step + 1;
    prog.style.setProperty('--p', total > 1 ? (built - 1) / (all - 1) : 1);
    if (notesEl.classList.contains('is-open')) notes_fill();
    pvUpdate();
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
  var oCols = 4, switching = false;
  // The overview swaps in while the stage is faded out: no transitions run, so nothing flies across the screen.
  function setOverview(on, then) {
    if (switching) return;
    if (on === overview) { if (then) then(); return; }
    switching = true;
    root.classList.add('is-fading');
    setTimeout(function () {
      root.classList.add('no-anim');
      // every other slide shows finished in the grid, visited or not (the current one keeps playing)
      if (on) slides.forEach(function (sl, i) { if (i !== cur) settleOne(sl); });
      overview = on; oCols = layoutOverview();
      root.classList.toggle('is-overview', on);
      if (on) try { root.dispatchEvent(new CustomEvent('deck:overview')); } catch (e) {}
      $('[data-ui=overview]', ui).setAttribute('aria-pressed', on);
      oCursor = cur; slides.forEach(function (s, i) { s.classList.toggle('is-cursor', on && i === oCursor); });
      if (then) then();
      void stage.offsetWidth;
      root.classList.remove('no-anim');
      root.classList.remove('is-fading');
      setTimeout(function () { switching = false; kiosk_reset(); }, 200);
    }, reduce ? 0 : 180);
  }
  function leaveTo(url) {
    root.classList.add('is-fading');
    setTimeout(function () { location.href = url; }, reduce ? 0 : 190);
  }
  // coming back with the browser's back button restores the page as it was left: make it visible again
  addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('is-fading'); });
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
      if (document.fullscreenElement) { document.exitFullscreen(); if (screen.orientation && screen.orientation.unlock) try { screen.orientation.unlock(); } catch (e) {} }
      else if (document.documentElement.requestFullscreen) {
        var p = document.documentElement.requestFullscreen();
        // on a phone, full screen also holds the screen in landscape where the browser allows it (Android)
        if (p && p.then && isPhone() && screen.orientation && screen.orientation.lock) p.then(function () { return screen.orientation.lock('landscape'); }).catch(function () {});
      }
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
      else if (k === 'Enter' || k === ' ') { var to = oCursor; setOverview(false, function () { go(to, 0); }); }
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
      case 'o': case 'O': setOverview(!overview); break;
      // Esc closes the notes; it never opens the overview (in full screen the browser also uses it to exit)
      case 'Escape': if (blackMode) setBlack(''); else if (notesEl.classList.contains('is-open')) toggleNotes(); else return; break;
      case 'f': case 'F': toggleFull(); break;
      case 'n': case 'N': toggleNotes(); break;
      case 't': case 'T': if (PRESENTER) return; setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]); break;
      case 'p': case 'P': if (PRESENTER) return; openPresenter(); break;
      case 'b': case 'B': case '.': setBlack(blackMode === 'black' ? '' : 'black'); break;
      case 'w': case 'W': case ',': setBlack(blackMode === 'white' ? '' : 'white'); break;
      // presentation clickers send F5 for start: full screen, not a reload
      case 'F5': toggleFull(); break;
      case '?': toggleHelp(); break;
      default: return;
    }
    e.preventDefault();
  });

  var INTERACTIVE = 'a,button,input,select,textarea,label,summary,[role=button],[role=slider],[role=tab],[tabindex],[data-i]';
  stage.addEventListener('click', function (e) {
    if (overview) {
      var s = e.target.closest('.slide'); if (s) { var to = slides.indexOf(s); setOverview(false, function () { go(to, 0); }); }
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
    var p = point(e.touches[0]); tx = p.x; ty = p.y;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (!tOk || overview) return;
    var p = point(e.changedTouches[0]), dx = p.x - tx, dy = p.y - ty;
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
    else if (a === 'display') toggleDisp();
    else if (a === 'home') leaveTo(document.body.dataset.home);
  });
  function toggleDisp(on) {
    on = on == null ? !disp.classList.contains('is-open') : on;
    disp.classList.toggle('is-open', on); $('[data-ui=display]', ui).setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) { paintDisp(); var b = $('[aria-checked=true]', disp); if (b) b.focus(); }
  }
  disp.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]'); if (b) { setMode(b.dataset.mode); toggleDisp(false); return; }
    if (e.target.closest('[data-act=presenter]')) { toggleDisp(false); openPresenter(); }
  });
  // a click outside closes the menu without also moving the slides on
  document.addEventListener('click', function (e) {
    if (!disp.classList.contains('is-open') || disp.contains(e.target) || e.target.closest('[data-ui=display]')) return;
    toggleDisp(false); e.stopPropagation(); e.preventDefault();
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && disp.classList.contains('is-open')) { toggleDisp(false); $('[data-ui=display]', ui).focus(); e.stopPropagation(); e.preventDefault(); }
  }, true);
  helpEl.addEventListener('click', function (e) { if (e.target === helpEl) toggleHelp(false); });

  // the control bar fades out while nobody moves the mouse
  var idleT = 0;
  // the mouse cursor hides with it, so it never sits on the slide on a TV
  function wake() { ui.classList.remove('is-idle'); root.classList.remove('is-still'); clearTimeout(idleT); idleT = setTimeout(function () { if (!ui.matches(':hover') && !ui.contains(document.activeElement) && !disp.classList.contains('is-open')) { ui.classList.add('is-idle'); root.classList.add('is-still'); } }, 2800); }
  addEventListener('mousemove', wake, { passive: true }); addEventListener('touchstart', wake, { passive: true }); addEventListener('keydown', function (e) { if (e.key === 'Tab') wake(); });

  addEventListener('resize', function () { fit(); if (overview) layoutOverview(); });
  // some phones report the new size only after the turn has finished
  addEventListener('orientationchange', function () { setTimeout(function () { fit(); if (overview) layoutOverview(); }, 250); });
  addEventListener('hashchange', function () { var n = parseInt(location.hash.slice(1), 10); if (n && n - 1 !== cur) go(n - 1, 0); });

  /* ---------------------------------------------------------------- kiosk: ?kiosk (or ?kiosk=8 seconds) loops on its own */
  var kiosk = params.has('kiosk') ? (+params.get('kiosk') || 9) * 1000 : 0, kT = 0;
  function kiosk_reset() {
    if (!kiosk) return; clearTimeout(kT);
    if (overview) return;
    var sl = slides[cur], dur = (+sl.dataset.dur || kiosk) / (stepsOf(cur) + 1);
    kT = setTimeout(function () { if (step < stepsOf(cur)) next(); else go(cur < total - 1 ? cur + 1 : 0, 0); }, dur);
  }

  /* ---------------------------------------------------------------- print: every build shown, then back */
  // every build shown and every slide's settle hook run, so each prints in its finished state
  function settleOne(s) { var h = hooks[s.id]; if (h && h.settle) try { h.settle(s); } catch (e) { console.error(e); } }
  function settleAll() { slides.forEach(function (s, i) { paint(s, stepsOf(i)); s.classList.add('is-in'); settleOne(s); }); }
  addEventListener('beforeprint', settleAll);
  addEventListener('afterprint', function () { slides.forEach(function (s, i) { if (i !== cur) { paint(s, 0); s.classList.remove('is-in'); } else paint(s, step); }); });

  /* ---------------------------------------------------------------- public API */
  window.Deck = {
    on: function (id, h) { hooks[id] = h; },
    go: function (i, s) { if (overview) setOverview(false, function () { go(i, s); }); else go(i, s); },
    goId: function (id, s) { var i = slides.findIndex(function (x) { return x.id === id; }); if (i >= 0) Deck.go(i, s); },
    next: next, prev: prev,
    get index() { return cur; }, get step() { return step; }, get scale() { return scale; },
    get rotated() { return rotated; }, get tv() { return tv; }, get display() { return mode; }, presenter: PRESENTER, print: PRINT,
    slides: slides, $: $, $$: $$, lbox: lbox, vbox: vbox, rect: rect, point: point, clamp: clamp, ease: ease, money: money, reduce: reduce
  };

  function start() {
    pvBuild();
    fit();
    Object.keys(hooks).forEach(function (id) { var s = document.getElementById(id); if (s && hooks[id].init) try { hooks[id].init(s); } catch (e) { console.error(e); } });
    var n = parseInt(location.hash.slice(1), 10);
    go(n && n <= total ? n - 1 : 0, 0);
    if (PRINT) settleAll();
    wake();
    if (PRESENTER) share({ t: 'hello' });
    holdScreen();
    setTimeout(saveOffline, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else setTimeout(start, 0);
})();

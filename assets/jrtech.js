/* Moving JR-Tech onto Odoo ERP: slide behaviour. Every demo runs on sample data, labelled on its slide.
   Each slide that animates has a settle hook, so the overview and the PDF show it finished.
   The tick lists (pre-migration checklist, discovery questions, files to send) keep their marks for this browser tab
   (sessionStorage), so moving between slides or reloading during the meeting loses nothing. */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var clamp = Deck.clamp, stage = document.querySelector('.stage');

  // a segmented control: sets aria-pressed and calls fn(value); returns set(value)
  function seg(root, fn) {
    function set(v, quiet) {
      $$('button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      if (!quiet) fn(v);
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    return set;
  }
  // paint an end state with every transition in root switched off (settle hooks: finished at once)
  function snap(root, fn) { root.classList.add('j-nt'); fn(); void root.offsetWidth; root.classList.remove('j-nt'); }
  function money(n) { return 'RM ' + Math.round(n).toLocaleString('en-US'); }
  var store = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  // move to step n of the slide on screen
  function stepTo(n) { Deck.go(Deck.index, n); }

  // jump links anywhere in the deck: data-go="slide id", data-at="build"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.stopPropagation();
    Deck.goId(b.dataset.go, b.dataset.at != null ? +b.dataset.at : 0);
  });

  /* ---------------------------------------------------------------- 2 · the entire solution */
  var JM = {
    mig: ['Migration.', 'SQL Account to Odoo: balances and open items move, history stays archived, and every total is reconciled before you trust it.', 'worries'],
    p1: ['Phase 1 · commercial foundation.', 'CRM, Sales, Accounting with SST + MyInvois, and the Website: the front office, legally compliant.', 'phase1'],
    p2: ['Phase 2 · operations.', 'Inventory, Purchase, Field Service, Maintenance and Rental: the physical, real-world layer.', 'phase2'],
    p3: ['Phase 3 · intelligence.', 'Analytics and AI Agents, built last, on real operating data.', 'phase3'],
    go: ['Go-live.', 'Cut-over exactly at the close. From day 1 every invoice, bill and payment is in Odoo, and the first MyInvois submissions go from Odoo.', 'runway'],
    sup: ['Support.', 'A four-week confidence window, a trust sign-off at the end of week 4, then ongoing support as you grow.', 'aftergolive'],
    ai: ['AI Blueprint generator.', 'From your brief to a working Odoo blueprint: it speeds up the build. The AI Agents themselves arrive in phase 3.', 'phase3']
  };
  Deck.on('solution', {
    init: function (s) {
      var jm = $('.jm', s), svg = $('.jm-svg', s), say = $('.jm-say p', s), go = $('.jm-goto', s), say0 = say.innerHTML;
      function chev(x, y, dir) { return dir === 'r' ? 'M' + (x - 7) + ',' + (y - 7) + ' L' + x + ',' + y + ' L' + (x - 7) + ',' + (y + 7) : 'M' + (x - 7) + ',' + (y - 7) + ' L' + x + ',' + y + ' L' + (x + 7) + ',' + (y - 7); }
      s._build = function () {
        PX.clear(svg); svg.setAttribute('viewBox', '0 0 ' + jm.offsetWidth + ' ' + jm.offsetHeight);
        var st = $$('.jm-st', s).map(function (el) { return Deck.lbox(el, jm); }), ai = Deck.lbox($('.jm-ai', s), jm);
        for (var i = 0; i < st.length - 1; i++) {
          var x0 = st[i].r + 5, x1 = st[i + 1].x - 5, y = st[i].y + 86;
          PX.svg('path', { d: 'M' + x0 + ',' + y + ' H' + x1 + ' ' + chev(x1, y, 'r') }, svg);
        }
        [1, 2, 3].forEach(function (k) {
          var x = st[k].cx, y1 = st[k].y - 6;
          PX.svg('path', { d: 'M' + x + ',' + (ai.b + 4) + ' V' + y1, 'class': 'jm-ai-l' }, svg);
          PX.svg('path', { d: 'M' + (x - 7) + ',' + (y1 - 7) + ' L' + x + ',' + y1 + ' L' + (x + 7) + ',' + (y1 - 7), 'style': 'stroke:#B9A6D6' }, svg);
        });
      };
      s._pick = function (k) {
        $$('.jm-st,.jm-ai', s).forEach(function (n) { n.classList.toggle('is-on', n.dataset.k === k); });
        if (k && JM[k]) {
          say.innerHTML = '<b></b> <span></span>'; say.firstChild.textContent = JM[k][0]; say.lastChild.textContent = JM[k][1];
          go.dataset.go = JM[k][2]; go.hidden = false;
        } else { say.innerHTML = say0; go.hidden = true; }
      };
      // a click picks a stage; a second click on it goes back to the summary
      jm.addEventListener('click', function (e) {
        var b = e.target.closest('[data-k]'); if (!b) return;
        s._on = b.dataset.k === s._on ? null : b.dataset.k; s._pick(s._on);
      });
      s._build();
    },
    enter: function (ctx, s) { s._on = null; s._pick(null); s._build(); },
    settle: function (s) { s._on = null; s._pick(null); s._build(); }
  });

  /* ---------------------------------------------------------------- 4 · one record, five apps */
  function paintBig(s, n) {
    $$('.jb-st li', s).forEach(function (li) { var k = +li.dataset.n; li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n); });
    $$('.jb-log li', s).forEach(function (li) { var k = +li.dataset.n; li.classList.toggle('is-on', k <= n); li.classList.toggle('is-new', k === n); });
  }
  Deck.on('bigidea', {
    init: function (s) { $$('.jb-st button', s).forEach(function (b, i) { b.addEventListener('click', function () { stepTo(i + 1); }); }); },
    step: function (n, ctx, s) { paintBig(s, n); },
    settle: function (s) { snap(s, function () { paintBig(s, 6); }); }
  });

  /* ---------------------------------------------------------------- 5 · roadmap: filter by phase */
  var JR = { all: [11, 'in all three phases'], '1': [4, 'in phase 1'], '2': [5, 'in phase 2'], '3': [2, 'in phase 3'] };
  Deck.on('roadmap', {
    init: function (s) {
      var jr = $('.jr', s), n = $('[data-jr=n]', s), lbl = $('[data-jr=lbl]', s);
      s._set = seg($('[data-jr=seg]', s), function (v) {
        if (v === 'all') jr.removeAttribute('data-on'); else jr.dataset.on = v;
        n.textContent = JR[v][0]; lbl.textContent = JR[v][1];
      });
    },
    enter: function (ctx, s) {
      s._set('all'); var n = $('[data-jr=n]', s); n.textContent = '0';
      ctx.after(520, function () { ctx.count(n, 11, { dur: 1100 }); });
    },
    settle: function (s) { s._set('all'); }
  });

  /* ---------------------------------------------------------------- 6-7 · phase cards: each vignette resets, plays, or shows its end */
  var WEB_Q = '2 combi ovens, delivery to Ipoh';
  var V = {
    crm: {
      reset: function (v) { var o = $('.jv-own', v); o.classList.remove('is-left', 'is-new'); $('.jv-av', v).textContent = 'AH'; $('em', o).textContent = 'Ahmad'; $('.jv-kept', v).classList.remove('is-on'); },
      play: function (v, ctx) {
        var o = $('.jv-own', v);
        ctx.after(350, function () { o.classList.add('is-left'); $('em', o).textContent = 'Ahmad · left'; });
        ctx.after(1250, function () { V.crm.final(v, true); });
        ctx.after(1700, function () { $('.jv-kept', v).classList.add('is-on'); });
      },
      final: function (v, half) {
        var o = $('.jv-own', v); o.classList.remove('is-left'); o.classList.add('is-new');
        $('.jv-av', v).textContent = 'ML'; $('em', o).textContent = 'Mei Ling · reassigned';
        if (!half) $('.jv-kept', v).classList.add('is-on');
      }
    },
    sale: {
      reset: function (v) { v.style.setProperty('--p', 0); $('[data-jv=lines]', v).textContent = '0'; $('[data-jv=sum]', v).textContent = 'RM 0'; },
      play: function (v, ctx) {
        var L = $('[data-jv=lines]', v), S = $('[data-jv=sum]', v);
        ctx.after(250, function () { ctx.tween(1500, function (p) { v.style.setProperty('--p', p); L.textContent = Math.round(30 * p); S.textContent = money(212400 * p); }, 'out'); });
      },
      final: function (v) { v.style.setProperty('--p', 1); $('[data-jv=lines]', v).textContent = '30'; $('[data-jv=sum]', v).textContent = 'RM 212,400'; }
    },
    acc: {
      reset: function (v) { v.classList.remove('is-on'); },
      play: function (v, ctx) { ctx.after(150, function () { v.classList.add('is-on'); }); },
      final: function (v) { v.classList.add('is-on'); }
    },
    einv: {
      reset: function (v) { v.classList.remove('is-go', 'is-hit', 'is-on'); },
      play: function (v, ctx) {
        ctx.after(250, function () { v.classList.add('is-go'); });
        ctx.after(1150, function () { v.classList.add('is-hit'); });
        ctx.after(1500, function () { v.classList.add('is-on'); });
      },
      final: function (v) { v.classList.add('is-go', 'is-hit', 'is-on'); }
    },
    web: {
      reset: function (v) { $('[data-jv=q]', v).textContent = ''; v.classList.remove('is-on'); },
      play: function (v, ctx) {
        var q = $('[data-jv=q]', v);
        ctx.after(200, function () { ctx.type(q, WEB_Q, 34).then(function () { ctx.after(250, function () { v.classList.add('is-on'); }); }); });
      },
      final: function (v) { $('[data-jv=q]', v).textContent = WEB_Q; v.classList.add('is-on'); }
    },
    inv: {
      reset: function (v) { v.classList.remove('is-res', 'is-on'); $('[data-jv=r]', v).textContent = 'In stock'; },
      play: function (v, ctx) {
        ctx.after(350, function () { v.classList.add('is-res'); $('[data-jv=r]', v).textContent = 'Reserved · B-104'; });
        ctx.after(1250, function () { v.classList.add('is-on'); });
      },
      final: function (v) { v.classList.add('is-res', 'is-on'); $('[data-jv=r]', v).textContent = 'Reserved · B-104'; }
    },
    pur: {
      reset: function (v) { v.classList.remove('is-bad', 'is-on'); $('[data-jv=bill]', v).textContent = '10'; },
      play: function (v, ctx) {
        ctx.after(300, function () { v.classList.add('is-bad'); $('[data-jv=m]', v).textContent = 'Billed 10, only 8 received'; });
        ctx.after(1600, function () { V.pur.final(v); });
      },
      final: function (v) { v.classList.remove('is-bad'); v.classList.add('is-on'); $('[data-jv=bill]', v).textContent = '8'; $('[data-jv=m]', v).textContent = 'Bill held to the 8 received'; }
    },
    fsm: {
      reset: function (v) { $$('[data-r]', v).forEach(function (p) { p.classList.remove('is-on'); }); $('[data-jv=tot]', v).textContent = 'RM 0'; },
      play: function (v, ctx) {
        var T = $('[data-jv=tot]', v), vals = [375, 160, 245], sum = 0;
        $$('[data-r]', v).forEach(function (p, i) {
          ctx.after(300 + i * 480, function () { p.classList.add('is-on'); var from = sum; sum += vals[i]; ctx.count(T, sum, { from: from, dur: 420, pre: 'RM ' }); });
        });
      },
      final: function (v) { $$('[data-r]', v).forEach(function (p) { p.classList.add('is-on'); }); $('[data-jv=tot]', v).textContent = 'RM 780'; }
    },
    mnt: {
      reset: function (v) { $$('.jv-cal i', v).forEach(function (c) { c.classList.remove('is-on'); }); v.classList.remove('is-on'); },
      play: function (v, ctx) {
        $$('.jv-cal i.p, .jv-cal i.c', v).forEach(function (c, i) { ctx.after(200 + i * 260, function () { c.classList.add('is-on'); }); });
        ctx.after(1650, function () { v.classList.add('is-on'); });
      },
      final: function (v) { $$('.jv-cal i.p, .jv-cal i.c', v).forEach(function (c) { c.classList.add('is-on'); }); v.classList.add('is-on'); }
    },
    ren: {
      reset: function (v) { v.classList.remove('is-try', 'is-on', 'is-done'); },
      play: function (v, ctx) {
        ctx.after(300, function () { v.classList.add('is-try'); });
        ctx.after(950, function () { v.classList.add('is-on'); });
        ctx.after(1600, function () { v.classList.add('is-done'); });
      },
      final: function (v) { v.classList.add('is-try', 'is-on', 'is-done'); }
    }
  };
  function vig(c) { return { v: $('.jv', c), f: V[c.dataset.v] }; }
  function playCard(c, ctx) { var x = vig(c); snap(x.v, function () { x.f.reset(x.v); }); x.f.play(x.v, ctx); }
  function paintPhase(s, n, ctx) {
    $$('.ja-c', s).forEach(function (c) {
      var k = +c.dataset.n, x = vig(c);
      c.classList.toggle('is-on', k === n);
      if (k < n || (k === n && !ctx)) snap(x.v, function () { x.f.final(x.v); });
      else if (k > n) snap(x.v, function () { x.f.reset(x.v); });
      else playCard(c, ctx);
    });
  }
  ['phase1', 'phase2'].forEach(function (id) {
    Deck.on(id, {
      init: function (s) {
        $$('.ja-c', s).forEach(function (c) {
          c.addEventListener('click', function () { var n = +c.dataset.n; if (Deck.step === n && s._ctx && s._ctx.alive) playCard(c, s._ctx); else stepTo(n); });
        });
      },
      enter: function (ctx, s) { s._ctx = ctx; },
      step: function (n, ctx, s, first) { s._ctx = ctx; paintPhase(s, n, first ? null : ctx); },
      settle: function (s) { snap(s, function () { $$('.ja-c', s).forEach(function (c) { var x = vig(c); c.classList.remove('is-on'); x.f.final(x.v); }); }); }
    });
  });

  /* ---------------------------------------------------------------- 8 · phase 3: the margin drop, then an agent that asks first */
  var MON = ['O', 'N', 'D', 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S'], MAR = [31.6, 32.2, 31.4, 31.9, 32.5, 31.8, 32.6, 31.5, 32.1, 31.9, 31.7, 27.6];
  function chart3(s) {
    var svg = $('.ji-svg', s); PX.clear(svg); svg.setAttribute('viewBox', '0 0 320 200');
    var x = PX.lin(0, 11, 40, 304), y = PX.lin(26, 34, 172, 16);
    PX.gridY(svg, 34, 312, y, [26, 30, 34], function (v) { return v + '%'; });
    var pts = MAR.map(function (v, i) { return [x(i), y(v)]; });
    PX.svg('path', { d: PX.area(pts, 172), 'class': 'ji-area' }, svg);
    PX.svg('path', { d: PX.line(pts), 'class': 'ji-line' }, svg);
    var ax = PX.svg('g', { 'class': 'cx-axis' }, svg);
    MON.forEach(function (m, i) { var t = PX.svg('text', { x: x(i), y: 192, 'text-anchor': 'middle' }, ax); t.textContent = m; });
    pts.slice(0, 11).forEach(function (p) { PX.svg('circle', { cx: p[0], cy: p[1], r: 3, 'class': 'ji-pt' }, svg); });
    var d = pts[11];
    PX.svg('circle', { cx: d[0], cy: d[1], r: 9, 'class': 'ji-ring' }, svg);
    PX.svg('circle', { cx: d[0], cy: d[1], r: 5, 'class': 'ji-drop' }, svg);
    var t = PX.svg('text', { x: d[0] - 10, y: d[1] - 14, 'text-anchor': 'end', 'class': 'ji-dl' }, svg); t.textContent = '−4.1 pts';
    var hit = PX.svg('rect', { x: d[0] - 26, y: 8, width: 40, height: 172, rx: 8, 'class': 'ji-hit', tabindex: 0, role: 'button', 'aria-label': 'Open the September margin drop' }, svg);
    hit.addEventListener('click', function (e) { e.stopPropagation(); if (Deck.step < 1) stepTo(1); });
    hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (Deck.step < 1) stepTo(1); } });
  }
  function paint3(s, n, ctx) {
    var dash = $('.ji-dash', s), chat = $('.ji-chat', s), jobs = $$('.ji-jobs li', s);
    $$('.ji-c', s).forEach(function (c) { c.classList.toggle('is-on', +c.dataset.n === n); });
    dash.classList.toggle('is-open', n >= 1);
    if (n >= 1 && ctx && n === 1) jobs.forEach(function (li, i) { li.classList.remove('is-on'); ctx.after(250 + i * 140, function () { li.classList.add('is-on'); }); });
    else jobs.forEach(function (li) { li.classList.toggle('is-on', n >= 1); });
    if (n >= 2 && ctx && n === 2) {
      chat.classList.remove('is-a', 'is-p');
      ctx.after(450, function () { chat.classList.add('is-a'); });
      ctx.after(1350, function () { chat.classList.add('is-p'); });
    } else { chat.classList.toggle('is-a', n >= 2); chat.classList.toggle('is-p', n >= 2); }
  }
  Deck.on('phase3', {
    init: function (s) {
      var chat = $('.ji-chat', s), st = $('[data-ji=st]', s);
      s._fresh = function () { chat.classList.remove('is-done'); st.textContent = 'Proposed, not posted'; };
      $('.ji-ok', s).addEventListener('click', function () { chat.classList.add('is-done'); st.textContent = 'Posted · confirmed by you'; });
      $('.ji-no', s).addEventListener('click', function () { chat.classList.add('is-done'); st.textContent = 'Discarded · nothing posted'; });
      chart3(s);
    },
    enter: function (ctx, s) { chart3(s); },
    step: function (n, ctx, s, first) { if (first && n === 0) s._fresh(); paint3(s, n, first ? null : ctx); },
    settle: function (s) { snap(s, function () { paint3(s, 2, null); }); }
  });

  /* ---------------------------------------------------------------- 10 · the honest worries */
  function paintW(s, n) { $$('.jw-r', s).forEach(function (r) { r.classList.toggle('is-on', +r.dataset.n <= n); }); }
  Deck.on('worries', {
    init: function (s) { $$('.jw-r', s).forEach(function (r) { $('.jw-w', r).addEventListener('click', function () { var n = +r.dataset.n; if (n > Deck.step) stepTo(n); }); }); },
    step: function (n, ctx, s) { paintW(s, n); },
    settle: function (s) { snap(s, function () { paintW(s, 4); }); }
  });

  /* ---------------------------------------------------------------- 11 · the cut-off you can drag */
  var MONTHS = ['August', 'September', 'October', 'November', 'December', 'January'];
  Deck.on('cutoff', {
    init: function (s) {
      var jt = $('.jt', s), tr = $('.jt-track', s), cut = $('.jt-cut', s), st = $('[data-jt=st]', s), drag = false;
      s._c = 3;
      s._set = function (c) {
        c = clamp(c, .2, 5.8);
        var r = Math.round(c), clean = Math.abs(c - r) < .06 && r >= 1 && r <= 5;
        if (clean) c = r;
        s._c = c;
        tr.style.setProperty('--c', c.toFixed(3));
        var m = Math.floor(c); tr.style.setProperty('--m', m);
        jt.classList.toggle('is-bad', !clean);
        st.innerHTML = clean ? '<b>Clean:</b> SQL Account closes ' + MONTHS[r - 1] + ', Odoo opens ' + MONTHS[r] + '.'
          : '<b>Split:</b> ' + MONTHS[m] + ' would sit in two ledgers.';
        cut.setAttribute('aria-valuenow', c.toFixed(2));
        cut.setAttribute('aria-valuetext', clean ? 'End of ' + MONTHS[r - 1] : 'Middle of ' + MONTHS[m]);
      };
      s._snapTo = function (ctx) {
        var from = s._c, to = clamp(Math.round(from), 1, 5);
        if (ctx && ctx.alive) ctx.tween(500, function (p) { s._set(from + (to - from) * p); }, 'out'); else s._set(to);
      };
      function at(e) { var p = PX.at(e, tr); return (p.x - 140) / (tr.offsetWidth - 140) * 6; }
      tr.addEventListener('pointerdown', function (e) {
        drag = true; s._demo = false;
        try { tr.setPointerCapture(e.pointerId); } catch (x) {}
        s._set(at(e)); e.preventDefault();
      });
      tr.addEventListener('pointermove', function (e) { if (drag) s._set(at(e)); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { tr.addEventListener(t, function () { drag = false; }); });
      cut.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault(); s._demo = false; s._set(s._c + (e.key === 'ArrowRight' ? .25 : -.25));
      });
      $('[data-jt=snap]', s).addEventListener('click', function () { s._demo = false; s._snapTo(s._ctx); });
      s._set(3);
    },
    // once on arrival: the cut slides into the middle of November, turns red, then snaps back to the close
    enter: function (ctx, s) {
      s._ctx = ctx; s._set(3); s._demo = true;
      ctx.after(1500, function () {
        if (!s._demo) return;
        ctx.tween(900, function (p) { if (s._demo) s._set(3 + .45 * p); }, 'io').then(function () {
          ctx.after(1600, function () { if (s._demo) s._snapTo(ctx); });
        });
      });
    },
    settle: function (s) { s._demo = false; s._set(3); }
  });

  /* ---------------------------------------------------------------- 12 · what moves: each line travels the way it really moves */
  Deck.on('scope', {
    init: function (s) {
      var rows = $$('.jg-r', s);
      function tok(r) { return $('.jg-tk i', r); }
      function far(r) { var tk = $('.jg-tk', r); return (tk.offsetWidth - tok(r).offsetWidth) + 'px'; }
      s._reset = function () { snap(s, function () { rows.forEach(function (r) { r.classList.remove('is-moved', 'is-out'); tok(r).style.setProperty('--tx', '0px'); }); }); };
      s._move = function (r, ctx) {
        if (r.classList.contains('jg-r--stay')) { r.classList.add('is-moved'); return; }
        if (r.classList.contains('jg-r--cfg') && ctx) {
          // tax codes are not carried across: they fade out here and are set up again on the Odoo side
          r.classList.add('is-out');
          ctx.after(420, function () { snap(r, function () { tok(r).style.setProperty('--tx', far(r)); r.classList.add('is-moved'); }); r.classList.remove('is-out'); });
          return;
        }
        tok(r).style.setProperty('--tx', far(r)); r.classList.add('is-moved');
      };
      s._final = function () { snap(s, function () { rows.forEach(function (r) { r.classList.remove('is-out'); s._move(r, null); }); }); };
      s._run = function (ctx) { s._reset(); rows.forEach(function (r, k) { ctx.after(500 + k * 170, function () { s._move(r, ctx); }); }); };
      $('.jg-run', s).addEventListener('click', function () { if (s._ctx && s._ctx.alive) s._run(s._ctx); });
    },
    enter: function (ctx, s) { s._ctx = ctx; s._run(ctx); },
    settle: function (s) { s._final(); }
  });

  /* ---------------------------------------------------------------- 13 · seven steps */
  // when each step happens: only the final extract, the import and the reconcile are tied to the close
  var JP_W = ['', 'Alongside normal operations', 'Alongside normal operations', 'Mock run first, final extract at the close', 'Alongside normal operations', 'Alongside normal operations', 'At the cut-off', 'At the cut-off'];
  function paintP(s, n) {
    var steps = $$('.jp-s', s), vis = $('.jp-vis', s), w = $('[data-jp=w]', s);
    steps.forEach(function (el) { var k = +el.dataset.n; el.classList.toggle('is-done', k < n); el.classList.toggle('is-cur', k === n); });
    vis.classList.toggle('is-cap', n >= 1);
    if (n >= 1) { $('[data-jp=t]', s).textContent = 'Step ' + n + ' · ' + $('b', steps[n - 1]).textContent; w.textContent = JP_W[n]; w.classList.toggle('is-cut', n === 3 || n >= 6); }
    $('.jp-rail', s).style.setProperty('--p', (n <= 1 ? 0 : (n - 1) / 6 * 100) + '%');
    $$('.jp-v', s).forEach(function (v) { v.classList.toggle('is-on', +v.dataset.n === n); });
  }
  Deck.on('process', {
    init: function (s) { $$('.jp-dot', s).forEach(function (b, i) { b.addEventListener('click', function () { stepTo(i + 1); }); }); },
    step: function (n, ctx, s) { paintP(s, n); },
    settle: function (s) { snap(s, function () { paintP(s, 7); }); }
  });

  /* ---------------------------------------------------------------- 14 · the runway */
  function paintR(s, n) {
    var cols = $$('.jy-c', s), now = $('.jy-now', s), jy = $('.jy', s);
    cols.forEach(function (c) { c.classList.toggle('is-on', +c.dataset.n === n); });
    if (n >= 1) { now.style.setProperty('--x', Deck.lbox(cols[n - 1], jy).cx + 'px'); $('b', now).textContent = $('b', cols[n - 1]).textContent; }
    now.classList.toggle('is-on', n >= 1);
  }
  Deck.on('runway', {
    init: function (s) { $$('.jy-c', s).forEach(function (c) { c.addEventListener('click', function () { stepTo(+c.dataset.n); }); }); },
    step: function (n, ctx, s) { paintR(s, n); },
    settle: function (s) { snap(s, function () { paintR(s, 6); }); }
  });

  /* ---------------------------------------------------------------- 15 · the go / no-go gate */
  Deck.on('risks', {
    init: function (s) {
      var g = $('.jk-gate', s), bs = $$('.jk-chk button', s);
      s._paint = function () {
        var k = bs.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).length;
        g.classList.toggle('is-go', k === 5);
        $('[data-jk=st]', s).textContent = k === 5 ? 'Go' : 'No-go';
        $('[data-jk=n]', s).textContent = k === 5 ? 'All five passed: cut over' : k + ' of 5 checks passed';
      };
      s._all = function (on) { bs.forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); s._paint(); };
      s._run = function (ctx) { s._all(false); bs.forEach(function (b, i) { ctx.after(350 + i * 420, function () { b.setAttribute('aria-pressed', 'true'); s._paint(); }); }); };
      bs.forEach(function (b) { b.addEventListener('click', function () { s._auto = false; b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); s._paint(); }); });
      $('.jk-run', s).addEventListener('click', function () { s._auto = false; if (s._ctx && s._ctx.alive) s._run(s._ctx); });
    },
    enter: function (ctx, s) { s._ctx = ctx; s._auto = true; s._all(false); ctx.after(1400, function () { if (s._auto) s._run(ctx); }); },
    settle: function (s) { s._all(true); }
  });

  /* ---------------------------------------------------------------- 16 · the invoicing video: chapters, zoom, pause on leave, presenter view in step */
  // Zoom is the deck's own, never the browser's video full screen: leaving that also drops the deck out of full screen.
  // The frame grows from its place on the slide to the whole stage (and the screen, if the deck isn't full screen yet),
  // keeps playing, and shrinks back into the slide on Esc, Z, a double-click, "Back to the slides" or the end of the video.
  Deck.on('video-ar', {
    init: function (s) {
      var v = $('.jf-v', s), box = $('.jf-player', s), frame = $('.jf-frame', s), chs = $$('.jf-ch button', s), deck = document.querySelector('.deck'), bc = null;
      var zoomed = false, fsByUs = false, locked = false, idleT = 0, endT = 0;
      // the presenter window stays silent: the sound comes from the screen the room watches
      if (Deck.presenter) v.muted = true;
      function at(t, then) {
        if (v.readyState >= 1 && !v.error) { try { v.currentTime = t; } catch (e) {} if (then) then(); return; }
        v.addEventListener('loadedmetadata', function once() { v.removeEventListener('loadedmetadata', once); try { v.currentTime = t; } catch (e) {} if (then) then(); });
        v.load();
      }
      function play() { frame.classList.add('is-started'); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      s._start = function (t) { if (t == null) play(); else at(t, play); };
      // a dropped connection mid-video leaves a media error: reload and carry on from the same point
      var lastT = 0, wasPlaying = false, healed = 0;
      v.addEventListener('timeupdate', function () { if (!v.error) { lastT = v.currentTime; wasPlaying = !v.paused; } });
      v.addEventListener('play', function () { wasPlaying = true; });
      v.addEventListener('error', function () {
        if (Date.now() - healed < 4000) return;
        healed = Date.now(); var t = lastT, go = wasPlaying || frame.classList.contains('is-started');
        at(t, go ? play : null);
      });
      function mark() {
        var t = v.currentTime, cur = -1;
        chs.forEach(function (b, i) { if (t >= +b.dataset.t - .3) cur = i; });
        chs.forEach(function (b, i) { b.classList.toggle('is-on', frame.classList.contains('is-started') && i === cur); });
      }
      $('.jf-play', s).addEventListener('click', function () { s._start(null); });
      chs.forEach(function (b) { b.addEventListener('click', function () { s._start(+b.dataset.t); }); });
      v.addEventListener('timeupdate', mark); v.addEventListener('seeked', mark);

      // ---- the control bar: play / pause, time, a seek track with chapter marks, sound, zoom
      var track = $('.jf-track', s), nowEl = $('[data-jf=now]', s), durEl = $('[data-jf=dur]', s), DUR = 201.2, clickT = 0, dragging = false;
      function mmss(x) { x = Math.max(0, Math.floor(x)); return Math.floor(x / 60) + ':' + ('0' + x % 60).slice(-2); }
      function dur() { return isFinite(v.duration) && v.duration > 0 ? v.duration : DUR; }
      function paintBar() {
        var p = clamp(v.currentTime / dur(), 0, 1);
        track.style.setProperty('--p', (p * 100).toFixed(2) + '%'); nowEl.textContent = mmss(v.currentTime); durEl.textContent = mmss(dur());
        track.setAttribute('aria-valuenow', Math.round(v.currentTime)); track.setAttribute('aria-valuetext', mmss(v.currentTime));
      }
      chs.forEach(function (b) { var t = +b.dataset.t; if (t > 0) { var i = document.createElement('i'); i.style.left = (t / DUR * 100).toFixed(2) + '%'; $('.jf-ticks', s).appendChild(i); } });
      ['timeupdate', 'seeked', 'loadedmetadata', 'durationchange'].forEach(function (ev) { v.addEventListener(ev, paintBar); });
      function playState() { frame.classList.toggle('is-playing', !v.paused); frame.classList.toggle('is-muted', v.muted); }
      ['play', 'pause', 'volumechange', 'ended'].forEach(function (ev) { v.addEventListener(ev, playState); });
      playState();
      function toggle() { if (!frame.classList.contains('is-started') || v.paused) play(); else v.pause(); }
      function seekAt(e) { var a = PX.at(e, track); try { v.currentTime = clamp(a.x / track.offsetWidth, 0, 1) * dur(); } catch (x) {} paintBar(); }
      track.addEventListener('pointerdown', function (e) { dragging = true; track.classList.add('is-drag'); try { track.setPointerCapture(e.pointerId); } catch (x) {} seekAt(e); e.preventDefault(); e.stopPropagation(); });
      track.addEventListener('pointermove', function (e) { if (dragging) seekAt(e); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { track.addEventListener(ev, function () { dragging = false; track.classList.remove('is-drag'); }); });
      $('.jf-pp', s).addEventListener('click', function () { toggle(); });
      $('.jf-mute', s).addEventListener('click', function () { v.muted = !v.muted; });
      $('.jf-zb', s).addEventListener('click', function (e) { e.stopPropagation(); s._zoom(!zoomed, { user: true }); });
      // a mouse click leaves no focus behind, so Space and the arrows keep driving the slides
      $$('.jf-frame button', s).concat([v]).forEach(function (b) { b.addEventListener('pointerup', function (e) { if (e.pointerType === 'mouse') setTimeout(function () { b.blur(); }, 0); }); });
      // one click plays or pauses, a double-click zooms: the single click waits a moment so a double-click doesn't flicker
      v.addEventListener('click', function (e) { e.preventDefault(); clearTimeout(clickT); clickT = setTimeout(toggle, 230); });
      ['mousemove', 'pointerdown'].forEach(function (ev) { frame.addEventListener(ev, function () { wakeBar(); }); });

      // ---- zoom
      function home() { var a = Deck.lbox(box, s); return { x: a.x, y: a.y, k: a.w / 1600, ky: a.h / 900 }; }
      function lockEsc() { if (locked || !document.fullscreenElement || !navigator.keyboard || !navigator.keyboard.lock) return; navigator.keyboard.lock(['Escape']).then(function () { locked = true; }, function () {}); }
      function unlockEsc() { if (locked && navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock(); locked = false; }
      function wakeBar() { frame.classList.remove('is-idle'); clearTimeout(idleT); idleT = setTimeout(function () { if (!v.paused && !dragging) frame.classList.add('is-idle'); }, 2600); }
      function quiet() { return Deck.reduce || Deck.tv || Deck.print; }
      // on: true / false. o.user: a click or key (may take the screen), o.instant: no animation, o.remote: from the other window
      s._zoom = function (on, o) {
        o = o || {};
        if (on === zoomed) return;
        zoomed = on; clearTimeout(endT);
        deck.classList.toggle('is-vzoom', on);
        var h = home(), from = 'translate(' + h.x + 'px,' + h.y + 'px) scale(' + h.k + ',' + h.ky + ')', r = (18 / h.k).toFixed(1) + 'px';
        if (on) {
          frame.classList.remove('is-anim'); frame.classList.add('is-zoom');
          if (!o.instant && !quiet()) {
            frame.style.transform = from; frame.style.borderRadius = r; void frame.offsetWidth;
            frame.classList.add('is-anim'); frame.style.transform = ''; frame.style.borderRadius = '';
          }
          wakeBar();
          if (o.user && !Deck.presenter && !document.fullscreenElement && document.documentElement.requestFullscreen) {
            var p = document.documentElement.requestFullscreen();
            fsByUs = true; if (p && p.then) p.then(lockEsc, function () { fsByUs = false; });
          } else lockEsc();
          if (!frame.classList.contains('is-started') && o.user) play();
          var zl = $('.jf-zl', s); if (zl) zl.textContent = 'Back';
        } else {
          unlockEsc();
          var zl2 = $('.jf-zl', s); if (zl2) zl2.textContent = 'Zoom';
          var done = function () { frame.classList.remove('is-zoom', 'is-anim', 'is-idle'); frame.style.transform = ''; frame.style.borderRadius = ''; };
          if (o.instant || quiet() || !frame.classList.contains('is-zoom')) done();
          else {
            frame.classList.add('is-anim'); frame.style.transform = from; frame.style.borderRadius = r;
            var end = function (e) { if (e && e.propertyName !== 'transform') return; frame.removeEventListener('transitionend', end); if (!zoomed) done(); };
            frame.addEventListener('transitionend', end); endT = setTimeout(end, 650);
          }
          if (fsByUs && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
          fsByUs = false;
          // hand the keys back to the slides (a focused button would keep Space and Enter)
          if (document.activeElement && frame.contains(document.activeElement)) document.activeElement.blur();
        }
        if (bc && !o.remote) bc.postMessage({ a: 'zoom', on: on, t: v.currentTime });
      };
      $('.jf-zoom', s).addEventListener('click', function (e) { e.stopPropagation(); s._zoom(true, { user: true }); });
      $('.jf-back', s).addEventListener('click', function (e) { e.stopPropagation(); s._zoom(false); });
      v.addEventListener('dblclick', function (e) { e.preventDefault(); clearTimeout(clickT); s._zoom(!zoomed, { user: true }); });
      v.addEventListener('ended', function () { s._zoom(false); });
      v.addEventListener('pause', function () { wakeBar(); });
      v.addEventListener('play', function () { wakeBar(); });
      // the browser left full screen (its own Esc, or F): the zoom comes back with it
      document.addEventListener('fullscreenchange', function () { if (zoomed && !document.fullscreenElement) { fsByUs = false; locked = false; s._zoom(false); } });
      // keys: Z zooms on this slide; while zoomed, Esc and Z come back, Space plays or pauses, the arrows skip 5 s,
      // and anything that moves the deck (PageDown from a clicker, O, Home...) comes back first, then moves it
      document.addEventListener('keydown', function (e) {
        if (Deck.slides[Deck.index] !== s || e.metaKey || e.ctrlKey || e.altKey || deck.classList.contains('is-overview')) return;
        var k = e.key, tg = e.target;
        if (tg && tg.closest && tg.closest('input,textarea,select')) return;
        if (!zoomed) { if (k === 'z' || k === 'Z') { e.preventDefault(); e.stopPropagation(); s._zoom(true, { user: true }); } return; }
        var mine = true;
        if (k === 'Escape' || k === 'z' || k === 'Z') s._zoom(false);
        else if (k === ' ' || k === 'k' || k === 'K' || k === 'Enter') { toggle(); wakeBar(); }
        else if (k === 'm' || k === 'M') { v.muted = !v.muted; wakeBar(); }
        else if (k === 'ArrowLeft' || k === 'ArrowRight') { try { v.currentTime = clamp(v.currentTime + (k === 'ArrowRight' ? 5 : -5), 0, v.duration || 1e4); } catch (x) {} wakeBar(); }
        else if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); return; }
        else { mine = false; if (!/^(b|B|w|W|\.|,|n|N|t|T|f|F|Shift|Tab)$/.test(k)) s._zoom(false, { instant: true }); }
        if (mine) { e.preventDefault(); e.stopPropagation(); }
      }, true);

      // presenter view (P) opens a second window: play, pause, seek and zoom in either one and the other follows
      try { bc = new BroadcastChannel('jrtech-odoo-erp-video'); } catch (e) {}
      if (bc) {
        var send = function (a) { bc.postMessage({ a: a, t: v.currentTime }); };
        v.addEventListener('play', function () { send('play'); });
        v.addEventListener('pause', function () { send('pause'); });
        v.addEventListener('seeked', function () { send('seek'); });
        bc.onmessage = function (e) {
          var m = e.data || {}, far = Math.abs(v.currentTime - m.t) > .6;
          if (m.a === 'zoom') { if (Deck.slides[Deck.index] === s) s._zoom(!!m.on, { remote: true }); }
          else if (m.a === 'play' && (v.paused || far)) { if (far) at(m.t, play); else play(); }
          else if (m.a === 'pause' && !v.paused) { v.pause(); if (far) at(m.t); }
          else if (m.a === 'seek' && far) at(m.t);
        };
      }
    },
    leave: function (s) { s._zoom(false, { instant: true }); var v = $('.jf-v', s); if (!v.paused) v.pause(); },
    settle: function (s) { s._zoom(false, { instant: true, remote: true }); }
  });

  /* ---------------------------------------------------------------- tick lists kept for the meeting: checklist, questions, files */
  var K = { needs: 'jrtech-odoo-erp:needs', q: 'jrtech-odoo-erp:q', files: 'jrtech-odoo-erp:files' };
  var NEEDS = store.get(K.needs) || [], Q = store.get(K.q) || {}, FILES = store.get(K.files) || [];
  function tickList(btns, arr, key, after) {
    btns.forEach(function (b, i) {
      b.setAttribute('aria-pressed', arr[i] ? 'true' : 'false');
      b.addEventListener('click', function () { arr[i] = !arr[i]; b.setAttribute('aria-pressed', arr[i] ? 'true' : 'false'); store.set(key, arr); after(); });
    });
  }
  function paintNeeds() {
    var s = document.getElementById('needs'); if (!s) return;
    var k = NEEDS.filter(Boolean).length;
    $$('.jn-list button', s).forEach(function (b, i) { b.setAttribute('aria-pressed', NEEDS[i] ? 'true' : 'false'); });
    $('.jn-fg', s).style.strokeDashoffset = 100 - k / 12 * 100;
    $('[data-jn=n]', s).textContent = k;
    $('[data-jn=say]', s).textContent = k === 12 ? 'Everything on JR-Tech\'s side is done: ready for the cut-over.'
      : k ? (12 - k) + ' still to do. Most are one-off confirmations.' : 'Twelve things only JR-Tech can do. Most are one-off confirmations.';
  }
  Deck.on('needs', {
    init: function (s) { tickList($$('.jn-list button', s), NEEDS, K.needs, paintNeeds); paintNeeds(); },
    settle: function () { paintNeeds(); }
  });

  // the discovery questions: one click = answered, two = follow up, three = clear
  function qBtns() { return $$('[data-q]', stage); }
  function paintQ() {
    var ok = 0, fu = 0, per = {};
    qBtns().forEach(function (b) {
      var v = Q[b.dataset.q] || '', g = b.dataset.q.split('.')[0];
      if (v) b.dataset.s = v; else b.removeAttribute('data-s');
      b.setAttribute('aria-label', b.dataset.q + (v === 'ok' ? ', answered' : v === 'fu' ? ', to follow up' : ', not asked yet'));
      per[g] = per[g] || [0, 0]; per[g][1]++;
      if (v === 'ok') { ok++; per[g][0]++; } else if (v === 'fu') fu++;
    });
    $$('.jq-g', stage).forEach(function (g) { var c = per[g.dataset.g] || [0, 0]; $('.jq-c', g).textContent = c[0] + ' / ' + c[1] + ' answered'; });
    $$('.jq-t', stage).forEach(function (t) { var c = per[t.dataset.g] || [0, 1]; t.style.setProperty('--p', c[0] / c[1]); $('.jq-pr em', t).textContent = c[0] + ' / ' + c[1]; });
    var all = $('[data-jq=all]', stage); if (all) all.textContent = qBtns().length + ' questions · ' + ok + ' answered';
    var p = document.getElementById('prep');
    if (p) {
      $('[data-je=ok]', p).textContent = ok; $('[data-je=fu]', p).textContent = fu; $('[data-je=open]', p).textContent = qBtns().length - ok - fu;
      $('[data-je=got]', p).textContent = FILES.filter(Boolean).length;
      $$('.je-list button', p).forEach(function (b, i) { b.setAttribute('aria-pressed', FILES[i] ? 'true' : 'false'); });
    }
  }
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-q]'); if (!b) return;
    var id = b.dataset.q, v = Q[id] || '';
    Q[id] = v === '' ? 'ok' : v === 'ok' ? 'fu' : '';
    if (!Q[id]) delete Q[id];
    store.set(K.q, Q); paintQ();
  });
  ['s4', 'q-books', 'q-billing', 'q-cash'].forEach(function (id) { Deck.on(id, { init: function () { paintQ(); }, settle: function () { paintQ(); } }); });

  // the follow-up list for the email after the meeting
  function clean(el) { return el.textContent.replace(/\s+/g, ' ').trim(); }
  function followUp() {
    var fu = [], open = [], files = [], needs = [];
    qBtns().forEach(function (b) {
      var v = Q[b.dataset.q] || '', line = b.dataset.q + '  ' + clean($('span', b));
      if (v === 'fu') fu.push(line); else if (!v) open.push(line);
    });
    $$('#prep .je-list button span', stage).forEach(function (sp, i) { if (!FILES[i]) files.push('- ' + clean(sp)); });
    $$('#needs .jn-list button', stage).forEach(function (b, i) { if (!NEEDS[i]) needs.push('- ' + clean(b)); });
    var out = ['JR-Tech Solution × TechNext: follow-ups from the Odoo ERP session', ''];
    if (fu.length) out.push('To follow up (' + fu.length + ')', fu.join('\n'), '');
    if (open.length) out.push('Not asked yet (' + open.length + ')', open.join('\n'), '');
    if (files.length) out.push('Please send ahead (' + files.length + ')', files.join('\n'), 'Exports from SQL Account are fine as they are: we clean and map them.', '');
    if (needs.length) out.push('Pre-migration checklist, still open (' + needs.length + ')', needs.join('\n'), '');
    return { text: out.join('\n').trim() + '\n', n: [fu.length, open.length, files.length] };
  }
  // the clipboard API first, then the old copy command; if both are refused the caller shows the text to copy by hand
  function copyOld(text) {
    var t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(t); return ok;
  }
  function copy(text) {
    return new Promise(function (res, rej) {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(res, function () { if (copyOld(text)) res(); else rej(); });
      else if (copyOld(text)) res(); else rej();
    });
  }
  Deck.on('prep', {
    init: function (s) {
      var say = $('[data-je=say]', s), say0 = say.textContent, clr = $('.je-clear', s), clr0 = clr.innerHTML, armed = 0, out = $('.je-out', s), area = $('textarea', out);
      tickList($$('.je-list button', s), FILES, K.files, paintQ);
      $('.je-copy', s).addEventListener('click', function () {
        var f = followUp();
        copy(f.text).then(function () {
          say.classList.add('is-ok');
          say.textContent = 'Copied: ' + f.n[0] + ' to follow up, ' + f.n[1] + ' not asked yet, ' + f.n[2] + ' files to come. Paste it into the follow-up email.';
        }, function () {
          say.classList.remove('is-ok'); say.textContent = 'Shown on the left, ready to copy.';
          out.hidden = false; area.value = f.text; area.focus(); area.select();
        });
      });
      $('.je-out-x', s).addEventListener('click', function () { out.hidden = true; say.textContent = say0; });
      // two clicks, so a stray one never wipes the meeting's marks
      clr.addEventListener('click', function () {
        if (!armed) { armed = setTimeout(function () { armed = 0; clr.innerHTML = clr0; }, 3000); clr.textContent = 'Click again to clear every mark'; return; }
        clearTimeout(armed); armed = 0; clr.innerHTML = clr0;
        Object.keys(Q).forEach(function (k) { delete Q[k]; }); FILES.length = 0; NEEDS.length = 0;
        store.set(K.q, Q); store.set(K.files, FILES); store.set(K.needs, NEEDS);
        paintQ(); paintNeeds(); say.classList.remove('is-ok'); say.textContent = say0;
      });
      paintQ();
    },
    settle: function () { paintQ(); }
  });

  /* ---------------------------------------------------------------- 19 · the first month, on a track you can drag */
  // the track is a schematic: day 1, the window from day 8, sign-off on day 28, ongoing by day 35
  var JL_PTS = [[1, 1], [8, 34], [28, 68], [35, 99]], JL_DAY = [1, 14, 28, 35];
  function dayPct(d) { for (var i = 1; i < JL_PTS.length; i++) if (d <= JL_PTS[i][0]) { var a = JL_PTS[i - 1], b = JL_PTS[i]; return a[1] + (d - a[0]) / (b[0] - a[0]) * (b[1] - a[1]); } return 99; }
  function pctDay(p) { for (var i = 1; i < JL_PTS.length; i++) if (p <= JL_PTS[i][1]) { var a = JL_PTS[i - 1], b = JL_PTS[i]; return a[0] + (p - a[1]) / (b[1] - a[1]) * (b[0] - a[0]); } return 35; }
  Deck.on('aftergolive', {
    init: function (s) {
      var jl = $('.jl', s), tr = $('.jl-track', s), knob = $('.jl-knob', s), ms = $$('.jl-m', s), sup = $('.jl-sup', s), drag = false;
      s._d = 1;
      s._set = function (d) {
        d = clamp(d, 1, 35); s._d = d;
        var day = Math.round(d);
        tr.style.setProperty('--k', dayPct(d).toFixed(2) + '%');
        $('[data-jl=d]', s).textContent = day <= 28 ? 'Day ' + day : 'Week ' + Math.ceil(day / 7) + ' · ongoing';
        ms[0].classList.toggle('is-on', true); ms[1].classList.toggle('is-on', day >= 2); ms[2].classList.toggle('is-on', day >= 28);
        $('[data-jl=sql]', s).textContent = day >= 28 ? 'Archived for audit' : 'Read-only';
        $('[data-jl=win]', s).textContent = day >= 28 ? 'Signed off' : 'Day ' + day + ' of 28';
        sup.classList.toggle('is-on', day > 28);
        knob.setAttribute('aria-valuenow', day); knob.setAttribute('aria-valuetext', $('[data-jl=d]', s).textContent);
      };
      function at(e) { var p = PX.at(e, tr); return pctDay(clamp(p.x / tr.offsetWidth * 100, 1, 99)); }
      tr.addEventListener('pointerdown', function (e) { drag = true; jl.classList.add('is-drag'); try { tr.setPointerCapture(e.pointerId); } catch (x) {} s._set(at(e)); e.preventDefault(); });
      tr.addEventListener('pointermove', function (e) { if (drag) s._set(at(e)); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { tr.addEventListener(t, function () { drag = false; jl.classList.remove('is-drag'); }); });
      knob.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault(); s._set(Math.round(s._d) + (e.key === 'ArrowRight' ? 1 : -1));
      });
      s._set(1);
    },
    step: function (n, ctx, s, first) {
      var to = JL_DAY[n];
      if (first || !ctx) { s._set(to); return; }
      var from = s._d; ctx.tween(800, function (p) { s._set(from + (to - from) * p); }, 'io');
    },
    settle: function (s) { snap(s, function () { s._set(35); }); }
  });
})();

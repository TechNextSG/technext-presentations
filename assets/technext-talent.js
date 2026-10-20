/* TechNext talent deck: slide behaviour. The offices map and the step track follow company-profile.js. */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  function idx(s) { return Deck.slides.indexOf(s); }
  // swap the visible panel: the new one pushes in from the side of travel, the old one is thrown out
  function swap(list, k, dir, host) {
    host.style.setProperty('--dir', dir);
    list.forEach(function (el, j) {
      if (j === k) {
        if (!el.classList.contains('is-on')) { el.style.transition = 'none'; el.classList.remove('is-out'); void el.offsetWidth; el.style.transition = ''; }
        el.classList.add('is-on');
      } else if (el.classList.contains('is-on')) { el.classList.remove('is-on'); el.classList.add('is-out'); }
    });
  }

  /* ---------------------------------------------------------------- 1 · cover: six advisers orbit, three offices turn the other way */
  function cvPlace(s, t, px, py) {
    var C = 380, roles = $$('.ta-cv-r', s), offs = $$('.ta-cv-o', s), lines = $$('.ta-cv-spokes line', s);
    roles.forEach(function (el, i) {
      var a = -Math.PI / 2 + i * Math.PI / 3 + t * .06, x = C + Math.cos(a) * 286 + px * 18, y = C + Math.sin(a) * 286 + py * 14;
      el.style.setProperty('--x', x.toFixed(1) + 'px'); el.style.setProperty('--y', y.toFixed(1) + 'px');
      if (lines[i]) { lines[i].setAttribute('x2', x.toFixed(1)); lines[i].setAttribute('y2', y.toFixed(1)); }
    });
    offs.forEach(function (el, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / 3 - t * .1;
      el.style.setProperty('--x', (C + Math.cos(a) * 150 + px * 8).toFixed(1) + 'px'); el.style.setProperty('--y', (C + Math.sin(a) * 150 + py * 6).toFixed(1) + 'px');
    });
  }
  Deck.on('cover', {
    init: function (s) {
      var g = $('.ta-cv-spokes', s);
      $$('.ta-cv-r', s).forEach(function () { FX.svg('line', { x1: 380, y1: 380, x2: 380, y2: 380 }, g); });
      cvPlace(s, 0, 0, 0);
    },
    enter: function (ctx, s) {
      var ptr = FX.pointer(ctx, s);
      if (Deck.reduce || Deck.tv) { cvPlace(s, 0, 0, 0); return; }
      ctx.frame(function (t) { var p = ptr.step(); cvPlace(s, t / 1000, p.x, p.y); });
    },
    settle: function (s) { cvPlace(s, 0, 0, 0); }
  });

  /* ---------------------------------------------------------------- 3 · offices: arcs between the three, planes on them */
  var OFF = [null, 'sg', 'ph', 'vn'];
  Deck.on('offices', {
    init: function (s) {
      var pos = {};
      $$('.of-pin', s).forEach(function (p) {
        var xy = p.dataset.xy.split(',').map(Number); pos[p.dataset.o] = xy;
        p.style.setProperty('--px', xy[0] + 'px'); p.style.setProperty('--py', xy[1] + 'px');
      });
      var g = $('.of-links', s), gp = $('.of-planes', s);
      s._links = [['sg', 'vn', -.3], ['sg', 'ph', .18], ['ph', 'vn', .22]].map(function (pr) {
        var d = FX.arc(pos[pr[0]], pos[pr[1]], pr[2]);
        var l = { a: pr[0], b: pr[1], base: FX.svg('path', { d: d, 'class': 'of-link' }, g), flow: FX.svg('path', { d: d, 'class': 'of-link flow' }, g), plane: FX.svg('path', { d: FX.PLANE, 'class': 'of-plane' }, gp), dim: false };
        FX.along(l.base, l.plane, .5, false, .85);
        return l;
      });
      s.addEventListener('click', function (e) {
        var b = e.target.closest('[data-n]'); if (!b || !s.contains(b)) return;
        var n = +b.dataset.n; Deck.go(idx(s), +s.dataset.cur === n ? 0 : n);
      });
    },
    enter: function (ctx, s) {
      ctx.frame(function (t) {
        s._links.forEach(function (l, i) {
          var per = 5600 + i * 800, ph = ((t + i * 1900) % per) / per;
          FX.along(l.base, l.plane, Deck.ease.io(ph), false, .85);
          var f = ph < .1 ? ph / .1 : ph > .9 ? (1 - ph) / .1 : 1;
          l.plane.style.opacity = (f * (l.dim ? .2 : 1)).toFixed(3);
        });
      });
    },
    step: function (n, ctx, s) {
      var sel = OFF[n];
      ofCamera(s, sel);
      $$('.of-pin', s).forEach(function (p) { p.classList.toggle('is-sel', p.dataset.o === sel); p.classList.toggle('is-dim', !!sel && p.dataset.o !== sel); });
      s._links.forEach(function (l) {
        l.dim = !!sel && l.a !== sel && l.b !== sel;
        l.base.classList.toggle('is-dim', l.dim); l.flow.classList.toggle('is-dim', l.dim);
      });
    },
    settle: function (s) { ofCamera(s, null); }
  });
  function ofCamera(s, sel) {
    var map = $('.of-map', s), pin = sel && $('.of-pin[data-o=' + sel + ']', s);
    if (!pin || !window.Mx) { map.style.scale = ''; map.style.translate = ''; return; }
    var xy = pin.dataset.xy.split(',').map(Number), k = 1.1;
    var tx = xy[0] * (1 - k) + (430 - xy[0]) * .2, ty = xy[1] * (1 - k) + (370 - xy[1]) * .2;
    map.style.scale = k; map.style.translate = tx.toFixed(1) + 'px ' + ty.toFixed(1) + 'px';
  }

  /* ---------------------------------------------------------------- 4 · roles: one build per adviser, or click a tab */
  function roPaint(s, n, dir) {
    $$('.ta-ro-list button', s).forEach(function (b, k) { b.setAttribute('aria-selected', k === n ? 'true' : 'false'); });
    swap($$('.ta-ro-p', s), n, dir || 1, $('.ta-ro-panels', s));
  }
  Deck.on('roles', {
    init: function (s) {
      s._n = 0;
      s.addEventListener('click', function (e) { var b = e.target.closest('.ta-ro-list button'); if (b) Deck.go(idx(s), +b.dataset.n); });
    },
    step: function (n, ctx, s) { roPaint(s, n, n < s._n ? -1 : 1); s._n = n; },
    settle: function (s) { roPaint(s, 0); s._n = 0; }
  });

  /* ---------------------------------------------------------------- 5 · people: click a profile to turn it over */
  Deck.on('people', {
    init: function (s) {
      s.addEventListener('click', function (e) {
        var b = e.target.closest('.ta-pc'); if (!b) return;
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      });
    },
    leave: function (s) { $$('.ta-pc', s).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); },
    settle: function (s) { $$('.ta-pc', s).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); }
  });

  /* ---------------------------------------------------------------- 6 · team: problems light the advisers and the people behind them */
  var PROB = [
    { a: [0], c: ['ph'], t: 'A finance adviser, with consultants in Taguig City: books, banks and tax in one database.' },
    { a: [1], c: ['ph'], t: 'A sales adviser: pipeline stages, pricelists and approval rules that match how you sell.' },
    { a: [2], c: ['ph'], t: 'A supply chain adviser: locations, reordering rules and barcode scanning you can trust.' },
    { a: [3, 0], c: ['ph'], t: 'Operations and finance advisers together: job costing that lands in the books as it happens.' },
    { a: [4], c: ['vn', 'dev'], t: 'An AI adviser, with our AI engineers in Ho Chi Minh City: answers from your own documents.' },
    { a: [5], c: ['dev'], t: 'A website and brand adviser: a site built around what customers ask, forms straight into CRM.' },
    { a: [], c: ['ph'], t: 'An adviser reviews the set-up, finds where people work around it, and recommends what to reconfigure, retrain or add.' }
  ];
  function tmPaint(s, picked) {
    var A = {}, C = {};
    picked.forEach(function (p) { PROB[p].a.forEach(function (a) { A[a] = 1; }); PROB[p].c.forEach(function (c) { C[c] = 1; }); });
    if (picked.length) { C.ph = 1; C.sg = 1; }
    if (picked.indexOf(6) >= 0 && !Object.keys(A).length) A.review = 1;
    $$('.ta-tm-c', s).forEach(function (b) { b.setAttribute('aria-pressed', picked.indexOf(+b.dataset.p) >= 0 ? 'true' : 'false'); });
    $$('.ta-tm-adv span', s).forEach(function (el) { el.classList.toggle('is-on', !!A[el.dataset.a]); });
    $$('.ta-tm-crew span', s).forEach(function (el) { el.classList.toggle('is-on', !!C[el.dataset.c]); });
    var n = Object.keys(A).filter(function (k) { return k !== 'review'; }).length;
    $('.ta-tm-n', s).textContent = n || (A.review ? 1 : 0);
    $('.ta-tm-s', s).textContent = !picked.length ? 'Pick a problem to see who joins.'
      : picked.length === 1 ? PROB[picked[0]].t
      : (n > 1 ? 'Advisers on one scope, decided together, ' : 'One adviser, ') + 'with consultants' + (C.dev ? ' and developers' : '') + ' in Taguig City' + (C.vn ? ' and AI engineers in Ho Chi Minh City.' : '.');
  }
  Deck.on('team', {
    init: function (s) {
      s._p = [];
      s.addEventListener('click', function (e) {
        var b = e.target.closest('.ta-tm-c'); if (!b) return;
        s._touched = true;
        var p = +b.dataset.p, i = s._p.indexOf(p);
        if (i >= 0) s._p.splice(i, 1); else s._p.push(p);
        tmPaint(s, s._p);
      });
    },
    enter: function (ctx, s) {
      if (s._touched) { tmPaint(s, s._p); return; }
      s._p = []; tmPaint(s, s._p);
      // a short demo: two problems picked for the room, until someone clicks
      ctx.after(1100, function () { if (!s._touched) { s._p = [0]; tmPaint(s, s._p); } });
      ctx.after(2300, function () { if (!s._touched) { s._p = [0, 2]; tmPaint(s, s._p); } });
    },
    settle: function (s) { if (!s._touched) s._p = [0, 2]; tmPaint(s, s._p); }
  });

  /* ---------------------------------------------------------------- 6 · process: a plane moves step to step */
  var WHO = [['adv', 'you'], ['adv', 'you'], ['adv', 'ph', 'vn', 'you'], ['adv', 'ph']];
  var WHO_S = ['Your adviser, with your process owners: on-site in Singapore or online.', 'Your adviser writes it; your team decides what to act on.',
    'Your adviser leads; consultants and developers in Taguig City configure it, with AI engineers in Ho Chi Minh City when AI is in scope.', 'The adviser who set it up, backed by the same team in Taguig City.'];
  function prPaint(s, n, dir) {
    $$('.en-node', s).forEach(function (el, k) { el.classList.toggle('is-past', k < n); el.classList.toggle('is-cur', k === n); });
    swap($$('.en-card', s), n, dir || 1, $('.en-cards', s));
    $$('.en-offs span', s).forEach(function (el) { el.classList.toggle('is-on', WHO[n].indexOf(el.dataset.o) >= 0); });
    $('[data-who]', s).textContent = WHO_S[n];
  }
  function prAt(s, p) { s._p = p; FX.along($('#taBase', s), $('.en-plane', s), p, false, 1.25); $('.en-svg', s).style.setProperty('--p', p.toFixed(4)); }
  Deck.on('process', {
    init: function (s) {
      var base = $('#taBase', s);
      $('.en-plane', s).setAttribute('d', FX.PLANE);
      s._f = $$('.en-node', s).map(function (n) { return FX.fracAtX(base, parseFloat(n.style.getPropertyValue('--x'))); });
      s._f[0] = 0; s._f[s._f.length - 1] = 1; s._p = 0;
      prAt(s, 0);
      s.addEventListener('click', function (e) { var b = e.target.closest('.en-node'); if (b) Deck.go(idx(s), +b.dataset.n); });
    },
    step: function (n, ctx, s, first) {
      var from = s._p, to = s._f[n];
      prPaint(s, n, to < from ? -1 : 1);
      if (first && from === to) { prAt(s, to); return; }
      ctx.tween(first ? 760 : 880, function (e) { prAt(s, from + (to - from) * e); }, Deck.ease.softInOut ? 'softInOut' : 'io');
    },
    settle: function (s) { var n = s._f.length - 1; prPaint(s, n); prAt(s, s._f[n]); }
  });

  /* ---------------------------------------------------------------- 7 · crafts: point at a craft, its office lights */
  function crHot(s, li) {
    $$('.ta-cr-col li', s).forEach(function (x) { x.classList.toggle('is-hot', x === li); });
    var o = li ? li.dataset.o.split(' ') : [];
    if (li) s.dataset.hot = '1'; else delete s.dataset.hot;
    $$('.ta-cr-map>span', s).forEach(function (el) { el.classList.toggle('is-on', o.indexOf(el.dataset.o) >= 0); });
  }
  Deck.on('crafts', {
    enter: function (ctx, s) {
      var items = $$('.ta-cr-col li', s), k = 0, held = false;
      ctx.on(s, 'pointerover', function (e) { var li = e.target.closest('.ta-cr-col li'); if (li) { held = true; crHot(s, li); } });
      ctx.on($('.ta-cr', s), 'pointerleave', function () { held = false; crHot(s, null); });
      // until someone points, the highlight walks the crafts on its own
      ctx.after(1400, function () {
        ctx.every(1500, function () { if (held) return; crHot(s, items[k % items.length]); k++; });
      });
    },
    leave: function (s) { crHot(s, null); },
    settle: function (s) { crHot(s, null); }
  });
})();

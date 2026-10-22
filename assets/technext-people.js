/* TechNext People deck: slide behaviour. */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  function idx(s) { return Deck.slides.indexOf(s); }

  /* ---------------------------------------------------------------- 1 · cover: five people orbit, two offices turn the other way */
  function cvPlace(s, t, px, py) {
    var C = 380, ps = $$('.pe-cv-p', s), offs = $$('.pe-cv-o', s), lines = $$('.pe-cv-spokes line', s);
    ps.forEach(function (el, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / ps.length + t * .05, x = C + Math.cos(a) * 290 + px * 18, y = C + Math.sin(a) * 290 + py * 14;
      el.style.setProperty('--x', x.toFixed(1) + 'px'); el.style.setProperty('--y', y.toFixed(1) + 'px');
      if (lines[i]) { lines[i].setAttribute('x2', x.toFixed(1)); lines[i].setAttribute('y2', y.toFixed(1)); }
    });
    offs.forEach(function (el, i) {
      var a = -Math.PI / 2 + i * Math.PI - t * .1;
      el.style.setProperty('--x', (C + Math.cos(a) * 150 + px * 8).toFixed(1) + 'px'); el.style.setProperty('--y', (C + Math.sin(a) * 150 + py * 6).toFixed(1) + 'px');
    });
  }
  Deck.on('cover', {
    init: function (s) {
      var g = $('.pe-cv-spokes', s);
      $$('.pe-cv-p', s).forEach(function () { FX.svg('line', { x1: 380, y1: 380, x2: 380, y2: 380 }, g); });
      cvPlace(s, 0, 0, 0);
    },
    enter: function (ctx, s) {
      var ptr = FX.pointer(ctx, s);
      if (Deck.reduce || Deck.tv) { cvPlace(s, 0, 0, 0); return; }
      ctx.frame(function (t) { var p = ptr.step(); cvPlace(s, t / 1000, p.x, p.y); });
    },
    settle: function (s) { cvPlace(s, 0, 0, 0); }
  });

  /* ---------------------------------------------------------------- 2 · team: → walks the offices, a click opens a profile */
  Deck.on('team', {
    init: function (s) {
      s.addEventListener('click', function (e) {
        var h = e.target.closest('.pe-og-h');
        if (h && s.contains(h)) { var n = h.parentNode.dataset.o === 'sg' ? 1 : 2; Deck.go(idx(s), +s.dataset.cur === n ? 0 : n); }
      });
    },
    step: function (n, ctx, s) { s.dataset.cur = n; },
    leave: function (s) { s.dataset.cur = 0; },
    settle: function (s) { s.dataset.cur = 0; }
  });

  /* a card or button marked data-go jumps to that slide (one delegated click on the stage) */
  document.querySelector('.stage').addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]');
    if (b) Deck.goId(b.dataset.go);
  });

  /* ---------------------------------------------------------------- 3-7 · profiles: figures count up, a click focuses one skill group */
  function focus(s, g) {
    var sk = $('.pe-sk', s);
    $$('.pe-g', s).forEach(function (x) { x.classList.toggle('is-focus', x === g); x.setAttribute('aria-pressed', x === g ? 'true' : 'false'); });
    if (g) sk.dataset.focus = '1'; else delete sk.dataset.focus;
  }
  function finals(s, show) {
    $$('.pe-st b', s).forEach(function (b) { if (b._final != null) b.textContent = b._final; });
  }
  ['clement', 'rj', 'philip', 'aj', 'jeric'].forEach(function (k) {
    Deck.on('p-' + k, {
      init: function (s) {
        $$('.pe-st b', s).forEach(function (b) { b._final = b.textContent; });
        s.addEventListener('click', function (e) {
          var g = e.target.closest('button.pe-g'); if (!g || !s.contains(g)) return;
          focus(s, g.classList.contains('is-focus') ? null : g);
        });
      },
      enter: function (ctx, s) {
        focus(s, null);
        $$('.pe-st b[data-to]', s).forEach(function (b, i) {
          ctx.after(420 + i * 90, function () {
            ctx.count(b, +b.dataset.to, { suf: b.dataset.suf || '', dur: 1100, ease: Deck.ease.softLand ? 'softLand' : 'out' });
          });
        });
      },
      leave: function (s) { focus(s, null); finals(s); },
      settle: function (s) { focus(s, null); finals(s); }
    });
  });
})();

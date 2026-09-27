/* Shared motion helpers for the TechNext decks: orbits, path followers, pointer parallax.
   Everything is driven from a slide's ctx.frame loop, so it stops when the slide closes. */
(function () {
  'use strict';
  var FX = {};

  // Place items on an ellipse around (cx, cy). Returns tick(seconds). Items nearer the viewer sit higher and larger.
  FX.orbit = function (items, o) {
    var n = items.length, min = o.min || .8, phase = o.phase || 0;
    return function (t, dx, dy) {
      for (var i = 0; i < n; i++) {
        var a = phase + (i / n) * Math.PI * 2 + t * (o.speed || .1);
        var x = o.cx + Math.cos(a) * o.rx + (dx || 0), y = o.cy + Math.sin(a) * o.ry + (dy || 0);
        var d = (Math.sin(a) + 1) / 2, s = min + d * (1 - min), el = items[i];
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-50%) scale(' + s.toFixed(3) + ')';
        el.style.zIndex = d > .5 ? 4 : 1;
        if (o.fade) el.style.opacity = (1 - o.fade + o.fade * d).toFixed(3);
      }
    };
  };

  // Put an SVG element (or HTML element over a 1:1 SVG) at fraction p along a path, turned to face along it.
  FX.along = function (path, el, p, html, sc) {
    var L = path._len || (path._len = path.getTotalLength()), at = Math.max(0, Math.min(1, p)) * L;
    var a = path.getPointAtLength(at), b = path.getPointAtLength(Math.min(L, at + 1)), c = path.getPointAtLength(Math.max(0, at - 1));
    var ang = Math.atan2(b.y - c.y, b.x - c.x) * 180 / Math.PI, k = sc ? ' scale(' + sc + ')' : '';
    if (html) el.style.transform = 'translate(' + a.x.toFixed(1) + 'px,' + a.y.toFixed(1) + 'px) translate(-50%,-50%) rotate(' + ang.toFixed(1) + 'deg)' + k;
    else el.setAttribute('transform', 'translate(' + a.x.toFixed(1) + ',' + a.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')' + k);
    return a;
  };
  // fraction along a path where it first reaches x (paths that run left to right)
  FX.fracAtX = function (path, x) {
    var L = path.getTotalLength(), lo = 0, hi = L;
    for (var i = 0; i < 30; i++) { var m = (lo + hi) / 2; if (path.getPointAtLength(m).x < x) lo = m; else hi = m; }
    return lo / L;
  };

  // Smoothed pointer position over an area, -0.5..0.5 on each axis; read it inside a frame loop.
  FX.pointer = function (ctx, area) {
    var p = { x: 0, y: 0, tx: 0, ty: 0 };
    ctx.on(area, 'pointermove', function (e) {
      var r = Deck.rect(area), q = Deck.point(e); p.tx = (q.x - r.left) / r.width - .5; p.ty = (q.y - r.top) / r.height - .5;
    });
    ctx.on(area, 'pointerleave', function () { p.tx = 0; p.ty = 0; });
    p.step = function () { p.x += (p.tx - p.x) * .05; p.y += (p.ty - p.y) * .05; return p; };
    return p;
  };

  // A quadratic curve from a to b that bows by `bow` (fraction of length) to one side.
  FX.arc = function (a, b, bow) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    var k = bow == null ? .22 : bow, cx = mx - dy * k, cy = my + dx * k;
    return 'M' + a[0].toFixed(1) + ',' + a[1].toFixed(1) + ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + b[0].toFixed(1) + ',' + b[1].toFixed(1);
  };

  FX.svg = function (tag, attrs, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };

  // Paper plane in the TechNext logo's shape, pointing right, centred on 0,0.
  FX.PLANE = 'M-15,-11 L17,-1.5 L-15,11 L-8,1 Z M-8,1 L-3,9 L1,2.2 Z';

  window.FX = FX;
})();

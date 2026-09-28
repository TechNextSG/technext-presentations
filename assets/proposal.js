/* Sales proposal decks: small SVG chart helpers and a tooltip, shared by each proposal's slide script.
   Marks follow the chart spec: columns and bars <= 24px with a 4px rounded data end and a square foot,
   2px lines, >= 8px end dots with a 2px surface ring, hairline grid, tooltips that list every series. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', PX = {};

  PX.svg = function (tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  PX.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); };
  function r1(v) { return Math.round(v * 10) / 10; }

  // a column: rounded top corners (the data end), square at the baseline
  PX.col = function (x, y, w, h, r) {
    if (!(h > .05)) return 'M0,0';
    r = Math.min(r == null ? 4 : r, h, w / 2);
    return 'M' + r1(x) + ',' + r1(y + h) + 'V' + r1(y + r) + 'Q' + r1(x) + ',' + r1(y) + ' ' + r1(x + r) + ',' + r1(y) +
      'H' + r1(x + w - r) + 'Q' + r1(x + w) + ',' + r1(y) + ' ' + r1(x + w) + ',' + r1(y + r) + 'V' + r1(y + h) + 'Z';
  };
  // a plain rectangle, for stacked segments below the top one
  PX.rect = function (x, y, w, h) {
    if (!(h > .05)) return 'M0,0';
    return 'M' + r1(x) + ',' + r1(y) + 'H' + r1(x + w) + 'V' + r1(y + h) + 'H' + r1(x) + 'Z';
  };
  // a horizontal bar: rounded right end, square at the baseline
  PX.hbar = function (x, y, w, h, r) {
    if (!(w > .05)) return 'M0,0';
    r = Math.min(r == null ? 4 : r, w, h / 2);
    return 'M' + r1(x) + ',' + r1(y) + 'H' + r1(x + w - r) + 'Q' + r1(x + w) + ',' + r1(y) + ' ' + r1(x + w) + ',' + r1(y + r) +
      'V' + r1(y + h - r) + 'Q' + r1(x + w) + ',' + r1(y + h) + ' ' + r1(x + w - r) + ',' + r1(y + h) + 'H' + r1(x) + 'Z';
  };
  PX.lin = function (d0, d1, a, b) { return function (v) { return a + (v - d0) / (d1 - d0) * (b - a); }; };
  PX.lerp = function (a, b, t) { return a + (b - a) * t; };
  // points -> a polyline path
  PX.line = function (pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + r1(p[0]) + ',' + r1(p[1]); }).join(''); };
  PX.area = function (pts, y0) { return PX.line(pts) + 'L' + r1(pts[pts.length - 1][0]) + ',' + r1(y0) + 'L' + r1(pts[0][0]) + ',' + r1(y0) + 'Z'; };

  // horizontal gridlines with tick labels on the left
  PX.gridY = function (g, x0, x1, y, ticks, fmt) {
    var gg = PX.svg('g', { 'class': 'cx-grid' }, g), tg = PX.svg('g', { 'class': 'cx-axis' }, g);
    ticks.forEach(function (v) {
      PX.svg('line', { x1: x0, x2: x1, y1: r1(y(v)), y2: r1(y(v)) }, gg);
      var t = PX.svg('text', { x: x0 - 10, y: r1(y(v)) + 4, 'text-anchor': 'end' }, tg); t.textContent = fmt ? fmt(v) : v;
    });
  };

  // pointer position in a slide's own pixels: the stage's scale and a phone's rotation undone
  PX.at = function (e, host) {
    var r = Deck.rect(host), q = Deck.point(e), s = Deck.scale;
    return { x: (q.x - r.left) / s, y: (q.y - r.top) / s };
  };

  // pointer position in an SVG's own viewBox units (every transform on the way, the phone turn included, undone)
  PX.svgAt = function (e, svg) {
    var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    var m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    var q = pt.matrixTransform(m.inverse()); return { x: q.x, y: q.y };
  };

  // one tooltip per slide. rows: [{c: colour, v: value, l: label}] - the value leads, the label follows.
  PX.tip = function (host) {
    var el = document.createElement('div'); el.className = 'cx-tip'; el.setAttribute('aria-hidden', 'true'); host.appendChild(el);
    return {
      show: function (title, rows, x, y) {
        el.textContent = '';
        var h = document.createElement('b'); h.textContent = title; el.appendChild(h);
        rows.forEach(function (r) {
          var p = document.createElement('p'), i = document.createElement('i'), v = document.createElement('strong'), l = document.createElement('span');
          i.style.background = r.c || 'transparent'; v.textContent = r.v; l.textContent = r.l || '';
          p.appendChild(i); p.appendChild(v); p.appendChild(l); el.appendChild(p);
        });
        var w = el.offsetWidth, hh = el.offsetHeight, W = host.offsetWidth, H = host.offsetHeight;
        var left = x + 16 + w > W - 20 ? x - 16 - w : x + 16, top = Math.max(20, Math.min(H - hh - 20, y - hh / 2));
        el.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(top) + 'px)';
        el.classList.add('is-on');
      },
      hide: function () { el.classList.remove('is-on'); }
    };
  };

  // tween a set of numbers from -> to, calling paint(values) each frame (ctx.tween when a slide is live, instant otherwise)
  PX.morph = function (ctx, from, to, dur, paint) {
    if (!ctx) { paint(to); return; }
    ctx.tween(dur || 700, function (e) { paint(to.map(function (v, i) { return PX.lerp(from[i], v, e); })); }, 'io');
  };

  window.PX = PX;
})();

/* Motion kit (see motion.css). Load after deck.js, before the deck's own script.
   1. Adds motionmaxxing's measured eases to Deck.ease, so ctx.tween(ms, fn, 'softLand') and ctx.count(..., {ease:'snapSettle'}) work.
   2. Splits every entering headline (.h-xl, .h-l, .h-m with data-in) into masked words that rise at speech rhythm,
      and times the marker stroke (.hl) to draw after the last word lands.
   3. Mx.cascade(els, base, gaps) gives siblings uneven 1-3 frame onsets (a wave reads as one gesture, a metronome as a loading list). */
(function () {
  'use strict';
  if (!window.Deck || !document.body.hasAttribute('data-motion')) return;

  /* ---------------------------------------------------------------- the measured eases (motionmaxxing runtime/motion.js) */
  var powerOut = function (p) { return function (t) { return 1 - Math.pow(1 - t, p); }; };
  var powerIn = function (p) { return function (t) { return Math.pow(t, p); }; };
  var expoOut = function (k) { var d = 1 - Math.exp(-k); return function (t) { return (1 - Math.exp(-k * t)) / d; }; };
  var snapRamp = function (w, tau) { var n = w * (1 - Math.exp(-1 / tau)) + (1 - w); return function (t) { return (w * (1 - Math.exp(-t / tau)) + (1 - w) * t) / n; }; };
  var spring = function (c, om) { var f = function (t) { return 1 - Math.exp(-c * t) * (Math.cos(om * t) + (c / om) * Math.sin(om * t)); }, n = f(1); return function (t) { return f(t) / n; }; };
  var smoothP = function (p) { return function (t) { var a = Math.pow(t, p), b = Math.pow(1 - t, p); return a / (a + b); }; };
  var guard = function (f) { return function (t) { return t <= 0 ? 0 : t >= 1 ? 1 : f(t); }; };
  var M = {
    softLand: guard(expoOut(3.41)), snapSettle: guard(snapRamp(0.942, 0.118)), glide: guard(powerOut(1.7)), whip: guard(powerOut(2.52)),
    accelExit: guard(powerIn(2.6)), gentleIn: guard(powerIn(2.07)), softInOut: guard(smoothP(1.42)), popOver: guard(spring(2.67, 4.36)), cruise: function (t) { return t; }
  };
  Object.keys(M).forEach(function (k) { Deck.ease[k] = M[k]; });

  /* ---------------------------------------------------------------- headlines, word by word */
  // stagger per word: 3-4 frames for a headline (motionmaxxing type.md: whole words 4-6 f apart, 2-4 f for a fast hook)
  var GAP = { 'h-xl': 105, 'h-l': 85, 'h-m': 75 };
  function split(h) {
    var n = 0, cls = /h-xl/.test(h.className) ? 'h-xl' : /h-l\b/.test(h.className) ? 'h-l' : 'h-m';
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 1) { walk(c); return; }
        if (c.nodeType !== 3 || !c.nodeValue.trim()) return;
        var frag = document.createDocumentFragment();
        c.nodeValue.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
          var o = document.createElement('span'), i = document.createElement('span');
          o.className = 'mx-w'; i.className = 'mx-wi'; i.textContent = w; i.style.setProperty('--wi', n++);
          o.appendChild(i); frag.appendChild(o);
        });
        node.replaceChild(frag, c);
      });
    })(h);
    var gap = GAP[cls], d = parseFloat(h.style.getPropertyValue('--d')) || 0;
    h.style.setProperty('--wg', gap + 'ms');
    h.classList.add('mx-words');
    // the marker draws once the last word has landed (its delay replaces deck.css's fixed .45 s)
    [].slice.call(h.querySelectorAll('.hl')).forEach(function (hl) { hl.style.setProperty('--hd', Math.round(d * .85 + n * gap + 260) + 'ms'); });
    if (!h.getAttribute('aria-label')) h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
  }
  Deck.$$('.slide .h-xl[data-in], .slide .h-l[data-in], .slide .h-m[data-in]').forEach(split);

  /* ---------------------------------------------------------------- the close: the booking QR card is the last hero, it lands from oversize */
  Deck.$$('.slide .ct-qr[data-in]').forEach(function (el) { el.setAttribute('data-fx', 'land'); });

  /* ---------------------------------------------------------------- uneven sibling onsets */
  // the measured gaps between siblings (1-3 frames, uneven); returns the onset in ms of each element after `base`
  var GAPS = [0, 2, 3, 2, 1, 3, 2, 2, 1, 2, 3, 2];
  window.Mx = {
    ease: M,
    cascade: function (els, base, frame) {
      var t = base || 0, f = frame || 33;
      return els.map(function (el, i) { t += i ? GAPS[i % GAPS.length] * f : 0; return t; });
    }
  };
})();

/* For coaching businesses. The seam (Today / With TechNext) on slides 2-7, and the status demo on slide 5.
   Timers only through ctx; positions only through Deck.rect / Deck.point. Every slide has a settle hook (seam 50/50, final state). */
(function () {
  var $ = Deck.$, $$ = Deck.$$;
  var HALF = 1300, GAP = 60, DESIGN = 650;

  /* ---------------------------------------------------------------- the seam */
  function seam(s, p, instant) {
    var sp = $('.cb-split', s); if (!sp) return;
    p = Deck.clamp(p, 30, 70); sp._p = p;
    if (instant) { sp.classList.add('is-drag'); }
    sp.style.gridTemplateColumns = p + 'fr ' + GAP + 'px ' + (100 - p) + 'fr';
    sp.style.setProperty('--kl', Math.min(1, HALF * p / 100 / DESIGN).toFixed(3));
    sp.style.setProperty('--kr', Math.min(1, HALF * (100 - p) / 100 / DESIGN).toFixed(3));
    var t = $('.cb-lab--t', s), w = $('.cb-lab--w', s);
    t.setAttribute('aria-pressed', p > 55 ? 'true' : 'false');
    w.setAttribute('aria-pressed', p < 45 ? 'true' : 'false');
    if (instant) { void sp.offsetWidth; sp.classList.remove('is-drag'); }
  }

  function wireSeam(s) {
    var sp = $('.cb-split', s), h = $('.cb-handle', s), t = $('.cb-lab--t', s), w = $('.cb-lab--w', s);
    t.addEventListener('click', function () { seam(s, sp._p > 55 ? 50 : 62); });
    w.addEventListener('click', function () { seam(s, sp._p < 45 ? 50 : 38); });
    var moved = false, down = null;
    h.addEventListener('click', function () { if (moved) { moved = false; return; } seam(s, 50); });
    h.addEventListener('pointerdown', function (e) {
      moved = false; down = Deck.point(e);
      try { h.setPointerCapture(e.pointerId); } catch (x) {}
      sp.classList.add('is-drag');
    });
    h.addEventListener('pointermove', function (e) {
      if (!down) return;
      var pt = Deck.point(e);
      if (Math.abs(pt.x - down.x) > 4) moved = true;
      if (!moved) return;
      var r = Deck.rect(sp), frac = (pt.x - r.left) / r.width;      // 0..1 across the split, scale cancels out
      seam(s, ((frac * (HALF + GAP)) - GAP / 2) / HALF * 100);
    });
    function up() { down = null; sp.classList.remove('is-drag'); }
    h.addEventListener('pointerup', up);
    h.addEventListener('pointercancel', up);
    h.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); e.stopPropagation();
      seam(s, sp._p + (e.key === 'ArrowLeft' ? -10 : 10));
    });
    seam(s, 50, true);
  }

  /* ---------------------------------------------------------------- slide 5: one status, four outputs */
  var STATES = {
    early:   { site: 'Early-bird rate · Register',     form: 'Open · early-bird rate applied', bot: 'Yes, early-bird places are open.',          post: 'Early bird closes soon' },
    regular: { site: 'Regular rate · Register',        form: 'Open · regular rate',            bot: 'Yes, places are open.',                     post: 'Places still open' },
    sold:    { site: 'Sold out · Join the waitlist',   form: 'Closed · waitlist on',           bot: "It's full; I can add you to the waitlist.", post: 'Sold out, thank you' },
    past:    { site: 'Moved to Past events',           form: 'Closed',                         bot: 'That one has ended. The next date is…',    post: 'Thank you for coming' }
  };
  function setState(s, k, animate) {
    $$('.w-ctl button', s).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === k ? 'true' : 'false'); });
    $$('[data-o]', s).forEach(function (el) {
      var t = STATES[k][el.dataset.o];
      if (el.textContent === t) return;
      el.textContent = t;
      el.classList.remove('is-swap');
      if (animate) { void el.offsetWidth; el.classList.add('is-swap'); }
    });
  }

  /* ---------------------------------------------------------------- hooks */
  ['found', 'asks', 'pays', 'event', 'follow', 'returns'].forEach(function (id) {
    Deck.on(id, {
      init: function (s) { wireSeam(s); if (id === 'event') wireEvent(s); },
      enter: function (ctx, s) {
        seam(s, 50, true);
        if (id === 'event') autoplay(ctx, s);
      },
      settle: function (s) {
        seam(s, 50, true);
        if (id === 'event') { setState(s, 'early', false); $('.w-outs', s).setAttribute('aria-live', 'off'); }
      }
    });
  });

  function wireEvent(s) {
    var ctl = $('.w-ctl', s);
    function stop() { s._manual = true; }
    ctl.addEventListener('pointerenter', stop);
    ctl.addEventListener('focusin', stop);
    ctl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      s._manual = true;
      $('.w-outs', s).setAttribute('aria-live', 'polite');
      setState(s, b.dataset.k, true);
    });
  }
  function autoplay(ctx, s) {
    s._manual = false;
    $('.w-outs', s).setAttribute('aria-live', 'off');
    setState(s, 'early', false);
    if (Deck.reduce) return;
    ['regular', 'sold'].forEach(function (k, i) {
      ctx.after(2900 + i * 1800, function () { if (!s._manual) setState(s, k, true); });   // after the entrance, then 1.8 s apart, once
    });
  }

  /* cover, proof and contact are static: nothing to settle */
  ['cover', 'proof', 'contact'].forEach(function (id) { Deck.on(id, { settle: function () {} }); });
})();

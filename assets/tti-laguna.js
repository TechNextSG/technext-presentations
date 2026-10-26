/* TTI Laguna Philippines: slide 8 only, "From this week to 31 December" (prefix tt-). Everything else this deck needs (the cover with its day-count badge, the zero-rated
   export line, five apps spaced evenly) is a kit feature now: BM.urgent, a 'zero' VAT code on an invoice line, 360/n spacing.
   Slide 8: a runway from today (the live date) to 31 December 2026 (live day count) with four milestones in ORDER (spacing is order, not duration).
   It plays once on enter (the fill travels and lights each milestone in turn); click a milestone, today or 31 December to move the plan there.
   Every timer goes through ctx, every Motion control is stored and stopped in leave, settle paints the finished state (print, overview, reduced motion, TV). */
(function () {
  'use strict';
  var K = window.BMK, Deck = window.Deck, BM = window.BM;
  if (!K || !Deck || !BM) return;
  function $(q, r) { return (r || document).querySelector(q); }
  function $$(q, r) { return [].slice.call((r || document).querySelectorAll(q)); }
  function today() { return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
  function countOpts(n) { return { from: n + 90, dur: 1300, ease: Deck.ease && Deck.ease.softLand ? 'softLand' : 'out' }; }

  /* ================================================================ 8 · from this week to 31 December */
  var s = document.getElementById('move'); if (!s) return;
  var MS = [
    { n: 'Discovery and data review', i: 'search', u: 'Your accountant’s view, your BIR forms and books, your SAP Business One data.' },
    { n: 'Odoo set-up and BIR outputs', i: 'file', u: 'Invoices, books and the 2307, SLSP, SAWT, QAP and 2550Q outputs, set up in Odoo.' },
    { n: 'Parallel run beside SAP Business One', i: 'refresh', u: 'Both systems side by side, checked against each other before anything switches.' },
    { n: 'Cut-over', i: 'target', u: 'One cut-over date from SAP Business One to Odoo, fixed in the proposal.' }
  ];
  var LATER = [['account', 'Multi-currency'], ['stock', 'Landed costs on imported stock'], ['purchase', 'Purchase'], ['stock', 'Inventory']];
  var SPAN = 5;                                   // today = 0, milestones 1-4, 31 December = 5, evenly spaced (order, not duration)
  function xOf(k) { return 36 + (1360 - 72) * k / SPAN; }

  var h = K.kick('the plan, compressed', 0) + '<h2 class="h-m bm-h2"' + K.inz(80) + '>From this week to 31 December, <span class="hl">in four moves.</span></h2>' +
    '<div class="tt-run" role="group" aria-label="Plan from today to 31 December 2026: click a milestone to move the plan to it"' + K.inz(160) + '>' +
    '<div class="tt-trk"><i class="tt-fill"></i></div>' +
    '<span class="tt-today"><em>Today · <b class="tt-date">' + today() + '</b></em></span><i class="tt-tn" aria-hidden="true"></i>' +
    '<button type="button" class="tt-end" data-k="5" aria-pressed="false" aria-label="31 December 2026, days left">' + K.ico('calendar') + '<span><small>31 December 2026</small><b><i class="tt-n">' + K.daysLeft() + '</i> days left</b></span></button><i class="tt-en" aria-hidden="true"></i>';
  MS.forEach(function (m, i) {
    h += '<button type="button" class="tt-m" data-k="' + (i + 1) + '" aria-pressed="false" style="--x:' + xOf(i + 1) + 'px"><span class="tt-disc">' + K.ico(m.i) + '<em>' + (i + 1) + '</em></span>' +
      '<span class="tt-card"><b>' + K.esc(m.n) + '</b><small>' + K.esc(m.u) + '</small></span></button>';
  });
  h += '</div>' +
    '<div class="tt-calm"' + K.inz(560) + '><p><b>Starting now keeps December calm.</b><span>A compressed plan, in the order the work happens.</span></p></div>' +
    '<div class="tt-later"' + K.inz(640) + '><p class="tt-lab">Later phases, for import and export</p><div class="tt-chips">';
  LATER.forEach(function (c) { h += '<span class="tt-chip">' + K.odoo(c[0], 26) + K.esc(c[1]) + '</span>'; });
  h += '</div></div><p class="illus bm-ill">' + K.ico('check') + 'Order of work, not durations · dates fixed in the proposal after discovery · Odoo has no native SAP Business One connector, so the move is TechNext’s service</p>';
  var f = $('.s-foot', s); if (f) f.insertAdjacentHTML('beforebegin', h); else s.insertAdjacentHTML('beforeend', h);
  $$('.h-m[data-in]', s).forEach(K.split);

  var run = $('.tt-run', s), fill = $('.tt-fill', s), ms = $$('.tt-m', s), endB = $('.tt-end', s);
  var st = { mo: [], ctx: null }, at = 0, cur = 0, token = 0;

  function paint(a, v) {
    fill.style.transform = 'scaleX(' + K.clamp(v / SPAN, 0, 1) + ')';
    ms.forEach(function (b, i) { var k = i + 1; b.classList.toggle('is-lit', a >= k); b.setAttribute('aria-pressed', a === k ? 'true' : 'false'); });
    endB.setAttribute('aria-pressed', a === SPAN ? 'true' : 'false');
    run.classList.toggle('is-end', a >= SPAN);
  }
  function goTo(a) {
    var ctx = st.ctx, from = cur;
    at = a; K.stop(st);
    if (K.live() && window.Motion && ctx && ctx.alive) {
      paint(a, from);
      K.drive(st, function (p) { cur = from + (a - from) * p; fill.style.transform = 'scaleX(' + K.clamp(cur / SPAN, 0, 1) + ')'; }, { stiffness: 120, damping: 20 });
    } else { cur = a; paint(a, a); }
  }
  function finish() { K.stop(st); token++; at = cur = SPAN; paint(SPAN, SPAN); }
  function counts(on, ctx) {
    var d = K.daysLeft(), nEl = $('.tt-n', s);
    $('.tt-date', s).textContent = today();
    if (on && ctx) ctx.count(nEl, d, countOpts(d)); else nEl.textContent = d;
  }

  Deck.on('move', {
    init: function () {
      run.addEventListener('click', function (e) {
        var b = e.target.closest('[data-k]'); if (!b) return;
        token++; goTo(+b.getAttribute('data-k'));
      });
    },
    enter: function (ctx) {
      st.ctx = ctx; K.stop(st);
      var my = ++token; at = cur = 0; paint(0, 0);
      if (!K.live()) { counts(false); finish(); return; }
      counts(true, ctx);
      for (var k = 1; k <= SPAN; k++) (function (k) {
        ctx.after(450 + (k - 1) * 380, function () { if (my === token) goTo(k); });
      })(k);
    },
    leave: function () { K.stop(st); token++; },
    settle: function () { counts(false); finish(); }
  });
})();

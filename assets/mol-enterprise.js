/* MOL Enterprise Philippines: slide 8, "Moving off Autocount". A calendar strip, October 2026 to March 2027. The Autocount subscription bar ends in December
   2026 (the client's own fact; the bar is solid to the end of November and dashed through December, because the exact day is a question for the call). Two builds:
     0  "Without a plan": the Odoo bar starts after Autocount has ended, January is an amber gap.
     1  "With a plan": the Odoo bar springs back to start before Autocount ends; the overlap is the parallel run; the four plan steps light in turn.
   The toggle (aria-pressed) and the right arrow drive the same build (Deck.go). Settle and the overview paint build 1. The Odoo bar is moved by a stored spring
   (BMK.drive, own writes), the Autocount bar draws in with a clip-path spring (no fades, fields or masks); every timer goes through ctx; BMK.live() is false under reduced motion and TV mode.
   Positions are illustrative: the strip says so, and no date beyond December 2026 is claimed. */
(function () {
  'use strict';
  var K = window.BMK, Deck = window.Deck;
  if (!K || !Deck) return;
  var s = document.getElementById('move'); if (!s) return;
  function $(q, r) { return (r || s).querySelector(q); }
  function $$(q, r) { return [].slice.call((r || s).querySelectorAll(q)); }

  var C = 188, OFF = 508;     // month column width in px; how far the Odoo bar sits to the right "without a plan" (starts 1 Feb instead of mid-November)
  var MONTHS = [['Oct', 2026], ['Nov', 2026], ['Dec', 2026], ['Jan', 2027], ['Feb', 2027], ['Mar', 2027]];
  var STEPS = [
    ['Export and map', 'Data out, accounts mapped'],
    ['Import and reconcile', 'Checked against Autocount'],
    ['Parallel run', 'Both systems, side by side'],
    ['One cut-over date', 'Fixed in the proposal']
  ];
  var CAP = [
    { i: 'alert', t: 'Without a plan, Odoo starts after Autocount has ended, and January has no system for your invoices and books.' },
    { i: 'check', t: 'With a plan, Odoo is already running in parallel when Autocount ends. The goal is no gap between systems.' }
  ];
  var LAB = [
    'Calendar, October 2026 to March 2027. Without a plan: the Autocount subscription ends in December 2026, Odoo starts after it, and January has a gap.',
    'Calendar, October 2026 to March 2027. With a plan: Odoo starts before the Autocount subscription ends in December 2026, and both run in parallel.'
  ];

  // today's place in the strip, as a percentage of the plot width (null outside Oct 2026 to Mar 2027, or where it would sit on the 31 December flag)
  function todayPct() {
    var t = new Date(); t.setHours(0, 0, 0, 0);
    var m = (t.getFullYear() - 2026) * 12 + t.getMonth() - 9;
    if (m < 0 || m > 5) return null;
    var dim = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(), pct = (m + (t.getDate() - 1) / dim) / 6 * 100;
    return pct > 28 && pct < 56 ? null : pct;
  }
  function todayLabel() { var t = new Date(); return t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }

  var h = K.kick('moving off autocount', 0) +
    '<h2 class="h-m bm-h2" data-in style="--d:80ms">Moving off Autocount: <span class="hl">start before it ends.</span></h2>' +
    '<div class="ml-tg" data-in style="--d:160ms"><span class="ml-tg-l">Two ways through December:</span>' +
    '<div class="ml-seg" role="group" aria-label="Show the move without a plan or with a plan">' +
    '<button type="button" data-k="0" aria-pressed="false">Without a plan</button><button type="button" data-k="1" aria-pressed="true">With a plan</button></div></div>';

  h += '<div class="ml-cal" role="img" aria-label="' + K.esc(LAB[1]) + '" data-in style="--d:240ms">' +
    '<div class="ml-mh" aria-hidden="true"><span>System</span>';
  MONTHS.forEach(function (m) { h += '<span><b>' + m[0] + '</b>' + m[1] + '</span>'; });
  h += '</div>' +
    '<div class="ml-lab" style="top:112px" aria-hidden="true">' + K.ico('database') + '<p><b>Autocount</b><small>your system today</small></p></div>' +
    '<div class="ml-lab" style="top:184px" aria-hidden="true">' + K.odoo('account', 26) + '<p><b>Odoo</b><small>the new system</small></p></div>' +
    '<div class="ml-plot is-plan" aria-hidden="true">' +
    '<div class="ml-band ml-par"><span class="ml-pill">' + K.ico('refresh') + 'Parallel run</span></div>' +
    '<div class="ml-band ml-gap"><span class="ml-pill">' + K.ico('alert') + 'January gap</span></div>' +
    '<div class="ml-bar ml-ac"><i class="ml-ac-s"></i><i class="ml-ac-d"></i><span><b>Subscription</b><small>expires December 2026</small></span></div>' +
    '<div class="ml-bar ml-ob"><span class="ml-odl">' + K.odoo('account', 30) + '</span><span><b>Odoo Accounting</b><small>+ BIR compliance services</small></span></div>' +
    '<div class="ml-ef"><em>31 Dec 2026 · e-invoicing date</em></div>';
  var tp = todayPct();
  if (tp != null) h += '<div class="ml-today" style="left:' + tp.toFixed(2) + '%"><em>Today · ' + todayLabel() + '</em></div>';
  h += '</div></div>';

  STEPS.forEach(function (t, i) {
    h += '<div class="ml-st" data-i="' + i + '" data-in style="--d:' + (320 + i * 80) + 'ms"><i>' + (i + 1) + '</i><b>' + K.esc(t[0]) + '</b><small>' + K.esc(t[1]) + '</small></div>';
  });
  h += '<div class="bm-bar" data-in style="--d:560ms"><p class="bm-cap ml-cap" aria-live="polite"></p></div>' +
    '<p class="illus bm-ill">' + K.ico('check') + 'Illustration only · December 2026 is your own date · every other date is fixed in the proposal after discovery</p>';
  var f = $('.s-foot'); if (f) f.insertAdjacentHTML('beforebegin', h); else s.insertAdjacentHTML('beforeend', h);
  $$('.h-m[data-in]').forEach(K.split);

  // the Odoo logo sits inside the bar on its own white tile: the label column already has one, so the bar keeps only the bar's copy
  var cal = $('.ml-cal'), plot = $('.ml-plot'), ac = $('.ml-ac'), ob = $('.ml-ob'), cap = $('.ml-cap'), btns = $$('.ml-seg button'), cards = $$('.ml-st');
  var st = { mo: [], ctx: null, n: 1, x: 0, tok: 0, bar: null, intro: null };

  function setX(x) { st.x = x; ob.style.transform = 'translateX(' + x + 'px)'; }
  function stopBar() { if (st.bar) { try { st.bar.stop(); } catch (e) { } st.bar = null; } }
  function caption(n, anim) {
    cap.innerHTML = K.ico(CAP[n].i) + '<span>' + K.esc(CAP[n].t) + '</span>';
    cap.classList.toggle('is-warn', n === 0);
    if (anim) { cap.classList.remove('bm-swap'); void cap.offsetWidth; cap.classList.add('bm-swap'); }
  }
  // lights the plan steps one after another (a stale callback does nothing once the build has changed)
  function lightSteps(ctx, tok, d0, gap) {
    cards.forEach(function (c, i) { c.classList.remove('is-lit'); ctx.after(d0 + i * gap, function () { if (tok === st.tok) c.classList.add('is-lit'); }); });
  }
  function paint(n, anim) {
    var go = !!(anim && K.live() && st.ctx && st.ctx.alive && window.Motion), changed = n !== st.n;
    st.n = n; st.tok++;
    btns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === n ? 'true' : 'false'); });
    cal.setAttribute('aria-label', LAB[n]);
    plot.classList.toggle('is-plan', n === 1);
    // the Odoo bar: one spring between its two start dates
    var to = n === 1 ? 0 : OFF, from = st.x;
    stopBar();
    if (go && from !== to) st.bar = K.drive(st, function (p) { setX(from + (to - from) * p); }, { stiffness: 125, damping: 21 });
    else setX(to);
    // the plan steps: lit in turn with a plan, dim without one
    if (n === 1 && go) lightSteps(st.ctx, st.tok, 380, 190);
    else cards.forEach(function (c) { c.classList.toggle('is-lit', n === 1); });
    if (!anim || changed) caption(n, go);
  }

  Deck.on('move', {
    init: function () {
      $('.ml-seg').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]'); if (!b) return;
        Deck.go(Deck.index, +b.getAttribute('data-k'));
      });
    },
    enter: function (ctx) {
      st.ctx = ctx; K.stop(st); stopBar(); st.tok++; st.intro = null;
      ac.style.clipPath = ''; ob.style.opacity = ''; plot.classList.remove('is-pre');
    },
    step: function (n, ctx, sl, first) {
      st.ctx = ctx;
      if (!first) { paint(n, true); return; }
      stopBar(); paint(n, false);
      if (!K.live() || !window.Motion) return;
      // arrival: the Autocount bar draws in, then the Odoo bar and the gap arrive, then (build 1) the plan steps light in turn
      var tok = st.tok;
      ac.style.clipPath = 'inset(0 100% 0 0)'; plot.classList.add('is-pre');
      if (n === 1) cards.forEach(function (c) { c.classList.remove('is-lit'); });
      ctx.after(420, function () { K.drive(st, function (p) { ac.style.clipPath = 'inset(0 ' + Math.max(0, 100 - p * 100).toFixed(2) + '% 0 0)'; }, { stiffness: 90, damping: 22 }); });
      ctx.after(1100, function () {
        plot.classList.remove('is-pre');
        if (tok !== st.tok) return;
        var to = st.x;
        K.drive(st, function (p) { setX(to + 190 * (1 - p)); ob.style.opacity = Math.min(1, p * 2.4); }, { stiffness: 120, damping: 20 });
        if (n === 1) lightSteps(ctx, tok, 500, 170);
      });
      ctx.after(2300, function () { ob.style.opacity = ''; });
    },
    leave: function () { K.stop(st); stopBar(); st.tok++; plot.classList.remove('is-pre'); ac.style.clipPath = ''; ob.style.opacity = ''; },
    settle: function () { K.stop(st); stopBar(); st.ctx = null; st.tok++; plot.classList.remove('is-pre'); ac.style.clipPath = ''; ob.style.opacity = ''; paint(1, false); }
  });
  paint(1, false);
})();

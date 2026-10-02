/* Odoo Accounting deck: the seven moves of the live session, on a sample Singapore company (Kestrel & Pine Pte Ltd).
   Each move: reset() clears it, intro() sets the scene and readies the button, act() performs it, final() is the
   finished state for print and the overview. Figures agree from move to move (see the notes on each slide). */
(function () {
  'use strict';
  var $ = OA.$, $$ = OA.$$, on = OA.on;
  function toast(s, v) { on($('.lw-toast', s), v); }
  function txt(s, sel, t) { var e = $(sel, s); if (e) e.textContent = t; }

  // 1 · the bank feed: 14 transactions arrive, the balance moves
  var GL0 = 110382.30, GL1 = 130407.90;
  function mv1Set(s, done) {
    txt(s, '[data-torec]', done ? '14' : '0');
    txt(s, '[data-gl]', OA.money(done ? GL1 : GL0));
    txt(s, '[data-sync]', done ? 'today, 07:30' : 'yesterday, 19:30');
    $('[data-act]', s).lastChild.textContent = 'Fetch Transactions';
    toast(s, done);
  }

  // 2 · bank matching: 13 lines by rule as they arrive, Lumen Trading's by suggestion
  function mv2Set(s, auto, me) {
    $$('[data-auto]', s).forEach(function (l) { l.classList.toggle('is-ok', auto); });
    on($('[data-more]', s), auto); $('[data-more]', s).style.opacity = auto ? 1 : 0;
    var m = $('[data-me]', s); m.classList.toggle('is-ok', me); m.classList.toggle('is-sel', !me);
    $('.br-inv', s).classList.toggle('is-paid', me);
    txt(s, '[data-due]', OA.money(me ? 0 : 6801.60));
    txt(s, '[data-left]', me ? '0' : auto ? '1' : '14');
    toast(s, me);
  }

  // 3 · a bill from its PDF: read, then every line filled from the vendor's past bills
  function mv3Set(s, filled, posted) {
    $$('[data-pv]', s).forEach(function (v) { v.classList.toggle('is-empty', !filled); v.classList.remove('is-new'); });
    $('[data-pred]', s).style.opacity = filled ? 1 : 0;
    $('.bl-pdf', s).classList.remove('is-scan');
    OA.sb(s, posted ? 1 : 0);
    txt(s, '[data-bill-no]', posted ? 'BILL/2026/10/0003' : 'Draft');
    txt(s, '[data-bill-t]', posted ? 'BILL/2026/10/0003' : 'Draft');
    toast(s, posted);
  }

  // 6 · the tax return: checks first, then Validate posts the closing entry
  function mv6Set(s, checked, validated) {
    $$('[data-ck]', s).forEach(function (c) { c.classList.toggle('is-ok', checked); });
    $('.trc', s).classList.toggle('is-on', checked);
    $$('[data-bx]', s).forEach(function (r) { r.classList.remove('is-lit'); });
    $$('[data-trs]', s).forEach(function (t) { var k = +t.dataset.trs; t.classList.toggle('is-done', validated && k === 0); t.classList.toggle('is-cur', validated ? k === 1 : k === 0); });
    toast(s, validated);
  }

  // 5 · the batch payment
  function mv5Set(s, paid) {
    on($('.pw', s), false); on($('.lv-veil', s), false);
    $$('[data-ps]', s).forEach(function (b) { b.textContent = paid ? 'In Payment' : 'Not Paid'; b.className = 'bdg ' + (paid ? 'bdg--info' : 'bdg--bad'); });
    $('[data-pay]', s).classList.remove('is-done');
    $$('[data-ps-k]', s).forEach(function (k) { k.classList.toggle('is-cur', +k.dataset.psK === (paid ? 1 : 0)); });
    toast(s, paid);
  }

  OA.start({
    moves: [
      { id: 'mv1', name: 'Bank feed', result: '14 transactions in',
        reset: function (s) { mv1Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(700, ready); },
        act: function (ctx, s, done) {
          var b = $('[data-act]', s); b.lastChild.textContent = 'Fetching…';
          ctx.count($('[data-torec]', s), 14, { from: 0, dur: 1300 });
          ctx.count($('[data-gl]', s), GL1, { from: GL0, dec: 2, pre: 'S$', dur: 1300 });
          ctx.after(1400, function () { mv1Set(s, true); done(); });
        },
        final: function (s) { mv1Set(s, true); } },

      { id: 'mv2', name: 'Bank matched', result: '14 of 14 matched',
        reset: function (s) { mv2Set(s, false, false); },
        intro: function (ctx, s, ready, quick) {
          var ls = $$('[data-auto]', s), left = $('[data-left]', s), t = quick ? 60 : 210;
          ls.forEach(function (l, i) { ctx.after(400 + i * t, function () { l.classList.add('is-ok'); left.textContent = String(13 - i); }); });
          ctx.after(400 + ls.length * t + 200, function () {
            var m = $('[data-more]', s); m.style.opacity = 1; left.textContent = '1'; OA.pop(m);
            ready();
          });
        },
        act: function (ctx, s, done) { ctx.after(150, function () { mv2Set(s, true, true); done(); }); },
        final: function (s) { mv2Set(s, true, true); } },

      { id: 'mv3', name: 'Bill from a PDF', result: 'read, nothing typed',
        reset: function (s) { mv3Set(s, false, false); },
        intro: function (ctx, s, ready, quick) {
          var pdf = $('.bl-pdf', s), vs = $$('[data-pv]', s);
          ctx.after(quick ? 50 : 400, function () { pdf.classList.add('is-scan'); });
          var t0 = quick ? 300 : 1700;
          ctx.after(t0, function () { $('[data-pred]', s).style.opacity = 1; });
          vs.forEach(function (v, i) { ctx.after(t0 + 120 + i * (quick ? 20 : 90), function () { v.classList.remove('is-empty'); v.classList.add('is-new'); }); });
          ctx.after(t0 + 300 + vs.length * (quick ? 20 : 90), ready);
        },
        act: function (ctx, s, done) {
          OA.sb(s, 1); txt(s, '[data-bill-no]', 'BILL/2026/10/0003'); txt(s, '[data-bill-t]', 'BILL/2026/10/0003');
          ctx.after(500, function () { $$('[data-pv]', s).forEach(function (v) { v.classList.remove('is-new'); }); toast(s, true); done(); });
        },
        final: function (s) { mv3Set(s, true, true); } },

      { id: 'mv4', name: 'Reminders', result: '6 payers reminded',
        reset: function (s) { $$('tbody tr', s).forEach(function (r) { r.classList.remove('is-sent'); }); on($('[data-mail]', s), false); toast(s, false); },
        intro: function (ctx, s, ready) { ctx.after(600, ready); },
        act: function (ctx, s, done) {
          var rs = $$('tbody tr', s);
          rs.forEach(function (r, i) { ctx.after(120 + i * 220, function () { r.classList.add('is-sent'); }); });
          ctx.after(220 + rs.length * 220, function () { on($('[data-mail]', s)); toast(s, true); done(); });
        },
        final: function (s) { $$('tbody tr', s).forEach(function (r) { r.classList.add('is-sent'); }); on($('[data-mail]', s)); toast(s, true); } },

      { id: 'mv5', name: 'Bills paid', result: '3 bills, one batch',
        reset: function (s) { mv5Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(600, ready); },
        act: function (ctx, s, done) {
          on($('.lv-veil', s)); on($('.pw', s));
          ctx.after(1500, function () { $('[data-pay]', s).classList.add('is-done'); });
          ctx.after(1900, function () { mv5Set(s, true); done(); });
        },
        final: function (s) { mv5Set(s, true); } },

      { id: 'mv6', name: 'GST return', result: 'Q3 validated',
        reset: function (s) { mv6Set(s, false, false); },
        intro: function (ctx, s, ready, quick) {
          var ck = $$('[data-ck]', s), t = quick ? 40 : 260;
          ck.forEach(function (c, i) { ctx.after(300 + i * t, function () { c.classList.add('is-ok'); }); });
          ctx.after(300 + ck.length * t, function () { $('.trc', s).classList.add('is-on'); });
          var rs = $$('[data-bx]', s), t0 = 300 + ck.length * t + 200;
          rs.forEach(function (r, i) { ctx.after(t0 + i * (quick ? 30 : 150), function () { r.classList.add('is-lit'); }); ctx.after(t0 + i * (quick ? 30 : 150) + 700, function () { r.classList.remove('is-lit'); }); });
          ctx.after(t0 + rs.length * (quick ? 30 : 150) + 200, ready);
        },
        act: function (ctx, s, done) { ctx.after(200, function () { mv6Set(s, true, true); done(); }); },
        final: function (s) { mv6Set(s, true, true); } },

      { id: 'mv7', name: 'Month locked', result: 'September closed',
        reset: function (s) { on($('.fr-lock', s), false); toast(s, false); },
        intro: function (ctx, s, ready) { ctx.after(700, ready); },
        act: function (ctx, s, done) { ctx.after(250, function () { on($('.fr-lock', s)); toast(s, true); done(); }); },
        final: function (s) { on($('.fr-lock', s)); toast(s, true); } }
    ],
    // the cover's bank lines tick to matched on a CSS loop; printed and in the overview they show matched
    cover: function () { $('#cover').classList.remove('is-settled'); },
    coverSettle: function (s) { s.classList.add('is-settled'); }
  });
})();

/* Odoo Sales deck: the seven moves of the live session, on a sample Singapore company (Kestrel & Pine Pte Ltd)
   selling a reception refresh to Sunbird Clinics. Each move: reset() clears it, intro() sets the scene and readies
   the button, act() performs it, final() is the finished state for print and the overview. Figures agree from move
   to move: S$18,220.44 with installation at 30%, S$18,318.54 at 35%, a S$5,000.00 deposit, S$13,318.54 still due. */
(function () {
  'use strict';
  var $ = OA.$, $$ = OA.$$, on = OA.on;
  function toast(s, v) { on($('.lw-toast', s), v); }
  function txt(s, sel, t) { var e = $(sel, s); if (e) e.textContent = t; }

  // 1 · the sales dashboard: To Confirm keeps only the quotations waiting for a yes
  function mv1Set(s, filtered) {
    $$('tbody tr', s).forEach(function (r) { r.classList.remove('is-out'); r.classList.toggle('is-gone', filtered && r.dataset.st === 'so'); });
    txt(s, '[data-facet]', filtered ? 'To Confirm' : 'My Quotations');
    toast(s, filtered);
  }

  // 2 · the template drops three clinics in
  function mv2Set(s, applied) {
    var em = $('[data-tpl-v]', s);
    em.textContent = applied ? 'Clinic reception refresh' : 'Choose a template…'; em.classList.toggle('is-set', applied);
    on($('[data-dd]', s), false);
    $('[data-lines]', s).classList.toggle('is-on', applied);
    $('[data-tot]', s).style.opacity = applied ? 1 : .25;
    toast(s, applied);
  }

  // 3 · margin 30% to 35%: installation S$390.00 to S$420.00 in each of the three clinics
  var T30 = { u: 16716.00, g: 1504.44, t: 18220.44 }, T35 = { u: 16806.00, g: 1512.54, t: 18318.54 };
  function mv3Set(s, set) {
    var T = set ? T35 : T30;
    txt(s, '[data-mg]', set ? '35.0%' : '30.0%');
    txt(s, '[data-price]', set ? '420.00' : '390.00');
    txt(s, '[data-amt]', OA.money(set ? 420 : 390));
    txt(s, '[data-t-u]', OA.money(T.u)); txt(s, '[data-t-g]', OA.money(T.g)); txt(s, '[data-t-t]', OA.money(T.t));
    $('[data-edit]', s).classList.toggle('is-set', set);
    $$('[data-sum]', s).forEach(function (e) { e.textContent = OA.money(set ? 5602 : 5572); });
    toast(s, set);
  }

  // 4 · the customer's phone: opened, signed, deposit paid
  function mv4Set(s, k) {
    $$('[data-po]', s).forEach(function (p) { p.classList.toggle('is-on', +p.dataset.po < k); });
    $('.po-sign', s).classList.toggle('is-on', k >= 2);
    on($('.po-paid', s), k >= 3); $('.po-screen', s).classList.toggle('is-paid', k >= 3);
    txt(s, '[data-sig-st]', k >= 2 ? 'Signed by Grace Lim' : 'Waiting'); $('[data-sig-st]', s).classList.toggle('ok', k >= 2);
    txt(s, '[data-pay-st]', k >= 3 ? 'S$5,000.00 paid' : 'Waiting'); $('[data-pay-st]', s).classList.toggle('ok', k >= 3);
    OA.sb(s, k >= 3 ? 2 : 1);
    toast(s, k >= 3);
  }

  // 5 · the order invoiced, deposit deducted
  function mv5Set(s, done) {
    on($('[data-inv]', s), done);
    $$('[data-iv]', s).forEach(function (c) { c.textContent = done ? '3 of 3' : '0 of 3'; });
    $('[data-inv-n] b', s).textContent = done ? '2' : '1';
    $('[data-inv-n]', s).lastChild.textContent = done ? ' Invoices' : ' Invoice';
    toast(s, done);
  }

  // 6 · marketplace orders arrive; the walnut monitor riser's stock goes back out
  var MK0 = { sp: 'Synced 07:00 · 4 today', lz: 'Synced 07:00 · 6 today', tt: 'Synced 07:00 · 3 today', st: 'Monitor riser: 48 on hand' };
  var MK1 = { sp: 'Synced 10:42 · 5 today', lz: 'Synced 10:42 · 7 today', tt: 'Synced 10:42 · 4 today', st: 'Monitor riser: 46 on hand, sent' };
  function mv6Set(s, synced) {
    $$('tr.mk-new', s).forEach(function (r) { r.classList.toggle('is-wait', !synced); r.classList.remove('is-in'); });
    var M = synced ? MK1 : MK0; $$('.mk-c [data-mk]', s).forEach(function (e) { e.textContent = M[e.dataset.mk]; });
    toast(s, synced);
  }

  // 7 · commissions on what is paid: the S$5,000.00 deposit counts the day it lands
  function mv7Set(s, up) {
    var jt = $('[data-jt]', s), mg = $('.cm-r--mgr', s);
    txt(s, '[data-paid]', up ? 'S$41,280' : 'S$36,280'); txt(s, '[data-com]', up ? 'S$1,238.40' : 'S$1,088.40');
    $('[data-bar]', s).style.setProperty('--p', up ? .688 : .605);
    txt(s, '[data-tpaid]', up ? 'S$109,615' : 'S$104,615'); txt(s, '[data-mcom]', up ? 'S$2,192.30' : 'S$2,092.30');
    $('[data-tbar]', s).style.setProperty('--p', up ? .664 : .634);
    jt.classList.toggle('is-up', up); mg.classList.toggle('is-up', up);
    toast(s, up);
  }

  OA.start({
    moves: [
      { id: 'mv1', name: 'Dashboard', result: '6 quotes to confirm',
        reset: function (s) { mv1Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(700, ready); },
        act: function (ctx, s, done) {
          $$('tbody tr', s).forEach(function (r) { if (r.dataset.st === 'so') r.classList.add('is-out'); });
          ctx.after(600, function () { mv1Set(s, true); done(); });
        },
        final: function (s) { mv1Set(s, true); } },

      { id: 'mv2', name: 'From a template', result: '3 clinics, 9 lines',
        reset: function (s) { mv2Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(600, function () { on($('[data-dd]', s)); ready(); }); },
        act: function (ctx, s, done) { ctx.after(250, function () { mv2Set(s, true); done(); }); },
        final: function (s) { mv2Set(s, true); } },

      { id: 'mv3', name: 'Price by margin', result: 'margin 35%',
        reset: function (s) { mv3Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(700, ready); },
        act: function (ctx, s, done) {
          ctx.count($('[data-price]', s), 420, { from: 390, dec: 2, dur: 700 });
          ctx.count($('[data-t-t]', s), T35.t, { from: T30.t, dec: 2, pre: 'S$', dur: 900 });
          ctx.after(950, function () { mv3Set(s, true); done(); });
        },
        final: function (s) { mv3Set(s, true); } },

      { id: 'mv4', name: 'Signed and paid', result: 'S$5,000 deposit',
        reset: function (s) { mv4Set(s, 0); },
        intro: function (ctx, s, ready) { ctx.after(500, function () { mv4Set(s, 1); }); ctx.after(1100, ready); },
        act: function (ctx, s, done) {
          ctx.after(100, function () { mv4Set(s, 2); });
          ctx.after(1900, function () { mv4Set(s, 3); done(); });
        },
        final: function (s) { mv4Set(s, 3); } },

      { id: 'mv5', name: 'Invoiced', result: 'S$13,318.54 due',
        reset: function (s) { mv5Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(700, ready); },
        act: function (ctx, s, done) { ctx.after(300, function () { mv5Set(s, true); done(); }); },
        final: function (s) { mv5Set(s, true); } },

      { id: 'mv6', name: 'Marketplaces', result: '3 orders, stock sent',
        reset: function (s) { mv6Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(700, ready); },
        act: function (ctx, s, done) {
          var rs = $$('tr.mk-new', s).reverse();
          rs.forEach(function (r, i) { ctx.after(200 + i * 380, function () { r.classList.remove('is-wait'); r.classList.add('is-in'); OA.pop(r, 400); }); });
          ctx.after(300 + rs.length * 380, function () { mv6Set(s, true); $$('tr.mk-new', s).forEach(function (r) { r.classList.add('is-in'); }); done(); });
          ctx.after(2600 + rs.length * 380, function () { $$('tr.mk-new', s).forEach(function (r) { r.classList.remove('is-in'); }); });
        },
        final: function (s) { mv6Set(s, true); } },

      { id: 'mv7', name: 'Commissions', result: '+S$150 on the deposit',
        reset: function (s) { mv7Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(700, ready); },
        act: function (ctx, s, done) { ctx.after(200, function () { mv7Set(s, true); done(); }); },
        final: function (s) { mv7Set(s, true); } }
    ],
    cover: function () { $('#cover').classList.remove('is-settled'); },
    coverSettle: function (s) { s.classList.add('is-settled'); }
  });
})();

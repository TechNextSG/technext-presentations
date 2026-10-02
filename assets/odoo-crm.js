/* Odoo CRM deck: the seven moves of the live session, on a sample Singapore company (Kestrel & Pine Pte Ltd) and its
   Projects team, following the Sunbird Clinics deal. Each move: reset() clears it, intro() sets the scene and readies
   the button, act() performs it, final() is the finished state for print and the overview. Figures agree from move
   to move: S$18,000 expected, 41.2% then 63.0% (prorated S$7,416 then S$11,340), October S$55,840 then S$62,500. */
(function () {
  'use strict';
  var $ = OA.$, $$ = OA.$$, on = OA.on;
  function toast(s, v) { on($('.lw-toast', s), v); }
  function txt(s, sel, t) { var e = $(sel, s); if (e) e.textContent = t; }

  // 1 · Grace Lim wrote twice: one conversion merges both leads into an opportunity
  function mv1Set(s, merged) {
    on($('.lv-veil', s), false); on($('.dlg', s), false); $('[data-ok]', s).classList.remove('is-done');
    var a = $('[data-sb1]', s), b = $('[data-sb2]', s);
    a.classList.toggle('is-one', merged); a.classList.toggle('is-sel', !merged);
    b.classList.toggle('is-merged', merged); b.classList.toggle('is-sel', !merged);
    $('[data-sim]', s).classList.toggle('is-on', !merged);
    toast(s, merged);
  }

  // 2 · Lead Sourcing: ten healthcare companies become leads
  function mv2Set(s, k) {   // 0 the pipeline, 1 the Lead Sourcing window open, 2 generated
    $('.kb', s).classList.toggle('is-dlg', k === 1);
    on($('.dlg--mine', s), k === 1);
    on($('[data-ban]', s), k === 2);
    toast(s, k === 2);
  }

  // 3 · rotation: Jia Hui +4, Marco +3 (his limit is 20), Aisha +3, Daniel out of rotation
  var M3 = { jt: [18, 4], mr: [16, 3], ak: [21, 3], dl: [4, 0] };
  function mv3Set(s, done) {
    $$('.tm-r[data-m]', s).forEach(function (r) {
      var m = M3[r.dataset.m], n = $('[data-n]', r); if (n) n.textContent = String(m[0] + m[1]);
      r.classList.toggle('is-up', done && m[1] > 0);
    });
    txt(s, '[data-wait]', done ? 'none' : '10 leads');
    toast(s, done);
  }

  // 4 · the call marked done; the activity plan schedules the next two steps
  function mv4Set(s, done) {
    $('[data-ac=call]', s).classList.toggle('is-done', done);
    on($('[data-fb]', s), done);
    $$('.ac--next', s).forEach(function (a) { on(a, done); });
    toast(s, done);
  }

  // 5 · Proposition: the predictive probability moves
  function mv5Set(s, moved) {
    txt(s, '[data-prob]', moved ? '63.0%' : '41.2%'); $('[data-prob]', s).classList.toggle('is-up', moved);
    txt(s, '[data-pro]', moved ? 'S$11,340.00' : 'S$7,416.00'); $('[data-pro]', s).classList.toggle('is-up', moved);
    $('[data-gauge]', s).style.setProperty('--p', moved ? .63 : .412);
    txt(s, '[data-w=stage]', moved ? 'Proposition' : 'Qualified'); $('[data-w=stage]', s).classList.toggle('is-up', moved);
    $('.lw-sb--act', s).classList.toggle('is-moved', moved);
    toast(s, moved);
  }

  // 6 · New Quotation: S00057, linked to the opportunity
  function mv6Set(s, made) {
    on($('[data-oq]', s), made);
    $('[data-qn] b', s).textContent = made ? '1' : '0';
    $('[data-qn]', s).lastChild.textContent = made ? ' Quotation' : ' Quotations';
    toast(s, made);
  }

  // 7 · won: October's forecast counts Sunbird in full
  function mv7Set(s, won) {
    $('.fc-opp', s).classList.toggle('is-won', won);
    txt(s, '[data-p7]', won ? '100%' : '63.0%');
    $('[data-won]', s).style.setProperty('--h', won ? .609 : .351);
    $('[data-pro]', s).style.setProperty('--h', won ? .284 : .446); $('[data-pro]', s).style.setProperty('--b', won ? .609 : .351);
    txt(s, '[data-tot]', won ? 'S$62,500' : 'S$55,840');
    toast(s, won);
  }

  OA.start({
    moves: [
      { id: 'mv1', name: 'Leads merged', result: '2 leads, 1 deal',
        reset: function (s) { mv1Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(800, ready); },
        act: function (ctx, s, done) {
          on($('.lv-veil', s)); on($('.dlg', s));
          ctx.after(1400, function () { $('[data-ok]', s).classList.add('is-done'); });
          ctx.after(1800, function () { mv1Set(s, true); done(); });
        },
        final: function (s) { mv1Set(s, true); } },

      { id: 'mv2', name: 'Lead Sourcing', result: '10 companies found',
        reset: function (s) { mv2Set(s, 0); },
        intro: function (ctx, s, ready) { ctx.after(700, function () { mv2Set(s, 1); }); ctx.after(1300, ready); },
        act: function (ctx, s, done) { ctx.after(500, function () { mv2Set(s, 2); done(); }); },
        final: function (s) { mv2Set(s, 2); } },

      { id: 'mv3', name: 'Rotation', result: '10 leads shared out',
        reset: function (s) { mv3Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(700, ready); },
        act: function (ctx, s, done) {
          var rs = $$('.tm-r[data-m]', s);
          rs.forEach(function (r, i) {
            ctx.after(150 + i * 300, function () { var m = M3[r.dataset.m]; if (!m[1]) return; r.classList.add('is-up'); ctx.count($('[data-n]', r), m[0] + m[1], { from: m[0], dur: 500 }); });
          });
          ctx.after(300 + rs.length * 300, function () { mv3Set(s, true); done(); });
        },
        final: function (s) { mv3Set(s, true); } },

      { id: 'mv4', name: 'Next steps', result: '2 steps booked',
        reset: function (s) { mv4Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(700, ready); },
        act: function (ctx, s, done) {
          $('[data-ac=call]', s).classList.add('is-done'); on($('[data-fb]', s));
          $$('.ac--next', s).forEach(function (a, i) { ctx.after(500 + i * 350, function () { on(a); }); });
          ctx.after(1300, function () { toast(s, true); done(); });
        },
        final: function (s) { mv4Set(s, true); } },

      { id: 'mv5', name: 'Win probability', result: '41% → 63%',
        reset: function (s) { mv5Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(800, ready); },
        act: function (ctx, s, done) {
          $('.lw-sb--act', s).classList.add('is-moved');
          ctx.count($('[data-prob]', s), 63.0, { from: 41.2, dec: 1, suf: '%', dur: 1100 });
          ctx.count($('[data-pro]', s), 11340, { from: 7416, dec: 2, pre: 'S$', dur: 1100 });
          $('[data-gauge]', s).style.setProperty('--p', .63);
          ctx.after(1200, function () { mv5Set(s, true); done(); });
        },
        final: function (s) { mv5Set(s, true); } },

      { id: 'mv6', name: 'Quotation', result: 'S00057 linked',
        reset: function (s) { mv6Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(700, ready); },
        act: function (ctx, s, done) { ctx.after(300, function () { mv6Set(s, true); done(); }); },
        final: function (s) { mv6Set(s, true); } },

      { id: 'mv7', name: 'Won', result: 'October +S$6,660',
        reset: function (s) { mv7Set(s, false); },
        intro: function (ctx, s, ready) { ctx.after(700, ready); },
        act: function (ctx, s, done) {
          ctx.count($('[data-tot]', s), 62500, { from: 55840, pre: 'S$', dur: 1000 });
          ctx.after(80, function () { $('.fc-opp', s).classList.add('is-won'); txt(s, '[data-p7]', '100%'); $('[data-won]', s).style.setProperty('--h', .609); $('[data-pro]', s).style.setProperty('--h', .284); $('[data-pro]', s).style.setProperty('--b', .609); });
          ctx.after(1100, function () { mv7Set(s, true); done(); });
        },
        final: function (s) { mv7Set(s, true); } }
    ],
    cover: function () { $('#cover').classList.remove('is-settled'); },
    coverSettle: function (s) { s.classList.add('is-settled'); }
  });
})();

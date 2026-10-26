/* Laguna Metts Corporation: slide 8, "Checking the localisation fit". A table of six Philippine requirements. Column A is the client's current
   ERP: every row starts as a "To confirm" chip, and the presenter clicks it to cycle Has it, Partly, Missing, To confirm (button, aria-pressed,
   marks in sessionStorage under BM.slug, so they survive the meeting; print starts clean). Column B is Odoo 20 PH localisation: ticks only for what
   Odoo lists. Nothing is ever pre-filled, and share copies (body[data-shared]) are read-only. The ticks land one by one on enter.
   Every timer goes through ctx, every Motion control is stored and stopped in leave, settle paints the finished state. */
(function () {
  'use strict';
  var K = window.BMK, Deck = window.Deck;
  if (!K || !Deck) return;
  var s = document.getElementById('move'); if (!s) return;
  function $(q, r) { return (r || s).querySelector(q); }
  function $$(q, r) { return [].slice.call((r || s).querySelectorAll(q)); }

  var ROWS = [
    { n: 'VAT 12% and the quarterly return (2550Q)', i: 'calculator', o: 'VAT 12% with a 2550Q summary' },
    { n: '2307 withholding certificates', i: 'file', o: '2307 certificates on supplier bills' },
    { n: 'SLSP / SAWT / QAP DAT files', i: 'database', o: 'SLSP, SAWT and QAP with DAT exports' },
    { n: 'Books of accounts for CAS', i: 'layers', o: 'Book of Accounts for CAS and CBA' },
    { n: 'PH invoice fields and series', i: 'receipt', o: 'Invoices set up for BIR requirements' },
    { n: 'Peso reporting alongside other currencies', i: 'globe', o: 'Multi-currency in Accounting' }
  ];
  var ORDER = ['unk', 'has', 'part', 'miss'];
  var LABEL = { unk: 'To confirm', has: 'Has it', part: 'Partly', miss: 'Missing' };
  var SHARED = document.body.hasAttribute('data-shared');

  var h = K.kick('localisation fit', 0) + '<h2 class="h-m bm-h2" data-in style="--d:80ms">Six checks, <span class="hl">confirmed together.</span></h2>' +
    '<div class="lm-t" data-i role="table" aria-label="Localisation fit: your current ERP against Odoo 20 PH localisation">' +
    '<div class="lm-hd" role="row" data-in style="--d:160ms"><div role="columnheader"><span><b>What the BIR needs</b><small>six points to check</small></span></div>' +
    '<div role="columnheader"><span><b>Your current ERP</b><small>to confirm with you</small></span></div>' +
    '<div class="lm-hdo" role="columnheader">' + K.odoo('account', 30) + '<span><b>Odoo 20 PH localisation</b><small>what Odoo lists</small></span></div></div>';
  ROWS.forEach(function (r, i) {
    h += '<div class="lm-r" role="row" data-r="' + i + '" data-in style="--d:' + (220 + i * 70) + 'ms">' +
      '<div class="lm-c lm-c-n" role="rowheader"><span class="lm-ri">' + K.ico(r.i) + '</span><b>' + K.esc(r.n) + '</b></div>' +
      '<div class="lm-c lm-c-a" role="cell"><button type="button" class="lm-chip" data-r="' + i + '" data-s="unk" aria-pressed="false"><span class="lm-g" aria-hidden="true"><em class="lm-gq">?</em><em class="lm-gc">' + K.ico('check') + '</em><em class="lm-gx">' + K.ico('x') + '</em></span><b>To confirm</b><span class="lm-cy" aria-hidden="true">' + K.ico('refresh') + '</span></button></div>' +
      '<div class="lm-c lm-c-o" role="cell"><span class="lm-ck" aria-hidden="true">' + K.ico('check') + '</span><b>' + K.esc(r.o) + '</b></div></div>';
  });
  h += '</div>' +
    '<div class="bm-bar lm-bar" data-in style="--d:700ms"><p class="lm-n" aria-live="polite"><b>0</b><span>of 6 confirmed</span></p>' +
    '<div class="lm-lg" aria-label="Tally of your answers"><span data-k="has"><i></i>Has it <b>0</b></span><span data-k="part"><i></i>Partly <b>0</b></span><span data-k="miss"><i></i>Missing <b>0</b></span></div>' +
    '<button type="button" class="bm-btn lm-clear">' + K.ico('refresh') + '<span>Clear all</span></button></div>' +
    '<p class="illus bm-ill">' + K.ico('check') + 'Your ERP column is blank until you confirm it · Odoo column as Odoo 20 PH localisation lists it · coverage confirmed with your accountant</p>';
  var f = $('.s-foot'); if (f) f.insertAdjacentHTML('beforebegin', h); else s.insertAdjacentHTML('beforeend', h);
  $$('.h-m[data-in]').forEach(K.split);

  var chips = $$('.lm-chip'), rows = $$('.lm-r'), ticks = $$('.lm-ck'), bar = $('.lm-bar'), clear = $('.lm-clear');
  var st = { mo: [], ctx: null }, fit = K.load('fit');
  if (SHARED) { chips.forEach(K.readOnly); K.readOnly(clear); }

  function val(i) { var v = Deck.print || SHARED ? '' : fit[i]; return ORDER.indexOf(v) > 0 ? v : 'unk'; }
  function paint(changed) {
    var n = 0, c = { has: 0, part: 0, miss: 0 };
    chips.forEach(function (b, i) {
      var v = val(i);
      b.setAttribute('data-s', v); rows[i].setAttribute('data-s', v);
      b.setAttribute('aria-pressed', v === 'unk' ? 'false' : 'true');
      b.setAttribute('aria-label', ROWS[i].n + ': your current ERP, ' + LABEL[v] + (SHARED ? '' : '. Click to change.'));
      $('b', b).textContent = LABEL[v];
      if (v !== 'unk') { n++; c[v]++; }
    });
    $('.lm-n b', bar).textContent = n;
    ['has', 'part', 'miss'].forEach(function (k) { $('.lm-lg [data-k="' + k + '"] b', bar).textContent = c[k]; });
    bar.classList.toggle('is-full', n === ROWS.length);
    // aria-disabled, not disabled: pressing Clear all must not drop keyboard focus
    if (n === 0 || SHARED) clear.setAttribute('aria-disabled', 'true'); else clear.removeAttribute('aria-disabled');
    if (changed != null && K.live() && window.Motion && st.ctx && st.ctx.alive) {
      var g = $('.lm-g', chips[changed]), nb = $('.lm-n b', bar);
      K.drive(st, function (p) { g.style.transform = 'scale(' + (.6 + .4 * p) + ')'; nb.style.transform = 'scale(' + (1 + .22 * Math.max(0, 1 - p)) + ')'; }, { stiffness: 420, damping: 16 });
    } else { chips.forEach(function (b) { $('.lm-g', b).style.transform = ''; }); $('.lm-n b', bar).style.transform = ''; }
  }
  function flat() { ticks.forEach(function (t) { t.style.opacity = ''; t.style.transform = ''; }); }

  Deck.on('move', {
    init: function () {
      $('.lm-t', s).addEventListener('click', function (e) {
        if (SHARED) return;
        var b = e.target.closest('.lm-chip'); if (!b) return;
        var i = +b.getAttribute('data-r'), v = ORDER[(ORDER.indexOf(val(i)) + 1) % ORDER.length];
        if (v === 'unk') delete fit[i]; else fit[i] = v;
        K.save('fit', fit); paint(i);
      });
      clear.addEventListener('click', function () { if (SHARED || clear.getAttribute('aria-disabled') === 'true') return; fit = {}; K.save('fit', fit); paint(null); });
      paint(null);
    },
    enter: function (ctx) {
      st.ctx = ctx; K.stop(st); fit = K.load('fit'); paint(null);
      if (K.live() && window.Motion) {
        ticks.forEach(function (t, i) {
          t.style.opacity = 0;
          ctx.after(820 + i * 130, function () {
            K.drive(st, function (p) { t.style.opacity = Math.min(1, p * 3); t.style.transform = 'scale(' + (.4 + .6 * p) + ')'; }, { stiffness: 340, damping: 16 });
          });
        });
      } else flat();
    },
    leave: function () { K.stop(st); flat(); chips.forEach(function (b) { $('.lm-g', b).style.transform = ''; }); $('.lm-n b', bar).style.transform = ''; },
    settle: function () { K.stop(st); fit = K.load('fit'); paint(null); flat(); }
  });
})();

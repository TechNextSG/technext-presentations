/* Company profile, short (5 slides). Every animated slide has a settle hook: print and the overview show it finished. */
(function () {
  var $ = Deck.$, $$ = Deck.$$;

  /* ---------------------------------------------------------------- 1 · cover: the four figures count up as they land */
  Deck.on('cover', {
    enter: function (ctx, s) {
      $$('.cp-figs li', s).forEach(function (li, i) {
        var el = $('[data-count]', li);
        li.classList.remove('is-on'); el.textContent = '0';
        ctx.after(520 + i * 90, function () { li.classList.add('is-on'); ctx.count(el, +el.dataset.count, { from: 0, dur: 1100 }); });
      });
    },
    settle: function (s) {
      $$('.cp-figs li', s).forEach(function (li) { li.classList.add('is-on'); var el = $('[data-count]', li); el.textContent = el.dataset.count; });
    }
  });

  /* ---------------------------------------------------------------- 2 · what we do: entries fan out into the BIR outputs */
  Deck.on('what', {
    enter: function (ctx, s) {
      var box = $('.cp-forms', s), rows = $$('.cp-out li', s);
      box.classList.remove('is-run'); rows.forEach(function (li) { li.classList.remove('is-on', 'is-ok'); });
      ctx.after(700, function () { box.classList.add('is-run'); });
      rows.forEach(function (li, i) {
        ctx.after(1050 + i * 170, function () { li.classList.add('is-on'); });
        ctx.after(1350 + i * 170, function () { li.classList.add('is-ok'); });
      });
      // the process column: each manual step flips to automated, top to bottom
      $$('.cp-proc li', s).forEach(function (li, i) {
        li.classList.remove('is-auto');
        ctx.after(1500 + i * 260, function () { li.classList.add('is-auto'); });
      });
    },
    settle: function (s) {
      $('.cp-forms', s).classList.add('is-run');
      $$('.cp-out li', s).forEach(function (li) { li.classList.add('is-on', 'is-ok'); });
      $$('.cp-proc li', s).forEach(function (li) { li.classList.add('is-auto'); });
    }
  });

  /* ---------------------------------------------------------------- 3 · services: steps through until clicked */
  function pickSvc(s, b) {
    $$('.cp-svc button', s).forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
    var say = $('.cp-say', s);
    $('.cp-code', say).textContent = b.dataset.k;
    $('.cp-name', say).textContent = b.textContent;
    $('.cp-txt', say).textContent = b.dataset.t;
    say.classList.remove('is-swap'); void say.offsetWidth; say.classList.add('is-swap');
  }
  Deck.on('services', {
    init: function (s) {
      s.addEventListener('click', function (e) {
        var b = e.target.closest('.cp-svc button'); if (!b) return;
        s._manual = true; $('.cp-say', s).setAttribute('aria-live', 'polite'); pickSvc(s, b);
      });
    },
    enter: function (ctx, s) {
      var all = $$('.cp-svc button', s), i = 0;
      s._manual = false; $('.cp-say', s).setAttribute('aria-live', 'off'); pickSvc(s, all[0]);
      if (!Deck.reduce) ctx.every(2600, function () { if (s._manual) return; i = (i + 1) % all.length; pickSvc(s, all[i]); });
    },
    settle: function (s) { if (!$('.cp-svc button.is-on', s)) pickSvc(s, $('.cp-svc button', s)); $('.cp-say', s).classList.remove('is-swap'); }
  });

})();

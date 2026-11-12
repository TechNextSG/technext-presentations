/* For coaching and training businesses (6 slides). Every JS-finished slide has a settle hook: print and the overview show it finished. */
(function () {
  var $ = Deck.$, $$ = Deck.$$;

  /* ---------------------------------------------------------------- 2 · journey: Today / With TechNext */
  function setWith(s, on) {
    s.classList.toggle('is-with', on);
    $$('.cb-seg button', s).forEach(function (b) { b.setAttribute('aria-pressed', String((b.dataset.v === 'with') === on)); });
  }
  Deck.on('journey', {
    init: function (s) {
      $$('.cb-steps li', s).forEach(function (li, i) { li.style.setProperty('--i', i); });
      s.addEventListener('click', function (e) {
        var b = e.target.closest('.cb-seg button'); if (!b) return;
        s._manual = true; setWith(s, b.dataset.v === 'with');
      });
    },
    enter: function (ctx, s) {
      s._manual = false; setWith(s, false);
      ctx.after(2600, function () { if (!s._manual) setWith(s, true); });
    },
    settle: function (s) { setWith(s, true); }
  });

  /* ---------------------------------------------------------------- 3 · one event: the status drives four outputs */
  var OUT = [
    { web: 'Early-bird rate · Register', form: 'Open · early-bird rate applied', bot: '"Yes, early-bird places are open."', post: 'Early bird closes soon' },
    { web: 'Regular rate · Register', form: 'Open · regular rate', bot: '"Yes, places are open."', post: 'Places still open' },
    { web: 'Sold out · Join the waitlist', form: 'Closed · waitlist on', bot: '"It is full; I can add you to the waitlist."', post: 'Sold out, thank you' },
    { web: 'Moved to Past events', form: 'Closed', bot: '"That one has ended. The next date is…"', post: 'Thank you for coming' }
  ];
  function paint(s, k, swap) {
    $$('.cb-status button', s).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.s === k)); });
    $$('.cb-outs [data-o]', s).forEach(function (el) {
      el.textContent = OUT[k][el.dataset.o];
      var li = el.closest('li');
      li.classList.remove('is-swap');
      if (swap) { void li.offsetWidth; li.classList.add('is-swap'); }
    });
  }
  Deck.on('event', {
    init: function (s) {
      s.addEventListener('click', function (e) {
        var b = e.target.closest('.cb-status button'); if (!b) return;
        s._manual = true; paint(s, +b.dataset.s, true);
      });
    },
    enter: function (ctx, s) {
      var k = 0; s._manual = false;
      s.classList.remove('is-run'); paint(s, 0, false);
      ctx.after(600, function () { s.classList.add('is-run'); });
      ctx.every(2400, function () { if (s._manual) return; k = (k + 1) % OUT.length; paint(s, k, true); });
    },
    settle: function (s) { s.classList.add('is-run'); paint(s, 0, false); }
  });
})();

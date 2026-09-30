/* Portfolio: the client directory (filter + detail, cycling until someone clicks). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var DATA = {}; (window.PF || []).forEach(function (c) { DATA[c.slug] = c; });
  var CHECK = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var ARROW = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function fill(s, slug) {
    var c = DATA[slug]; if (!c) return;
    var m = $('[data-pd-mono]', s); m.textContent = c.mono; m.style.setProperty('--c', c.c);
    var st = c.status === 'Live' ? '' : c.status === 'In progress' ? ' pf-st--progress' : ' pf-st--proposal';
    $('[data-pd-name]', s).innerHTML = esc(c.name) + '<span class="pf-st' + st + '">' + esc(c.status) + '</span>';
    $('[data-pd-where]', s).textContent = c.ind + ' · ' + c.where;
    $('[data-pd-svc]', s).innerHTML = c.svc.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
    $('[data-pd-did]', s).innerHTML = c.did.map(function (x) { return '<li>' + CHECK + '<span>' + esc(x) + '</span></li>'; }).join('');
    $('[data-pd-links]', s).innerHTML = c.links.map(function (l) { return '<a href="' + l[1] + '" target="_blank" rel="noopener">' + esc(l[0]) + ARROW + '</a>'; }).join('');
    $$('.pf-c', s).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.slug === slug ? 'true' : 'false'); });
  }

  Deck.on('clients', {
    init: function (s) { fill(s, 'casa'); },
    enter: function (ctx, s) {
      var cards = $$('.pf-c', s), card = $('.pd-card', s), auto = true, cur = 0, f = 'all';
      function visible() { return cards.filter(function (b) { return !b.classList.contains('is-dim'); }); }
      function show(b) {
        if (!b) return; cur = cards.indexOf(b);
        card.classList.add('is-swap');
        ctx.after(200, function () { fill(s, b.dataset.slug); card.classList.remove('is-swap'); });
      }
      fill(s, cards[0].dataset.slug);
      ctx.every(4600, function () {
        if (!auto) return; var v = visible(); if (!v.length) return;
        var i = v.indexOf(cards[cur]); show(v[(i + 1) % v.length]);
      });
      ctx.on($('.pf-grid', s), 'click', function (e) { var b = e.target.closest('.pf-c'); if (b) { auto = false; show(b); } });
      ctx.on($('.pf-seg', s), 'click', function (e) {
        var b = e.target.closest('button'); if (!b) return; f = b.dataset.f;
        $$('.pf-seg button', s).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        cards.forEach(function (c) {
          var on = f === 'all' || (f === 'live' ? c.dataset.status === 'live' : c.dataset.svc.split(' ').indexOf(f) >= 0);
          c.classList.toggle('is-dim', !on);
        });
        var v = visible(); if (v.length && v.indexOf(cards[cur]) < 0) show(v[0]);
      });
    }
  });
})();

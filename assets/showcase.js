/* Marketing Showcase / Portfolio: screenshots load as the presenter gets near them; the wall filters and opens sites. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var root = document.querySelector('.deck');

  // ?print (the PDFs) shows every page from the top: it takes the small top-only crop where there is one
  var PRINT = /[?&]print/.test(location.search);
  function load(s) { if (!s) return; $$('img[data-src]', s).forEach(function (im) { im.src = (PRINT && im.dataset.psrc) || im.dataset.src; im.removeAttribute('data-src'); }); }
  function around(i) { for (var k = i - 1; k <= i + 2; k++) load(Deck.slides[k]); }
  load(Deck.slides[0]); load(Deck.slides[1]);
  root.addEventListener('deck:slide', function (e) { around(e.detail.index); });
  root.addEventListener('deck:overview', function () { Deck.slides.forEach(load); });
  if (PRINT) Deck.slides.forEach(load);
  addEventListener('beforeprint', function () { Deck.slides.forEach(load); });

  // hover-scroll distance for the page cards, once each picture is in
  function pan(img) { var v = img.parentNode; img.style.setProperty('--pan', Math.max(0, img.offsetHeight - v.offsetHeight) + 'px'); }
  document.addEventListener('load', function (e) { var t = e.target; if (t.tagName === 'IMG' && t.closest('.cw-view')) pan(t); }, true);

  function open(url) { var w = window.open(url, '_blank', 'noopener'); if (w) w.opener = null; }
  function filterSeg(seg, items, attr) {
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', seg).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      items.forEach(function (it) { it.classList.toggle('is-dim', b.dataset.f !== 'all' && attr(it) !== b.dataset.f); });
    });
  }

  Deck.on('gallery', {
    init: function (s) {
      var tiles = $$('.mz-t', s), seg = $('.mz-seg', s);
      filterSeg(seg, tiles, function (t) { return t.dataset.k; });
      filterSeg(seg, $$('.mz-n', s), function (n) { return n.dataset.f; });
      // the counts under the wall filter it too; the second click on the same count shows all again
      $$('.mz-n', s).forEach(function (n) {
        n.addEventListener('click', function () {
          var on = $('button[aria-pressed="true"]', seg), f = on && on.dataset.f === n.dataset.f ? 'all' : n.dataset.f;
          $('button[data-f="' + f + '"]', seg).click();
        });
      });
      s.addEventListener('click', function (e) {
        var t = e.target.closest('.mz-t'); if (!t || t.classList.contains('is-dim')) return;
        if (t.dataset.go) Deck.goId(t.dataset.go); else open(t.dataset.url);
      });
    }
  });
  Deck.on('pitch', {
    init: function (s) {
      var cards = $$('.cw-c', s);
      cards.forEach(function (c) { c.dataset.k = /proposal/i.test($('small', c).textContent) ? 'prop' : 'show'; });
      filterSeg($('.pc-seg', s), cards, function (c) { return c.dataset.k; });
    }
  });
})();

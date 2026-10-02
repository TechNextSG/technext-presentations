/* Odoo app series: the live session shared by the Accounting, Sales and CRM decks.
   A deck script calls OA.start({ moves: [...], cover: fn }) with its seven moves; each move is one slide (id mv1..mv7,
   data-group="live", data-steps="1"): step 0 sets the scene and readies the highlighted Odoo button, step 1 (or a click
   on that button) performs the task. The session log on every move slide shows what Odoo has done so far.
   Every screen is a simplified, illustrative Odoo 20 view with a sample company's data. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var EASE = 'cubic-bezier(.2,.8,.2,1)';
  function idx(s) { return Deck.slides.indexOf(s); }
  function on(el, v) { if (el) el.classList.toggle('is-on', v !== false); }
  function money(n, cur) { return Deck.money(n, cur); }
  // smooth re-layout: elements glide from where they were to where `mutate` puts them
  function flip(els, mutate, dur) {
    var first = els.map(function (e) { return Deck.rect(e); });
    mutate();
    var k = Deck.scale;
    els.forEach(function (e, i) {
      if (!e.isConnected || !e.animate) return;
      var l = Deck.rect(e), dx = (first[i].left - l.left) / k, dy = (first[i].top - l.top) / k;
      if (Math.abs(dx) + Math.abs(dy) < .5) return;
      e.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: dur || 800, easing: EASE });
    });
  }
  // the status bar of a form: highlight stage n
  function sb(s, n) { $$('.lw-sb i', s).forEach(function (i) { i.classList.toggle('is-cur', +i.dataset.sb === n); }); }
  function pop(el, d) { if (el && el.animate && !Deck.reduce) el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: d || 500, easing: EASE }); }
  var CHECK = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  var OA = { $: $, $$: $$, on: on, flip: flip, sb: sb, pop: pop, money: money, EASE: EASE, moves: [] };

  /* ---------------------------------------------------------------- the session log */
  function buildLog(s, k) {
    var ol = $('.mv-log', s); if (!ol) return;
    ol.innerHTML = OA.moves.map(function (m, i) {
      return '<li data-i="' + i + '"><button type="button" data-go="' + m.id + '" aria-label="Move ' + (i + 1) + ': ' + m.name + '"><i>' + (i + 1) + '</i><span>' + m.name +
        '<small>' + m.result + '</small></span></button></li>';
    }).join('');
    $$('li', ol).forEach(function (li, i) { li.classList.toggle('is-done', i < k); li.classList.toggle('is-cur', i === k); if (i < k) $('i', li).innerHTML = CHECK; });
    ol.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) { e.stopPropagation(); Deck.goId(b.dataset.go); } });
  }
  function markLog(s, k, done) {
    var li = $$('.mv-log li', s)[k]; if (!li) return;
    li.classList.toggle('is-done', done); $('i', li).innerHTML = done ? CHECK : String(k + 1);
  }

  /* ---------------------------------------------------------------- the seven moves */
  // reset a move without its transitions, so its finished state never flashes as the slide comes in
  function snap(s, fn) { s.classList.add('oa-snap'); fn(); void s.offsetWidth; s.classList.remove('oa-snap'); }
  function wire(m, k) {
    Deck.on(m.id, {
      init: function (s) {
        buildLog(s, k);
        // a click on the highlighted Odoo button performs the move, like pressing →
        s.addEventListener('click', function (e) { if (e.target.closest('[data-act]') && +s.dataset.cur === 0) Deck.go(idx(s), 1); });
        if (m.init) m.init(s);
        m.final(s); markLog(s, k, true);
      },
      step: function (n, ctx, s, first) {
        var act = $('[data-act]', s);
        function ready() { if (act) act.classList.add('is-ready'); }
        if (first) {
          snap(s, function () { m.reset(s); if (act) act.classList.remove('is-ready', 'is-done'); markLog(s, k, false); });
          if (n === 0) m.intro(ctx, s, ready); else { m.final(s); if (act) act.classList.add('is-done'); markLog(s, k, true); }
          return;
        }
        if (n === 1) { if (act) { act.classList.remove('is-ready'); act.classList.add('is-done'); } m.act(ctx, s, function () { markLog(s, k, true); }); }
        else { m.reset(s); if (act) act.classList.remove('is-ready', 'is-done'); markLog(s, k, false); m.intro(ctx, s, ready, true); }
      },
      settle: function (s) { m.reset(s); m.final(s); var act = $('[data-act]', s); if (act) { act.classList.remove('is-ready'); act.classList.add('is-done'); } markLog(s, k, true); }
    });
  }

  /* ---------------------------------------------------------------- 2 · what it replaces */
  Deck.on('replaces', {
    step: function (n, ctx, s) {
      var rp = $('.rp', s), b = $('[data-rp-n]', s), on1 = n >= 1;
      rp.classList.toggle('is-on', on1);
      var from = +b.dataset.from, to = +b.dataset.to;
      if (on1) ctx.count(b, to, { from: from, dur: 900 }); else b.textContent = from;
      $('.rp-meter', s).classList.toggle('rp-meter--ok', on1);
    },
    settle: function (s) { $('.rp', s).classList.add('is-on'); var b = $('[data-rp-n]', s); b.textContent = b.dataset.to; $('.rp-meter', s).classList.add('rp-meter--ok'); }
  });

  /* ---------------------------------------------------------------- new in Odoo 20: filter, and a jump to the move that showed it */
  Deck.on('new20', {
    init: function (s) {
      var seg = $('.seg', s);
      if (seg) seg.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        $$('button', seg).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        $$('.nw-r', s).forEach(function (r) { r.classList.toggle('is-dim', b.dataset.v !== 'all' && r.dataset.t !== b.dataset.v); });
      });
      s.addEventListener('click', function (e) { var b = e.target.closest('.nw-seen'); if (b) { e.stopPropagation(); Deck.goId(b.dataset.go); } });
    }
  });

  /* ---------------------------------------------------------------- Singapore, the Philippines, Vietnam */
  function lcPick(s, c) {
    $$('.lc-pin', s).forEach(function (p) { p.setAttribute('aria-pressed', p.dataset.c === c ? 'true' : 'false'); });
    $$('.lc-c', s).forEach(function (p) { p.classList.toggle('is-hi', p.dataset.c === c); });
  }
  Deck.on('local', {
    init: function (s) {
      s.addEventListener('click', function (e) { var b = e.target.closest('.lc-pin'); if (b) { e.stopPropagation(); lcPick(s, b.dataset.c); } });
      lcPick(s, 'sg');
    },
    settle: function (s) { lcPick(s, 'sg'); }
  });

  /* ---------------------------------------------------------------- how TechNext sets it up: the phases light up in turn */
  Deck.on('setup', {
    enter: function (ctx, s) {
      var ps = $$('.su-p', s); ps.forEach(function (p) { p.classList.remove('is-on'); });
      ps.forEach(function (p, i) { ctx.after(500 + i * 650, function () { p.classList.add('is-on'); }); });
    },
    settle: function (s) { $$('.su-p', s).forEach(function (p) { p.classList.add('is-on'); }); }
  });

  OA.start = function (cfg) {
    OA.moves = cfg.moves;
    cfg.moves.forEach(wire);
    if (cfg.cover) Deck.on('cover', { enter: cfg.cover, settle: cfg.coverSettle || function () {} });
  };
  window.OA = OA;
})();

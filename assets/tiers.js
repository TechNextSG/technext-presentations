/* Tier-list decks: shared behaviour. Tier cards and add-ons are static HTML (data attributes);
   window.TIERS holds the explorer and finder data. A small plan (tier + add-ons) is shared across
   slides and turned into an email, a WhatsApp message or clipboard text on the plan slide. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var T = window.TIERS, plan = { tier: null, add: [] };
  var NAMES = $$('#tiers .tr').map(function (c) { return $('h3', c).textContent; });
  function idx(s) { return Deck.slides.indexOf(s); }

  // a toast at the top of the stage for "added to your plan"
  var toast = document.createElement('div'); toast.className = 'tt-toast'; toast.setAttribute('role', 'status'); document.querySelector('.stage').appendChild(toast);
  var toastT = 0;
  function say(t) { toast.innerHTML = t; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 2400); }

  function pickTier(k, quiet) {
    plan.tier = k;
    $$('#tiers .tr').forEach(function (c, i) { c.classList.toggle('is-picked', i === k); var b = $('.tr-go', c); if (b) b.textContent = i === k ? 'In your plan' : 'Choose ' + NAMES[i]; });
    paintPlan();
    if (!quiet) say('<b>' + NAMES[k] + '</b> is in your plan. Add extras on slide ' + (idx($('#addons')) + 1) + ', or review it on slide ' + (idx($('#plan')) + 1) + '.');
  }
  function toggleAdd(id) {
    var i = plan.add.indexOf(id);
    if (i >= 0) plan.add.splice(i, 1); else plan.add.push(id);
    paintPlan();
  }
  function addName(id) { var a = $('#addons .ad[data-id="' + id + '"] b'); return a ? a.textContent : id; }
  function summary() {
    var t = plan.tier == null ? null : NAMES[plan.tier];
    var adds = plan.add.map(addName);
    return { tier: t, adds: adds };
  }
  function and(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function paintPlan() {
    $$('#addons .ad').forEach(function (a) { a.setAttribute('aria-pressed', plan.add.indexOf(a.dataset.id) >= 0 ? 'true' : 'false'); });
    var n = plan.add.length, bar = $('#addons [data-ad-count]');
    if (bar) bar.innerHTML = n ? '<b>' + n + '</b> add-on' + (n > 1 ? 's' : '') + ' in your plan' : 'Click the add-ons you want in your plan';
    var P = $('#plan'); if (!P) return;
    $$('.pl-tiers button', P).forEach(function (b, i) { b.setAttribute('aria-pressed', i === plan.tier ? 'true' : 'false'); });
    $$('.pl-adds button', P).forEach(function (b) { b.setAttribute('aria-pressed', plan.add.indexOf(b.dataset.id) >= 0 ? 'true' : 'false'); });
    var s = summary(), txt;
    if (!s.tier && !s.adds.length) txt = 'Pick a starting tier, then add what you need.';
    else txt = (s.tier ? 'The <b>' + s.tier + '</b> tier' : 'A tier to be confirmed') + (s.adds.length ? ', plus ' + and(s.adds.map(function (a) { return '<b>' + a + '</b>'; })) : '') + '.';
    $('[data-pl-sum]', P).innerHTML = txt;
    var body = 'Hello TechNext,\n\nI would like a quotation for ' + T.subject + ':\n\nTier: ' + (s.tier || 'not sure yet') + '\nAdd-ons: ' + (s.adds.length ? s.adds.join(', ') : 'none yet') +
      '\n\nCompany:\nName:\nBest time for a discovery call:\n';
    $('[data-pl-mail]', P).href = 'mailto:sales@technext.asia?subject=' + encodeURIComponent('Quotation request: ' + T.name + (s.tier ? ' · ' + s.tier : '')) + '&body=' + encodeURIComponent(body);
    $('[data-pl-wa]', P).href = 'https://wa.me/6588396998?text=' + encodeURIComponent('Hello TechNext, I would like a quotation for ' + T.subject + '. Tier: ' + (s.tier || 'not sure yet') + '. Add-ons: ' + (s.adds.length ? s.adds.join(', ') : 'none yet') + '.');
    P._text = 'TechNext ' + T.name + ' plan\nTier: ' + (s.tier || 'not sure yet') + '\nAdd-ons: ' + (s.adds.length ? s.adds.join(', ') : 'none') + '\nFinal pricing is confirmed per quotation · sales@technext.asia';
  }

  /* ---------------------------------------------------------------- the four tiers */
  Deck.on('tiers', {
    init: function (s) {
      $$('.tr', s).forEach(function (c, i) { var b = $('.tr-go', c); if (b) b.textContent = 'Choose ' + NAMES[i]; });
      s.addEventListener('click', function (e) { var b = e.target.closest('.tr-go'); if (b) pickTier($$('.tr', s).indexOf(b.closest('.tr'))); });
    }
  });

  /* ---------------------------------------------------------------- explorer: one tier at a time */
  function xpItems(k) { return $$('#tiers .tr')[k] ? $$('li', $$('#tiers .tr')[k]).map(function (li) { return li.textContent.trim(); }) : []; }
  function xpRender(s, k, animate, ctx) {
    s._k = k;
    var tag = $('.tr-tag', $$('#tiers .tr')[k]).textContent, pop = $$('#tiers .tr')[k].classList.contains('is-pop');
    $('[data-xp-n]', s).textContent = 'Tier ' + (k + 1) + ' of 4';
    $('[data-xp-name]', s).innerHTML = NAMES[k] + (pop ? ' <span class="tr-pop">' + $('#tt-star').innerHTML + 'Most popular</span>' : '');
    $('[data-xp-tag]', s).textContent = tag;
    var ul = $('.xp-list', s), items = xpItems(k), check = $('#tt-check').innerHTML;
    ul.innerHTML = items.map(function (t) { return '<li>' + check + '<span>' + t + '</span></li>'; }).join('');
    var lis = $$('li', ul);
    if (animate) lis.forEach(function (li, i) { ctx.after(60 + i * 70, function () { li.classList.add('is-on'); }); }); else lis.forEach(function (li) { li.classList.add('is-on'); });
    var m = T.meter[k]; $('.xp-bar', s).style.setProperty('--m', m[0]); $('[data-xp-m]', s).textContent = m[1];
    $$('.xp-stops button', s).forEach(function (b, i) { b.classList.toggle('is-cur', i === k); b.classList.toggle('is-past', i < k); });
    $('.xp-fill', s).style.setProperty('--k', k);
    xpViz(s, k, animate, ctx);
  }
  // the picture: app icons in a ring (ERP) or the tier's six items around the brand (marketing)
  var VX = 320, VY = 235;
  function ring(n, r, a0) { var p = []; for (var i = 0; i < n; i++) { var a = (a0 || -Math.PI / 2) + i / n * Math.PI * 2; p.push([VX + Math.cos(a) * r, VY + Math.sin(a) * r * .8]); } return p; }
  function xpViz(s, k, animate, ctx) {
    var nodes = $$('.xp-node', s), svg = $('.xp-svg', s);
    if (T.viz === 'apps') {
      var on = nodes.filter(function (n) { return n.dataset.t.split(' ').indexOf(String(k)) >= 0; });
      var r = on.length <= 1 ? 170 : on.length <= 3 ? 185 : on.length <= 5 ? 200 : 215, pos = ring(on.length, r, on.length === 1 ? -Math.PI / 2 : -Math.PI / 2);
      nodes.forEach(function (n) {
        var j = on.indexOf(n);
        if (n.dataset.l0) $('b', n).textContent = k === 0 ? n.dataset.l0 : n.dataset.l;
        if (j < 0) { n.classList.add('is-out'); n.style.transform = 'translate(' + (VX - 52) + 'px,' + (VY - 40) + 'px) scale(.6)'; }
        else { n.classList.remove('is-out'); n.style.transform = 'translate(' + (pos[j][0] - 52).toFixed(1) + 'px,' + (pos[j][1] - 40).toFixed(1) + 'px)'; }
      });
      svg.innerHTML = on.map(function (n, j) { return '<path d="M' + VX + ',' + VY + ' L' + pos[j][0].toFixed(1) + ',' + pos[j][1].toFixed(1) + '"/>'; }).join('');
    } else {
      var set = T.nodes[k], pos6 = ring(6, 205, -Math.PI / 2);
      svg.innerHTML = pos6.map(function (p) { return '<path d="M' + VX + ',' + VY + ' L' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + '"/>'; }).join('');
      nodes.forEach(function (n, j) {
        n.style.transform = 'translate(' + (pos6[j][0] - 52).toFixed(1) + 'px,' + (pos6[j][1] - 40).toFixed(1) + 'px)';
        function fill() { $('span', n).innerHTML = $('#tt-' + set[j][0]).innerHTML; $('b', n).textContent = set[j][1]; n.classList.remove('is-out'); }
        if (!animate) { fill(); return; }
        n.classList.add('is-out'); ctx.after(260 + j * 50, fill);
      });
    }
  }
  Deck.on('explore', {
    init: function (s) { xpRender(s, 2, false); },
    enter: function (ctx, s) {
      var auto = true, k = 0;
      xpRender(s, 0, true, ctx);
      ctx.every(4200, function () { if (auto) { k = (s._k + 1) % 4; xpRender(s, k, true, ctx); } });
      ctx.on($('.xp-stops', s), 'click', function (e) { var b = e.target.closest('button'); if (b) { auto = false; xpRender(s, +b.dataset.k, true, ctx); } });
      ctx.on($('.xp-stops', s), 'keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
        auto = false; xpRender(s, Math.max(0, Math.min(3, s._k + d)), true, ctx); e.preventDefault();
        var b = $$('.xp-stops button', s)[s._k]; if (b) b.focus();
      });
      ctx.on($('[data-xp-pick]', s), 'click', function () { pickTier(s._k); });
    },
    settle: function (s) { xpRender(s, s._k || 0, false); }
  });

  /* ---------------------------------------------------------------- fit finder */
  function ffResult(s, ans, ctx) {
    var k = 0, why = [];
    T.finder.forEach(function (q, i) { var o = q.opts[ans[i]]; if (o.min > k) k = o.min; });
    T.finder.forEach(function (q, i) { var o = q.opts[ans[i]]; if (o.min === k && o.why) why.push(o.why); });
    if (!why.length) why.push(T.finderDefault);
    var res = $('.ff-res', s);
    function paint() {
      $('[data-ff-name]', s).textContent = NAMES[k];
      $('[data-ff-tag]', s).textContent = $('.tr-tag', $$('#tiers .tr')[k]).textContent;
      $('.ff-why', s).innerHTML = why.map(function (w) { return '<li>' + $('#tt-check').innerHTML + '<span>' + w + '</span></li>'; }).join('');
      $$('.ff-ladder span', s).forEach(function (x, i) { x.classList.toggle('is-on', i === k); x.classList.toggle('is-past', i < k); });
      res.classList.remove('is-swap');
    }
    s._rec = k;
    if (!ctx) { paint(); return; }
    res.classList.add('is-swap'); ctx.after(240, paint);
  }
  Deck.on('finder', {
    init: function (s) {
      $$('.ff-q', s).forEach(function (q, i) {
        var seg = $('.seg', q);
        seg.innerHTML = T.finder[i].opts.map(function (o, j) { return '<button type="button" aria-pressed="' + (j === 0) + '" data-q="' + i + '" data-o="' + j + '">' + o.label + '</button>'; }).join('');
        $('p b', q).textContent = T.finder[i].q;
      });
      s._ans = T.finder.map(function () { return 0; });
      ffResult(s, s._ans);
    },
    enter: function (ctx, s) {
      var demo = T.finderDemo, d = 0, auto = true;
      function set(ans) { ffSet(s, ans, ctx); }
      set(demo[0]);
      ctx.every(4600, function () { if (auto) { d = (d + 1) % demo.length; set(demo[d]); } });
      ctx.on($('.ff-qs', s), 'click', function (e) {
        var b = e.target.closest('button[data-q]'); if (!b) return;
        auto = false; s._user = true; var a = s._ans.slice(); a[+b.dataset.q] = +b.dataset.o; set(a);
      });
      ctx.on($('[data-ff-use]', s), 'click', function () { pickTier(s._rec); });
    },
    // print and the overview: a worked example (the second demo), or the answers someone picked
    settle: function (s) { ffSet(s, s._user ? s._ans : (T.finderDemo[1] || T.finderDemo[0])); }
  });
  function ffSet(s, ans, ctx) {
    s._ans = ans.slice();
    $$('.ff-q .seg button', s).forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.o === s._ans[+b.dataset.q] ? 'true' : 'false'); });
    ffResult(s, s._ans, ctx);
  }

  /* ---------------------------------------------------------------- add-ons */
  Deck.on('addons', {
    init: function (s) { s.addEventListener('click', function (e) { var a = e.target.closest('.ad'); if (a) toggleAdd(a.dataset.id); }); paintPlan(); }
  });

  /* ---------------------------------------------------------------- the plan */
  Deck.on('plan', {
    init: function (s) {
      var adds = $$('#addons .ad');
      $('.pl-adds', s).innerHTML = adds.map(function (a) { return '<button type="button" data-id="' + a.dataset.id + '" aria-pressed="false">' + $('#tt-plus').innerHTML + $('b', a).textContent + '</button>'; }).join('');
      $('.pl-tiers', s).innerHTML = NAMES.map(function (n, i) { return '<button type="button" data-k="' + i + '" aria-pressed="false">' + n + '</button>'; }).join('');
      s.addEventListener('click', function (e) {
        var t = e.target.closest('.pl-tiers button'); if (t) { pickTier(+t.dataset.k, true); return; }
        var a = e.target.closest('.pl-adds button'); if (a) { toggleAdd(a.dataset.id); return; }
        if (e.target.closest('[data-pl-copy]')) {
          var txt = s._text, done = function () { var c = $('.pl-copied', s); c.classList.add('is-on'); setTimeout(function () { c.classList.remove('is-on'); }, 1800); };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done); else done();
        }
      });
      paintPlan();
    },
    enter: function (ctx, s) {
      // an empty plan starts from the popular tier so the page is never blank
      if (plan.tier == null) pickTier(popTier(), true);
      paintPlan();
    },
    // print and the overview: the plan as it opens, from the popular tier, without choosing it on the tier cards
    settle: function () {
      if (plan.tier != null) { paintPlan(); return; }
      plan.tier = popTier(); paintPlan(); plan.tier = null;
    }
  });
  function popTier() { return Math.max(0, $$('#tiers .tr').findIndex(function (c) { return c.classList.contains('is-pop'); })); }
})();

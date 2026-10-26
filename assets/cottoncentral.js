/* Cotton Central, Inc.: BIR e-invoicing in Odoo. Slide behaviour. Every order, customer, TIN and amount in the demos is sample data,
   labelled on its slide. Every slide whose finished state comes from JS has a settle hook (overview, print, PDF). */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  function num(n) { return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function peso(n) { return '₱' + num(n); }
  function seg(root, fn) {
    function set(v, quiet) {
      $$('button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      if (!quiet) fn(v);
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    return set;
  }
  function swap(el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }
  function stepText(spec, n) { var out = ''; spec.split('|').forEach(function (p) { var i = p.indexOf(':'); if (+p.slice(0, i) <= n) out = p.slice(i + 1); }); return out; }

  // jump links: the cover agenda
  stage.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]'); if (!a) return;
    e.preventDefault(); Deck.goId(a.dataset.go);
  });

  /* ---------------------------------------------------------------- 3 · the rules */
  var RULE = {
    rr: ['RR 26-2025', 'Sets the date: covered taxpayers issue compliant e-invoices on or before 31 December 2026.'],
    rmc: ['RMC 98-2026', 'Issued 22 September 2026, it sets the working rules: the permit, the certification, corrections and downtime.'],
    pti: ['Permit to Issue', 'A covered business needs its PTI before issuing any e-invoice. Branches on different systems may need their own.'],
    dl: ['31 Dec 2026', 'From this date, covered taxpayers issue compliant e-invoices. Your accountant confirms whether it applies to you.'],
    cert: ['EIS Certification', 'Completed within six months of the PTI: the system sends the required sales data to the BIR\'s EIS.']
  };
  var DEADLINE = new Date(2026, 11, 31);
  function daysLeft() { var t = new Date(); t.setHours(0, 0, 0, 0); return Math.max(0, Math.round((DEADLINE - t) / 864e5)); }
  Deck.on('rules', {
    init: function (s) {
      s._show = function (k, quiet) {
        $$('.cc-tl-n', s).forEach(function (n) { n.classList.toggle('is-on', n.dataset.k === k); });
        $('.cc-rl-t', s).textContent = RULE[k][0]; $('.cc-rl-x', s).textContent = RULE[k][1];
        if (!quiet) swap($('.cc-rl-card', s));
      };
      $('.cc-tl', s).addEventListener('click', function (e) { var n = e.target.closest('.cc-tl-n'); if (!n) return; s._held = true; s._show(n.dataset.k); });
      $('.cc-days-n', s).textContent = daysLeft();
    },
    enter: function (ctx, s) {
      s._held = false; s._show('rr', true);
      ctx.count($('.cc-days-n', s), daysLeft(), { from: 365, dur: 1200 });
      var seq = ['rmc', 'pti', 'dl', 'cert', 'rr'], i = 0;
      ctx.after(2200, function () { ctx.every(2600, function () { if (s._held || i >= seq.length) return false; s._show(seq[i]); i++; }); });
    },
    settle: function (s) { s._show('dl', true); $('.cc-days-n', s).textContent = daysLeft(); }
  });

  /* ---------------------------------------------------------------- 4 · who is covered */
  var GROUP = {
    ecom: ['E-commerce sellers', 'Named in the rules whatever their size. Cotton Central sells on its own site and on four marketplaces, so this is the group to check first.'],
    lts: ['Large Taxpayers Service', 'Taxpayers handled by the BIR\'s Large Taxpayers Service are covered. Your accountant knows if you are one.'],
    large: ['Large taxpayers', 'Taxpayers classed as large under the Ease of Paying Taxes Act (RA 11976) and RR 8-2024.'],
    cas: ['CAS or CBA users', 'Businesses on a computerised accounting system or books with e-invoicing or other invoicing software.'],
    micro: ['Micro taxpayers', 'Exempt from mandatory e-invoicing. If this is you, the deadline does not apply, though clean invoicing still helps.']
  };
  Deck.on('covered', {
    init: function (s) {
      s._show = function (k, quiet) {
        $$('.cc-g', s).forEach(function (g) { g.classList.toggle('is-on', g.dataset.g === k); });
        $('.cc-cv-t', s).textContent = GROUP[k][0]; $('.cc-cv-x', s).textContent = GROUP[k][1];
        if (!quiet) swap($('.cc-cv-x', s));
      };
      $('.cc-cv-list', s).addEventListener('click', function (e) { var g = e.target.closest('.cc-g'); if (!g) return; s._held = true; s._show(g.dataset.g); });
    },
    enter: function (ctx, s) {
      s._held = false; s._show('ecom', true);
      var seq = ['lts', 'large', 'cas', 'micro', 'ecom'], i = 0;
      ctx.after(3200, function () { ctx.every(2400, function () { if (s._held || i >= seq.length) return false; s._show(seq[i]); i++; }); });
    },
    settle: function (s) { s._show('ecom', true); }
  });

  /* ---------------------------------------------------------------- 5 · five channels, one set of books (sample orders) */
  var CH = {
    web: ['cottoncentral.com', '#3167CA', 'Your shop can move to Odoo eCommerce, where a paid order becomes an invoice in the same database, or keep its platform and send orders over. We compare both.'],
    shp: ['Shopee', '#EB6834', 'Not a standard Odoo app: orders come in through a third-party connector or a daily import, with fees and payouts booked against them.'],
    lzd: ['Lazada', '#1E4691', 'Not a standard Odoo app: a third-party connector or a daily import. Who invoices the buyer, you or the platform, is for your accountant to confirm.'],
    eda: ['edamama', '#1BAF7A', 'We check what edamama gives you for orders and payouts, then choose a connector or an import into Odoo.'],
    tik: ['TikTok', '#1F1F3D', 'Not a standard Odoo app: a third-party connector or a daily import, tested with a sample week of your TikTok Shop orders.']
  };
  var ORDERS = [['shp', 'Sample buyer 01', 1400], ['web', 'Sample buyer 02', 865], ['lzd', 'Sample buyer 03', 2150], ['tik', 'Sample buyer 04', 499],
    ['shp', 'Sample buyer 05', 1120], ['eda', 'Sample buyer 06', 1785], ['web', 'Sample buyer 07', 640], ['tik', 'Sample buyer 08', 998],
    ['lzd', 'Sample buyer 09', 1345], ['shp', 'Sample buyer 10', 720], ['eda', 'Sample buyer 11', 2390], ['shp', 'Sample buyer 12', 1060]];
  var FIRST = 1471, SHOW = 7;
  function rowHtml(i, isNew) {
    var o = ORDERS[i], c = CH[o[0]];
    return '<div class="cc-od-r' + (isNew ? ' is-new' : '') + '"><b>INV/2026/' + String(FIRST + i).padStart(5, '0') + '</b><span class="src" style="--c:' + c[1] + '">' + c[0].replace('cottoncentral.com', 'Web shop') + '</span><span>' + o[1] + '</span><span class="n">' + peso(o[2]) + '</span><span class="st">Posted</span></div>';
  }
  function paintOrders(s, n, isNew) {
    var rows = [], counts = { web: 0, shp: 0, lzd: 0, eda: 0, tik: 0 }, tot = 0;
    for (var i = 0; i < n; i++) { counts[ORDERS[i][0]]++; tot += ORDERS[i][2]; }
    for (var j = n - 1; j >= Math.max(0, n - SHOW); j--) rows.push(rowHtml(j, isNew && j === n - 1));
    $('.cc-od-rows', s).innerHTML = rows.join('');
    $$('.cc-s', s).forEach(function (b) { var k = counts[b.dataset.c]; $('.cc-s-n', b).textContent = k + (k === 1 ? ' order' : ' orders'); });
    $('.cc-od-c', s).textContent = n; $('.cc-od-t', s).textContent = peso(tot);
    if (isNew && n) { var b = $('.cc-s[data-c="' + ORDERS[n - 1][0] + '"]', s); b.classList.remove('is-ping'); void b.offsetWidth; b.classList.add('is-ping'); }
  }
  Deck.on('channels', {
    init: function (s) {
      var btn = $('.cc-play', s);
      s._stop = function () { s._run = (s._run || 0) + 1; btn.classList.remove('is-on'); $('span', btn).textContent = 'Play a day of orders'; };
      s._play = function () {
        var run = (s._run || 0) + 1, n = 0; s._run = run;
        btn.classList.add('is-on'); $('span', btn).textContent = 'Playing…';
        paintOrders(s, 0);
        s._ctx.every(650, function () {
          if (s._run !== run) return false;
          n++; paintOrders(s, n, true);
          if (n >= ORDERS.length) { s._stop(); return false; }
        });
      };
      s._how = function (k, quiet) {
        $$('.cc-s', s).forEach(function (b) { b.classList.toggle('is-on', b.dataset.c === k); });
        $('.cc-how-t', s).textContent = k ? CH[k][0] : 'How orders get into Odoo';
        $('.cc-how-x', s).textContent = k ? CH[k][2] : 'Your web shop can run on Odoo eCommerce, or send orders over. Marketplaces come in through a connector or a daily import. We test which works for each channel.';
        if (!quiet) swap($('.cc-how-x', s));
      };
      btn.addEventListener('click', function () { if (btn.classList.contains('is-on')) s._stop(); else s._play(); });
      $('.cc-src', s).addEventListener('click', function (e) { var b = e.target.closest('.cc-s'); if (b) s._how(b.dataset.c); });
    },
    enter: function (ctx, s) { s._ctx = ctx; s._stop(); s._how(null, true); paintOrders(s, 0); ctx.after(900, function () { s._play(); }); },
    leave: function (s) { s._stop(); },
    settle: function (s) { s._how(null, true); paintOrders(s, ORDERS.length); }
  });

  /* ---------------------------------------------------------------- 6 · one invoice, start to finish */
  var NO = 'INV/2026/01482';
  function paintInv(s, n) {
    var doc = $('.cc-doc', s); doc.dataset.s = n;
    $$('.cc-st li', s).forEach(function (li) { var k = +li.dataset.k; li.classList.toggle('is-on', k === n); li.classList.toggle('is-done', k < n); });
    $('.cc-doc-no', s).textContent = n ? NO : 'Draft invoice';
    $('.cc-doc-st', s).textContent = n ? 'Posted' : 'Draft';
    $('.cc-doc-url', s).textContent = 'Accounting · Invoices · ' + (n ? NO : 'Draft');
    $('.cc-lockmsg', s).classList.toggle('is-on', n >= 1);
    $('.cc-cn', s).classList.toggle('is-on', n >= 3);
    $('.cc-b-post', s).disabled = n >= 1;
    $('.cc-b-cn', s).disabled = n >= 3;
    var w = $('.cc-why-x', s), t = stepText(w.dataset.t, n);
    if (w.textContent !== t) { w.textContent = t; swap(w); }
    if (n === 2) shake(s);
  }
  function shake(s) { var m = $('.cc-lockmsg', s); m.classList.remove('is-shake'); void m.offsetWidth; m.classList.add('is-shake'); }
  Deck.on('invoice', {
    init: function (s) {
      $('.cc-b-post', s).addEventListener('click', function () { Deck.go(Deck.index, 1); });
      $('.cc-b-edit', s).addEventListener('click', function () {
        if (Deck.step >= 1) shake(s);
        else { var w = $('.cc-why-x', s); w.textContent = 'Still a draft: edit away. Once you confirm, it locks.'; swap(w); }
      });
      $('.cc-b-cn', s).addEventListener('click', function () { Deck.go(Deck.index, 3); });
      $('.cc-b-reset', s).addEventListener('click', function () { Deck.go(Deck.index, 0); });
    },
    step: function (n, ctx, s) { paintInv(s, n); },
    settle: function (s) { paintInv(s, 3); $('.cc-lockmsg', s).classList.remove('is-shake'); }
  });

  /* ---------------------------------------------------------------- 7 · what odoo does, what we add, what we assess */
  function segSlide(id, rootSel, segSel, seq) {
    Deck.on(id, {
      init: function (s) {
        var root = $(rootSel, s);
        s._show = function (v) { s._set(v, true); root.dataset.show = v; };
        s._set = seg($(segSel, s), function (v) { s._held = true; s._show(v); });
      },
      enter: function (ctx, s) {
        s._held = false; s._show('all'); var i = 0;
        ctx.after(1800, function () { ctx.every(2400, function () { if (s._held || i >= seq.length) return false; s._show(seq[i]); i++; }); });
      },
      settle: function (s) { s._show('all'); }
    });
  }
  segSlide('odoo', '.cc-cols', '.cc-od-seg', ['odoo', 'tn', 'eis', 'all']);

  /* ---------------------------------------------------------------- 8 · who does what */
  segSlide('roles', '.cc-who', '.cc-rl-seg', ['cc', 'acc', 'tn', 'all']);

  /* ---------------------------------------------------------------- 10 · questions (marks kept for this tab) */
  var KEY = 'cc-questions';
  function load() { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(m) { try { sessionStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { } }
  function paintQ(s) {
    var m = load(), a = 0, f = 0;
    $$('.cc-qg button', s).forEach(function (b) {
      var v = m[b.dataset.q] || ''; if (v) b.dataset.s = v; else b.removeAttribute('data-s');
      if (v === 'ok') a++; if (v === 'fu') f++;
    });
    $('.cc-q-a', s).textContent = a; $('.cc-q-f', s).textContent = f;
  }
  function followText(s) {
    var m = load(), out = ['Cotton Central · follow-ups'];
    $$('.cc-qg button', s).forEach(function (b) { if (m[b.dataset.q] === 'fu') out.push(b.dataset.q + '. ' + $('span', b).textContent); });
    if (out.length === 1) out.push('(none marked yet)');
    return out.join('\n');
  }
  Deck.on('questions', {
    init: function (s) {
      $('.cc-qs', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-q]'); if (!b) return;
        var m = load(), v = m[b.dataset.q] || '';
        m[b.dataset.q] = v === '' ? 'ok' : v === 'ok' ? 'fu' : '';
        if (!m[b.dataset.q]) delete m[b.dataset.q];
        save(m); paintQ(s);
      });
      var btn = $('.cc-q-copy', s), ta = $('.cc-q-ta', s);
      function done(msg) { $('span', btn).textContent = msg; setTimeout(function () { $('span', btn).textContent = 'Copy follow-ups'; }, 1800); }
      function fallback(t) {
        ta.hidden = false; ta.value = t; ta.focus(); ta.select();
        var ok = false; try { ok = document.execCommand('copy'); } catch (e) { }
        if (ok) { ta.hidden = true; done('Copied'); } else done('Select and copy');
      }
      btn.addEventListener('click', function () {
        var t = followText(s);
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { done('Copied'); }, function () { fallback(t); });
        else fallback(t);
      });
      ta.addEventListener('blur', function () { ta.hidden = true; });
    },
    enter: function (ctx, s) { paintQ(s); },
    settle: function (s) { if (Deck.print) { $$('.cc-qg button', s).forEach(function (b) { b.removeAttribute('data-s'); }); } else paintQ(s); }
  });
})();

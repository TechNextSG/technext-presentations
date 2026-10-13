/* Industry case study · Retail & Ecommerce. Slide behaviour. Harrowmere Living is a sample company and every figure is
   sample data, labelled on its slide. Every slide whose finished state comes from JS has a settle hook (overview, print, PDF). */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  function money(n) { return 'S$' + n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function swap(el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }
  function pickText(spec, n) {
    var out = '';
    spec.split('|').forEach(function (part) { var i = part.indexOf(':'), k = +part.slice(0, i); if (k <= n) out = part.slice(i + 1); });
    return out;
  }
  function paintT(root, n) { $$('[data-t]', root).forEach(function (el) { el.textContent = pickText(el.dataset.t, n); }); }
  function paintOn(root, n) { $$('[data-on]', root).forEach(function (el) { el.classList.toggle('is-on', +el.dataset.on <= n); el.classList.toggle('is-now', +el.dataset.on === n); }); }
  function seg(root, fn) {
    function set(v, quiet) {
      $$('button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      if (!quiet) fn(v);
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    return set;
  }
  // a list of buttons that cycles on its own until the presenter clicks one
  function picker(id, list, sel, paint, pace) {
    Deck.on(id, {
      init: function (s) {
        s._pick = function (k) {
          $$(sel, s).forEach(function (b) { b.classList.toggle('is-on', b.dataset.k === k); });
          paint(s, k);
        };
        $(list, s).addEventListener('click', function (e) {
          var b = e.target.closest(sel); if (!b) return;
          s._held = true; s._pick(b.dataset.k);
        });
      },
      enter: function (ctx, s) {
        s._held = false;
        var keys = $$(sel, s).map(function (b) { return b.dataset.k; }), i = 0;
        ctx.after(1400, function () {
          if (!s._held) s._pick(keys[0]);
          ctx.every(pace, function () { if (s._held) return; i = (i + 1) % keys.length; s._pick(keys[i]); });
        });
      },
      settle: function (s) { s._pick($(sel, s).dataset.k); }
    });
  }
  // step buttons in a header list that jump to a build
  function stepButtons(s, sel) {
    $$(sel + ' button', s).forEach(function (b) { b.addEventListener('click', function () { Deck.go(Deck.index, +b.dataset.n); }); });
  }
  function markSteps(s, sel, n) {
    $$(sel + ' button', s).forEach(function (b) { var k = +b.dataset.n, li = b.parentNode; li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n); });
  }

  // jump links: data-go="slide id"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.stopPropagation(); Deck.goId(b.dataset.go, 0);
  });

  /* ---------------------------------------------------------------- 2 · one customer, five strangers */
  var MOMENTS = [
    ['Day 1 · browses the website', 'She saves the dinner set to her wishlist as a guest. The web shop knows a cookie, not a person.'],
    ['Day 3 · buys it in Katong', 'S$128.00 at the till, paid by card. The till records a sale with no customer on it.'],
    ['Day 3 · earns points', 'She shows the loyalty app at the counter. The app records points against a phone number, not the sale.'],
    ['Day 9 · orders 4 mugs online', 'She makes an account to check out. Her store points don’t work here: the website has its own vouchers.'],
    ['Day 18 · 11.11 on Shopee', 'A second dinner set, as a gift. Shopee keeps her details; the seller centre shows a masked name.'],
    ['Day 22 · returns a mug in Bishan', 'Bought online, returned in a store. The till can’t find the web order, so S$18 comes out of the drawer on a slip.'],
    ['Day 26 · asks for 40 sets', 'Corporate gifts for her company, by email to a store. A lead worth more than the year she has had, logged only if someone remembers.']
  ];
  Deck.on('client', {
    init: function (s) {
      var jr = $('.om-jr', s);
      s._view = seg($('.om-jr-seg', s), function (v) { jr.dataset.view = v; });
      s._pick = function (k) {
        $$('.om-tp button', s).forEach(function (b) { b.classList.toggle('is-on', b.dataset.k === String(k)); });
        var b = $('.om-tp button[data-k="' + k + '"]', s), sys = b ? b.dataset.s : null;
        $$('.om-rec p', s).forEach(function (p) { p.classList.toggle('is-on', p.dataset.s === sys); });
        if (k == null) return;
        $('.om-jr-t', s).textContent = MOMENTS[k][0]; $('.om-jr-d', s).textContent = MOMENTS[k][1];
        swap($('.om-jr-say', s));
      };
      $('.om-tp', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]'); if (!b) return;
        s._held = true; s._pick(+b.dataset.k);
      });
    },
    enter: function (ctx, s) {
      s._held = false; s._view('her'); $('.om-jr', s).dataset.view = 'her';
      var i = 0;
      ctx.after(1200, function () {
        if (!s._held) s._pick(0);
        ctx.every(2600, function () {
          if (s._held) return;
          i++;
          if (i < MOMENTS.length) s._pick(i);
          else { s._held = true; s._view('sys'); $('.om-jr', s).dataset.view = 'sys'; }
        });
      });
    },
    settle: function (s) { s._view('sys', true); $('.om-jr', s).dataset.view = 'sys'; s._pick(6); }
  });

  /* ---------------------------------------------------------------- 3 · the knot: one Saturday in Katong */
  var KN = {
    web: [2, 1, 1, 0, 0, 0],
    shelf: [2, 2, 0, 0, 0, 0],
    c1: [0, 0, 0, 0, 2, 2],
    c2: [0, 0, 0, 0, 256, 274],
    say: [
      'Saturday, 09:00. The website, the shelf and the till each have their own idea of Katong’s stock.',
      '10:04. A customer pays online to collect in Katong. The website takes one off its own count. <b>The till never hears about it.</b>',
      '11:40. A walk-in buys both sets as a wedding gift. The shelf is empty. <b>The website still offers one.</b>',
      '14:15. A second customer pays for that one. <b>Two paid orders, nothing on the shelf.</b>',
      '17:30. The first customer arrives. Staff refund both orders by hand and apologise. <b>S$256 refunded outside the books.</b>',
      'Day 4. She returns an online mug in Bishan. The till can’t find the order, so <b>S$18 comes out of the drawer</b> on a slip.'
    ]
  };
  function paintKn(s, n) {
    var k = $('.om-kn', s);
    k.dataset.k = n;
    markSteps(s, '.om-kn-tl', n);
    paintOn(k, n);
    $('.om-kn-wq', s).textContent = KN.web[n];
    $('.om-kn-sq', s).textContent = KN.shelf[n];
    $$('.om-sets i', s).forEach(function (el, i) { el.classList.toggle('is-gone', i >= KN.shelf[n]); });
    $('.om-c1', s).textContent = KN.c1[n];
    $('.om-c2', s).textContent = money(KN.c2[n]);
    $('.om-kn-x', s).innerHTML = KN.say[n];
    swap($('.om-kn-say', s));
  }
  Deck.on('knot', {
    init: function (s) { stepButtons(s, '.om-kn-tl'); },
    step: function (n, ctx, s) { paintKn(s, n); },
    settle: function (s) { paintKn(s, 5); }
  });

  /* ---------------------------------------------------------------- 4 · five seams */
  Deck.on('seams', {
    init: function (s) {
      var sm = $('.om-sm', s), say = $('.om-sm-say', s);
      s._mode = seg($('.om-sm-seg', s), function (v) { sm.dataset.mode = v; say.classList.toggle('is-one', v === 'one'); });
      $('.om-sm-seg', s).addEventListener('click', function () { s._held = true; });
    },
    enter: function (ctx, s) {
      s._mode('two'); s._held = false;
      ctx.after(4200, function () { if (!s._held) s._mode('one'); });
    },
    settle: function (s) { s._mode('one'); }
  });

  /* ---------------------------------------------------------------- 5 · five apps, one database */
  var APPS = {
    pos: ['Point of Sale', 'A till per store, one product list', 'Five shops on the same products, prices and promotions. Each sale takes stock from that store, sets the customer for points, and the till can load a website order for collection.', 'Price · Returns', 'Five stand-alone tills and a loyalty app'],
    web: ['eCommerce', 'The website sells the stores’ stock', 'Product pages read the warehouse and every store. Click & Collect lets the customer pick the store that has it, and pay online or on site.', 'Stock · Customer', 'A separate web shop and a nightly stock file'],
    inv: ['Inventory', 'One stock figure per place', 'The warehouse and each store as its own warehouse. Online and in-store orders reserve from the same figure; transfers move stock between stores; levels go out to the marketplaces.', 'Stock', 'Excel counts and phone calls between stores'],
    acc: ['Accounting', 'Every channel, one set of books', 'Till sessions post when they close, online payments are matched to the provider’s payout, marketplace settlements land in clearing accounts, and the bank is matched to all of it.', 'Money', 'Z-reports, gateway reports and seller-centre statements'],
    crm: ['CRM', 'One customer, then the next sale', 'Every order, in store and online, on one contact. A website enquiry becomes a lead with that history attached, and Email Marketing reaches customers who opted in.', 'Customer', 'Leads in someone’s inbox']
  };
  picker('arch', '.om-hub', '.om-ap', function (s, k) {
    var a = APPS[k], p = $('.om-ap-p', s), btn = $('.om-ap[data-k="' + k + '"]', s);
    $$('.om-sp', s).forEach(function (l) { l.classList.toggle('is-on', l.dataset.k === k); });
    $('.fb-ap-i', s).innerHTML = $('.oi', btn).outerHTML;
    $('.fb-ap-place', s).textContent = a[0];
    $('.fb-ap-t', s).textContent = a[1]; $('.fb-ap-d', s).textContent = a[2]; $('.om-ap-s', s).textContent = a[3]; $('.fb-ap-r', s).textContent = a[4];
    swap(p);
  }, 3600);

  /* ---------------------------------------------------------------- 6 · workflow 1: click and collect */
  var KAT = [2, 2, 1, 1, 0, 0];
  function paintW1(s, n) {
    var w = $('.om-w1', s);
    w.dataset.k = n;
    markSteps(s, '.om-st', n);
    paintOn(w, n);
    paintT(w, n);
    var kat = $('.om-loc [data-l="kat"]', s);
    $('b', kat).textContent = KAT[n];
    kat.classList.toggle('is-out', KAT[n] === 0);
    kat.classList.toggle('is-sel', n >= 2 && n !== 4);
    $('.om-loc [data-l="bsh"]', s).classList.toggle('is-sel', n === 4);
    swap($('.om-iw-say', s));
  }
  Deck.on('w1', {
    init: function (s) { stepButtons(s, '.om-st'); },
    step: function (n, ctx, s) { paintW1(s, n); },
    settle: function (s) { paintW1(s, 5); }
  });

  /* ---------------------------------------------------------------- 7 · workflow 2: one customer */
  function paintW2(s, n) {
    var w = $('.om-w2', s);
    w.dataset.k = n;
    paintOn(w, n);
    paintT(w, n);
  }
  Deck.on('w2', {
    step: function (n, ctx, s) { paintW2(s, n); },
    settle: function (s) { paintW2(s, 4); }
  });

  /* ---------------------------------------------------------------- 8 · workflow 3: one set of books */
  var TOT = [0, 18420, 24800, 30190, 30190];
  function margins(fee) {
    var keep = 128 - 46, card = 128 * 0.019;
    return {
      store: keep - card,
      cc: keep - card,
      web: keep - 9 - (128 * 0.034 + 0.5),
      mkt: keep - 128 * fee / 100 - 5
    };
  }
  function paintBars(s) {
    var fee = +$('.om-fee-r', s).value, m = margins(fee);
    $('.om-fee', s).textContent = fee + '%';
    $$('.om-bars p', s).forEach(function (p) {
      var v = m[p.dataset.c];
      $('b', p).style.width = Math.max(0, v / 82 * 100) + '%';
      $('em', p).textContent = money(v);
    });
  }
  function paintW3(s, n, ctx) {
    var w = $('.om-w3', s), el = $('.om-cl-n', s);
    w.dataset.k = n;
    paintOn(w, n);
    paintT(w, n);
    if (ctx && !Deck.reduce && s._tot != null && s._tot !== TOT[n]) ctx.count(el, TOT[n], { from: s._tot, dur: 700, dec: 2, pre: 'S$' });
    else el.textContent = money(TOT[n]);
    s._tot = TOT[n];
    paintBars(s);
  }
  Deck.on('w3', {
    init: function (s) { $('.om-fee-r', s).addEventListener('input', function () { paintBars(s); }); },
    enter: function (ctx, s) { s._tot = null; },
    step: function (n, ctx, s) { paintW3(s, n, ctx); },
    settle: function (s) { s._tot = null; paintW3(s, 4, null); }
  });

  /* ---------------------------------------------------------------- 9 · rollout phases */
  var PH = [
    ['Load the 860 products with barcodes, set up the warehouse and five store warehouses, count once, and connect purchasing and the bank to the books.', ['A nightly stock file', 'One stock figure per store'], ['Six product lists', 'One product, one barcode']],
    ['One pilot store on Point of Sale; when it closes a clean week, the other four follow. The loyalty card starts at every till and members’ balances are imported from the old app.', ['Tills that only know sales', 'Every sale takes stock off its store'], ['Points in a separate app', 'One card, every till']],
    ['The website moves onto the same products and stock: Click & Collect from the stores that hold it, online payments into Accounting, the same loyalty card at checkout.', ['A web shop reading a file', 'The website sells live store stock'], ['Online orders a till can’t find', 'Returns booked against the web order']],
    ['CRM for corporate and gifting enquiries, Email Marketing to opted-in customers, then Shopee and Lazada one at a time, never during a mega-sale.', ['Leads in someone’s inbox', 'A pipeline with each customer’s history'], ['Marketplace payouts by hand', 'Payouts in clearing, matched to the bank']]
  ];
  picker('rollout', '.fb-ph', '.fb-ph button', function (s, k) {
    var p = PH[+k], d = $('.fb-pd', s), rows = $$('.fb-ba li', s);
    $('.fb-pd-do', s).textContent = p[0];
    rows.forEach(function (li, i) { $('.fb-b', li).textContent = p[i + 1][0]; $('.fb-a', li).textContent = p[i + 1][1]; });
    swap(d);
  }, 4200);
})();

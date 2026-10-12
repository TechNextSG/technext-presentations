/* Industry case study · Retail. Slide behaviour. Weftwood is a sample company and every figure is sample data,
   labelled on its slide. Every slide whose finished state comes from JS has a settle hook (overview, print, PDF). */
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

  // jump links: data-go="slide id"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.stopPropagation(); Deck.goId(b.dataset.go, 0);
  });

  /* ---------------------------------------------------------------- 2 · one style, 135 numbers */
  var COLS = ['#1E4691', '#D9B98C', '#7C8A4E'], FACT = [1, 3, 5, 9];
  function paintMx(s) {
    var on = $$('.rtl-mx-f button', s).map(function (b) { return b.classList.contains('is-on'); });
    var c = on[1] ? 3 : 1, z = on[2] ? 5 : 1, l = on[3] ? 9 : 1, n = c * z * l;
    $$('.rtl-mx-dots i', s).forEach(function (d) {
      var r = +d.dataset.r, j = +d.dataset.j;
      d.classList.toggle('is-on', Math.floor(j / 5) < c && j % 5 < z && r < l);
    });
    $('.rtl-mx-n', s).textContent = n;
    $('.rtl-mx-say', s).classList.toggle('is-on', n === 135);
  }
  Deck.on('client', {
    init: function (s) {
      var box = $('.rtl-mx-dots', s), html = '';
      for (var r = 0; r < 9; r++) for (var j = 0; j < 15; j++)
        html += '<i data-r="' + r + '" data-j="' + j + '" style="--c:' + COLS[Math.floor(j / 5)] + ';--r:' + (r * 2 + j % 5) + '"></i>';
      box.innerHTML = html;
      s._set = function (k) { $$('.rtl-mx-f button', s).forEach(function (b) { if (+b.dataset.f) b.classList.toggle('is-on', +b.dataset.f <= k); }); paintMx(s); };
      $('.rtl-mx-f', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-f]'); if (!b || b.disabled) return;
        s._held = true; b.classList.toggle('is-on'); paintMx(s);
      });
    },
    enter: function (ctx, s) {
      s._held = false; s._set(0);
      [1, 2, 3].forEach(function (k) { ctx.after(700 + k * 900, function () { if (!s._held) s._set(k); }); });
    },
    settle: function (s) { s._set(3); }
  });

  /* ---------------------------------------------------------------- 3 · the knot: size x store heat-map */
  var STORES = ['Orchard', 'Tampines', 'Jurong East', 'Bugis', 'Woodlands', 'Novena', 'Punggol', 'Holland Village'];
  var SIZES = ['XS', 'S', 'M', 'L', 'XL'], ALLOC = [4, 10, 12, 10, 4];
  var SOLD = [[2, 7, 11, 6, 1], [3, 9, 12, 8, 2], [1, 5, 10, 7, 2], [2, 8, 12, 6, 1], [1, 4, 7, 8, 3], [0, 3, 3, 4, 1], [2, 6, 12, 7, 2], [1, 4, 4, 3, 0]];
  var OUTWK = { '1-2': 3, '3-2': 5, '6-2': 5 };
  function band(r) { return r >= 1 ? 4 : r >= 0.85 ? 3 : r >= 0.6 ? 2 : r >= 0.35 ? 1 : 0; }
  function cellText(i, k) {
    var sold = SOLD[i][k], a = ALLOC[k], left = a - sold, who = STORES[i] + ' · ' + SIZES[k];
    if (!left) return [who, sold + ' of ' + a + ' sold. Sold out' + (OUTWK[i + '-' + k] ? ' in week ' + OUTWK[i + '-' + k] : '') + ': every customer since then left without it.'];
    if (!sold) return [who, 'None of ' + a + ' sold in six weeks. ' + left + ' waiting for a markdown.'];
    var cover = Math.round(left / (sold / 6));
    return [who, sold + ' of ' + a + ' sold, ' + left + ' left: about ' + cover + ' week' + (cover === 1 ? '' : 's') + ' of cover at this pace.'];
  }
  Deck.on('knot', {
    init: function (s) {
      var g = $('.rtl-hm-g', s), html = '<span></span>', tot = [0, 0, 0, 0, 0];
      SIZES.forEach(function (z) { html += '<b>' + z + '</b>'; });
      SOLD.forEach(function (row, i) {
        html += '<em>' + STORES[i] + '</em>';
        row.forEach(function (v, k) { tot[k] += v; html += '<button type="button" class="k' + band(v / ALLOC[k]) + '" data-c="' + i + '-' + k + '" aria-label="' + STORES[i] + ' size ' + SIZES[k] + '">' + (v === ALLOC[k] ? 'OUT' : v + '/' + ALLOC[k]) + '</button>'; });
      });
      html += '<i style="justify-content:flex-start">All stores</i>';
      tot.forEach(function (v, k) { html += '<i>' + v + '/' + ALLOC[k] * 8 + '</i>'; });
      g.innerHTML = html;
      var kn = $('.rtl-kn', s);
      s._mode = seg($('.rtl-kn-seg', s), function (v) { kn.dataset.mode = v; });
      s._cell = function (id) {
        $$('.rtl-hm-g button', s).forEach(function (b) { b.classList.toggle('is-sel', b.dataset.c === id); });
        if (!id) { $('.rtl-cell-t', s).textContent = 'Click a cell'; $('.rtl-cell-d', s).textContent = 'Each square is one size in one store: sold, out of what was allocated.'; return; }
        var p = id.split('-'), t = cellText(+p[0], +p[1]);
        $('.rtl-cell-t', s).textContent = t[0]; $('.rtl-cell-d', s).textContent = t[1];
      };
      g.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-c]'); if (!b) return;
        if (kn.dataset.mode !== 'grid') { s._mode('grid'); }
        s._cell(b.dataset.c);
      });
    },
    enter: function (ctx, s) { s._mode('tot'); s._cell(null); },
    settle: function (s) { s._mode('grid'); s._cell('1-2'); }
  });

  /* ---------------------------------------------------------------- 4 · the season, week by week */
  var FP = [30, 62, 95, 127, 160, 190, 205, 205, 205, 205, 205, 205];
  var LOST = [0, 0, 3, 7, 13, 20, 27, 33, 37, 40, 42, 44];
  var MDU = [0, 0, 0, 0, 0, 0, 0, 20, 40, 64, 90, 115];
  var MDV = [0, 0, 0, 0, 0, 0, 0, 534, 1068, 1708.8, 2865.8, 3978.3];
  function week(s, w) {
    var i = w - 1, se = $('.rtl-se', s);
    s._w = w; $('input', se).value = w;
    $('.rtl-wk', s).textContent = w;
    $('.rtl-px', s).textContent = w <= 7 ? 'S$89.00' : w <= 10 ? 'S$62.30 · 30% off' : 'S$44.50 · 50% off';
    $('.rtl-c-fp', s).textContent = FP[i];
    $('.rtl-c-lost', s).textContent = money(LOST[i] * 58);
    $('.rtl-c-lu', s).textContent = LOST[i];
    $('.rtl-c-md', s).textContent = money(MDV[i]);
    $('.rtl-c-mu', s).textContent = MDU[i];
    var last = 0;
    $$('.rtl-ev li', s).forEach(function (li) { var on = +li.dataset.w <= w; li.classList.toggle('is-on', on); if (on) last = +li.dataset.w; });
    $$('.rtl-ev li', s).forEach(function (li) { li.classList.toggle('is-now', +li.dataset.w === last); });
    se.classList.toggle('is-md', w > 7);
    se.classList.toggle('is-end', w === 12);
  }
  Deck.on('season', {
    init: function (s) {
      var r = $('.rtl-sl input', s);
      r.addEventListener('input', function () { s._run = (s._run || 0) + 1; week(s, +r.value); });
    },
    enter: function (ctx, s) { week(s, 1); },
    step: function (n, ctx, s) {
      if (n < 1) { week(s, 1); return; }
      var from = s._w || 1, tok = (s._run || 0) + 1; s._run = tok;
      if (Deck.reduce) { week(s, 12); return; }
      ctx.tween(2600, function (p) { if (s._run === tok) week(s, Math.round(from + (12 - from) * p)); }, 'io');
    },
    settle: function (s) { week(s, 12); }
  });

  /* ---------------------------------------------------------------- 5 · the season loop */
  var LOOP = {
    buy: ['Step 1 · Purchase', 'Buy by size, not by style', 'Each purchase order line is a variant: the linen shirt in Navy M has its own quantity and barcode, and is received against the order.', 'Buy sheets emailed to the supplier', 'P00318 · 15 variant lines'],
    recv: ['Step 2 · Inventory · Barcode', 'Receive by scanning', 'Cartons are scanned in at the warehouse with the Barcode app against the purchase order. A short or wrong size shows on the receipt, not in a store weeks later.', 'Packing lists ticked by hand', 'WH/IN/00207 · Sand XL short by 4'],
    alloc: ['Step 3 · Inventory', 'Allocate to eight stores', 'Each store is a warehouse resupplied from the main one. Reordering rules by variant and store keep the core sizes topped up.', 'Allocation in Excel, store by store', 'Reordering rule · Tampines · Navy M · min 3, max 12'],
    sell: ['Step 4 · Point of Sale', 'Sell the exact variant', 'One Point of Sale per store, the same products and prices, barcode at the till. Each sale takes that size and colour off that store’s stock.', 'Eight stand-alone tills, sales only', 'Session TAM/00061 · Linen camp shirt (Navy, M)'],
    loyal: ['Step 5 · Point of Sale · Loyalty', 'Reward in any store', 'A Loyalty Cards programme in Discount & Loyalty: points on the customer’s card, earned and redeemed at any till, visible on the contact.', 'A separate loyalty app with its own login', 'Weftwood Circle · Loyalty Cards · every till'],
    move: ['Step 6 · Inventory', 'Rebalance between stores', 'Stock moves between stores as transfers between warehouses: a delivery out, a receipt in, in transit between. Every unit is traceable.', 'Phone calls and a box in a staff car', 'NOV/OUT/00042 · Inter-warehouse transit'],
    mark: ['Step 7 · Point of Sale', 'Mark down on time', 'Markdowns as pricelists or promotions with start and end dates, so 30% off starts in all eight stores at once and ends on time.', 'Red stickers and a memo to each store', 'Pricelist “End of season” · 30% · from week 8'],
    read: ['Step 8 · Dashboards', 'Read the season', 'Spreadsheet dashboards on live data: sell-through by size and store, weeks of cover and full-price share, ready for the next buy.', 'One sell-through number per style', 'Sell-through by size and store · every Monday']
  };
  picker('loop', '.rtl-lp-l', '.rtl-nd', function (s, k) {
    var a = LOOP[k], p = $('.rtl-lp-p', s), btn = $('.rtl-nd[data-k="' + k + '"]', s);
    $('.fb-ap-i', s).innerHTML = $('.oi', btn).outerHTML;
    $('.fb-ap-place', s).textContent = a[0];
    $('.fb-ap-t', s).textContent = a[1]; $('.fb-ap-d', s).textContent = a[2]; $('.fb-ap-r', s).textContent = a[3]; $('.rtl-lp-dv', s).textContent = a[4];
    swap(p);
  }, 3400);

  /* ---------------------------------------------------------------- 6 · workflow 1: rebalance size M */
  var M_SOLD = [11, 12, 10, 12, 7, 3, 12, 4], M_HAND = [1, 0, 2, 0, 5, 9, 0, 8], M_DELTA = [0, 4, 0, 4, 0, -7, 3, -4];
  function paintW1(s, n) {
    var w = $('.rtl-w1', s);
    w.dataset.k = n;
    $$('.rtl-w1-st button', s).forEach(function (b) { var k = +b.dataset.n, li = b.parentNode; li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n); });
    $$('.rtl-docs [data-on]', s).forEach(function (el) { el.classList.toggle('is-on', +el.dataset.on <= n); });
    paintT(w, n);
    $$('.rtl-mr', s).forEach(function (row, i) {
      var hand = M_HAND[i] + (n >= 3 ? M_DELTA[i] : 0), rate = M_SOLD[i] / 6, cov = hand / rate, d = M_DELTA[i];
      var got = n >= 3 && d > 0;
      row.className = 'rtl-mr ' + (got ? 'is-ok' : !hand ? 'is-out' : cov > 8 ? 'is-over' : '');
      $('.rtl-mr-bar i', row).style.width = (hand / 12 * 100) + '%';
      $('.rtl-mr-n', row).textContent = hand;
      $('.rtl-mr-c', row).textContent = got ? 'back in' : !hand ? 'out' : Math.max(1, Math.round(cov)) + (Math.max(1, Math.round(cov)) === 1 ? ' wk' : ' wks');
      var dd = $('.rtl-mr-d', row);
      dd.textContent = d ? (d > 0 ? '+' + d + ' in' : '−' + (-d) + ' out') : '';
      dd.className = 'rtl-mr-d' + (d && n >= 1 && n < 3 ? ' is-on ' + (d > 0 ? 'is-in' : 'is-outd') : '');
    });
  }
  Deck.on('w1', {
    init: function (s) {
      var html = '';
      STORES.forEach(function (st) { html += '<div class="rtl-mr"><span>' + st + '</span><span class="rtl-mr-bar"><i></i></span><span class="rtl-mr-n"></span><span class="rtl-mr-c"></span><span class="rtl-mr-d"></span></div>'; });
      $('.rtl-mg-g', s).innerHTML = html;
      $$('.rtl-w1-st button', s).forEach(function (b) { b.addEventListener('click', function () { Deck.go(Deck.index, +b.dataset.n); }); });
    },
    step: function (n, ctx, s) { paintW1(s, n); },
    settle: function (s) { paintW1(s, 3); }
  });

  /* ---------------------------------------------------------------- 7 · workflow 2: one card, every store */
  var PTS = [253, 253, 412, 81, 81];
  function paintW2(s, n, ctx) {
    var w = $('.rtl-w2', s), el = $('.rtl-cc-n', s), to = PTS[n];
    w.dataset.k = n;
    paintT(s, n);
    if (ctx && !Deck.reduce && s._pts != null && s._pts !== to) ctx.count(el, to, { from: s._pts, dur: 800 });
    else el.textContent = to;
    s._pts = to;
  }
  Deck.on('w2', {
    enter: function (ctx, s) { s._pts = null; },
    step: function (n, ctx, s) { paintW2(s, n, ctx); },
    settle: function (s) { s._pts = null; paintW2(s, 4, null); }
  });

  /* ---------------------------------------------------------------- 8 · rollout phases */
  var PH = [
    ['Load every style with sizes and colours as variants and a barcode each, set up the warehouse and eight store locations, and connect purchasing to the books.', ['Stock in a weekly Excel file', 'Stock by size and store, live'], ['Purchase orders by email', 'Receipts scanned against the order']],
    ['One pilot store on Point of Sale with barcode scanning, resupplied from the warehouse. It runs a clean week of sales and closing before the rest follow.', ['A till that knows only sales', 'Each sale takes the size off stock'], ['Allocation in Excel', 'Resupply by reordering rule']],
    ['The other seven stores go live, the Loyalty Cards programme starts at every till, and members’ balances are imported from the old app.', ['Points in a separate app', 'One card in all 8 stores'], ['Eight sets of till reports', 'Every session posted to Accounting']],
    ['Dashboards for sell-through by size and store and weeks of cover, the rebalance rule, dated markdown pricelists, and the next buy read by size.', ['One sell-through number per style', 'Size by store, every Monday'], ['The same size curve every season', 'A buy read from full-price sales']]
  ];
  picker('rollout', '.fb-ph', '.fb-ph button', function (s, k) {
    var p = PH[+k], d = $('.fb-pd', s), rows = $$('.fb-ba li', s);
    $('.fb-pd-do', s).textContent = p[0];
    rows.forEach(function (li, i) { $('.fb-b', li).textContent = p[i + 1][0]; $('.fb-a', li).textContent = p[i + 1][1]; });
    swap(d);
  }, 4200);
})();

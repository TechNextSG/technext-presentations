/* Industry case study · F&B. Slide behaviour. Saltfern Kitchens is a sample company and every figure is sample data,
   labelled on its slide. Every slide whose finished state comes from JS has a settle hook (overview, print, PDF). */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  function money(n) { return 'S$' + n.toFixed(2); }
  function seg(root, fn) {
    function set(v, quiet) {
      $$('button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      if (!quiet) fn(v);
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    return set;
  }
  function swap(el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }
  // a list of buttons that cycles on its own until the presenter clicks one
  function picker(id, list, sel, paint, pace) {
    Deck.on(id, {
      init: function (s) {
        s._pick = function (k, quiet) {
          $$(sel, s).forEach(function (b) { b.classList.toggle('is-on', b.dataset.k === k); });
          paint(s, k, quiet);
        };
        $(list, s).addEventListener('click', function (e) {
          var b = e.target.closest(sel); if (!b) return;
          s._held = true; s._pick(b.dataset.k);
        });
      },
      enter: function (ctx, s) {
        s._held = false;
        var keys = $$(sel, s).map(function (b) { return b.dataset.k; }), i = 0;
        if (!pace) return;
        ctx.after(1400, function () {
          if (!s._held) s._pick(keys[0]);
          ctx.every(pace, function () { if (s._held) return; i = (i + 1) % keys.length; s._pick(keys[i]); });
        });
      },
      settle: function (s) { s._pick($(sel, s).dataset.k, true); }
    });
  }

  // jump links: data-go="slide id"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.stopPropagation(); Deck.goId(b.dataset.go, 0);
  });

  /* ---------------------------------------------------------------- 2 · the client's seven tools */
  var TOOLS = [
    ['Three POS brands across five outlets.', 'Each outlet’s sales, by hour and by item.', 'Stock, recipes, or what the other outlets sold.', 'Z-reports are photographed and typed into a sheet.'],
    ['Two delivery apps, two tablets per outlet.', 'Orders and the payout, after commission.', 'The POS, the stock, or the real cost of the dish.', 'Payout files are re-keyed to match the bank.'],
    ['One WhatsApp chat per supplier.', 'What was ordered, and the new price if they mention it.', 'Minimum stock, what the kitchen will cook, open orders.', 'Purchasing chases deliveries and checks invoices by eye.'],
    ['Recipe costing in an Excel file.', 'What a dish should cost, as of March.', 'Today’s supplier prices, waste, or how many were sold.', 'Re-costing 140 dishes takes days, so it isn’t done.'],
    ['Paper stock counts, Sunday nights.', 'What was on the shelf at 11 pm on Sunday.', 'What should have been there, from sales and deliveries.', 'Gaps are written off as “waste” without a reason.'],
    ['Accounting software, fed monthly.', 'The books, once the accountant has typed them in.', 'Food cost by outlet or by dish, until weeks later.', 'Month-end takes two weeks of reconciling.'],
    ['Rosters in a group chat.', 'Who said they would work on Saturday.', 'Hours actually worked, or labour cost by outlet.', 'Swaps get lost; payroll is checked line by line.']
  ];
  picker('client', '.fb-tl', '.fb-tl button', function (s, k) {
    var t = TOOLS[+k], d = $('.fb-td', s);
    $('.fb-td-h', s).textContent = 'Tool ' + (+k + 1) + ' of 7';
    $('.fb-td-t', s).textContent = t[0]; $('.fb-td-k', s).textContent = t[1];
    $('.fb-td-b', s).textContent = t[2]; $('.fb-td-c', s).textContent = t[3];
    swap(d);
  }, 3400);

  /* ---------------------------------------------------------------- 3 · one price rise: the leak grows by day */
  var DAYS = [0, 0, 1, 1, 2, 30, 38], PER_DAY = 1890 / 30;
  function leak(s, n, ctx) {
    var day = DAYS[Math.min(n, 6)], to = Math.round(day * PER_DAY), el = $('.fb-leak-n', s);
    $('.fb-leak-fill', s).style.width = (day / 38 * 100) + '%';
    if (ctx && !Deck.reduce) ctx.count(el, to, { from: s._leak || 0, dur: 700, pre: 'S$' });
    else el.textContent = 'S$' + to.toLocaleString('en-SG');
    s._leak = to;
  }
  Deck.on('ripple', {
    enter: function (ctx, s) { s._leak = 0; },
    step: function (n, ctx, s) { leak(s, n, ctx); },
    settle: function (s) { leak(s, 6, null); }
  });

  /* ---------------------------------------------------------------- 4 · four flows: before / with Odoo */
  Deck.on('flows', {
    init: function (s) {
      $$('.fb-gap', s).forEach(function (g, i) { g.style.setProperty('--g', i); });
      s._set = seg($('.fb-fl-seg', s), function (v) {
        $('.fb-fl', s).dataset.mode = v;
        $('.fb-fl-say', s).classList.toggle('is-odoo', v === 'odoo');
        $$('.fb-gap em', s).forEach(function (em) { em.textContent = v === 'odoo' ? em.dataset.o : em.dataset.b; });
      });
    },
    enter: function (ctx, s) { s._set('before'); },
    settle: function (s) { s._set('odoo'); }
  });

  /* ---------------------------------------------------------------- 5 · architecture: nine apps */
  var APPS = {
    mrp: ['Central kitchen', 'Manufacturing', 'Every recipe becomes a bill of materials, and every batch a manufacturing order. The cost of a dish is computed from its components, at today’s prices.', 'The recipe Excel last updated in March'],
    stock: ['Central kitchen', 'Inventory', 'Six warehouses (the kitchen and five outlets) on one stock. Reordering rules, resupply transfers, lots with expiry dates, and counts by barcode scanner.', 'Sunday-night paper counts and delivery chits'],
    qc: ['Central kitchen', 'Quality', 'Control points on the batch: a core temperature, a taste check, a photo. A failed check stops the lot before it leaves the kitchen.', 'Food-safety checklists on clipboards'],
    pos: ['Outlets', 'Point of Sale', 'One POS for all five outlets: same menu, same prices, set once. Each session closes into Accounting, and every sale draws its ingredients from stock.', 'Three POS brands and photographed Z-reports'],
    rest: ['Outlets', 'Restaurant', 'Floor plans, table orders, split bills and QR self-ordering. Orders reach the Kitchen Display by station. Delivery-app orders: by connector or import, confirmed per platform.', 'Paper chits and two tablets per outlet'],
    plan: ['Outlets', 'Planning', 'Shifts planned by outlet and role, published to staff phones; swaps are requested and approved in the app. Attendances clocks people in at a kiosk.', 'The roster group chat and paper sign-in sheets'],
    pur: ['Back office', 'Purchase', 'Requests for quotation drafted from reordering rules, sent to the preferred supplier, approved by the buyer, and matched to the bill and the delivery.', 'One WhatsApp chat per supplier'],
    acc: ['Back office', 'Accounting', 'Bank lines fetched and matched by rule, POS sessions posted daily, and every entry tagged to its outlet (analytic), so there is a P&L per outlet.', 'A monthly hand-fed ledger and two weeks of month-end'],
    dash: ['Back office', 'Dashboards', 'Food cost by dish and outlet, sales by hour, stock value and waste, live from the same database the tills write to.', 'Spreadsheets rebuilt every month']
  };
  picker('arch', '.fb-ag', '.fb-ac button', function (s, k) {
    var a = APPS[k], p = $('.fb-ap', s), btn = $('.fb-ac button[data-k="' + k + '"]', s);
    $('.fb-ap-i', s).innerHTML = $('.oi', btn).outerHTML;
    $('.fb-ap-place', s).textContent = a[0];
    $('.fb-ap-t', s).textContent = a[1]; $('.fb-ap-d', s).textContent = a[2]; $('.fb-ap-r', s).textContent = a[3];
    swap(p);
  }, 3600);

  /* ---------------------------------------------------------------- 6 · workflow 1: replenishment, step by step */
  function pickText(spec, n) {
    var out = '';
    spec.split('|').forEach(function (part) { var i = part.indexOf(':'), k = +part.slice(0, i); if (k <= n) out = part.slice(i + 1); });
    return out;
  }
  function paintW1(s, n) {
    var sc = $('.fb-sc', s);
    sc.dataset.k = n;
    $$('.fb-steps button', s).forEach(function (b) {
      var k = +b.dataset.n, li = b.parentNode;
      li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n);
    });
    $$('[data-on]', sc).forEach(function (el) { var k = +el.dataset.on; el.classList.toggle('is-on', k <= n); el.classList.toggle('is-now', k === n); });
    $$('[data-t]', sc).forEach(function (el) { el.textContent = pickText(el.dataset.t, n); });
    $('.fb-cnt', s).textContent = n;
  }
  Deck.on('w1', {
    init: function (s) {
      var play = $('.fb-play', s);
      s._stop = function () { s._run = (s._run || 0) + 1; play.classList.remove('is-on'); $('span', play).textContent = 'Play the flow'; s._playing = false; };
      $$('.fb-steps button', s).forEach(function (b) { b.addEventListener('click', function () { s._stop(); Deck.go(Deck.index, +b.dataset.n); }); });
      play.addEventListener('click', function () {
        if (s._playing || !s._ctx) { s._stop(); return; }
        var tok = (s._run || 0) + 1; s._run = tok; s._playing = true;
        play.classList.add('is-on'); $('span', play).textContent = 'Pause';
        Deck.go(Deck.index, Deck.step >= 6 ? 0 : Deck.step + 1);
        s._ctx.every(1700, function () {
          if (s._run !== tok) return;
          if (Deck.index !== Deck.slides.indexOf(s) || Deck.step >= 6) { s._stop(); return; }
          Deck.go(Deck.index, Deck.step + 1);
        });
      });
    },
    enter: function (ctx, s) { s._ctx = ctx; s._stop(); },
    step: function (n, ctx, s) { paintW1(s, n); },
    leave: function (s) { s._stop(); },
    settle: function (s) { paintW1(s, 6); }
  });

  /* ---------------------------------------------------------------- 7 · workflow 2: cost per plate */
  var CH = {
    dine: { price: 7.80, pk: 0.05, pkn: 'Plate and cutlery wash', comm: 0, pxn: 'menu price, before GST', mgn: 'after food cost' },
    del: { price: 9.40, pk: 0.55, pkn: 'Takeaway box and bag', comm: 0.30, pxn: 'delivery price · 30% commission', mgn: 'after food cost and commission' }
  };
  var FIXED = 0.42 + 0.26 + 0.38, TARGET = 0.32, KG = 0.18;
  function cost(s) {
    var c = CH[s._ch], kg = s._kg / 100, ch = kg * KG, tot = ch + FIXED + c.pk;
    var fc = tot / c.price, mg = c.price * (1 - c.comm) - tot;
    $('.fb-sl-v', s).textContent = money(kg) + '/kg';
    $('.fb-c-ch', s).textContent = money(ch);
    $('.fb-c-pk', s).textContent = money(c.pk); $('.fb-c-pkn', s).textContent = c.pkn;
    $('.fb-c-tot', s).textContent = money(tot);
    $('.fb-k-px', s).textContent = money(c.price); $('.fb-k-pxn', s).textContent = c.pxn;
    $('.fb-k-fc', s).textContent = (fc * 100).toFixed(1) + '%';
    $('.fb-k-mg', s).textContent = money(mg); $('.fb-k-mgn', s).textContent = c.mgn;
    var bad = fc > TARGET;
    $('.fb-alert', s).dataset.state = bad ? 'bad' : 'ok';
    $('.fb-ctl', s).classList.toggle('is-bad', bad);
  }
  Deck.on('w2', {
    init: function (s) {
      var r = $('.fb-sl input', s);
      s._ch = 'dine'; s._kg = 720;
      r.addEventListener('input', function () { s._kg = +r.value; cost(s); });
      s._set = seg($('.fb-ch', s), function (v) { s._ch = v; cost(s); });
      s._reset = function (kg, ch) { s._kg = kg; r.value = kg; s._set(ch); };
    },
    enter: function (ctx, s) {
      s._reset(720, 'dine');
      // the price rise from slide 3, played once: S$7.20 to S$8.06 (+12%)
      ctx.after(1500, function () {
        ctx.tween(1600, function (p) { s._kg = Math.round(720 + 86 * p); $('.fb-sl input', s).value = s._kg; cost(s); }, 'io');
      });
    },
    settle: function (s) { s._reset(806, 'dine'); }
  });

  /* ---------------------------------------------------------------- 8 · rollout phases */
  var PH = [
    ['Clean the product, supplier and recipe lists, set up six warehouses and the chart of accounts, and connect the bank. Everything else reads these.', ['Supplier prices in WhatsApp', 'Purchase orders with today’s price'], ['Books typed in monthly', 'Bank matched daily']],
    ['Every recipe as a bill of materials, batches as manufacturing orders with lots and expiry dates, and quality checks on the line.', ['Recipe cost from March', 'Cost per dish at today’s prices'], ['“Use the older one first”', 'Lot and expiry on every batch']],
    ['One pilot outlet on Point of Sale and Restaurant with the Kitchen Display. After a clean week, the other four go live.', ['Three POS brands', 'One menu, one price list'], ['Paper stock counts', 'Sales draw down stock live']],
    ['Shifts in Planning, clock-in at a kiosk, and dashboards for food cost, sales by hour and waste by outlet.', ['Rosters in a group chat', 'Published shifts on phones'], ['Food cost found at month-end', 'Food cost by dish, every day']]
  ];
  picker('rollout', '.fb-ph', '.fb-ph button', function (s, k) {
    var p = PH[+k], d = $('.fb-pd', s), rows = $$('.fb-ba li', s);
    $('.fb-pd-do', s).textContent = p[0];
    rows.forEach(function (li, i) { $('.fb-b', li).textContent = p[i + 1][0]; $('.fb-a', li).textContent = p[i + 1][1]; });
    swap(d);
  }, 4200);
})();

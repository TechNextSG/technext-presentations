/* Industry case study · Travel. Slide behaviour. Wayfern Journeys is a sample company and every figure is sample data,
   labelled on its slide. Every slide whose finished state comes from JS has a settle hook (overview, print, PDF). */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  function m0(n) { return (n < 0 ? '−' : '') + 'S$' + Math.round(Math.abs(n)).toLocaleString('en-SG'); }
  function m2(n) { return 'S$' + Math.abs(n).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function swap(el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }
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
  function pickText(spec, n) {
    var out = '';
    spec.split('|').forEach(function (part) { var i = part.indexOf(':'), k = +part.slice(0, i); if (k <= n) out = part.slice(i + 1); });
    return out;
  }
  function paintSteps(root, n) {
    $$('[data-on]', root).forEach(function (el) { var k = +el.dataset.on; el.classList.toggle('is-on', k <= n); el.classList.toggle('is-now', k === n); });
    $$('[data-t]', root).forEach(function (el) { el.textContent = pickText(el.dataset.t, n); });
  }

  // jump links: data-go="slide id"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.stopPropagation(); Deck.goId(b.dataset.go, 0);
  });

  /* ---------------------------------------------------------------- 2 · the departures board */
  var DEP = [
    ['HKD-1027 · Hokkaido Autumn', 'S$4,280 a head for 24 pax, priced in February at S$0.90 per ¥100.', 'Four cancellations, the yen at 0.94, the coach bill not in yet.', 'When the local guide bills, in late November.'],
    ['SEL-1022 · Seoul & Gangwon', 'S$2,980 a head for 32 pax, priced in March with won costs at that day’s rate.', 'Two cancellations and a hotel swap in Gangwon at a new rate.', 'After the last coach invoice, in mid-December.'],
    ['KIX-M1104 · Kyoto incentive', 'One corporate client, one package price for 120 guests, agreed in May.', 'A gala dinner upgrade, daily rooming changes, the client’s PO amended twice.', 'Once the client agrees the final invoice, often in January.'],
    ['MUC-1128 · Christmas Markets', 'S$5,180 a head for 26 pax, priced in April with euro costs.', 'Only 18 seats sold, while the coach and the guide are fixed costs.', 'After the season, in January.'],
    ['CJU-1209 · Busan & Jeju', 'S$1,880 a head on a group air fare of 28 seats.', '12 sold, and the airline wants the names in three weeks.', 'Unknown: the group may not run at all.']
  ];
  picker('client', '.trv-board', '.trv-board button', function (s, k) {
    var d = DEP[+k], c = $('.trv-bc', s);
    $('.trv-bc-h', s).textContent = 'Departure ' + (+k + 1) + ' of 5';
    $('.trv-bc-t', s).textContent = d[0]; $('.trv-bc-a', s).textContent = d[1];
    $('.trv-bc-b', s).textContent = d[2]; $('.trv-bc-c', s).textContent = d[3];
    swap(c);
  }, 3600);

  /* ---------------------------------------------------------------- 3 · the tour P&L: rate and pax */
  var SOLD = 24, PRICE = 4280, AIR = 1350, QUOTED = [32400, 19008, 14850, 6480, 9072, 2400];
  function pl(s) {
    var r = s._rate / 100000, p = s._pax;            // S$ per yen
    var hot = p * 88000 + (p % 2 ? 44000 : 0), coach = 1650000, guide = 720000, meals = p * 42000;
    var c = [p * AIR, hot * r, coach * r, guide * r, meals * r, 2400];
    var rev = p * PRICE, tot = c.reduce(function (a, b) { return a + b; }, 0), mg = rev - tot, pct = mg / rev * 100;
    $('.trv-fx-v', s).textContent = 'S$' + (s._rate / 1000).toFixed(3) + ' per ¥100';
    $('.trv-pax-v', s).textContent = p;
    $$('.trv-seats i', s).forEach(function (el, i) { el.classList.toggle('is-off', i >= p); });
    $('.trv-r', s).textContent = m0(rev); $('.trv-r-n', s).textContent = p + ' × S$4,280';
    c.forEach(function (v, i) { var td = $('.trv-c' + i, s); td.textContent = m0(v); td.classList.toggle('is-up', Math.round(v) > QUOTED[i]); });
    var el = $('.trv-m', s);
    el.textContent = m0(mg) + ' · ' + pct.toFixed(1) + '%';
    el.dataset.state = pct >= 15 ? 'ok' : pct >= 12 ? 'warn' : 'bad';
    $('.trv-say-n', s).textContent = m0((hot + coach + guide + meals) / 10000);
  }
  Deck.on('knot', {
    init: function (s) {
      var seats = $('.trv-seats', s), r = $('.trv-fx input', s);
      for (var i = 0; i < SOLD; i++) seats.appendChild(document.createElement('i'));
      s._set = function (pax, rate) { s._pax = pax; s._rate = rate; r.value = rate; pl(s); };
      r.addEventListener('input', function () { s._rate = +r.value; pl(s); });
      $('.trv-pax-b', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-d]'); if (!b) return;
        s._pax = Math.max(16, Math.min(SOLD, s._pax + (+b.dataset.d))); pl(s);
      });
    },
    enter: function (ctx, s) {
      s._set(24, 900);
      // what happened to HKD-1027 between February and September: four cancellations, the yen up to 0.94
      ctx.after(1500, function () {
        ctx.tween(2200, function (p) { s._set(24 - Math.round(4 * p), Math.round((900 + 40 * p) / 2) * 2); }, 'io');
      });
    },
    settle: function (s) { s._set(20, 940); }
  });

  /* ---------------------------------------------------------------- 4 · the cash gap */
  var NS = 'http://www.w3.org/2000/svg', FULL = 102720;
  var MONTHS = [['Feb', 0], ['Mar', 28], ['Apr', 59], ['May', 89], ['Jun', 120], ['Jul', 150], ['Aug', 181], ['Sep', 212], ['Oct', 242], ['Nov', 273]];
  function events(dep) {
    var d = FULL * dep / 100;
    return [
      [37, d, 'Deposits in', 'in'], [42, -4800], [47, -5702, 'Air + hotel deposits', 'out'], [129, -7603], [139, -7425, 'Hotel + coach', 'out'],
      [185, -27600, 'Air tickets', 'out'], [210, FULL - d, 'Balance in', 'in'], [225, -13128], [241, -9072], [271, -2400], [298, -6480, 'Guide bill', 'out']
    ];
  }
  var X = function (day) { return 60 + day / 303 * 820; }, Y = function (v) { return 20 + (60000 - v) / 110000 * 320; };
  function el(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function chart(s, dep) {
    var svg = $('.trv-cv', s), ev = events(dep), cum = 0, d = 'M' + X(0) + ',' + Y(0), low = 0, lowDay = 0, start = null, days = 0;
    svg.textContent = '';
    var defs = el('defs', {}, svg);
    var cu = el('clipPath', { id: 'trv-cu' }, defs); el('rect', { x: 0, y: -40, width: 900, height: Y(0) + 40 }, cu);
    var cd = el('clipPath', { id: 'trv-cd' }, defs); el('rect', { x: 0, y: Y(0), width: 900, height: 400 }, cd);
    var cr = el('clipPath', { id: 'trv-cr' }, defs); s._reveal = el('rect', { x: 0, y: -40, width: s._w == null ? 900 : s._w, height: 460 }, cr);
    [-40000, -20000, 20000, 40000, 60000].forEach(function (v) {
      el('line', { class: 'g', x1: 60, x2: 880, y1: Y(v), y2: Y(v) }, svg);
      el('text', { class: 'ty', x: 52, y: Y(v) + 4, 'text-anchor': 'end' }, svg).textContent = (v / 1000) + 'k';
    });
    el('rect', { class: 'band', x: X(255), y: 20, width: X(263) - X(255), height: 320 }, svg);
    el('text', { class: 'bandt', x: X(259), y: 36, 'text-anchor': 'middle' }, svg).textContent = 'tour';
    MONTHS.forEach(function (m) { el('text', { class: 't', x: X(m[1]) + 4, y: 362 }, svg).textContent = m[0]; });
    var pts = [];
    ev.forEach(function (e) {
      var before = cum; cum += e[1];
      d += ' H' + X(e[0]).toFixed(1) + ' V' + Y(cum).toFixed(1);
      pts.push([e, cum]);
      if (cum < low) { low = cum; lowDay = e[0]; }
      if (before >= 0 && cum < 0 && start === null) start = e[0];
      if (before < 0 && cum >= 0 && start !== null) { days += e[0] - start; start = null; }
    });
    d += ' H' + X(303);
    var g = el('g', { 'clip-path': 'url(#trv-cr)' }, svg);
    var area = d + ' V' + Y(0) + ' H' + X(0) + ' Z';
    el('path', { class: 'up', d: area, 'clip-path': 'url(#trv-cu)' }, g);
    el('path', { class: 'dn', d: area, 'clip-path': 'url(#trv-cd)' }, g);
    el('line', { class: 'z', x1: 60, x2: 880, y1: Y(0), y2: Y(0) }, svg);
    el('text', { class: 'ty', x: 52, y: Y(0) + 4, 'text-anchor': 'end' }, svg).textContent = '0';
    if (low < 0) el('line', { class: 'pk', x1: 60, x2: X(lowDay), y1: Y(low), y2: Y(low) }, g);
    el('path', { class: 'ln', d: d }, g);
    pts.forEach(function (p) {
      var e = p[0], x = X(e[0]), y = Y(p[1]);
      el('circle', { class: e[1] > 0 ? 'din' : 'dout', cx: x, cy: y, r: 5 }, g);
      if (!e[2]) return;
      var up = e[3] === 'in', t = el('text', { class: 'el ' + e[3], x: x, y: up ? y - 12 : y + 22, 'text-anchor': e[0] > 280 ? 'end' : e[0] < 60 ? 'start' : 'middle' }, g);
      t.textContent = e[2];
    });
    $('.trv-gap-n', s).textContent = low < 0 ? m0(-low) : 'S$0';
    $('.trv-gap-d', s).textContent = days + ' days below zero';
  }
  Deck.on('gap', {
    init: function (s) {
      s._dep = 10;
      s._seg = seg($('.trv-dp', s), function (v) { s._dep = +v; chart(s, s._dep); });
    },
    enter: function (ctx, s) {
      s._seg('10', true); s._dep = 10; s._w = 0; chart(s, 10);
      ctx.after(500, function () {
        ctx.tween(1800, function (p) { s._w = 900 * p; s._reveal.setAttribute('width', s._w); }, 'io');
      });
    },
    settle: function (s) { s._seg('10', true); s._dep = 10; s._w = 900; chart(s, 10); }
  });

  /* ---------------------------------------------------------------- 5 · eight apps around one departure */
  var APPS = {
    crm: ['Selling', 'CRM', 'Website enquiries and corporate RFPs become opportunities, with the departure and the pax count on each. Incentive trips get their own pipeline.', 'Enquiries in a shared inbox and WhatsApp'],
    sale: ['Selling', 'Sales', 'A quotation template per tour, an optional section for add-ons, down-payment invoices for deposits, and every order line tagged with the departure’s analytic account.', 'PDF quotes rebuilt by hand for every enquiry'],
    sign: ['Selling', 'Sign', 'Guests confirm the quotation online with a signature, and incentive contracts or booking terms go out for signature from Sign.', 'Printed booking forms, scanned back'],
    web: ['Selling', 'eCommerce', 'Tour packages on the website with their departure dates as product variants, so a guest can book and pay online.', 'A brochure site with an enquiry form'],
    pur: ['Suppliers', 'Purchase', 'Hotel, coach and guide bookings as purchase orders in JPY, KRW or EUR, tagged to the departure. Air tickets from the GDS or consolidator are recorded as purchases too.', 'Supplier confirmations scattered in email'],
    docs: ['Guests', 'Documents', 'A restricted folder per departure for rooming lists and passport and visa copies, open only to the operations team.', 'Passport scans in a shared inbox'],
    acc: ['Money', 'Accounting', 'Four currencies with daily rates, a bank account per currency, follow-up reminders on balances, and exchange differences posted when bills are paid.', 'Rates typed into Excel, payments matched by eye'],
    dash: ['Money', 'Dashboards', 'Margin by departure, guest receipts against supplier payments by month, and deposits still to pay, live from the same database.', 'A season report built after the season']
  };
  picker('arch', '.trv-hub', '.trv-ap', function (s, k) {
    var a = APPS[k], p = $('.fb-ap', s), btn = $('.trv-ap[data-k="' + k + '"]', s);
    $$('.trv-hub-svg path', s).forEach(function (l) { l.classList.toggle('is-on', l.dataset.l === k); });
    $('.fb-ap-i', s).innerHTML = $('.oi', btn).outerHTML;
    $('.fb-ap-place', s).textContent = a[0];
    $('.fb-ap-t', s).textContent = a[1]; $('.fb-ap-d', s).textContent = a[2]; $('.fb-ap-r', s).textContent = a[3];
    swap(p);
  }, 3400);

  /* ---------------------------------------------------------------- 6 · workflow 1: one booking */
  function paintW1(s, n) {
    $$('.trv-rail button', s).forEach(function (b) {
      var k = +b.dataset.n, li = b.parentNode;
      li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n);
    });
    paintSteps($('.trv-bk', s), n);
    $('.trv-so-t em', s).classList.toggle('is-set', n >= 1);
    $('.trv-pay', s).dataset.k = n;
    $('.trv-cnt', s).textContent = n;
  }
  Deck.on('w1', {
    init: function (s) {
      var play = $('.trv-play', s);
      s._stop = function () { s._run = (s._run || 0) + 1; play.classList.remove('is-on'); $('span', play).textContent = 'Play the booking'; s._playing = false; };
      $$('.trv-rail button', s).forEach(function (b) { b.addEventListener('click', function () { s._stop(); Deck.go(Deck.index, +b.dataset.n); }); });
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

  /* ---------------------------------------------------------------- 7 · workflow 2: a yen bill, posted and paid */
  var BILL = 15510, YEN = 1650000;
  function fxPay(s) {
    var r = s._pr / 1000, bank = YEN * r / 100, diff = bank - BILL, row = $('.trv-je-x', s);
    $('.trv-fx2-v', s).textContent = 'S$' + r.toFixed(3) + ' per ¥100';
    $('.trv-pay-n', s).textContent = '28 Sep · rate ' + r.toFixed(3);
    $('.trv-paid', s).textContent = m2(bank); $('.trv-je-b', s).textContent = m2(bank);
    row.classList.toggle('is-gain', diff < 0);
    $('.trv-je-xl', s).textContent = Math.abs(diff) < 0.005 ? 'No exchange difference' : diff > 0 ? 'Foreign exchange loss' : 'Foreign exchange gain';
    $('.trv-je-xd', s).textContent = diff > 0.004 ? m2(diff) : '';
    $('.trv-je-xc', s).textContent = diff < -0.004 ? m2(diff) : '';
  }
  function paintW2(s, n) {
    paintSteps($('.trv-fxw', s), n);
    $('.trv-pd', s).classList.toggle('is-bad', n >= 2);
  }
  Deck.on('w2', {
    init: function (s) {
      var r = $('.trv-fx--sm input', s);
      s._pr = 955;
      r.addEventListener('input', function () { s._pr = +r.value; fxPay(s); });
      s._resetFx = function () { s._pr = 955; r.value = 955; fxPay(s); };
    },
    enter: function (ctx, s) { s._resetFx(); },
    step: function (n, ctx, s) { paintW2(s, n); },
    settle: function (s) { s._resetFx(); paintW2(s, 3); }
  });

  /* ---------------------------------------------------------------- 8 · rollout stops */
  var PH = [
    ['Set up SGD, JPY, KRW and EUR with daily rates, a bank account per currency, the exchange difference accounts and the chart of accounts. Everything else reads these.', ['Rates typed into each quote', 'Rates fetched every day'], ['Yen bills booked at a guess', 'Each bill at its own date’s rate']],
    ['A project template per tour product, so every new departure gets its own analytic account; hotel, coach and guide bookings as purchase orders in the supplier’s currency.', ['One costing spreadsheet per tour', 'A live P&L per departure'], ['Deposits agreed in email', 'Purchase orders and bills in JPY, KRW, EUR']],
    ['CRM for enquiries and incentive RFPs, quotation templates with add-ons, online confirmation, down-payment invoices and follow-up reminders.', ['Quotes rebuilt by hand', 'A template per tour, signed online'], ['Balances chased by phone', 'Reminders sent on schedule']],
    ['Dashboards for margin by departure and the cash gap by month; Documents for rooming lists and passport copies in restricted folders.', ['Margin known after the season', 'Margin watched from the first booking'], ['Passport scans in a shared inbox', 'One restricted folder per departure']]
  ];
  picker('rollout', '.trv-stops', '.trv-stops button', function (s, k) {
    var p = PH[+k], d = $('.fb-pd', s), rows = $$('.fb-ba li', s);
    $('.fb-pd-do', s).textContent = p[0];
    rows.forEach(function (li, i) { $('.fb-b', li).textContent = p[i + 1][0]; $('.fb-a', li).textContent = p[i + 1][1]; });
    swap(d);
  }, 4200);
})();

/* Industry case study · Ecommerce. Slide behaviour. Kelpmere Skin is a sample company and every figure is sample data,
   labelled on its slide. Every slide whose finished state comes from JS has a settle hook (overview, print, PDF). */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  function money(n) { return 'S$' + Math.abs(n).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function num(n) { return Math.round(n).toLocaleString('en-SG'); }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function seg(root, fn) {
    function set(v, quiet) {
      $$('button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      if (!quiet) fn(v);
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    return set;
  }
  function swap(el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }

  // jump links: data-go="slide id"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.stopPropagation(); Deck.goId(b.dataset.go, 0);
  });

  /* ---------------------------------------------------------------- 2 · four shop fronts, one shelf */
  var DAY = {
    tue: { clock: 'Tuesday 14:40', q: [512, 512, 515, 509], u: ['typed in at 13:00', 'typed in at 13:00', 'typed in at 13:05', 'typed in at 13:10'],
      shelf: 498, gap: '17 units', say: 'Close enough. Nobody notices.', f1: '18', f2: 'every 4 hours' },
    sale: { clock: '11 Nov, 00:45', q: [600, 600, 600, 600], u: ['typed in at 23:30', 'typed in at 23:30', 'typed in at 23:30', 'typed in at 23:30'],
      shelf: 0, gap: '600 units', say: 'Every shop is still selling serums that are already gone.', f1: '1,140', f2: 'every 4 hours' }
  };
  Deck.on('client', {
    init: function (s) {
      s._set = seg($('.ecm-day', s), function (v) {
        var d = DAY[v], box = $('.ecm-sf', s);
        box.dataset.day = v;
        $('.ecm-sf-clock', s).textContent = d.clock;
        $$('[data-q]', s).forEach(function (el, i) { el.textContent = d.q[i]; });
        $$('[data-u]', s).forEach(function (el, i) { el.textContent = d.u[i]; });
        $('.ecm-shelf-fill', s).style.width = (d.shelf / 600 * 100) + '%';
        $('.ecm-shelf-n', s).textContent = d.shelf;
        $('.ecm-gap', s).textContent = d.gap; $('.ecm-verdict', s).textContent = d.say;
        $('.ecm-f1', s).textContent = d.f1; $('.ecm-f2', s).textContent = d.f2;
        s._held = true;
      });
    },
    enter: function (ctx, s) {
      s._set('tue'); s._held = false;
      ctx.after(3200, function () { if (!s._held) s._set('sale'); });
    },
    settle: function (s) { s._set('sale'); }
  });
  // the auto switch must not count as the presenter's click
  (function () {
    var s = document.getElementById('client'); if (!s) return;
    $('.ecm-day', s).addEventListener('click', function () { s._held = true; }, true);
  })();

  /* ---------------------------------------------------------------- 3 · the night, hour by hour */
  // units sold since midnight: Shopee, TikTok Shop, Lazada, Website, inside Glow Trio gift sets
  var NIGHT = [[0, 0, 0, 0, 0], [150, 90, 60, 40, 80], [260, 170, 110, 70, 160], [290, 195, 125, 80, 210], [290, 195, 125, 80, 210], [290, 195, 125, 80, 210]];
  var NT = ['23:59', '00:10', '00:30', '00:55', '09:00', 'Day 3'];
  var NSAY = [
    'Midnight. Four shop fronts each say <b>600 in stock</b>. The sale is about to open.',
    '420 serums gone in ten minutes, <b>80 of them inside gift sets</b> that no count takes them from.',
    'The shelf was empty just after 00:15. <b>Every shop still says 600.</b>',
    'Two people finish zeroing four seller centres. <b>900 sold against 600.</b> The gift set still says 90.',
    'Picking starts. <b>300 orders can’t be filled</b>: 230 serums and 70 gift sets, cancelled and refunded.',
    'Cancellations count against the shop: <b>penalty points</b> on Shopee, seller-performance hits on the others.'
  ];
  function night(s, n) {
    var d = NIGHT[n], tot = sum(d), over = Math.max(0, tot - 600);
    $$('.ecm-seg', s).forEach(function (el, i) { el.style.width = (d[i] / 10) + '%'; });
    $('.ecm-over', s).style.width = (over / 10) + '%';
    $('.ecm-race-t', s).textContent = NT[n];
    $$('.ecm-hours button', s).forEach(function (b) {
      var k = +b.dataset.n, li = b.parentNode;
      li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n);
    });
    var say = $('.ecm-say', s); $('.ecm-say-x', s).innerHTML = NSAY[n]; swap(say);
    $$('[data-s]', s).forEach(function (el) { el.textContent = n >= 3 ? '0' : '600'; el.classList.toggle('is-stale', n === 2); });
    var kq = $('.ecm-kit-q', s); kq.textContent = 300 - d[4]; kq.classList.toggle('is-stale', n >= 2);
    $('.ecm-ct-o', s).textContent = num(over);
    $('.ecm-ct-c', s).textContent = n >= 4 ? '300' : '0';
    $('.ecm-ct-v', s).textContent = (n >= 4 ? money(15890) : 'S$0.00') + ' refunded';
  }
  Deck.on('night', {
    init: function (s) {
      $$('.ecm-hours button', s).forEach(function (b) { b.addEventListener('click', function () { Deck.go(Deck.index, +b.dataset.n); }); });
    },
    step: function (n, ctx, s) { night(s, Math.min(n, 5)); },
    settle: function (s) { night(s, 5); }
  });

  /* ---------------------------------------------------------------- 4 · knot 1: sold on an old number */
  var PRE = { tue: [0.3, 25], sale: [12, 25] };
  function blind(s) {
    var r = +$('.ecm-r-rate', s).value, m = +$('.ecm-r-min', s).value, b = Math.round(r * m);
    $('.ecm-sl-r', s).textContent = r < 1 ? r.toFixed(1) : (r % 1 ? r.toFixed(1) : r);
    $('.ecm-sl-m', s).textContent = m;
    $('.ecm-blind-n', s).textContent = num(b);
    $('.ecm-blind', s).classList.toggle('is-ok', b <= 60);
  }
  Deck.on('knots', {
    init: function (s) {
      var rr = $('.ecm-r-rate', s), rm = $('.ecm-r-min', s), pre = $('.ecm-pre', s);
      s._pre = seg(pre, function (v) { rr.value = PRE[v][0]; rm.value = PRE[v][1]; blind(s); });
      [rr, rm].forEach(function (r) {
        r.addEventListener('input', function () { $$('button', pre).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); blind(s); });
      });
    },
    enter: function (ctx, s) {
      s._pre('tue');
      ctx.after(1300, function () {
        s._pre('sale', true);
        ctx.tween(1500, function (p) { $('.ecm-r-rate', s).value = (0.3 + 11.7 * p).toFixed(1); blind(s); }, 'io');
      });
    },
    settle: function (s) { s._pre('sale'); }
  });

  /* ---------------------------------------------------------------- 5 · one database: four flows */
  var FLOWS = {
    orders: ['Website orders are Sales orders the moment they are paid.',
      'Marketplace orders and their delivery slips arrive through each connector, on its sync schedule.',
      'Each order reserves stock in the one warehouse; website customers who opt in join Email Marketing.'],
    stock: ['One on-hand figure per product, in one warehouse, read by every shop front.',
      'Gift sets are kits: selling a Glow Trio takes a serum, a toner and a cream.',
      'The website reads stock directly; the connectors send stock levels back out to each marketplace.'],
    money: ['Marketplace orders are invoiced into a clearing account per marketplace, at the full price.',
      'Each settlement report is imported into Accounting: commission, fees, vouchers and refunds booked.',
      'The payout’s bank line is matched, and the clearing account goes back to zero.'],
    returns: ['A return request opens in Helpdesk, linked to the order and the customer.',
      'The parcel comes back on a return receipt, into a check location, not onto the shelf.',
      'A quality check decides: back to stock, or scrapped. Then the credit note or refund.']
  };
  function flow(s, v) {
    var m = $('.ecm-map', s);
    m.dataset.flow = v;
    $$('[data-f]', m).forEach(function (el) { el.classList.toggle('is-on', el.dataset.f.split(' ').indexOf(v) > -1); });
    $$('.ecm-cap-t', s).forEach(function (el, i) { el.textContent = FLOWS[v][i]; });
    swap($('.ecm-cap', s));
  }
  Deck.on('arch', {
    init: function (s) {
      s._set = seg($('.ecm-flow', s), function (v) { flow(s, v); });
      $('.ecm-flow', s).addEventListener('click', function () { s._held = true; }, true);
    },
    enter: function (ctx, s) {
      var keys = ['orders', 'stock', 'money', 'returns'], i = 0;
      s._held = false; s._set('orders');
      ctx.every(4400, function () { if (s._held) return; i = (i + 1) % keys.length; s._set(keys[i]); });
    },
    settle: function (s) { s._set('stock'); }
  });

  /* ---------------------------------------------------------------- 6 · workflow 1: the same midnight, two ways */
  var SIM = {
    odoo: {
      d: [[0, 0, 0, 0, 0], [80, 45, 30, 20, 40], [200, 120, 80, 52, 108], [214, 128, 86, 56, 116], [221, 132, 87, 56, 116], [221, 132, 87, 56, 116]],
      say: ['One figure for every shop front. Each order reserves from it.',
        '215 reserved, 40 of them through Glow Trio kits. The marketplaces get 385 at the 00:05 sync.',
        '40 left. The website shows it as it changes; the marketplaces got 40 at the 00:15 sync.',
        'Zero. The website stops selling at once; the marketplaces get zero at their next sync.',
        '12 orders came in during the gap. They are in Sales now: 12 customers to call, not 300.',
        '600 picked and shipped. The 12 were offered a restock date or a refund last night.']
    },
    hand: {
      d: [[0, 0, 0, 0, 0], [80, 45, 30, 20, 40], [200, 120, 80, 52, 108], [214, 128, 86, 56, 116], [236, 140, 93, 61, 130], [290, 195, 125, 80, 210]],
      say: ['Four seller centres, each typed in at 23:30: 600.',
        '215 sold. The shops still say 600; nobody has time to look.',
        '560 sold. Gift sets have used 108 serums that no count knows about.',
        'The shelf is empty. Every shop keeps selling.',
        '660 sold. Two people start zeroing four seller centres.',
        '900 sold, 300 to cancel at picking. Same demand, 25 times the damage.']
    }
  };
  var SYNC = ['00:00', '00:05', '00:15', '00:15', '00:20', '00:20'];
  function sim(s, n) {
    var mode = s._mode, d = SIM[mode].d[n], tot = sum(d), fc = 600 - tot, box = $('.ecm-sim', s);
    box.dataset.mode = mode;
    $$('.ecm-time button', s).forEach(function (b) {
      var k = +b.dataset.n, li = b.parentNode;
      li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n);
    });
    // what a marketplace lists: the forecast at its last sync (Odoo) or the 23:30 figure (by hand)
    var synced = [600, 385, 40, 40, 0, 0][n];
    $$('.ecm-ln', s).forEach(function (ln, i) {
      var q = $('.ecm-ln-q', ln), list, when, cls = '';
      $('[data-sold]', ln).textContent = num(d[i]);
      if (mode === 'odoo') {
        if (i === 3 || i === 4) { list = Math.max(0, fc); when = i === 3 ? 'live' : 'kit, live'; }
        else { list = synced; when = n === 0 ? 'listed' : 'synced ' + SYNC[n]; if (n === 3) { when = 'next sync 00:20'; cls = 'is-wait'; } }
        if (list === 0) { cls = 'is-zero'; when = i === 3 || i === 4 ? 'out of stock' : when; }
      } else {
        list = i === 4 ? 300 - d[4] : (n >= 5 ? 0 : 600);
        when = n >= 5 && i < 4 ? 'zeroed 00:55' : (i === 4 ? 'own count' : 'typed 23:30');
        if (tot > 600 && list > 0) cls = 'is-stale';
        if (list === 0) cls = 'is-zero';
      }
      $('[data-list]', ln).textContent = num(list); $('[data-when]', ln).textContent = when;
      q.className = 'ecm-ln-q ' + cls;
      ln.classList.toggle('is-live', n >= 1 && n <= 4 && list > 0);
    });
    $('.ecm-oh', s).textContent = n >= 5 ? '0' : '600';
    var f = $('.ecm-fc', s), shown = mode === 'odoo' ? fc : Math.max(0, tot - 600);
    $('.ecm-fc-l', s).textContent = mode === 'odoo' ? 'Forecasted' : 'Oversold';
    f.textContent = num(shown);
    f.classList.toggle('is-neg', mode === 'odoo' ? fc < 0 : shown > 0);
    f.classList.toggle('is-zero', mode === 'odoo' && fc === 0);
    var left = Math.max(0, fc), g = $('.ecm-g-fill', s);
    g.style.width = (left / 6) + '%';
    g.style.background = left < 100 ? 'var(--amber)' : 'var(--ok)';
    $('.ecm-kit-a', s).textContent = mode === 'odoo' ? num(left) : 'own count';
    $('.ecm-inv-kit span', s).lastChild.textContent = mode === 'odoo' ? ' can be sold' : ', takes no serum';
    $('.ecm-inv-kit span', s).firstChild.textContent = mode === 'odoo' ? 'Glow Trio · kit · ' : 'Glow Trio · ';
    $('.ecm-say-t', s).textContent = ['00:00', '00:05', '00:15', '00:17', '00:20', '09:00'][n];
    $('.ecm-say-d', s).textContent = SIM[mode].say[n];
    $('.ecm-inv-url', s).textContent = mode === 'odoo' ? 'Kelpmere Skin · Inventory' : 'Kelpmere Skin · stock sheet, by hand';
  }
  Deck.on('w1', {
    init: function (s) {
      var play = $('.ecm-play', s);
      s._mode = 'odoo';
      s._stop = function () { s._run = (s._run || 0) + 1; play.classList.remove('is-on'); $('span', play).textContent = 'Play'; s._playing = false; };
      s._setMode = seg($('.ecm-mode', s), function (v) { s._mode = v; sim(s, Math.max(0, Deck.slides.indexOf(s) === Deck.index ? Deck.step : 5)); });
      $$('.ecm-time button', s).forEach(function (b) { b.addEventListener('click', function () { s._stop(); Deck.go(Deck.index, +b.dataset.n); }); });
      play.addEventListener('click', function () {
        if (s._playing || !s._ctx) { s._stop(); return; }
        var tok = (s._run || 0) + 1; s._run = tok; s._playing = true;
        play.classList.add('is-on'); $('span', play).textContent = 'Pause';
        Deck.go(Deck.index, Deck.step >= 5 ? 0 : Deck.step + 1);
        s._ctx.every(1800, function () {
          if (s._run !== tok) return;
          if (Deck.index !== Deck.slides.indexOf(s) || Deck.step >= 5) { s._stop(); return; }
          Deck.go(Deck.index, Deck.step + 1);
        });
      });
    },
    enter: function (ctx, s) { s._ctx = ctx; s._stop(); s._setMode('odoo', true); s._mode = 'odoo'; },
    step: function (n, ctx, s) { sim(s, Math.min(n, 5)); },
    leave: function (s) { s._stop(); },
    settle: function (s) { s._setMode('odoo', true); s._mode = 'odoo'; sim(s, 5); }
  });

  /* ---------------------------------------------------------------- 7 · workflow 2: one payout, matched */
  var PAY = {
    sp: { name: 'Shopee', gross: 18640, cut: [1118.40, 372.80, 1490.00, 214.60, 356.00], period: 'sales 11–17 Nov', bank: 'Bank · SHOPEE PAYOUT · 25 Nov' },
    lz: { name: 'Lazada', gross: 9860, cut: [591.60, 197.20, 640.00, 98.40, 168.00], period: 'sales 11–17 Nov', bank: 'Bank · LAZADA PAYOUT · 26 Nov' },
    tt: { name: 'TikTok Shop', gross: 12420, cut: [745.20, 248.40, 1120.00, 156.00, 210.00], period: 'sales 11–17 Nov', bank: 'Bank · TIKTOK SHOP PAYOUT · 24 Nov' }
  };
  function payout(s, n) {
    var p = PAY[s._mk], cuts = sum(p.cut), net = Math.round((p.gross - cuts) * 100) / 100, run = p.gross;
    var rows = $$('.ecm-wf-rows li', s);
    function bar(li, left, w, txt) {
      var on = +li.dataset.on <= n, i = $('.ecm-wf-bar i', li);
      li.classList.toggle('is-on', on);
      i.style.left = (left / p.gross * 100) + '%'; i.style.width = on ? (w / p.gross * 100) + '%' : '0';
      $('b', li).textContent = txt;
    }
    bar(rows[0], 0, p.gross, money(p.gross));
    p.cut.forEach(function (c, k) { run -= c; bar(rows[k + 1], run, c, '−' + money(c)); });
    bar(rows[6], 0, net, money(net));
    bar(rows[7], 0, net, money(net));
    $('.ecm-wf-p', s).textContent = p.period;
    $$('.ecm-je-s li', s).forEach(function (li) { var k = +li.dataset.on; li.classList.toggle('is-on', k <= n); li.classList.toggle('is-now', k === n); });
    $('.ecm-je-1', s).textContent = 'into the ' + p.name + ' clearing account';
    $('.ecm-je-3', s).textContent = p.bank;
    $('.ecm-je-a1', s).textContent = money(p.gross);
    $('.ecm-je-a2', s).textContent = '−' + money(cuts);
    $('.ecm-je-a3', s).textContent = money(net);
    $('.ecm-clr-l', s).textContent = p.name + ' clearing account';
    var clr = [0, p.gross, net, net, 0][n];
    $('.ecm-clr-n', s).textContent = money(clr);
    $('.ecm-clr', s).classList.toggle('is-zero', n >= 4);
  }
  Deck.on('w2', {
    init: function (s) {
      s._mk = 'sp';
      s._set = seg($('.ecm-mk', s), function (v) { s._mk = v; payout(s, Deck.slides.indexOf(s) === Deck.index ? Math.min(Deck.step, 4) : 4); });
    },
    enter: function (ctx, s) { s._set('sp', true); s._mk = 'sp'; },
    step: function (n, ctx, s) { payout(s, Math.min(n, 4)); },
    settle: function (s) { s._set('sp', true); s._mk = 'sp'; payout(s, 4); }
  });

  /* ---------------------------------------------------------------- 8 · rollout phases */
  var PH = [
    ['Clean the 38 products so each internal reference matches its marketplace SKU, set up the six gift sets as kits, count the warehouse once, and connect the bank.',
      ['Gift sets with their own count', 'Gift sets as kits'], ['Stock in four seller centres', 'One stock figure']],
    ['Move the website shop onto Odoo eCommerce: same products and prices, stock read from Inventory, paid orders straight into Sales and picking.',
      ['Website stock typed in by hand', 'Website stops at zero'], ['Orders exported to a sheet', 'Orders straight to picking']],
    ['Connect Shopee first and run a normal week, then Lazada, then TikTok Shop. All live well before the next mega-sale, never during one.',
      ['Four seller centres updated by hand', 'Stock sent out by the connector'], ['Orders re-keyed for picking', 'Orders and delivery slips in Sales']],
    ['Import each marketplace’s settlement report and match payouts, take returns through Helpdesk with a quality check, and email website customers who opted in.',
      ['Payouts that never match', 'Every payout matched to the bank'], ['Returns back on the shelf', 'Returns checked before restock']]
  ];
  function phase(s, k) {
    var p = PH[+k], d = $('.fb-pd', s);
    $$('.fb-ph button', s).forEach(function (b) { b.classList.toggle('is-on', b.dataset.k === String(k)); });
    $('.fb-pd-do', s).textContent = p[0];
    $$('.fb-ba li', s).forEach(function (li, i) { $('.fb-b', li).textContent = p[i + 1][0]; $('.fb-a', li).textContent = p[i + 1][1]; });
    swap(d);
  }
  Deck.on('rollout', {
    init: function (s) {
      $('.fb-ph', s).addEventListener('click', function (e) {
        var b = e.target.closest('.fb-ph button'); if (!b) return;
        s._held = true; phase(s, b.dataset.k);
      });
    },
    enter: function (ctx, s) {
      var i = 0; s._held = false;
      ctx.after(1400, function () {
        ctx.every(4200, function () { if (s._held) return; i = (i + 1) % PH.length; phase(s, i); });
      });
    },
    settle: function (s) { phase(s, 0); }
  });
})();

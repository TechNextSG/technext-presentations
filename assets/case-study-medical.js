/* Industry case study · Medical. Slide behaviour. Kinsail Medical is a sample company and every figure is sample data,
   labelled on its slide. Every slide whose finished state comes from JS has a settle hook (overview, print, PDF). */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  function sgd(n) { return 'S$' + Math.round(n).toLocaleString('en-SG'); }
  function seg(root, fn) {
    function set(v, quiet) {
      $$('button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      if (!quiet) fn(v);
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    return set;
  }
  function swap(el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }
  function pickText(spec, n) {
    var out = '';
    spec.split('|').forEach(function (part) { var i = part.indexOf(':'), k = +part.slice(0, i); if (k <= n) out = part.slice(i + 1); });
    return out;
  }
  // a set of buttons that cycles on its own until the presenter clicks one
  function picker(id, list, sel, paint, pace, settleKey) {
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
        ctx.after(1400, function () {
          if (!s._held) s._pick(keys[0]);
          ctx.every(pace, function () { if (s._held) return; i = (i + 1) % keys.length; s._pick(keys[i]); });
        });
      },
      settle: function (s) { s._pick(settleKey || $(sel, s).dataset.k, true); }
    });
  }

  // jump links: data-go="slide id"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.stopPropagation(); Deck.goId(b.dataset.go, 0);
  });

  /* ---------------------------------------------------------------- 1 · cover: dot clusters under each clinic */
  $$('#cover .mdc-pts', stage).forEach(function (g) {
    var hit = Math.round(+g.dataset.n / 5), html = '';
    for (var i = 0; i < 24; i++) html += '<i' + (i < Math.min(hit, 24) ? ' class="is-hit"' : '') + '></i>';
    g.innerHTML = html;
  });

  /* ---------------------------------------------------------------- 2 · the client: seven places */
  var PLACES = {
    cs: ['Central store · Ubi', 'Receives from 40 suppliers, restocks six clinics.', 'A master Excel and the suppliers’ delivery orders', 'When a carton is opened', 'On the delivery order, if the supplier prints it', 'No patients: restocks go out from WhatsApp lists'],
    tmp: ['Tampines · GP', 'The busiest clinic: 120 visits a day.', 'TMP_stock_v7.xlsx, counted monthly', 'Coloured stickers on the fridge', 'Not recorded', '62% of visits · keyed into 4 TPA portals at month-end'],
    jur: ['Jurong East · GP', 'Two doctors, one dispensary assistant.', 'A shared Google Sheet with three editors', 'Checked every quarter', 'Not recorded', '58% of visits · sent when the manager has time'],
    wdl: ['Woodlands · GP', 'Runs on locum doctors three days a week.', 'Paper stock cards, typed up on Fridays', 'Checked every quarter', 'Sometimes, on the paper card', '71% of visits · locum notes often incomplete'],
    tpy: ['Toa Payoh · GP', 'An older practice with many regulars.', 'Excel, updated by the dispensary assistant', 'A monthly sticker check', 'Not recorded', '49% of visits · two corporate panels billed by spreadsheet'],
    orc: ['Orchard · aesthetic', 'Fillers, skin care and consumables.', 'Excel for products, sold by the box', 'Checked when a box is opened', 'Copied into the treatment note, not the stock', 'Few panels: mostly self-pay'],
    hlv: ['Holland Village · aesthetic', 'The newest clinic, opened last year.', 'A copy of the Orchard sheet', 'Checked when a box is opened', 'Copied into the treatment note, not the stock', 'Few panels: mostly self-pay']
  };
  picker('client', '.mdc-map', '.mdc-pin', function (s, k) {
    var p = PLACES[k], d = $('.mdc-cd', s);
    $('.mdc-cd-h', s).textContent = p[0];
    $('.mdc-cd-t', s).textContent = p[1];
    $('.mdc-cd-s', s).textContent = p[2]; $('.mdc-cd-e', s).textContent = p[3];
    $('.mdc-cd-l', s).textContent = p[4]; $('.mdc-cd-p', s).textContent = p[5];
    swap(d);
  }, 3400, 'tmp');

  /* ---------------------------------------------------------------- 3 · the recall: clock, fridges, who got it */
  var GROUPS = [['Tampines', 360, 68], ['Jurong East', 300, 59], ['Woodlands', 220, 33], ['Toa Payoh', 260, 52]];
  var HOURS = [0, 1, 6, 26, 50, 76];
  function clock(h) { return h < 24 ? h + ' h' : Math.floor(h / 24) + ' d ' + (h % 24) + ' h'; }
  function paintRecall(s, n, ctx) {
    $$('.mdc-ft', s).forEach(function (t) {
      var k = +t.dataset.s; t.classList.toggle('is-on', k <= n); t.classList.toggle('is-now', k === n);
      var a = $('.mdc-ft-a', t); a.textContent = pickText(a.dataset.t, n);
    });
    var c = $('.mdc-clock-n', s), h = HOURS[Math.min(n, 5)];
    if (ctx && !Deck.reduce) ctx.tween(600, function (p) { c.textContent = clock(Math.round((s._h || 0) + (h - (s._h || 0)) * p)); }, 'out');
    else c.textContent = clock(h);
    s._h = h; s._n = n;
    paintPeople(s);
  }
  function paintPeople(s) {
    var pp = $('.mdc-pp', s), n = s._n || 0, truth = s._mode === 'truth';
    pp.classList.toggle('is-sheet', n >= 4 && !truth);
    pp.classList.toggle('is-truth', truth);
    $('.mdc-pp-n', s).textContent = truth ? '212' : (n >= 4 ? '1,140' : '?');
    $('.mdc-pp-s', s).textContent = truth ? 'given lot IV-2417B: the people who really need a call'
      : (n >= 4 ? 'all must be contacted: records say “flu vaccine”, never the lot' : 'Dispensing records say “flu vaccine”, never the lot');
  }
  Deck.on('recall', {
    init: function (s) {
      var html = '';
      GROUPS.forEach(function (g) {
        var dots = Math.round(g[1] / 5), hit = Math.round(g[2] / 5), d = '';
        for (var i = 0; i < dots; i++) d += '<i' + (Math.floor(i * hit / dots) !== Math.floor((i + 1) * hit / dots) ? ' class="is-hit"' : '') + '></i>';
        html += '<div class="mdc-dg"><div class="mdc-dg-d">' + d + '</div><p style="margin:0"><b>' + g[0] + '</b><small>' + g[1] + ' vaccinated · ' + g[2] + ' got the lot</small></p></div>';
      });
      $('.mdc-dots', s).innerHTML = html;
      s._mode = 'sheet';
      s._set = seg($('.mdc-pp-seg', s), function (v) { s._mode = v; paintPeople(s); });
    },
    enter: function (ctx, s) { s._h = 0; s._mode = 'sheet'; s._set('sheet', true); },
    step: function (n, ctx, s) { paintRecall(s, n, ctx); },
    settle: function (s) { s._mode = 'truth'; s._set('truth', true); paintRecall(s, 5, null); }
  });

  /* ---------------------------------------------------------------- 4 · missing columns: three bills */
  var COLS = [['lot', 'visit'], ['lot', 'exp'], ['visit', 'bill']];
  // written off by clinic and month, S$ (sample): Apr to Sep
  var HM = [['Tampines', [620, 380, 1240, 410, 980, 1460]], ['Jurong East', [310, 720, 260, 1100, 540, 690]], ['Woodlands', [1380, 450, 890, 1520, 300, 760]],
    ['Toa Payoh', [240, 510, 380, 290, 870, 420]], ['Orchard', [160, 90, 450, 120, 210, 380]], ['Holland V', [80, 130, 60, 240, 100, 150]]];
  (function (s) {
      var h = '<span></span>' + ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map(function (m) { return '<span class="hm-m">' + m + '</span>'; }).join('');
      HM.forEach(function (r) {
        h += '<span>' + r[0] + '</span>' + r[1].map(function (v) {
          var a = Math.min(1, v / 1520);
          return '<i title="S$' + v + '" style="background:rgba(180,55,43,' + (0.08 + a * 0.82).toFixed(2) + ')"></i>';
        }).join('');
      });
      $('.mdc-hm', s).innerHTML = h;
  })(document.getElementById('gap'));
  picker('gap', '.mdc-bills', '.mdc-bill', function (s, k) {
    var cols = COLS[+k];
    $('.mdc-bills', s).classList.add('has-on');
    $$('.mdc-gh', s).forEach(function (c) { c.classList.toggle('is-on', cols.indexOf(c.dataset.c) > -1); });
  }, 3600);

  /* ---------------------------------------------------------------- 5 · apps around the lot */
  var APPS = {
    stock: ['Inventory', 'Lots and expiration dates on every vaccine and medicine. FEFO removal sends the earliest expiry out first, Expiration Alerts list what is close, and seven warehouses (the central store and six clinics) share one stock.', ['lot', 'exp', 'loc', 'trace']],
    purchase: ['Purchase', 'Purchase orders from reordering rules at the central store. The lot and its expiration date are entered once, at the vendor receipt, and follow the stock from then on.', ['pur', 'lot']],
    pos: ['Point of Sale', 'Self-pay dispensing at each clinic counter. The lot is recorded on the sale and the customer is on the order, so the sale appears in the lot’s traceability.', ['pos', 'trace']],
    sale: ['Sales', 'Panel visits as sales orders to the panel company, each with its visit reference. Every Friday they are invoiced together with Consolidated Billing.', ['sale', 'trace']],
    account: ['Accounting', 'Invoices print the lot (Display Lots & Serial Numbers on Invoices). Follow-up Reports chase each panel by level, and an analytic account per clinic gives a P&L per clinic.', ['acc']],
    appointment: ['Appointments', 'Online booking per clinic and doctor, with email and SMS reminders: vaccination slots fill without phone calls. Consultations themselves stay in the clinic system.', []],
    sign: ['Sign', 'Consent forms for aesthetic treatments, signed on a tablet at the counter and kept with the signed copy, not in a drawer.', []],
    documents: ['Documents', 'Supplier recall notices, certificates and delivery orders filed in one place and linked to the record they belong to.', ['docs']]
  };
  picker('apps', '.mdc-al-l', '.mdc-al-l button', function (s, k) {
    var a = APPS[k], d = $('.mdc-al-d', s), lf = $('.mdc-lf', s);
    $('.mdc-al-h', s).textContent = 'Fills: ' + (a[2].length ? a[2].map(function (f) { return F[f]; }).join(' · ') : 'the front desk');
    $('.mdc-al-t', s).textContent = a[0]; $('.mdc-al-x', s).textContent = a[1];
    lf.classList.toggle('has-on', a[2].length > 0);
    $$('[data-f]', lf).forEach(function (el) { el.classList.toggle('is-on', a[2].indexOf(el.dataset.f) > -1); });
    swap(d);
  }, 3800);
  var F = { lot: 'lot', exp: 'expiry', loc: 'where it is', trace: 'traceability', pur: 'receipt', pos: 'self-pay sale', sale: 'panel visit', acc: 'invoice', docs: 'documents' };

  /* ---------------------------------------------------------------- 6 · workflow 1: trace a lot */
  var LOTS = {
    'IV-2417B': { prod: 'Influenza vaccine 0.5 ml (sample)', exp: '31/03/2027', rin: ['CS/IN/00231', '02/09'], sent: [120, 100, 80, 100], sold: [68, 59, 33, 52], panel: [27, 22, 9, 6], t0: 512 },
    'IV-2420A': { prod: 'Influenza vaccine 0.5 ml (sample)', exp: '30/04/2027', rin: ['CS/IN/00247', '16/09'], sent: [100, 80, 60, 60], sold: [31, 22, 18, 25], panel: [12, 9, 5, 4], t0: 538 },
    'AMX-5512': { prod: 'Amoxicillin 500 mg, box of 21 (sample)', exp: '31/08/2028', rin: ['CS/IN/00219', '20/08'], sent: [60, 50, 40, 50], sold: [44, 39, 28, 41], panel: [19, 16, 13, 11], t0: 471 }
  };
  var CL = [['TMP', 'Tampines'], ['JUR', 'Jurong East'], ['WDL', 'Woodlands'], ['TPY', 'Toa Payoh']];
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function buildTrace(s) {
    var L = LOTS[s._lot], rows = [], tot = sum(L.sent);
    rows.push([2, L.rin[0], L.rin[1], 'Vendor → CS/Stock', tot, '']);
    CL.forEach(function (c, i) { rows.push([3, 'CS/INT/00' + (L.t0 + i), L.rin[1].replace(/^\d+/, function (d) { return ('0' + (+d + 1)).slice(-2); }), 'CS/Stock → ' + c[0] + '/Stock', L.sent[i], '']); });
    CL.forEach(function (c, i) { rows.push([4, c[0] + ' · ' + L.sold[i] + ' sales', 'to date', c[0] + '/Stock → Customers <small>' + (L.sold[i] - L.panel[i]) + ' POS orders · ' + L.panel[i] + ' panel orders</small>', L.sold[i], 't-s']); });
    rows.push([5, '4 × …/INT', 'today', 'Clinic stock → Quarantine', tot - sum(L.sold), 't-q']);
    $('.mdc-tt tbody', s).innerHTML = rows.map(function (r) {
      return '<tr data-on="' + r[0] + '" class="' + r[5] + '"><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td>' + r[4] + '</td></tr>';
    }).join('');
    $('.mdc-tsum', s).innerHTML = CL.map(function (c, i) {
      return '<p><b>' + c[1] + '</b><span>' + L.sent[i] + ' in · ' + L.sold[i] + ' sold</span><span>' + (L.sent[i] - L.sold[i]) + ' blocked</span></p>';
    }).join('') + '<p class="ts-tot"><b>' + sum(L.sold) + '</b>customers to contact</p>';
    $('.mdc-tw-lot', s).textContent = s._lot;
    $('.mdc-tw-prod', s).textContent = L.prod;
    $('.mdc-tw-exp', s).textContent = 'Expiration Date ' + L.exp;
  }
  function paintTrace(s, n) {
    s._n = n;
    $$('.mdc-ts button', s).forEach(function (b) {
      var k = +b.dataset.n, li = b.parentNode;
      li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n);
    });
    $$('.mdc-tt tr[data-on]', s).forEach(function (r) { var k = +r.dataset.on; r.classList.toggle('is-on', k <= n && n >= 2); r.classList.toggle('is-now', k === n); });
    $('.mdc-tsum', s).classList.toggle('is-off', n < 5);
    $('.mdc-cnt', s).textContent = n;
  }
  Deck.on('trace', {
    init: function (s) {
      s._lot = 'IV-2417B'; buildTrace(s);
      s._set = seg($('.mdc-lots', s), function (v) { s._lot = v; buildTrace(s); paintTrace(s, s._n || 0); });
      $$('.mdc-ts button', s).forEach(function (b) { b.addEventListener('click', function () { Deck.go(Deck.index, +b.dataset.n); }); });
    },
    enter: function (ctx, s) { s._set('IV-2417B'); },
    step: function (n, ctx, s) { paintTrace(s, n); },
    settle: function (s) { s._lot = 'IV-2417B'; s._set('IV-2417B', true); buildTrace(s); paintTrace(s, 5); }
  });

  /* ---------------------------------------------------------------- 7 · workflow 2: panel claims board */
  var BUCKETS = ['0–30 days', '31–60 days', '61–90 days', '90+ days'];
  var PANELS = ['TPA A', 'TPA B', 'Corporate C', 'Corporate D'];
  var AMT = [[34100, 28600, 17900, 11700], [26400, 22100, 14500, 8800], [23700, 19800, 12600, 8100], [18200, 15900, 9300, 6700]];
  var LEFT = [[34100, 28600, 17900, 11700], [6900, 5800, 3600, 2100], [3500, 2900, 2100, 1100], [4600, 3800, 2500, 1400]];
  var REM = ['', 'Reminder 1', 'Reminder 2', 'Final notice'];
  var NOTE = [
    '<b>Before:</b> every card is a panel visit nobody has invoiced yet.',
    '<b>Friday:</b> one invoice per panel, each line with its visit reference. Nothing waits for month-end.',
    '<b>Follow-up Reports:</b> reminders by level, oldest first. No one chases from memory.',
    '<b>Payments matched:</b> S$145,800 received and reconciled. What is left is known, visit by visit.'
  ];
  function card(st, b, p, n) {
    var amt = n >= 3 ? LEFT[b][p] : AMT[b][p], tag, k;
    if (n === 0) { k = 'un'; tag = 'Unbilled'; }
    else if (n === 1 || b === 0) { k = 'inv'; tag = b === 0 && n >= 1 ? 'Invoiced · not due' : 'Invoiced'; }
    else if (n === 2) { k = 'rem'; tag = REM[b]; }
    else { k = b === 3 ? 'disp' : 'rem'; tag = b === 3 ? 'In dispute' : 'Open'; }
    var of = n >= 3 && b > 0 ? ' <small style="font:500 13px var(--f-body);color:#6C6C80">of ' + sgd(AMT[b][p]) + '</small>' : '';
    return '<div class="mdc-card" data-st="' + k + '"><b>' + PANELS[p] + '</b><span>' + sgd(amt) + of + '</span><em>' + tag + '</em></div>';
  }
  function paintBoard(s, n, ctx) {
    var board = $('.mdc-board', s), total = 0;
    board.innerHTML = BUCKETS.map(function (bk, b) {
      var t = sum(n >= 3 ? LEFT[b] : AMT[b]); total += t;
      return '<div class="mdc-col c-' + b + '"><p class="mdc-col-h" style="margin:0">' + bk + '<small>since visit</small></p><b class="mdc-col-t">' + sgd(t) + '</b><div class="mdc-col-bar"><i style="width:' + (t / 92300 * 100).toFixed(1) + '%"></i></div>' +
        PANELS.map(function (_, p) { return card(null, b, p, n); }).join('') + '</div>';
    }).join('');
    $$('.mdc-acts button', s).forEach(function (b) { var k = +b.dataset.n; b.classList.toggle('is-done', k < n); b.classList.toggle('is-on', k === n); });
    $('.mdc-acts-n', s).innerHTML = NOTE[n];
    var o = $('.mdc-open', s), el = $('.mdc-open-n', s);
    o.classList.toggle('is-billed', n >= 1);
    $('.mdc-open-s', s).textContent = n === 0 ? 'not yet invoiced' : (n < 3 ? 'invoiced · 4 panel invoices' : 'open after S$145,800 matched');
    if (ctx && !Deck.reduce && s._tot != null && s._tot !== total) ctx.count(el, total, { from: s._tot, dur: 800, pre: 'S$' });
    else el.textContent = sgd(total);
    s._tot = total;
  }
  Deck.on('claims', {
    init: function (s) {
      $$('.mdc-acts button', s).forEach(function (b) { b.addEventListener('click', function () { Deck.go(Deck.index, +b.dataset.n); }); });
    },
    enter: function (ctx, s) { s._tot = null; },
    step: function (n, ctx, s) { paintBoard(s, n, ctx); },
    settle: function (s) { s._tot = null; paintBoard(s, 3, null); }
  });

  /* ---------------------------------------------------------------- 8 · rollout phases */
  var PH = [
    ['Clean the 1,450-item list, switch on lots and expiration dates for medicines and vaccines, set up the central store and six clinic warehouses, and an analytic account per clinic.', ['Stock in seven spreadsheets', 'One stock, seven warehouses'], ['Lot written down if remembered', 'Lot and expiry at every receipt']],
    ['Tampines dispenses through Point of Sale with lots; FEFO picks the earliest expiry, and a full count by barcode sets the opening stock. The other clinics watch it run.', ['Coloured fridge stickers', 'Expiration Alerts per clinic'], ['A sale that says “flu vaccine”', 'A sale that records the lot']],
    ['Panel visits arrive as sales orders with their visit reference, are invoiced every Friday with Consolidated Billing, and are chased by Follow-up Reports.', ['Claims keyed in at month-end', 'Invoiced every Friday'], ['Chasing panels from memory', 'Follow-ups by level, oldest first']],
    ['The other five clinics go live one at a time. Online booking, signed consent forms and supplier documents follow, once the stock and billing run cleanly.', ['A recall answered in four days', 'A recall traced in one report'], ['Bookings by phone', 'Online booking with reminders']]
  ];
  picker('rollout', '.fb-ph', '.fb-ph button', function (s, k) {
    var p = PH[+k], d = $('.fb-pd', s), rows = $$('.fb-ba li', s);
    $('.fb-pd-do', s).textContent = p[0];
    rows.forEach(function (li, i) { $('.fb-b', li).textContent = p[i + 1][0]; $('.fb-a', li).textContent = p[i + 1][1]; });
    swap(d);
  }, 4200);
})();

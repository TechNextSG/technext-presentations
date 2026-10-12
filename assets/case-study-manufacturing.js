/* Industry case study · Manufacturing. Slide behaviour. Kerrowan Precision is a sample company and every figure is
   sample data, labelled on its slide. Every slide whose finished state comes from JS has a settle hook. */
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
  // a set of buttons that cycles on its own until the presenter clicks one
  function picker(id, list, sel, paint, pace, first) {
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
        var keys = $$(sel + ':not([data-skip])', s).map(function (b) { return b.dataset.k; }), i = 0;
        ctx.after(1400, function () {
          if (!s._held) s._pick(keys[0]);
          ctx.every(pace, function () { if (s._held) return; i = (i + 1) % keys.length; s._pick(keys[i]); });
        });
      },
      settle: function (s) { s._pick(first || $(sel, s).dataset.k); }
    });
  }

  // jump links: data-go="slide id"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.stopPropagation(); Deck.goId(b.dataset.go, 0);
  });

  /* ---------------------------------------------------------------- 2 · the shop floor */
  var ZONES = {
    quote: ['Quotes office', 'An Excel sheet: weight × S$/kg, a flat labour rate, 35% on top.', 'Set-ups, real bend and weld minutes, scrap, the coater’s lot charge.', 'Small runs are won at a loss; big ones are lost to cheaper bids.'],
    disp: ['Dispatch', 'Delivery orders typed from the job card, certificates photocopied.', 'Which lot went to which customer, and what is still at the coater.', 'A customer’s quality query takes a morning of digging.'],
    board: ['Planning', 'A whiteboard by the press brakes, rewritten every morning.', 'Machine hours left this week, or steel that hasn’t arrived.', 'Delivery dates are promised from memory.'],
    dwg: ['Drawings', 'Printed drawings in a cabinet; revisions arrive by email to sales.', 'Whether the print at the machine is the current revision.', 'Parts are bent to Rev B after the customer moved to Rev C.'],
    qc: ['QC', 'Inspection sheets and non-conformance forms in ISO 9001 binders.', 'Which jobs, machines or suppliers keep failing the same check.', 'Audits mean days of pulling paper.'],
    coat: ['Out to coater', 'A lorry run and a handwritten delivery chit to the powder coater.', 'How many parts are out, and when each lot comes back.', 'Coating is the step every late job blames.'],
    store: ['Steel store', 'Sheets racked by grade and gauge; a clipboard for what was taken.', 'Which job a sheet is for, or when the next delivery is due.', 'The laser waits for sheet nobody knew was late.'],
    laser: ['Laser', 'One fibre laser, cutting nested programs from the CAM software.', 'Which job is due first, or what the press brake needs next.', 'It cuts what is easiest, not what is most urgent.'],
    bend: ['CNC bend', 'Two press brakes: Bend 1 (3 m) and the smaller Bend 2. The bottleneck.', 'The set-up minutes per job, or when Bend 1 last had its service.', 'When Bend 1 stops, the whole whiteboard stops with it.'],
    weld: ['Weld', 'Three TIG/MIG bays, times written on the job card, sometimes.', 'Whether a weld took 12 minutes or 18.', 'The real labour cost of a job is never known.']
  };
  picker('client', '.mfg-plan', '.mfg-z', function (s, k) {
    var z = ZONES[k], d = $('.mfg-zd', s);
    $('.mfg-zd-h', s).textContent = z[0];
    $('.mfg-zd-t', s).textContent = 'Runs fine on its own.';
    $('.mfg-zd-r', s).textContent = z[1]; $('.mfg-zd-b', s).textContent = z[2]; $('.mfg-zd-c', s).textContent = z[3];
    swap(d);
  }, 3200, 'bend');

  /* ---------------------------------------------------------------- the schedule model (slides 3 and 6) */
  // Working hours: 8 a day, Monday 0 to Wednesday of week 2 (72 h). Ops: laser, bend, weld (hours), then one day at the coater.
  var H = 72, DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Tue', 'Wed', 'Thu'];
  var ORD = [
    { id: 'J-2411', mo: 'WH/MO/00505', c: 'A', what: 'frame × 60', ops: [3, 5, 6], due: 30, steel: 0 },
    { id: 'J-2412', mo: 'WH/MO/00506', c: 'B', what: 'enclosure × 40', ops: [4, 6, 4], due: 34, steel: 1 },
    { id: 'J-2413', mo: 'WH/MO/00507', c: 'C', what: 'brackets × 400', ops: [2, 4, 0], due: 26, steel: 0 },
    { id: 'J-2414', mo: 'WH/MO/00508', c: 'A', what: 'covers × 120', ops: [3, 5, 3], due: 40, steel: 1 },
    { id: 'J-2415', mo: 'WH/MO/00509', c: 'D', what: 'rack panels × 80', ops: [4, 6, 5], due: 44, steel: 0 },
    { id: 'J-2416', mo: 'WH/MO/00510', c: 'E', what: 'chassis × 30', ops: [3, 4, 4], due: 50, steel: 0 }
  ];
  var WC = ['laser', 'bend', 'weld'], BRK = [10, 26], STEEL_AT = 10, COAT = 8;
  // o: {brk, late, alt (Bend 2 as alternative), gap (later jobs may use free slots: the plan knows what waits)}
  function plan(o) {
    var busy = { laser: [], bend: [], weld: [], b2: [] }, last = { laser: 0, bend: 0, weld: 0, b2: 0 };
    if (o.brk) busy.bend.push(BRK);
    function fit(key, t, d) {
      var s = o.gap ? t : Math.max(t, last[key]);
      for (;;) {
        var clash = busy[key].filter(function (b) { return b[0] < s + d && s < b[1]; });
        if (!clash.length) return s;
        s = Math.max.apply(null, clash.map(function (b) { return b[1]; }));
      }
    }
    return ORD.map(function (r) {
      var t0 = o.late && r.steel ? STEEL_AT : 0, t = t0, segs = [];
      r.ops.forEach(function (d, i) {
        if (!d) return;
        var key = WC[i], s = fit(key, t, d), dd = d;
        if (o.alt && key === 'bend') {
          var d2 = Math.round(d * 1.25), s2 = fit('b2', t, d2);
          if (s2 + d2 < s + d) { s = s2; key = 'b2'; dd = d2; }
        }
        busy[key].push([s, s + dd]); last[key] = Math.max(last[key], s + dd);
        segs.push({ w: key, s: s, e: s + dd }); t = s + dd;
      });
      segs.push({ w: 'coat', s: t, e: t + COAT });
      var end = t + COAT;
      return { r: r, wait: t0, segs: segs, end: end, late: Math.max(0, end - r.due) };
    });
  }
  function pct(h) { return (h / H * 100) + '%'; }
  function buildGantt(host, label) {
    var head = '<div class="mfg-gh"><span></span><div class="mfg-gd">' + DAYS.map(function (d, i) { return '<span' + (i === 5 ? ' class="is-wk"' : '') + '>' + d + '</span>'; }).join('') + '</div></div>';
    var rows = ORD.map(function (r) {
      return '<div class="mfg-gr"><span class="mfg-gl">' + label(r) + '</span><div class="mfg-gt">' +
        '<i class="mfg-gwait"></i>' + ['laser', 'bend', 'weld', 'coat'].map(function (w) { return '<i class="mfg-gb mfg-gb--' + w + '" data-w="' + w + '"></i>'; }).join('') +
        '<i class="mfg-gdue" style="left:' + pct(r.due) + '"></i><em class="mfg-glate"></em><em class="mfg-gtold">told early</em></div></div>';
    }).join('');
    var legend = '<div class="mfg-gk"><span class="k-laser">Laser</span><span class="k-bend">Bend 1</span><span class="k-b2">Bend 2</span><span class="k-weld">Weld</span><span class="k-coat">At the coater</span><span class="k-due">Promised date</span></div>';
    host.innerHTML = head + '<div class="mfg-gbody">' + '<i class="mfg-gband"><em>Bend 1 down</em></i><i class="mfg-gpm"><em>Sat · Bend 1 service</em></i>' + rows + '</div>' + legend;
  }
  function paintGantt(host, res, o) {
    host.classList.toggle('has-brk', !!o.brk);
    host.classList.toggle('has-pm', !!o.pm);
    host.classList.toggle('is-blocked', !!o.blocked);
    $('.mfg-gband em', host).textContent = o.blocked ? 'Bend 1 blocked' : 'Bend 1 down';
    $$('.mfg-gr', host).forEach(function (row, i) {
      var p = res[i], bars = $$('.mfg-gb', row), wait = $('.mfg-gwait', row);
      wait.style.width = pct(p.wait); wait.classList.toggle('is-on', p.wait > 0);
      bars.forEach(function (b) { b.style.opacity = 0; });
      p.segs.forEach(function (sg) {
        var w = sg.w === 'b2' ? 'bend' : sg.w, b = $('.mfg-gb[data-w="' + w + '"]', row);
        b.style.left = pct(sg.s); b.style.width = pct(Math.min(sg.e, H) - sg.s); b.style.opacity = 1;
        b.classList.toggle('is-b2', sg.w === 'b2');
      });
      row.classList.toggle('is-late', p.late > 0);
      var lt = $('.mfg-glate', row);
      lt.textContent = p.late ? '+' + p.late + ' h late' : '';
      lt.style.left = pct(Math.min(p.end, H));
      row.classList.toggle('is-told', !!(o.told && p.late));
    });
  }
  function sum(res) {
    var late = res.filter(function (p) { return p.late; }), cust = {};
    late.forEach(function (p) { cust[p.r.c] = 1; });
    return { n: late.length, c: Object.keys(cust).length, h: late.reduce(function (a, p) { return a + p.late; }, 0) };
  }

  /* ---------------------------------------------------------------- 3 · the cascade */
  var SAY = {
    '00': ['This week, on time.', 'Press a button above. The whiteboard keeps the jobs in order, so one stopped machine pushes every job behind it to the right.'],
    '10': ['One machine, five customers.', 'Bend 1 is the only route the whiteboard knows. Every job behind the breakdown waits, and the welders wait for the bends.'],
    '01': ['One late delivery, three late orders.', 'Two jobs wait for 2 mm sheet. The board is worked in order, so the laser waits with them instead of cutting the next job.'],
    '11': ['Found out on the promised day.', 'Nothing on the board shows a date has gone. Customers learn it when the parts don’t arrive, then sales rings round.']
  };
  Deck.on('cascade', {
    init: function (s) {
      s._o = { brk: 0, late: 0 };
      buildGantt($('.mfg-g', s), function (r) { return '<b>' + r.id + '</b><small>Customer ' + r.c + ' · ' + r.what + '</small>'; });
      s._paint = function (ctx) {
        var res = plan(s._o), t = sum(res), key = '' + s._o.brk + s._o.late;
        paintGantt($('.mfg-g', s), res, s._o);
        $$('.mfg-inj-b', s).forEach(function (b) { b.setAttribute('aria-pressed', s._o[b.dataset.x] ? 'true' : 'false'); });
        $('.mfg-c-late', s).textContent = t.n + ' of 6';
        $('.mfg-c-cust', s).textContent = t.c;
        var hrs = $('.mfg-c-hrs', s);
        if (ctx && !Deck.reduce) ctx.count(hrs, t.h, { from: s._h || 0, dur: 700, suf: ' h' }); else hrs.textContent = t.h + ' h';
        s._h = t.h;
        $('.mfg-cs', s).classList.toggle('is-bad', t.n > 0);
        $('.mfg-cs-qh', s).textContent = SAY[key][0]; $('.mfg-cs-qt', s).textContent = SAY[key][1];
      };
      $('.mfg-inj', s).addEventListener('click', function (e) {
        var b = e.target.closest('.mfg-inj-b'); if (!b) return;
        s._held = true; s._o[b.dataset.x] = s._o[b.dataset.x] ? 0 : 1; s._paint(s._ctx);
      });
    },
    enter: function (ctx, s) {
      s._ctx = ctx; s._held = false; s._o = { brk: 0, late: 0 }; s._h = 0; s._paint(null);
      ctx.after(2200, function () { if (!s._held) { s._o.brk = 1; s._paint(ctx); } });
    },
    leave: function (s) { s._ctx = null; },
    settle: function (s) { s._o = { brk: 1, late: 1 }; s._h = 0; s._paint(null); }
  });

  /* ---------------------------------------------------------------- 4 · the job post-mortem */
  var BASE = 10933.33, ADD = [475, 1020, 2030.40, 540, 380], PRICE = 14760, X0 = 8000, XR = 8000;
  function paintPM(s, n) {
    var cum = BASE;
    $$('.mfg-wr[data-n]', s).forEach(function (row) {
      var k = +row.dataset.n, b = $('.mfg-wr-b', row);
      b.style.left = ((cum - X0) / XR * 100) + '%'; b.style.width = (ADD[k - 1] / XR * 100) + '%';
      row.classList.toggle('is-on', k <= n); row.classList.toggle('is-now', k === n);
      if (k <= n) cum += ADD[k - 1];
    });
    var base = $('.mfg-wr.is-base .mfg-wr-b', s); base.style.left = '0%'; base.style.width = ((BASE - X0) / XR * 100) + '%';
    $('.mfg-wr.is-tot .mfg-wr-b', s).style.width = ((cum - X0) / XR * 100) + '%';
    $('.mfg-wr-tv', s).textContent = money(cum);
    var mg = (PRICE - cum) / PRICE * 100;
    $('.mfg-mg-n', s).textContent = (mg >= 0 ? '+' : '−') + Math.abs(mg).toFixed(1) + '%';
    $('.mfg-mg-s', s).textContent = n === 0 ? 'as quoted' : n < 5 ? 'and falling' : 'as made: a loss of ' + money(cum - PRICE);
    $('.mfg-pm', s).classList.toggle('is-loss', mg < 0);
    $('.mfg-wr.is-tot', s).classList.toggle('is-over', cum > PRICE);
    $$('.mfg-why-l li', s).forEach(function (li) { li.classList.toggle('is-on', +li.dataset.on <= n); });
  }
  Deck.on('postmortem', {
    step: function (n, ctx, s) { paintPM(s, n); },
    settle: function (s) { paintPM(s, 5); }
  });

  /* ---------------------------------------------------------------- 5 · one job, one thread */
  var TH = {
    so: ['sale', 'Sales', 'Quotation S00318', 'Priced from the BoM and routing cost of KP-3108 Rev C, not the kilogram. Confirmed, it becomes the sales order and asks Manufacturing for 500.', 'The Excel quote sheet'],
    crm: ['crm', 'CRM', 'The RFQ as an opportunity', 'The customer’s RFQ email lands in the pipeline with the drawing attached, so every quote has an owner and a next step.', 'RFQs lost in a shared inbox'],
    mo: ['mrp', 'Manufacturing', 'Manufacturing order WH/MO/00512', 'Made from the sales order with the current BoM: components reserved from stock, the operations of the routing ready to plan, a deadline from the customer’s date.', 'The job card written by hand'],
    eco: ['mrp_plm', 'PLM', 'Engineering change order ECO0042', 'The customer’s Rev C goes through Start Revision, review and approval. Apply Changes archives the old BoM, so new orders use Rev C and the shop floor sees its drawing.', 'Revisions emailed to sales, prints in a cabinet'],
    wo: ['mrp', 'Manufacturing · Shop Floor', 'Work orders: Laser, Bend, Weld', 'One work order per operation, planned on its work centre. Operators start and stop them on a Shop Floor tablet, with the instructions in front of them, so real minutes are recorded.', 'The whiteboard and times on the job card'],
    mr: ['maintenance', 'Maintenance', 'Preventive maintenance on Bend 1', 'The shop’s own press brake gets preventive requests on the maintenance calendar, and a breakdown is a corrective request that can block the work centre.', 'Servicing when someone remembers'],
    po: ['purchase', 'Purchase · subcontracting', 'Subcontract PO P00281', 'Powder coating set up as a subcontracting BoM: the PO to the coater sends the bent and welded parts out, and the receipt brings the coated parts back into stock, at the coater’s price.', 'A handwritten chit on the lorry'],
    steel: ['purchase', 'Purchase', 'Steel order P00274', 'Raised from reordering rules or the MO’s shortage, with the supplier’s expected arrival date. A late date shows on the orders that wait for it.', 'Phone calls to the steel supplier'],
    qc: ['quality_control', 'Quality', 'Quality check on the flange', 'A quality control point on the weld operation: measure the flange, 12.0 mm ±0.2. Out of tolerance fails the check, on the record, with the lot.', 'Inspection sheets in the ISO 9001 binders'],
    qa: ['quality_control', 'Quality', 'Quality alert', 'A failed check raises an alert with its cause and corrective action, so the non-conformances for an audit are a search, not a box of paper.', 'Paper non-conformance forms'],
    out: ['stock', 'Inventory', 'Delivery WH/OUT/00433', 'The coated parts ship from stock with their lot, so a customer query traces back to the order, the checks and the steel.', 'Typed delivery orders'],
    lot: ['stock', 'Inventory', 'Lot KP-2610-07', 'Lots on the finished parts tie each delivery to its manufacturing order and quality checks.', 'Photocopied certificates'],
    inv: ['account', 'Accounting', 'Invoice INV/2026/00611', 'Invoiced from the delivery, with the costs of the order already in the books: stock, work in progress and the coater’s bill.', 'Invoices typed at month-end'],
    cost: ['spreadsheet_dashboard', 'Manufacturing · reporting', 'Real cost against expected', 'The MO overview shows the MO cost against the real cost: components used, minutes worked, scrap. The next quote for KP-3108 starts from what it really cost.', 'Jobs never costed after delivery']
  };
  picker('thread', '.mfg-th', '.mfg-tn, .mfg-chip', function (s, k) {
    var t = TH[k], d = $('.mfg-td', s), btn = $('[data-k="' + k + '"]', s);
    $('.mfg-td-i', s).innerHTML = $('.oi', btn).outerHTML.replace(/\d+px/g, '44px').replace(/width="\d+"/, 'width="44"').replace(/height="\d+"/, 'height="44"');
    $('.mfg-td-app', s).textContent = t[1];
    $('.mfg-td-t', s).textContent = t[2]; $('.mfg-td-d', s).textContent = t[3]; $('.mfg-td-x', s).textContent = t[4];
    swap(d);
  }, 3000, 'eco');

  /* ---------------------------------------------------------------- 6 · workflow 1: the replan */
  var RP = [
    { brk: 1, late: 1 },
    { brk: 1, late: 1, blocked: 1 },
    { brk: 1, late: 1, blocked: 1, alt: 1 },
    { brk: 1, late: 1, blocked: 1, alt: 1, gap: 1 },
    { brk: 1, late: 1, blocked: 1, alt: 1, gap: 1, told: 1 },
    { brk: 1, late: 1, blocked: 1, alt: 1, gap: 1, told: 1, pm: 1 }
  ];
  function paintRP(s, n) {
    var o = RP[n], res = plan(o), t = sum(res);
    paintGantt($('.mfg-g', s), res, o);
    $$('.fb-steps button', s).forEach(function (b) {
      var k = +b.dataset.n, li = b.parentNode;
      li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n);
    });
    $$('[data-t]', s).forEach(function (el) { el.textContent = pickText(el.dataset.t, n); });
    $('.mfg-ow-doc', s).dataset.k = n;
    $('.mfg-o-late', s).textContent = t.n + ' of 6';
    $('.mfg-o-hrs', s).textContent = t.h + ' h';
    $('.mfg-o-told', s).textContent = o.told ? t.n : 0;
    $('.mfg-ow-k', s).classList.toggle('is-good', t.h < 5);
    $('.fb-cnt', s).textContent = n;
  }
  Deck.on('replan', {
    init: function (s) {
      buildGantt($('.mfg-g', s), function (r) { return '<b>' + r.mo + '</b><small>Customer ' + r.c + '</small>'; });
      var play = $('.fb-play', s);
      s._stop = function () { s._run = (s._run || 0) + 1; play.classList.remove('is-on'); $('span', play).textContent = 'Play the replan'; s._playing = false; };
      $$('.fb-steps button', s).forEach(function (b) { b.addEventListener('click', function () { s._stop(); Deck.go(Deck.index, +b.dataset.n); }); });
      play.addEventListener('click', function () {
        if (s._playing || !s._ctx) { s._stop(); return; }
        var tok = (s._run || 0) + 1; s._run = tok; s._playing = true;
        play.classList.add('is-on'); $('span', play).textContent = 'Pause';
        Deck.go(Deck.index, Deck.step >= 5 ? 0 : Deck.step + 1);
        s._ctx.every(2000, function () {
          if (s._run !== tok) return;
          if (Deck.index !== Deck.slides.indexOf(s) || Deck.step >= 5) { s._stop(); return; }
          Deck.go(Deck.index, Deck.step + 1);
        });
      });
    },
    enter: function (ctx, s) { s._ctx = ctx; s._stop(); },
    step: function (n, ctx, s) { paintRP(s, n); },
    leave: function (s) { s._stop(); s._ctx = null; },
    settle: function (s) { paintRP(s, 5); }
  });

  /* ---------------------------------------------------------------- 7 · workflow 2: the true-cost quote */
  var Q = { sheet: 3.10, pem: 0.48, laser: [1.2, 10, 120], bend: [1.6, 30, 95], weld: [2.5, 15, 85], coat: [1.80, 90], excel: 20.09, target: 0.20 };
  function qty(v) { var q = 20 * Math.pow(50, v / 100); return q < 100 ? Math.round(q / 5) * 5 : Math.round(q / 10) * 10; }
  function costAt(q, sc) {
    var c = { sheet: Q.sheet, pem: Q.pem };
    ['laser', 'bend', 'weld'].forEach(function (k) { var r = Q[k]; c[k] = r[0] / 60 * r[2] + r[1] / 60 * r[2] / q; c[k + 'v'] = r[0] / 60 * r[2]; });
    c.coat = Q.coat[0] + Q.coat[1] / q;
    c.scrap = sc / 100 * (c.sheet + c.pem + c.laserv + c.bendv + c.weldv);
    c.tot = c.sheet + c.pem + c.laser + c.bend + c.weld + c.coat + c.scrap;
    return c;
  }
  var CX0 = 10, CX1 = 630, CY0 = 132, CY1 = 8, YMIN = 12, YMAX = 26;
  function cx(q) { return CX0 + (Math.log(q / 20) / Math.log(50)) * (CX1 - CX0); }
  function cy(v) { return CY0 - (Math.min(YMAX, Math.max(YMIN, v)) - YMIN) / (YMAX - YMIN) * (CY0 - CY1); }
  function paintQ(s) {
    var q = qty(s._v), sc = s._sc, c = costAt(q, sc);
    ['sheet', 'pem', 'laser', 'bend', 'weld', 'coat', 'scrap'].forEach(function (k) { $('[data-c="' + k + '"]', s).textContent = money(c[k]); });
    $('.mfg-c-scn', s).textContent = sc + '% of material and work';
    $('.mfg-c-tot', s).textContent = money(c.tot);
    $('.mfg-bom-q', s).textContent = q.toLocaleString('en-SG') + ' Units';
    $('.mfg-sl-q', s).textContent = q.toLocaleString('en-SG') + ' pcs';
    $('.mfg-sl-s', s).textContent = sc + '%';
    var mg = (Q.excel - c.tot) / Q.excel, p20 = c.tot / (1 - Q.target);
    $('.mfg-k-m', s).textContent = (mg < 0 ? '−' : '') + Math.abs(mg * 100).toFixed(1) + '%';
    $('.mfg-k-p', s).textContent = money(p20);
    var st = mg < 0 ? 'loss' : mg < Q.target ? 'thin' : Q.excel > p20 * 1.04 ? 'high' : 'ok', a = $('.mfg-qa', s);
    a.dataset.state = st;
    a.innerHTML = st === 'loss' ? '<b>Loses money.</b> The Excel price is ' + money(c.tot - Q.excel) + ' a piece under cost: ' + money((c.tot - Q.excel) * q) + ' on this order.'
      : st === 'thin' ? '<b>Below the 20% target.</b> Set-ups and the coater’s lot charge weigh on a run of ' + q + '.'
      : st === 'high' ? '<b>Priced too high.</b> Excel asks ' + money(Q.excel - p20) + ' a piece more than a 20% margin needs: a bid to lose.'
      : '<b>Close to target.</b> At this quantity the Excel guess happens to land near the real cost.';
    $('.mfg-qr', s).dataset.state = st;
    // chart
    var d = '', i, qq;
    for (i = 0; i <= 48; i++) { qq = 20 * Math.pow(50, i / 48); d += (i ? 'L' : 'M') + cx(qq).toFixed(1) + ',' + cy(costAt(qq, sc).tot).toFixed(1); }
    $('.mfg-ch-r', s).setAttribute('d', d);
    $('.mfg-ch-x', s).setAttribute('d', 'M' + CX0 + ',' + cy(Q.excel).toFixed(1) + 'H' + CX1);
    var x = cx(q).toFixed(1), v = $('.mfg-ch-v', s), dot = $('.mfg-ch-d', s);
    v.setAttribute('x1', x); v.setAttribute('x2', x);
    dot.setAttribute('cx', x); dot.setAttribute('cy', cy(c.tot).toFixed(1));
    $('.mfg-ch-lx', s).setAttribute('y', (cy(Q.excel) - 8).toFixed(1));
  }
  Deck.on('quote', {
    init: function (s) {
      var rq = $('.mfg-in-q', s), rs = $('.mfg-in-s', s);
      s._v = 82; s._sc = 5;
      rq.addEventListener('input', function () { s._v = +rq.value; paintQ(s); });
      rs.addEventListener('input', function () { s._sc = +rs.value; paintQ(s); });
      s._reset = function (v, sc) { s._v = v; s._sc = sc; rq.value = v; rs.value = sc; paintQ(s); };
      s._reset(82, 5);
    },
    enter: function (ctx, s) {
      s._reset(100, 5);
      // the same part, from 1,000 pieces down to 20: watch the Excel price go from too high to a loss
      ctx.after(1400, function () {
        ctx.tween(2600, function (p) { s._v = Math.round(100 - 100 * p); $('.mfg-in-q', s).value = s._v; paintQ(s); }, 'io');
      });
    },
    settle: function (s) { s._reset(0, 5); }
  });

  /* ---------------------------------------------------------------- 8 · rollout phases */
  var PH = [
    ['Clean the 300 part numbers, steel grades and suppliers, count the store, set up the chart of accounts and connect the bank. Everything after this reads them.', ['Stock on a clipboard', 'Stock by location, counted by scanner'], ['Steel ordered by phone', 'Purchase orders with arrival dates'], ['Books typed in monthly', 'Bank matched as it lands']],
    ['Bills of materials and routings, starting with the press brakes; work centres with their cost per hour; Shop Floor tablets so real minutes are recorded.', ['The whiteboard', 'Work orders planned per work centre'], ['Times on the job card', 'Real minutes per operation'], ['Job card by hand', 'MO made from the order']],
    ['Engineering change orders for every revision, quality control points for the ISO 9001 records, preventive maintenance on the laser and the press brakes.', ['Prints in a cabinet', 'The approved revision on the tablet'], ['ISO binders', 'Checks and alerts, searchable'], ['Servicing when remembered', 'Preventive on the calendar']],
    ['RFQs in CRM, quotes priced from the BoM and routing cost, and every finished order’s real cost compared with what was quoted.', ['Weight × S$/kg + 35%', 'Price from real cost'], ['Jobs never costed', 'Real against expected, per order'], ['Same loss quoted again', 'Next quote learns from the last']]
  ];
  var GATE = ["the store count matches Odoo and the bank reconciles for a full month.", "Bend 1 and Bend 2 run a full week on Shop Floor, with minutes on every work order.", "every open part number has an approved revision, and the first ISO checks run on the tablet.", "quotes for the main part numbers come from recorded minutes, and each finished order is compared with its quote."];
  picker('rollout', '.mfg-ph', '.mfg-ph button', function (s, k) {
    var p = PH[+k], d = $('.mfg-pd', s), rows = $$('.mfg-ba li', s);
    $('.mfg-pd-do', s).textContent = p[0];
    $('.mfg-pd-gt', s).textContent = GATE[+k];
    rows.forEach(function (li, i) { $('.fb-b', li).textContent = p[i + 1][0]; $('.fb-a', li).textContent = p[i + 1][1]; });
    swap(d);
  }, 4200, '0');
})();

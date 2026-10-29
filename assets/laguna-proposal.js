/* Laguna Metts proposal: the deck's own seven slides (cover, group, trace, road, ai, cost, plan) on the birmove kit (window.BMK).
   Each slide renders its markup into its empty section, then registers Deck.on(id, {init, enter, step, leave, settle}).
   Every timer goes through ctx, every Motion control sits in a bag stopped in leave, settle paints the FINISHED state with no animation
   (print, PDF, overview). Tick marks (plan) live in sessionStorage via BMK.load/save and are never wiped by settle; print and share copies show none.
   Non-ASCII is written as \u escapes. Demo values are sample data and say so. */
(function () {
  'use strict';
  var K = window.BMK, Deck = window.Deck, BM = window.BM;
  if (!K || !Deck || !BM) return;
  var doc = document, SHARED = K.shared, esc = K.esc, inz = K.inz, CL = BM.client || {};
  function $(q, r) { return (r || doc).querySelector(q); }
  function $$(q, r) { return [].slice.call((r || doc).querySelectorAll(q)); }
  function sec(id) { return doc.getElementById(id); }
  function put(s, html) { var f = $('.s-foot', s); if (f) f.insertAdjacentHTML('beforebegin', html); else s.insertAdjacentHTML('beforeend', html); }
  function head(kick, h2) { return K.kick(kick, 0) + '<h2 class="h-m bm-h2" data-in style="--d:80ms">' + h2 + '</h2>'; }
  function fin(s) { $$('.h-m[data-in],.h-xl[data-in]', s).forEach(K.split); }
  function odoo(m, px) { return K.odoo(m, px); }
  function live() { return K.live() && !!window.Motion; }
  function newBag() { return { mo: [], ctx: null }; }

  /* ================================================================ 1 · cover */
  (function () {
    var s = sec('cover'); if (!s) return;
    var AG = [['penalty', '01', 'Why now'], ['pipe', '02', 'Your flow in Odoo'], ['road', '03', 'The roadmap'], ['close', '04', 'Next step']];
    var h = '<div class="cv-copy bm-cv lp-cv">' +
      '<div class="bm-lock"' + inz(0) + '><img class="cv-logo" src="assets/img/logo-horizontal-white.png" alt="TechNext" width="240" height="48"></div>' +
      K.kick('a proposal for our first meeting', 120) +
      '<h1 class="h-xl bm-h1"' + inz(200) + '>Cast for Honda. <span class="hl">Invoiced for the BIR.</span></h1>' +
      '<p class="lead"' + inz(320) + '>A phased Odoo proposal: BIR e-invoicing first, then traceability and the plant, then AI and a B2B presence.</p>' +
      '<nav class="bm-agenda"' + inz(420) + ' aria-label="Parts of this deck">' +
      AG.map(function (a) { return '<button type="button" data-lpgo="' + a[0] + '"><i>' + a[1] + '</i>' + a[2] + '</button>'; }).join('') + '</nav>' +
      '<div class="cv-tags"' + inz(500) + '><span class="tag tag--badge"><img src="assets/img/odoo-ready-partner.png" alt="" width="52" height="25">Odoo Ready Partner</span><span class="tag">' + K.ico('calendar') + 'Proposal draft · October 2026</span></div></div>' +
      '<p class="hint cv-hint"' + inz(760) + '><kbd>→</kbd> or click to begin <span class="cv-hint-sep">·</span> <kbd>O</kbd> all slides</p>' +
      '<div class="lp-cvr"><div class="lp-lk" data-in data-fx="land" style="--d:260ms">' + (CL.lockup ? '<img src="' + esc(CL.lockup) + '" alt="' + esc(CL.name || 'Laguna Metts Corporation') + '" width="334" height="300">' : '<b class="lp-lk-n">' + esc(CL.name || '') + '</b>') + '</div>' +
      '<div class="lp-cd"' + inz(640) + '><b class="lp-cd-n">' + K.daysLeft() + '</b><span>working days to<small>31 December 2026</small></span></div></div>';
    put(s, h); fin(s);
    var n = $('.lp-cd-n', s);
    s.addEventListener('click', function (e) { var b = e.target.closest('[data-lpgo]'); if (b) { e.preventDefault(); Deck.goId(b.getAttribute('data-lpgo')); } });
    Deck.on('cover', {
      enter: function (ctx) {
        var d = K.daysLeft();
        if (live()) ctx.count(n, d, { from: d + 90, dur: 1300, ease: Deck.ease && Deck.ease.softLand ? 'softLand' : 'out' }); else n.textContent = d;
      },
      settle: function () { n.textContent = K.daysLeft(); }
    });
  })();

  /* ================================================================ 2 · group */
  (function () {
    var s = sec('group'); if (!s) return;
    var EXP = 'Export invoices, zero-rated, in USD (or the agreed currency), reported in pesos at the BSP rate.';
    var N = [
      { k: 'hf', x: 0, y: 187, w: 296, h: 96, t: 'Honda Foundry Co., Ltd.', s: 'Honda Kinzoku Gijutsu', cap: 'The main shareholder of Metts.', d: 300 },
      { k: 'mc', x: 420, y: 170, w: 330, h: 130, t: 'Metts Corporation', s: 'Kawagoe, Saitama · since 1953', tag: 'Parent · Japan', cap: 'Reports in Metts’ format, and an approval brief in English.', d: 420 },
      { k: 'lm', x: 960, y: 0, w: 400, h: 116, t: 'Laguna Metts Corporation', s: 'Biñan, Laguna · SEPZ Laguna Technopark · since Dec 1995', cap: 'One Odoo for invoices, books, lots, dies and quality.', mark: 1, d: 540 },
      { k: 'mp', x: 960, y: 138, w: 400, h: 96, t: 'Madison Precision Products, Inc.', s: 'Madison, Indiana, USA', cap: EXP, d: 620 },
      { k: 'mf', x: 960, y: 256, w: 400, h: 96, t: 'Metalfino da Amazonia Ltda.', s: 'Brazil', cap: EXP, d: 700 },
      { k: 'tc', x: 960, y: 374, w: 400, h: 96, t: 'Tesco Componentes para Automóveis, Lda.', s: 'Famalicão, Portugal', cap: EXP, d: 780 }
    ];
    var CY = { lm: 58, mp: 186, mf: 304, tc: 422 };
    var svg = '<svg class="lp-gsvg" viewBox="0 0 1360 470" width="1360" height="470" aria-hidden="true">' +
      '<path class="draw" data-p="hm" pathLength="1000" style="--d:300ms" d="M296 235 H420"/>';
    ['lm', 'mp', 'mf', 'tc'].forEach(function (k, i) { svg += '<path class="draw" data-p="' + k + '" pathLength="1000" style="--d:' + (560 + i * 110) + 'ms" d="M750 235 C855 235 855 ' + CY[k] + ' 960 ' + CY[k] + '"/>'; });
    svg += '</svg>';
    var nodes = '';
    N.forEach(function (n) {
      nodes += '<div class="lp-nw' + (n.k === 'lm' ? ' lp-lm' : '') + '" style="left:' + n.x + 'px;top:' + n.y + 'px;width:' + n.w + 'px;height:' + n.h + 'px"' + inz(n.d) + '>' +
        '<button type="button" class="lp-n" data-k="' + n.k + '" aria-pressed="false">' + (n.mark ? '<img class="lp-n-m" src="' + esc(CL.logo || '') + '" alt="" height="50">' : '') +
        '<span class="lp-n-x">' + (n.tag ? '<i>' + esc(n.tag) + '</i>' : '') + '<b>' + esc(n.t) + '</b><small>' + esc(n.s) + '</small></span></button></div>';
    });
    var h = head('your group', 'One plant in Laguna, <span class="hl">a group on four continents.</span>') +
      '<div class="lp-gd">' + svg + '<p class="lp-eg"' + inz(380, null, 'left:308px;top:184px;width:100px;text-align:center') + '>main shareholder</p>' + nodes + '</div>' +
      '<div class="bm-bar lp-gbar"' + inz(900) + '><p class="bm-cap lp-gcap" aria-live="polite"></p></div>' +
      '<p class="illus bm-ill">Source: metts.co.jp, checked 27 October 2026 · how sales split across the group is for you to tell us</p>';
    put(s, h); fin(s);
    var btns = $$('.lp-n', s), paths = $$('.lp-gsvg path', s), cap = $('.lp-gcap', s);
    function select(k, anim) {
      var node = N.filter(function (n) { return n.k === k; })[0];
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-k') === k ? 'true' : 'false'); });
      var pk = (k === 'hf' || k === 'mc') ? 'hm' : k;
      paths.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-p') === pk); });
      var nm = node.t.replace(/, (Inc\.|Lda\.|Ltd\.)$/, '').replace(/ Ltda\.$/, '').replace(/ para Autom.veis$/, '');
      cap.innerHTML = '<b>For ' + esc(k === 'lm' ? 'Laguna Metts' : nm) + ':</b>' + esc(node.cap.charAt(0).toLowerCase() + node.cap.slice(1));
      if (anim) K.swap(cap);
    }
    Deck.on('group', {
      init: function () { s.addEventListener('click', function (e) { var b = e.target.closest('.lp-n'); if (b) select(b.getAttribute('data-k'), true); }); },
      enter: function () { select('lm', false); },
      settle: function () { select('lm', false); }
    });
  })();

  /* ================================================================ 3 · trace */
  (function () {
    var s = sec('trace'); if (!s) return;
    s.setAttribute('data-steps', '5');
    var CH = [
      { a: 'stock', l: 'Delivery', m: 'DO/2026/0412 ', d: 'to Sample sister plant', tg: 'Inventory', y: 0, h: 76 },
      { a: 'stock', l: 'Lot', m: 'L-2610-014 ', d: '· 320 pcs · cast 12 Oct 2026', tg: 'Inventory · lots', y: 88, h: 76 },
      { a: 'mrp', l: 'Work order', m: 'MO/2026/0388 ', d: '· Die-cast cell 3', tg: 'Manufacturing', y: 176, h: 76 },
      { a: 'maintenance', l: 'Die', m: 'Die D-07 ', d: '· 41,280 of 80,000 shots', tg: 'Maintenance', y: 264, h: 110, meter: 1 },
      { a: 'quality_control', l: 'Quality checks', tg: 'Quality', y: 386, h: 84, qc: ['Leak test', 'Dimensions', 'X-ray'] }
    ];
    // a barcode drawn from fixed bar widths (sample, not a real code)
    var bars = '', x = 0, seed = 7, widths = [];
    while (x < 336) { seed = (seed * 37 + 11) % 97; var w = 2 + (seed % 4), g = 2 + (seed % 3); widths.push([x, w]); x += w + g; }
    widths.forEach(function (b) { if (b[0] + b[1] <= 340) bars += '<rect x="' + b[0] + '" y="0" width="' + b[1] + '" height="96" fill="var(--ink)"/>'; });
    var lab = '<div class="lp-lab lp-card"' + inz(200) + '>' +
      '<div class="lp-lab-h"><span class="lp-hd" style="font-size:17px">' + K.ico('box') + 'Part label</span><em>sample label</em></div>' +
      '<b class="lp-lab-p">Die-cast transmission case</b>' +
      '<svg class="lp-bc" viewBox="0 0 340 96" width="340" height="96" role="img" aria-label="Sample barcode">' + bars + '<rect class="lp-scanline" x="-6" y="-4" width="4" height="104" fill="var(--bm-a-ink)" opacity="0"/></svg>' +
      '<p class="lp-lab-s">LM-TC-260412-0187</p>' +
      '<button type="button" class="bm-btn lp-scan">' + K.ico('play') + '<span>Scan the label</span></button></div>' +
      '<p class="lp-lab-n"' + inz(280) + ' aria-live="polite"><b>0</b> of 5 links found</p>';
    var ch = '<div class="lp-ch"><div class="lp-rail"><i></i></div>';
    CH.forEach(function (c, i) {
      var cy = c.y + c.h / 2;
      ch += '<span class="lp-dot" style="top:' + (cy - 8) + 'px"></span>';
      ch += '<div class="lp-tc lp-card" data-c="' + i + '" style="top:' + c.y + 'px;height:' + c.h + 'px">' + odoo(c.a, 40) + '<div class="lp-tx"><small>' + esc(c.l) + '</small>';
      if (c.qc) ch += '<div class="lp-qc">' + c.qc.map(function (q) { return '<span class="bm-chip bm-chip--ok">' + K.ico('check') + esc(q) + ': Pass</span>'; }).join('') + '</div>';
      else ch += '<b>' + esc(c.m) + '<span>' + esc(c.d) + '</span></b>';
      if (c.meter) ch += '<div class="lp-mt"><div class="lp-mt-t"></div><div class="lp-mt-f"></div><div class="lp-mt-k"></div><span class="lp-mt-z">0</span><span class="lp-mt-l">maintenance mark at 75,000</span></div>';
      ch += '</div><span class="lp-tg">' + esc(c.tg) + '</span></div>';
    });
    ch += '</div>';
    var h = head('traceability', 'Every part back to its <span class="hl">die and lot.</span>') + lab + ch +
      '<div class="bm-bar"' + inz(700) + '><p class="lp-ct-hint">We do not replace Honda’s supplier portals or add machine-level MES.</p></div>' +
      '<p class="illus bm-ill">' + K.ico('check') + 'Illustrative Odoo 20 view · sample part, lot, die and numbers</p>';
    put(s, h); fin(s);
    var cards = $$('.lp-tc', s), dots = $$('.lp-dot', s), rail = $('.lp-rail i', s), cnt = $('.lp-lab-n b', s), btn = $('.lp-scan', s), btnT = $('span', btn), line = $('.lp-scanline', s);
    var st = newBag(), busy = false;
    var CY5 = CH.map(function (c) { return c.y + c.h / 2; });
    function show(n, flat) {
      s.classList.toggle('lp-flat', !!flat);
      cards.forEach(function (c, i) { c.classList.toggle('is-on', i < n); c.classList.toggle('is-cur', i === n - 1 && n < 5); });
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i < n); });
      rail.style.transform = 'scaleY(' + (n <= 1 ? 0 : (CY5[n - 1] - CY5[0]) / (CY5[4] - CY5[0])).toFixed(4) + ')';
      cnt.textContent = n; btnT.textContent = n >= 5 ? 'Scan again' : 'Scan the label';
      if (flat) { void s.offsetWidth; s.classList.remove('lp-flat'); }
    }
    function sweep() {
      if (!live() || !st.ctx || !st.ctx.alive) return;
      line.setAttribute('opacity', 1);
      K.drive(st, function (p) { line.style.transform = 'translateX(' + (342 * Math.min(1, p)).toFixed(1) + 'px)'; if (p >= .995) line.setAttribute('opacity', 0); }, { stiffness: 90, damping: 20 });
    }
    function run() {
      if (busy) return; var ctx = st.ctx; if (!ctx || !ctx.alive) return;
      var idx = Deck.index;
      if (!live()) { Deck.go(idx, Deck.step >= 5 ? 0 : 5); return; }
      if (Deck.step >= 5) Deck.go(idx, 0);
      busy = true; sweep();
      for (var i = 1; i <= 5; i++) (function (n) { ctx.after(520 + n * 430, function () { Deck.go(idx, n); if (n === 5) busy = false; }); })(i);
    }
    Deck.on('trace', {
      init: function () { btn.addEventListener('click', run); },
      enter: function (ctx) { st.ctx = ctx; busy = false; K.stop(st); },
      step: function (n, ctx, sl, first) { st.ctx = ctx; show(n, first || !live()); },
      leave: function () { K.stop(st); busy = false; line.setAttribute('opacity', 0); line.style.transform = ''; },
      settle: function () { K.stop(st); busy = false; line.setAttribute('opacity', 0); line.style.transform = ''; show(5, true); }
    });
    show(0, true);
  })();

  /* ================================================================ 4 · road */
  (function () {
    var s = sec('road'); if (!s) return;
    var P = [
      { k: 'Bridge', t: 'Invoice and file', s: 'if you are in the first group', d: 'a short set-up + the BIR’s PTI time', x: 0, ic: [['o', 'account'], ['i', 'plug', 1], ['i', 'file']],
        it: [['o', 'account', 'Odoo Invoicing', 'Sales invoices, numbered and locked once issued'], ['i', 'plug', 'EIS connection', 'To assess with you, quoted separately', 1], ['i', 'file', 'Your PTI', 'Filed by you, with our help']] },
      { k: 'Phase 1', t: 'Books and lots', s: 'Accounting, Sales, Inventory, Quality, Barcode', d: 'about 10–12 weeks', x: 1, ic: [['o', 'account'], ['o', 'sale'], ['o', 'stock'], ['o', 'quality_control']],
        it: [['o', 'account', 'Accounting', 'PHP, USD and JPY in one set of books'], ['o', 'sale', 'Sales', 'Orders to invoices, export lines zero-rated'], ['o', 'stock', 'Inventory', 'Stock by lot, every move recorded'], ['o', 'quality_control', 'Quality', 'Checks before a part is delivered'], ['i', 'box', 'Barcode', 'Scan parts, lots and locations']] },
      { k: 'Phase 2', t: 'The plant', s: 'Manufacturing, Maintenance, reports for Metts and PEZA', d: 'about 12–16 weeks', x: 2, ic: [['o', 'mrp'], ['o', 'maintenance'], ['o', 'spreadsheet_dashboard']],
        it: [['o', 'mrp', 'Manufacturing', 'Work orders on the die-cast cells'], ['o', 'maintenance', 'Maintenance', 'Dies by shot count, the plant’s own equipment'], ['o', 'spreadsheet_dashboard', 'Reports', 'For Metts and for PEZA']] },
      { k: 'Phase 3', t: 'AI and presence', s: 'AI pilots, a capability website, a LinkedIn page', d: 'about 6–8 weeks per AI pilot', x: 3, ic: [['o', 'ai_app'], ['o', 'website'], ['o', 'social']],
        it: [['o', 'ai_app', 'AI pilots', 'PO reader, anomaly alerts, defect summaries'], ['o', 'website', 'Website', 'A capability site, in English and Japanese'], ['o', 'social', 'LinkedIn page', 'A company page for B2B contacts']] }
    ];
    function ic(a, big) { return a[0] === 'o' ? odoo(a[1], big || 30) : '<span class="lp-ii' + (a[2] ? ' lp-i-eis' : '') + '">' + K.ico(a[1]) + '</span>'; }
    var tr = '<div class="lp-rt"><i class="lp-rl lp-rl--b"></i><i class="lp-rl lp-rl--p"></i>';
    P.forEach(function (p, i) { tr += '<i class="lp-rd' + (i === 0 ? ' lp-rd--b' : '') + '" data-d="' + i + '" style="left:' + (p.x * 346.67 + 160) + 'px"></i>'; });
    tr += '<div class="lp-mk"><span>31 Dec 2026</span></div></div>';
    var cards = '';
    P.forEach(function (p, i) {
      cards += '<div class="lp-pw" style="left:' + (120 + p.x * 346.67).toFixed(1) + 'px"' + inz(200 + i * 90) + '><button type="button" class="lp-p" data-p="' + i + '" aria-pressed="false">' +
        '<span class="lp-p-k">' + esc(p.k) + '</span><b class="lp-p-t">' + esc(p.t) + '</b><span class="lp-p-s">' + esc(p.s) + '</span>' +
        '<span class="lp-p-i">' + p.ic.map(function (a) { return ic(a, 30); }).join('') + '</span>' +
        '<span class="lp-p-d">' + K.ico('clock') + '<span>' + esc(p.d) + '</span></span></button></div>';
    });
    var h = head('the roadmap', 'Compliance first, <span class="hl">the plant next.</span>') +
      '<div' + inz(160) + '>' + tr + '</div>' + cards +
      '<div class="lp-dp lp-card" aria-live="polite"' + inz(560) + '></div>' +
      '<div class="bm-bar"' + inz(700) + '><p class="lp-ct-hint">Durations are our estimates, fixed in the quotation after discovery.</p></div>';
    put(s, h); fin(s);
    var pb = $$('.lp-p', s), ds = $$('.lp-rd', s), panel = $('.lp-dp', s), cur = -1;
    function pick(i, anim) {
      cur = i;
      pb.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      ds.forEach(function (d, j) { d.classList.toggle('is-on', j === i); });
      panel.innerHTML = P[i].it.map(function (a) {
        return '<div class="lp-it' + (a[4] ? ' lp-it--eis' : '') + '">' + ic([a[0], a[1], a[4]], 34) + '<span><b>' + esc(a[2]) + '</b><small>' + esc(a[3]) + '</small></span></div>';
      }).join('');
      if (anim) K.swap(panel);
    }
    Deck.on('road', {
      init: function () { s.addEventListener('click', function (e) { var b = e.target.closest('.lp-p'); if (b) pick(+b.getAttribute('data-p'), true); }); },
      enter: function () { pick(0, false); },
      settle: function () { pick(0, false); }
    });
  })();

  /* ================================================================ 5 · ai */
  (function () {
    var s = sec('ai'); if (!s) return;
    var R = [['TC-100', '200', '12 Nov', 'Transmission case'], ['CH-220', '300', '19 Nov', 'Cylinder head cover'], ['CR-310', '150', '26 Nov', 'Crankcase cover']];
    var po = '<div class="lp-doc"><div class="lp-doc-h"><b>Sample customer PO No. 4500-2611</b><span class="bm-chip">' + K.ico('globe') + '日本語 / EN</span></div>' +
      '<div class="lp-th"><span>Part no.</span><span>Qty</span><span>Delivery</span></div>' +
      R.map(function (r) { return '<div class="lp-r"><span>' + r[0] + '</span><span>' + r[1] + '</span><span>' + r[2] + '</span></div>'; }).join('') +
      '<div class="lp-doc-f">PDF or Excel, as received</div></div>';
    var so = '<div class="lp-doc lp-doc--so"><div class="lp-doc-h"><b class="lp-hd" style="font-size:16px">' + odoo('sale', 24) + 'Sales order · Sample customer</b><span class="lp-st" role="status" aria-live="polite"><i class="lp-st-i">' + K.ico('pen') + '</i><span class="lp-st-t">Waiting for a PO</span></span></div>' +
      '<div class="lp-th"><span>Product</span><span>Qty</span><span>Delivery</span></div>' +
      R.map(function (r) { return '<div class="lp-r"><em class="lp-gh">drafted by the reader</em><span>' + r[3] + '</span><span>' + r[1] + '</span><span>' + r[2] + '</span></div>'; }).join('') +
      '<div class="lp-doc-f">A person approves it</div></div>';
    var A = '<div class="lp-ac lp-aa lp-card" data-s="0"' + inz(200) + '><div class="lp-hd">' + odoo('ai_app', 30) + 'PO and forecast reader<em>press Read the PO</em></div>' +
      '<div class="lp-ar">' + po + '<i aria-hidden="true">' + K.ico('arrow') + '</i>' + so + '</div>' +
      '<div class="lp-ax"><button type="button" class="bm-btn lp-go lp-read">' + K.ico('search') + '<span>Read the PO</span></button><button type="button" class="bm-btn lp-appr" aria-disabled="true">' + K.ico('check') + '<span>Approve</span></button></div></div>';
    // scrap rate, 12 days (sample), x 0..542, y mapped 1.8..4.4 % onto 92..6
    var V = [2.1, 2.3, 2.0, 2.4, 2.2, 2.5, 2.3, 2.6, 2.8, 3.2, 3.7, 4.1], pts = V.map(function (v, i) { return [(8 + i * (526 / 11)).toFixed(1), (92 - (v - 1.8) / 2.6 * 86).toFixed(1)]; });
    var limY = (92 - (3.5 - 1.8) / 2.6 * 86).toFixed(1), last = pts[11];
    var Bc = '<div class="lp-ac lp-ab lp-card"' + inz(320) + '><div class="lp-hd">' + K.ico('alert') + 'Anomaly alerts<em>scrap rate, last 12 days</em></div>' +
      '<svg class="lp-sp" viewBox="0 0 542 100" width="542" height="100" role="img" aria-label="Sample scrap-rate line crossing a dashed limit on the last two days">' +
      '<line class="lim" x1="0" x2="542" y1="' + limY + '" y2="' + limY + '"/><text x="0" y="' + (limY - 8) + '">limit</text>' +
      '<polyline class="l draw" pathLength="1000" style="--d:700ms" points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '"/>' +
      '<circle class="pt" cx="' + last[0] + '" cy="' + last[1] + '" r="6"/></svg>' +
      '<span class="lp-al">' + K.ico('alert') + 'Die D-07 scrap 4.1% · above trend</span></div>';
    var Cc = '<div class="lp-ac lp-ad lp-card"' + inz(440) + '><div class="lp-hd">' + K.ico('file') + 'Defect summaries<em>Week 43 quality summary</em></div>' +
      '<ul class="lp-bl"><li>3 leak-test rejects in 412 castings, 2 on die D-07</li><li>1 lot held after X-ray: porosity above the limit</li><li>Dimensions in tolerance on all other lots</li></ul></div>';
    var h = head('ai, where it pays', 'AI that removes <span class="hl">keying.</span>') + A + Bc + Cc +
      '<div class="bm-bar"' + inz(700) + '><p class="lp-ct-hint">Phase 3 pilots, about 6–8 weeks each · run on Odoo data from Phases 1–2 · a person approves every document</p></div>' +
      '<p class="illus bm-ill">' + K.ico('check') + 'Sample PO, order, scrap rate and quality figures · illustrative</p>';
    put(s, h); fin(s);
    var card = $('.lp-aa', s), pr = $$('.lp-doc:not(.lp-doc--so) .lp-r', s), sr = $$('.lp-doc--so .lp-r', s), stT = $('.lp-st-t', s), stI = $('.lp-st-i', s);
    var bRead = $('.lp-read', s), bRT = $('span', bRead), bApp = $('.lp-appr', s), st = newBag(), busy = false, state = 0;
    function clearInline() { sr.forEach(function (r) { r.style.opacity = ''; r.style.transform = ''; }); }
    function set(n) {
      state = n; card.setAttribute('data-s', n);
      sr.forEach(function (r) { r.classList.toggle('is-fill', n >= 1); });
      pr.forEach(function (r) { r.classList.remove('is-read'); });
      stT.textContent = n === 0 ? 'Waiting for a PO' : n === 1 ? 'Draft · needs approval' : 'Quotation confirmed';
      stI.innerHTML = K.ico(n === 2 ? 'check' : n === 1 ? 'pen' : 'clock');
      bRT.textContent = n === 0 ? 'Read the PO' : 'Read again';
      if (n === 1) bApp.removeAttribute('aria-disabled'); else bApp.setAttribute('aria-disabled', 'true');
      clearInline();
    }
    function read() {
      if (busy) return; var ctx = st.ctx;
      K.stop(st); set(0);
      if (!live() || !ctx || !ctx.alive) { set(1); return; }
      busy = true;
      R.forEach(function (r, i) {
        ctx.after(250 + i * 520, function () {
          pr[i].classList.add('is-read');
          var row = sr[i]; row.style.opacity = 0; row.style.transform = 'translateX(-340px)'; row.classList.add('is-fill');
          var done = false;
          K.drive(st, function (p) { if (done) return; row.style.opacity = Math.min(1, p * 2.5); row.style.transform = 'translateX(' + (-340 * (1 - p)).toFixed(1) + 'px)'; if (p >= .995) { done = true; row.style.opacity = ''; row.style.transform = ''; } }, { stiffness: 150, damping: 25 });
        });
      });
      ctx.after(250 + R.length * 520 + 350, function () { busy = false; set(1); });
    }
    function approve() {
      if (state !== 1 || busy) return;
      set(2);
      if (live() && st.ctx && st.ctx.alive) K.drive(st, function (p) { stT.parentNode.style.transform = 'scale(' + (1 + .08 * Math.max(0, 1 - p)) + ')'; if (p >= .99) stT.parentNode.style.transform = ''; }, { stiffness: 260, damping: 20 });
    }
    Deck.on('ai', {
      init: function () { bRead.addEventListener('click', read); bApp.addEventListener('click', approve); },
      enter: function (ctx) { st.ctx = ctx; busy = false; K.stop(st); if (live()) set(0); else set(2); },
      leave: function () { K.stop(st); busy = false; clearInline(); stT.parentNode.style.transform = ''; },
      settle: function () { K.stop(st); busy = false; set(2); stT.parentNode.style.transform = ''; }
    });
    set(2);
  })();

  /* ================================================================ 6 · cost */
  (function () {
    var s = sec('cost'); if (!s) return;
    var T = { o: ['lp-tp', 'one-off'], y: ['lp-tp lp-tp--r', 'yearly'], m: ['lp-tp lp-tp--r', 'monthly'] };
    function item(n, sub, t, y2, extra) { return '<div class="lp-ci" data-t="' + t + '" data-y2="' + (y2 ? 1 : 0) + '"><div class="lp-ci-t"><b>' + esc(n) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>' + (extra || '') + '<span class="' + T[t][0] + '">' + T[t][1] + '</span></div>'; }
    function grp(c, ic, name, items, d) { return '<div class="lp-gc lp-card ' + c + '"' + inz(d) + '><div class="lp-hd">' + odoo(ic, c === 'lp-g0' ? 34 : 28) + esc(name) + '</div>' + items + '</div>'; }
    var g0 = grp('lp-g0', 'stock', 'Odoo ERP',
      item('Implementation', '7 apps, one plant', 'o', 0) + item('Data migration and group reports', '', 'o', 0) + item('Training and support after go-live', '', 'o', 0) +
      item('Odoo Enterprise licences', 'Odoo’s price, per user per month, paid to Odoo', 'y', 1), 200);
    var g1 = grp('lp-g1', 'account', 'BIR e-invoicing', item('EIS connection and PTI support, quoted separately', '', 'o', 0) + item('Connector upkeep', '', 'y', 1), 300);
    var g2 = grp('lp-g2', 'ai_app', 'AI pilots', item('Three pilot builds', '', 'o', 0) + item('Model run cost and monitoring', '', 'm', 1), 380);
    var g3 = grp('lp-g3', 'website', 'B2B presence', item('Website (EN/JA) and recruitment pages', '', 'o', 0) + item('Content retainer, 1 post a week', '', 'm', 1), 460);
    var ctl = '<div class="lp-cc"' + inz(160) + '><p class="lp-cn" aria-live="polite"><b>6</b><span>one-off</span><i>\u00b7</i><b>4</b><span>recurring</span></p>' +
      '<div class="seg" role="group" aria-label="Period"><button type="button" data-p="1" aria-pressed="true">Year 1</button><button type="button" data-p="2" aria-pressed="false">From year 2</button></div></div>';
    var h = head('the investment', 'How the investment is <span class="hl">built, line by line.</span>') + ctl +
      '<div class="lp-cg">' + g0 + g1 + g2 + g3 + '</div>' +
      '<div class="bm-bar lp-cb"' + inz(700) + '><p><b>Not included:</b> VAT · accredited EIS provider fees, if any · on-site servers · barcode hardware · travel</p><p>Figures come in the quotation after the discovery workshop.</p></div>';
    put(s, h); fin(s);
    var items = $$('.lp-ci', s), bs = $$('.seg button', s), nEl = $('.lp-cn', s);
    function paint(p, anim) {
      var one = 0, rec = 0;
      items.forEach(function (it) { var on = p === 1 || it.getAttribute('data-y2') === '1'; it.classList.toggle('is-off', !on); if (on) it.removeAttribute('aria-hidden'); else it.setAttribute('aria-hidden', 'true'); if (on) { if (it.getAttribute('data-t') === 'o') one++; else rec++; } });
      bs.forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-p') === p ? 'true' : 'false'); });
      nEl.innerHTML = (one ? '<b>' + one + '</b><span>one-off</span><i>\u00b7</i>' : '') + '<b>' + rec + '</b><span>recurring</span>'; if (anim) K.swap(nEl);
    }
    Deck.on('cost', {
      init: function () { $('.seg', s).addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) paint(+b.getAttribute('data-p'), true); }); },
      enter: function () { paint(1, false); },
      settle: function () { paint(1, false); }
    });
  })();

  /* ================================================================ 7 · plan */
  (function () {
    var s = sec('plan'); if (!s) return;
    var R = [
      { w: 'W1', t: 'First meeting', d: 'The questions at the back, answered', o: 'b', x: 'The questions are answered' },
      { w: 'W2', t: 'Two-hour discovery', d: 'Accounting, invoicing, inventory, quality', o: 't', x: 'A signed map of how things run today' },
      { w: 'W3', t: 'Odoo 20 demo on your cases', d: 'A zero-rated export invoice, USD and JPY, lots', o: 't', x: 'You confirm the Phase 1 scope' },
      { w: 'W4', t: 'Approval brief in English', d: 'For Metts in Japan', o: 'c', x: 'Metts responds' },
      { w: 'W5–6', t: 'Phase 1 signed', d: 'PTI filed, if you are in the first group', o: 'b', x: 'Contract signed, PTI filed' }
    ];
    function chips(o) { var t = '<span class="lp-oc">TechNext</span>', c = '<span class="lp-oc lp-oc--c">Laguna Metts</span>'; return o === 't' ? t : o === 'c' ? c : t + c; }
    var rows = '';
    R.forEach(function (r, i) {
      rows += '<div class="lp-prw"' + inz(200 + i * 80) + '><div class="lp-pr" data-r="' + i + '" data-on="0"><span class="lp-pw0">' + r.w + '</span><span class="lp-ps"><b>' + esc(r.t) + '</b><small>' + esc(r.d) + '</small></span>' +
        '<span class="lp-ow">' + chips(r.o) + '</span><p class="lp-dn">' + esc(r.x) + '</p>' +
        '<button type="button" class="lp-tk" data-r="' + i + '" aria-pressed="false">' + K.ico('check') + '</button></div></div>';
    });
    var h = head('mutual action plan', 'The next six weeks, <span class="hl">together.</span>') +
      '<div class="lp-pl"><div class="lp-ph"' + inz(160) + '><span>Week</span><span>Step</span><span>Owner</span><span>Done when</span><span></span></div>' + rows + '</div>' +
      '<div class="bm-bar lp-pb"' + inz(700) + '><p class="lp-pn" aria-live="polite"><b>0</b><span>of 5 done</span></p><p class="lp-ct-hint" style="flex:none">Click the circle to mark a step done.</p></div>';
    put(s, h); fin(s);
    var tks = $$('.lp-tk', s), prs = $$('.lp-pr', s), pn = $('.lp-pn', s), pnb = $('b', pn), marks = K.load('plan');
    if (SHARED) tks.forEach(K.readOnly);
    var NAMES = R.map(function (r) { return r.w + ' ' + r.t; });
    function reload() { var m = K.load('plan'); if (Object.keys(m).length || !Object.keys(marks).length) marks = m; }
    function on(i) { return !(Deck.print || SHARED) && !!marks[i]; }
    function paint() {
      var n = 0;
      tks.forEach(function (b, i) {
        var v = on(i); if (v) n++;
        b.setAttribute('aria-pressed', v ? 'true' : 'false'); prs[i].setAttribute('data-on', v ? 1 : 0);
        b.setAttribute('aria-label', NAMES[i]);
      });
      pnb.textContent = n; pn.classList.toggle('is-full', n === R.length);
    }
    Deck.on('plan', {
      init: function () {
        s.addEventListener('click', function (e) {
          var b = e.target.closest('.lp-tk'); if (!b || SHARED) return;
          var i = +b.getAttribute('data-r'); if (marks[i]) delete marks[i]; else marks[i] = 1;
          K.save('plan', marks); paint();
        });
        paint();
      },
      enter: function () { reload(); paint(); },
      settle: function () { reload(); paint(); }
    });
  })();
})();

/* Proposal for Hitachi Elevator Philippines: slide behaviour. Every demo runs on sample data, labelled on its slide.
   Each slide that animates has a settle hook, so the overview and the PDF show it finished. */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var clamp = Deck.clamp;
  var BC = { mk: '#3167CA', cb: '#EB6834', cd: '#1BAF7A' }, BN = { mk: 'Makati', cb: 'Cebu', cd: 'Cagayan de Oro' };
  var ST = { good: '#0ca30c', warn: '#fab219', crit: '#d03b3b', none: '#D5DAE3' };

  // a segmented control: sets aria-pressed and calls fn(value); returns set(value)
  function seg(root, fn) {
    function set(v, quiet) {
      $$('button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      if (!quiet) fn(v);
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    return set;
  }
  function pressed(root) { var b = $('button[aria-pressed="true"]', root); return b && b.dataset.v; }

  /* ---------------------------------------------------------------- 2 · what we understand */
  Deck.on('understand', {
    init: function (s) {
      var svg = $('.hu-svg', s), g = $('.hu-arcs', s), P = {};
      $$('.hu-pin', s).forEach(function (p) { var m = /translate\(([\d.]+),([\d.]+)\)/.exec(p.getAttribute('transform')); P[p.dataset.k] = [+m[1], +m[2]]; });
      [['cb', .22], ['cd', .2]].forEach(function (a, i) {
        var path = FX.svg('path', { d: FX.arc(P.mk, P[a[0]], a[1]), 'class': 'draw' }, g);
        path.style.setProperty('--len', Math.ceil(path.getTotalLength()));
        path.style.setProperty('--d', (700 + i * 260) + 'ms');
      });
      svg.insertBefore(FX.svg('path', { d: 'M68,112 C120,118 150,150 ' + (P.mk[0] - 10) + ',' + (P.mk[1] - 12), 'class': 'hu-lead' }), g);
    },
    enter: function (ctx, s) {
      $$('[data-count]', s).forEach(function (el, i) {
        var to = +el.dataset.count; el.textContent = '0';
        ctx.after(360 + i * 160, function () { ctx.count(el, to, { dur: 1100 }); });
      });
    },
    settle: function (s) { $$('[data-count]', s).forEach(function (el) { el.textContent = el.dataset.count; }); }
  });

  /* ---------------------------------------------------------------- 3 · pressure points: each one's line to its apps */
  Deck.on('pressure', {
    init: function (s) {
      var pp = $('.pp', s), svg = $('.pp-svg', s), cards = $$('.pp-c', s), apps = {};
      $$('.pp-a', s).forEach(function (a) { apps[a.dataset.app] = a; });
      s._build = function () {
        PX.clear(svg); s._links = [];
        var W = pp.offsetWidth; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + pp.offsetHeight);
        cards.forEach(function (c, i) {
          var a = Deck.lbox(c, pp);
          c.dataset.apps.split(' ').forEach(function (k) {
            var b = Deck.lbox(apps[k], pp), x0 = a.r, y0 = a.cy, x1 = b.x, y1 = b.cy, mx = (x0 + x1) / 2;
            var p = PX.svg('path', { d: 'M' + x0 + ',' + y0 + ' C' + mx + ',' + y0 + ' ' + mx + ',' + y1 + ' ' + x1 + ',' + y1 }, svg);
            p._L = Math.ceil(p.getTotalLength()); p.style.strokeDasharray = p._L;
            s._links.push({ p: p, c: c, i: i });
          });
        });
      };
      function focus(c) {
        pp.classList.toggle('is-focus', !!c);
        cards.forEach(function (x) { x.classList.toggle('is-hot', x === c); });
        var hot = {}; if (c) c.dataset.apps.split(' ').forEach(function (k) { hot[k] = 1; });
        Object.keys(apps).forEach(function (k) { apps[k].classList.toggle('is-hot', !!hot[k]); });
        (s._links || []).forEach(function (l) { l.p.classList.toggle('is-hot', l.c === c); });
      }
      s._focus = focus;
      cards.forEach(function (c) {
        c.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && !s._lock) focus(c); });
        c.addEventListener('focus', function () { if (!s._lock) focus(c); });
        c.addEventListener('click', function () { s._lock = s._lock === c ? null : c; focus(s._lock || c); });
      });
      pp.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !s._lock) focus(null); });
      s._build();
    },
    enter: function (ctx, s) {
      s._lock = null; s._focus(null); s._build();
      s._links.forEach(function (l) { l.p.style.transition = 'none'; l.p.style.strokeDashoffset = l.p._L; });
      s._links.forEach(function (l) {
        ctx.after(640 + l.i * 190, function () { l.p.style.transition = 'stroke-dashoffset .9s cubic-bezier(.65,0,.35,1),opacity .35s,stroke .35s'; l.p.style.strokeDashoffset = 0; });
      });
    },
    settle: function (s) { s._lock = null; s._focus(null); s._build(); s._links.forEach(function (l) { l.p.style.transition = 'none'; l.p.style.strokeDashoffset = 0; }); }
  });

  /* ---------------------------------------------------------------- 4 · architecture: flows between the boxes */
  var AR = {
    phone: ['Phone.', 'Calls to any of the three offices open a ticket in one queue, with the building, the unit and its contract attached.'],
    mail: ['Email.', 'Each office inbox becomes a Helpdesk address: an email to the branch opens or updates a ticket.'],
    form: ['Website form.', 'The form files a ticket directly, so a request never waits in an inbox.'],
    portal: ['Customer portal.', 'Building owners follow their tickets, visit reports and contracts on the Odoo portal.'],
    wa: ['WhatsApp.', 'Messages can open tickets too, through Odoo\'s WhatsApp app.'],
    odoo: ['Odoo.', 'One database for the service side: tickets, jobs, contracts, stock, customers and installations, shared by Makati, Cebu and Cagayan de Oro.'],
    gerp: ['GERP.', 'It keeps the ledger. Odoo hands over the invoice lines for contracts and chargeable visits, and reads the payment status back. The interface is agreed with group IT.'],
    mon: ['Remote monitoring.', 'If Hitachi\'s monitoring runs in the Philippines, its alarms can open tickets before anyone calls. One of our questions for discovery.'],
    app: ['Technician app.', 'Technicians get their jobs on the Odoo app, fill the worksheet, record the parts and collect the signature on site.'],
    cam: ['Body cameras.', 'The programme stays as it is. Each visit record keeps its clip ID, so footage and paperwork point at each other.']
  };
  Deck.on('arch', {
    init: function (s) {
      var ar = $('.ar', s), gP = $('.ar-paths', s), gD = $('.ar-dots', s), say = $('.ar-say span', s), sayB = $('.ar-say b', s);
      function box(el) { return Deck.lbox(el, ar); }
      function add(d, k, o) {
        o = o || {};
        var p = PX.svg('path', { d: d, 'class': o.dash ? 'is-dash' : null }, gP), L = p.getTotalLength();
        var n = o.n || 1, dots = [];
        for (var i = 0; i < n; i++) dots.push(PX.svg('circle', { r: 4, 'class': o.back ? 'is-back' : null }, gD));
        s._flows.push({ p: p, L: L, dots: dots, k: k, per: o.per || 3000, off: o.off || 0 });
      }
      s._build = function () {
        PX.clear(gP); PX.clear(gD); s._flows = [];
        $('.ar-svg', s).setAttribute('viewBox', '0 0 ' + ar.offsetWidth + ' ' + ar.offsetHeight);
        var core = box($('.ar-core', s)), gerp = box($('.ar-gerp', s)), mon = box($('.ar-mon', s)), fld = $$('.ar-field .ar-n', s).map(box), ch = $$('.ar-ch', s);
        ch.forEach(function (c, i) {
          var b = box(c), y1 = core.y + 70 + i * ((core.h - 120) / (ch.length - 1));
          add('M' + b.r + ',' + b.cy + ' C' + (b.r + 58) + ',' + b.cy + ' ' + (core.x - 58) + ',' + y1 + ' ' + core.x + ',' + y1, c.dataset.k, { per: 2600 + i * 260, off: i * .19 });
        });
        add('M' + core.r + ',' + (gerp.cy - 12) + ' C' + (core.r + 60) + ',' + (gerp.cy - 12) + ' ' + (gerp.x - 60) + ',' + (gerp.cy - 12) + ' ' + gerp.x + ',' + (gerp.cy - 12), 'gerp', { per: 2400, n: 2 });
        add('M' + gerp.x + ',' + (gerp.cy + 12) + ' C' + (gerp.x - 60) + ',' + (gerp.cy + 12) + ' ' + (core.r + 60) + ',' + (gerp.cy + 12) + ' ' + core.r + ',' + (gerp.cy + 12), 'gerp', { per: 3000, back: true, off: .5 });
        add('M' + mon.x + ',' + mon.cy + ' C' + (mon.x - 70) + ',' + mon.cy + ' ' + (core.r + 70) + ',' + (core.b - 70) + ' ' + core.r + ',' + (core.b - 70), 'mon', { dash: true, per: 3600, off: .3 });
        add('M' + (fld[0].cx + 20) + ',' + core.b + ' V' + fld[0].y, 'app', { per: 2200 });
        add('M' + (fld[0].cx - 20) + ',' + fld[0].y + ' V' + core.b, 'app', { per: 2600, back: true, off: .4 });
        add('M' + fld[1].cx + ',' + fld[1].y + ' V' + core.b, 'cam', { per: 3000, back: true, off: .2 });
        s._place(0);
      };
      s._place = function (t) {
        s._flows.forEach(function (f) {
          f.dots.forEach(function (d, j) {
            var p = ((t / f.per) + f.off + j / f.dots.length) % 1, pt = f.p.getPointAtLength(p * f.L);
            d.setAttribute('cx', pt.x.toFixed(1)); d.setAttribute('cy', pt.y.toFixed(1));
            d.style.opacity = Math.min(1, p * 6, (1 - p) * 6).toFixed(2);
          });
        });
      };
      s._pick = function (k) {
        $$('.ar-n', s).forEach(function (n) { n.classList.toggle('is-on', n.dataset.k === k); });
        s._flows.forEach(function (f) { f.p.classList.toggle('is-hot', f.k === k || (k === 'odoo')); });
        if (k && AR[k]) { sayB.textContent = AR[k][0]; say.textContent = AR[k][1]; }
        else { sayB.textContent = 'Click any box.'; say.textContent = 'Odoo runs the service work; GERP keeps the books.'; }
      };
      ar.addEventListener('click', function (e) {
        var n = e.target.closest('.ar-n'); if (!n) return;
        s._cur = s._cur === n.dataset.k ? null : n.dataset.k; s._pick(s._cur);
      });
      s._build();
    },
    enter: function (ctx, s) {
      s._cur = null; s._pick(null); s._build();
      ctx.frame(function (t) { s._place(t); });
    },
    settle: function (s) { s._cur = null; s._pick(null); s._build(); s._place(900); }
  });

  /* ---------------------------------------------------------------- 5 · a breakdown call, ring to report */
  var BR = {
    mk: { city: 'Makati CBD', bld: 'Tower A, Makati CBD', unit: 'Car 2', tech: 'Santos', van: 'Van 03', stock: 'Makati', id: '#HD-2417',
      at: [300, 58], who: ['S', 'R', 'C'], techs: [[62, 300], [372, 236], [168, 58]], route: 'M62,300 V236 H168 V142 H268 V58 H300' },
    cb: { city: 'Mandaue', bld: 'Mandaue Business Park, Cebu', unit: 'Car 1', tech: 'Garcia', van: 'Van 07', stock: 'Cebu', id: '#HD-2418',
      at: [200, 236], who: ['G', 'L', 'T'], techs: [[372, 142], [62, 58], [268, 300]], route: 'M372,142 H268 V236 H200' },
    cd: { city: 'Cagayan de Oro', bld: 'Central Offices, Cagayan de Oro', unit: 'Car 1', tech: 'Mendoza', van: 'Van 11', stock: 'Cagayan de Oro', id: '#HD-2419',
      at: [62, 110], who: ['M', 'V', 'B'], techs: [[268, 236], [372, 58], [168, 300]], route: 'M268,236 H168 V142 H62 V110' }
  };
  var SCN = {
    p1: { pri: 'P1 · Passenger trapped', ch: 'Phone', what: 'Car stopped between floors 8 and 9, two passengers inside.', target: 30, tl: 'of 30 min',
      part: 'Door roller kit', stamp: 'On site in 17 min',
      ev: [[0, 0, '09:02', 'Lobby phone call logged in Helpdesk'], [1, 1, '09:03', 'P1 entrapment: 30-minute response clock started'],
        [2, 2, '09:04', '{tech} assigned: nearest, free, driving {van}'], [2, 3, '09:04', 'Door roller kit reserved from {stock} stock'],
        [17, 4, '09:19', 'QR check-in at {unit} · camera clip linked', 'arrive'], [19, -1, '09:21', 'Passengers released, car parked', 'ok'],
        [44, 5, '09:46', 'Worksheet signed by the building admin'], [45, 5, '09:47', 'Report e-mailed · billable line to GERP']] },
    p2: { pri: 'P2 · Lift stopped', ch: 'Email', what: 'Lift out of service since this morning, no one inside.', target: 120, tl: 'of 2 hours',
      part: 'Brake lining set', stamp: 'On site in 48 min',
      ev: [[0, 0, '13:10', 'Email to the {stock} office opened a ticket'], [1, 1, '13:11', 'P2 lift out of service: 2-hour response clock started'],
        [4, 2, '13:14', '{tech} assigned after a nearby visit'], [5, 3, '13:15', 'Brake lining set picked up at the {stock} service centre'],
        [48, 4, '13:58', 'QR check-in at {unit} · camera clip linked', 'arrive'], [95, -1, '14:45', 'Brake lining replaced, lift back in service', 'ok'],
        [101, 5, '14:51', 'Worksheet and parts signed off'], [102, 5, '14:52', 'Report e-mailed · parts and labour line to GERP']] },
    p3: { pri: 'P3 · Noisy escalator', ch: 'Portal', what: 'Escalator E2 noisy at the top landing, still running.', target: 1460, tl: 'next business day',
      part: 'Step chain roller kit', stamp: 'Visited next morning',
      ev: [[0, 0, '16:40', 'Portal request from the building admin, with a video'], [1, 1, '16:41', 'P3 noise report: visit within one business day'],
        [3, 2, '16:43', 'Planned for tomorrow 08:00 with {tech}'], [4, 3, '16:44', 'Step chain roller kit reserved in {stock} stock'],
        [924, 4, '08:04', 'Next morning: QR check-in at Escalator E2', 'arrive'], [990, -1, '09:10', 'Rollers replaced, noise gone', 'ok'],
        [995, 5, '09:15', 'Worksheet signed · report e-mailed']] }
  };
  function fill(t, b) { return t.replace(/\{(\w+)\}/g, function (_, k) { return b[k] || ''; }); }
  function mins(m) { if (m < 60) return Math.round(m) + ' min'; var h = Math.floor(m / 60); return h + 'h ' + String(Math.round(m % 60)).padStart(2, '0') + 'm'; }
  // real-time offsets (ms) for each event: an even pace, with a longer stretch for the drive
  function beats(E) {
    var t = 500, out = [];
    E.ev.forEach(function (e, i) {
      if (e[4] === 'arrive') t += 3600; else if (i) t += 1000;
      out.push(t);
    });
    return out;
  }
  function bkPaint(s, sc, br, k, m) {
    // k: how many events have happened; m: minutes on the clock
    var E = SCN[sc], B = BR[br], n = E.ev.length, arrived = false, done = -1;
    for (var i = 0; i < k; i++) { if (E.ev[i][4] === 'arrive') arrived = true; if (E.ev[i][1] > done) done = E.ev[i][1]; }
    $$('.bk-st', s).forEach(function (st, j) { st.classList.toggle('is-done', j <= done); st.classList.toggle('is-cur', j === done + 1 && k < n); });
    $('.bk-rail b', s).style.setProperty('--p', (Math.max(0, done) / 5 * 100) + '%');
    var sla = $('.bk-sla', s), used = Math.min(m, E.target), pct = clamp(used / E.target * 100, 0, 100);
    $('.bk-sla-fg', s).style.strokeDashoffset = (100 - pct).toFixed(1);
    $('[data-bk-el]', s).textContent = k ? mins(m) : '0 min';
    $('[data-bk-st]', s).textContent = !k ? 'Clock not started' : k < 2 ? 'Ticket opened' : arrived ? E.stamp : 'Within target, running';
    sla.classList.toggle('is-ok', arrived);
    $('[data-bk-tech]', s).textContent = k > 2 ? B.tech + ' · ' + B.van : 'Waiting for dispatch';
    $('[data-bk-part]', s).textContent = k > 3 ? E.part + ' · ' + B.stock + ' stock' : 'Parts not checked yet';
    var ol = $('[data-bk-log]', s);
    $$('li', ol).forEach(function (li, j) { li.classList.toggle('is-in', j < k); });
    var st = $('[data-bk-stamp]', s); st.classList.toggle('is-on', k >= n);
    $('.bk-eta', s).textContent = k < 3 ? 'Nearest free technician: 3 in range' : arrived ? B.tech + ' on site' : sc === 'p3' ? 'Visit planned for 08:00 tomorrow' : B.tech + ' driving to site';
  }
  function bkSetup(s, sc, br) {
    var E = SCN[sc], B = BR[br];
    var pri = $('[data-bk-pri]', s); pri.textContent = E.pri; pri.dataset.p = sc;
    $('.bk-ch', s).textContent = 'via ' + E.ch.toLowerCase();
    $('[data-bk-id]', s).textContent = B.id;
    $('[data-bk-where]', s).textContent = B.bld + ' · ' + (sc === 'p3' ? 'Escalator E2' : B.unit);
    $('[data-bk-what]', s).textContent = E.what;
    $('[data-bk-tg]', s).textContent = E.tl;
    $('[data-bk-city]', s).textContent = B.city + ' (sample)';
    var ol = $('[data-bk-log]', s); ol.textContent = '';
    E.ev.forEach(function (e) {
      var li = document.createElement('li'), b = document.createElement('b'), sp = document.createElement('span');
      b.textContent = e[2]; sp.textContent = fill(e[3], B); if (e[4] === 'ok') li.className = 'is-ok';
      li.appendChild(b); li.appendChild(sp); ol.appendChild(li);
    });
    var bld = $('.bk-bld', s); bld.setAttribute('transform', 'translate(' + B.at[0] + ',' + B.at[1] + ')');
    $$('.bk-tech', s).forEach(function (t, i) { t.setAttribute('transform', 'translate(' + B.techs[i][0] + ',' + B.techs[i][1] + ')'); $('text', t).textContent = B.who[i]; t.classList.remove('is-go'); t.classList.toggle('is-busy', i > 0); });
    var r = $('.bk-route', s); r.setAttribute('d', B.route); r._len = null;
    var L = r.getTotalLength(); r.style.strokeDasharray = L; r.style.strokeDashoffset = L; r._L = L;
    s._route = r;
  }
  function bkDrive(s, br, p) {
    var r = s._route, t = $('.bk-tech--a', s);
    t.classList.add('is-go');
    FX.along(r, t, p, false);
    t.setAttribute('transform', t.getAttribute('transform').replace(/ rotate\([^)]*\)/, ''));
    r.style.strokeDashoffset = (r._L * (1 - p)).toFixed(1);
  }
  Deck.on('breakdown', {
    init: function (s) {
      s._sc = 'p1'; s._br = 'mk'; bkSetup(s, 'p1', 'mk'); bkPaint(s, 'p1', 'mk', 0, 0);
      s._setSc = seg($('[data-bk="sc"]', s), function (v) { s._sc = v; if (s._play) s._play(); });
      s._setBr = seg($('[data-bk="br"]', s), function (v) { s._br = v; if (s._play) s._play(); });
    },
    enter: function (ctx, s) {
      var run = 0;
      s._play = function () {
        var my = ++run, sc = s._sc, br = s._br, E = SCN[sc], T = beats(E), n = E.ev.length;
        bkSetup(s, sc, br); bkPaint(s, sc, br, 0, 0);
        var ai = E.ev.findIndex(function (e) { return e[4] === 'arrive'; }), t0 = T[ai - 1], t1 = T[ai];
        var start = performance.now();
        ctx.frame(function (_, now) {
          if (my !== run) return false;
          var ms = now - start, k = 0; while (k < n && T[k] <= ms) k++;
          // minutes on the clock: from the last event towards the next one
          var m = 0;
          if (k > 0) {
            var a = E.ev[k - 1][0], b = k < n ? E.ev[k][0] : a, ta = T[k - 1], tb = k < n ? T[k] : ta;
            m = tb > ta ? PX.lerp(a, b, clamp((ms - ta) / (tb - ta), 0, 1)) : a;
            if (k > ai) m = E.ev[ai][0];
          }
          bkPaint(s, sc, br, k, m);
          if (ms >= t0 && ms <= t1 + 50) bkDrive(s, br, clamp((ms - t0) / (t1 - t0), 0, 1));
          if (k >= n) return false;
        });
      };
      ctx.on($('[data-bk-again]', s), 'click', function () { s._play(); });
      s._play();
    },
    leave: function (s) { s._play = null; },
    settle: function (s) {
      var sc = s._sc, br = s._br, E = SCN[sc], ai = E.ev.findIndex(function (e) { return e[4] === 'arrive'; });
      bkSetup(s, sc, br); bkPaint(s, sc, br, E.ev.length, E.ev[ai][0]); bkDrive(s, br, 1);
    }
  });

  /* ---------------------------------------------------------------- 6 · dispatch board */
  var TECH = [
    { n: 'Santos', b: 'Makati', i: 'RS', jobs: [['pm', 0, 1.6, 'Tower A · Cars 1 to 3', 'monthly visit', 'ok'], ['bd', 2.2, 1.5, 'Tower C · Car 2', 'door fault', 'ok'], ['pm', 5, 2, 'Office park, Pasig', 'monthly visit', 'ok']] },
    { n: 'Reyes', b: 'Makati', i: 'JR', jobs: [['in', 0, 5.5, 'NSCR station · escalators', 'installation, day 12', 'ok'], ['pm', 7, 2, 'Hotel, Makati', 'quarterly visit', 'ok']] },
    { n: 'Cruz', b: 'Makati', i: 'AC', jobs: [['pm', .5, 2, 'Condominium, Makati', 'monthly visit', 'ok'], ['pm', 3, 1.6, 'Tower B · Car 4', 'monthly visit', 'wait'], ['pm', 6.6, 2, 'Hospital, Taguig', 'monthly visit', 'ok']] },
    { n: 'Garcia', b: 'Cebu', i: 'MG', jobs: [['pm', 0, 2, 'Offices, Mandaue', 'monthly visit', 'ok'], ['pm', 5.6, 2.2, 'Mall, Cebu City', 'escalators', 'ok']] },
    { n: 'Lim', b: 'Cebu', i: 'KL', jobs: [['bd', 1, 1.6, 'Hotel, Lapu-Lapu', 'lift stopped', 'wait'], ['pm', 4, 2.4, 'Condominium, Cebu City', 'monthly visit', 'ok']] },
    { n: 'Mendoza', b: 'Cagayan de Oro', i: 'DM', jobs: [['pm', .5, 2, 'Mall, Cagayan de Oro', 'escalators', 'ok'], ['pm', 4, 2, 'Hospital, Cagayan de Oro', 'monthly visit', 'ok']] }
  ];
  var CALLS = [
    { row: 3, s: 3.75, w: 1.5, t: 'bd', a: '#HD-2431 · Mandaue', b: 'lift stopped, brake parts in van', say: 'Garcia was free, nearest and carrying the brake parts: the Cebu call went to him.', free: 'Reyes, 13:30' },
    { row: 2, s: 3.7, w: 1.1, t: 'bd', a: '#HD-2432 · Tower B', b: 'passenger trapped', bump: [2, 1, 4.92], say: 'An entrapment in Makati: Cruz takes it, and his 11:00 visit moves to 12:55 with the building told.', free: 'Santos, 12:40' },
    { row: 5, s: 8, w: 1.5, t: 'bd', a: '#HD-2433 · escalator noise', b: 'planned for 16:00, part reserved', say: 'A noise report in Cagayan de Oro is planned into the afternoon, with the part reserved.', free: 'Santos, 12:40' }
  ];
  function dpBase(s) {
    var grid = $('.dp-grid', s); $$('.dp-r', grid).forEach(function (r) { r.remove(); });
    s._rows = TECH.map(function (t) {
      var r = document.createElement('div'); r.className = 'dp-r';
      r.innerHTML = '<div class="dp-who"><i></i><span><b></b><small></small></span></div><div class="dp-lane"></div>';
      $('i', r).textContent = t.i; $('b', r).textContent = t.n; $('small', r).textContent = t.b;
      t.jobs.forEach(function (j) { $('.dp-lane', r).appendChild(dpJob(j[0], j[1], j[2], j[3], j[4], j[5])); });
      grid.appendChild(r); return r;
    });
    s._calls = 0; s._busy = false;
    dpFoot(s, 0);
  }
  function dpJob(t, st, w, a, b, parts) {
    var el = document.createElement('div'); el.className = 'dp-job t-' + t;
    el.style.setProperty('--s', st); el.style.setProperty('--w', w);
    el.innerHTML = '<b></b><small></small><em></em>';
    $('b', el).textContent = a; $('small', el).textContent = b;
    $('em', el).innerHTML = parts === 'wait' ? '<span class="is-wait" title="waiting on a part">' + BOX + '</span>' : '<span title="parts ready">' + BOX + '</span>';
    return el;
  }
  var BOX = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>';
  function dpFoot(s, n) {
    var vans = [4, 5, 5, 6][n], wait = [2, 2, 2, 2][n];
    $('[data-dp="vans"]', s).textContent = vans + ' of 6';
    $('[data-dp="parts"]', s).textContent = wait;
    $('[data-dp="free"]', s).textContent = n ? CALLS[n - 1].free : 'Reyes, 13:30';
    $('[data-dp="say"]', s).textContent = n ? CALLS[n - 1].say : 'A new call goes to the technician who is free, nearest and has the part.';
  }
  // place call n; animate: the new job slides in from the button, a bumped visit glides to its new time
  function dpCall(s, n, animate) {
    var c = CALLS[n]; if (!c) return;
    var lane = $('.dp-lane', s._rows[c.row]), dp = $('.dp', s);
    if (c.bump) {
      var bj = $$('.dp-job', s._rows[c.bump[0]])[c.bump[1]], before = Deck.lbox(bj, dp);
      bj.style.setProperty('--s', c.bump[2]);
      if (animate) { var after = Deck.lbox(bj, dp); bj.animate([{ transform: 'translateX(' + (before.x - after.x) + 'px)' }, { transform: 'none' }], { duration: 900, easing: 'cubic-bezier(.65,0,.35,1)' }); }
    }
    var el = dpJob(c.t, c.s, c.w, c.a, c.b, 'ok'); el.classList.add('is-new'); lane.appendChild(el);
    $$('.dp-job.is-new', s).forEach(function (x) { if (x !== el) x.classList.remove('is-new'); });
    if (animate) {
      var from = Deck.lbox($('.dp-add', s), dp), to = Deck.lbox(el, dp);
      el.animate([{ transform: 'translate(' + (from.x - to.x) + 'px,' + (from.y - to.y) + 'px)', opacity: 0 }, { opacity: 1, offset: .25 }, { transform: 'none', opacity: 1 }],
        { duration: 1100, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    s._calls = n + 1; dpFoot(s, n + 1);
  }
  Deck.on('dispatch', {
    init: function (s) {
      var hours = $('.dp-hours', s); hours.textContent = '';
      for (var h = 0; h <= 10; h += 2) { var i = document.createElement('i'); i.style.left = (h * 10) + '%'; i.textContent = String(8 + h).padStart(2, '0') + ':00'; hours.appendChild(i); }
      dpBase(s);
      $('.dp-add', s).addEventListener('click', function () {
        if (s._calls >= CALLS.length) { dpBase(s); dpCall(s, 0, true); return; }
        dpCall(s, s._calls, true);
      });
    },
    enter: function (ctx, s) { dpBase(s); ctx.after(1300, function () { dpCall(s, 0, true); }); },
    settle: function (s) { dpBase(s); dpCall(s, 0, false); }
  });

  /* ---------------------------------------------------------------- 7 · worksheet on the technician's phone */
  function wsPaint(s, k) {
    var chk = $$('.ws-chk li', s), ph = $$('.ws-photos i', s), log = $$('.ws-log li', s);
    chk.forEach(function (li, i) { li.classList.toggle('is-on', k > i); });
    ph.forEach(function (p, i) { p.classList.toggle('is-on', k > 6 + i * .34); });
    $('.ws-part', s).classList.toggle('is-on', k > 7);
    $('.ws-sign', s).classList.toggle('is-on', k > 8);
    $('.ws-send', s).classList.toggle('is-on', k > 9);
    var em = $('.ws-bar em', s); em.textContent = k > 9 ? 'Done' : 'In progress'; em.classList.toggle('is-done', k > 9);
    log.forEach(function (li, i) { li.classList.toggle('is-on', [0.5, 5.5, 6.5, 7.5, 8.5, 9.5][i] < k); });
  }
  Deck.on('worksheet', {
    init: function (s) { wsPaint(s, 0); },
    enter: function (ctx, s) {
      wsPaint(s, 0); var k = 0;
      ctx.after(700, function tick() { k++; wsPaint(s, k); if (k < 11) ctx.after(k === 9 ? 1700 : 620, tick); });
    },
    settle: function (s) { wsPaint(s, 11); }
  });

  /* ---------------------------------------------------------------- 8 · a contract from handover to renewal */
  function clPaint(s, t) {
    s.querySelector('.cl-today').style.setProperty('--t', t.toFixed(2));
    $$('.cl-v', s).forEach(function (v) { v.classList.toggle('is-on', +v.dataset.m <= t); });
    $$('.cl-ev', s).forEach(function (e) { e.classList.toggle('is-on', +e.dataset.m <= t + .01); });
  }
  function clLead(s, d) {
    var m = 12 - d / 30, ev = $('.cl-ev--rule', s), sg = $('.cl-ev--sign', s);
    ev.dataset.m = m; ev.style.setProperty('--m', m);
    sg.dataset.m = (m + .7).toFixed(2); sg.style.setProperty('--m', m + .7);
    $('[data-cl-rule]', s).textContent = d + ' days before the end';
    $('[data-cl-hl]', s).textContent = d + ' days out.';
  }
  Deck.on('contract', {
    init: function (s) {
      var mo = $('.cl-months', s), lane = $('.cl-lane--v', s);
      for (var m = 0; m <= 18; m += 3) { var i = document.createElement('i'); i.style.left = (m / 18 * 100) + '%'; i.textContent = m ? 'month ' + m : 'handover'; mo.appendChild(i); }
      for (var v = 1; v <= 18; v++) { var d = document.createElement('i'); d.className = 'cl-v' + (v > 12 ? ' is-paid' : ''); d.dataset.m = v; d.style.left = ((v - .5) / 18 * 100) + '%'; lane.appendChild(d); }
      $$('.cl-ev', s).forEach(function (e) { e.style.setProperty('--m', e.dataset.m); });
      s._lead = 90; clLead(s, 90); clPaint(s, 0);
      seg($('[data-cl="lead"]', s), function (v) { s._lead = +v; clLead(s, +v); if (!s._live) clPaint(s, 18); else clPaint(s, s._t || 0); });
    },
    enter: function (ctx, s) {
      s._live = true; s._t = 0; clPaint(s, 0);
      ctx.after(600, function () { ctx.tween(8200, function (e) { s._t = e * 18; clPaint(s, s._t); }, 'lin'); });
    },
    leave: function (s) { s._live = false; },
    settle: function (s) { s._t = 18; clPaint(s, 18); }
  });

  /* ---------------------------------------------------------------- 9 · renewal radar: stacked columns by status */
  var RR = {
    months: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    total: [38, 41, 33, 29, 35, 44, 31, 27, 36, 40, 30, 34],
    on: [[22, 16, 0], [9, 32, 0], [3, 30, 0]],
    off: [[11, 9, 18], [3, 6, 32], [0, 2, 31]]
  };
  function rrData(mode) {
    // per month: [renewed, quoted, due-not-contacted, not due]
    return RR.total.map(function (t, i) { var d = RR[mode][i]; return d ? [d[0], d[1], d[2], 0] : [0, 0, 0, t]; });
  }
  function rrBuild(s) {
    var svg = $('.rr-svg', s); PX.clear(svg);
    var W = 1000, H = 420, L = 46, R = 12, T = 30, B = 44, bw = (W - L - R) / 12, y = PX.lin(0, 50, H - B, T);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    PX.svg('rect', { x: L, y: T - 22, width: bw * 3, height: H - B - T + 22, rx: 10, 'class': 'rr-band' }, svg);
    PX.svg('text', { x: L + 12, y: T - 6, 'class': 'rr-bandt' }, svg).textContent = 'next 90 days';
    PX.gridY(svg, L, W - R, y, [0, 10, 20, 30, 40, 50]);
    PX.svg('line', { x1: L, x2: W - R, y1: y(0), y2: y(0), 'class': 'cx-base' }, svg);
    var cols = [], tip = s._tip;
    RR.months.forEach(function (m, i) {
      var g = PX.svg('g', {}, svg), cx = L + bw * i + bw / 2;
      var segs = [ST.good, ST.warn, ST.crit, ST.none].map(function (c) { return PX.svg('path', { fill: c }, g); });
      var lbl = PX.svg('text', { x: cx, 'text-anchor': 'middle', 'class': 'cx-lbl' }, g);
      PX.svg('text', { x: cx, y: H - B + 22, 'text-anchor': 'middle', 'class': 'cx-tick' }, svg).textContent = m + (i < 3 ? ' 2026' : i === 3 ? ' 2027' : '');
      var hit = PX.svg('rect', { x: cx - bw / 2, y: T - 22, width: bw, height: H - B - T + 22, 'class': 'cx-hit', tabindex: 0 }, g);
      function show(e) {
        var d = s._vals[i], at = e && e.clientX != null ? PX.at(e, s) : { x: Deck.lbox(hit, s).cx, y: Deck.lbox(hit, s).y + 120 };
        var rows = [{ c: ST.good, v: Math.round(d[0]), l: 'renewed' }, { c: ST.warn, v: Math.round(d[1]), l: 'quotation sent' }, { c: ST.crit, v: Math.round(d[2]), l: 'due, not contacted' }, { c: ST.none, v: Math.round(d[3]), l: 'not due yet' }]
          .filter(function (r) { return r.v > 0; });
        tip.show(m + ' · ' + RR.total[i] + ' contracts', rows, at.x, at.y);
      }
      hit.addEventListener('pointermove', show); hit.addEventListener('focus', function () { show(null); });
      hit.addEventListener('pointerleave', function () { tip.hide(); }); hit.addEventListener('blur', function () { tip.hide(); });
      cols.push({ segs: segs, lbl: lbl, cx: cx });
    });
    s._rr = { cols: cols, y: y, bw: bw };
  }
  function rrPaint(s, vals) {
    s._vals = vals;
    var R = s._rr, w = 24, gap = 2;
    R.cols.forEach(function (c, i) {
      var d = vals[i], base = R.y(0), top = -1;
      for (var j = 3; j >= 0; j--) if (d[j] > .2) { top = j; break; }
      var yv = base;
      [0, 1, 2, 3].forEach(function (j) {
        var h = base - R.y(d[j]), y0 = yv - h, isTop = j === top;
        var hh = Math.max(0, h - (j < top ? gap : 0));
        c.segs[j].setAttribute('d', hh > .5 ? (isTop ? PX.col(c.cx - w / 2, y0, w, hh) : PX.rect(c.cx - w / 2, y0 + (j < top ? gap : 0), w, hh)) : 'M0,0');
        yv = y0;
      });
      c.lbl.setAttribute('y', (yv - 8).toFixed(1)); c.lbl.textContent = RR.total[i];
    });
    var due = 0, ok = 0, bad = 0;
    vals.slice(0, 3).forEach(function (d) { due += d[0] + d[1] + d[2]; ok += d[0] + d[1]; bad += d[2]; });
    $('[data-rr="due"]', s).textContent = Math.round(due);
    $('[data-rr="ok"]', s).textContent = Math.round(ok);
    $('[data-rr="bad"]', s).textContent = Math.round(bad);
    $('[data-rr="okd"]', s).textContent = bad < .5 ? 'every one of them' : 'the rest wait on a person';
    $('[data-rr="badd"]', s).textContent = bad < .5 ? 'nothing waiting on a person' : 'to chase by phone, by hand';
    $('.rr-tile--crit', s).classList.toggle('is-bad', bad >= .5);
  }
  function rrMode(ctx, s, mode) {
    var from = (s._vals || rrData('off')).map(function (d) { return d.slice(); }), to = rrData(mode);
    if (!ctx) { rrPaint(s, to); return; }
    ctx.tween(900, function (e) { rrPaint(s, to.map(function (d, i) { return d.map(function (v, j) { return PX.lerp(from[i][j], v, e); }); })); }, 'io');
  }
  Deck.on('radar', {
    init: function (s) {
      s._tip = PX.tip(s); rrBuild(s); rrPaint(s, rrData('on'));
      s._setMode = seg($('[data-rr="mode"]', s), function (v) { rrMode(s._ctx, s, v); });
    },
    enter: function (ctx, s) {
      s._ctx = ctx; s._setMode('off', true); rrPaint(s, rrData('off'));
      ctx.after(1700, function () { s._setMode('on'); });
    },
    leave: function (s) { s._ctx = null; s._tip.hide(); },
    settle: function (s) { s._setMode('on', true); rrPaint(s, rrData('on')); }
  });

  /* ---------------------------------------------------------------- 10 · parts: branch stock, a transfer, a reordering rule */
  var PARTS = ['Door rollers', 'Brake linings', 'Handrails', 'Control boards'];
  var WH = { mk: [9, 6, 2, 3], cb: [4, 0, 1, 1], cd: [3, 2, 0, 1] };
  function skWh(s, q) {
    ['mk', 'cb', 'cd'].forEach(function (k) {
      var ul = $('[data-wh="' + k + '"] ul', s);
      if (!ul.children.length) PARTS.forEach(function () { var li = document.createElement('li'); li.innerHTML = '<b></b><i></i>'; ul.appendChild(li); });
      $$('li', ul).forEach(function (li, j) { $('b', li).textContent = q[k][j]; li.style.setProperty('--q', q[k][j]); li.classList.toggle('is-low', q[k][j] === 0); });
    });
  }
  // 26 weeks of door roller kits: with a reordering rule (reorder at 8, up to 14, 3-week lead time) or ordered only when out
  function skSim(rule) {
    var use = [1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1], lead = 3, st = 12, pipe = [], out = [], arrivals = [], orders = 0, rush = 0, weeksOut = 0;
    for (var w = 0; w < 26; w++) {
      pipe = pipe.filter(function (o) { if (o.at === w) { st += o.q; arrivals.push(w); return false; } return true; });
      st = Math.max(0, st - use[w]);
      var onOrder = pipe.reduce(function (a, o) { return a + o.q; }, 0);
      if (rule && st + onOrder <= 8) { pipe.push({ at: w + lead, q: 14 - st - onOrder }); orders++; }
      if (!rule && st === 0 && !pipe.length) { pipe.push({ at: w + lead + 1, q: 12 }); rush++; }
      if (st === 0) weeksOut++;
      out.push(st);
    }
    return { v: out, arrivals: arrivals, orders: orders, rush: rush, weeksOut: weeksOut };
  }
  function skChart(s) {
    var svg = $('.sk-svg', s); PX.clear(svg);
    var W = 700, H = 330, L = 40, R = 64, T = 14, B = 34, x = PX.lin(0, 25, L, W - R), y = PX.lin(0, 16, H - B, T);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    PX.gridY(svg, L, W - R, y, [0, 4, 8, 12, 16]);
    var gOut = PX.svg('g', {}, svg);
    [8, 14].forEach(function (v, i) {
      PX.svg('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), 'class': 'cx-ref' }, svg);
      PX.svg('text', { x: W - R + 8, y: y(v) + 4, 'class': 'cx-reft' }, svg).textContent = i ? 'up to 14' : 'reorder 8';
    });
    PX.svg('line', { x1: L, x2: W - R, y1: y(0), y2: y(0), 'class': 'cx-base' }, svg);
    [0, 5, 10, 15, 20, 25].forEach(function (w) { PX.svg('text', { x: x(w), y: H - B + 20, 'text-anchor': 'middle', 'class': 'cx-tick' }, svg).textContent = 'wk ' + (w + 1); });
    var area = PX.svg('path', { 'class': 'sk-area' }, svg), line = PX.svg('path', { 'class': 'sk-line' }, svg), gM = PX.svg('g', {}, svg);
    var cross = PX.svg('line', { y1: T, y2: H - B, 'class': 'cx-cross' }, svg), dot = PX.svg('circle', { r: 5, 'class': 'sk-mark', style: 'opacity:0' }, svg);
    var hit = PX.svg('rect', { x: L, y: T, width: W - R - L, height: H - B - T, 'class': 'cx-hit' }, svg);
    s._sk = { x: x, y: y, area: area, line: line, gOut: gOut, gM: gM, H: H, B: B, T: T };
    hit.addEventListener('pointermove', function (e) {
      var p = PX.at(e, s), lx = PX.svgAt(e, svg).x, w = clamp(Math.round((lx - L) / (W - R - L) * 25), 0, 25), v = s._skv[w];
      cross.setAttribute('x1', x(w)); cross.setAttribute('x2', x(w)); cross.classList.add('is-on');
      dot.setAttribute('cx', x(w)); dot.setAttribute('cy', y(v)); dot.style.opacity = 1;
      s._tip.show('Week ' + (w + 1), [{ c: '#3167CA', v: Math.round(v) + ' kits', l: 'in stock' }].concat(v < .5 ? [{ c: ST.crit, v: 'Out', l: 'of stock' }] : []), p.x, p.y);
    });
    hit.addEventListener('pointerleave', function () { cross.classList.remove('is-on'); dot.style.opacity = 0; s._tip.hide(); });
  }
  function skPaint(s, vals, sim) {
    var K = s._sk, pts = vals.map(function (v, i) { return [K.x(i), K.y(v)]; });
    s._skv = vals;
    K.line.setAttribute('d', PX.line(pts)); K.area.setAttribute('d', PX.area(pts, K.y(0)));
    PX.clear(K.gOut); PX.clear(K.gM);
    vals.forEach(function (v, i) { if (v < .5) PX.svg('rect', { x: K.x(i) - 12, y: K.T, width: 24, height: K.H - K.B - K.T, 'class': 'sk-out' }, K.gOut); });
    if (sim) sim.arrivals.forEach(function (w) { PX.svg('circle', { cx: K.x(w), cy: K.y(vals[w]), r: 5, 'class': 'sk-mark' }, K.gM); });
  }
  function skMode(ctx, s, rule) {
    var sim = skSim(rule), from = (s._skv || sim.v).slice();
    $('[data-sk="out"]', s).textContent = sim.weeksOut;
    $('[data-sk="rush"]', s).textContent = sim.rush;
    $('[data-sk="po"]', s).textContent = sim.orders;
    if (!ctx) { skPaint(s, sim.v, sim); return; }
    ctx.tween(800, function (e) { skPaint(s, sim.v.map(function (v, i) { return PX.lerp(from[i], v, e); }), e >= 1 ? sim : null); }, 'io');
  }
  function skStep(s, k) {
    var q = { mk: WH.mk.slice(), cb: WH.cb.slice(), cd: WH.cd.slice() }, v = $('[data-sk="verdict"]', s);
    if (k >= 4) { q.mk[1] -= 2; q.cb[1] += 2; }
    skWh(s, q);
    $('[data-wh="cb"]', s).classList.toggle('is-need', k >= 1 && k < 4);
    $$('.sk-wh li', s).forEach(function (li) { li.classList.remove('is-hot'); });
    if (k >= 1 && k < 4) $$('[data-wh="cb"] li', s)[1].classList.add('is-hot');
    if (k >= 2 && k < 4) $$('[data-wh="mk"] li', s)[1].classList.add('is-hot');
    v.className = k >= 4 ? 'is-ok' : k >= 1 ? 'is-bad' : '';
    v.textContent = k >= 4 ? 'Transfer 2 from Makati' : k >= 2 ? 'Makati has 6' : k >= 1 ? 'Cebu: none in stock' : 'checking stock…';
    $('.sk-say', s).classList.toggle('is-on', k >= 4);
  }
  Deck.on('parts', {
    init: function (s) {
      var hd = document.createElement('div'); hd.className = 'sk-hd'; hd.innerHTML = '<span></span>' + PARTS.map(function (p) { return '<span>' + p + '</span>'; }).join('');
      $('.sk-whs', s).insertBefore(hd, $('.sk-whs', s).firstChild);
      s._tip = PX.tip(s); skChart(s); skStep(s, 4); skMode(null, s, true);
      s._setMode = seg($('[data-sk="mode"]', s), function (v) { skMode(s._ctx, s, v === 'on'); });
    },
    enter: function (ctx, s) {
      s._ctx = ctx; skStep(s, 0); s._setMode('on', true); skMode(null, s, true);
      var line = s._sk.line, L = line.getTotalLength();
      line.style.transition = 'none'; line.style.strokeDasharray = L; line.style.strokeDashoffset = L;
      ctx.after(300, function () { line.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.65,0,.35,1)'; line.style.strokeDashoffset = 0; });
      ctx.after(2000, function () { line.style.strokeDasharray = 'none'; });
      ctx.after(900, function () { skStep(s, 1); });
      ctx.after(1900, function () { skStep(s, 2); });
      ctx.after(2700, function () {
        var mv = $('.sk-move', s), left = $('.sk-left', s), a = Deck.lbox($$('[data-wh="mk"] li', s)[1], left), b = Deck.lbox($$('[data-wh="cb"] li', s)[1], left);
        mv.style.opacity = 1;
        ctx.tween(1200, function (e) { mv.style.transform = 'translate(' + PX.lerp(a.x, b.x, e).toFixed(1) + 'px,' + PX.lerp(a.y - 30, b.y - 30, e).toFixed(1) + 'px)'; }, 'io')
          .then(function () { mv.style.opacity = 0; skStep(s, 4); });
      });
    },
    leave: function (s) { s._ctx = null; s._tip.hide(); $('.sk-move', s).style.opacity = 0; },
    settle: function (s) { var l = s._sk.line; l.style.transition = 'none'; l.style.strokeDasharray = 'none'; l.style.strokeDashoffset = 0; s._setMode('on', true); skMode(null, s, true); skStep(s, 4); }
  });

  /* ---------------------------------------------------------------- 11 · installation projects, station by station */
  var PJ = [
    { g: 'CP01', who: 'Taisei-DMCI JV', units: '13 elevators, 26 escalators', st: [['Valenzuela', 0], ['Meycauayan', .5], ['Marilao', 1], ['Bocaue', 1.5]] },
    { g: 'CP02', who: 'Sumitomo Mitsui Construction', units: '8 elevators, 20 escalators', st: [['Balagtas', 2], ['Guiguinto', 2.5], ['Malolos', 3]] }
  ];
  var PH = [[0, 1, 'ph1'], [1, 3, 'ph2'], [3, 4, 'ph3'], [4, 4.5, 'ph4']];
  function pjPick(s, r) {
    $$('.pj-r', s).forEach(function (x) { x.classList.toggle('is-on', x === r); });
    if (!r) return;
    $('[data-pj="pk"]', s).textContent = r.dataset.g + ' · ' + r.dataset.who;
    $('[data-pj="stn"]', s).textContent = r.dataset.n + ' station';
    $('[data-pj="txt"]', s).textContent = 'One project stage with its delivery, installation, testing and handover tasks, and the drawings, test certificates and handover forms in Documents.';
  }
  function pjProgress(s, e) {
    // e: 0..1 through the build-up; the units count follows the handovers
    var rows = $$('.pj-r', s), done = 0;
    rows.forEach(function (r, i) {
      $$('.pj-t i', r).forEach(function (seg, j) {
        var a = (i * .07) + j * .11, k = clamp((e - a) / .16, 0, 1);
        seg.style.setProperty('--k', k.toFixed(3));
      });
    });
    done = Math.round(67 * clamp((e - .5) / .5, 0, 1));
    ['done', 'eq', 'ct'].forEach(function (k) { $('[data-pj="' + k + '"]', s).textContent = done; });
  }
  Deck.on('projects', {
    init: function (s) {
      var box = $('.pj-rows', s);
      PJ.forEach(function (p) {
        var h = document.createElement('div'); h.className = 'pj-g'; h.textContent = p.g + ' · ' + p.who + ' '; var sm = document.createElement('small'); sm.textContent = p.units; h.appendChild(sm); box.appendChild(h);
        p.st.forEach(function (st) {
          var r = document.createElement('div'); r.className = 'pj-r'; r.tabIndex = 0; r.dataset.n = st[0]; r.dataset.g = p.g; r.dataset.who = p.who;
          r.innerHTML = '<b></b><span class="pj-t"></span>'; $('b', r).textContent = st[0];
          PH.forEach(function (ph) { var i = document.createElement('i'); i.className = ph[2]; i.style.setProperty('--a', st[1] + ph[0]); i.style.setProperty('--b', st[1] + ph[1]); $('.pj-t', r).appendChild(i); });
          box.appendChild(r);
        });
      });
      box.addEventListener('pointerover', function (e) { var r = e.target.closest('.pj-r'); if (r) pjPick(s, r); });
      box.addEventListener('focusin', function (e) { var r = e.target.closest('.pj-r'); if (r) pjPick(s, r); });
      box.addEventListener('click', function (e) { var r = e.target.closest('.pj-r'); if (r) pjPick(s, r); });
      pjProgress(s, 1); pjPick(s, $('.pj-r', s));
    },
    enter: function (ctx, s) { pjProgress(s, 0); pjPick(s, $('.pj-r', s)); ctx.after(500, function () { ctx.tween(4200, function (e) { pjProgress(s, e); }, 'lin'); }); },
    settle: function (s) { pjProgress(s, 1); pjPick(s, $('.pj-r', s)); }
  });

  /* ---------------------------------------------------------------- 12 · dashboard */
  var DB = {
    all: { sla: 96.4, calls: 612, resp: 24, ftf: 87, open: 14, mix: '3 P1 · 5 P2 · 6 P3' },
    mk: { sla: 97.1, calls: 348, resp: 22, ftf: 89, open: 7, mix: '1 P1 · 3 P2 · 3 P3' },
    cb: { sla: 95.8, calls: 168, resp: 25, ftf: 86, open: 4, mix: '1 P1 · 1 P2 · 2 P3' },
    cd: { sla: 94.9, calls: 96, resp: 28, ftf: 83, open: 3, mix: '1 P1 · 1 P2 · 1 P3' }
  };
  var WK = { mk: [25, 28, 26, 31, 27, 24, 29, 30, 26, 28, 25, 29], cb: [12, 14, 11, 15, 13, 12, 14, 13, 12, 15, 13, 12], cd: [7, 8, 6, 8, 7, 9, 7, 6, 8, 7, 8, 7] };
  function dbBuild(s) {
    var bars = $('.db-bars', s), line = $('.db-line', s); PX.clear(bars); PX.clear(line);
    // bars: median minutes to site by branch, target 30
    var W = 600, H = 250, L = 130, R = 60, x = PX.lin(0, 40, L, W - R);
    bars.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var gg = PX.svg('g', { 'class': 'cx-grid' }, bars);
    [0, 10, 20, 30, 40].forEach(function (v) { PX.svg('line', { x1: x(v), x2: x(v), y1: 16, y2: H - 34 }, gg); PX.svg('text', { x: x(v), y: H - 12, 'text-anchor': 'middle', 'class': 'cx-tick' }, bars).textContent = v; });
    s._bars = {};
    ['mk', 'cb', 'cd'].forEach(function (k, i) {
      var cy = 44 + i * 64;
      PX.svg('text', { x: L - 14, y: cy + 5, 'text-anchor': 'end', 'class': 'db-name' }, bars).textContent = BN[k];
      var p = PX.svg('path', { fill: BC[k], 'class': 'db-bar' }, bars), t = PX.svg('text', { y: cy + 5, 'class': 'cx-lbl db-bar' }, bars);
      s._bars[k] = { p: p, t: t, cy: cy };
    });
    PX.svg('line', { x1: x(30), x2: x(30), y1: 10, y2: H - 34, 'class': 'cx-ref' }, bars);
    PX.svg('text', { x: x(30) + 6, y: 20, 'class': 'cx-reft' }, bars).textContent = 'target 30';
    s._bx = x;
    // line: calls per week, one line per branch
    var W2 = 600, H2 = 226, L2 = 36, R2 = 14, T2 = 10, B2 = 30, x2 = PX.lin(0, 11, L2, W2 - R2), y2 = PX.lin(0, 40, H2 - B2, T2);
    line.setAttribute('viewBox', '0 0 ' + W2 + ' ' + H2);
    PX.gridY(line, L2, W2 - R2, y2, [0, 10, 20, 30, 40]);
    PX.svg('line', { x1: L2, x2: W2 - R2, y1: y2(0), y2: y2(0), 'class': 'cx-base' }, line);
    [0, 3, 6, 9, 11].forEach(function (w) { PX.svg('text', { x: x2(w), y: H2 - 8, 'text-anchor': 'middle', 'class': 'cx-tick' }, line).textContent = 'wk ' + (w + 1); });
    s._lines = {};
    ['mk', 'cb', 'cd'].forEach(function (k) {
      var pts = WK[k].map(function (v, i) { return [x2(i), y2(v)]; });
      var p = PX.svg('path', { d: PX.line(pts), stroke: BC[k], 'class': 'db-ln' }, line), L0 = p.getTotalLength();
      p.style.strokeDasharray = L0; p._L = L0;
      var d = PX.svg('circle', { cx: pts[11][0], cy: pts[11][1], r: 4.5, fill: BC[k], 'class': 'db-end' }, line);
      s._lines[k] = { p: p, d: d };
    });
    var cross = PX.svg('line', { y1: T2, y2: H2 - B2, 'class': 'cx-cross' }, line);
    var hit = PX.svg('rect', { x: L2, y: T2, width: W2 - R2 - L2, height: H2 - B2 - T2, 'class': 'cx-hit' }, line);
    hit.addEventListener('pointermove', function (e) {
      var p = PX.at(e, s), lx = PX.svgAt(e, line).x, w = clamp(Math.round((lx - L2) / (W2 - R2 - L2) * 11), 0, 11);
      cross.setAttribute('x1', x2(w)); cross.setAttribute('x2', x2(w)); cross.classList.add('is-on');
      s._tip.show('Week ' + (w + 1), ['mk', 'cb', 'cd'].map(function (k) { return { c: BC[k], v: WK[k][w], l: BN[k] }; }), p.x, p.y);
    });
    hit.addEventListener('pointerleave', function () { cross.classList.remove('is-on'); s._tip.hide(); });
  }
  function dbPaint(s, br, e) {
    // e: 0..1 bar growth
    var x = s._bx;
    ['mk', 'cb', 'cd'].forEach(function (k) {
      var b = s._bars[k], v = DB[k].resp * e;
      b.p.setAttribute('d', PX.hbar(x(0), b.cy - 11, x(v) - x(0), 22));
      b.t.setAttribute('x', (x(v) + 8).toFixed(1)); b.t.textContent = Math.round(v) + ' min';
      var dim = br !== 'all' && br !== k;
      b.p.classList.toggle('db-dim', dim); b.t.classList.toggle('db-dim', dim);
      var l = s._lines[k]; l.p.classList.toggle('db-dim', dim); l.d.classList.toggle('db-dim', dim);
    });
    var D = DB[br];
    $('[data-db="sla"]', s).textContent = D.sla.toFixed(1) + '%';
    $('[data-db="slad"]', s).textContent = 'of ' + D.calls + ' calls, last 90 days';
    $('[data-db="resp"]', s).textContent = D.resp + ' min';
    $('[data-db="ftf"]', s).textContent = D.ftf + '%';
    $('[data-db="open"]', s).textContent = D.open;
    $('[data-db="opend"]', s).textContent = D.mix;
  }
  Deck.on('dashboard', {
    init: function (s) {
      s._tip = PX.tip(s); dbBuild(s); s._br = 'all'; dbPaint(s, 'all', 1);
      Object.keys(s._lines).forEach(function (k) { s._lines[k].p.style.strokeDashoffset = 0; });
      seg($('[data-db="br"]', s), function (v) { s._br = v; dbPaint(s, v, 1); });
    },
    enter: function (ctx, s) {
      dbPaint(s, s._br, 0);
      Object.keys(s._lines).forEach(function (k, i) { var p = s._lines[k].p; p.style.transition = 'none'; p.style.strokeDashoffset = p._L; });
      ctx.after(500, function () { ctx.tween(1100, function (e) { dbPaint(s, s._br, e); }, 'out'); });
      ctx.after(700, function () { Object.keys(s._lines).forEach(function (k, i) { var p = s._lines[k].p; p.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.65,0,.35,1) ' + (i * .15) + 's'; p.style.strokeDashoffset = 0; }); });
      $$('.db-tile b', s).forEach(function (b, i) {
        var txt = b.textContent, m = /^([\d.]+)(.*)$/.exec(txt); if (!m) return;
        var to = +m[1], dec = m[1].indexOf('.') >= 0 ? 1 : 0;
        ctx.after(300 + i * 90, function () { ctx.count(b, to, { dec: dec, suf: m[2], dur: 1100 }); });
      });
    },
    leave: function (s) { s._tip.hide(); },
    settle: function (s) { dbPaint(s, s._br, 1); Object.keys(s._lines).forEach(function (k) { var p = s._lines[k].p; p.style.transition = 'none'; p.style.strokeDashoffset = 0; }); }
  });

  /* ---------------------------------------------------------------- 13 · scope by phase */
  Deck.on('scope', {
    init: function (s) {
      var sp = $('.sp', s);
      s._set = seg($('[data-sp="ph"]', s), function (v) { sp.dataset.on = v; s._user = true; });
    },
    enter: function (ctx, s) {
      var sp = $('.sp', s), k = 1; s._user = false; sp.dataset.on = '1'; s._set('1', true);
      ctx.every(3200, function () { if (s._user) return; k = k % 3 + 1; sp.dataset.on = String(k); s._set(String(k), true); });
    },
    settle: function (s) { delete $('.sp', s).dataset.on; $$('[data-sp="ph"] button', s).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); }
  });

  /* ---------------------------------------------------------------- 14 · roadmap */
  function rmPaint(s, w) {
    $('.rm-plan', s).style.setProperty('--w', w.toFixed(2));
    $$('.rm-r', s).forEach(function (r) {
      var a = +r.dataset.a, b = +r.dataset.b, k = clamp((w - a) / (b - a), 0, 1), i = $('i', r);
      i.style.setProperty('--k', k.toFixed(3)); i.style.setProperty('--o', k > 0 ? 1 : 0);
    });
    [['mk', 10], ['cb', 14], ['cd', 17]].forEach(function (p) {
      var live = w >= p[1];
      $('.rm-pin[data-k="' + p[0] + '"]', s).classList.toggle('is-live', live);
      $('.rm-lbl[data-k="' + p[0] + '"]', s).classList.toggle('is-live', live);
    });
  }
  Deck.on('roadmap', {
    init: function (s) {
      var wk = $('.rm-weeks', s);
      for (var w = 0; w <= 22; w += 2) { var i = document.createElement('i'); i.style.left = (w / 22 * 100) + '%'; i.textContent = w ? 'wk ' + w : 'start'; wk.appendChild(i); }
      $$('.rm-r', s).forEach(function (r) { var i = $('i', r); i.style.setProperty('--a', r.dataset.a); i.style.setProperty('--b', r.dataset.b); });
      rmPaint(s, 22);
    },
    enter: function (ctx, s) { rmPaint(s, 0); ctx.after(500, function () { ctx.tween(7600, function (e) { rmPaint(s, e * 22); }, 'lin'); }); },
    settle: function (s) { rmPaint(s, 22); }
  });

  /* ---------------------------------------------------------------- 15 · questions: one open at a time */
  Deck.on('questions', {
    init: function (s) {
      var qs = $$('.qs-q', s);
      qs.forEach(function (d) {
        $('summary', d).tabIndex = 0;
        d.addEventListener('toggle', function () { if (d.open && !s._all) qs.forEach(function (o) { if (o !== d) o.open = false; }); });
      });
    },
    enter: function (ctx, s) { s._all = false; $$('.qs-q', s).forEach(function (d, i) { d.open = i === 0; }); },
    settle: function (s) { s._all = true; $$('.qs-q', s).forEach(function (d) { d.open = true; }); }
  });
})();

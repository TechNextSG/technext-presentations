/* Industry case study · Construction. Slide behaviour. Lattwell Fit-Out is a sample company and every figure is sample
   data, labelled on its slide. Every slide whose finished state comes from JS has a settle hook (overview, print, PDF). */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  function k0(n) { return 'S$' + Math.round(n).toLocaleString('en-SG'); }
  function k2(n) { return 'S$' + n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pct(x) { return (x * 100).toFixed(1).replace('-', '−') + '%'; }
  function swap(el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }
  function pickText(spec, n) {
    var out = '';
    spec.split('|').forEach(function (part) { var i = part.indexOf(':'), k = +part.slice(0, i); if (k <= n) out = part.slice(i + 1); });
    return out;
  }
  function seg(root, fn) {
    function set(v, quiet) {
      $$('button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      if (!quiet) fn(v);
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    return set;
  }

  // jump links: data-go="slide id"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.stopPropagation(); Deck.goId(b.dataset.go, 0);
  });

  /* ---------------------------------------------------------------- 2 · the wall: monthly report vs final account */
  Deck.on('client', {
    init: function (s) {
      s._set = seg($('.cst-cl-seg', s), function (v) {
        var fin = v === 'fin', sum = 0, loss = 0, tiles = $$('.cst-t', s);
        $('.cst-tiles', s).dataset.mode = v;
        tiles.forEach(function (t) {
          var m = +(fin ? t.dataset.f : t.dataset.r);
          sum += m; if (m < 0) loss++;
          $('strong', t).textContent = String(m).replace('-', '−') + '%';
          t.classList.toggle('is-neg', m < 0); t.classList.toggle('is-mid', m >= 0 && m < 10);
        });
        $('.cst-avg', s).textContent = (sum / tiles.length).toFixed(1) + '%';
        $('.cst-loss', s).textContent = loss;
        $('.cst-wall-f', s).classList.toggle('is-fin', fin);
        $('.cst-wall-say', s).textContent = fin ? 'The same jobs at the final account, after handover' : 'Margin as the monthly report showed it, half-way through';
      });
    },
    enter: function (ctx, s) { s._set('rep'); },
    settle: function (s) { s._set('fin'); }
  });

  /* ---------------------------------------------------------------- 3 · the S-curve, month by month */
  var CONTRACT = 1860000, BUDGET = 1580000, REP = 0.97,
      PCT = [0, .04, .10, .20, .34, .50, .66, .80, .92, 1],
      HID = { vo: [0, 0, 0, 2, 6, 14, 30, 56, 92, 138], wr: [0, 0, 2, 5, 10, 18, 30, 46, 68, 92], lt: [0, 0, 4, 10, 18, 30, 48, 72, 104, 146] },
      PHASE = ['contract signed', 'mobilisation', 'partitions start', 'M&E first fix', 'ceilings', 'half-way', 'M&E second fix', 'finishes', 'testing', 'handover · final account'];
  var X0 = 80, X1 = 880, Y0 = 420, YMAX = 2000000;
  function cx(m) { return X0 + m * (X1 - X0) / 9; }
  function cy(v) { return Y0 - v / YMAX * 400; }
  function lerpArr(a, t) { var i = Math.floor(t), f = t - i; return i >= 9 ? a[9] : a[i] + (a[i + 1] - a[i]) * f; }
  function rep(t) { return lerpArr(PCT, t) * BUDGET * REP; }
  function hidden(s, t) { var h = 0; Object.keys(HID).forEach(function (k) { if (s._on[k]) h += lerpArr(HID[k], t) * 1000; }); return h; }
  function curve(s, t) {
    var svg = $('.cst-svg', s), n = Math.max(t, 0), pts = [], ptsR = [], m;
    for (m = 0; m <= Math.floor(n); m++) pts.push(m);
    if (n % 1) pts.push(n);
    var a = pts.map(function (m) { return [cx(m), cy(rep(m))]; }), b = pts.map(function (m) { return [cx(m), cy(rep(m) + hidden(s, m))]; });
    function d(p) { return p.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }
    $('.cst-l-rp', svg).setAttribute('d', d(a));
    $('.cst-l-rl', svg).setAttribute('d', d(b));
    $('.cst-gap', svg).setAttribute('d', a.length > 1 ? d(b) + ' ' + d(a.slice().reverse()).replace('M', 'L') + ' Z' : '');
    var la = a[a.length - 1], lb = b[b.length - 1];
    $('.cst-d-rp', svg).setAttribute('cx', la[0]); $('.cst-d-rp', svg).setAttribute('cy', la[1]);
    $('.cst-d-rl', svg).setAttribute('cx', lb[0]); $('.cst-d-rl', svg).setAttribute('cy', lb[1]);
  }
  function readout(s, n) {
    var rev = CONTRACT * PCT[n], r = rep(n), h = hidden(s, n), any = s._on.vo || s._on.wr || s._on.lt;
    $('.cst-mo-n', s).textContent = n; $('.cst-mo-p', s).textContent = '· ' + PHASE[n];
    var mr = n ? 1 - r / rev : 1 - BUDGET * REP / CONTRACT, mt = n ? 1 - (r + h) / rev : mr;
    $('.cst-mg-r', s).textContent = pct(mr);
    $('.cst-mg-t', s).textContent = pct(mt);
    $('.cst-mg .is-real', s).classList.toggle('is-bad', mt < mr - 0.005);
    $('.cst-ret-v', s).textContent = k0(rev * 0.05);
    $$('.cst-tg-v', s).forEach(function (e) { e.textContent = k0(HID[e.dataset.k][n] * 1000); });
    $('.cst-chart', s).classList.toggle('is-same', !any);
    $$('.cst-xl text', s).forEach(function (tx, i) { tx.classList.toggle('is-on', i === n); });
  }
  function paintCurve(s, n, ctx) {
    var from = s._t || 0;
    readout(s, n);
    if (ctx && !Deck.reduce && n !== from) {
      ctx.tween(500, function (p) { s._t = from + (n - from) * p; curve(s, s._t); }, 'out');
    } else { s._t = n; curve(s, n); }
    s._n = n;
  }
  function setTg(s, on) {
    $$('.cst-tg button', s).forEach(function (b) { s._on[b.dataset.k] = !!on[b.dataset.k]; b.setAttribute('aria-pressed', s._on[b.dataset.k] ? 'true' : 'false'); });
    curve(s, s._t || 0); readout(s, s._n || 0);
  }
  Deck.on('curve', {
    init: function (s) {
      var svg = $('.cst-svg', s), g = $('.cst-grid', svg), xl = $('.cst-xl', svg);
      [0, 500000, 1000000, 1500000, 2000000].forEach(function (v) {
        FXsvg('line', { x1: X0, x2: X1, y1: cy(v), y2: cy(v) }, g);
        FXsvg('text', { x: X0 - 12, y: cy(v) + 4, 'text-anchor': 'end' }, g).textContent = v ? 'S$' + (v / 1e6).toFixed(1) + 'M' : 'S$0';
      });
      for (var m = 0; m <= 9; m++) FXsvg('text', { x: cx(m), y: Y0 + 24, 'text-anchor': 'middle' }, xl).textContent = m ? 'M' + m : 'Start';
      $('.cst-l-ct', svg).setAttribute('d', 'M' + X0 + ',' + cy(CONTRACT) + ' L' + X1 + ',' + cy(CONTRACT));
      var ct = $('.cst-t-ct', svg); ct.setAttribute('y', cy(CONTRACT) - 10); ct.setAttribute('x', X0 + 8); ct.setAttribute('text-anchor', 'start');
      $('.cst-l-bd', svg).setAttribute('d', PCT.map(function (p, i) { return (i ? 'L' : 'M') + cx(i).toFixed(1) + ',' + cy(p * BUDGET).toFixed(1); }).join(' '));
      s._on = { vo: false, wr: false, lt: false };
      $('.cst-tg', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]'); if (!b) return;
        s._held = true;
        var on = { vo: s._on.vo, wr: s._on.wr, lt: s._on.lt }; on[b.dataset.k] = !on[b.dataset.k]; setTg(s, on);
      });
    },
    enter: function (ctx, s) { s._t = 0; s._n = 0; s._held = false; setTg(s, {}); },
    step: function (n, ctx, s, first) {
      paintCurve(s, n, first ? null : ctx);
      // handover: the final account switches everything on, unless the presenter already chose
      if (n === 9 && !s._held) ctx.after(first ? 300 : 900, function () { if (!s._held) setTg(s, { vo: 1, wr: 1, lt: 1 }); });
    },
    settle: function (s) { s._n = 9; s._t = 9; setTg(s, { vo: 1, wr: 1, lt: 1 }); paintCurve(s, 9, null); }
  });
  function FXsvg(tag, attrs, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    parent.appendChild(el); return el;
  }

  /* ---------------------------------------------------------------- 4 · one month, three clocks */
  var EV = {
    3: [1, 'site', 'VO agreed on WhatsApp'],
    9: [2, 'site', '12 boards go to P05'],
    12: [3, 'sub', 'Sub bills last month'],
    22: [4, 'claim', 'QS rings: “how far?”'],
    25: [5, 'claim', 'Claim 06 from Excel'],
    30: [6, 'claim', 'Report says 17.6%']
  };
  var STORY = [
    ['Nobody is careless. The facts arrive at different times.', 'Watch who knows what, and when the claim is cut.'],
    ['Day 3 · a decision on site', 'On the site walk the client’s PM asks for 14 extra power points. The supervisor agrees on WhatsApp. No price, no signature, nothing in the office.'],
    ['Day 9 · materials walk', 'Twelve gypsum boards go to P05 down the road, which ran short. The delivery order stays booked to P02.'],
    ['Day 12 · the subcontractor clock', 'The electrician invoices last month’s work. The air-conditioning sub has not invoiced since March: S$58,000 of work done, nowhere in the books.'],
    ['Day 22 · percent complete', 'The QS needs progress for the claim and rings the supervisor: “ceiling about 70%?” It goes straight into Excel.'],
    ['Day 25 · the claim clock', 'Claim 06 is cut on the 25th, built from phone calls. The three variations agreed on site are not in it: nobody priced them.'],
    ['Day 30 · month-end', 'The cost report closes on the costs that arrived. It says 17.6%, the same as last month. Everyone moves on.']
  ];
  function paintClocks(s, n) {
    $$('.cst-ev', s).forEach(function (e) { var k = +e.dataset.k; e.classList.toggle('is-on', k <= n); e.parentNode.classList.toggle('is-now', k === n); });
    $$('.cst-claim li', s).forEach(function (li) { li.classList.toggle('is-on', +li.dataset.k <= n); });
    $('.cst-st-t', s).textContent = STORY[n][0]; $('.cst-st-d', s).textContent = STORY[n][1];
    $('.cst-st-n', s).textContent = n ? 'Event ' + n + ' of 6' : 'Press → to play the month';
    swap($('.cst-story', s));
  }
  Deck.on('clocks', {
    init: function (s) {
      var box = $('.cst-days', s), html = '';
      for (var i = 0; i < 35; i++) {
        var d = i + 1, wd = i % 7, cls = 'cst-d' + (d > 30 ? ' is-x' : wd === 6 ? ' is-we' : ''), ev = EV[d];
        if (d <= 30 && wd < 6 && !ev) cls += ' is-work';
        html += '<div class="' + cls + '">' + (d <= 30 ? '<i>' + d + '</i>' : '') +
          (ev ? '<span class="cst-ev is-' + ev[1] + '" data-k="' + ev[0] + '">' + ev[2] + '</span>' : '') + '</div>';
      }
      box.innerHTML = html;
    },
    step: function (n, ctx, s) { paintClocks(s, n); },
    settle: function (s) { paintClocks(s, 6); }
  });

  /* ---------------------------------------------------------------- 5 · apps switch the margin on */
  var ORDER = ['sale', 'vo', 'pur', 'mat', 'ts'],
      ROWS = { sale: [1488000, 0, 'r'], vo: [36000, 148000, 'r'], pur: [708000, 104000, 'c'], mat: [364000, 0, 'c'], ts: [226000, 0, 'c'] },
      NAMES = { sale: 'Sales', vo: 'variations', pur: 'Purchase', mat: 'analytic bills', ts: 'Timesheets' };
  function paintApps(s, last) {
    var rev = 0, cost = 0, miss = [];
    ORDER.forEach(function (k) {
      var on = !!s._on[k], row = $('tr[data-k="' + k + '"]', s), b = $('.cst-ab button[data-k="' + k + '"]', s);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      row.classList.toggle('is-on', on); row.classList.toggle('is-now', k === last);
      if (on) { if (ROWS[k][2] === 'r') rev += ROWS[k][0] + ROWS[k][1]; else cost += ROWS[k][0] + ROWS[k][1]; }
      else miss.push(NAMES[k]);
    });
    var box = $('.cst-pf-mm', s), m = $('.cst-pf-m', s), sm = $('.cst-pf-s', s);
    box.classList.remove('is-wrong', 'is-true');
    if (!rev) { m.textContent = '—'; sm.textContent = cost ? 'costs, but no revenue yet' : 'no app switched on'; if (cost) box.classList.add('is-wrong'); return; }
    m.textContent = pct((rev - cost) / rev);
    if (miss.length) { box.classList.add('is-wrong'); sm.textContent = 'wrong: missing ' + miss.join(', '); }
    else { box.classList.add('is-true'); sm.textContent = 'all five sources, month 7'; }
  }
  Deck.on('apps', {
    init: function (s) {
      s._on = {};
      $('.cst-ab', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]'); if (!b) return;
        s._held = true; s._on[b.dataset.k] = !s._on[b.dataset.k]; paintApps(s, s._on[b.dataset.k] ? b.dataset.k : null);
      });
    },
    enter: function (ctx, s) {
      s._on = {}; s._held = false; paintApps(s, null);
      var i = 0;
      ctx.after(1300, function () {
        ctx.every(1300, function () {
          if (s._held || i >= ORDER.length) return;
          s._on[ORDER[i]] = true; paintApps(s, ORDER[i]); i++;
        });
      });
    },
    settle: function (s) { ORDER.forEach(function (k) { s._on[k] = true; }); paintApps(s, null); }
  });

  /* ---------------------------------------------------------------- 6 · a variation, site to office */
  function paintVO(s, n) {
    var v = $('.cst-vo', s);
    v.dataset.k = n;
    $$('.cst-steps button', s).forEach(function (b) {
      var k = +b.dataset.n, li = b.parentNode;
      li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n);
    });
    $$('[data-on]', v).forEach(function (el) { var k = +el.dataset.on; el.classList.toggle('is-on', k <= n); el.classList.toggle('is-now', k === n); });
    $$('[data-t]', v).forEach(function (el) { el.textContent = pickText(el.dataset.t, n); });
  }
  Deck.on('vo', {
    init: function (s) {
      var play = $('.cst-play', s);
      s._stop = function () { s._run = (s._run || 0) + 1; play.classList.remove('is-on'); $('span', play).textContent = 'Play the flow'; s._playing = false; };
      $$('.cst-steps button', s).forEach(function (b) { b.addEventListener('click', function () { s._stop(); Deck.go(Deck.index, +b.dataset.n); }); });
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
    step: function (n, ctx, s) { paintVO(s, n); },
    leave: function (s) { s._stop(); },
    settle: function (s) { paintVO(s, 6); }
  });

  /* ---------------------------------------------------------------- 7 · the progress claim */
  function claim(s) {
    var td = 0, pv = 0;
    $$('.cst-ct tbody tr', s).forEach(function (tr) {
      var v = +tr.dataset.v, p = +tr.dataset.p, n = +$('input', tr).value;
      td += v * n / 100; pv += v * p / 100;
      $('.cst-pc-v', tr).textContent = n + '%';
      $('.cst-amt', tr).textContent = k2(v * (n - p) / 100);
    });
    var cl = td - pv, rt = Math.round(cl * 5) / 100, du = cl - rt;
    $('.cst-s-td', s).textContent = k2(td); $('.cst-s-pv', s).textContent = '−' + k2(pv);
    $('.cst-s-cl', s).textContent = k2(cl); $('.cst-s-rt', s).textContent = '−' + k2(rt); $('.cst-s-du', s).textContent = k2(du);
    $('.cst-i-cl', s).textContent = k2(cl); $('.cst-i-rt', s).textContent = '−' + k2(rt); $('.cst-i-du', s).textContent = k2(du);
  }
  function invoice(s, on) { $('.cst-inv', s).classList.toggle('is-on', on); $('.cst-mk', s).classList.toggle('is-done', on); }
  function setPct(s, which) { $$('.cst-ct tbody tr', s).forEach(function (tr) { $('input', tr).value = tr.dataset[which]; }); claim(s); }
  Deck.on('claim', {
    init: function (s) {
      $$('.cst-ct tbody tr', s).forEach(function (tr) {
        var r = $('input', tr); r.min = tr.dataset.p;
        r.addEventListener('input', function () { s._held = true; invoice(s, false); claim(s); });
      });
      $('.cst-mk', s).addEventListener('click', function () { invoice(s, true); });
    },
    enter: function (ctx, s) {
      s._held = false; invoice(s, false); setPct(s, 'p');
      if (Deck.reduce) { setPct(s, 'n'); return; }
      ctx.after(900, function () {
        var rows = $$('.cst-ct tbody tr', s);
        ctx.tween(1500, function (p) {
          if (s._held) return;
          rows.forEach(function (tr) { var a = +tr.dataset.p, b = +tr.dataset.n; $('input', tr).value = Math.round(a + (b - a) * p); });
          claim(s);
        }, 'io');
      });
    },
    settle: function (s) { setPct(s, 'n'); invoice(s, true); }
  });

  /* ---------------------------------------------------------------- 8 · rollout phases */
  var PH = [
    ['One analytic plan for projects, cost codes per trade, a budget per job, the retention account, and analytic made mandatory on every purchase and bill line.', ['Materials bought “for the company”', 'Every line bought for a project'], ['Retention in someone’s memory', 'Retention on its own account']],
    ['Two live jobs, one starting and one half-way: contract lines on a sales order, subcontracts as purchase orders, claims built from percent complete.', ['Claims built in Excel', 'Claim invoices from the order'], ['Sub invoices found at handover', 'Committed cost the day of the PO']],
    ['Supervisors on phones: tasks and variations with photos, crews in Planning, hours on timesheets, drawings in Documents, variations signed online.', ['Variations agreed on WhatsApp', 'Priced and signed before the work'], ['Progress by phone call', 'Progress from the task updates']],
    ['All twelve jobs move over at their next claim. Budget against actual per project on a dashboard, and retention release dates followed up.', ['Margin found at the final account', 'Margin seen every month'], ['Twelve Excel claim files', 'One list of claims and retentions']]
  ];
  function paintPh(s, k) {
    var p = PH[+k], rows = $$('.cst-rba li', s);
    $$('.cst-gt button', s).forEach(function (b) { b.classList.toggle('is-on', b.dataset.k === String(k)); });
    $$('.cst-rd-apps span', s).forEach(function (e) { e.classList.toggle('is-on', e.dataset.k === String(k)); });
    $('.cst-rd-do', s).textContent = p[0];
    rows.forEach(function (li, i) { $('.fb-b', li).textContent = p[i + 1][0]; $('.fb-a', li).textContent = p[i + 1][1]; });
    swap($('.cst-rd', s));
  }
  Deck.on('rollout', {
    init: function (s) {
      $('.cst-gt', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (!b) return; s._held = true; paintPh(s, b.dataset.k); });
      paintPh(s, 0);
    },
    enter: function (ctx, s) {
      s._held = false; paintPh(s, 0);
      var i = 0;
      ctx.after(1400, function () { ctx.every(4200, function () { if (s._held) return; i = (i + 1) % 4; paintPh(s, i); }); });
    },
    settle: function (s) { paintPh(s, 0); }
  });
})();

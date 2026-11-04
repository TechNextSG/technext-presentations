/* What is Odoo deck: slide behaviour. The one-order record card is simplified and illustrative. */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------------------------------------------------------------- 1 · cover: apps settle into two rings round one database */
  function cnSlots(n) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(i < 8 ? { r: 188, a: i / 8 * Math.PI * 2 - Math.PI / 2, sp: .03 } : { r: 318, a: (i - 8) / (n - 8) * Math.PI * 2 - Math.PI / 2 + .26, sp: -.018 });
    return a;
  }
  var C = 370;
  function cnPlace(el, x, y, o) { el.style.transform = 'translate(' + (x - 32).toFixed(1) + 'px,' + (y - 32).toFixed(1) + 'px)'; el.style.opacity = o; }
  Deck.on('cover', {
    init: function (s) {
      var apps = $$('.cn-apps i', s), sl = cnSlots(apps.length), g = $('.cn-links', s);
      s._lines = apps.map(function (el, i) {
        var x = C + Math.cos(sl[i].a) * sl[i].r, y = C + Math.sin(sl[i].a) * sl[i].r;
        cnPlace(el, x, y, 1);
        return FX.svg('path', { d: 'M' + C + ',' + C + ' L' + x.toFixed(1) + ',' + y.toFixed(1) }, g);
      });
    },
    enter: function (ctx, s) {
      if (Deck.reduce || Deck.tv) return; // init already placed every app: no orbit, no pulses on TVs or under reduced motion
      var apps = $$('.cn-apps i', s), sl = cnSlots(apps.length), g = $('.cn-links', s), ptr = FX.pointer(ctx, s);
      var start = apps.map(function (el, i) { var a = sl[i].a + (Math.random() - .5) * .9, r = sl[i].r + 120 + Math.random() * 140; return [C + Math.cos(a) * r, C + Math.sin(a) * r]; });
      var pos = [];
      ctx.frame(function (t) {
        var p = ptr.step(), sec = t / 1000;
        for (var i = 0; i < apps.length; i++) {
          var k = Deck.ease.out(clamp((t - 250 - i * 55) / 1900, 0, 1)), q = sl[i], a = q.a + sec * q.sp;
          var tx = C + Math.cos(a) * q.r + p.x * (q.r > 200 ? 26 : 14), ty = C + Math.sin(a) * q.r + p.y * (q.r > 200 ? 20 : 10);
          var x = start[i][0] + (tx - start[i][0]) * k, y = start[i][1] + (ty - start[i][1]) * k;
          pos[i] = [x, y]; cnPlace(apps[i], x, y, k);
          var dx = x - C, dy = y - C, d = Math.sqrt(dx * dx + dy * dy) || 1, sx = C + dx / d * 96, sy = C + dy / d * 96;
          s._lines[i].setAttribute('d', 'M' + sx.toFixed(1) + ',' + sy.toFixed(1) + ' L' + (x - dx / d * 34).toFixed(1) + ',' + (y - dy / d * 34).toFixed(1));
          s._lines[i].style.opacity = k;
        }
      });
      // data moving through the one database: an app writes, the core passes it to another app
      function pulse() {
        var a = (Math.random() * apps.length) | 0, b = (a + 3 + ((Math.random() * (apps.length - 6)) | 0)) % apps.length;
        var dot = FX.svg('circle', { r: 4.5, 'class': 'cn-pulse' }, g);
        ctx.tween(900, function (e) { var P = pos[a]; if (!P) return; dot.setAttribute('cx', P[0] + (C - P[0]) * e); dot.setAttribute('cy', P[1] + (C - P[1]) * e); }, 'io')
          .then(function () { return ctx.tween(900, function (e) { var P = pos[b]; if (!P) return; dot.setAttribute('cx', C + (P[0] - C) * e); dot.setAttribute('cy', C + (P[1] - C) * e); }, 'io'); })
          .then(function () { dot.remove(); });
      }
      ctx.after(2400, function () { pulse(); ctx.every(900, pulse); });
    },
    leave: function (s) { $$('.cn-pulse', s).forEach(function (d) { d.remove(); }); }
  });

  /* ---------------------------------------------------------------- 2 · the problem: re-typed five times, or once */
  function pbFinal(s) { $$('.pb-t,.pb-f', s).forEach(function (x) { x.classList.add('is-hit'); }); $('[data-pb=before]', s).textContent = 5; }
  Deck.on('problem', {
    init: pbFinal, settle: pbFinal,
    enter: function (ctx, s) {
      var tools = $$('.pb-t', s), meter = $('[data-pb=before]', s);
      function loop() {
        tools.forEach(function (x) { x.classList.remove('is-hit'); }); meter.textContent = 0;
        tools.forEach(function (x, i) { ctx.after(600 + i * 850, function () { x.classList.add('is-hit'); meter.textContent = i + 1; }); });
        ctx.after(600 + tools.length * 850 + 2600, loop);
      }
      loop();
    },
    step: function (n, ctx, s, first) {
      if (n < 1) return;
      var rows = $$('.pb-f', s), my = s._aft = (s._aft || 0) + 1;
      function run() {
        if (my !== s._aft) return;
        rows.forEach(function (x) { x.classList.remove('is-hit'); });
        rows.forEach(function (x, i) { ctx.after(500 + i * 520, function () { if (my === s._aft) x.classList.add('is-hit'); }); });
        ctx.after(500 + rows.length * 520 + 3200, run);
      }
      run();
    }
  });

  /* ---------------------------------------------------------------- 3 · the apps, area by area */
  var FIRST = { accountant: 1, sale: 1, stock: 1 };
  function apGrid(s, c, animate, ctx) {
    var cat = window.APPS[c], grid = $('.ap-grid', s);
    grid.innerHTML = cat.apps.map(function (a) {
      return '<div class="ap-t' + (FIRST[a.m] ? ' is-first' : '') + '"><img class="oi" src="assets/img/odoo/' + a.m + '.svg" alt="" width="44" height="44"><span><b>' + a.n + '</b><small>' + a.d + '</small>' +
        (FIRST[a.m] ? '<span class="ap-star">Start here</span>' : '') + '</span></div>';
    }).join('');
    var ts = $$('.ap-t', grid);
    if (!animate) { ts.forEach(function (t) { t.classList.add('is-on'); }); return; }
    ts.forEach(function (t, i) { ctx.after(40 + i * 70, function () { t.classList.add('is-on'); }); });
  }
  /* ---------------------------------------------------------------- 6 · new in Odoo 20: all six, the new ones, or what to check */
  Deck.on('new20', {
    init: function (s) {
      var box = $('.n20', s), btns = $$('[data-n20="f"] button', s);
      s._f = function (v) {
        if (v === 'all') delete box.dataset.f; else box.dataset.f = v;
        btns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      };
      $('[data-n20="f"]', s).addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { s._user = true; s._f(b.dataset.v); } });
    },
    enter: function (ctx, s) {
      var order = ['all', 'new', 'chk'], k = 0; s._user = false; s._f('all');
      ctx.after(3600, function () { ctx.every(3600, function () { if (s._user) return; k = (k + 1) % 3; s._f(order[k]); }); });
    },
    settle: function (s) { s._f('all'); }
  });

  Deck.on('apps', {
    init: function (s) {
      var cats = $('.ap-cats', s);
      cats.innerHTML = window.APPS.map(function (c, i) {
        return '<button type="button" role="tab" aria-selected="' + (i === 0) + '" data-c="' + i + '"><img class="oi" src="assets/img/odoo/' + c.apps[0].m + '.svg" alt="" width="28" height="28">' + c.title + '<em>' + c.apps.length + '</em></button>';
      }).join('');
      $('[data-ap-n]', s).textContent = window.APPS.reduce(function (n, c) { return n + c.apps.length; }, 0);
      apGrid(s, 0, false);
    },
    enter: function (ctx, s) {
      var btns = $$('.ap-cats button', s), cur = 0, auto = true;
      function sel(k) { cur = k; btns.forEach(function (b, j) { b.setAttribute('aria-selected', j === k ? 'true' : 'false'); }); apGrid(s, k, true, ctx); }
      sel(0);
      ctx.every(5200, function () { if (auto) sel((cur + 1) % btns.length); });
      ctx.on($('.ap-cats', s), 'click', function (e) { var b = e.target.closest('button'); if (b) { auto = false; sel(+b.dataset.c); } });
    }
  });

  /* ---------------------------------------------------------------- 4 · one database: one app writes, others react */
  var OD = {
    crm: { w: 'Leads, opportunities and the next activity on each', r: 'Sales turns the opportunity into a quotation, with the customer already filled in.', to: ['sale'] },
    sale: { w: 'Quotations and confirmed sales orders', r: 'Inventory reserves the stock, Accounting can invoice it, and CRM marks the deal won.', to: ['stock', 'accountant', 'crm'] },
    stock: { w: 'Receipts, deliveries and every stock move', r: 'Sales sees the delivery status, Accounting values the stock, and Purchase reorders below the minimum.', to: ['sale', 'accountant', 'purchase'] },
    purchase: { w: 'Requests for quotation and purchase orders', r: 'Inventory expects the receipt, and Accounting matches the vendor bill to it.', to: ['stock', 'accountant'] },
    mrp: { w: 'Bills of materials and manufacturing orders', r: 'Inventory uses the components and adds the finished goods; Purchase orders what is short.', to: ['stock', 'purchase', 'accountant'] },
    accountant: { w: 'Invoices, payments and journal entries', r: 'Sales sees what is paid, Purchase sees the bills due, and every report reads the same books.', to: ['sale', 'purchase'] },
    website_sale: { w: 'Online orders and customer accounts', r: 'Each order lands in Sales, reserves real stock and posts to Accounting.', to: ['sale', 'stock', 'accountant'] },
    hr: { w: 'Employees, contracts, expenses and time off', r: 'Expenses and payroll post to Accounting, and managers approve from the same records.', to: ['accountant'] }
  };
  var OX = 380, OY = 350;
  function odCard(s, k) {
    var b = $('.od-app[data-k="' + k + '"]', s);
    $('[data-od-ic]', s).innerHTML = $('img', b).outerHTML; $('[data-od-app]', s).textContent = $('b', b).textContent;
    $('[data-od-w]', s).textContent = OD[k].w; $('[data-od-r]', s).textContent = OD[k].r;
  }
  Deck.on('onedb', {
    init: function (s) {
      var g = $('.od-links', s); s._od = {};
      $$('.od-app', s).forEach(function (b, i) {
        var a = -Math.PI / 2 + i / 8 * Math.PI * 2, x = OX + Math.cos(a) * 272, y = OY + Math.sin(a) * 272;
        b.style.setProperty('--x', x.toFixed(1) + 'px'); b.style.setProperty('--y', y.toFixed(1) + 'px');
        var sx = OX + Math.cos(a) * 110, sy = OY + Math.sin(a) * 110, ex = OX + Math.cos(a) * 225, ey = OY + Math.sin(a) * 225;
        s._od[b.dataset.k] = { b: b, a: [ex, ey], c: [sx, sy], line: FX.svg('path', { d: 'M' + sx.toFixed(1) + ',' + sy.toFixed(1) + ' L' + ex.toFixed(1) + ',' + ey.toFixed(1) }, g) };
      });
      odCard(s, 'sale');
    },
    enter: function (ctx, s) {
      var keys = Object.keys(OD), cur = -1, auto = true, card = $('.od-card', s), core = $('.od-core', s), pg = $('.od-pulses', s), run = 0;
      function dot(from, to, dur) {
        var d = FX.svg('circle', { r: 6 }, pg);
        return ctx.tween(dur, function (e) { d.setAttribute('cx', from[0] + (to[0] - from[0]) * e); d.setAttribute('cy', from[1] + (to[1] - from[1]) * e); }, 'io').then(function () { d.remove(); });
      }
      function sel(k) {
        var my = ++run; cur = keys.indexOf(k);
        $$('.od-app', s).forEach(function (b) { b.classList.remove('is-src', 'is-react'); });
        Object.keys(s._od).forEach(function (x) { s._od[x].line.classList.remove('is-on'); });
        var src = s._od[k]; src.b.classList.add('is-src'); src.line.classList.add('is-on');
        card.classList.add('is-swap'); ctx.after(220, function () { odCard(s, k); card.classList.remove('is-swap'); });
        dot(src.a, src.c, 750).then(function () {
          if (my !== run) return;
          core.classList.add('is-ping'); ctx.after(500, function () { core.classList.remove('is-ping'); });
          OD[k].to.forEach(function (t, i) {
            var r = s._od[t];
            ctx.after(i * 140, function () {
              if (my !== run) return;
              r.line.classList.add('is-on');
              dot(r.c, r.a, 750).then(function () { if (my === run) r.b.classList.add('is-react'); });
            });
          });
        });
      }
      ctx.after(500, function () { sel('sale'); });
      ctx.every(5200, function () { if (auto) sel(keys[(cur + 1) % keys.length]); });
      ctx.on($('.od', s), 'click', function (e) { var b = e.target.closest('.od-app'); if (b) { auto = false; sel(b.dataset.k); } });
    },
    leave: function (s) { $('.od-pulses', s).innerHTML = ''; }
  });

  /* ---------------------------------------------------------------- 5 · one order, lead to cash: → moves the record card one app along the rail */
  function flAt(s, i) {
    var fl = $('.fl', s), k = Math.max(i, 0);
    fl.style.setProperty('--ci', k);
    fl.style.setProperty('--sh', k === 0 ? '48px' : k === 5 ? '-48px' : '0px'); // keeps the 320px card inside the 120px margins at both ends
    $$('.fl-st', s).forEach(function (b, j) {
      b.classList.toggle('is-on', j <= i); b.classList.toggle('is-cur', j === i);
      if (j === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    $$('.fl-seg', s).forEach(function (g, j) { g.classList.toggle('is-on', j < i); });
    $$('.fl-face', s).forEach(function (f, j) { f.classList.toggle('is-on', j === k); f.setAttribute('aria-hidden', j === k ? 'false' : 'true'); });
  }
  function flSnap(s, i, live) {
    var fl = $('.fl', s);
    fl.classList.add('fl-snap'); fl.classList.toggle('is-live', live); flAt(s, i); $('[data-fl-say]', s).textContent = '';
    void fl.offsetWidth; fl.classList.remove('fl-snap');
  }
  function flEnd(s) { s._fl = (s._fl || 0) + 1; $('.fl', s).classList.add('is-live'); flAt(s, 5); $('[data-fl-say]', s).textContent = ''; }
  Deck.on('flow', {
    init: function (s) {
      flEnd(s);
      // a click on an app puts the order there; through the engine, so → / ← and the presenter view stay in step
      s.addEventListener('click', function (e) { var b = e.target.closest('.fl-st'); if (b) Deck.go(Deck.slides.indexOf(s), +b.dataset.k); });
      // printing settles every slide (card on Dashboards); put the current slide back on the engine's step afterwards
      window.addEventListener('afterprint', function () { if (Deck.slides[Deck.index] === s) flSnap(s, Deck.step, true); });
    },
    settle: flEnd,
    step: function (n, ctx, s, first) {
      var me = s._fl = (s._fl || 0) + 1;
      if (first && n === 0) {
        // arriving at the start: the card lands on CRM a beat after the headline
        flSnap(s, -1, false);
        ctx.after(700, function () { if (s._fl === me) { $('.fl', s).classList.add('is-live'); flAt(s, 0); } });
        return;
      }
      if (first) { flSnap(s, n, true); return; }
      $('.fl', s).classList.add('is-live'); flAt(s, n);
      $('[data-fl-say]', s).textContent = $$('b, .fl-ft, .fl-b', $$('.fl-face', s)[n]).map(function (t) { return t.textContent; }).join(', ');
    }
  });

  /* ---------------------------------------------------------------- 7 · implement: the phases take turns */
  Deck.on('implement', {
    init: function (s) { $$('.im-p', s).forEach(function (p) { p.classList.add('is-past'); }); },
    settle: function (s) { $$('.im-p', s).forEach(function (p) { p.classList.remove('is-on'); p.classList.add('is-past'); }); },
    enter: function (ctx, s) {
      var ps = $$('.im-p', s), i = -1;
      ps.forEach(function (p) { p.classList.remove('is-on', 'is-past'); });
      function nx() { i = (i + 1) % (ps.length + 1); ps.forEach(function (p, j) { p.classList.toggle('is-on', j === i); p.classList.toggle('is-past', j < i); }); }
      ctx.after(600, function () { nx(); ctx.every(1500, nx); });
    }
  });
})();

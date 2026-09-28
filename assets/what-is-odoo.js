/* What is Odoo deck: slide behaviour. The walkthrough screens are simplified and illustrative. */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  function idx(s) { return Deck.slides.indexOf(s); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var EASE = 'cubic-bezier(.2,.8,.2,1)';
  function flip(els, mutate, dur) {
    var first = els.map(function (e) { return Deck.rect(e); });
    mutate();
    var s = Deck.scale;
    els.forEach(function (e, i) {
      if (!e.isConnected) return;
      var l = Deck.rect(e), dx = (first[i].left - l.left) / s, dy = (first[i].top - l.top) / s;
      if (Math.abs(dx) + Math.abs(dy) < .5) return;
      e.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: dur || 800, easing: EASE });
    });
  }
  function on(el, v) { if (el) el.classList.toggle('is-on', v !== false); }

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

  /* ---------------------------------------------------------------- 4 · the apps, area by area */
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
  /* ---------------------------------------------------------------- 4 · new in Odoo 20: all six, the new ones, or what to check */
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

  /* ---------------------------------------------------------------- 5 · one database: one app writes, others react */
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

  /* ---------------------------------------------------------------- 6 · walkthrough intro: jump to a step */
  Deck.on('walk', { init: function (s) { s.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) Deck.goId(b.dataset.go); }); } });

  /* ---------------------------------------------------------------- 7-12 · the walkthrough */
  var WT = ['CRM', 'Sales', 'Inventory', 'Invoicing', 'Accounting', 'Reporting'];
  function wtBar(s) {
    var w = +s.dataset.w, bar = document.createElement('div');
    bar.className = 'wt-bar'; bar.style.setProperty('--wp', w / 5);
    bar.innerHTML = WT.map(function (n, i) { return '<button type="button" class="' + (i < w ? 'is-done' : i === w ? 'is-cur' : '') + '" data-w="' + i + '"><i>' + (i + 1) + '</i>' + n + '</button>'; }).join('');
    s.insertBefore(bar, s.querySelector('.wt-left'));
    bar.addEventListener('click', function (e) { var b = e.target.closest('[data-w]'); if (b) Deck.goId('w' + (+b.dataset.w + 1)); });
  }
  function sb(s, n) { $$('.ow-sb i', s).forEach(function (i) { i.classList.toggle('is-cur', +i.dataset.sb === n); }); }
  function money(n) { return Deck.money(n); }
  // one wiring for all six: reset → intro (step 0) → act (step 1); final() draws the end state for print and the overview
  function wt(id, o) {
    Deck.on(id, {
      init: function (s) {
        wtBar(s);
        s.addEventListener('click', function (e) { if (e.target.closest('[data-act]') && +s.dataset.cur === 0) Deck.go(idx(s), 1); });
        if (o.init) o.init(s);
        o.final(s);
      },
      step: function (n, ctx, s, first) {
        var act = $('[data-act]', s);
        if (first) { o.reset(s); if (n === 0) o.intro(ctx, s, function () { act.classList.add('is-ready'); }); else o.final(s); return; }
        if (n === 1) { act.classList.remove('is-ready'); act.classList.add('is-done'); o.act(ctx, s); }
        else { o.reset(s); o.intro(ctx, s, function () { act.classList.add('is-ready'); }, true); }
      },
      settle: function (s) { o.reset(s); o.final(s); }
    });
  }
  function actReset(s) { var a = $('[data-act]', s); a.classList.remove('is-ready', 'is-done'); }

  // 1 · CRM: the lead arrives and moves New → Qualified → Proposition
  function kbSums(s) {
    $$('.kb-col', s).forEach(function (c) {
      var t = 0, n = 0; $$('.kb-card em', c).forEach(function (e) { t += +e.textContent.replace(/[^0-9.]/g, ''); n++; });
      $('[data-kb-sum]', c).textContent = n + ' · ' + money(t).replace('.00', '');
    });
  }
  wt('w1', {
    reset: function (s) {
      var me = $('[data-me]', s); $('.ow-kb', s).appendChild(me); me.style.opacity = '';
      $('.kb-quote', s).classList.remove('is-show'); actReset(s); on($('.ow-toast', s), false); $('[data-me-when]', s).textContent = 'just now'; kbSums(s);
    },
    intro: function (ctx, s, ready, quick) {
      var me = $('[data-me]', s), lists = $$('.kb-list', s), all = function () { return $$('.kb-card', s); };
      function to(k) { flip(all(), function () { lists[k].insertBefore(me, lists[k].firstChild); }); kbSums(s); }
      ctx.after(quick ? 100 : 600, function () {
        flip(all().filter(function (c) { return c !== me; }), function () { lists[0].insertBefore(me, lists[0].firstChild); });
        me.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: EASE });
        kbSums(s);
      });
      ctx.after(quick ? 500 : 2100, function () { to(1); });
      ctx.after(quick ? 900 : 3600, function () { to(2); $('[data-me-when]', s).textContent = 'today'; });
      ctx.after(quick ? 1400 : 4700, function () { $('.kb-quote', s).classList.add('is-show'); ready(); });
    },
    act: function (ctx, s) { on($('.ow-toast', s)); },
    final: function (s) {
      var me = $('[data-me]', s); $$('.kb-list', s)[2].insertBefore(me, $$('.kb-list', s)[2].firstChild);
      $('.kb-quote', s).classList.add('is-show'); $('[data-act]', s).classList.add('is-done'); on($('.ow-toast', s)); $('[data-me-when]', s).textContent = 'today'; kbSums(s);
    }
  });

  // 2 · Sales: the line fills in, the quotation is sent, then confirmed
  wt('w2', {
    reset: function (s) {
      sb(s, 0); actReset(s); $('[data-send]', s).classList.remove('is-done');
      var a = $('[data-act]', s); a.textContent = 'Confirm'; a.classList.remove('is-next');
      $('[data-l-p]', s).textContent = ''; $('[data-l-q]', s).textContent = '0.00'; $('[data-l-a]', s).textContent = money(0);
      $('[data-t-u]', s).textContent = money(0); $('[data-t-g]', s).textContent = money(0); $('[data-t-t]', s).textContent = money(0);
      on($('[data-smart]', s), false); on($('.ow-toast', s), false);
    },
    intro: function (ctx, s, ready, quick) {
      var sp = quick ? 6 : 26;
      ctx.after(quick ? 80 : 450, async function () {
        await ctx.type($('[data-l-p]', s), '[CHR-ERG] Ergonomic office chair', sp);
        await ctx.count($('[data-l-q]', s), 20, { dec: 2, dur: quick ? 150 : 600 });
        ctx.count($('[data-l-a]', s), 6240, { dec: 2, pre: 'S$', dur: quick ? 150 : 700 });
        ctx.count($('[data-t-u]', s), 6240, { dec: 2, pre: 'S$', dur: quick ? 150 : 800 });
        ctx.count($('[data-t-g]', s), 561.6, { dec: 2, pre: 'S$', dur: quick ? 150 : 800 });
        await ctx.count($('[data-t-t]', s), 6801.6, { dec: 2, pre: 'S$', dur: quick ? 150 : 900 });
        await ctx.wait(quick ? 100 : 700);
        $('[data-send]', s).classList.add('is-done'); sb(s, 1);
        await ctx.wait(quick ? 100 : 700); ready();
      });
    },
    act: function (ctx, s) {
      // once confirmed, Odoo offers the next step on the same order
      var a = $('[data-act]', s); a.classList.remove('is-done'); a.classList.add('is-next'); a.textContent = 'Create Invoice';
      sb(s, 2); ctx.after(250, function () { on($('[data-smart]', s)); }); ctx.after(450, function () { on($('.ow-toast', s)); });
    },
    final: function (s) {
      sb(s, 2); $('[data-send]', s).classList.add('is-done');
      var a = $('[data-act]', s); a.classList.add('is-next'); a.textContent = 'Create Invoice';
      $('[data-l-p]', s).textContent = '[CHR-ERG] Ergonomic office chair'; $('[data-l-q]', s).textContent = '20.00'; $('[data-l-a]', s).textContent = money(6240);
      $('[data-t-u]', s).textContent = money(6240); $('[data-t-g]', s).textContent = money(561.6); $('[data-t-t]', s).textContent = money(6801.6);
      on($('[data-smart]', s)); on($('.ow-toast', s));
    }
  });

  // 3 · Inventory: 20 of 20 scanned, validated, stock 120 → 100
  wt('w3', {
    reset: function (s) {
      sb(s, 2); actReset(s); on($('.ow-toast', s), false);
      $('[data-picked]', s).textContent = '0.00'; $('[data-scan]', s).parentNode.style.setProperty('--sp', 0); $('[data-scan-l]', s).textContent = 'Ready to scan';
      $('[data-onhand]', s).textContent = 120; $('[data-bar]', s).style.setProperty('--h', 1);
    },
    intro: function (ctx, s, ready, quick) {
      var bar = $('[data-scan]', s).parentNode, lbl = $('[data-scan-l]', s), pk = $('[data-picked]', s);
      ctx.after(quick ? 60 : 500, function () {
        ctx.tween(quick ? 300 : 2400, function (e) {
          var n = Math.round(20 * e); bar.style.setProperty('--sp', e); pk.textContent = n.toFixed(2); lbl.textContent = 'Scanned ' + n + ' of 20';
        }, 'lin').then(function () { lbl.textContent = 'All 20 scanned'; ctx.after(quick ? 60 : 500, ready); });
      });
    },
    act: function (ctx, s) {
      sb(s, 3);
      ctx.count($('[data-onhand]', s), 100, { from: 120, dur: 1200 }); $('[data-bar]', s).style.setProperty('--h', .83);
      ctx.after(500, function () { on($('.ow-toast', s)); });
    },
    final: function (s) {
      sb(s, 3); $('[data-act]', s).classList.add('is-done'); $('[data-picked]', s).textContent = '20.00';
      $('[data-scan]', s).parentNode.style.setProperty('--sp', 1); $('[data-scan-l]', s).textContent = 'All 20 scanned';
      $('[data-onhand]', s).textContent = 100; $('[data-bar]', s).style.setProperty('--h', .83); on($('.ow-toast', s));
    }
  });

  // 4 · Invoicing: confirm, get the number, see the journal entries
  function invTabs(s, je) {
    $$('.sh-tabs [data-tab]', s).forEach(function (t) { t.classList.toggle('is-on', (t.dataset.tab === 'je') === je); });
    $$('.sh-pane', s).forEach(function (p) { p.classList.toggle('is-on', (p.dataset.pane === 'je') === je); });
  }
  wt('w4', {
    reset: function (s) {
      sb(s, 0); actReset(s); on($('.ow-toast', s), false); invTabs(s, false);
      $('[data-inv-no]', s).textContent = 'Draft'; $('[data-inv-t]', s).textContent = 'Draft';
      $$('.sh-je tbody tr', s).forEach(function (r) { r.classList.remove('is-on'); });
    },
    intro: function (ctx, s, ready, quick) { ctx.after(quick ? 100 : 900, ready); },
    act: function (ctx, s) {
      sb(s, 1); $('[data-inv-no]', s).textContent = 'INV/2026/00042';
      ctx.type($('[data-inv-t]', s), 'INV/2026/00042', 30);
      ctx.after(600, function () { invTabs(s, true); $$('.sh-je tbody tr', s).forEach(function (r, i) { ctx.after(120 + i * 220, function () { r.classList.add('is-on'); }); }); });
      ctx.after(1400, function () { on($('.ow-toast', s)); });
    },
    final: function (s) {
      sb(s, 1); $('[data-act]', s).classList.add('is-done'); invTabs(s, true);
      $('[data-inv-no]', s).textContent = 'INV/2026/00042'; $('[data-inv-t]', s).textContent = 'INV/2026/00042';
      $$('.sh-je tbody tr', s).forEach(function (r) { r.classList.add('is-on'); }); on($('.ow-toast', s));
    }
  });

  // 5 · Accounting: the bank line matches the invoice
  wt('w5', {
    reset: function (s) {
      actReset(s); on($('.ow-toast', s), false);
      $('[data-rc-me]', s).classList.remove('is-done'); $('.rc-inv', s).classList.remove('is-paid'); $('[data-due]', s).textContent = money(6801.6);
    },
    intro: function (ctx, s, ready, quick) { ctx.after(quick ? 100 : 1000, ready); },
    act: function (ctx, s) {
      $('[data-rc-me]', s).classList.add('is-done');
      ctx.after(300, function () { $('.rc-inv', s).classList.add('is-paid'); ctx.count($('[data-due]', s), 0, { from: 6801.6, dec: 2, pre: 'S$', dur: 900 }); });
      ctx.after(900, function () { on($('.ow-toast', s)); });
    },
    final: function (s) {
      $('[data-act]', s).classList.add('is-done'); $('[data-rc-me]', s).classList.add('is-done'); $('.rc-inv', s).classList.add('is-paid');
      $('[data-due]', s).textContent = money(0); on($('.ow-toast', s));
    }
  });

  // 6 · Reporting: the numbers already moved; the trail lights up
  wt('w6', {
    reset: function (s) {
      actReset(s);
      $$('.db-bars i', s).forEach(function (b) { b.style.setProperty('--g', 0); });
      $$('.tr span', s).forEach(function (x) { x.classList.remove('is-on'); });
      $('[data-kpi=sales]', s).textContent = 'S$78,060'; $('[data-kpi=cash]', s).textContent = 'S$54,620.00';
    },
    intro: function (ctx, s, ready, quick) {
      $$('.db-bars i', s).forEach(function (b, i) { ctx.after((quick ? 20 : 250) + i * (quick ? 20 : 120), function () { b.style.setProperty('--g', 1); }); });
      ctx.after(quick ? 100 : 700, function () {
        ctx.count($('[data-kpi=sales]', s), 84300, { from: 78060, pre: 'S$', dur: quick ? 200 : 1400 });
        ctx.count($('[data-kpi=cash]', s), 61421.6, { from: 54620, dec: 2, pre: 'S$', dur: quick ? 200 : 1400 });
      });
      ctx.after(quick ? 300 : 1800, ready);
    },
    act: function (ctx, s) { $$('.tr span', s).forEach(function (x, i) { ctx.after(i * 320, function () { x.classList.add('is-on'); }); }); },
    final: function (s) {
      $('[data-act]', s) && $('[data-act]', s).classList.add('is-done');
      $$('.db-bars i', s).forEach(function (b) { b.style.setProperty('--g', 1); });
      $$('.tr span', s).forEach(function (x) { x.classList.add('is-on'); });
      $('[data-kpi=sales]', s).textContent = 'S$84,300'; $('[data-kpi=cash]', s).textContent = 'S$61,421.60';
    }
  });

  /* ---------------------------------------------------------------- 13 · editions */
  Deck.on('editions', {
    enter: function (ctx, s) {
      var ed = $('.ed', s), btns = $$('.ed-seg button', s);
      function set(d) { ed.classList.toggle('is-diff', d); btns.forEach(function (b) { b.setAttribute('aria-pressed', (b.dataset.ed === 'diff') === d ? 'true' : 'false'); }); }
      set(false);
      ctx.on($('.ed-seg', s), 'click', function (e) { var b = e.target.closest('button'); if (b) set(b.dataset.ed === 'diff'); });
    }
  });

  /* ---------------------------------------------------------------- 14 · hosting: two answers pick the column */
  var REC = {
    online: ['Start on Odoo Online', 'Standard apps and configuration cover most first phases, and it is the simplest and cheapest to run.'],
    sh: ['Choose Odoo.sh', 'As soon as a requirement needs custom code: a bespoke integration, a module Odoo does not have, or logic Studio cannot express.'],
    prem: ['Go on-premise', 'Only for a concrete reason, such as a regulator, a group IT policy or existing infrastructure. It moves the whole operations burden to you.']
  };
  function hoPaint(s, q, ctx) {
    var c = q.own ? 'prem' : q.code ? 'sh' : 'online', rec = $('.ho-rec', s);
    $$('.ho-qq button', s).forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.v === q[b.dataset.q] ? 'true' : 'false'); });
    $$('.ho-tbl [data-c]', s).forEach(function (x) { x.classList.toggle('is-rec', x.dataset.c === c); });
    if (rec._c === c) return; rec._c = c;
    if (!ctx) { $('[data-ho-rec]', s).textContent = REC[c][0]; $('[data-ho-why]', s).textContent = REC[c][1]; return; }
    rec.classList.add('is-swap');
    ctx.after(230, function () { $('[data-ho-rec]', s).textContent = REC[c][0]; $('[data-ho-why]', s).textContent = REC[c][1]; rec.classList.remove('is-swap'); });
  }
  Deck.on('hosting', {
    init: function (s) { hoPaint(s, { code: 0, own: 0 }); },
    enter: function (ctx, s) {
      var q = { code: 0, own: 0 }, auto = true, demo = [{ code: 0, own: 0 }, { code: 1, own: 0 }, { code: 1, own: 1 }], k = 0;
      hoPaint(s, q, ctx);
      ctx.every(3800, function () { if (!auto) return; k = (k + 1) % demo.length; q = { code: demo[k].code, own: demo[k].own }; hoPaint(s, q, ctx); });
      ctx.on($('.ho-q', s), 'click', function (e) { var b = e.target.closest('button[data-q]'); if (!b) return; auto = false; q[b.dataset.q] = +b.dataset.v; hoPaint(s, q, ctx); });
    }
  });

  /* ---------------------------------------------------------------- 15 · implement: the phases take turns */
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

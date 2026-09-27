/* Service showcase deck: slide behaviour. All data is illustrative. */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  function idx(s) { return Deck.slides.indexOf(s); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var EASE = 'cubic-bezier(.2,.8,.2,1)';

  // FLIP: record where els are, change the DOM, then glide each from its old place to its new one
  function flip(els, mutate, dur) {
    var first = els.map(function (e) { return e.getBoundingClientRect(); });
    mutate();
    var s = Deck.scale;
    els.forEach(function (e, i) {
      if (!e.isConnected) return;
      var l = e.getBoundingClientRect(), dx = (first[i].left - l.left) / s, dy = (first[i].top - l.top) / s;
      if (Math.abs(dx) + Math.abs(dy) < .5) return;
      e.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: dur || 720, easing: EASE });
    });
  }

  /* ---------------------------------------------------------------- 1 · cover: the stack leans toward the pointer */
  Deck.on('cover', {
    enter: function (ctx, s) {
      var scene = $('.iso-scene', s), ptr = FX.pointer(ctx, s);
      ctx.frame(function () { var p = ptr.step(); scene.style.transform = 'rotateX(' + (58 - p.y * 7).toFixed(2) + 'deg) rotateZ(' + (-42 + p.x * 9).toFixed(2) + 'deg)'; });
    }
  });

  /* ---------------------------------------------------------------- 2 · service map */
  function mapFill(s, b) {
    var det = $('.mp-detail', s);
    $('[data-mp-cat]', det).textContent = $('.mp-h b', b.closest('.mp-col')).textContent;
    $('[data-mp-t]', det).textContent = b.dataset.t;
    $('[data-mp-d]', det).textContent = b.dataset.d;
    var n = Deck.slides.findIndex(function (x) { return x.id === b.dataset.go; });
    $('[data-mp-n]', det).textContent = 'Slide ' + (n + 1) + ' · ' + Deck.slides[n].dataset.title;
    det._go = b.dataset.go;
  }
  Deck.on('map', {
    init: function (s) {
      var items = $$('.mp-i', s); items[0].classList.add('is-on'); mapFill(s, items[0]);
      s.addEventListener('click', function (e) {
        var b = e.target.closest('.mp-i'); if (b) { Deck.goId(b.dataset.go); return; }
        if (e.target.closest('[data-mp-go]')) Deck.goId($('.mp-detail', s)._go);
      });
    },
    enter: function (ctx, s) {
      var items = $$('.mp-i', s), det = $('.mp-detail', s), cur = 0, auto = true;
      function show(k) {
        if (k === cur && items[k].classList.contains('is-on')) return;
        cur = k; items.forEach(function (x, j) { x.classList.toggle('is-on', j === k); });
        det.classList.add('is-swap');
        ctx.after(220, function () { mapFill(s, items[k]); det.classList.remove('is-swap'); });
      }
      ctx.every(2600, function () { if (auto) show((cur + 1) % items.length); });
      var cols = $('.mp-cols', s);
      ctx.on(cols, 'pointerover', function (e) { var b = e.target.closest('.mp-i'); if (b && e.pointerType === 'mouse') { auto = false; show(items.indexOf(b)); } });
      ctx.on(cols, 'focusin', function (e) { var b = e.target.closest('.mp-i'); if (b) { auto = false; show(items.indexOf(b)); } });
    }
  });

  /* ---------------------------------------------------------------- 3 · ERP plan */
  var PH = [
    { n: 'Discover', s: 0, d: 'Weeks 1–2. We map how orders, stock and money move today, match each step to an Odoo app and write the scope down.', w: 'TechNext SG · PH with your process owners',
      t: [['Kick-off', 0, 1.1], ['Fit-gap', 1.1, 2.1], ['Scope signed', 2.2]] },
    { n: 'Build', s: 2.35, d: 'Weeks 3–6. Three configuration sprints on a staging copy, your data mapped and loaded twice, and the connectors to the systems you keep.', w: 'TechNext PH consultants · VN development hub',
      t: [['Sprints 1–3', 2.4, 5.9], ['Data loads', 2.8, 6], ['Connectors & APIs', 3.2, 6.2], ['Build done', 6.35]] },
    { n: 'Test & train', s: 6.5, d: 'Weeks 7–9. Your key users test real scenarios on staging, and each team is trained on its own screens and data.', w: 'Your key users with TechNext PH · SG trainers',
      t: [['Testing', 6.6, 8], ['Training', 7.6, 9], ['UAT signed', 9.4]] },
    { n: 'Go live', s: 9.65, d: 'Week 10. Final balances loaded, a planned cut-over to production, and the whole team on hand.', w: 'The whole team: SG · PH · VN, with yours',
      t: [['Final data load', 9.7, 10.1], ['Cut-over', 10.1, 10.5], ['Go-live', 10.6]] },
    { n: 'Run', s: 11.05, d: 'After go-live. Hypercare with daily check-ins, then support, month-end help and upgrades from the team that set it up.', w: 'TechNext SG · PH · VN, then the support team',
      t: [['Hypercare', 11.1, 11.6], ['Support', 11.5, 11.9], ['Upgrades', 11.7, 12]] }
  ];
  function gtBuild(s) {
    var rows = $$('.gt-row', s), lane0 = $('.gt-lane', s), pxw = lane0.offsetWidth / 12;
    var cv = document.createElement('canvas').getContext('2d'); cv.font = '700 12px "Plus Jakarta Sans", sans-serif';
    s._items = [];
    PH.forEach(function (ph, r) {
      var lane = $('.gt-lane', rows[r]), lanes = [], placed = [];
      ph.t.forEach(function (t) {
        var ms = t.length === 2, lw = (cv.measureText(t[0]).width + 18) / pxw, a, b, side = 'in';
        if (ms) { a = t[1] - .15; b = t[1] + .3 + lw; if (b > 12) { side = 'left'; a = t[1] - .3 - lw; b = t[1] + .15; } }
        else if (t[2] - t[1] >= lw) { a = t[1]; b = t[2]; }
        else if (t[2] + lw <= 12) { side = 'out'; a = t[1]; b = t[2] + lw; }
        else { side = 'left'; a = t[1] - lw; b = t[2]; }
        var li = 0; while (lanes[li] != null && lanes[li] > a) li++;
        lanes[li] = b; placed.push({ t: t, ms: ms, side: side, lane: li });
      });
      var L = lanes.length, top0 = (70 - (L * 19 + (L - 1) * 6)) / 2;
      placed.forEach(function (p) {
        var el = document.createElement('div'), t = p.t;
        el.className = p.ms ? 'gt-ms' : 'gt-task';
        if (p.side === 'out') el.classList.add('is-out');
        if (p.side === 'left') el.classList.add('is-left');
        el.style.setProperty('--s', t[1]); el.style.setProperty('--t', (top0 + p.lane * 25) + 'px');
        if (p.ms) el.innerHTML = '<i></i><b>' + t[0] + '</b>';
        else { el.style.setProperty('--e', t[2]); el.style.setProperty('--bw', ((t[2] - t[1]) * pxw).toFixed(1) + 'px'); el.innerHTML = '<i></i><b>' + t[0] + '</b>'; }
        lane.appendChild(el);
        s._items.push({ el: el, s: t[1], e: p.ms ? t[1] : t[2], ms: p.ms });
      });
    });
  }
  function gtPaint(s, w) {
    s._w = w;
    $('.gt', s).style.setProperty('--w', w.toFixed(3));
    s._items.forEach(function (it) {
      if (it.ms) it.el.classList.toggle('is-done', w >= it.s);
      else { var f = clamp((w - it.s) / (it.e - it.s), 0, 1); it.el.style.setProperty('--f', f.toFixed(3)); it.el.classList.toggle('is-full', f >= 1); }
    });
    var k = 0; PH.forEach(function (p, i) { if (w >= p.s) k = i; });
    $$('.gt-row', s).forEach(function (r, i) { r.classList.toggle('is-cur', i === k); });
    var wk = Math.min(12, Math.floor(w) + 1);
    $('[data-gt-week]', s).textContent = wk;
    var play = $('.gt-play', s); $('b', play).textContent = w >= 11.05 ? 'After go-live' : 'Week ' + wk;
    play.setAttribute('aria-valuenow', wk); play.setAttribute('aria-valuetext', 'Week ' + wk + ' · ' + PH[k].n);
    if (s._k !== k) {
      s._k = k;
      $('[data-gt-name]', s).textContent = PH[k].n; $('[data-gt-desc]', s).textContent = PH[k].d; $('[data-gt-who]', s).textContent = PH[k].w;
    }
  }
  Deck.on('erp', {
    init: function (s) { gtBuild(s); gtPaint(s, 12); },
    settle: function (s) { gtPaint(s, 12); },
    enter: function (ctx, s) {
      var body = $('.gt-body', s), play = $('.gt-play', s), lane = $('.gt-lane', s), user = false, drag = false;
      gtPaint(s, 0);
      ctx.after(700, function () { if (!user) ctx.tween(14000, function (e) { if (!user) gtPaint(s, 12 * e); }, 'lin'); });
      function fromX(e) { var r = lane.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width * 12, 0, 12); }
      ctx.on(body, 'pointerdown', function (e) { user = true; drag = true; body.setPointerCapture(e.pointerId); gtPaint(s, fromX(e)); e.preventDefault(); });
      ctx.on(body, 'pointermove', function (e) { if (drag) gtPaint(s, fromX(e)); });
      ctx.on(body, 'pointerup', function () { drag = false; });
      ctx.on(play, 'keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? .5 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -.5 : 0;
        if (!d) return; user = true; gtPaint(s, clamp((s._w || 0) + d, 0, 12)); e.preventDefault();
      });
    }
  });

  /* ---------------------------------------------------------------- 4 · CRM pipeline */
  var OWN = { web: ['JT', '#3167CA'], wa: ['JT', '#3167CA'], mail: ['JT', '#3167CA'], event: ['MR', '#137A4A'], big: ['AK', '#714B67'] };
  var LEADS = [
    { co: 'Lumen Trading Pte Ltd', t: '20 office chairs', v: 6240, ch: 'web' },
    { co: 'Harbourlight Bistro', t: 'POS for three outlets', v: 18400, ch: 'event', f: 'event' },
    { co: 'Sunbird Clinics', t: 'Inventory and billing', v: 24800, ch: 'mail' },
    { co: 'Riverton Logistics', t: 'Fleet and maintenance', v: 12900, ch: 'wa' },
    { co: 'Maple & Moss Crafts', t: 'Online store', v: 7600, ch: 'web' },
    { co: 'Orchid Lane Wellness', t: 'Memberships and bookings', v: 9800, ch: 'wa' },
    { co: 'Bluestone Builders', t: 'Project costing', v: 31500, ch: 'event' },
    { co: 'Paperkite Studio', t: 'Quotations and CRM', v: 5200, ch: 'mail' },
    { co: 'Copperleaf Foods', t: 'Recipes and purchasing', v: 15700, ch: 'event', f: 'event' },
    { co: 'Northgate Dental', t: 'Appointments and stock', v: 11300, ch: 'web' },
    { co: 'Tidewater Travel', t: 'Bookings and supplier costs', v: 13600, ch: 'mail' },
    { co: 'Greenfield Grocers', t: 'POS and replenishment', v: 22400, ch: 'wa' },
    { co: 'Saltpan Coffee Co.', t: 'Central kitchen and outlets', v: 16800, ch: 'event', f: 'event' },
    { co: 'Quillon Legal', t: 'Timesheets and billing', v: 8900, ch: 'web' },
    { co: 'Everline Fitness', t: 'Memberships and retail', v: 10400, ch: 'wa' },
    { co: 'Ironbark Engineering', t: 'Manufacturing and quality', v: 38200, ch: 'mail' }
  ];
  var CH_ICON = {};
  function ruleOf(l) { return l.v > 20000 ? 'big' : l.ch === 'event' ? 'event' : l.ch === 'wa' ? 'wa' : 'web'; }
  function crmCard(l, s) {
    var r = ruleOf(l), o = OWN[r], el = document.createElement('div');
    el.className = 'crm-card'; el._v = l.v;
    el.innerHTML = '<b>' + l.co + '</b><small>' + l.t + '</small><span class="cr-src">' + (CH_ICON[l.ch] || '') + ({ web: 'Website form', wa: 'WhatsApp', mail: 'Email', event: 'Event' })[l.ch] + '</span>' +
      '<div class="cr-f"><em>' + Deck.money(l.v).replace('.00', '') + '</em><span class="cr-av" style="--c:' + o[1] + '">' + o[0] + '</span></div><span class="cr-so">Quotation → sales order</span>';
    return el;
  }
  Deck.on('crm', {
    init: function (s) {
      $$('.crm-chans span', s).forEach(function (c) { CH_ICON[c.dataset.ch] = c.querySelector('svg').outerHTML; });
    },
    enter: function (ctx, s) {
      var lists = $$('.crm-list', s), board = $('.crm-board', s), rev = $('[data-crm-rev]', s), n = 0, shown = 0;
      lists.forEach(function (l) { l.innerHTML = ''; });
      // a board already in motion
      [[0, 0], [1, 0], [2, 1], [3, 1], [4, 2], [5, 3]].forEach(function (p) { var c = crmCard(LEADS[p[0]], s); if (p[1] === 3) c.classList.add('is-won'); lists[p[1]].appendChild(c); });
      n = 6;
      function counts() {
        var total = 0;
        lists.forEach(function (l) { $('[data-cnt]', l.parentNode).textContent = l.children.length; $$('.crm-card', l).forEach(function (c) { total += c._v; }); });
        var from = shown; shown = total;
        ctx.count(rev, total, { from: from, dur: 900, pre: 'S$' });
      }
      counts();
      function allCards() { return $$('.crm-card', board); }
      // the next sample lead that isn't already on the board
      function nextLead() {
        var onBoard = allCards().map(function (c) { return $('b', c).textContent; });
        for (var i = 0; i < LEADS.length; i++) { var l = LEADS[(n + i) % LEADS.length]; if (onBoard.indexOf(l.co) < 0) { n += i + 1; return l; } }
        n++; return LEADS[n % LEADS.length];
      }
      function arrive(l) {
        var chip = $('[data-ch="' + l.ch + '"]', s), rule = $('[data-rule="' + ruleOf(l) + '"]', s);
        chip.classList.add('is-hot'); ctx.after(1400, function () { chip.classList.remove('is-hot'); });
        var a = Deck.vbox(chip, board), b = Deck.vbox(lists[0], board);
        var fly = document.createElement('span'); fly.className = 'crm-fly'; fly.textContent = l.co; board.appendChild(fly);
        var x0 = a.x, y0 = a.y + a.h + 4, x1 = b.x + 2, y1 = b.y + 2;
        var an = fly.animate([{ transform: 'translate(' + x0 + 'px,' + y0 + 'px)', opacity: 0 }, { transform: 'translate(' + x0 + 'px,' + y0 + 'px)', opacity: 1, offset: .15 },
          { transform: 'translate(' + x1 + 'px,' + y1 + 'px)', opacity: 1, offset: .85 }, { transform: 'translate(' + x1 + 'px,' + y1 + 'px)', opacity: 0 }], { duration: 1200, easing: 'cubic-bezier(.4,0,.2,1)' });
        ctx.after(350, function () { rule.classList.add('is-hit'); ctx.after(1800, function () { rule.classList.remove('is-hit'); }); });
        an.onfinish = function () { fly.remove(); };
        ctx.after(1000, function () {
          if (lists[0].children.length >= 4) advance(lists[0].lastElementChild, 0);
          var card = crmCard(l, s); card.style.opacity = '0';
          flip(allCards(), function () { lists[0].insertBefore(card, lists[0].firstChild); });
          card.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: EASE, fill: 'forwards' }).onfinish = function () { card.style.opacity = ''; };
          counts();
        });
      }
      function advance(card, st) {
        if (!card || st >= 3) return;
        var to = lists[st + 1];
        if (st + 1 === 3 && to.children.length >= 3) {
          var old = to.lastElementChild;
          old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, fill: 'forwards' });
          ctx.after(380, function () { flip(allCards(), function () { old.remove(); }); counts(); });
        } else if (to.children.length >= 4) advance(to.lastElementChild, st + 1);
        flip(allCards(), function () { to.insertBefore(card, to.firstChild); if (st + 1 === 3) card.classList.add('is-won'); });
      }
      var tick = 0;
      ctx.every(2900, function () {
        tick++;
        if (tick % 2) arrive(nextLead());
        else {
          var st = [2, 1, 0][tick % 3], card = lists[st].lastElementChild || lists[0].lastElementChild;
          if (card) advance(card, lists.indexOf(card.parentNode));
          ctx.after(760, counts);
        }
      });
      ctx.on($('.crm-add', s), 'click', function () { arrive(nextLead()); });
      ctx.after(900, function () { arrive(nextLead()); });
    }
  });

  /* ---------------------------------------------------------------- 5 · group */
  var REV = { sg: 182400, ph: 96300, vn: 71800 };
  function gpBars(ctx, s, instant) {
    var on = {}, total = 0, max = Math.max(REV.sg, REV.ph, REV.vn);
    $$('.gp-switch input', s).forEach(function (i) { on[i.dataset.co] = i.checked; });
    $$('.gp-bars div', s).forEach(function (d) {
      var k = d.dataset.co; d.classList.toggle('is-off', !on[k]);
      d.querySelector('i').style.setProperty('--w', on[k] ? REV[k] / max : 0);
      d.querySelector('b').textContent = Deck.money(REV[k]).replace('.00', '');
      if (on[k]) total += REV[k];
    });
    $$('.gp-co', s).forEach(function (c) { c.classList.toggle('is-off', !on[c.dataset.co]); });
    var el = $('[data-gp-total]', s), from = s._tot || 0; s._tot = total;
    if (instant || !ctx) el.textContent = Deck.money(total).replace('.00', '');
    else ctx.count(el, total, { from: from, dur: 800, pre: 'S$' });
  }
  function gpDoc(co, s, icon, txt, st) {
    var d = $('[data-co="' + co + '"] [data-doc]', s), sp = document.createElement('span');
    sp.innerHTML = icon + '<span><b>' + txt + '</b><em>' + st + '</em></span>'; d.appendChild(sp);
    requestAnimationFrame(function () { requestAnimationFrame(function () { sp.classList.add('is-on'); }); });
  }
  Deck.on('group', {
    init: function (s) { gpBars(null, s, true); s._ic = { file: $('.gp-token', s).innerHTML }; },
    enter: function (ctx, s) {
      var btn = $('.gp-run', s), tok = $('.gp-token', s), path = $('#gpSP', s), busy = false;
      gpBars(ctx, s, true);
      $$('[data-doc]', s).forEach(function (d) { d.innerHTML = ''; });
      ctx.on($('.gp-switch', s), 'change', function () { gpBars(ctx, s); });
      function fly() {
        tok.style.opacity = 1;
        return ctx.tween(1500, function (e) { FX.along(path, tok, e, true); tok.style.opacity = e < .08 ? e / .08 : e > .92 ? (1 - e) / .08 : 1; }, 'io');
      }
      async function run() {
        if (busy) return; busy = true; btn.disabled = true;
        $$('[data-doc]', s).forEach(function (d) { d.innerHTML = ''; });
        var I = s._ic.file;
        await ctx.wait(200); gpDoc('sg', s, I, 'S00042 · Sales order', 'To Acme Philippines · confirmed');
        await ctx.wait(700); await fly();
        gpDoc('ph', s, I, 'P00017 · Purchase order', 'Created from S00042 automatically');
        await ctx.wait(1100); gpDoc('sg', s, I, 'INV/2026/00042 · Invoice', 'Posted');
        await ctx.wait(700); await fly();
        gpDoc('ph', s, I, 'BILL/2026/00017 · Vendor bill', 'Created from the invoice automatically');
        await ctx.wait(600); busy = false; btn.disabled = false;
      }
      ctx.on(btn, 'click', run);
      ctx.after(1400, run);
    }
  });

  /* ---------------------------------------------------------------- 6 · customization */
  Deck.on('custom', {
    enter: function (ctx, s) {
      var reqs = $$('.cu-req', s), lvs = $$('.cu-lv', s), ans = $('.cu-ans', s), p = $('[data-cu-a]', s), cur = -1, auto = true;
      reqs.forEach(function (r) { r.classList.remove('is-on', 'is-seen'); }); lvs.forEach(function (l) { l.classList.remove('is-hit'); });
      ans.classList.remove('is-no'); p.textContent = 'Pick a request to see which level of change it earns.';
      function pick(k) {
        cur = k; var r = reqs[k];
        reqs.forEach(function (x) { x.classList.toggle('is-on', x === r); }); r.classList.add('is-seen');
        lvs.forEach(function (l) { l.classList.toggle('is-hit', l.dataset.lv === r.dataset.to); });
        ans.classList.toggle('is-no', r.dataset.to === 'none');
        p.style.opacity = 0; ctx.after(230, function () { p.textContent = r.dataset.a; p.style.opacity = 1; });
      }
      ctx.after(1000, function () { pick(0); });
      ctx.every(4300, function () { if (auto) pick((cur + 1) % reqs.length); });
      ctx.on($('.cu-reqs', s), 'click', function (e) { var r = e.target.closest('.cu-req'); if (r) { auto = false; pick(reqs.indexOf(r)); } });
    }
  });

  /* ---------------------------------------------------------------- 7 · integration */
  var IG = {
    bank: { dir: 'in', batch: 3, every: 5200 }, pay: { dir: 'in', lo: 1400, hi: 2600 }, market: { dir: 'both', lo: 1200, hi: 2300 },
    courier: { dir: 'both', lo: 1600, hi: 2800 }, peppol: { dir: 'out', lo: 2600, hi: 4200 }, bi: { dir: 'out', batch: 4, every: 6400 }, mail: { dir: 'both', lo: 2000, hi: 3600 }
  };
  var CX = 380, CY = 350;
  Deck.on('integrate', {
    init: function (s) {
      var g = $('.ig-links', s);
      s._nodes = {};
      $$('.ig-n', s).forEach(function (n) {
        var a = +n.dataset.a * Math.PI / 180, x = CX + Math.cos(a) * 262, y = CY + Math.sin(a) * 292;
        n.style.setProperty('--x', x.toFixed(1) + 'px'); n.style.setProperty('--y', y.toFixed(1) + 'px');
        var sx = CX + Math.cos(a) * 100, sy = CY + Math.sin(a) * 100;
        var line = FX.svg('path', { d: 'M' + sx.toFixed(1) + ',' + sy.toFixed(1) + ' L' + x.toFixed(1) + ',' + y.toFixed(1), 'class': 'ig-link' }, g);
        var em = document.createElement('em'); em.className = 'ig-retry'; em.textContent = 'Retrying'; n.querySelector('span').appendChild(em);
        s._nodes[n.dataset.n] = { el: n, line: line, a: [sx, sy], b: [x, y], q: [], em: em };
      });
    },
    enter: function (ctx, s) {
      var dotsG = $('.ig-dots', s), core = $('.ig-core', s), dots = [], down = '', stat = { ok: 0, dup: 0 }, delivered = 0, backoff = 1;
      dotsG.innerHTML = '';
      Object.keys(s._nodes).forEach(function (k) { var n = s._nodes[k]; n.q = []; n.el.classList.remove('is-down'); n.line.classList.remove('is-down'); });
      $$('[data-down]', s).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.down === '' ? 'true' : 'false'); });
      function paintStats() {
        $('[data-ig="ok"]', s).textContent = stat.ok;
        var q = 0; Object.keys(s._nodes).forEach(function (k) { q += s._nodes[k].q.length; });
        $('[data-ig="retry"]', s).textContent = q; $('[data-ig="dup"]', s).textContent = stat.dup;
      }
      paintStats();
      function send(k, dir, delay) {
        ctx.after(delay || 0, function () {
          var n = s._nodes[k], out = dir === 'out';
          var el = FX.svg('circle', { r: 6, 'class': 'ig-dot' + (out ? '' : ' in') }, dotsG);
          dots.push({ el: el, n: n, k: k, from: out ? 0 : 1, to: out ? 1 : 0, t0: performance.now(), dur: 1500, out: out });
        });
      }
      function schedule(k) {
        var c = IG[k];
        if (c.batch) {
          var go = function () { for (var i = 0; i < c.batch; i++) send(k, c.dir === 'both' ? (i % 2 ? 'in' : 'out') : c.dir, i * 180); };
          ctx.after(600 + Math.random() * 1800, function () { go(); ctx.every(c.every, go); });
        } else {
          (function next() { ctx.after(c.lo + Math.random() * (c.hi - c.lo), function () { send(k, c.dir === 'both' ? (Math.random() < .5 ? 'in' : 'out') : c.dir); next(); }); })();
        }
      }
      Object.keys(IG).forEach(schedule);
      ctx.frame(function (t, now) {
        for (var i = dots.length - 1; i >= 0; i--) {
          var d = dots[i], n = d.n, p = clamp((now - d.t0) / d.dur, 0, 1), e = Deck.ease.io(p);
          var f = d.from + (d.to - d.from) * e;
          // an outage holds messages halfway; they queue and wait for the retry
          if (down === d.k && !d.q) {
            if ((d.out && f >= .5) || (!d.out && f <= .5)) { d.q = true; n.q.push(d); d.el.setAttribute('class', 'ig-dot q'); paintStats(); }
          }
          if (d.q) {
            var slot = n.q.indexOf(d); f = .5 + (d.out ? -1 : 1) * slot * .045;
            if (down !== d.k) {
              // recovered: continue from the queue, one after another
              n.q.splice(slot, 1); d.q = false; d.from = f; d.t0 = now + slot * 160; d.dur = 900;
              d.el.setAttribute('class', 'ig-dot' + (d.out ? '' : ' in')); paintStats();
            }
          }
          var x = n.a[0] + (n.b[0] - n.a[0]) * f, y = n.a[1] + (n.b[1] - n.a[1]) * f;
          d.el.setAttribute('cx', x.toFixed(1)); d.el.setAttribute('cy', y.toFixed(1));
          if (!d.q && p >= 1) {
            d.el.remove(); dots.splice(i, 1); stat.ok++; delivered++;
            if (!d.out && delivered % 11 === 0) { stat.dup++; core.classList.remove('is-dup'); void core.offsetWidth; core.classList.add('is-dup'); }
            paintStats();
          }
        }
      });
      ctx.every(1000, function () {
        if (!down) return;
        var n = s._nodes[down]; backoff = backoff >= 8 ? 1 : backoff * 2;
        n.em.textContent = 'Retry in ' + backoff + ' s · ' + n.q.length + ' queued';
      });
      ctx.on($('.ig-ctl', s), 'click', function (e) {
        var b = e.target.closest('[data-down]'); if (!b) return;
        $$('[data-down]', s).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (down) { s._nodes[down].el.classList.remove('is-down'); s._nodes[down].line.classList.remove('is-down'); }
        down = b.dataset.down; backoff = 1;
        if (down) { var n = s._nodes[down]; n.el.classList.add('is-down'); n.line.classList.add('is-down'); n.em.textContent = 'Retry in 1 s · 0 queued'; }
      });
    }
  });

  /* ---------------------------------------------------------------- 8 · training and support */
  var ROLES = [
    { app: 'sale', t: 'Quotation to confirmed order', st: ['Create the quotation from the customer record', 'Add products; prices come from the pricelist', 'Send it by email for online signature', 'Confirm: the delivery is created for the warehouse'] },
    { app: 'stock', t: 'Pick, pack and ship an order', st: ["Open today's deliveries", 'Scan each product into the package', 'Validate: stock goes down straight away', 'Create a back-order for anything not shipped'] },
    { app: 'accountant', t: 'Month-end close', st: ['Reconcile bank lines with the matching rules', 'Follow up on overdue invoices', 'Review the balance sheet and the P&L', 'Set the lock date for the month'] },
    { app: 'spreadsheet_dashboard', t: 'Your weekly numbers', st: ['Open the sales dashboard', 'Filter by team, region or product', 'Drill into any figure, down to the record', 'Share the view with your team'] }
  ];
  Deck.on('care', {
    init: function (s) { careGuide(s, 0, true); },
    settle: function (s) { $$('.ca-roles button', s).forEach(function (b, j) { b.setAttribute('aria-pressed', j === 0 ? 'true' : 'false'); }); careGuide(s, 0, true); },
    enter: function (ctx, s) {
      var tabs = $$('.ca-roles button', s), cur = 0, auto = true, run = 0;
      function role(k) {
        cur = k; var my = ++run;
        tabs.forEach(function (b, j) { b.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
        careGuide(s, k, false);
        var lis = $$('.ca-steps li', s);
        lis.forEach(function (li, i) { ctx.after(120 + i * 110, function () { if (my === run) li.classList.add('is-in'); }); });
        lis.forEach(function (li, i) {
          ctx.after(900 + i * 1250, function () { if (my !== run) return; lis.forEach(function (x) { x.classList.remove('is-cur'); }); li.classList.add('is-cur'); });
          ctx.after(900 + i * 1250 + 1000, function () { if (my !== run) return; li.classList.add('is-done'); });
        });
        ctx.after(900 + lis.length * 1250 + 1800, function () { if (my === run && auto) role((k + 1) % ROLES.length); });
      }
      ctx.on($('.ca-roles', s), 'click', function (e) { var b = e.target.closest('button'); if (b) { auto = false; role(tabs.indexOf(b)); } });
      role(0);
      // the ticket
      var steps = $$('.ca-t-steps li', s), st = $('[data-t-st]', s), label = ['New', 'In progress', 'Solved', 'Closed'];
      function ticket() {
        steps.forEach(function (x) { x.classList.remove('is-on'); }); st.textContent = 'New'; st.classList.remove('is-done');
        steps.forEach(function (x, i) { ctx.after(600 + i * 1500, function () { x.classList.add('is-on'); st.textContent = label[i]; st.classList.toggle('is-done', i >= 2); }); });
        ctx.after(600 + steps.length * 1500 + 3500, ticket);
      }
      ticket();
      ctx.after(700, function () {
        ctx.count($('[data-m="closed"]', s), 18, { dur: 1400 }); ctx.count($('[data-m="up"]', s), 3, { dur: 1000 }); ctx.count($('[data-m="chg"]', s), 7, { dur: 1200 });
      });
    }
  });
  function careGuide(s, k, fin) {
    var r = ROLES[k];
    $('[data-g-app]', s).innerHTML = '<img class="oi" src="assets/img/odoo/' + r.app + '.svg" alt="" width="32" height="32">';
    $('[data-g-title]', s).textContent = r.t;
    $('[data-g-steps]', s).innerHTML = r.st.map(function (x, i) { return '<li class="' + (fin ? 'is-in is-done' : '') + '"><i>' + (i + 1) + '</i><span>' + x + '</span></li>'; }).join('');
    if (fin) { $$('.ca-t-steps li', s).forEach(function (x) { x.classList.add('is-on'); }); $('[data-t-st]', s).textContent = 'Closed'; $('[data-t-st]', s).classList.add('is-done');
      $('[data-m="closed"]', s).textContent = 18; $('[data-m="up"]', s).textContent = 3; $('[data-m="chg"]', s).textContent = 7; }
  }

  /* ---------------------------------------------------------------- 9 · AI overview: a task walks the delivery line */
  Deck.on('ai', {
    init: function (s) {
      s.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) Deck.goId(b.dataset.go); });
      var st = $$('.dl-s', s); st.forEach(function (x) { x.classList.add('is-on'); }); $('.dl-svg', s).style.setProperty('--p', 1);
      $('.dl-tok', s).style.transform = 'translate(' + (1300 - 17) + 'px,' + (60 - 17 - 42) + 'px)';
    },
    enter: function (ctx, s) {
      var st = $$('.dl-s', s), xs = st.map(function (x) { return parseFloat(x.style.getPropertyValue('--x')); }), tok = $('.dl-tok', s), svg = $('.dl-svg', s);
      // the task rides just above the line, like a car on a rail
      function at(x) { tok.style.transform = 'translate(' + (x - 17).toFixed(1) + 'px,' + (60 - 17 - 42) + 'px)'; svg.style.setProperty('--p', ((x - 60) / 1240).toFixed(4)); }
      async function loop() {
        st.forEach(function (x) { x.classList.remove('is-on', 'is-wait'); }); tok.style.opacity = 0; at(xs[0]);
        await ctx.tween(400, function (e) { tok.style.opacity = e; });
        st[0].classList.add('is-on');
        for (var i = 1; i < xs.length; i++) {
          await ctx.wait(700);
          var a = xs[i - 1], b = xs[i];
          await ctx.tween(1300, function (e) { at(a + (b - a) * e); }, 'io');
          if (st[i].classList.contains('dl-s--gate')) { st[i].classList.add('is-wait'); await ctx.wait(1700); st[i].classList.remove('is-wait'); }
          st[i].classList.add('is-on');
        }
        await ctx.wait(2600);
        await ctx.tween(500, function (e) { tok.style.opacity = 1 - e; });
        loop();
      }
      ctx.after(700, loop);
    }
  });

  /* ---------------------------------------------------------------- 10 · RAG */
  Deck.on('rag', {
    init: function (s) { AIDemo.render($('.dm-host', s), 'rag'); $('.rg-qs button', s).setAttribute('aria-pressed', 'true'); },
    enter: function (ctx, s) {
      var host = $('.dm-host', s), btns = $$('.rg-qs button', s), how = $$('.rg-how li', s), cur = 0;
      function mark(ph, done) { how.forEach(function (li) { if (li.dataset.ph === ph) { li.classList.toggle('is-on', !done); li.classList.toggle('is-done', !!done); } }); }
      function run(qi) {
        cur = qi;
        btns.forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.qi === qi ? 'true' : 'false'); });
        how.forEach(function (li) { li.classList.remove('is-on', 'is-done'); });
        AIDemo.play(host, 'rag', ctx, { qi: qi, hold: 3400, on: function (ph) {
          if (cur !== qi) return;
          if (ph === 'search') mark('search');
          if (ph === 'answer') { mark('search', 1); mark('answer'); }
          if (ph === 'cite') { mark('answer', 1); mark('cite'); }
          if (ph === 'done') mark('cite', 1);
        } }).then(function (r) { if (r !== AIDemo.STOP && ctx.alive && cur === qi) run((qi + 1) % btns.length); });
      }
      ctx.on($('.rg-qs', s), 'click', function (e) { var b = e.target.closest('button'); if (b) run(+b.dataset.qi); });
      ctx.after(500, function () { run(0); });
    }
  });

  /* ---------------------------------------------------------------- 11 · AI inside Odoo */
  Deck.on('aiodoo', {
    init: function (s) { AIDemo.render($('.dm-host', s), 'odoo'); },
    enter: function (ctx, s) {
      var host = $('.dm-host', s);
      (function loop() { AIDemo.play(host, 'odoo', ctx, { approveAfter: 4500, hold: 3600 }).then(function (r) { if (r !== AIDemo.STOP && ctx.alive) loop(); }); })();
    }
  });

  /* ---------------------------------------------------------------- 12 · agents + chatbot, side by side */
  Deck.on('agents', {
    init: function (s) { $$('.ag-host', s).forEach(function (h) { AIDemo.render(h, h.dataset.kind); }); },
    enter: function (ctx, s) {
      $$('.ag-host', s).forEach(function (h, i) {
        ctx.after(400 + i * 700, function loop() { AIDemo.play(h, h.dataset.kind, ctx, { hold: 3600 }).then(function (r) { if (r !== AIDemo.STOP && ctx.alive) loop(); }); });
      });
    }
  });

  /* ---------------------------------------------------------------- 13 · marketing */
  var POSTS = { 1: 'li', 3: 'ig', 5: 'li', 6: 'fb', 8: 'ig', 10: 'li', 13: 'fb', 15: 'li', 17: 'ig', 20: 'li', 22: 'ig', 24: 'fb', 27: 'li', 29: 'ig', 31: 'li' };
  function mkCal(s) {
    var g = $('.mk-grid', s), h = '';
    for (var i = 0; i < 35; i++) {
      var d = i - 2, o = d < 1 || d > 31, day = o ? (d < 1 ? 30 + d : d - 31) : d;
      h += '<span class="' + (o ? 'o' : '') + '">' + day + (!o && POSTS[d] ? '<i class="mk-post ' + POSTS[d] + '"></i>' : '') + '</span>';
    }
    g.innerHTML = h;
  }
  Deck.on('marketing', {
    init: function (s) {
      mkCal(s);
      $$('.mk-p', s)[0].classList.add('is-on');
      $$('.mk-site>*, .mk-list li, .mk-post, .mk-flow li, .mk-brand .card', s).forEach(function (x) { x.classList.add('is-on'); });
    },
    enter: function (ctx, s) {
      var tabs = $$('.mk-tabs button', s), panes = $$('.mk-p', s), cur = 0, auto = true, run = 0;
      function tab(k) {
        cur = k; var my = ++run;
        tabs.forEach(function (b, j) { b.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
        panes.forEach(function (p, j) { p.classList.toggle('is-on', j === k); });
        var p = panes[k], seq = [];
        if (k === 0) seq = [[$$('.mk-site>*', p), 330, 200], [$$('.mk-list li', p), 700, 700]];
        if (k === 1) seq = [[$$('.mk-post', p), 150, 300], [$$('.mk-flow li', p), 800, 400]];
        if (k === 2) seq = [[$$('.mk-brand .card', p), 180, 150]];
        seq.forEach(function (q) { q[0].forEach(function (x) { x.classList.remove('is-on'); }); q[0].forEach(function (x, i) { ctx.after(q[2] + i * q[1], function () { if (my === run) x.classList.add('is-on'); }); }); });
        ctx.after(7600, function () { if (my === run && auto) tab((k + 1) % tabs.length); });
      }
      ctx.on($('.mk-tabs', s), 'click', function (e) { var b = e.target.closest('button'); if (b) { auto = false; tab(tabs.indexOf(b)); } });
      tab(0);
    }
  });

  /* ---------------------------------------------------------------- 14 · pricing: the quotation writes itself */
  Deck.on('pricing', {
    init: function (s) { $$('.pc-lines li', s).forEach(function (x) { x.classList.add('is-on'); }); },
    settle: function (s) { $$('.pc-lines li', s).forEach(function (x) { x.classList.add('is-on'); }); },
    enter: function (ctx, s) {
      var lis = $$('.pc-lines li', s);
      lis.forEach(function (x) { x.classList.remove('is-on'); });
      lis.forEach(function (x, i) { ctx.after(700 + i * 260, function () { x.classList.add('is-on'); }); });
    }
  });
})();

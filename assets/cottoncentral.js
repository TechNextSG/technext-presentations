/* Cotton Central, Inc.: BIR e-invoicing in Odoo. Slide behaviour. Every order, customer, TIN and amount in the demos is sample data,
   labelled on its slide. The deck follows ONE sample order (INV/2026/01482, Shopee, 1,400.00) from the feed to the credit note.
   Every slide whose finished state comes from JS has a settle hook (overview, print, PDF). */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  function num(n) { return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function peso(n) { return '₱' + num(n); }
  function swap(el) { el.classList.remove('cc-swap'); void el.offsetWidth; el.classList.add('cc-swap'); }
  function stepText(spec, n) { var out = ''; spec.split('|').forEach(function (p) { var i = p.indexOf(':'); if (+p.slice(0, i) <= n) out = p.slice(i + 1); }); return out; }

  // jump links: the cover agenda
  stage.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]'); if (!a) return;
    e.preventDefault(); Deck.goId(a.dataset.go);
  });

  /* ---------------------------------------------------------------- 2 · what we heard: four guesses, click cycles true / not us / clear */
  Deck.on('heard', {
    init: function (s) {
      var TAG = { yes: 'True', no: 'Not us' };
      $('.cc-gs-row', s).addEventListener('click', function (e) {
        var b = e.target.closest('.cc-hy'); if (!b) return;
        var v = b.dataset.s || '', n = v === '' ? 'yes' : v === 'yes' ? 'no' : '';
        if (n) b.dataset.s = n; else b.removeAttribute('data-s');
        b.setAttribute('aria-pressed', n ? 'true' : 'false');
        $('em', b).textContent = TAG[n] || '';
      });
    }
  });

  /* ---------------------------------------------------------------- 3 · the rules: the 31 Dec node is selected by default */
  var RULE = {
    rr: ['RR 26-2025.', 'Sets the date: covered taxpayers issue compliant e-invoices on or before 31 December 2026.'],
    rmc: ['RMC 98-2026.', 'Issued 22 September 2026, it sets the working rules: the permit, the certification, corrections and downtime.'],
    pti: ['Permit to Issue.', 'A covered business needs its PTI before issuing any e-invoice. Branches on different systems may need their own.'],
    dl: ['31 Dec 2026.', 'From this date, covered taxpayers issue compliant e-invoices.'],
    cert: ['EIS Certification.', 'Completed within six months of the PTI: the system sends the required sales data to the BIR\'s EIS.']
  };
  var DEADLINE = new Date(2026, 11, 31);
  function daysLeft() { var t = new Date(); t.setHours(0, 0, 0, 0); return Math.max(0, Math.round((DEADLINE - t) / 864e5)); }
  Deck.on('rules', {
    init: function (s) {
      s._show = function (k, quiet) {
        var x = $('.cc-rl-x', s), node;
        $$('.cc-tl-n', s).forEach(function (n) { var on = n.dataset.k === k; n.classList.toggle('is-on', on); n.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) node = n; });
        $('.cc-rl-t', s).textContent = RULE[k][0]; $('.cc-rl-d', s).textContent = RULE[k][1];
        x.dataset.k = k; x.style.setProperty('--cxp', Math.round((x.offsetWidth || 1360) * parseFloat(node.style.getPropertyValue('--x')) / 100) + 'px');
        if (!quiet) swap(x);
      };
      $('.cc-tl', s).addEventListener('click', function (e) { var n = e.target.closest('.cc-tl-n'); if (n) s._show(n.dataset.k); });
      $('.cc-days-n', s).textContent = daysLeft();
      s._show('dl', true);
    },
    enter: function (ctx, s) {
      s._show('dl', true);
      ctx.count($('.cc-days-n', s), daysLeft(), { from: daysLeft() + 120, dur: 1100 });
    },
    settle: function (s) { s._show('dl', true); $('.cc-days-n', s).textContent = daysLeft(); }
  });

  /* ---------------------------------------------------------------- 4 · five shops, one set of books (sample orders) */
  var CH = {
    web: ['cottoncentral.com', '#3167CA', 'Your shop can move to Odoo eCommerce, where a paid order becomes an invoice in the same database, or keep its platform and send orders over. We compare both.'],
    shp: ['Shopee', '#EB6834', 'Not a standard Odoo app: orders come in through a third-party connector or a daily import, with fees and payouts booked against them.'],
    lzd: ['Lazada', '#1E4691', 'Not a standard Odoo app: a third-party connector or a daily import. Who invoices the buyer, you or the platform, is for your accountant to confirm.'],
    eda: ['edamama', '#1BAF7A', 'We check what edamama gives you for orders and payouts, then choose a connector or an import into Odoo.'],
    tik: ['TikTok', '#1F1F3D', 'Not a standard Odoo app: a third-party connector or a daily import, tested with a sample week of your TikTok Shop orders.']
  };
  var HOW = ['How orders get into Odoo.', 'Your web shop can run on Odoo eCommerce, or send orders over. Marketplaces come in through a connector or a daily import. We test which works for each channel.'];
  // the first order is the deck's one order: INV/2026/01482, Shopee, Sample buyer 01, 1,400.00
  var ORDERS = [['shp', 'Sample buyer 01', 1400], ['web', 'Sample buyer 02', 865], ['lzd', 'Sample buyer 03', 2150], ['tik', 'Sample buyer 04', 499],
    ['shp', 'Sample buyer 05', 1120], ['eda', 'Sample buyer 06', 1785], ['web', 'Sample buyer 07', 640]];
  var FIRST = 1482;
  function rowHtml(i, isNew) {
    var o = ORDERS[i], c = CH[o[0]];
    return '<div class="cc-od-r' + (isNew ? ' is-new' : '') + '"><b>INV/2026/' + String(FIRST + i).padStart(5, '0') + '</b><span class="cc-od-s" style="--c:' + c[1] + '">' + c[0].replace('cottoncentral.com', 'Web shop') + '</span><span>' + o[1] + '</span><span class="n">' + peso(o[2]) + '</span><span class="cc-od-p">Posted</span></div>';
  }
  function paintOrders(s, n, isNew) {
    var rows = [], counts = { web: 0, shp: 0, lzd: 0, eda: 0, tik: 0 }, tot = 0;
    for (var i = 0; i < n; i++) { counts[ORDERS[i][0]]++; tot += ORDERS[i][2]; rows.push(rowHtml(i, isNew && i === n - 1)); }
    var box = $('.cc-od-rows', s);
    if (isNew && n && box.children.length === n - 1) { var old = $('.is-new', box); if (old) old.classList.remove('is-new'); box.insertAdjacentHTML('beforeend', rows[n - 1]); }
    else box.innerHTML = rows.join('');
    $$('.cc-s', s).forEach(function (b) { var k = counts[b.dataset.c]; $('.cc-s-n', b).textContent = k + (k === 1 ? ' order' : ' orders'); });
    $('.cc-od-c', s).textContent = n; $('.cc-od-t', s).textContent = peso(tot);
    if (isNew && n) { var b = $('.cc-s[data-c="' + ORDERS[n - 1][0] + '"]', s); b.classList.remove('is-ping'); void b.offsetWidth; b.classList.add('is-ping'); }
  }
  Deck.on('channels', {
    init: function (s) {
      var btn = $('.cc-play', s);
      s._stop = function () { s._run = (s._run || 0) + 1; if (s._tid) { clearInterval(s._tid); s._tid = 0; } btn.classList.remove('is-on'); btn.setAttribute('aria-pressed', 'false'); $('span', btn).textContent = 'Replay the day'; };
      s._play = function () {
        s._stop();
        var run = s._run, n = 0;
        if (Deck.reduce || !s._ctx || !s._ctx.alive) { paintOrders(s, ORDERS.length); return; }
        btn.classList.add('is-on'); btn.setAttribute('aria-pressed', 'true'); $('span', btn).textContent = 'Replaying…';
        paintOrders(s, 0);
        s._tid = s._ctx.every(650, function () {
          if (s._run !== run) return;
          n++; paintOrders(s, n, true);
          if (n >= ORDERS.length) s._stop();
        });
      };
      s._how = function (k, quiet) {
        $$('.cc-s', s).forEach(function (b) { var on = b.dataset.c === k; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        $('.cc-how-t', s).textContent = k ? CH[k][0] + '.' : HOW[0];
        $('.cc-how-x', s).textContent = k ? CH[k][2] : HOW[1];
        if (!quiet) swap($('.cc-how', s));
      };
      btn.addEventListener('click', function () { if (btn.classList.contains('is-on')) { s._stop(); paintOrders(s, ORDERS.length); } else s._play(); });
      $('.cc-src', s).addEventListener('click', function (e) { var b = e.target.closest('.cc-s'); if (b) s._how(b.dataset.c); });
    },
    enter: function (ctx, s) {
      s._ctx = ctx; s._stop(); s._how(null, true);
      // the day plays on arrival (26 Oct): orders arrive one by one from the five shops; reduced motion and TV show the finished day
      if (Deck.reduce || Deck.tv) paintOrders(s, ORDERS.length); else { paintOrders(s, 0); ctx.after(700, function () { s._play(); }); }
    },
    leave: function (s) { s._stop(); },
    settle: function (s) { s._stop(); s._how(null, true); paintOrders(s, ORDERS.length); }
  });

  /* ---------------------------------------------------------------- 5 · one invoice, start to finish */
  var NO = 'INV/2026/01482';
  function shake(s) { var m = $('.cc-lockmsg', s); m.classList.remove('is-shake'); void m.offsetWidth; m.classList.add('is-shake'); }
  function paintInv(s, n) {
    var doc = $('.cc-doc', s); doc.dataset.s = n;
    $$('.cc-rail button', s).forEach(function (b) { var k = +b.dataset.k; b.classList.toggle('is-on', k === n); b.classList.toggle('is-done', k < n); b.setAttribute('aria-pressed', k === n ? 'true' : 'false'); });
    $('.cc-doc-no', s).textContent = n ? NO : 'Draft invoice';
    $('.cc-doc-st', s).textContent = n ? 'Posted' : 'Draft';
    $('.cc-doc-url', s).textContent = 'Accounting · Invoices · ' + (n ? NO : 'Draft');
    $('.cc-lockmsg', s).classList.toggle('is-on', n >= 1);
    $('.cc-cn', s).classList.toggle('is-on', n >= 3);
    $('.cc-b-edit', s).classList.toggle('is-on', n >= 1);
    var w = $('.cc-why-x', s), t = stepText(w.dataset.t, n);
    if (w.textContent !== t) { w.textContent = t; swap(w); }
  }
  /* the hand-off (26 Oct): arriving on Draft, the table starts empty, each line lifts off the Source field (the Shopee order) and lands as
     its row, and the totals add up line by line (the amounts are VAT-inclusive: 1,400.00 = 1,250.00 + 150.00). Coordinates are measured
     inside the slide's own layout (offsets), so the deck's scale and phone rotation do not matter. Any step, leave or settle finishes it. */
  var LINES = [900, 500], TOT = 1400;
  function live() { return !(Deck.reduce || Deck.tv); }
  function sums(s, tot) { var vs = Math.round(tot / 1.12 * 100) / 100, b = $$('.cc-sum b', s); b[0].textContent = peso(vs); b[1].textContent = peso(Math.round((tot - vs) * 100) / 100); b[2].textContent = peso(tot); }
  function xy(el, top) { var x = 0, y = 0; while (el && el !== top) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return { x: x, y: y }; }
  function handDone(s) {
    s._hand = (s._hand || 0) + 1;
    $$('.cc-fly', s).forEach(function (g) { g.remove(); });
    $$('.cc-lines tbody tr', s).forEach(function (r) { r.style.opacity = ''; r.style.transform = ''; r.classList.remove('is-land'); });
    $('.cc-src-o', s).classList.remove('is-send');
    sums(s, TOT);
  }
  function lin(p) { return p; }
  function tween(ctx, ms, fn, ease) { return ctx.tween(ms, fn, ease || lin); }   // the engine's frame loop: cancelled with the slide
  function eio(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function eout(t) { return 1 - Math.pow(1 - t, 3); }
  function handOff(s, ctx) {
    handDone(s);
    if (!live()) return;
    var tok = s._hand, hero = $('.cc-hero--inv', s), src = $('.cc-src-o', s), rows = $$('.cc-lines tbody tr', s), run = 0;
    function ok() { if (s._hand === tok && ctx.alive && !live()) handDone(s); return s._hand === tok && ctx.alive; }
    rows.forEach(function (r) { r.style.opacity = 0; r.style.transform = 'translateX(-14px)'; });
    sums(s, 0);
    ctx.after(950, function () { if (ok()) src.classList.add('is-send'); });
    rows.forEach(function (row, i) {
      ctx.after(1150 + i * 380, function () {
        if (!ok()) return;
        var a = xy(src, hero), b = xy(row, hero), g = document.createElement('div');
        g.className = 'cc-fly'; g.textContent = $$('td', row)[1].textContent + ' × ' + $('td', row).textContent; hero.appendChild(g);
        var x0 = a.x - 10, y0 = a.y - 6, x1 = b.x + 2, y1 = b.y - 3, cx = x0, cy = y1;   // down from the Source field, then left along its own (still empty) row
        tween(ctx, 700, function (p) {
          if (!ok()) return;
          var u = 1 - p, x = u * u * x0 + 2 * u * p * cx + p * p * x1, y = u * u * y0 + 2 * u * p * cy + p * p * y1;
          g.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
          g.style.opacity = p < .8 ? 1 : Math.max(0, (1 - p) / .2);
        }, eio);
        ctx.after(580, function () {
          if (!ok()) return;
          row.classList.add('is-land');
          tween(ctx, 420, function (p) { if (ok()) { row.style.opacity = Math.min(1, p * 2); row.style.transform = 'translateX(' + (-14 * (1 - p)).toFixed(2) + 'px)'; } }, eout);
          var from = run; run += LINES[i];
          tween(ctx, 420, function (p) { if (ok()) sums(s, Math.round((from + (run - from) * p) * 100) / 100); }, eout);
          if (i === rows.length - 1) ctx.after(460, function () { if (ok()) { sums(s, TOT); src.classList.remove('is-send'); } });
        });
        ctx.after(720, function () { g.remove(); });
      });
    });
  }
  // Confirm: the window leans in a touch while the stamp lands, then settles (Web Animations: no CSS transition to fight the deck's entrance)
  function lean(s) {
    var d = $('.cc-doc', s); if (!live() || !d.animate) return;
    d.animate([{ scale: '1' }, { scale: '1.03', offset: .45 }, { scale: '1' }], { duration: 1100, easing: 'cubic-bezier(.65,0,.35,1)' });
  }
  Deck.on('invoice', {
    init: function (s) {
      $('.cc-rail', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (b) Deck.go(Deck.index, +b.dataset.k); });
      $('.cc-b-edit', s).addEventListener('click', function () { shake(s); });
    },
    step: function (n, ctx, s, first) {
      var was = s._n == null ? -1 : s._n; s._n = n;
      handDone(s); paintInv(s, n);
      if (first && n === 0) handOff(s, ctx);
      else if (n === 1 && was === 0) lean(s);
    },
    leave: function (s) { handDone(s); s._n = null; },
    settle: function (s) { handDone(s); paintInv(s, 3); $('.cc-lockmsg', s).classList.remove('is-shake'); $('.cc-why-x', s).classList.remove('cc-swap'); }
  });

  /* ---------------------------------------------------------------- 6 · what Odoo does, what we check: click a list heading to focus it */
  Deck.on('odoo', {
    init: function (s) {
      var grid = $('.cc-grid', s), eis = $('.cc-g-eis', s);
      s._show = function (v) {
        grid.dataset.hl = v;
        $$('.cc-g-h', s).forEach(function (h) { h.setAttribute('aria-pressed', h.dataset.c === v ? 'true' : 'false'); });
      };
      $('.cc-g-hd', s).addEventListener('click', function (e) {
        var h = e.target.closest('.cc-g-h'); if (!h) return;
        s._show(grid.dataset.hl === h.dataset.c ? '' : h.dataset.c);
      });
      function pulse() { eis.classList.remove('is-pulse'); void eis.offsetWidth; eis.classList.add('is-pulse'); }
      eis.addEventListener('click', pulse);
      eis.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pulse(); } });
    },
    enter: function (ctx, s) { s._show(''); },
    settle: function (s) { s._show(''); $('.cc-g-eis', s).classList.remove('is-pulse'); }
  });

  /* ---------------------------------------------------------------- 7 · questions (marks kept for this tab) */
  var KEY = 'cc-questions', QTAG = { ok: 'Answered', fu: 'Follow up' };
  function load() { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(m) { try { sessionStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { } }
  function paintQ(s) {
    var m = load(), a = 0, f = 0;
    $$('.cc-qg button', s).forEach(function (b) {
      var v = m[b.dataset.q] || ''; if (v) b.dataset.s = v; else b.removeAttribute('data-s');
      b.setAttribute('aria-pressed', v ? 'true' : 'false');
      $('em', b).textContent = QTAG[v] || '';
      if (v === 'ok') a++; if (v === 'fu') f++;
    });
    if (a + f) $('.cc-q-hint', s).classList.add('is-on');
    $('.cc-q-a', s).textContent = a; $('.cc-q-f', s).textContent = f;
  }
  function followText(s) {
    var m = load(), out = ['Cotton Central · follow-ups'];
    $$('.cc-qg button', s).forEach(function (b) { if (m[b.dataset.q] === 'fu') out.push(b.dataset.q + '. ' + $('span', b).textContent); });
    if (out.length === 1) out.push('(none marked yet)');
    return out.join('\n');
  }
  Deck.on('questions', {
    init: function (s) {
      $('.cc-qs', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-q]'); if (!b) return;
        var m = load(), v = m[b.dataset.q] || '';
        m[b.dataset.q] = v === '' ? 'ok' : v === 'ok' ? 'fu' : '';
        if (!m[b.dataset.q]) delete m[b.dataset.q];
        save(m); paintQ(s); $('.cc-q-hint', s).classList.add('is-on');
      });
      var btn = $('.cc-q-copy', s), ta = $('.cc-q-ta', s);
      function reset() { $('span', btn).textContent = 'Copy follow-ups'; }
      function done(msg) {
        $('span', btn).textContent = msg;
        if (s._lbl) { clearTimeout(s._lbl); s._lbl = 0; }
        s._lbl = (s._ctx && s._ctx.alive) ? s._ctx.after(1800, reset) : setTimeout(reset, 1800);
      }
      function fallback(t) {
        ta.hidden = false; ta.value = t; ta.focus(); ta.select();
        var ok = false; try { ok = document.execCommand('copy'); } catch (e) { }
        if (ok) { ta.hidden = true; done('Copied'); } else done('Select and copy');
      }
      btn.addEventListener('click', function () {
        var t = followText(s);
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { done('Copied'); }, function () { fallback(t); });
        else fallback(t);
      });
      ta.addEventListener('blur', function () { ta.hidden = true; });
    },
    enter: function (ctx, s) { s._ctx = ctx; paintQ(s); },
    settle: function (s) { if (Deck.print) { $$('.cc-qg button', s).forEach(function (b) { b.removeAttribute('data-s'); $('em', b).textContent = ''; }); } else paintQ(s); }
  });
})();

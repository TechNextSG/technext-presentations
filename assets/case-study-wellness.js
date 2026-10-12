/* Industry case study · Health & Wellness. Slide behaviour. Tidemere Studios is a sample company and every figure is
   sample data, labelled on its slide. Every slide whose finished state comes from JS has a settle hook. */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  function sgd(n, dec) { return 'S$' + n.toLocaleString('en-SG', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 }); }
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

  /* ---------------------------------------------------------------- 2 · collected vs earned */
  Deck.on('client', {
    init: function (s) {
      s._set = seg($('.hw-cash-seg', s), function (v) {
        $('.hw-bars', s).dataset.mode = v;
        $$('.hw-bars b', s).forEach(function (b) { b.textContent = v === 'earn' ? b.dataset.b : b.dataset.a; });
      });
    },
    enter: function (ctx, s) {
      s._set('in');
      ctx.after(2200, function () { s._set('earn'); });
    },
    settle: function (s) { s._set('earn'); }
  });

  /* ---------------------------------------------------------------- 3 · one 10-pack, two stories */
  // per step: credits left, expired?, status, earned by month (Mar..Sep), books S$, earned S$, owed text
  var LG = [
    [0, 0, 'not bought yet', [0, 0, 0, 0, 0, 0, 0], 0, 0, 0],
    [10, 0, 'bought 3 Mar', [0, 0, 0, 0, 0, 0, 0], 320, 0, 320],
    [7, 0, '3 used in March', [96, 0, 0, 0, 0, 0, 0], 320, 96, 224],
    [4, 0, '1 lost to a no-show', [96, 96, 0, 0, 0, 0, 0], 320, 192, 128],
    [2, 0, 'two left, three months idle', [96, 96, 0, 64, 0, 0, 0], 320, 256, 64],
    [2, 1, 'expired · extended on WhatsApp?', [96, 96, 0, 64, 0, 0, -64], 320, 256, -1],
    [2, 1, 'expired · extended on WhatsApp?', [96, 96, 0, 64, 0, 0, -64], 320, 256, -1]
  ];
  var MAXH = 176 / 320;
  function paintLedger(s, n) {
    var d = LG[n];
    $$('.hw-dots i', s).forEach(function (i, k) {
      i.classList.toggle('is-on', k < d[0] && !d[1]);
      i.classList.toggle('is-x', k < d[0] && !!d[1]);
    });
    $('.hw-left', s).textContent = d[0];
    $('.hw-card-s', s).textContent = d[2];
    $$('.hw-ev li', s).forEach(function (li) { var k = +li.dataset.k; li.classList.toggle('is-on', k <= n); li.classList.toggle('is-now', k === n); });
    $$('.hw-bk', s).forEach(function (i) { i.style.height = (+i.dataset.m === 0 && n >= 1 ? 320 * MAXH : 0) + 'px'; });
    $$('.hw-er', s).forEach(function (i) {
      var v = d[3][+i.dataset.m];
      i.classList.toggle('is-q', v < 0);
      i.style.height = Math.abs(v) * MAXH + 'px';
    });
    $('.hw-m-bk', s).textContent = sgd(d[4]);
    $('.hw-m-er', s).textContent = sgd(d[5]);
    $('.hw-m-ow', s).textContent = d[6] < 0 ? 'S$64 ?' : sgd(d[6]);
    $('.hw-m-ows', s).textContent = d[6] < 0 ? 'owed or earned? unclear' : 'to this member';
    $('.hw-lg-say', s).classList.toggle('is-on', n >= 6);
  }
  Deck.on('ledger', {
    step: function (n, ctx, s) { paintLedger(s, Math.min(n, 6)); },
    settle: function (s) { paintLedger(s, 6); }
  });

  /* ---------------------------------------------------------------- 4 · four leaks: the counter */
  var LEAK = [0, 0, 5954, 1610, 990];
  function leakTotal(n) { var t = 0; for (var i = 1; i <= n; i++) t += LEAK[i]; return t; }
  function paintLeaks(s, n, ctx) {
    $$('.hw-lc', s).forEach(function (c) { var k = +c.dataset.k; c.classList.toggle('is-on', k <= n); c.classList.toggle('is-now', k === n); });
    var to = leakTotal(n), el = $('.hw-tot-n', s);
    if (ctx && !Deck.reduce) ctx.count(el, to, { from: s._tot || 0, dur: 700, pre: 'S$' });
    else el.textContent = sgd(to);
    s._tot = to;
  }
  Deck.on('leaks', {
    enter: function (ctx, s) { s._tot = 0; },
    step: function (n, ctx, s) { paintLeaks(s, Math.min(n, 4), ctx); },
    settle: function (s) { paintLeaks(s, 4, null); }
  });

  /* ---------------------------------------------------------------- 5 · one member record: smart buttons */
  var APPS = {
    sub: ['Subscriptions', 'Monthly Unlimited, renewed on the 1st', 'A recurring plan charges her saved card monthly. A declined charge tags it Payment Failure, so it is on the desk’s list that morning; Automatic Closing ends it if unpaid.', 'Card billing inside the booking app, failures found weeks later'],
    ew: ['Discount & Loyalty', 'Her 10-pack, as an eWallet balance', 'The pack is an eWallet top-up: S$320 in, S$32 out at each check-in, with an expiration date. Odoo has no “class credit” object: credits are dollars.', 'Credits as a bare number in the booking app'],
    apt: ['Appointments', 'Classes and treatments, booked online', 'Every studio and spa room is a resource. Classes stop at 12 places (Manage Capacities); treatments use only rooms set up for them.', 'The booking app and the spa’s phone diary'],
    shop: ['eCommerce', 'Packs, memberships and mats, online', 'The website shop sells packs, memberships and mats from the same product list and prices as the desk.', 'A separate shop with its own price list'],
    pos: ['Point of Sale', 'Check-in and retail at the desk', 'One till per studio and the spa: check-ins redeem the eWallet; mats, skincare and gift cards sell on the same screen.', 'A retail till and a check-in tablet that never met'],
    inv: ['Accounting', 'Every dollar she has paid', 'Her membership, packs and treatments, each posted to its own account: membership to revenue, packs to credits owed.', 'A bookkeeper re-keying card payouts as sales'],
    plan: ['Planning', 'Instructors and therapists', 'Each class taught is a shift, so the monthly count per instructor is the basis for the bill. Therapists’ shifts sit beside the rooms.', 'Paper sign-in sheets and a roster chat'],
    mkt: ['Marketing Automation', 'Reminders before a pack lapses', 'A campaign emails members 30 and 7 days before their eWallet expires, with a link to book. Email Marketing sends the newsletter.', 'Expiry found at the desk, by an upset member'],
    acc: ['Accounting', 'What the business owes, every day', 'Account 2150 shows open packs in dollars. Annual memberships paid up front use deferred revenue, spread month by month between start and end dates.', 'A balance sheet with no line for credits owed']
  };
  Deck.on('apps', {
    init: function (s) {
      s._pick = function (k) {
        var a = APPS[k], btn = $('[data-k="' + k + '"]', s);
        $$('.hw-sb button, .hw-bd button', s).forEach(function (b) { b.classList.toggle('is-on', b === btn); });
        $('.fb-ap-i', s).innerHTML = $('.oi', btn).outerHTML;
        $('.fb-ap-place', s).textContent = a[0];
        $('.fb-ap-t', s).textContent = a[1]; $('.fb-ap-d', s).textContent = a[2]; $('.fb-ap-r', s).textContent = a[3];
        swap($('.fb-ap', s));
      };
      $('.hw-rec-b', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]'); if (!b) return;
        s._held = true; s._pick(b.dataset.k);
      });
    },
    enter: function (ctx, s) {
      s._held = false;
      var keys = Object.keys(APPS), i = 0;
      ctx.after(1400, function () {
        if (!s._held) s._pick(keys[0]);
        ctx.every(3600, function () { if (s._held) return; i = (i + 1) % keys.length; s._pick(keys[i]); });
      });
    },
    settle: function (s) { s._pick('ew'); }
  });

  /* ---------------------------------------------------------------- 6 · workflow 1: the pack on the books */
  var W1 = [
    ['Website · Shop · Orders', 'S00418', 'Paid', [['Customer', 'M-20418'], ['Product', 'Reformer 10-pack (eWallet top-up) · S$320.00'], ['Payment', 'Card, paid online'], ['Created from', 'Website shop checkout']], 0, 0],
    ['Sales · Discount & Loyalty · eWallet', 'eWallet · M-20418', 'S$320.00', [['Program', 'Class packs (eWallet)'], ['Balance', 'S$320.00 · 10 classes at S$32'], ['Expiration Date', '03/09/2026'], ['Created from', 'S00418']], 0, 0],
    ['Accounting · Customer Invoices', 'INV/2026/00418', 'Paid', [['Line', 'Reformer 10-pack · S$320.00'], ['Account', '2150 Class credits owed (liability)'], ['Effect', 'S$320.00 owed, S$0.00 earned'], ['Created from', 'S00418']], 320, 0],
    ['Appointments · Reformer · Studio 2', 'Reformer · Thu 07:00', 'Booked', [['Resource', 'Studio 2, Tanjong Pagar'], ['Capacity', '7 of 12 places · Manage Capacities'], ['Instructor', 'Planning shift for this class'], ['Created from', 'Online booking page']], 320, 0],
    ['Point of Sale · Tanjong Pagar desk', 'TPD/0042', 'Paid by eWallet', [['Line', 'Reformer class · 10-pack rate · S$32.00'], ['Payment', 'eWallet · − S$32.00'], ['Over six months', '8 check-ins: 7 classes, 1 no-show'], ['Created from', 'Appointment, Thu 07:00']], 64, 256],
    ['Accounting · Journal Entries', 'MISC/2026/09/0012', 'Posted', [['Debit', '2150 Class credits owed · S$64.00'], ['Credit', 'Expired credit income · S$64.00'], ['Why', 'eWallet expired 03/09 · studio policy'], ['Created from', 'Expiry list, posted by the accountant']], 0, 320]
  ];
  function paintW1(s, n, quiet) {
    $$('.hw-tr li', s).forEach(function (li) { var k = +li.dataset.n; li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n); });
    $$('.hw-ta-l li', s).forEach(function (li) { var k = +li.dataset.on; li.classList.toggle('is-on', k <= n); li.classList.toggle('is-now', k === n); });
    var doc = $('.hw-doc', s);
    if (n > 0) {
      var d = W1[n - 1];
      $('.hw-doc-u', s).textContent = 'Tidemere Studios · ' + d[0];
      $('.hw-doc-i', s).innerHTML = $('.oi', $('.hw-tr li[data-n="' + n + '"]', s)).outerHTML;
      $('.hw-doc-r', s).textContent = d[1]; $('.hw-doc-st', s).textContent = d[2];
      d[3].forEach(function (r, i) { $('.hw-d' + i, s).textContent = r[0]; $('.hw-v' + i, s).textContent = r[1]; });
      $('.hw-ta-n', s).textContent = sgd(d[4], true);
      $('.hw-ta-rv', s).textContent = sgd(d[5], true);
      $('.hw-ta-fill', s).style.width = (d[4] / 320 * 100) + '%';
      doc.classList.add('is-live');
      if (!quiet) swap(doc);
    } else {
      $('.hw-doc-u', s).textContent = 'Tidemere Studios · Odoo';
      $('.hw-doc-i', s).innerHTML = '';
      $('.hw-doc-r', s).textContent = 'Press → to start'; $('.hw-doc-st', s).textContent = '—';
      [['Member', 'M-20418'], ['Product', 'Reformer 10-pack · S$320.00'], ['Note', 'Six stations, one document each'], ['Created from', '—']]
        .forEach(function (r, i) { $('.hw-d' + i, s).textContent = r[0]; $('.hw-v' + i, s).textContent = r[1]; });
      $('.hw-ta-n', s).textContent = 'S$0.00'; $('.hw-ta-rv', s).textContent = 'S$0.00';
      $('.hw-ta-fill', s).style.width = '0%';
      doc.classList.remove('is-live');
    }
  }
  Deck.on('w1', {
    init: function (s) {
      $$('.hw-tr button', s).forEach(function (b) {
        b.addEventListener('click', function () { Deck.go(Deck.index, +b.parentNode.dataset.n); });
      });
    },
    step: function (n, ctx, s) { paintW1(s, Math.min(n, 6)); },
    settle: function (s) { paintW1(s, 6, true); }
  });

  /* ---------------------------------------------------------------- 7 · workflow 2: rooms x hours */
  var HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18];
  var ROOMS = [
    { n: 'Room 1', t: 'Massage', ok: ['mas'] },
    { n: 'Room 2', t: 'Massage', ok: ['mas'] },
    { n: 'Room 3', t: 'Massage · facial', ok: ['mas', 'fac'] },
    { n: 'Room 4', t: 'Facial', ok: ['fac'] }
  ];
  var BOOKED = [[10, 11, 14, 15, 16], [12, 14, 15, 17], [10, 13, 15, 16], [11, 12, 15, 18]];
  var REFS = ['M-1187', 'M-0942', 'M-2216', 'M-0318', 'M-1675', 'M-0083', 'M-1402', 'M-2051', 'M-0760'];
  var TX = { mas: 'Massage · 60 min', fac: 'Facial · 60 min' };
  function hh(h) { return h + ':00'; }
  function buildGrid(s) {
    var g = $('.hw-gd-g', s), html = '', ri = 0;
    ROOMS.forEach(function (r, i) {
      html += '<div class="hw-gd-row"><span class="hw-gd-rl"><b>' + r.n + '</b><small>' + r.t + '</small></span>';
      HOURS.forEach(function (h) { html += '<button type="button" class="hw-cell" data-r="' + i + '" data-h="' + h + '" aria-label="' + r.n + ' at ' + hh(h) + '"></button>'; });
      html += '</div>';
    });
    g.innerHTML = html;
    var on = $('.hw-on-s', s), oh = '';
    HOURS.forEach(function (h) { oh += '<span data-h="' + h + '">' + hh(h) + '</span>'; });
    on.innerHTML = oh;
  }
  function resetGrid(s) {
    s._tk = {}; s._me = {};
    BOOKED.forEach(function (hs, r) { hs.forEach(function (h, j) { s._tk[r + ':' + h] = REFS[(r * 3 + j) % REFS.length]; }); });
  }
  function free(s, r, h) { var k = r + ':' + h; return !s._tk[k] && !s._me[k]; }
  function paintGrid(s) {
    $$('.hw-cell', s).forEach(function (c) {
      var r = +c.dataset.r, h = +c.dataset.h, k = r + ':' + h, fit = ROOMS[r].ok.indexOf(s._tx) >= 0;
      c.classList.toggle('is-tk', !!s._tk[k]); c.classList.toggle('is-me', !!s._me[k]);
      c.classList.toggle('is-no', !s._tk[k] && !s._me[k] && !fit);
      c.textContent = s._tk[k] || (s._me[k] ? 'M-20418' : '');
    });
    $('.hw-on-t', s).textContent = TX[s._tx];
    $$('.hw-on-s span', s).forEach(function (sp) { sp.classList.toggle('is-off', !offered(s, +sp.dataset.h)); });
  }
  function offered(s, h) { return ROOMS.some(function (r, i) { return r.ok.indexOf(s._tx) >= 0 && free(s, i, h); }); }
  function msg(s, state, t, d, quiet) {
    var m = $('.hw-msg', s);
    m.dataset.state = state; $('.hw-msg-t', s).textContent = t; $('.hw-msg-d', s).textContent = d;
    if (!quiet) swap(m);
  }
  function tryCell(s, r, h, quiet) {
    var k = r + ':' + h, room = ROOMS[r];
    if (s._tk[k]) {
      var c = $('.hw-cell[data-r="' + r + '"][data-h="' + h + '"]', s);
      if (!quiet) { c.classList.remove('is-shake'); void c.offsetWidth; c.classList.add('is-shake'); }
      msg(s, 'no', 'Refused: ' + room.n + ' is booked at ' + hh(h), 'Odoo never offered this slot online, and the desk sees it taken in the same calendar. No second booking.', quiet);
      return;
    }
    if (s._me[k]) {
      delete s._me[k]; paintGrid(s);
      msg(s, 'idle', 'Cancelled: ' + room.n + ' · ' + hh(h), 'The room is free again, so the hour goes back on the online list.', quiet);
      return;
    }
    if (room.ok.indexOf(s._tx) < 0) {
      msg(s, 'na', room.n + ' isn’t set up for ' + (s._tx === 'mas' ? 'massage' : 'facials'), 'This appointment type only uses ' + (s._tx === 'mas' ? 'rooms 1, 2 and 3.' : 'rooms 3 and 4.'), quiet);
      return;
    }
    s._me[k] = 1; paintGrid(s);
    msg(s, 'ok', 'Booked: ' + room.n + ' · ' + hh(h) + ' · M-20418', offered(s, h) ? hh(h) + ' stays online: another suitable room is still free.' : hh(h) + ' is gone from the online list: no suitable room is left.', quiet);
  }
  Deck.on('w2', {
    init: function (s) {
      buildGrid(s); resetGrid(s); s._tx = 'mas';
      s._set = seg($('.hw-tx', s), function (v) { s._tx = v; paintGrid(s); msg(s, 'idle', TX[v], v === 'mas' ? 'Massage can use rooms 1, 2 and 3.' : 'Facials can use rooms 3 and 4: rooms 1 and 2 drop out.'); });
      $('.hw-gd-g', s).addEventListener('click', function (e) {
        var c = e.target.closest('.hw-cell'); if (!c) return;
        s._held = true; tryCell(s, +c.dataset.r, +c.dataset.h);
      });
      paintGrid(s);
    },
    enter: function (ctx, s) {
      s._held = false; resetGrid(s); s._set('mas', true); s._tx = 'mas'; paintGrid(s);
      msg(s, 'idle', 'Try a booked hour', 'Odoo checks the room before it offers or takes the slot.', true);
      ctx.after(1600, function () { if (!s._held) tryCell(s, 1, 15); });
      ctx.after(4200, function () { if (!s._held) tryCell(s, 0, 13); });
    },
    settle: function (s) {
      resetGrid(s); s._set('mas', true); s._tx = 'mas';
      s._me['0:13'] = 1; paintGrid(s);
      tryCell(s, 1, 15, true);
    }
  });

  /* ---------------------------------------------------------------- 8 · rollout phases */
  var PH = [
    ['Set up a liability account for credits owed, load 1,850 members, and import every open pack, annual membership and spa package from the booking app at the price it was sold.', ['Credits as a number in an app', 'Credits owed in S$, on the balance sheet'], ['Packs posted as sales', 'Packs posted as owed']],
    ['Monthly and annual memberships on recurring plans with saved cards; 3, 10 and 20-class packs sold online and at the desk as eWallet top-ups with an expiration date.', ['Failed renewals found weeks later', 'A Payment Failure list each morning'], ['Expiry zeroed without a word', 'An expiration date on every pack']],
    ['Tanjong Pagar first: classes and spa rooms on Appointments, check-in and retail on Point of Sale. The other studios and the spa follow once it closes a clean month.', ['Two diaries for one room', 'A room offered once'], ['Retail on a separate till', 'Mats and skincare on the same till']],
    ['Classes taught as Planning shifts, counted for each instructor’s monthly bill; reminders 30 and 7 days before a pack expires.', ['Pay from paper sign-in sheets', 'Pay from classes taught'], ['Members surprised by expiry', 'A reminder before it lapses']]
  ];
  Deck.on('rollout', {
    init: function (s) {
      s._pick = function (k, quiet) {
        $$('.fb-ph button', s).forEach(function (b) { b.classList.toggle('is-on', b.dataset.k === k); });
        var p = PH[+k];
        $('.fb-pd-do', s).textContent = p[0];
        $$('.fb-ba li', s).forEach(function (li, i) { $('.fb-b', li).textContent = p[i + 1][0]; $('.fb-a', li).textContent = p[i + 1][1]; });
        if (!quiet) swap($('.fb-pd', s));
      };
      $('.fb-ph', s).addEventListener('click', function (e) {
        var b = e.target.closest('.fb-ph button'); if (!b) return;
        s._held = true; s._pick(b.dataset.k);
      });
    },
    enter: function (ctx, s) {
      s._held = false; var i = 0;
      ctx.after(1400, function () {
        ctx.every(4200, function () { if (s._held) return; i = (i + 1) % PH.length; s._pick(String(i)); });
      });
    },
    settle: function (s) { s._pick('0', true); }
  });
})();

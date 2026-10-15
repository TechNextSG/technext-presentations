/* Immaculate Connections: website walkthrough. Slide behaviour.
   Packages, prices, dates, captions and the Ask us answers are the live site's own (immaculateconnectionsph.com, read 15 Oct 2026);
   the service documents and the quotation use labelled sample details. Partner codes never appear in this deck.
   Every slide whose finished state comes from JS has a settle hook, so the overview and the PDF show it finished. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  var V = (document.querySelector('script[src*="assets/immaculate.js"]').src.match(/[?&]v=([^&#]+)/) || [])[1] || '';
  var IMG = function (p) { return 'assets/img/ic/' + p + (V ? '?v=' + V : ''); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function snap(root, fn) { root.classList.add('im-nt'); fn(); void root.offsetWidth; root.classList.remove('im-nt'); }
  function press(btns, on) { btns.forEach(function (b) { b.setAttribute('aria-pressed', b === on ? 'true' : 'false'); }); }
  var peso = function (n) { return '₱' + n.toLocaleString('en-US'); };

  // jump links anywhere in the deck: data-go="slide id"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.preventDefault(); e.stopPropagation();
    Deck.goId(b.dataset.go, b.dataset.at != null ? +b.dataset.at : 0);
  });

  /* ---------------------------------------------------------------- 2 · counters */
  Deck.on('built', {
    enter: function (ctx, s) {
      if (Deck.reduce) return;
      $$('.im-b-c b', s).forEach(function (b, i) { var n = +b.dataset.n; b.textContent = '0'; ctx.after(260 + i * 60, function () { ctx.count(b, n, { from: 0, dur: 900 }); }); });
    },
    settle: function (s) { $$('.im-b-c b', s).forEach(function (b) { b.textContent = b.dataset.n; }); }
  });

  /* ---------------------------------------------------------------- 3 · page by page */
  var URLS = { home: '', tours: 'tours', pkg: 'package-danang-6d4n-bana-overnight', car: 'car-rental', mice: 'mice', gallery: 'gallery', contact: 'contact' };
  Deck.on('site', {
    init: function (s) {
      $('.im-s-tabs', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-p]'); if (!b) return;
        var p = b.dataset.p; press($$('.im-s-tabs button', s), b);
        $$('.im-pg, .im-s-say ul', s).forEach(function (x) { x.classList.toggle('is-on', x.dataset.p === p); });
        $('[data-im=url]', s).textContent = 'immaculateconnectionsph.com/' + URLS[p];
      });
    }
  });

  /* ---------------------------------------------------------------- 4 · the home page prints (the agency's own group photos and captions) */
  var PRINTS = ["Magellan's Cross, Cebu City", 'Student group tour', 'Student delegation', 'Ba Na Hills, Da Nang', 'Lunch stop on tour', 'Group delegation', 'Team outing',
    'Hotel check-in', 'Airport departure', 'Shibuya, Tokyo', 'Hong Kong Disneyland', 'Resort day out', 'Hilltop stop', 'Wheels down', 'Gala night'];
  var ROT = [-2.5, 3.5, -4, 2, -1.5, 4, -3, 1.5, -2, 3, -3.5, 2.5, -1, 3.8, -2.8];
  var order = PRINTS.map(function (_, i) { return i; });
  function paintPile(s) {
    var pile = $('.im-pile', s);
    if (!pile.children.length) {
      pile.innerHTML = PRINTS.map(function (c, i) {
        return '<figure class="im-pr" data-n="' + i + '"><img src="' + IMG('print-' + (i + 1) + '.jpg') + '" alt="" width="608" height="456" loading="lazy" decoding="async"><figcaption>' + esc(c) + '</figcaption></figure>';
      }).join('');
      $('.im-p-thumbs', s).innerHTML = PRINTS.map(function (c, i) {
        return '<button type="button" data-n="' + i + '" aria-pressed="false" aria-label="' + esc(c) + '"><img src="' + IMG('print-' + (i + 1) + '.jpg') + '" alt="" loading="lazy"></button>';
      }).join('');
    }
    var figs = $$('.im-pr', pile);
    order.forEach(function (n, k) {
      var f = figs[n]; f.style.zIndex = String(PRINTS.length - k); f.classList.toggle('is-top', k === 0);
      f.style.setProperty('--r', (k === 0 ? ROT[n] * .5 : ROT[n]) + 'deg');
      f.style.setProperty('--x', (k === 0 ? 0 : (k % 2 ? 10 : -10)) + 'px');
      f.style.setProperty('--y', (k === 0 ? 0 : -6) + 'px');
      f.style.visibility = k < 4 ? 'visible' : 'hidden';
    });
    var top = order[0];
    $('[data-im=pn]', s).textContent = (top + 1) + ' / ' + PRINTS.length;
    $('[data-im=pc]', s).textContent = PRINTS[top];
    $$('.im-p-thumbs button', s).forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.n === top ? 'true' : 'false'); });
  }
  var throwing = false;
  function next(s, to) {
    if (throwing) return;
    var pile = $('.im-pile', s), topFig = $('.im-pr[data-n="' + order[0] + '"]', pile);
    var done = function () {
      if (to == null) order.push(order.shift());
      else { order.splice(order.indexOf(to), 1); order.unshift(to); }
      topFig.classList.remove('is-throw'); paintPile(s); throwing = false;
    };
    if (Deck.reduce || (to != null && to === order[0])) { if (to !== order[0]) done(); return; }
    throwing = true; topFig.classList.add('is-throw'); setTimeout(done, 380);
  }
  Deck.on('prints', {
    init: function (s) {
      paintPile(s);
      var pile = $('.im-pile', s);
      pile.addEventListener('click', function () { next(s); });
      pile.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); next(s); } });
      $('.im-p-thumbs', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-n]'); if (b) next(s, +b.dataset.n); });
    },
    settle: function (s) { snap(s, function () { paintPile(s); }); }
  });

  /* ---------------------------------------------------------------- 5 · tours: the 14 packages on the site (15 Oct 2026), "from" price per pax */
  var TOURS = [
    ['danang-6d4n-bana-overnight', 'Da Nang 6D4N · Ba Na Hills overnight', 'dn', 6, '6 days 4 nights', 29888, 'vn-danang', 26],
    ['danang-5d3n-bana-overnight', 'Da Nang 5D3N · Ba Na Hills overnight', 'dn', 5, '5 days 3 nights', 27888, 'vn-golden-bridge-walk', 11],
    ['danang-6d4n-charter', 'Da Nang 6D4N charter · Sea Garden Hotel', 'dn', 6, '6 days 4 nights', 24888, 'vn-hoian-lanterns', 28],
    ['danang-5d3n-charter', 'Da Nang 5D3N charter · Sea Garden Hotel', 'dn', 5, '5 days 3 nights', 22888, 'vn-dragon-bridge', 15],
    ['rose-danang-6d4n', 'Da Nang 6D4N charter · Nagila Hotel', 'dn', 6, '6 days 4 nights', 23888, 'vn-hoian-boats', 54],
    ['rose-danang-5d3n', 'Da Nang 5D3N charter · Nagila Hotel', 'dn', 5, '5 days 3 nights', 22888, 'vn-danang-beach', 26],
    ['danang-4d3n', 'Da Nang 4D3N', 'dn', 4, '4 days 3 nights', 23888, 'vn-dragon-bridge-day', 3],
    ['danang-4d3n-z2', 'Da Nang 4D3N via AirAsia', 'dn', 4, '4 days 3 nights', 26888, 'vn-marble-mountains', 1],
    ['hanoi-sapa-4d3n', 'Hanoi – Sapa 4D3N', 'hn', 4, '4 days 3 nights', 36888, 'vn-sapa', 3],
    ['hanoi-sapa-halong-5d4n', 'Hanoi – Sapa – Ha Long 5D4N · shopping stops', 'hn', 5, '5 days 4 nights', 33888, 'vn-hanoi-flags', 3],
    ['hanoi-sapa-halong-5d3n-charter', 'Ha Long – Hanoi – Sapa 5D3N charter · no shopping', 'hn', 5, '5 days 3 nights', 32888, 'vn-halong-boat', 15],
    ['hanoi-sapa-halong-5d3n-charter-classic', 'Sapa – Hanoi – Ha Long 5D3N charter · shopping stops', 'hn', 5, '5 days 3 nights', 28888, 'vn-hanoi-train-street', 1],
    ['hanoi-sapa-halong-6d4n-charter', 'Hanoi – Sapa – Ha Long 6D4N charter · no shopping', 'hn', 6, '6 days 4 nights', 35888, 'vn-fansipan-train', 31],
    ['hanoi-sapa-halong-6d4n-charter-classic', 'Sapa – Hanoi – Ha Long 6D4N charter · shopping stops', 'hn', 6, '6 days 4 nights', 29888, 'vn-halong', 2]
  ];
  var F = { dest: 'all', len: 'all', sort: 'price' };
  function tours(s, anim) {
    var list = TOURS.filter(function (t) { return (F.dest === 'all' || t[2] === F.dest) && (F.len === 'all' || t[3] === +F.len); });
    list.sort(function (a, b) { return F.sort === 'price' ? a[5] - b[5] || b[7] - a[7] : b[7] - a[7] || a[5] - b[5]; });
    var box = $('.im-t-list', s); box.classList.toggle('no-anim', !anim);
    box.innerHTML = list.map(function (t, k) {
      return '<div class="im-t-r" style="--k:' + k + '"><img src="' + IMG(t[6] + '.jpg') + '" alt="" width="78" height="46"><span><b>' + esc(t[1]) + '</b><small>' + t[4] + ' · ' + t[7] + (t[7] === 1 ? ' departure' : ' departures') + ' · from Manila</small></span><em><small>From</small>' + peso(t[5]) + '</em></div>';
    }).join('');
    $('[data-im=tn]', s).textContent = list.length;
    var q = [];
    if (F.dest === 'dn') q.push('q=da+nang'); else if (F.dest === 'hn') q.push('q=sapa');
    if (F.len !== 'all') q.push('len=' + (F.len === '6' ? '6+' : '4-5'));
    $('[data-im=turl]', s).textContent = 'immaculateconnectionsph.com/tours' + (q.length ? '?' + q.join('&') : '');
  }
  Deck.on('tours', {
    init: function (s) {
      $$('.im-t-seg', s).forEach(function (g) {
        g.addEventListener('click', function (e) {
          var b = e.target.closest('button[data-v]'); if (!b) return;
          press($$('button', g), b); F[g.dataset.f] = b.dataset.v; tours(s, !Deck.reduce);
        });
      });
      tours(s, false);
    },
    enter: function (ctx, s) { tours(s, !Deck.reduce); },
    settle: function (s) { tours(s, false); }
  });

  /* ---------------------------------------------------------------- 6 · one package page: scroll the real page to each part */
  var KY = [0, 1290, 2540, 3380, 4480, 5630];   // section tops on the 1440 px page, less the sticky header
  function pkg(s, k) {
    press($$('.im-k-tabs button', s), $('.im-k-tabs button[data-k="' + k + '"]', s));
    $$('.im-k-p', s).forEach(function (p) { p.classList.toggle('is-on', +p.dataset.k === k); });
    $('.im-k-img', s).style.setProperty('--ky', (-KY[k] * 520 / 1440) + 'px');
  }
  Deck.on('package', {
    init: function (s) { $('.im-k-tabs', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (b) pkg(s, +b.dataset.k); }); },
    enter: function (ctx, s) {
      if (Deck.reduce) return;
      var k = 0; pkg(s, 0);
      ctx.every(3200, function () { if (s.dataset.held) return; k = (k + 1) % KY.length; pkg(s, k); });
      ctx.on($('.im-k-tabs', s), 'click', function () { s.dataset.held = '1'; });
    },
    leave: function (s) { delete s.dataset.held; },
    settle: function (s) { snap(s, function () { pkg(s, 0); }); }
  });

  /* ---------------------------------------------------------------- 7 · services: sample details typed into the form and the document */
  var SVC = {
    car: { kind: 'Trip ticket', ref: 'TT-261015', icon: 'truck', from: ['Pick-up', 'Mactan-Cebu Airport'], to: ['Drop-off', 'Cebu City hotel'],
      f: [['Vehicle', 'Van with driver'], ['Date', '12 Dec 2026'], ['Passengers', '10']], note: 'Rates depend on the route and hours: every trip gets a free quotation.' },
    hotel: { kind: 'Stay voucher', ref: 'SV-261015', icon: 'building', from: ['Destination', 'Panglao, Bohol'], to: ['Stay', '20–23 Dec 2026'],
      f: [['Nights', '3'], ['Rooms', '4'], ['Guests', '8 adults']], note: 'On its own, or with a tour, transfers and tickets.' },
    ticket: { kind: 'Boarding pass', ref: 'BP-261015', icon: 'plane', from: ['From', 'Cebu (CEB)'], to: ['To', 'Manila (MNL)'],
      f: [['Trip', 'Round trip'], ['Depart', '18 Dec 2026'], ['Passengers', '6']], note: 'Flights, ferries to Bohol and Camotes, and group bookings.' },
    mice: { kind: 'Event badge', ref: 'EV-261015', icon: 'users', from: ['Event', 'Two-day seminar'], to: ['Place', 'Cebu City'],
      f: [['Dates', '2–3 Feb 2027'], ['Participants', '120'], ['Arrange', 'Venue, rooms, meals']], note: 'Seminars, trainings, LGU orientation courses and company outings.' }
  };
  var ICONS = {};
  function svcFields(d) { return [d.from, d.to].concat(d.f); }
  function svcPaint(s, key, full) {
    var d = SVC[key], fs = svcFields(d);
    $('[data-im=form]', s).innerHTML = fs.map(function (f, i) { return '<div class="im-v-f' + (i < 2 ? ' is-wide' : '') + '" data-i="' + i + '"><label>' + esc(f[0]) + '</label><span>' + (full ? esc(f[1]) : '') + '</span></div>'; }).join('');
    $('[data-im=doc]', s).innerHTML =
      '<div class="im-d-top"><img src="assets/img/clients/ic-mark.png' + (V ? '?v=' + V : '') + '" alt=""><span><b>Immaculate Connections</b><small>' + esc(d.kind) + '</small></span><em>' + d.ref + '-0001</em></div>' +
      '<div class="im-d-route"><div><small>' + esc(d.from[0]) + '</small><b data-d="0">' + (full ? esc(d.from[1]) : '') + '</b></div><i>' + ICONS[d.icon] + '</i><div><small>' + esc(d.to[0]) + '</small><b data-d="1">' + (full ? esc(d.to[1]) : '') + '</b></div></div>' +
      '<div class="im-d-g">' + d.f.map(function (f, i) { return '<div><small>' + esc(f[0]) + '</small><b data-d="' + (i + 2) + '">' + (full ? esc(f[1]) : '') + '</b></div>'; }).join('') + '</div>' +
      '<div class="im-d-foot"><span>' + esc(d.note) + '</span><span class="im-d-stamp">Free quote</span></div>';
  }
  var svcTok = 0;
  async function svcType(ctx, s, key) {
    var tok = ++svcTok, fs = svcFields(SVC[key]);
    svcPaint(s, key, false);
    for (var i = 0; i < fs.length; i++) {
      if (tok !== svcTok) return;
      var fld = $('.im-v-f[data-i="' + i + '"]', s), inp = $('span', fld), out = $('[data-d="' + i + '"]', s), txt = fs[i][1];
      fld.classList.add('is-typing');
      for (var c = 1; c <= txt.length; c++) {
        if (tok !== svcTok) return;
        inp.textContent = txt.slice(0, c); out.textContent = txt.slice(0, c);
        await ctx.wait(32);
      }
      fld.classList.remove('is-typing'); out.classList.add('im-d-new');
      await ctx.wait(160);
    }
  }
  var cur = 'car';
  Deck.on('services', {
    init: function (s) {
      $$('.im-v-seg button .ic', s).forEach(function (ic) { ICONS[ic.closest('button').dataset.s === 'mice' ? 'users' : ic.closest('button').dataset.s === 'car' ? 'truck' : ic.closest('button').dataset.s === 'hotel' ? 'building' : 'plane'] = ic.outerHTML; });
      svcPaint(s, cur, true);
    },
    enter: function (ctx, s) {
      var go = function (k) { cur = k; press($$('.im-v-seg button', s), $('.im-v-seg button[data-s="' + k + '"]', s)); if (Deck.reduce) { svcTok++; svcPaint(s, k, true); } else svcType(ctx, s, k); };
      ctx.on($('.im-v-seg', s), 'click', function (e) { var b = e.target.closest('button[data-s]'); if (b) go(b.dataset.s); });
      ctx.on($('.im-v-play', s), 'click', function () { go(cur); });
      ctx.after(700, function () { go(cur); });
    },
    leave: function (s) { svcTok++; },
    settle: function (s) { svcTok++; svcPaint(s, cur, true); }
  });

  /* ---------------------------------------------------------------- 8 · inquiry to quotation (sample traveller, sample references) */
  var FLOW = {
    tr: { head: ['Quotation', 'ICQ-261015-4821'],
      steps: [['What you need', 'A tour package, a flight, a hotel, a vehicle, an event'], ['Trip details', 'The package and date arrive filled in from its page'], ['Your details', 'Name, email, mobile; no account, no payment'],
        ['Quotation on screen', 'A reference, the details and an estimate, straight away'], ['In your inbox', 'The inquiry lands in Gmail; the traveller gets a copy'], ['Save or send', 'Download as PDF, email a copy, or Messenger']],
      rows: [['Service', 'Tour package', 0], ['Package', 'Da Nang 6D4N · Ba Na Hills overnight', 1], ['Travel date', 'Jan 17–21, 2027 · 4 adults', 1], ['Traveller', 'Maria Santos (sample)', 2],
        ['Estimate', '₱29,888 × 4 = ₱119,552 (before date surcharges)', 3], ['Sent to', 'Your inbox, subject "Website inquiry ICQ-261015-4821"', 4], ['Next', 'Download PDF · Email a copy · Message us', 5]] },
    pa: { head: ['Partner request', 'ICB-261015-0001'],
      steps: [['Partner code', 'Each partner gets a personal code from the agency'], ['Partner tab opens', 'A one-page form for agents, companies, schools, LGUs'], ['The request', 'Quotation type, route, dates and group'],
        ['Rate basis', 'Net or commissionable, currency and deadline'], ['Sent with a reference', 'Same inbox, its own ICB reference, a printable copy'], ['Your team prices it', 'Nothing is priced on the page']],
      rows: [['Partner', 'Travel agency partner (sample)', 1], ['Quotation type', 'Tour package', 2], ['Route & dates', 'Da Nang 5D3N · Dec 10–13, 2026', 2], ['Group', '18 adults · 2 children · 1 tour leader · 10 rooms', 2],
        ['Rate basis', 'Commissionable · PHP · reply by 20 Oct', 3], ['Reference', 'ICB-261015-0001, copy printed for the partner', 4], ['Reply', 'Rates from your team by email', 5]] }
  };
  var who = 'tr';
  function flow(s, n) {
    var F_ = FLOW[who];
    $('.im-q-steps', s).innerHTML = F_.steps.map(function (t, i) {
      return '<li class="' + (i < n ? 'is-done' : i === n ? 'is-on' : '') + '"><button type="button" data-n="' + i + '"><i>' + (i + 1) + '</i><b>' + esc(t[0]) + '</b><small>' + esc(t[1]) + '</small></button></li>';
    }).join('');
    $('[data-im=qcard]', s).innerHTML = '<div class="im-d-top"><img src="assets/img/clients/ic-mark.png' + (V ? '?v=' + V : '') + '" alt=""><span><b>Immaculate Connections</b><small>' + esc(F_.head[0]) + '</small></span><em>' + F_.head[1] + '</em></div><div class="im-q-rows">' +
      F_.rows.map(function (r) { return '<div class="im-q-row' + (r[2] <= n ? ' is-on' : '') + (r[2] === n ? ' is-new' : '') + '"><small>' + esc(r[0]) + '</small><b>' + esc(r[1]) + '</b></div>'; }).join('') + '</div>';
  }
  var qTok = 0;
  Deck.on('inquiry', {
    init: function (s) { flow(s, 5); },
    enter: function (ctx, s) {
      var play = function () {
        var tok = ++qTok, n = 0; flow(s, 0);
        ctx.every(1500, function () { if (tok !== qTok) return false; n++; if (n > 5) { qTok++; return false; } flow(s, n); });
      };
      ctx.on($('.im-q-seg', s), 'click', function (e) { var b = e.target.closest('button[data-w]'); if (!b) return; who = b.dataset.w; press($$('.im-q-seg button', s), b); if (Deck.reduce) flow(s, 5); else play(); });
      ctx.on($('.im-q-steps', s), 'click', function (e) { var b = e.target.closest('button[data-n]'); if (b) { qTok++; flow(s, +b.dataset.n); } });
      ctx.on($('.im-q-play', s), 'click', function () { if (Deck.reduce) flow(s, 5); else play(); });
      if (Deck.reduce) flow(s, 5); else ctx.after(600, play);
    },
    leave: function () { qTok++; },
    settle: function (s) { qTok++; flow(s, 5); }
  });

  /* ---------------------------------------------------------------- 9 · Ask us: the live assistant's replies (15 Oct 2026), long lists cut */
  var ASK = [
    { q: 'How much is the Hanoi Sapa tour?', a: 'I found 6 packages:<ul><li><b>Sapa – Hanoi – Ha Long Bay 6D4N Charter Tour</b> (with Shopping Stops)<em>6 days 4 nights · From ₱29,888 · Next: Oct 31–Nov 4</em></li><li><b>Sapa – Hanoi – Ha Long Bay Charter Flight 5D3N Tour</b> (with Shopping Stops)<em>5 days 3 nights · From ₱28,888 · Next: Nov 5–8</em></li><li><b>Ha Long Bay – Hanoi – Sapa Charter Flight 5D3N Tour</b> (No Shopping)<em>5 days 3 nights · From ₱32,888 · Next: Nov 19–22</em></li></ul>', c: ['What’s included?', 'Itinerary', 'Get a quote'] },
    { q: 'Can you rent a van with driver?', a: 'We arrange <b>air-conditioned vehicles with a driver</b> for airport transfers, city tours, out-of-town trips and event shuttles: 4-Seater, Van, Coaster and Bus. Rates depend on the route and how long you need the vehicle, so every trip gets a free quotation. Send the pick-up point, stops and date.', c: ['Car rental', 'Get a free quote'] },
    { q: 'Do you handle seminars?', a: 'We handle <b>meetings and events</b>: conventions and conferences, seminars and trainings, orientation courses for local legislators and LGU staff, reunions and corporate gatherings. We can arrange the venue, accommodation, meals, participant transport and tickets or a tour for participants.', c: ['MICE & events', 'Get a free quote'] },
    { q: 'How do I book?', a: 'Open the package page and tap <b>“Request a quote”</b>, or send an inquiry and choose your package. We confirm availability for your dates and send a quotation with the payment details; your booking is confirmed once payment is received.', c: ['Browse packages', 'Send an inquiry'] },
    { q: 'Where is your office?', a: 'Here is how to reach our team:<ul><li><b>Mobile</b> +63 917 319 8540 · <b>Landline</b> (032) 238 3343</li><li>immaculateconnectionsph@gmail.com · Facebook Messenger</li><li>Unit 4E, 4th Floor, JL Millennium Building, Don Jose Avila Street, Cebu City</li></ul>', c: ['Send an inquiry', 'Message us', 'Call'] }
  ];
  function bubbleA(x) { return '<div class="im-a-b a">' + x.a + '<div class="im-a-chips">' + x.c.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div></div>'; }
  function askPaint(s, k) {
    press($$('.im-a-qs button', s), $('.im-a-qs button[data-a="' + k + '"]', s));
    $('[data-im=log]', s).innerHTML = '<div class="im-a-b a">Hi! Ask me about packages, prices, dates, vehicles or events.</div><div class="im-a-b u">' + esc(ASK[k].q) + '</div>' + bubbleA(ASK[k]);
  }
  var aTok = 0;
  Deck.on('ask', {
    init: function (s) { askPaint(s, 0); },
    enter: function (ctx, s) {
      var ask = async function (k) {
        var tok = ++aTok, log = $('[data-im=log]', s);
        press($$('.im-a-qs button', s), $('.im-a-qs button[data-a="' + k + '"]', s));
        if (Deck.reduce) { askPaint(s, k); return; }
        log.innerHTML = '<div class="im-a-b a">Hi! Ask me about packages, prices, dates, vehicles or events.</div>';
        await ctx.wait(250); if (tok !== aTok) return;
        log.insertAdjacentHTML('beforeend', '<div class="im-a-b u">' + esc(ASK[k].q) + '</div><div class="im-a-b a im-a-dots"><i></i><i></i><i></i></div>');
        await ctx.wait(900); if (tok !== aTok) return;
        log.lastChild.remove(); log.insertAdjacentHTML('beforeend', bubbleA(ASK[k]));
      };
      ctx.on($('.im-a-qs', s), 'click', function (e) { var b = e.target.closest('button[data-a]'); if (b) ask(+b.dataset.a); });
      ctx.after(500, function () { ask(0); });
    },
    leave: function () { aTok++; },
    settle: function (s) { aTok++; askPaint(s, 0); }
  });

  /* ---------------------------------------------------------------- 10 · gallery filter */
  Deck.on('gallery', {
    init: function (s) {
      var seg = $('.im-g-seg', s), grid = $('.im-g', s);
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-g]'); if (!b) return;
        press($$('button', seg), b); var g = b.dataset.g;
        grid.classList.toggle('is-f', g !== 'all');
        $$('figure', grid).forEach(function (f) { f.classList.toggle('is-off', g !== 'all' && f.dataset.g !== g); });
      });
    }
  });

  /* ---------------------------------------------------------------- 11 · found on Google: each page's own title and description */
  var SERP = [
    ['', 'Cebu Travel Agency: Tours &amp; Tickets | Immaculate Connections', 'Cebu City travel agency: Da Nang, Hanoi, Sapa and Ha Long Bay tours from Manila, flights, hotels, van and coaster hire, and events. Free quote.', ['Travel agency', 'FAQ']],
    ['tours', 'Vietnam Tour Packages from Manila | Immaculate Connections', 'Vietnam tour packages from Manila: Da Nang charter tours and Hanoi, Sapa and Ha Long Bay programmes, with departure dates, inclusions and prices per pax.', ['Home › Tour packages', 'FAQ']],
    ['car-rental', 'Van &amp; Coaster Rental in Cebu | Immaculate Connections', 'Van, coaster, bus and 4-seater hire with driver in Cebu: airport transfers, city tours, out-of-town trips and event shuttles, air-conditioned. Free quote.', ['Home › Services › Vehicle hire']],
    ['mice', 'MICE, Seminars &amp; Events in Cebu | Immaculate Connections', 'Seminars, trainings, conventions, LGU orientation courses, team building and company outings in Cebu: venue, rooms, meals and transport arranged.', ['Home › Services › MICE']],
    ['package-hanoi-sapa-halong-5d3n-charter', 'Ha Long Hanoi Sapa 5D3N Charter | Immaculate Connections', 'Ha Long Bay, Hanoi and Sapa 5D3N charter tour from Manila from ₱32,888 per pax, no shopping stops: bay cruise, Old Quarter and Fansipan.', ['Tourist trip', 'From ₱32,888']]
  ];
  function serp(s, k, anim) {
    var r = SERP[k], chips = $$('.im-o-chips button', s);
    press(chips, chips[k]); $('[data-im=oq]', s).textContent = chips[k].textContent;
    var box = $('[data-im=ores]', s); box.classList.toggle('im-nt', !anim);
    box.innerHTML = '<div class="im-o-site"><img src="assets/img/clients/ic-mark.png' + (V ? '?v=' + V : '') + '" alt=""><span><b>Immaculate Connections</b><small>https://www.immaculateconnectionsph.com' + (r[0] ? ' › ' + r[0] : '') + '</small></span></div>' +
      '<p class="im-o-t">' + r[1] + '</p><p class="im-o-d">' + r[2] + '</p><div class="im-o-x">' + r[3].map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>';
  }
  Deck.on('google', {
    init: function (s) { serp(s, 0, false); $('.im-o-chips', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-o]'); if (b) serp(s, +b.dataset.o, !Deck.reduce); }); },
    settle: function (s) { serp(s, 0, false); }
  });

  /* ---------------------------------------------------------------- 12 · share: copy a link */
  Deck.on('share', {
    init: function (s) {
      var say = $('[data-im=copied]', s), t;
      s.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-copy]'); if (!b) return;
        var url = b.dataset.copy, ok = function (m) { say.textContent = m; say.classList.add('is-on'); clearTimeout(t); t = setTimeout(function () { say.classList.remove('is-on'); }, 2600); };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { ok('Copied: ' + url); }, function () { ok(url); }); else ok(url);
      });
    }
  });
})();

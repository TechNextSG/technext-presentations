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

  /* ---------------------------------------------------------------- 5 · tours: the 35 packages on the site (15 Oct 2026), "from" price per pax as published
     [id, short name, country, departs (mnl|ceb), days, duration, from, currency, image, departure dates] */
  var TOURS = [
    ["danang-6d4n-bana-overnight", "Da Nang 6D4N · Ba Na Hills overnight", "Vietnam", "mnl", 6, "6 days 4 nights", 29888, "PHP", "vn-danang", 26],
    ["danang-5d3n-bana-overnight", "Da Nang 5D3N · Ba Na Hills overnight", "Vietnam", "mnl", 5, "5 days 3 nights", 27888, "PHP", "vn-golden-bridge-walk", 11],
    ["danang-6d4n-charter", "Da Nang 6D4N · Sea Garden Hotel", "Vietnam", "mnl", 6, "6 days 4 nights", 24888, "PHP", "vn-hoian-lanterns", 28],
    ["danang-5d3n-charter", "Da Nang 5D3N · Sea Garden Hotel", "Vietnam", "mnl", 5, "5 days 3 nights", 22888, "PHP", "vn-dragon-bridge", 15],
    ["rose-danang-6d4n", "Da Nang 6D4N · Nagila Hotel", "Vietnam", "mnl", 6, "6 days 4 nights", 23888, "PHP", "vn-hoian-boats", 54],
    ["rose-danang-5d3n", "Da Nang 5D3N · Nagila Hotel", "Vietnam", "mnl", 5, "5 days 3 nights", 22888, "PHP", "vn-danang-beach", 26],
    ["danang-4d3n", "Da Nang 4D3N", "Vietnam", "mnl", 4, "4 days 3 nights", 23888, "PHP", "vn-dragon-bridge-day", 3],
    ["danang-4d3n-z2", "Da Nang 4D3N via AirAsia", "Vietnam", "mnl", 4, "4 days 3 nights", 26888, "PHP", "vn-marble-mountains", 1],
    ["hanoi-sapa-4d3n", "Hanoi – Sapa 4D3N", "Vietnam", "mnl", 4, "4 days 3 nights", 36888, "PHP", "vn-sapa", 3],
    ["hanoi-sapa-halong-5d4n", "Hanoi – Sapa – Ha Long 5D4N · shopping stops", "Vietnam", "mnl", 5, "5 days 4 nights", 33888, "PHP", "vn-hanoi-flags", 3],
    ["hanoi-sapa-halong-5d3n-charter", "Ha Long – Hanoi – Sapa 5D3N · no shopping", "Vietnam", "mnl", 5, "5 days 3 nights", 32888, "PHP", "vn-halong-boat", 15],
    ["hanoi-sapa-halong-5d3n-charter-classic", "Sapa – Hanoi – Ha Long 5D3N · shopping stops", "Vietnam", "mnl", 5, "5 days 3 nights", 28888, "PHP", "vn-hanoi-train-street", 1],
    ["hanoi-sapa-halong-6d4n-charter", "Hanoi – Sapa – Ha Long 6D4N charter · no shopping", "Vietnam", "mnl", 6, "6 days 4 nights", 35888, "PHP", "vn-fansipan-train", 31],
    ["hanoi-sapa-halong-6d4n-charter-classic", "Sapa – Hanoi – Ha Long 6D4N charter · shopping stops", "Vietnam", "mnl", 6, "6 days 4 nights", 29888, "PHP", "vn-halong", 2],
    ["danang-5d4n-cebu-charter", "Da Nang 5D4N", "Vietnam", "ceb", 5, "5 days 4 nights", 32888, "PHP", "vn-hoian-boats", 3],
    ["hanoi-sapa-halong-4d3n", "Hanoi – Sapa – Ha Long 4D3N", "Vietnam", "ceb", 4, "4 days 3 nights", 35888, "PHP", "vn-halong", 16],
    ["hanoi-sapa-halong-5d3n-cebu", "Hanoi – Sapa – Ha Long 5D3N · no shopping", "Vietnam", "ceb", 5, "5 days 3 nights", 36888, "PHP", "vn-halong-boat", 11],
    ["hanoi-sapa-halong-6d4n-cebu", "Hanoi – Sapa – Ha Long 6D4N · no shopping", "Vietnam", "ceb", 6, "6 days 4 nights", 38888, "PHP", "vn-fansipan-train", 12],
    ["shanghai-disneyland-4d3n", "Shanghai Disneyland 4D3N", "China", "ceb", 4, "4 days 3 nights", 519, "USD", "cn-shanghai-disney", 5],
    ["shanghai-5d3n", "Shanghai 5D3N", "China", "ceb", 5, "5 days 3 nights", 399, "USD", "cn-shanghai", 2],
    ["shanghai-mini-kyoto-5d4n", "Shanghai – Wuxi Mini Kyoto – Wuzhen 5D4N", "China", "ceb", 5, "5 days 4 nights", 499, "USD", "cn-shanghai", 2],
    ["shanghai-mini-kyoto-6d4n", "Shanghai – Wuxi Mini Kyoto – Hangzhou 6D4N", "China", "ceb", 6, "6 days 4 nights", 419, "USD", "cn-west-lake", 1],
    ["shanghai-5d4n-no-shopping", "Shanghai – Suzhou 5D4N · no shopping", "China", "ceb", 5, "5 days 4 nights", 49888, "PHP", "cn-shanghai", 5],
    ["avatar-shanghai-5d4n", "Zhangjiajie (Avatar) – Shanghai 5D4N", "China", "ceb", 5, "5 days 4 nights", 599, "USD", "cn-zhangjiajie", 3],
    ["shanghai-hangzhou-wuzhen-5d4n", "Shanghai – Hangzhou – Wuzhen 5D4N", "China", "ceb", 5, "5 days 4 nights", 569, "USD", "cn-wuzhen", 3],
    ["shanghai-hangzhou-wuxi-6d5n", "Shanghai – Hangzhou – Wuxi 6D5N", "China", "ceb", 6, "6 days 5 nights", 799, "USD", "cn-west-lake", 4],
    ["adora-cruise-shanghai-5d4n", "Adora Magic City Fly + Cruise 5D4N", "China", "ceb", 5, "5 days 4 nights", 1188, "USD", "cn-cruise-ship", 2],
    ["beijing-5d4n-no-shopping", "Beijing + Universal Studios 5D4N all-in · no shopping", "China", "ceb", 5, "5 days 4 nights", 49888, "PHP", "cn-great-wall", 6],
    ["beijing-shanghai-7d6n", "Beijing – Shanghai 7D6N", "China", "ceb", 7, "7 days 6 nights", 888, "USD", "cn-great-wall", 2],
    ["beijing-shanghai-8d7n", "Beijing – Shanghai 8D7N", "China", "ceb", 8, "8 days 7 nights", 699, "USD", "cn-forbidden-city", 4],
    ["avatar-furong-chongqing-8d7n", "Zhangjiajie (Avatar) – Furong – Chongqing 8D7N", "China", "ceb", 8, "8 days 7 nights", 659, "USD", "cn-chongqing-night", 6],
    ["avatar-furong-no-shopping", "Zhangjiajie (Avatar) – Furong 6D5N · no shopping", "China", "ceb", 6, "6 days 5 nights", 1288, "USD", "cn-zhangjiajie", 3],
    ["avatar-skiing-chongqing-8d7n", "Zhangjiajie (Avatar) Skiing – Chongqing 8D7N", "China", "ceb", 8, "8 days 7 nights", 699, "USD", "cn-chongqing-night", 3],
    ["charming-yunnan-8d7n", "Charming Yunnan: Kunming – Dali – Lijiang 8D7N", "China", "ceb", 8, "8 days 7 nights", 999, "USD", "cn-yunnan", 7],
    ["harbin-7d6n", "Harbin Winter 7D6N", "China", "ceb", 7, "7 days 6 nights", 1888, "USD", "cn-harbin-ice", 1]
  ];
  var F = { c: 'all', from: 'all', len: 'all' };
  var money = function (n, cur) { return cur === 'USD' ? 'US$' + n.toLocaleString('en-US') : peso(n); };
  var SHOW = 14;
  function tours(s, anim) {
    var list = TOURS.filter(function (t) {
      return (F.c === 'all' || t[2] === F.c) && (F.from === 'all' || t[3] === F.from) && (F.len === 'all' || (F.len === '7' ? t[4] >= 7 : t[4] === +F.len));
    });
    list.sort(function (a, b) { return b[9] - a[9] || a[4] - b[4]; });
    var box = $('.im-t-list', s); box.classList.toggle('no-anim', !anim);
    var more = list.length > SHOW ? list.length - (SHOW - 1) : 0, shown = more ? list.slice(0, SHOW - 1) : list;
    box.innerHTML = shown.map(function (t, k) {
      return '<div class="im-t-r" style="--k:' + k + '"><img src="' + IMG(t[8] + '.jpg') + '" alt="" width="72" height="44"><span><b>' + esc(t[1]) + '</b><small>' + t[5] + ' · ' + t[9] + (t[9] === 1 ? ' departure' : ' departures') + ' · from ' + (t[3] === 'ceb' ? 'Cebu' : 'Manila') + '</small></span><em><small>From</small>' + money(t[6], t[7]) + '</em></div>';
    }).join('') + (more ? '<div class="im-t-r im-t-more" style="--k:' + SHOW + '"><span><b>+' + more + ' more</b><small>on the Tours page, with every filter</small></span></div>' : '');
    $('[data-im=tn]', s).textContent = list.length;
    var q = [];
    if (F.c !== 'all') q.push('country=' + F.c.toLowerCase());
    if (F.from !== 'all') q.push('from=' + (F.from === 'ceb' ? 'cebu' : 'manila'));
    if (F.len !== 'all') q.push('len=' + (+F.len >= 6 ? '6+' : '4-5'));
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
  var KY = [0, 1374, 2627, 3467, 4567, 5715, 7170];   // section tops on the 1440 px page, less the sticky header
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
    { q: 'How much is the Hanoi Sapa tour?', a: 'I found 9 packages:<ul><li><b>Sapa – Hanoi – Ha Long Bay 6D4N Charter Tour</b> (with Shopping Stops)<em>6 days 4 nights · From ₱29,888 · Next: Oct 31–Nov 4</em></li><li><b>Sapa – Hanoi – Ha Long Bay Charter Flight 5D3N Tour</b> (with Shopping Stops)<em>5 days 3 nights · From ₱28,888 · Next: Nov 5–8</em></li><li><b>Ha Long Bay – Hanoi – Sapa Charter Flight 5D3N Tour</b> (No Shopping)<em>5 days 3 nights · From ₱32,888 · Next: Nov 19–22</em></li><li>…and 6 more, from Manila and from Cebu</li></ul>', c: ['What’s included?', 'Itinerary', 'Get a quote'] },
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
    ['', 'Cebu Travel Agency: Tours &amp; Tickets | Immaculate Connections', 'Cebu City travel agency: Vietnam tours from Manila, China tours from Cebu, flights, hotels, van and coaster hire, and events. Free quote.', ['Travel agency', 'FAQ']],
    ['tours', 'Vietnam &amp; China Tours from Manila &amp; Cebu | Immaculate Connections', 'Vietnam tours from Manila and China tours from Cebu: Da Nang, Hanoi, Sapa, Shanghai, Beijing, Zhangjiajie and Yunnan, with dates, inclusions and prices.', ['Home › Tour packages', 'FAQ']],
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

  /* ---------------------------------------------------------------- 13 · the client journey (what the site and the agency already say; no promised times) */
  var JOURNEY = {
    tr: { who: 'The traveller', st: [
      ['search', 'Finds you', ['Sees your Facebook post, a Google result or a partner\u2019s link.', 'The package page: your poster, the price, the dates. <b>Ask us</b> answers at any hour.', 'Posts the package link on Facebook and Messenger.']],
      ['chat', 'Asks', ['Taps <b>Request a quote</b>, sends a Messenger message or calls.', 'The inquiry opens with the package and date filled in, and shows a reference straight away.', 'The inquiry lands in Gmail with its <b>ICQ reference</b> in the subject.']],
      ['file', 'Gets a quote', ['Receives the official quotation with the payment details.', 'Has already shown an estimate. <b>No payment is ever taken on the website.</b>', 'Confirms availability for the dates and sends the quotation.']],
      ['check', 'Books', ['Pays as the quotation says. The booking is confirmed once payment is received.', 'Closes each departure date on its travel day, so nobody books a trip that has left.', 'Confirms the booking and arranges tickets, hotel and transport.']],
      ['plane', 'Travels', ['Goes with the group, with the day by day and the Vietnam or China guide on the package page.', 'Keeps the itinerary, inclusions and posters one tap away.', 'Handles the trip: tickets, hotel, air-conditioned vehicles, guides and meals.']],
      ['camera', 'Comes home', ['Shares the photos and tells friends about the trip.', 'The gallery shows real trips, so the next traveller trusts you sooner.', 'Sends the trip photos and videos to TechNext for the gallery.']]
    ] },
    pa: { who: 'The partner', st: [
      ['briefcase', 'Gets a code', ['Receives a personal partner code from your team.', 'Their link opens the <b>partner quotation</b> tab.', 'Decides who gets a code. TechNext adds new codes on request.']],
      ['send', 'Requests', ['Sends one request for their group: route, dates, adults, children, tour leaders, rooms.', 'Gives the request its own <b>ICB reference</b> and a printable copy.', 'Receives the request in Gmail, with the partner type.']],
      ['file', 'Gets rates', ['Gets net or commissionable rates, in the currency they asked for.', 'Never shows a price for a partner request.', 'Prices the group and replies by email.']],
      ['check', 'Books', ['Confirms for their own clients.', 'Package pages they can send their clients: poster, dates, inclusions.', 'Confirms the booking and arranges the trip.']],
      ['plane', 'Group travels', ['Their group travels with your team behind them.', 'The itinerary and the country guide stay on the page.', 'Tickets, hotels, transport and guides.']],
      ['refresh', 'Comes back', ['Shares new package links and filtered lists with their next clients.', 'Every new tour appears for every partner at once.', 'Posts new tours; we put them live.']]
    ] }
  };
  var jw = 'tr', jTok = 0;
  function journey(s, n) {
    var J = JOURNEY[jw];
    $('.im-j-steps', s).innerHTML = J.st.map(function (x, i) {
      return '<li class="' + (i < n ? 'is-done' : i === n ? 'is-on' : '') + '"><button type="button" data-n="' + i + '"><i>' + (ICONS2[x[0]] || '') + '</i><small>' + (i + 1) + '</small><b>' + esc(x[1]) + '</b></button></li>';
    }).join('');
    $('[data-im=jw]', s).textContent = J.who;
    [0, 1, 2].forEach(function (k) { var el = $('[data-im=j' + k + ']', s); el.innerHTML = J.st[n][2][k]; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
  }
  var ICONS2 = {};
  Deck.on('journey', {
    init: function (s) {
      // the build inlines {{icon:*}} as plain SVG; the slide carries the ones it needs in a hidden set
      $$('.im-j-icons span', s).forEach(function (x) { ICONS2[x.dataset.k] = x.innerHTML; });
      journey(s, 0);
    },
    enter: function (ctx, s) {
      var n = 0, tok = ++jTok; journey(s, 0);
      var held = false;
      ctx.on($('.im-j-steps', s), 'click', function (e) { var b = e.target.closest('button[data-n]'); if (!b) return; held = true; n = +b.dataset.n; journey(s, n); });
      ctx.on($('.im-j-seg', s), 'click', function (e) { var b = e.target.closest('button[data-w]'); if (!b) return; jw = b.dataset.w; press($$('.im-j-seg button', s), b); n = 0; journey(s, 0); });
      if (!Deck.reduce) ctx.every(3400, function () { if (held || tok !== jTok) return; n = (n + 1) % 6; journey(s, n); });
    },
    leave: function () { jTok++; },
    settle: function (s) { journey(s, 0); }
  });

  /* ---------------------------------------------------------------- 14 · you send it, we put it live */
  function together(s, n) {
    $$('.im-w-steps li', s).forEach(function (li, i) { li.className = i < n ? 'is-done' : i === n ? 'is-on' : ''; });
    var st = $('.im-w-stage', s); st.classList.remove('s0', 's1', 's2', 's3'); st.classList.add('s' + n);
  }
  var wTok = 0;
  Deck.on('together', {
    init: function (s) { together(s, 3); },
    enter: function (ctx, s) {
      var tok = ++wTok, n = 0, held = false;
      ctx.on($('.im-w-steps', s), 'click', function (e) { var li = e.target.closest('li[data-s]'); if (!li) return; held = true; together(s, +li.dataset.s); });
      if (Deck.reduce) { together(s, 3); return; }
      together(s, 0);
      ctx.every(1800, function () { if (held || tok !== wTok) return false; n++; if (n > 3) return false; together(s, n); });
    },
    leave: function () { wTok++; },
    settle: function (s) { wTok++; together(s, 3); }
  });

  /* ---------------------------------------------------------------- 15 · who does what */
  Deck.on('roles', {
    init: function (s) {
      var seg = $('.im-r-seg', s);
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-r]'); if (!b) return;
        press($$('button', seg), b); var r = b.dataset.r;
        $$('.im-r-row', s).forEach(function (row) { row.classList.toggle('is-dim', r !== 'all' && row.dataset.r !== r && row.dataset.r !== 'both'); });
      });
    }
  });
})();

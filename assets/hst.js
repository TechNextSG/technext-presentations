/* HST Medical: website review, catalogue and AI. Slide behaviour.
   Product names, pack sizes, prices and item codes are HST's own (catalogue of 17 July 2026 and the live store).
   The Ask HST answers are the prototype's real replies on the test link (7 Oct 2026); the "With AI" answers are illustrative.
   Every slide whose finished state comes from JS has a settle hook, so the overview and the PDF show it finished.
   The feedback notes and the question marks are kept for this browser tab (sessionStorage). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  var V = (document.querySelector('script[src*="assets/hst.js"]').src.match(/[?&]v=([^&#]+)/) || [])[1] || '';
  var IMG = function (p) { return 'assets/img/hst/' + p + (V ? '?v=' + V : ''); };
  var store = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function snap(root, fn) { root.classList.add('k-nt'); fn(); void root.offsetWidth; root.classList.remove('k-nt'); }
  // a row of buttons that each show one panel: buttons [data-k], panels [data-k] with .is-on
  function tabs(btns, panels, onPick) {
    function pick(k) {
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === k ? 'true' : 'false'); });
      panels.forEach(function (p) { p.classList.toggle('is-on', p.dataset.k === k); });
      if (onPick) onPick(k);
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.k); }); });
    return pick;
  }

  // jump links anywhere in the deck: data-go="slide id", data-at="build"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.preventDefault(); e.stopPropagation();
    Deck.goId(b.dataset.go, b.dataset.at != null ? +b.dataset.at : 0);
  });

  /* ---------------------------------------------------------------- 1 · cover: the logo performs itself */
  Deck.on('cover', {
    enter: function (ctx, s) {
      if (Deck.reduce || Deck.print) return;
      var lg = $('.kc-logo', s), cd = $('.kc-card', s);
      lg.classList.remove('is-play'); cd.classList.remove('is-play'); void lg.offsetWidth;
      lg.classList.add('is-play'); cd.classList.add('is-play');
    },
    leave: function (s) { $('.kc-logo', s).classList.remove('is-play'); $('.kc-card', s).classList.remove('is-play'); },
    settle: function (s) { $('.kc-logo', s).classList.remove('is-play'); $('.kc-card', s).classList.remove('is-play'); }
  });

  /* ---------------------------------------------------------------- 2 · the brand */
  var BRANDS = {
    rs: { line: 'The pain-relief line shoppers ask for by name: balm, crème, liniment, patch and stick.',
      p: [[3, 'Pain Relief Balm'], [4, 'Crème'], [5, 'Liniment'], [6, 'Pain Relief Patch (Cool)'], [7, 'On-the-Go Medi-Stick']] },
    he: { line: 'Traditional tonics and medicated oils: ginseng, cordyceps, lingzhi, pearl powder and the Heritage® oils.',
      p: [[8, 'American Ginseng'], [9, 'Cordyceps CS-4'], [10, 'Deer Antler'], [11, 'Korean Red Ginseng'], [12, 'Lingzhi Cracked Spores Plus'], [13, 'Deep Sea Squalene'],
        [14, 'Pure Medicinal Pearl Powder'], [16, 'Crocodile Pure Skin Oil'], [17, 'Age-Defying NMN Pearl & Collagen'], [18, 'Gold Lion Rheumatic Oil'], [19, 'Safflower Red Flower Oil'], [20, 'Qian Li Zhui Feng Oil']] },
    hm: { line: 'Cough and cold, joints, sleep, immunity, eyes and vitality: the supplements range.', more: 18,
      p: [[26, 'Alievaid Herbal Drops'], [27, 'Cough Alievaid Herbal Lintus'], [29, 'Ivy Leaf Cough Syrup'], [31, 'Sinus Clear 2-in-1 Inhaler'], [32, 'Arthro Gard Advanced Formula'], [35, 'Vitamin D3 + K2'],
        [38, 'DHA 600'], [42, 'Magnesium Glycinate'], [43, 'Melatonin 5mg'], [46, 'Boost Immune C1000mg'], [15, 'Shou Wu Hair Plus']] },
    zv: { line: "Kids' gummies and jelly sticks for immunity, eyes, brain and daily vitamins.",
      p: [[21, '"Perky Penguin" Elderberry Gummies'], [22, '"Inspector Charley" Lutein Jelly'], [23, '"Safari Buddies" Multivitamin Gummies'], [24, '"Super Panda" Immune Jelly'], [25, '"Professor Skippy" DHA Jelly']] }
  };
  function shelf(s, b, anim) {
    var B = BRANDS[b], box = $('[data-kb=packs]', s);
    box.classList.toggle('no-anim', !anim);
    box.innerHTML = B.p.map(function (x, i) {
      return '<div class="kb-p" style="--k:' + i + '"><img src="' + IMG('p' + (x[0] < 10 ? '0' : '') + x[0] + '.webp') + '" alt="" width="86" height="86" loading="lazy"><span>' + esc(x[1]) + '</span></div>';
    }).join('') + (B.more ? '<div class="kb-p kb-p--more" style="--k:' + B.p.length + '"><b>+' + B.more + '</b><span>more on the site</span></div>' : '');
    $('[data-kb=line]', s).textContent = B.line;
    $$('.kb-seg button', s).forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.b === b ? 'true' : 'false'); });
  }
  Deck.on('brand', {
    init: function (s) {
      tabs($$('.kb-tl button', s), $$('.kb-say p', s));
      $('.kb-seg', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-b]'); if (b) shelf(s, b.dataset.b, !Deck.reduce); });
      shelf(s, 'rs', false);
    },
    enter: function (ctx, s) { var on = $('.kb-seg button[aria-pressed=true]', s); shelf(s, on ? on.dataset.b : 'rs', !Deck.reduce); },
    settle: function (s) { var on = $('.kb-seg button[aria-pressed=true]', s); shelf(s, on ? on.dataset.b : 'rs', false); }
  });

  /* ---------------------------------------------------------------- 3 · what we built: hover pans the page picture */
  document.addEventListener('load', function (e) {
    var t = e.target; if (t.tagName !== 'IMG' || !t.closest('.kw-view') || t.closest('.kw-view--fit')) return;
    t.style.setProperty('--pan', Math.max(0, t.offsetHeight - t.parentNode.offsetHeight) + 'px');
  }, true);

  /* ---------------------------------------------------------------- 4 · the website */
  var URLS = { home: '', shop: 'shop/', pdp: 'products/rheuma-salve-balm/', where: 'where-to-buy/', about: 'about/' };
  Deck.on('site', {
    init: function (s) {
      $('.ks-tabs', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-p]'); if (!b) return;
        var p = b.dataset.p;
        $$('.ks-tabs button', s).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        $$('.ks-pg, .ks-say ul', s).forEach(function (x) { x.classList.toggle('is-on', x.dataset.p === p); });
        $('[data-ks=url]', s).textContent = 'technextsg.github.io/hst-medical-website/' + URLS[p];
      });
    }
  });

  /* ---------------------------------------------------------------- 5 · built to the brief */
  Deck.on('brief', { init: function (s) { tabs($$('.kr-list button', s), $$('.kr-d', s)); } });

  /* ---------------------------------------------------------------- 6 · speed (lab test of the WordPress staging build, 3 Oct 2026) */
  var SPEED = [ // page, FCP s, LCP s, transferred KB
    ['Home', 1.5, 1.5, 327], ['All products', 1.1, 1.1, 186], ['Range page', 1.1, 1.1, 157], ['Product page', 2.2, 2.2, 341], ['Cart', 1.8, 2.3, 323],
    ['About', 0.9, 0.9, 139], ['Contact', 1.0, 1.0, 108], ['Where to buy', 1.1, 1.1, 108], ['Health notes', 1.0, 1.0, 256], ['Longest article', 1.5, 1.5, 207]];
  var MET = {
    lcp: { i: 2, max: 3, ticks: [0, 1, 2, 3], unit: ' s', ref: 2.5, refL: 'good ≤ 2.5 s', cap: 'Seconds until the main content shows. Google\'s "good" line is 2.5 s.' },
    fcp: { i: 1, max: 3, ticks: [0, 1, 2, 3], unit: ' s', ref: 1.8, refL: 'good ≤ 1.8 s', cap: 'Seconds until the first thing shows. Google\'s "good" line is 1.8 s; the product page is the one amber.' },
    kb: { i: 3, max: 450, ticks: [0, 100, 200, 300, 400], unit: ' KB', ref: 400, refL: 'budget 400 KB', cap: 'Everything the page downloads on a first visit, images included.' }
  };
  function speed(s, m, anim) {
    var M = MET[m], plot = $('[data-kp=plot]', s);
    if (!plot.firstChild) {
      var h = '<div class="kp-axis">';
      for (var g = 0; g < 9; g++) h += '<i class="kp-gl"><span></span></i>';
      h += '<i class="kp-ref"><em></em></i></div>';
      SPEED.forEach(function (r, i) { h += '<div class="kp-row" style="top:' + (i * 42) + 'px"><span>' + r[0] + '</span><i class="kp-bar"></i><b class="kp-val"></b></div>'; });
      plot.innerHTML = h;
    }
    plot.classList.toggle('no-anim', !anim);
    $$('.kp-gl', plot).forEach(function (gl, j) {
      var t = M.ticks[j]; gl.style.display = t == null ? 'none' : '';
      if (t != null) { gl.style.left = (t / M.max * 100) + '%'; $('span', gl).textContent = t + M.unit.trim().replace(/^s$/, ' s').replace(/^KB$/, ' KB'); }
    });
    var ref = $('.kp-ref', plot); ref.style.left = (M.ref / M.max * 100) + '%'; $('em', ref).textContent = M.refL;
    $$('.kp-row', plot).forEach(function (row, i) {
      var v = SPEED[i][M.i], f = v / M.max, bar = $('.kp-bar', row), val = $('.kp-val', row);
      bar.classList.toggle('is-warn', v > M.ref);
      bar.style.width = 'calc((100% - 250px) * ' + f + ')';
      val.style.left = 'calc(186px + (100% - 250px) * ' + f + ')';
      val.textContent = (m === 'kb' ? v : v.toFixed(1)) + M.unit;
    });
    $('[data-kp=cap]', s).textContent = M.cap;
    $$('.kp-seg button', s).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.m === m ? 'true' : 'false'); });
  }
  Deck.on('speed', {
    init: function (s) {
      speed(s, 'lcp', false);
      $('.kp-seg', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (b) speed(s, b.dataset.m, true); });
    },
    enter: function (ctx, s) {
      var on = $('.kp-seg button[aria-pressed=true]', s), m = on ? on.dataset.m : 'lcp';
      if (Deck.reduce) { speed(s, m, false); return; }
      var plot = $('[data-kp=plot]', s);
      snap(plot, function () { $$('.kp-bar', plot).forEach(function (b) { b.style.width = '0px'; }); $$('.kp-val', plot).forEach(function (v) { v.style.left = '186px'; }); });
      ctx.after(350, function () { speed(s, m, true); });
    },
    settle: function (s) { var on = $('.kp-seg button[aria-pressed=true]', s); speed(s, on ? on.dataset.m : 'lcp', false); }
  });

  /* ---------------------------------------------------------------- 7 · the catalogue: a book that turns */
  var SPREADS = [
    { l: 0, r: 1, lab: 'Cover' },
    { l: 2, r: 3, lab: 'About us · Rheuma-Salve Balm (pp. 2–3)', card: ['Rheuma-Salve® Pain Relief Balm', [['50g', '410323'], ['50g × 6', '111961'], ['20g', '113897'], ['20g × 2', '112487'], ['20g × 8', '112647']]] },
    { l: 4, r: 5, lab: 'Crème · Liniment (pp. 4–5)', card: ['Rheuma-Salve® Liniment', [['10ml', '113095'], ['10ml × 6', '113453']]] },
    { l: 6, r: 7, lab: 'Patch · Medi-Stick (pp. 6–7)', card: ['Rheuma-Salve® On-the-Go Medi-Stick', [['15g', '114016'], ['15g × 6', '114054']]] },
    { l: 54, r: 0, lab: 'Our Products · the index (p. 54)' }
  ];
  function pageImg(n) { return n ? '<img src="' + IMG('cat-' + ('00' + n).slice(-3) + '.jpg') + '" alt="" draggable="false">' : ''; }
  var BK = { i: 0, busy: false, ctx: null };
  function book(s, i) {
    var sp = SPREADS[i], box = $('[data-kk=spread]', s);
    box.innerHTML = '<div class="kk-pgl' + (sp.l ? '' : ' is-empty') + '">' + pageImg(sp.l) + '</div><div class="kk-pgr' + (sp.r ? '' : ' is-empty') + '">' + pageImg(sp.r) + '</div>';
    BK.i = i; label(s);
  }
  function label(s) {
    var sp = SPREADS[BK.i], card = $('[data-kk=card]', s);
    $('[data-kk=pg]', s).textContent = sp.lab;
    $('[data-kk=prev]', s).disabled = BK.i === 0; $('[data-kk=next]', s).disabled = BK.i === SPREADS.length - 1;
    if (sp.card) {
      $('[data-kk=cname]', s).textContent = sp.card[0];
      $('[data-kk=cpacks]', s).innerHTML = sp.card[1].map(function (p) { return '<span>' + p[0] + '<em>' + p[1] + '</em></span>'; }).join('');
      card.hidden = false;
    } else card.hidden = true;
  }
  function turn(s, dir) {
    var to = BK.i + dir; if (BK.busy || to < 0 || to >= SPREADS.length) return;
    var ctx = BK.ctx, a = SPREADS[BK.i], b = SPREADS[to], box = $('[data-kk=spread]', s);
    if (!ctx || !ctx.alive || Deck.reduce) { book(s, to); return; }
    BK.busy = true;
    var pl = $('.kk-pgl', box), pr = $('.kk-pgr', box), leaf = document.createElement('div');
    leaf.className = 'kk-leaf' + (dir < 0 ? ' is-back' : '');
    // forward: the right page lifts and lands on the left; underneath, the next right page is already there
    leaf.innerHTML = '<div class="kk-fr">' + pageImg(dir > 0 ? a.r : a.l) + '</div><div class="kk-bk">' + pageImg(dir > 0 ? b.l : b.r) + '</div><i class="kk-sh"></i>';
    if (dir > 0) { pr.innerHTML = pageImg(b.r); pr.classList.toggle('is-empty', !b.r); }
    else { pl.innerHTML = pageImg(b.l); pl.classList.toggle('is-empty', !b.l); }
    box.appendChild(leaf);
    var sh = $('.kk-sh', leaf);
    ctx.tween(820, function (p) {
      var ang = p * 180 * (dir > 0 ? -1 : 1);
      leaf.style.transform = 'rotateY(' + ang + 'deg)';
      sh.style.opacity = Math.sin(p * Math.PI) * .9;
    }, 'io').then(function () { book(s, to); BK.busy = false; }, function () { book(s, to); BK.busy = false; });
    BK.i = to; label(s);
  }
  Deck.on('book', {
    init: function (s) {
      book(s, 0);
      $('[data-kk=prev]', s).addEventListener('click', function () { turn(s, -1); });
      $('[data-kk=next]', s).addEventListener('click', function () { turn(s, 1); });
      var bk = $('.kk-book', s), x0 = null, moved = false;
      bk.addEventListener('pointerdown', function (e) { x0 = Deck.point(e).x; moved = false; });
      bk.addEventListener('pointermove', function (e) {
        if (x0 == null || moved) return; var dx = Deck.point(e).x - x0;
        if (Math.abs(dx) > 40) { moved = true; turn(s, dx < 0 ? 1 : -1); }
      });
      bk.addEventListener('pointerup', function (e) {
        if (x0 != null && !moved) { var r = Deck.rect(bk), x = Deck.point(e).x; turn(s, x > r.left + r.width / 2 ? 1 : -1); }
        x0 = null;
      });
      bk.addEventListener('pointercancel', function () { x0 = null; });
    },
    enter: function (ctx, s) {
      BK.ctx = ctx; BK.busy = false;
      if (BK.i === 0 && !Deck.reduce) ctx.after(1100, function () { turn(s, 1); });
    },
    leave: function (s) { BK.ctx = null; BK.busy = false; book(s, BK.i); },
    settle: function (s) { BK.busy = false; book(s, BK.i === 0 ? 1 : BK.i); }
  });

  /* ---------------------------------------------------------------- 8 · catalogue fixes, marked on the page (word boxes from the PDF's text layer, in 1/10000 of the page) */
  var FIX = [
    { p: 8, m: [[2078, 3910, 519, 132], [7163, 8937, 519, 132, 1]], cap: 'p.8 · 110070 under the photo; 111770 in the product list' },
    { p: 27, m: [[5119, 1881, 2077, 294], [5262, 8779, 2031, 132, 1]], cap: 'p.27 · "Herbal Lintus" in the title and the list' },
    { p: 33, m: [[5119, 1638, 2867, 294], [5262, 8788, 2607, 132, 1]], cap: 'p.33 · "Tumeric" in the title and the list' },
    { p: 41, m: [[5119, 2582, 3017, 128]], cap: 'p.41 · "gingko biloba" in the description' },
    { p: 54, m: [[1190, 4664, 876, 260]], cap: 'p.54 · "IMMUNITY & ENERGY" on the index' },
    { p: 54, m: [[3152, 6870, 1113, 147]], cap: 'p.54 · "COUGH,COLD & FLU" on the index' },
    { p: 54, m: [[1190, 2495, 1226, 230]], cap: 'p.54 · "Rheuma-Salve Balm 20g" as its own line' }
  ];
  var LENS = { w: 248, h: 190, k: 2.6, asp: 1273 / 900 };
  function fix(s, i) {
    var F = FIX[i], pad = 70, src = IMG('fix-' + ('00' + F.p).slice(-3) + '.jpg');
    var img = $('[data-kx=img]', s); if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    $('[data-kx=marks]', s).innerHTML = F.m.map(function (b) {
      return '<i class="kx-m' + (b[4] ? ' is-alt' : '') + '" style="left:' + (b[0] - pad) / 100 + '%;top:' + (b[1] - pad) / 100 + '%;width:' + (b[2] + 2 * pad) / 100 + '%;height:' + (b[3] + 2 * pad) / 100 + '%"></i>';
    }).join('');
    var b = F.m[0], cx = (b[0] + b[2] / 2) / 10000, cy = (b[1] + b[3] / 2) / 10000, k = LENS.k, iw = LENS.w * k, ih = iw * LENS.asp;
    var px = (LENS.w / 2 - cx * iw) / (LENS.w - iw) * 100, py = (LENS.h / 2 - cy * ih) / (LENS.h - ih) * 100;
    var lens = $('[data-kx=lensimg]', s);
    lens.style.backgroundImage = 'url("' + src + '")';
    lens.style.backgroundSize = (k * 100) + '% auto';
    lens.style.backgroundPosition = Math.max(0, Math.min(100, px)) + '% ' + Math.max(0, Math.min(100, py)) + '%';
    $('[data-kx=lenscap]', s).textContent = F.cap;
    $('.kx-lens', s).style.top = Math.max(0, Math.min(420, cy * 665 - 110)) + 'px';
    $$('.kx-list button', s).forEach(function (x) { x.setAttribute('aria-pressed', +x.dataset.k === i ? 'true' : 'false'); });
  }
  Deck.on('fixes', {
    init: function (s) {
      $$('.kx-list button', s).forEach(function (b) { b.addEventListener('click', function () { s._kxHeld = true; fix(s, +b.dataset.k); }); });
      fix(s, 0);
    },
    enter: function (ctx, s) {
      s._kxHeld = false; var i = 0; fix(s, 0);
      if (!Deck.reduce) ctx.every(4200, function () { if (s._kxHeld) return; i = (i + 1) % FIX.length; fix(s, i); });
    },
    settle: function (s) { var on = $('.kx-list button[aria-pressed=true]', s); fix(s, on ? +on.dataset.k : 0); }
  });

  /* ---------------------------------------------------------------- 9 · your feedback, typed in during the meeting */
  var KF = 'hst-medical-website:fb', FB = store.get(KF) || {};
  var AREAS = { look: 'Look and feel', home: 'Home page', shop: 'Shop and product pages', buy: 'Checkout, delivery, trade', cat: 'Product catalogue' };
  function fbPaint() {
    var s = document.getElementById('feedback'); if (!s) return;
    var must = 0, nice = 0;
    $$('.kf-a', s).forEach(function (a) {
      var L = FB[a.dataset.a] || [];
      $('.kf-notes', a).innerHTML = L.map(function (n, i) {
        if (n.p === 'nice') nice++; else must++;
        return '<li class="' + (n.p === 'nice' ? 'is-nice' : '') + '" data-i="' + i + '" title="Click to switch must / nice"><span>' + esc(n.t) + '</span><button type="button" aria-label="Remove">×</button></li>';
      }).join('');
      var em = $('[data-kf=n]', a); em.textContent = L.length; em.classList.toggle('is-n', L.length > 0);
    });
    $('[data-kf=must]', s).textContent = must; $('[data-kf=nice]', s).textContent = nice;
  }
  function fbText() {
    var out = ['HST Medical × TechNext: revisions from the website and catalogue review', ''], n = 0;
    Object.keys(AREAS).forEach(function (a) {
      var L = FB[a] || []; if (!L.length) return;
      out.push(AREAS[a]);
      L.filter(function (x) { return x.p !== 'nice'; }).forEach(function (x) { out.push('- [Must] ' + x.t); n++; });
      L.filter(function (x) { return x.p === 'nice'; }).forEach(function (x) { out.push('- [Nice] ' + x.t); n++; });
      out.push('');
    });
    if (!n) out.push('No revisions noted yet.', '');
    return { text: out.join('\n').trim() + '\n', n: n };
  }
  function copyOld(text) {
    var t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(t); return ok;
  }
  function copy(text) {
    return new Promise(function (res, rej) {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(res, function () { if (copyOld(text)) res(); else rej(); });
      else if (copyOld(text)) res(); else rej();
    });
  }
  // copy button + fallback panel + two-click clear, shared by the feedback and the questions slides
  function copyKit(s, pre, build, okMsg, onClear) {
    var say = $('[data-' + pre + '=say]', s), say0 = say.textContent, clr = $('.' + pre + '-clear', s), clr0 = clr.innerHTML, armed = 0, out = $('.' + pre + '-outp', s), area = $('textarea', out);
    $('.' + pre + '-copy', s).addEventListener('click', function () {
      var f = build();
      copy(f.text).then(function () { say.classList.add('is-ok'); say.textContent = okMsg(f); },
        function () { say.classList.remove('is-ok'); say.textContent = 'Shown on the left, ready to copy.'; out.hidden = false; area.value = f.text; area.focus(); area.select(); });
    });
    $('.' + pre + '-x', s).addEventListener('click', function () { out.hidden = true; say.textContent = say0; });
    clr.addEventListener('click', function () {   // two clicks, so a stray one never wipes the meeting's work
      if (!armed) { armed = setTimeout(function () { armed = 0; clr.innerHTML = clr0; }, 3000); clr.textContent = 'Click again to clear everything'; return; }
      clearTimeout(armed); armed = 0; clr.innerHTML = clr0; onClear(); say.classList.remove('is-ok'); say.textContent = say0;
    });
  }
  Deck.on('feedback', {
    init: function (s) {
      $$('.kf-a', s).forEach(function (a) {
        var f = $('.kf-add', a), inp = $('input', f);
        f.addEventListener('submit', function (e) {
          e.preventDefault(); var t = inp.value.trim(); if (!t) return;
          (FB[a.dataset.a] = FB[a.dataset.a] || []).push({ t: t, p: 'must' }); store.set(KF, FB); inp.value = ''; fbPaint();
          var ul = $('.kf-notes', a); ul.scrollTop = ul.scrollHeight;
        });
        inp.addEventListener('keydown', function (e) { if (e.key === 'Escape') { inp.blur(); e.stopPropagation(); } });
        $('.kf-notes', a).addEventListener('click', function (e) {
          var li = e.target.closest('li'); if (!li) return; var L = FB[a.dataset.a] || [], i = +li.dataset.i;
          if (e.target.closest('button')) L.splice(i, 1); else L[i].p = L[i].p === 'nice' ? 'must' : 'nice';
          store.set(KF, FB); fbPaint();
        });
      });
      copyKit(s, 'kf', fbText, function (f) { return 'Copied: ' + f.n + ' revision' + (f.n === 1 ? '' : 's') + ', grouped by area. Paste it into the follow-up email.'; },
        function () { FB = {}; store.set(KF, FB); fbPaint(); });
      fbPaint();
    },
    settle: function () { fbPaint(); }
  });

  /* ---------------------------------------------------------------- 10 · Ask HST, as it answers on the test link today */
  function pc(n, name, sub, why, price) {
    return '<div class="ka-pc"><img src="' + IMG('p' + (n < 10 ? '0' : '') + n + '.webp') + '" alt="" width="48" height="48"><span><b>' + name + '</b><small>' + sub + (why ? ' · ' + why : '') + '</small></span><em>' + price + '<i>Add to bag</i></em></div>';
  }
  var GREET = '<p>Hello, I am Ask HST, an automated shop assistant. I answer from our catalogue only and I am not a pharmacist.</p>';
  var ASK = [
    { q: 'My shoulders are stiff from the computer',
      a: '<p><b>Balm: deep and warming</b></p><p>The classic 50g jar. Best for stiff knees, lower-back ache after a long day and tight shoulders. The balm sits on the skin longer than the crème, so the warming-cooling sensation builds.</p><p class="ka-src">From: Balm, crème, liniment or patch? Choosing the right Rheuma-Salve® format</p><p class="ka-warn">Always read the label and follow the directions for use.</p>' },
    { q: "Something for my kid's cough",
      a: '<p>For dry or irritating cough, these are described for it in our catalogue:</p><div class="ka-prods">' +
        pc(26, 'Alievaid Herbal Drops', 'HST Medical® · 12 lozenges', 'Sore throat and irritating cough', 'S$4.95') +
        pc(29, 'Ivy Leaf Cough Syrup', '12 sachets × 10ml', 'Dry or chesty cough', 'S$11.90') +
        pc(30, 'Ivy Leaf Drops', '12 lozenges', 'Cough and sore throat relief on the go', 'S$4.95') +
        '</div><p class="ka-warn">For children, check the age range on each pack. If this is for a child under 2, someone pregnant or breastfeeding, or taking other medicines, ask a pharmacist or doctor first.</p>' },
    { q: 'Add 2 balms', bag: true,
      a: '<p>Added 2 × Rheuma-Salve® Pain Relief Balm (Single pack), S$20.20.</p><div class="ka-bag"><p>Bag: 2 items, S$20.20. Add S$9.81 more for free delivery.</p><div class="ka-bar"><i></i></div></div>' },
    { q: "I have chest pain and can't breathe", alert: true,
      a: '<p><b>This sounds like it needs urgent medical care, not a shop.</b></p><p>Please call 995 now for an ambulance, or go to the nearest A&amp;E (accident and emergency) department. If someone is with you, ask them to stay with you and tell them what is happening.</p><p class="ka-warn">I am an automated assistant and cannot assess symptoms.</p>' }
  ];
  function askPaint(s, i, fin, ctx) {
    var A = ASK[i], body = $('[data-ka=body]', s), tok = (s._kaTok || 0) + 1; s._kaTok = tok;
    $$('.ka-qs button', s).forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.q === i ? 'true' : 'false'); });
    var bot = '<div class="ka-m ka-m--bot' + (A.alert ? ' ka-m--alert' : '') + '">' + A.a + '</div>';
    var head = '<div class="ka-m ka-m--bot">' + GREET + '</div><div class="ka-m ka-m--me">' + esc(A.q) + '</div>';
    function done() { if (A.bag) { var bar = $('.ka-bar i', body); if (bar) { if (fin) bar.style.transition = 'none'; requestAnimationFrame(function () { bar.style.width = (20.2 / 30 * 100) + '%'; }); } } }
    if (fin || !ctx) { body.innerHTML = head + bot; $('[data-ka=typing]', s).textContent = 'Ask about a product, a need or your bag…'; done(); return; }
    body.innerHTML = '<div class="ka-m ka-m--bot">' + GREET + '</div>';
    var typing = $('[data-ka=typing]', s); typing.textContent = '';
    ctx.type(typing, A.q, 26).then(function () {
      if (s._kaTok !== tok) return;
      typing.textContent = 'Ask about a product, a need or your bag…';
      body.insertAdjacentHTML('beforeend', '<div class="ka-m ka-m--me">' + esc(A.q) + '</div><div class="ka-dots"><i></i><i></i><i></i></div>');
      ctx.after(900, function () {
        if (s._kaTok !== tok) return;
        var d = $('.ka-dots', body); if (d) d.remove();
        body.insertAdjacentHTML('beforeend', bot); done();
      });
    });
  }
  Deck.on('askhst', {
    init: function (s) {
      $('.ka-qs', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-q]'); if (!b) return;
        askPaint(s, +b.dataset.q, Deck.reduce, s._kaCtx);
      });
    },
    enter: function (ctx, s) { s._kaCtx = ctx; askPaint(s, 0, Deck.reduce, ctx); },
    leave: function (s) { s._kaCtx = null; s._kaTok = (s._kaTok || 0) + 1; },
    settle: function (s) { var on = $('.ka-qs button[aria-pressed=true]', s); askPaint(s, on ? +on.dataset.q : 0, true); }
  });

  /* ---------------------------------------------------------------- 11 · rules today vs AI grounded on the labels */
  var BALM = pc(3, 'Rheuma-Salve® Pain Relief Balm', 'Heritage® · 50g', '', 'S$10.10');
  var NEXT = [
    { q: "Can I use the balm if I'm on blood thinners?",
      rules: '<p><b>Rheuma-Salve® Pain Relief Balm: cautions from the catalogue</b></p><p>External use only. Not for broken skin; ask a pharmacist before use in pregnancy or for young children.</p>' + BALM,
      rv: 'Finds the caution, but still offers the balm to buy.', stop: 1,
      ai: ['Mixing medicines is a question for a pharmacist, so I won\'t guess.', 'Please ask your pharmacist or doctor before using the balm while you take blood thinners.', 'From the label: <b>external use only, not for broken skin.</b>'],
      acts: ['Ask the order desk', 'Read the full label'], av: 'Hands over to a pharmacist. Nothing sold.' },
    { q: '我妈妈膝盖痛，早上很僵硬 <small>(My mum\'s knees hurt and are stiff in the morning)</small>', zh: true,
      rules: '<p>I answer from our catalogue and this website only. I can:</p><ul class="kn-menu"><li>add products to your bag: add 2 rheuma salve balm</li><li>suggest products for a need: sore throat, can\'t sleep, knee pain</li><li>show prices, pack sizes, ingredients, how to use and cautions</li><li>compare products, find a store near you, explain delivery</li></ul>',
      rv: 'Doesn\'t understand the Chinese: falls back to the help menu.',
      ai: ['妈妈膝盖痛、早上僵硬，可以考虑 <b>Rheuma-Salve® Pain Relief Balm</b>（50g，S$10.10）。', '标签写明：舒缓关节疼痛，放松酸痛紧绷的肌肉。用法：取少量轻轻涂抹或按摩患处，每天 3 至 4 次。', '如疼痛持续超过一周，请咨询医生。请务必阅读标签，并按照使用说明使用。'],
      card: BALM, av: 'Answers in Chinese, from the English label.' },
    { q: 'My mum is 70 and her knees are stiff every morning. What is easiest for her to use?',
      rules: '<p>For joint pain, these are described for it in our catalogue:</p>' + BALM.replace('Heritage® · 50g', 'Heritage® · 50g · Deep joint and muscle pain, stiffness') +
        pc(18, 'Gold Lion Rheumatic Oil', 'Heritage® · 60ml', 'Swollen and aching joints', 'S$26.00') + pc(20, 'Qian Li Zhui Feng Oil', 'Heritage® · 60ml', 'Joint aches and pains', 'S$17.50') + '<p>If pain persists beyond a week, see a doctor.</p>',
      rv: 'Lists joint products by keyword; doesn\'t answer "easiest".',
      ai: ['For stiff knees, two Rheuma-Salve® formats need no rubbing in:', '<b>On-the-Go Medi-Stick</b> (15g, S$13.00): the label says it is easy to apply, gives quick relief from arthritis and rheumatism, and has less smell.', '<b>Pain Relief Patch (Cool)</b> (8 patches, S$10.10): for joint aches, worn for up to 6 hours.', 'If the pain lasts more than a week, she should see a doctor.'],
      av: 'Picks the easiest formats for her, in the label\'s words.' }
  ];
  function nextPaint(s, i, fin, ctx) {
    var N = NEXT[i], tok = (s._knTok || 0) + 1; s._knTok = tok;
    $$('.kn-seg button', s).forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.q === i ? 'true' : 'false'); });
    $('[data-kn=q]', s).innerHTML = N.q;
    $('[data-kn=rules]', s).innerHTML = N.rules;
    var rv = $('[data-kn=rv]', s), av = $('[data-kn=av]', s); rv.textContent = N.rv; av.textContent = N.av;
    var ai = $('[data-kn=ai]', s), pipe = $$('[data-kn=pipe] li', s);
    var paras = N.ai.map(function (t) { return '<p' + (N.zh ? ' lang="zh"' : '') + '>' + t + '</p>'; }).join('') + (N.acts ? '<div class="kn-acts">' + N.acts.map(function (a) { return '<span>' + a + '</span>'; }).join('') + '</div>' : '') + (N.card || '');
    pipe[3].lastChild.textContent = N.stop ? 'Hands over' : 'Answers';
    function lit(n) { pipe.forEach(function (li, j) { li.classList.toggle('is-on', j < n && !(N.stop === j)); li.classList.toggle('is-stop', j < n && N.stop === j); }); }
    if (fin || !ctx) { lit(4); ai.innerHTML = paras; rv.classList.add('is-on'); av.classList.add('is-on'); return; }
    lit(0); ai.innerHTML = ''; av.classList.remove('is-on'); rv.classList.remove('is-on');
    ctx.after(300, function () { if (s._knTok === tok) rv.classList.add('is-on'); });
    [1, 2, 3, 4].forEach(function (n, j) { ctx.after(350 + j * 380, function () { if (s._knTok === tok) lit(n); }); });
    ctx.after(350 + 4 * 380, function () {
      if (s._knTok !== tok) return;
      ai.innerHTML = paras;
      var kids = [].slice.call(ai.children);
      kids.forEach(function (k) { k.style.opacity = 0; k.style.transform = 'translateY(6px)'; k.style.transition = 'opacity .35s, transform .45s cubic-bezier(.2,.8,.2,1)'; });
      kids.forEach(function (k, j) { ctx.after(60 + j * 320, function () { if (s._knTok === tok) { k.style.opacity = 1; k.style.transform = 'none'; } }); });
      ctx.after(80 + kids.length * 320, function () { if (s._knTok === tok) av.classList.add('is-on'); });
    });
  }
  Deck.on('ainext', {
    init: function (s) {
      $('.kn-seg', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-q]'); if (b) nextPaint(s, +b.dataset.q, Deck.reduce, s._knCtx); });
      nextPaint(s, 0, true);
    },
    enter: function (ctx, s) { s._knCtx = ctx; var on = $('.kn-seg button[aria-pressed=true]', s); nextPaint(s, on ? +on.dataset.q : 0, Deck.reduce, ctx); },
    leave: function (s) { s._knCtx = null; s._knTok = (s._knTok || 0) + 1; },
    settle: function (s) { var on = $('.kn-seg button[aria-pressed=true]', s); nextPaint(s, on ? +on.dataset.q : 0, true); }
  });

  /* ---------------------------------------------------------------- 12 · where AI fits */
  Deck.on('aimap', { init: function (s) { tabs($$('.km-list button', s), $$('.km-d', s)); } });

  /* ---------------------------------------------------------------- 13 · what AI search reads (the prototype's real files) */
  var FILES = ['hst-medical-website/llms.txt', 'products/rheuma-salve-balm/ · JSON-LD', 'products/rheuma-salve-balm/ · the HTML'];
  Deck.on('geo', { init: function (s) { tabs($$('.kg-src button', s), $$('.kg-c', s), function (k) { $('[data-kg=file]', s).textContent = FILES[+k]; }); } });

  /* ---------------------------------------------------------------- 14 · scope */
  var SCOPE = [
    'A GeneratePress child theme with the classic template files, built to the design you approve on the test link. Classic Editor and Classic Widgets only.',
    'All 51 products with their pack sizes and prices; product, cart and checkout pages styled to the design; Singapore delivery rules.',
    'Products, health notes, the store list and your pages moved from the current site, with 301 redirects so old links and search rankings carry over.',
    'Product, FAQ and breadcrumb schema, a sitemap, llms.txt and clean permalinks; the sitemap submitted to Google Search Console at launch.',
    'The three RFP deliverables: the Core Web Vitals report, a clean WordPress Theme Check, and the editor guide for widgets, menus and products.',
    'Staging on your hosting for your team to test, then the move to hstmedical.com and a check of every redirect after launch.'
  ];
  Deck.on('scope', {
    init: function (s) {
      var say = $('[data-kq=say]', s), btns = $$('.kq-list button', s);
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-pressed') !== 'true';
          btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b && on ? 'true' : 'false'); });
          say.textContent = on ? SCOPE[+b.dataset.k] : 'Click a line for what it covers.';
        });
      });
    }
  });

  /* ---------------------------------------------------------------- 15 · next steps */
  Deck.on('next', {
    init: function (s) {
      var btns = $$('.kt-steps button', s), fill = $('[data-kt=fill]', s);
      tabs(btns, $$('.kt-d', s), function (k) {
        btns.forEach(function (b) { b.classList.toggle('is-done', +b.dataset.k < +k); });
        fill.style.width = (+k / 5 * 100) + '%';
      });
    }
  });

  /* ---------------------------------------------------------------- 16 · questions at the back */
  var KQ = 'hst-medical-website:q', Q = store.get(KQ) || {};
  function qBtns() { var s = document.getElementById('questions'); return s ? $$('.kz-g button[data-q]', s) : []; }
  function clean(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function paintQ() {
    var ok = 0, fu = 0, s = document.getElementById('questions'); if (!s) return;
    qBtns().forEach(function (b) {
      var v = Q[b.dataset.q] || '';
      if (v) b.dataset.s = v; else b.removeAttribute('data-s');
      b.setAttribute('aria-label', 'Question ' + b.dataset.q + ': ' + clean($('span', b)) + (v === 'ok' ? ', answered' : v === 'fu' ? ', to follow up' : ', open'));
      if (v === 'ok') ok++; else if (v === 'fu') fu++;
    });
    $('[data-kz=ok]', s).textContent = ok; $('[data-kz=fu]', s).textContent = fu; $('[data-kz=open]', s).textContent = qBtns().length - ok - fu;
  }
  function followUp() {
    var g = { fu: [], open: [], ok: [] };
    qBtns().forEach(function (b) { g[Q[b.dataset.q] || 'open'].push(b.dataset.q + '. ' + clean($('span', b))); });
    var out = ['HST Medical × TechNext: follow-up from the website review', ''];
    if (g.fu.length) out.push('To follow up (' + g.fu.length + ')', g.fu.join('\n'), '');
    if (g.open.length) out.push('Still open (' + g.open.length + ')', g.open.join('\n'), '');
    if (g.ok.length) out.push('Answered in the meeting (' + g.ok.length + ')', g.ok.join('\n'), '');
    var f = fbText(); if (f.n) out.push('', f.text.replace(/^HST Medical × TechNext: /, 'Also: '));
    return { text: out.join('\n').trim() + '\n', n: [g.fu.length, g.open.length, f.n] };
  }
  Deck.on('questions', {
    init: function (s) {
      $('.kz-cols', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-q]'); if (!b) return;
        var id = b.dataset.q, v = Q[id] || '';
        Q[id] = v === '' ? 'ok' : v === 'ok' ? 'fu' : '';
        store.set(KQ, Q); paintQ();
      });
      copyKit(s, 'kz', followUp, function (f) { return 'Copied: ' + f.n[0] + ' to follow up, ' + f.n[1] + ' still open' + (f.n[2] ? ', and ' + f.n[2] + ' revisions' : '') + '. Paste it into the follow-up email.'; },
        function () { Object.keys(Q).forEach(function (k) { delete Q[k]; }); store.set(KQ, Q); paintQ(); });
      paintQ();
    },
    settle: function () { paintQ(); }
  });
})();

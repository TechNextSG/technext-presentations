/* birmove: the shared kit for the four BIR client decks (T&S Global, MOL Enterprise, Laguna Metts, TTI Laguna). Prefix bm-.
   One camera journey along ONE compliance pipeline: Order, Invoice, EIS, Books, BIR forms, Audit trail. The kit renders every slide
   the four decks share from window.BM; a deck adds only its own unique "move" slide (slide 8) in assets/<slug>.css|js.

   LOAD ORDER (all with ?v={{v}}): {{head}} -> motion.css -> birmove.css -> <slug>.css ; deck.js -> motion.js -> vendor/motion-11.11.17.js
   -> inline <script>window.BM = {...}</script> -> birmove.js -> <slug>.js. Body: data-motion="mx" data-home="./" data-label="...".
   Put {{include:bm-kit}} once inside <body> (icon + QR templates the kit reads).

   SLIDE SHELLS (in the deck html, in this order; the kit fills each [data-kit] section after the engine's chrome, before the footer and keeps
   the section's <aside class="notes"> untouched, so speaker notes stay in the deck). Slide 8 is the deck's own markup.
     <section class="slide dark cover" id="cover"     data-kit="cover"     data-chrome="none" data-title="..."><aside class="notes">..</aside></section>
     <section class="slide" id="heard"                data-kit="understand" data-title="...">
     <section class="slide" id="rules"                data-kit="rules"      data-title="...">
     <section class="slide" id="pipe"     data-group="pipe" data-kit="pipe-map"     data-title="...">
     <section class="slide" id="invoice"  data-group="pipe" data-kit="pipe-invoice" data-steps="2" data-title="...">
     <section class="slide" id="books"    data-group="pipe" data-kit="pipe-books"   data-title="...">
     <section class="slide" id="forms"    data-group="pipe" data-kit="pipe-forms"   data-title="...">
     <section class="slide" id="move" ...>   (the deck's own slide 8)
     <section class="slide" id="later"     data-kit="later"     data-title="...">
     <section class="slide" id="questions" data-kit="questions" data-title="...">
     <section class="slide dark" id="close" data-kit="close" data-chrome="foot" data-title="...">
   (dark and data-chrome must be in the HTML: the engine reads them when it builds the chrome.)

   window.BM SCHEMA (every string is plain text and gets escaped, except fields ending in H, h1 and h2, which are HTML: use <span class="hl">).
   {
     slug: 'ts-global-odoo-bir',                  // sessionStorage key prefix for ticks
     urgent: false,                               // true (TTI): the rules slide makes the day counter the hero, headline "<hl>N days</hl> to 31 December 2026."
     client: {
       name: 'T&S Global Services',               // used in kickers, copy text, nameplate
       short: 'T&S',                              // optional, used in the understand headline
       logo: 'assets/img/clients/mol-enterprise.svg?v=..',   // MOL only. Others: omit, a type nameplate (Plus Jakarta 800 on a white tile) is drawn
       accent: '#4F6D8A',                         // the ONE client accent: track tail, fields (22% tint), highlights
       industry, system, need                     // free text, available to your own slide 8
     },
     cover: { kicker: 'for t&s global services', h1: 'From QuickBooks to <span class="hl">books set up for the BIR.</span>',
              lead: 'one sentence', system: 'QuickBooks',            // the name on the ledger cards in the hero
              buckets: ['Chart of accounts','Customers and suppliers','Open invoices and bills','Opening balances'],   // optional (4)
              date: 'Discovery draft · October 2026' },               // optional
     understand: { h2: 'optional HTML override (default: "Three guesses about <short>. <hl>Tell us which are wrong.</hl>")',
              lines: [['industry','Manufacturing','Manufacturing'], ['today','Running on QuickBooks','QuickBooks'], ['need','Needs BIR EIS and CAS compliance','BIR EIS and CAS compliance']],
                                                        // [label, text, emphasised substring]; only the 'today' line (the current system name) is highlighted
              guesses: ['3 strings: pain points as guesses'], illus: 'optional foot note' },
     rules:  { h2: 'optional HTML override (urgent builds its own)' },
     pipe:   { map: {h2}, invoice: {h2}, books: {h2}, forms: {h2},     // optional headline overrides (keep to one line, about 52 characters)
               stations: [ {cap:'one-line caption'} x6 ] },            // optional caption overrides for Order, Invoice, EIS, Books, BIR forms, Audit trail
     invoice: { orderLabel: 'Sales order',                              // MOL: 'Service order'
                buyer: 'Sample customer 01',
                lines: [['Machined bracket, 40 mm', 120, 85], ['Stamped cover plate', 60, 140], ['Packing and labelling', 1, 650]],   // [description, qty, unit price, vat?]; 3 lines
                                                                        // vat = 'zero': a zero-rated line (TTI export). The kit totals VATable, zero-rated and VAT 12% and draws the note row;
                                                                        // the order card, the invoice, the credit note and the ledger all read the same numbers.
                creditLabel: 'Return:',                                 // MOL: 'Adjustment:'
                stepCaps: ['Draft. ...', 'Confirm. ...', 'A return arrives. ...'],   // optional: the three step captions of the invoice slide
                illus: 'optional foot note (default: "Sample customer, numbers and prices, labelled as sample · not data from <client>")',
                unit: 'pcs' },                                          // optional
     later:  { h2: optional, apps: ['stock','purchase','mrp','quality_control','maintenance','mrp_plm'],  // any number of Odoo module names (assets/img/odoo/<m>.svg), or {m, n, u}; spaced 360/n around the ring
               extras: [{n:'Multi-currency', at:'account', u:'one line'}, {n:'Landed costs on imported stock', at:'stock', u:'..'}],   // optional (TTI): 'account' pills sit below the ring, others beside their app
               lead: 'optional panel line' },
     questions: { h2: optional, items: [8 strings] },
     close:  { h2: 'Next step headline <span class="hl">..</span>', lead: 'one sentence' }
   }

   KIT HOOKS for a deck's own script (window.BMK):
     BMK.S[kind]            the section of each kit slide ('cover','understand','rules','pipe-map','pipe-invoice','pipe-books','pipe-forms','later','questions','close')
     BMK.ico(name)          inline svg string of an icon ({{icon:name}} set, see _src/partials/bm-kit.html)
     BMK.plate(small)       the client nameplate html (tile with logo or type nameplate)
     BMK.kick(text, delayMs)   the Caveat kicker line (every light slide and the close has one; BM.kickers = {understand, rules, map, invoice, books, forms, later, questions, close} overrides the defaults; on your own slide use BMK.kick(text) and an h2 at --d:80ms)
     BMK.peso(n) / BMK.num(n,d) / BMK.esc(s)
     BMK.live()             false under reduced motion and TV mode: jump to finished states, no springs or loops
     BMK.spring(st, el, props, opts)   Motion.animate with a house spring; st = {mo:[]} bag, stop with BMK.stop(st)
     BMK.drive(st, fn, opts) a spring that calls fn(p), p running 0 -> 1: write your own styles in fn (a stopped control never writes again)
     BMK.stop(st)           stops every stored Motion control of that bag (call in leave)
     BMK.load(key) / BMK.save(key, obj)   sessionStorage under BM.slug (try/catch)
     BMK.daysLeft()         days from today to 31 Dec 2026
     BMK.split(h)           word-split a headline you render yourself (motion kit)
     BMK.accent             {hex, ink, lite, tint}
     BMK.extend(kind, {enter(ctx, s), settle(s), leave(s)})   a deck's own code that rides on a kit hook (the kit slide kinds above plus 'close'); called after the kit's own hook body,
                                                        so it never replaces it (no Deck.on wrapping). Call it any time before the slide opens.
     BMK.shared             true in a share copy (body[data-shared]); BMK.readOnly(btn) makes a button aria-disabled and tabindex -1
     CSS classes for your slide 8: .bm-h2 (use .h-m), .bm-bar (foot caption bar y 744-790), .bm-btn, .bm-chip, .bm-ill (illus lifted to bottom 68px),
     vars --bm-a --bm-a-rgb --bm-a-ink --bm-a-lite --bm-a-tint --bm-muted --bm-amber-fill (white text on amber).
     NO background fields, bands, washes, masks, blurs or greyed icons anywhere (user rule, 26 Oct): content sits on the plain paper.
   Every animation runs through ctx or a stored Motion control stopped in leave; settle paints the finished state (print, overview, PDF); under
   Deck.reduce and .deck.is-tv there are no springs or loops. Share copies (body[data-shared]) hide presenter tools and make tick lists read-only for the keyboard too. */
(function () {
  'use strict';
  var BM = window.BM, Deck = window.Deck;
  if (!BM || !Deck) return;
  var doc = document, root = doc.querySelector('.deck'), stage = root.querySelector('.stage');
  var MXOK = doc.body.hasAttribute('data-motion');
  var C = BM.client || {};

  /* ================================================================ helpers */
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || doc).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function num(n, d) { d = d == null ? 2 : d; return Number(n).toLocaleString('en-PH', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function peso(n) { return '₱' + num(n); }
  function live() { return !(Deck.reduce || Deck.tv); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function eio(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function eout(t) { return 1 - Math.pow(1 - t, 3); }
  function swap(el) { el.classList.remove('bm-swap'); void el.offsetWidth; el.classList.add('bm-swap'); }
  function inz(d, fx, st) { return ' data-in' + (fx ? ' data-fx="' + fx + '"' : '') + ' style="' + (st ? st + ';' : '') + '--d:' + d + 'ms"'; }
  var ICO = null;
  function ico(n) {
    if (!ICO) { ICO = {}; var t = doc.getElementById('bm-ico'); if (t) $$('[data-n]', t.content).forEach(function (e) { ICO[e.getAttribute('data-n')] = e.innerHTML; }); }
    return ICO[n] || '';
  }
  function qr() { var t = doc.getElementById('bm-qr'); return t ? t.innerHTML : ''; }
  function odoo(m, px) { return '<img class="bm-oi" src="assets/img/odoo/' + m + '.svg" alt="" width="' + px + '" height="' + px + '" style="width:' + px + 'px;height:' + px + 'px">'; }
  var KEY = BM.slug || 'bm';
  function load(k) { try { return JSON.parse(sessionStorage.getItem(KEY + ':' + k)) || {}; } catch (e) { return {}; } }
  function save(k, v) { try { sessionStorage.setItem(KEY + ':' + k, JSON.stringify(v)); } catch (e) { } }

  // colours
  function h2r(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1'); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function r2h(a) { return '#' + a.map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }
  function mix(a, b, t) { var A = h2r(a), B = h2r(b); return r2h(A.map(function (v, i) { return v + (B[i] - v) * t; })); }
  function lum(h) { var c = h2r(h).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  function cr(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  // the client's ONE accent. ink = the accent pulled toward navy until it holds 5.6:1 on white (so it still clears 4.5:1 on the tints);
  // tint / tint2 = the accent itself thinned with white (no blue mixed in), hl = the marker band under headlines on light slides
  var ACC = { hex: C.accent || '#4F6D8A' };
  (function () { var t = .2; ACC.ink = mix(ACC.hex, '#1F1F3D', t); while (cr(ACC.ink, '#FFFFFF') < 5.6 && t < 1) { t += .04; ACC.ink = mix(ACC.hex, '#1F1F3D', t); } })();
  ACC.lite = mix(ACC.hex, '#FFFFFF', .5); ACC.tint = mix(ACC.hex, '#FFFFFF', .82); ACC.tint2 = mix(ACC.hex, '#FFFFFF', .9); ACC.hl = mix(ACC.hex, '#FFFFFF', .62);
  root.style.setProperty('--bm-a', ACC.hex); root.style.setProperty('--bm-a-rgb', h2r(ACC.hex).join(','));
  root.style.setProperty('--bm-a-ink', ACC.ink); root.style.setProperty('--bm-a-lite', ACC.lite);
  root.style.setProperty('--bm-a-tint', ACC.tint); root.style.setProperty('--bm-a-tint2', ACC.tint2); root.style.setProperty('--bm-hl', ACC.hl);

  // share copies (body[data-shared]) are read-only for the keyboard too: every tick / toggle handler checks SHARED, and those buttons are aria-disabled + tabindex -1
  var SHARED = doc.body.hasAttribute('data-shared');
  function readOnly(b) { b.setAttribute('aria-disabled', 'true'); b.tabIndex = -1; }
  // a deck's own code rides on a kit hook (BMK.extend); the kit calls it after its own hook body
  var EXT = {};
  function extend(kind, h) { (EXT[kind] = EXT[kind] || []).push(h); }
  function callExt(kind, name, a, b) { (EXT[kind] || []).forEach(function (h) { if (h[name]) { try { h[name](a, b); } catch (e) { if (window.console) console.error(e); } } }); }

  // the motion kit's headline split (motion.js does not export it, and the kit renders its headlines after motion.js ran)
  function split(h) {
    if (!MXOK || h.classList.contains('mx-words')) return;
    var n = 0, cls = /h-xl/.test(h.className) ? 'h-xl' : /h-l\b/.test(h.className) ? 'h-l' : 'h-m', GAP = { 'h-xl': 84, 'h-l': 70, 'h-m': 58 };   // a little quicker than the motion kit's own stagger so a slide is built by ~1.4 s
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 1) { walk(c); return; }
        if (c.nodeType !== 3 || !c.nodeValue.trim()) return;
        var frag = doc.createDocumentFragment();
        c.nodeValue.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(doc.createTextNode(' ')); return; }
          var o = doc.createElement('span'), i = doc.createElement('span');
          o.className = 'mx-w'; i.className = 'mx-wi'; i.textContent = w; i.style.setProperty('--wi', n++);
          o.appendChild(i); frag.appendChild(o);
        });
        node.replaceChild(frag, c);
      });
    })(h);
    var gap = GAP[cls], d = parseFloat(h.style.getPropertyValue('--d')) || 0;
    h.style.setProperty('--wg', gap + 'ms'); h.classList.add('mx-words');
    $$('.hl', h).forEach(function (hl) { hl.style.setProperty('--hd', Math.round(d * .85 + n * gap + 90) + 'ms'); });
    if (!h.getAttribute('aria-label')) h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
  }

  function spring(st, el, props, o) {
    if (!window.Motion || !Motion.animate) return null;
    var a = Motion.animate(el, props, Object.assign({ type: 'spring', stiffness: 300, damping: 22 }, o || {}));
    if (st) st.mo.push(a);
    return a;
  }
  // a spring that only calls fn(p) with p running 0 -> 1 (may overshoot): the caller writes its own styles, so a stopped control can never write again
  function drive(st, fn, o) {
    if (!window.Motion || !Motion.animate) { fn(1); return null; }
    var a = Motion.animate(0, 1, Object.assign({ type: 'spring', stiffness: 300, damping: 22, onUpdate: fn }, o || {}));
    if (st) st.mo.push(a);
    return a;
  }
  function stopMo(st) { st.mo.forEach(function (a) { try { a.stop(); } catch (e) { } }); st.mo = []; }

  var DEADLINE = new Date(2026, 11, 31), RMCD = new Date(2026, 8, 22);
  function today0() { var t = new Date(); t.setHours(0, 0, 0, 0); return t; }
  function daysLeft() { return Math.max(0, Math.round((DEADLINE - today0()) / 864e5)); }

  /* ================================================================ slide registry */
  var S = {};
  $$('[data-kit]').forEach(function (s) { S[s.getAttribute('data-kit')] = s; });
  function put(s, html) { var f = $('.s-foot', s); if (f) f.insertAdjacentHTML('beforebegin', html); else s.insertAdjacentHTML('beforeend', html); }
  function go(kind) { if (S[kind]) Deck.goId(S[kind].id); }
  function plate(sm) {
    var h = sm === 'chrome' ? 24 : sm ? 40 : 52;
    return '<span class="bm-plate' + (sm === 'chrome' ? ' bm-plate--chrome' : sm ? ' bm-plate--sm' : '') + '">' + (C.logo ? '<img src="' + esc(C.logo) + '" alt="' + esc(C.name) + '" height="' + h + '" style="height:' + h + 'px;width:auto">' : '<b>' + esc(C.plate || C.name) + '</b>') + '</span>';
  }
  function lockup(sm) {
    return '<img class="cv-logo' + (sm ? ' cv-logo--sm' : '') + '" src="assets/img/logo-horizontal-white.png" alt="TechNext" width="' + (sm ? 190 : 240) + '" height="' + (sm ? 38 : 48) + '"><i></i>' + plate(sm);
  }
  function h2html(d, html, extra) { return '<h2 class="h-m bm-h2' + (extra ? ' ' + extra : '') + '"' + inz(d) + '>' + html + '</h2>'; }
  var KK = Object.assign({ understand: 'what we understand', rules: 'the rules in plain words', map: 'your pipeline', invoice: 'one invoice', books: 'eis and books', forms: 'forms and trail', later: 'later phases', questions: 'for our call', close: 'next step' }, BM.kickers || {});
  function kick(text, d) { return '<span class="kicker"' + inz(d || 0) + '>' + esc(text) + '</span>'; }
  function hd(k, html, extra) { return kick(KK[k], 0) + h2html(80, html, extra); }
  function finish(s) { $$('.h-m[data-in],.h-xl[data-in]', s).forEach(split); }

  // the client nameplate beside the TechNext logo in every slide's chrome (do not also set data-cobrand)
  $$('.s-chrome .s-brand').forEach(function (b) { b.insertAdjacentHTML('beforeend', '<i class="s-x"></i>' + plate('chrome')); });

  // jump links (the cover agenda)
  stage.addEventListener('click', function (e) {
    var a = e.target.closest('[data-bmgo]'); if (!a) return;
    e.preventDefault(); go(a.getAttribute('data-bmgo'));
  });

  /* ================================================================ 1 · cover */
  var CV = BM.cover || {};
  var BUCKETS = CV.buckets || ['Chart of accounts', 'Customers and suppliers', 'Open invoices and bills', 'Opening balances'];
  function coverHTML() {
    var sys = CV.system || C.system || 'Your current system';
    var h = '<div class="cv-copy bm-cv">' +
      '<div class="bm-lock"' + inz(0) + '>' + lockup(false) + '</div>' +
      '<span class="kicker"' + inz(120) + '>' + esc(CV.kicker || 'for ' + (C.name || '').toLowerCase()) + '</span>' +
      '<h1 class="h-xl bm-h1"' + inz(200) + '>' + CV.h1 + '</h1>' +
      '<p class="lead"' + inz(320) + '>' + esc(CV.lead || '') + '</p>' +
      '<nav class="bm-agenda"' + inz(420) + ' aria-label="Parts of this deck">' +
      '<button type="button" data-bmgo="understand"><i>01</i>What we understand</button>' +
      '<button type="button" data-bmgo="rules"><i>02</i>The rules</button>' +
      '<button type="button" data-bmgo="pipe-map"><i>03</i>Your pipeline</button>' +
      '<button type="button" data-bmgo="close"><i>04</i>Next steps</button></nav>' +
      '<div class="cv-tags"' + inz(500) + '><span class="tag tag--badge"><img src="assets/img/odoo-ready-partner.png" alt="" width="52" height="25">Odoo Ready Partner</span><span class="tag">' + ico('calendar') + esc(CV.date || 'Discovery draft · October 2026') + '</span></div>' +
      '</div>' +
      '<p class="hint cv-hint"' + inz(760) + '><kbd>→</kbd> or click to begin <span class="cv-hint-sep">·</span> <kbd>O</kbd> all slides</p>';
    // hero: the current system's ledgers travel a curved track into Odoo Accounting
    h += '<div class="bm-hero" aria-hidden="true"' + inz(160, 'fade') + '>' +
      '<svg class="bm-hero-svg" viewBox="0 0 640 600" width="640" height="600"><defs><linearGradient id="bm-hg" x1="0" x2="1" y1="0" y2="0"><stop offset="0" style="stop-color:#6FA0F5"/><stop offset="1" style="stop-color:var(--bm-a-lite)"/></linearGradient></defs>' +
      '<path class="bm-hero-tie" d="M130 470 C 250 470, 250 300, 440 300"/><path class="bm-hero-path" d="M130 470 C 250 470, 250 300, 440 300"/>' +
      '<circle cx="130" cy="470" r="9" class="bm-hero-dot"/></svg>';
    var long = sys.length > 12;   // a long system name ("SAP Business One") takes the whole card header: no "ledger" tag beside it
    for (var i = 0; i < 4; i++) h += '<div class="bm-lg' + (long ? ' bm-lg--long' : '') + '" data-i="' + i + '"><header><b>' + esc(sys) + '</b>' + (long ? '' : '<small>ledger</small>') + '</header><p>' + esc(BUCKETS[i]) + '</p><i></i><i></i><i></i></div>';
    h += '<div class="bm-oc"><header>' + odoo('account', 34) + '<b>Odoo Accounting</b></header><ul>';
    for (var k = 0; k < 4; k++) h += '<li data-r="' + k + '"><span>' + ico('check') + '</span>' + esc(BUCKETS[k]) + '</li>';
    h += '</ul><footer>Invoices, books and BIR forms in one Odoo</footer></div>';
    // urgent decks: the live day count sits on top of Odoo Accounting
    if (BM.urgent) h += '<div class="bm-cd"><b class="bm-cd-n">' + daysLeft() + '</b><span>days to<small>31 December 2026</small></span></div>';
    h += '<p class="bm-hero-cap">sample movement of ' + esc(sys) + ' data into Odoo</p></div>';
    return h;
  }
  // SET = a finished moment of the loop: all four ledgers have landed and ticked, none is left mid-flight behind the Odoo card (print, overview, reduced motion)
  var HERO = { CYC: 6600, T0: 300, GAP: 1250, TR: 1150, SET: 5700 };
  function initHero(s) {
    var art = $('.bm-hero', s), path = $('.bm-hero-path', art), L = path.getTotalLength(), cards = $$('.bm-lg', art), rows = $$('.bm-oc li', art), oc = $('.bm-oc', art);
    var last = { t: -1, r: [] };
    function pt(len) { var p = path.getPointAtLength(len); return p; }
    s._hero = function (t) {
      t = t % HERO.CYC;
      var p = cards.map(function (c, i) { return (t - (HERO.T0 + i * HERO.GAP)) / HERO.TR; });
      var pulse = 0;
      cards.forEach(function (c, i) {
        var pi = p[i], d = [], rank = 0, j;
        for (j = 0; j < i; j++) rank += 1 - clamp(p[j] * 3, 0, 1);
        var x, y, sc = 1, rot = -2 + rank * 0.8, op = 1;
        if (pi <= 0) {
          var o = pt(0); x = o.x - rank * 9; y = o.y - rank * 11; op = clamp(t / 420, 0, 1);
        } else if (pi < 1) {
          var e = eio(pi), q = pt(L * e); x = q.x; y = q.y; sc = lerp(1, .8, e); rot = lerp(rot, 0, e); op = pi > .7 ? 1 - (pi - .7) / .3 : 1;
        } else { x = 440; y = 300; op = 0; }
        if (pi >= 1) pulse = Math.max(pulse, Math.exp(-(pi - 1) * HERO.TR / 260));
        c.style.transform = 'translate(' + (x - 105) + 'px,' + (y - 62) + 'px) rotate(' + rot + 'deg) scale(' + sc + ')';
        c.style.opacity = op; c.style.zIndex = 10 - i;
      });
      rows.forEach(function (r, i) { var on = p[i] >= .97; if (last.r[i] !== on) { last.r[i] = on; r.classList.toggle('is-on', on); } });
      oc.style.transform = 'scale(' + (1 + .022 * pulse) + ')';
    };
  }
  function countOpts(n) { return { from: n + 90, dur: 1300, ease: Deck.ease && Deck.ease.softLand ? 'softLand' : 'out' }; }
  Deck.on(S.cover && S.cover.id || '_none', {
    init: function (s) { initHero(s); },
    enter: function (ctx, s) {
      if (live()) ctx.frame(function (t) { s._hero(t); }); else s._hero(HERO.SET);
      var cd = $('.bm-cd-n', s);
      if (cd) { var d = daysLeft(); if (live()) ctx.count(cd, d, countOpts(d)); else cd.textContent = d; }
      callExt('cover', 'enter', ctx, s);
    },
    leave: function (s) { callExt('cover', 'leave', s); },
    settle: function (s) { s._hero(HERO.SET); var cd = $('.bm-cd-n', s); if (cd) cd.textContent = daysLeft(); callExt('cover', 'settle', s); }
  });

  /* ================================================================ 2 · understand */
  var UD = BM.understand || {};
  function emph(t, e) { var i = e ? t.indexOf(e) : -1; return i < 0 ? esc(t) : esc(t.slice(0, i)) + '<span class="bm-em">' + esc(e) + '</span>' + esc(t.slice(i + e.length)); }
  function understandHTML() {
    var lines = UD.lines || [['industry', C.industry || '', C.industry], ['today', C.system || '', C.system], ['need', C.need || '', C.need]];
    var longest = 0; lines.forEach(function (l) { longest = Math.max(longest, String(l[1]).length); });
    // the headline does not repeat the kicker ("what we understand"): it says what the slide asks of the room
    var h = hd('understand', UD.h2 || 'Three guesses about ' + esc(C.short || C.name) + '. <span class="hl">Tell us which are wrong.</span>') +
      '<div class="bm-stmt' + (longest > 30 ? ' bm-stmt--s' : '') + '">';
    lines.forEach(function (l, i) {
      // ONE highlighted phrase: the current system (the second line); the other two lines stay plain
      h += '<p class="bm-sl"' + inz(200 + i * 110) + '><small>' + esc(l[0]) + '</small><span>' + (i === 1 ? emph(l[1], l[2]) : esc(l[1])) + '</span></p>';
    });
    h += '</div><div class="bm-gs"><p class="bm-gs-h"' + inz(420) + '>Our guesses <span>True, or not us?</span></p><div class="bm-gl">';
    (UD.guesses || []).forEach(function (g, i) {
      h += '<div class="bm-g" data-g="' + i + '"' + inz(480 + i * 70) + '><i>' + (i + 1) + '</i><p>' + esc(g) + '</p>' +
        '<span class="bm-g-b" role="group" aria-label="Guess ' + (i + 1) + '"><button type="button" data-v="yes" aria-pressed="false">True</button><button type="button" data-v="no" aria-pressed="false">Not us</button></span></div>';
    });
    h += '</div></div><p class="illus bm-ill">' + ico('check') + esc(UD.illus || 'From our call notes · guesses to confirm with you') + '</p>';
    return h;
  }
  function paintGuess(s) {
    var m = load('guess');
    $$('.bm-g', s).forEach(function (g) {
      var v = Deck.print || SHARED ? '' : (m[g.getAttribute('data-g')] || '');
      if (v) g.setAttribute('data-s', v); else g.removeAttribute('data-s');
      $$('button', g).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === v ? 'true' : 'false'); });
    });
  }

  /* ================================================================ 3 · rules */
  var NODES = [
    { k: 'rr', t: 'RR 26-2025', s: 'sets the deadline', x: 7, ic: 'file', d: 'Sets the date: covered taxpayers issue compliant e-invoices on or before 31 December 2026.' },
    { k: 'rmc', t: 'RMC 98-2026', s: '22 Sep 2026 · the working rules', x: 27, ic: 'layers', d: 'Issued 22 September 2026. It sets the working rules: the Permit to Issue, the certification, corrections and downtime.' },
    { k: 'pti', t: 'Permit to Issue', s: 'before your first e-invoice', x: 47, ic: 'pen', d: 'A covered business needs its Permit to Issue (PTI) before it issues the first e-invoice.' },
    { k: 'dl', t: '31 Dec 2026', s: 'compliant e-invoices from here', x: 71, ic: 'calendar', d: 'From this date, covered taxpayers issue compliant e-invoices. An issued e-invoice can’t be deleted or changed.' },
    { k: 'cert', t: 'EIS Certification', s: 'within 6 months of the PTI', x: 92, ic: 'check', d: 'Within six months of the PTI. The system sends the required sales data to the BIR’s EIS.' }
  ];
  var COVERED = [['E-commerce or internet sellers', 'cart'], ['Large Taxpayers Service', 'building'], ['Large taxpayers (RA 11976, RR 8-2024)', 'bank'], ['CAS or CBA users with invoicing software', 'calculator']];
  function todayX() {
    var t = today0(), a = 27, b = 71;
    var f = clamp((t - RMCD) / (DEADLINE - RMCD), 0, 1);
    return lerp(a, b, f);
  }
  function rulesHTML() {
    var urgent = !!BM.urgent, n = daysLeft();
    var head = urgent ? '<span class="hl"><span class="bm-hn">' + n + '</span> days</span> to 31 December 2026.' : ((BM.rules && BM.rules.h2) || 'From 31 December 2026, <span class="hl">covered taxpayers e-invoice.</span>');
    var td = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    var h = hd('rules', head) +
      '<div class="bm-rl' + (urgent ? ' is-urgent' : '') + '">' +
      '<div class="bm-leaf"' + inz(180, 'land') + '><span class="bm-leaf-t">31 December 2026</span><b class="bm-days">' + n + '</b><span class="bm-leaf-l">' + (urgent ? 'days left' : 'days to go') + '</span></div>' +
      '<div class="bm-tl"' + inz(240) + '><div class="bm-tl-line"><i class="bm-tl-fill" style="--fp:' + Math.round(clamp((todayX() - 7) / 85 * 100, 0, 100)) + '%"></i></div>' +
      '<span class="bm-today" style="--x:' + todayX() + '%"><em>Today · ' + td + '</em></span>';
    NODES.forEach(function (nd) {
      h += '<button type="button" class="bm-tn' + (nd.k === 'dl' ? ' bm-tn--dl' : '') + '" data-k="' + nd.k + '" aria-pressed="false" style="--x:' + nd.x + '%"><i>' + ico(nd.ic) + '</i><b>' + esc(nd.t) + '</b><small>' + esc(nd.s) + '</small></button>';
    });
    h += '</div><p class="bm-rl-x" aria-live="polite"' + inz(340) + '><b class="bm-rl-t"></b> <span class="bm-rl-d"></span></p></div>' +
      '<div class="bm-cov"' + inz(420) + '><span class="bm-cov-h">Who it covers</span>';
    COVERED.forEach(function (c, i) { h += '<button type="button" class="bm-cp" aria-pressed="false" data-c="' + i + '">' + ico(c[1]) + esc(c[0]) + '</button>'; });
    h += '<span class="bm-cp bm-cp--out">Micro taxpayers: exempt</span></div>' +
      '<p class="bm-cov-w"' + inz(480) + '>' + ico('usercheck') + '<span>Your accountant or RDO confirms which group you are in. Head office and branches are covered.</span></p>' +
      '<p class="illus bm-ill">' + ico('file') + 'RR 26-2025 · RMC 98-2026 · general guidance, not tax advice: confirm with your accountant or the BIR</p>';
    return h;
  }

  /* ================================================================ 4-7 · the pipeline world */
  var X = [300, 900, 1500, 2100, 2700, 3300], TY = 262, WW = 3600;
  var STN = [
    { k: 'order', n: 'Order', i: 'cart', sc: 'The sale starts here', cap: 'Order. Where the sale starts, linked to the invoice it becomes.' },
    { k: 'invoice', n: 'Invoice', i: 'receipt', sc: 'Issued once, then locked', cap: 'Invoice. Numbered in one series, then locked. A correction is a credit note.' },
    { k: 'eis', n: 'EIS', i: 'plug', sc: 'Assessed with you', cap: 'EIS. The BIR’s e-invoicing system. Odoo has no built-in connection and TechNext has not built one: we assess it with you and quote it separately.' },
    { k: 'books', n: 'Books', i: 'calculator', sc: 'CAS and CBA books', cap: 'Books of accounts. Odoo’s Book of Accounts for CAS and CBA, fed by every posted entry.' },
    { k: 'forms', n: 'BIR forms', i: 'file', sc: '2307, SLSP, SAWT, QAP, 2550Q', cap: 'BIR forms. 2307, SLSP, SAWT and QAP with DAT exports, and the 2550Q VAT summary.' },
    { k: 'audit', n: 'Audit trail', i: 'shield', sc: 'Who, what and when', cap: 'Audit trail. Who posted, changed or exported what, and when, kept with the record.' }
  ];
  ((BM.pipe && BM.pipe.stations) || []).forEach(function (o, i) { if (o && o.cap && STN[i]) STN[i].cap = o.cap; });
  var PH = BM.pipe || {};
  var MAPCAP = PH.mapCap || 'From the sale to the audit trail: six stations, one Odoo.';
  function ph(k, d) { return (PH[k] && PH[k].h2) || d; }
  var INV = Object.assign({ orderLabel: 'Sales order', buyer: 'Sample customer 01', unit: 'pcs', creditLabel: 'Return:', zeroWord: 'zero-rated', lines: [['Machined bracket, 40 mm', 120, 85], ['Stamped cover plate', 60, 140], ['Packing and labelling', 1, 650]] }, BM.invoice || {});
  // one set of numbers for the order card, the invoice, the credit note and the ledger. A line may carry a VAT code as its 4th item: 'zero' = zero-rated (no 12% VAT on it)
  function isZero(l) { return l[3] === 'zero'; }
  function r2(n) { return Math.round(n * 100) / 100; }
  var M = (function () {
    var sub = 0, zr = 0; INV.lines.forEach(function (l) { if (isZero(l)) zr += l[1] * l[2]; else sub += l[1] * l[2]; });
    var vat = r2(sub * .12), c = INV.lines.filter(function (l) { return !isZero(l); })[0] || INV.lines[0], cq = Math.max(1, Math.round(c[1] * .1)), csub = cq * c[2], cvat = r2(csub * .12);
    return { sub: sub, zr: zr, vat: vat, tot: r2(sub + zr + vat), c: c, cq: cq, csub: csub, cvat: cvat, ctot: r2(csub + cvat) };
  })();
  var ZERO = M.zr > 0;
  var NO = 'INV/2026/00042', CNO = 'RINV/2026/00012', ONO = 'S00142';
  var FORMS = [
    { k: '2307', t: 'Certificates on supplier bills', cap: 'BIR Form 2307. Withholding certificates, kept on the supplier bills.' },
    { k: 'SLSP', t: 'Sales and purchases lists', cap: 'SLSP. The summary lists of sales and purchases, with a DAT export.' },
    { k: 'SAWT', t: 'Summary alphalist of withholding', cap: 'SAWT. The summary alphalist of withholding taxes, with a DAT export.' },
    { k: 'QAP', t: 'Quarterly alphalist of payees', cap: 'QAP. The quarterly alphalist of payees, with a DAT export.' },
    { k: '2550Q', t: 'Quarterly VAT summary', cap: '2550Q. The quarterly VAT summary, for your accountant to review.' }
  ];
  var FORM_DEF = 'The forms come out of the same books. Your accountant reviews them before anything is filed.';
  var LEDGER = [
    ['26 Oct', NO, 'Receivables', M.tot, 0], ['26 Oct', NO, ZERO ? 'Sales, incl. ' + INV.zeroWord : 'Sales', 0, r2(M.sub + M.zr)], ['26 Oct', NO, 'Output VAT 12%', 0, M.vat],
    ['27 Oct', CNO, 'Sales returns', M.csub, 0], ['27 Oct', CNO, 'Output VAT 12%', M.cvat, 0], ['27 Oct', CNO, 'Receivables', 0, M.ctot]
  ];
  var TRAIL = [['09:02', 'Billing clerk', 'Posted ' + NO], ['09:05', 'Billing clerk', 'Tried to edit ' + NO + ': locked'], ['09:11', 'Accountant', 'Issued credit note ' + CNO],
    ['09:20', 'Accountant', 'Attached a 2307 to a supplier bill'], ['09:34', 'Accountant', 'Exported the SLSP list (DAT)']];

  function stc(i) { return mix('#3167CA', ACC.hex, i / 5); }
  function stationHTML(i, interactive) {
    var d = STN[i], c = stc(i);
    return '<' + (interactive ? 'button type="button" tabindex="-1"' : 'div') + ' class="bm-st' + (i === 2 ? ' bm-st--eis' : '') + '" data-i="' + i + '" style="left:' + X[i] + 'px;--c:' + c + '"><span class="bm-disc">' + ico(d.i) + '<em>' + (i + 1) + '</em></span><b>' + esc(d.n) + '</b><span class="bm-sc">' + esc(d.sc) + '</span>' + (d.sub ? '<small>' + esc(d.sub) + '</small>' : '') + '</' + (interactive ? 'button' : 'div') + '>';
  }
  function orderHTML() {
    var h = '<div class="bm-o bm-o-ord" style="left:100px;top:384px;width:400px"><header>' + odoo('sale', 28) + '<b>' + esc(INV.orderLabel) + '</b><span class="bm-chip bm-chip--ok">Confirmed</span></header><div class="bm-o-b"><p class="bm-o-who">' + ONO + ' · ' + esc(INV.buyer) + '</p><ul class="bm-o-ls">';
    INV.lines.forEach(function (l) { h += '<li>' + (l[1] > 1 ? num(l[1], 0) + ' × ' : '') + esc(l[0]) + (isZero(l) ? ' · ' + esc(INV.zeroWord) : '') + '</li>'; });
    h += '</ul></div></div>' +
      '<svg class="bm-ord-arrow" viewBox="0 0 130 40" width="130" height="40" style="left:500px;top:438px"><path d="M4 20 L112 20"/><path class="bm-cn-head" d="M98 8 L114 20 L98 32"/></svg><span class="bm-ord-to" style="left:508px;top:402px">invoice created</span>' +
      '<div class="bm-o bm-o-cn" style="left:100px;top:600px;width:400px"><header>' + odoo('account', 26) + '<b>Credit note</b><em>' + CNO + '</em></header><div class="bm-o-b"><p>' + esc(INV.creditLabel) + ' ' + M.cq + ' × ' + esc(M.c[0]) + '</p><p class="bm-o-cnv"><b>−' + peso(M.ctot) + '</b><span>refers to ' + NO + '</span></p></div></div>' +
      '<svg class="bm-cn-arrow" viewBox="0 0 140 170" width="140" height="170" style="left:494px;top:516px"><path d="M4 136 C 64 136, 64 40, 124 40"/><path class="bm-cn-head" d="M110 28 L126 40 L110 52"/></svg>';
    return h;
  }
  function invoiceHTML() {
    var h = '<div class="bm-o bm-o-inv" data-s="2" style="left:632px;top:384px;width:536px;height:' + (ZERO ? 392 : 344) + 'px">' +
      '<div class="bm-od-top"><span class="bm-od-ttl">' + odoo('account', 26) + 'Customer Invoice <b class="bm-od-no">' + NO + '</b></span><span class="bm-od-sb"><i data-b="0">Draft</i><i data-b="1">Posted</i></span></div>' +
      '<div class="bm-od-act"><span class="bm-ob bm-ob--p" data-i data-do="1">Confirm</span><span class="bm-ob" data-i data-do="2">Credit note</span><span class="bm-ob bm-ob--g" data-i data-do="x">' + ico('lock') + 'Try to edit</span></div>' +
      '<div class="bm-od-meta"><p><small>Customer</small><b>' + esc(INV.buyer) + '</b></p><p><small>Invoice date</small><b>26/10/2026</b></p><p><small>Source</small><b>' + ONO + '</b></p></div>' +
      '<table class="bm-od-t"><thead><tr><th>Description</th><th class="n">Qty</th><th class="n">Unit price</th><th class="n">Amount</th></tr></thead><tbody>';
    INV.lines.forEach(function (l) { h += '<tr><td>' + esc(l[0]) + '</td><td class="n">' + num(l[1], 0) + '</td><td class="n">' + num(l[2]) + '</td><td class="n">' + num(l[1] * l[2]) + '</td></tr>'; });
    if (ZERO) h += '<tr class="bm-od-z"><td colspan="4"><span class="bm-od-zt">0% VAT</span>export sale, zero-rated (sample; your accountant confirms treatment)</td></tr>';
    h += '</tbody></table><div class="bm-od-sum"><p><small>' + (ZERO ? 'VATable' : 'VATable sales') + '</small><b>' + peso(M.sub) + '</b></p>' + (ZERO ? '<p><small>Zero-rated</small><b>' + peso(M.zr) + '</b></p>' : '') +
      '<p><small>VAT 12%</small><b>' + peso(M.vat) + '</b></p><p class="bm-od-tot"><small>Total</small><b>' + peso(M.tot) + '</b></p></div>' +
      '<span class="bm-stamp">Posted</span><p class="bm-od-lock">' + ico('lock') + '<span class="bm-od-lt">Posted: it can no longer be edited or deleted.</span></p></div>';
    return h;
  }
  function eisHTML() {
    return '<div class="bm-o bm-o-eis" data-i style="left:1290px;top:384px;width:420px"><header>' + ico('alert') + '<b>BIR EIS connection</b><em>to assess</em></header><div class="bm-o-b">' +
      '<p class="bm-eis-1">Not built into Odoo, and not built by TechNext.</p>' +
      '<ul class="bm-eis-ls"><li>What your business must send to the EIS</li><li>The options to connect, assessed with you</li><li>A separate quote, once we know the option</li></ul>' +
      '<p class="bm-eis-2">No software is BIR-accredited.</p></div></div>';
  }
  function booksHTML() {
    var h = '<div class="bm-o bm-o-bk" style="left:1800px;top:384px;width:600px"><header>' + odoo('account', 28) + '<b>Book of Accounts</b><em>CAS and CBA · sample</em></header>' +
      '<div class="bm-bk-h"><span>Date</span><span>Entry</span><span class="n">Debit</span><span class="n">Credit</span></div><div class="bm-bk-rows">';
    LEDGER.forEach(function (r, i) {
      h += '<div class="bm-bk-r" data-r="' + i + '"><span>' + r[0] + '</span><span><b>' + r[1] + '</b> · ' + r[2] + '</span><span class="n">' + (r[3] ? num(r[3]) : '') + '</span><span class="n">' + (r[4] ? num(r[4]) : '') + '</span></div>';
    });
    h += '</div><footer><span class="bm-bk-ok">' + ico('check') + '<b class="bm-bk-n">6</b> entries · debits equal credits</span><small>You register at your RDO. We prepare the pack with you.</small></footer></div>';
    return h;
  }
  function formsHTML() {
    var h = '<p class="bm-fm-h" style="left:2440px;top:384px">' + ico('file') + 'BIR forms and lists · Odoo 20 PH localisation</p><div class="bm-fm" style="left:2440px;top:422px;width:520px">';
    FORMS.forEach(function (f, i) { h += '<div class="bm-fc" data-i data-f="' + f.k + '"><b>' + f.k + '</b><span><em>' + esc(f.t) + '</em></span></div>'; });
    return h + '</div>';
  }
  function auditHTML() {
    var h = '<div class="bm-o bm-o-au" style="left:3050px;top:384px;width:500px"><header>' + ico('shield') + '<b>Audit trail</b><em>sample</em></header><div class="bm-au-rows">';
    TRAIL.forEach(function (r, i) { h += '<div class="bm-au-r" data-r="' + i + '"><time>' + r[0] + '</time><p><b>' + r[1] + '</b>' + esc(r[2]) + '</p></div>'; });
    return h + '</div><footer>Every change is kept: who, what, when.</footer></div>';
  }
  function worldHTML(kind) {
    var h = '<div class="bm-view' + (kind === 'map' ? '' : ' bm-view--fade') + '" aria-hidden="true"><div class="bm-cam" data-k="' + kind + '">' +
      '<i class="bm-ties"></i><i class="bm-trk bm-trk--a"></i><i class="bm-trk bm-trk--eis"></i><i class="bm-trk bm-trk--b"></i>';
    for (var i = 0; i < 6; i++) if (i !== 2) h += '<i class="bm-stem" style="left:' + X[i] + 'px"></i>';
    h += '<div class="bm-objs">' + orderHTML() + invoiceHTML() + eisHTML() + booksHTML() + formsHTML() + auditHTML() + '</div>';
    for (var j = 0; j < 6; j++) h += stationHTML(j, kind === 'map');
    return h + '</div></div>';
  }

  /* camera poses */
  var MAPP = { x: -28, y: 232, s: .46 };
  var PAIR = { invoice: 600, books: 1800, forms: 3000 };
  function poseOf(kind) { return kind === 'map' ? MAPP : { x: 800 - .92 * PAIR[kind], y: 43, s: .92 }; }
  function flown(i) { return { x: 800 - .94 * X[i], y: 39, s: .94 }; }
  function put2(cam, p) { cam.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) scale(' + p.s + ')';  cullCam(cam, p); }
  // no edge masks (user, 26 Oct): world objects that would be cut by the stage edge in a pose are hidden instead
  function cullCam(cam, p) {
    var x0 = -p.x / p.s + 4, x1 = (1600 - p.x) / p.s - 4;
    var objs = cam.querySelector('.bm-objs'), list = [].slice.call(cam.children).concat(objs ? [].slice.call(objs.children) : []);
    list.forEach(function (el) {
      var cls = ' ' + (el.getAttribute('class') || '') + ' ';
      if (/ bm-(ties|trk|objs) /.test(cls)) return;   // the track and the world itself always show
      var l, w;
      if (el.offsetLeft === undefined) { l = parseFloat(el.style.left) || 0; w = (el.width && el.width.baseVal) ? el.width.baseVal.value : 0; }  // SVG
      else { if (!el.offsetWidth) return; l = el.offsetLeft; w = el.offsetWidth; }
      el.classList.toggle('bm-off', l < x0 || l + w > x1);
    });
  }

  function readPose(cam) {
    var m = getComputedStyle(cam).transform; if (!m || m === 'none') return null;
    var v = m.match(/matrix\(([^)]+)\)/); if (!v) return null;
    var a = v[1].split(',').map(parseFloat); return { x: a[4], y: a[5], s: a[0] };
  }
  function startFor(to) {
    var s = to.s * .86, wx = (800 - to.x) / to.s, wy = (450 - to.y) / to.s;
    return { x: 800 - wx * s, y: 450 - wy * s, s: s };
  }
  var CAMSPRING = { type: 'spring', stiffness: 110, damping: 20 };
  var lastPose = null, lastKind = '', lastAt = 0;
  function flyTo(st, from, to) {
    var cam = st.cam;
    stopMo(st.cams);
    if (!live() || !window.Motion || !Motion.animate) { put2(cam, to); return; }
    put2(cam, from); cullCam(cam, to);
    var a = Motion.animate(cam, { x: [from.x, to.x], y: [from.y, to.y], scale: [from.s, to.s] }, CAMSPRING);
    st.cams.mo.push(a);
  }

  var ST = {};   // per pipeline slide: {kind, s, cam, mo:[], cams:{mo:[]}, ctx}
  function pipeSlide(kind, bar, extra, headHTML, lead) {
    return worldHTML(kind) + headHTML + (lead || '') + extra + '<div class="bm-bar bm-bar--' + kind + '"' + inz(300) + '>' + bar + '</div>';
  }
  function railHTML() {
    var h = '<nav class="bm-rail" aria-label="Pipeline stations">';
    STN.forEach(function (d, i) { h += '<button type="button" data-i="' + i + '" aria-pressed="false"><i>' + (i + 1) + '</i><span>' + esc(d.n) + '</span></button>'; });
    return h + '</nav>';
  }
  function legendHTML() {
    return '<div class="bm-leg"' + inz(380) + '><p><i class="bm-leg-a"></i><span><b>Lit stations</b> are part of the Odoo set-up we propose</span></p><p><i class="bm-leg-b"></i><span><b>Dashed station</b>: to assess with you, quoted separately</span></p></div>';
  }

  /* ---------- the pipeline hooks */
  function litAll(st, on) { $$('.bm-st', st.s).forEach(function (e) { e.classList.toggle('is-lit', on); }); }
  function here(st, a, b) { $$('.bm-st', st.s).forEach(function (e) { var i = +e.getAttribute('data-i'); e.classList.toggle('is-here', i === a || i === b); }); }
  function cap(st, text, quiet) { var c = $('.bm-cap', st.s); if (!c || c.textContent === text) return; c.textContent = text; if (!quiet) swap(c); }

  function initPipe(kind) {
    var s = S['pipe-' + kind]; if (!s) return;
    var st = ST[kind] = { kind: kind, s: s, cam: $('.bm-cam', s), mo: [], cams: { mo: [] }, ctx: null, flown: null };
    put2(st.cam, poseOf(kind));
    if (kind === 'map') st.cam.classList.add('is-far');
    litAll(st, true);
    paintInv(st, 2, false);
    if (kind === 'invoice') here(st, 0, 1); else if (kind === 'books') here(st, 2, 3); else if (kind === 'forms') here(st, 4, 5);
    return st;
  }
  function pipeEnter(st, ctx, s) {
    st.ctx = ctx; stopMo(st); stopMo(st.cams);
    var to = poseOf(st.kind), from = null;
    if (live()) {
      from = (lastPose && /^pipe/.test(lastKind) && Date.now() - lastAt < 2500) ? lastPose : startFor(to);
      flyTo(st, from, to);
    } else put2(st.cam, to);
  }
  function pipeLeave(st) {
    var p = readPose(st.cam); if (p) lastPose = p;
    lastKind = 'pipe-' + st.kind; lastAt = Date.now();
    stopMo(st); stopMo(st.cams);
  }

  /* map (slide 4) */
  function mapInit(st) {
    var s = st.s;
    st.pick = function (i) {
      if (st.flown === i) { st.back(); return; }
      st.flown = i; st.cam.classList.remove('is-far'); st.fly(flown(i));
      $$('.bm-rail button', s).forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-i') === i ? 'true' : 'false'); });
      $$('.bm-st', s).forEach(function (e) { e.classList.toggle('is-here', +e.getAttribute('data-i') === i); });
      s.classList.add('is-flown');
      cap(st, STN[i].cap);
    };
    st.back = function (quiet) {
      st.flown = null; st.cam.classList.add('is-far'); if (!quiet) st.fly(MAPP); else put2(st.cam, MAPP);
      $$('.bm-rail button', s).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      $$('.bm-st', s).forEach(function (e) { e.classList.remove('is-here'); });
      s.classList.remove('is-flown');
      cap(st, MAPCAP, quiet);
    };
    st.fly = function (to) { var from = readPose(st.cam) || MAPP; flyTo(st, from, to); };
    $('.bm-rail', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-i]'); if (b) st.pick(+b.getAttribute('data-i')); });
    $('.bm-cam', s).addEventListener('click', function (e) { var b = e.target.closest('.bm-st'); if (b) st.pick(+b.getAttribute('data-i')); });
    $('.bm-back', s).addEventListener('click', function () { st.back(); });
  }
  function mapEnter(st, ctx, s) {
    st.flown = null; s.classList.remove('is-flown');
    $$('.bm-rail button', s).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    pipeEnter(st, ctx, s);
    here(st, -1, -1);
    cap(st, MAPCAP, true);
    var stn = $$('.bm-st', s), rl = $$('.bm-rail button', s);
    if (live()) {
      litAll(st, false);
      stn.forEach(function (e, i) { ctx.after(180 + i * 110, function () { e.classList.add('is-lit'); }); });
    } else litAll(st, true);
    ctx.on(doc, 'keydown', function (e) { if (e.key === 'Escape' && st.flown !== null) { st.back(); e.preventDefault(); } });
  }

  /* invoice (slide 5) */
  function paintInv(st, n, anim) {
    var card = $('.bm-o-inv', st.s), cn = $('.bm-o-cn', st.s), ord = $('.bm-o-ord', st.s), arrow = $('.bm-cn-arrow', st.s), stamp = $('.bm-stamp', card);
    var was = +card.getAttribute('data-s');
    stopMo(st);
    card.setAttribute('data-s', n);
    $('.bm-od-no', card).textContent = n >= 1 ? NO : 'Draft';
    $$('.bm-od-sb i', card).forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-b') === (n >= 1 ? 1 : 0)); });
    $('.bm-od-lt', card).textContent = n >= 2 ? 'Credited by ' + CNO + '. The invoice is unchanged.' : 'Posted: it can no longer be edited or deleted.';
    cn.classList.toggle('is-hid', n < 2); arrow.classList.toggle('is-hid', n < 2);
    ord.classList.toggle('is-done', n >= 1);
    // the stamp: one spring
    if (n >= 1) {
      if (anim && was < 1 && live() && window.Motion) {
        stamp.style.opacity = 0;
        drive(st, function (p) { stamp.style.opacity = clamp(p * 3, 0, 1); stamp.style.transform = 'rotate(' + lerp(-26, -8, p) + 'deg) scale(' + lerp(2.1, 1, p) + ')'; }, { stiffness: 340, damping: 15 });
      } else { stamp.style.opacity = 1; stamp.style.transform = 'rotate(-8deg)'; }
    } else { stamp.style.opacity = 0; stamp.style.transform = 'rotate(-8deg)'; }
    if (n >= 2 && anim && was < 2 && live() && window.Motion) {
      cn.style.opacity = 0;
      drive(st, function (p) { cn.style.opacity = clamp(p * 2, 0, 1); cn.style.transform = 'translate(' + lerp(-30, 0, p) + 'px,' + lerp(34, 0, p) + 'px)'; }, { stiffness: 190, damping: 22 });
    } else if (n >= 2) { cn.style.opacity = 1; cn.style.transform = 'none'; }
    else { cn.style.opacity = ''; cn.style.transform = ''; }
    // foreground step bar
    var s = st.s;
    $$('.bm-steps button', s).forEach(function (b) { var k = +b.getAttribute('data-k'); b.classList.toggle('is-done', k < n); b.setAttribute('aria-pressed', k === n ? 'true' : 'false'); if (k === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    var T = INV.stepCaps || ['Draft. Anything can still change. Nothing is issued yet.', 'Confirm. The invoice takes the next number in the series and is locked.', 'A return arrives. The issued invoice stays untouched: a credit note lowers it and refers back.'];
    if (st.kind === 'invoice') cap(st, T[n], !anim);
    var tb = $('.bm-try', s); if (tb) { if (n < 1) tb.setAttribute('aria-disabled', 'true'); else tb.removeAttribute('aria-disabled'); }
    // the one ready control
    $$('.bm-ob', card).forEach(function (b) {
      var d = b.getAttribute('data-do');
      b.classList.toggle('is-ready', (d === '1' && n === 0) || (d === '2' && n === 1));
      b.classList.toggle('is-off', (d === '1' && n >= 1) || (d === '2' && n !== 1) || (d === 'x' && n < 1));
    });
  }
  // "Try to edit": the locked invoice shakes and the caption (a live region) says why
  function tryEdit(st) {
    var l = $('.bm-od-lock', st.s); l.classList.remove('is-shake'); void l.offsetWidth; l.classList.add('is-shake');
    cap(st, 'Try to edit: the posted invoice stays locked. It can no longer be edited or deleted.');
  }
  function invInit(st) {
    var s = st.s;
    $('.bm-steps', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (b) Deck.go(Deck.index, +b.getAttribute('data-k')); });
    // the world is aria-hidden, so "Try to edit" is also a real button beside the steps (keyboard and screen readers)
    $('.bm-try', s).addEventListener('click', function (e) { if (e.currentTarget.getAttribute('aria-disabled') === 'true') return; tryEdit(st); });
    $('.bm-o-inv', s).addEventListener('click', function (e) {
      var b = e.target.closest('.bm-ob'); if (!b || b.classList.contains('is-off')) return;
      var d = b.getAttribute('data-do');
      if (d === 'x') tryEdit(st);
      else Deck.go(Deck.index, +d);
    });
    paintInv(st, 2, false);
  }

  /* books (slide 6) */
  function paintBooks(st, n, anim) {
    var rows = $$('.bm-bk-r', st.s);
    rows.forEach(function (r, i) { r.classList.toggle('is-hid', i >= n); });
    $('.bm-bk-n', st.s).textContent = n;
    $('.bm-bk-ok', st.s).classList.toggle('is-ok', n >= rows.length);
  }
  function playBooks(st) {
    var ctx = st.ctx, n = 0, run = st.run = (st.run || 0) + 1;
    if (!ctx || !ctx.alive || !live()) { paintBooks(st, 6, false); return; }
    paintBooks(st, 0, false);
    // a chain of one-shot timers (no interval): a second Replay bumps st.run and the old chain simply stops
    function tick() { if (st.run !== run || !ctx.alive) return; n++; paintBooks(st, n, true); if (n < 6) ctx.after(420, tick); }
    ctx.after(900, tick);
  }

  /* forms + audit (slide 7) */
  function selForm(st, k, quiet) {
    $$('.bm-fc', st.s).forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-f') === k); });
    $$('.bm-fb button', st.s).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === k ? 'true' : 'false'); });
    var f = FORMS.filter(function (x) { return x.k === k; })[0];
    cap(st, f ? f.cap : FORM_DEF, quiet);
  }
  function playForms(st) {
    var ctx = st.ctx, chips = $$('.bm-fc', st.s), rows = $$('.bm-au-r', st.s);
    if (!ctx || !ctx.alive || !live() || !window.Motion) { chips.forEach(function (c) { c.style.opacity = 1; c.style.transform = 'none'; }); rows.forEach(function (r) { r.classList.remove('is-hid'); }); return; }
    chips.forEach(function (c) { c.style.opacity = 0; });
    rows.forEach(function (r) { r.classList.add('is-hid'); });
    chips.forEach(function (c, i) { ctx.after(760 + i * 170, function () { drive(st, function (p) { c.style.opacity = clamp(p * 3, 0, 1); c.style.transform = 'translateY(' + lerp(-260, 0, p) + 'px)'; }, { stiffness: 230, damping: 17 }); }); });
    rows.forEach(function (r, i) { ctx.after(1100 + i * 380, function () { r.classList.remove('is-hid'); }); });
  }

  /* ================================================================ 9 · later: the constellation */
  var APPS = {
    stock: ['Inventory', 'Stock moves, locations and valuation, tied to the same books as your invoices.'],
    purchase: ['Purchase', 'From request for quotation to vendor bill, matched to what arrived.'],
    mrp: ['Manufacturing', 'Bills of materials and work orders, with the cost flowing into your accounts.'],
    quality_control: ['Quality', 'Quality checks at receipt, in production and before goods leave.'],
    maintenance: ['Maintenance', 'Preventive and corrective work on your own equipment.'],
    mrp_plm: ['PLM', 'Engineering changes and versions of your bills of materials.'],
    sale: ['Sales', 'Quotations to orders to invoices, in the same database.'],
    documents: ['Documents', 'One shared place for contracts, scans and files, linked to the records.'],
    fleet: ['Fleet', 'Vehicles, contracts, fuel and service costs.'],
    planning: ['Planning', 'Shifts and field visits. Field Service lives in Planning in Odoo 20.'],
    project: ['Project', 'Tasks, timesheets and billing by project.'],
    spreadsheet_dashboard: ['Dashboards', 'Live spreadsheets over your Odoo data.']
  };
  var LT = BM.later || {};
  var APPL = (LT.apps || ['stock', 'purchase', 'mrp', 'quality_control', 'maintenance', 'mrp_plm']).map(function (a) {
    if (typeof a === 'string') return { m: a, n: (APPS[a] || [a])[0], u: (APPS[a] || ['', ''])[1] };
    return { m: a.m, n: a.n || (APPS[a.m] || [a.m])[0], u: a.u || (APPS[a.m] || ['', ''])[1] };
  });
  function laterHTML() {
    var cx = 450, cy = 290, rx = 360, ry = 205, BW = 76, BH = 64, n = APPL.length;
    var h = hd('later', LT.h2 || 'Accounting first. <span class="hl">More when you’re ready.</span>') +
      '<div class="bm-co" role="group" aria-label="Odoo apps for later phases"><svg class="bm-co-l" viewBox="0 0 900 580" width="900" height="580" aria-hidden="true">';
    // the apps are spaced 360/n round the ring for any count; each dotted spoke stops 12px short of its label box (BW x BH = the box plus 12px)
    APPL.forEach(function (a, i) {
      var ang = (-90 + i * 360 / n) * Math.PI / 180; a.x = cx + rx * Math.cos(ang); a.y = cy + ry * Math.sin(ang);
      var vx = a.x - cx, vy = a.y - cy, k = Math.min(Math.abs(vx) > 1 ? BW / Math.abs(vx) : 9, Math.abs(vy) > 1 ? BH / Math.abs(vy) : 9);
      h += '<line data-i="' + i + '" x1="' + cx + '" y1="' + cy + '" x2="' + Math.round(a.x - vx * k) + '" y2="' + Math.round(a.y - vy * k) + '"/>';
    });
    h += '</svg><button type="button" class="bm-ac is-lit" data-m="account" aria-pressed="true"' + inz(260, 'land') + '><span class="bm-ac-d">' + odoo('account', 84) + '</span><b>Accounting + BIR</b><em>Phase 1 · now</em></button>';
    APPL.forEach(function (a, i) {
      h += '<button type="button" class="bm-ap" data-i="' + i + '" aria-pressed="false"' + inz(340 + i * 70, '', 'left:' + Math.round(a.x - 64) + 'px;top:' + Math.round(a.y - 52) + 'px') + '><span>' + odoo(a.m, 64) + '</span><b>' + esc(a.n) + '</b></button>';
    });
    // extras: a pill that belongs to an app sits on the outer side of that app; pills for Accounting sit below the ring (local y 462 = stage y 698), clear of the apps and the ring
    var free = (LT.extras || []).filter(function (e) { return !e.at || e.at === 'account'; });
    (LT.extras || []).forEach(function (x, i) {
      var host = x.at && x.at !== 'account' ? APPL.filter(function (a) { return a.m === x.at; })[0] : null, px, py;
      if (host) {
        var dx = host.x - cx;
        if (Math.abs(dx) < 30 && host.y > cy) { px = host.x; py = host.y + 60; } else { px = host.x + (dx < -30 ? -170 : 170); py = host.y - 36; }
      } else { px = cx + (free.indexOf(x) - (free.length - 1) / 2) * 190; py = 462; }
      h += '<button type="button" class="bm-ax" data-x="' + i + '" aria-pressed="false"' + inz(700 + i * 80, '', 'left:' + Math.round(px) + 'px;top:' + Math.round(py) + 'px') + '>' + esc(x.n) + '</button>';
    });
    h += '</div><div class="bm-lp" aria-live="polite"' + inz(420) + '><span class="bm-lp-t"></span><div class="bm-lp-i"></div><h3 class="bm-lp-n"></h3><p class="bm-lp-u"></p><p class="bm-lp-k"><b>Lit</b> is in the first proposal. The other apps are options, added in your order and at your pace.</p></div>' +
      '<p class="illus bm-ill">' + ico('check') + 'Options for later phases, not part of the first proposal</p>';
    return h;
  }

  /* ================================================================ 10 · questions */
  var QS = (BM.questions && BM.questions.items) || [];
  function questionsHTML() {
    var h = '<div class="bm-qhead"><div>' + hd('questions', (BM.questions && BM.questions.h2) || 'Eight questions <span class="hl">we need answered.</span>') + '</div>' +
      '<div class="bm-qt"' + inz(160) + '><span class="bm-qc" aria-live="polite"><b class="bm-qa">0</b> answered · <b class="bm-qf">0</b> to follow up</span><button type="button" class="bm-btn bm-qcopy">' + ico('file') + '<span>Copy follow-ups</span></button></div></div>' +
      '<div class="bm-qs">';
    QS.forEach(function (q, i) { h += '<button type="button" class="bm-q" data-q="' + (i + 1) + '" aria-pressed="false"' + inz(200 + i * 55) + '><i>' + (i + 1) + '</i><span>' + esc(q) + '</span><em></em></button>'; });
    h += '</div><p class="hint bm-qhint"' + inz(640) + '>Click once: <b class="bm-ok">answered</b> · twice: <b class="bm-fu">follow up</b> · three times: clear</p><textarea class="bm-qta" aria-label="Follow-up list" readonly hidden></textarea>';
    return h;
  }
  var QTAG = { ok: 'Answered', fu: 'Follow up' };
  function paintQ(s) {
    var m = load('q'), a = 0, f = 0;
    $$('.bm-q', s).forEach(function (b) {
      var v = Deck.print || SHARED ? '' : (m[b.getAttribute('data-q')] || '');
      if (v) b.setAttribute('data-s', v); else b.removeAttribute('data-s');
      b.setAttribute('aria-pressed', v ? 'true' : 'false'); $('em', b).textContent = QTAG[v] || '';
      if (v === 'ok') a++; if (v === 'fu') f++;
    });
    $('.bm-qa', s).textContent = a; $('.bm-qf', s).textContent = f;
    $('.bm-qhint', s).classList.toggle('is-on', a + f > 0);
  }
  function followText(s) {
    var m = load('q'), out = [(C.name || 'Client') + ' · follow-ups'];
    $$('.bm-q', s).forEach(function (b) { if (m[b.getAttribute('data-q')] === 'fu') out.push(b.getAttribute('data-q') + '. ' + $('span', b).textContent); });
    if (out.length === 1) out.push('(none marked yet)');
    return out.join('\n');
  }

  /* ================================================================ 11 · close */
  function closeHTML() {
    var CL = BM.close || {};
    return '<div class="split split--narrow"><div><div class="bm-lock bm-lock--sm"' + inz(0) + '>' + lockup(true) + '</div>' +
      '<span class="kicker"' + inz(80) + '>' + esc(KK.close) + '</span><h2 class="h-xl ct-h bm-ch"' + inz(140) + '>' + CL.h2 + '</h2>' +
      '<p class="lead"' + inz(220) + '>' + esc(CL.lead || '') + '</p>' +
      '<div class="ct-actions"' + inz(320) + '><a class="btn btn-light" href="https://technext.odoo.com/book/c82cf8a9" target="_blank" rel="noopener">' + ico('calendar') + 'Book a 30-minute call</a><a class="btn btn-ghost" href="mailto:sales@technext.asia">' + ico('mail') + 'sales@technext.asia</a></div>' +
      '<div class="ct-links"' + inz(400) + '><a href="https://technext.asia/bir-e-invoicing" target="_blank" rel="noopener">' + ico('globe') + 'technext.asia/bir-e-invoicing</a></div></div>' +
      '<div class="ct-qr"' + inz(300, 'land') + '><div class="ct-qr-card">' + qr() + '<b>Scan to book the call</b><small>A 30-minute call with an adviser, online</small></div></div></div>';
  }

  /* ================================================================ render everything */
  function render() {
    if (S.cover) { put(S.cover, coverHTML()); finish(S.cover); }
    if (S.understand) { put(S.understand, understandHTML()); finish(S.understand); }
    if (S.rules) { put(S.rules, rulesHTML()); finish(S.rules); }
    if (S['pipe-map']) {
      put(S['pipe-map'], pipeSlide('map', '<button type="button" class="bm-btn bm-back">' + ico('arrow') + '<span>Back to the whole pipeline</span></button><p class="bm-cap" aria-live="polite"></p>', railHTML() + legendHTML(),
        hd('map', ph('map', 'Your compliance flow, <span class="hl">in one Odoo.</span>'))));
      finish(S['pipe-map']);
    }
    if (S['pipe-invoice']) {
      put(S['pipe-invoice'], pipeSlide('invoice', '<div class="bm-steps" role="group" aria-label="Invoice step"><button type="button" data-k="0"><i>1</i>Draft</button><button type="button" data-k="1"><i>2</i>Confirm</button><button type="button" data-k="2"><i>3</i>Credit note</button></div><button type="button" class="bm-btn bm-try" aria-disabled="true">' + ico('lock') + '<span>Try to edit</span></button><p class="bm-cap" aria-live="polite"></p>',
        '<p class="illus bm-ill">' + ico('check') + esc(INV.illus || 'Sample customer, numbers and prices, labelled as sample · not data from ' + (C.name || 'the client')) + '</p>',
        hd('invoice', ph('invoice', 'One invoice, issued once. <span class="hl">Corrected, never edited.</span>'))));
      finish(S['pipe-invoice']);
    }
    if (S['pipe-books']) {
      put(S['pipe-books'], pipeSlide('books', '<button type="button" class="bm-btn bm-replay">' + ico('refresh') + '<span>Replay the books</span></button><p class="bm-cap bm-cap--disc" aria-live="polite">TechNext is an Odoo Ready Partner. We are not affiliated with, accredited by or acting for the BIR or any government agency, and we do not file or register on your behalf.</p>',
        '<p class="illus bm-ill">' + ico('check') + 'Illustrative · sample entries from the sample invoice</p>',
        hd('books', ph('books', 'The EIS we assess. <span class="hl">The books we set up.</span>'))));
      finish(S['pipe-books']);
    }
    if (S['pipe-forms']) {
      var fb = '<div class="bm-fb" role="group" aria-label="BIR forms">'; FORMS.forEach(function (f) { fb += '<button type="button" data-f="' + f.k + '" aria-pressed="false">' + f.k + '</button>'; });
      put(S['pipe-forms'], pipeSlide('forms', fb + '</div><p class="bm-cap" aria-live="polite"></p>',
        '<p class="illus bm-ill">' + ico('check') + 'Illustrative · forms and lists as Odoo 20 PH localisation lists them · sample entries</p>',
        hd('forms', ph('forms', 'From the books to BIR forms, <span class="hl">with a trail.</span>'))));
      finish(S['pipe-forms']);
    }
    if (S.later) { put(S.later, laterHTML()); finish(S.later); }
    if (S.questions) { put(S.questions, questionsHTML()); finish(S.questions); }
    if (S.close) { put(S.close, closeHTML()); finish(S.close); }
  }
  render();

  /* ================================================================ hooks */
  function hookId(kind) { return S[kind] ? S[kind].id : '_none_' + kind; }

  Deck.on(hookId('understand'), {
    init: function (s) {
      paintGuess(s);
      if (SHARED) $$('.bm-g-b button', s).forEach(readOnly);
      $('.bm-gl', s).addEventListener('click', function (e) {
        if (SHARED) return;
        var b = e.target.closest('button[data-v]'); if (!b) return;
        var g = b.closest('.bm-g'), k = g.getAttribute('data-g'), m = load('guess'), v = b.getAttribute('data-v');
        if (m[k] === v) delete m[k]; else m[k] = v;
        save('guess', m); paintGuess(s);
      });
    },
    enter: function (ctx, s) { paintGuess(s); callExt('understand', 'enter', ctx, s); },
    leave: function (s) { callExt('understand', 'leave', s); },
    settle: function (s) { paintGuess(s); callExt('understand', 'settle', s); }
  });

  var RULE_K = 'dl';
  function showRule(s, k, quiet) {
    var nd = NODES.filter(function (n) { return n.k === k; })[0], x = $('.bm-rl-x', s);
    $$('.bm-tn', s).forEach(function (n) { var on = n.getAttribute('data-k') === k; n.classList.toggle('is-on', on); n.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    $('.bm-rl-t', s).textContent = nd.t + '.'; $('.bm-rl-d', s).textContent = nd.d;
    x.setAttribute('data-k', k); x.style.setProperty('--px-n', nd.x / 100);
    if (!quiet) swap(x);
  }
  Deck.on(hookId('rules'), {
    init: function (s) {
      showRule(s, 'dl', true);
      if (SHARED) $$('button.bm-cp', s).forEach(readOnly);
      $('.bm-tl', s).addEventListener('click', function (e) { var n = e.target.closest('.bm-tn'); if (n) showRule(s, n.getAttribute('data-k')); });
      $('.bm-cov', s).addEventListener('click', function (e) {
        if (SHARED) return;
        var b = e.target.closest('button.bm-cp'); if (b) b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      });
    },
    enter: function (ctx, s) {
      showRule(s, 'dl', true);
      var n = daysLeft(), el = BM.urgent ? ($('.bm-hn .mx-wi', s) || $('.bm-hn', s)) : null;
      ctx.count($('.bm-days', s), n, { from: n + 120, dur: 1300, ease: Deck.ease.softLand ? 'softLand' : 'out' });
      if (el) ctx.count(el, n, { from: n + 120, dur: 1300, ease: Deck.ease.softLand ? 'softLand' : 'out' });
      callExt('rules', 'enter', ctx, s);
    },
    leave: function (s) { callExt('rules', 'leave', s); },
    settle: function (s) {
      showRule(s, 'dl', true); var n = daysLeft();
      $('.bm-days', s).textContent = n; var el = $('.bm-hn .mx-wi', s) || $('.bm-hn', s); if (el) el.textContent = n;
      $$('.bm-cp[aria-pressed=true]', s).forEach(function (b) { if (Deck.print) b.setAttribute('aria-pressed', 'false'); });
      callExt('rules', 'settle', s);
    }
  });

  /* pipeline hooks */
  if (S['pipe-map']) {
    var sm = S['pipe-map'], stM = initPipe('map'); mapInit(stM);
    stM.back(true);
    Deck.on(sm.id, {
      enter: function (ctx, s) { mapEnter(stM, ctx, s); callExt('pipe-map', 'enter', ctx, s); },
      leave: function (s) { stM.flown = null; pipeLeave(stM); callExt('pipe-map', 'leave', s); },
      settle: function (s) { stM.flown = null; stM.back(true); litAll(stM, true); here(stM, -1, -1); callExt('pipe-map', 'settle', s); }
    });
  }
  if (S['pipe-invoice']) {
    var stI = initPipe('invoice'); invInit(stI);
    Deck.on(S['pipe-invoice'].id, {
      enter: function (ctx, s) { pipeEnter(stI, ctx, s); litAll(stI, true); paintInv(stI, 0, false); callExt('pipe-invoice', 'enter', ctx, s); },
      step: function (n, ctx, s, first) { paintInv(stI, n, !first); },
      leave: function (s) { pipeLeave(stI); callExt('pipe-invoice', 'leave', s); },
      settle: function (s) { put2(stI.cam, poseOf('invoice')); paintInv(stI, 2, false); $('.bm-od-lock', s).classList.remove('is-shake'); litAll(stI, true); callExt('pipe-invoice', 'settle', s); }
    });
  }
  if (S['pipe-books']) {
    var stB = initPipe('books');
    paintBooks(stB, 6, false); cap(stB, $('.bm-cap', S['pipe-books']).textContent, true);
    $('.bm-replay', S['pipe-books']).addEventListener('click', function () { playBooks(stB); });
    $('.bm-o-eis', S['pipe-books']).addEventListener('click', function () { var e = $('.bm-o-eis', S['pipe-books']); e.classList.remove('is-pulse'); void e.offsetWidth; e.classList.add('is-pulse'); });
    Deck.on(S['pipe-books'].id, {
      enter: function (ctx, s) { pipeEnter(stB, ctx, s); litAll(stB, true); playBooks(stB); callExt('pipe-books', 'enter', ctx, s); },
      leave: function (s) { stB.run = (stB.run || 0) + 1; pipeLeave(stB); callExt('pipe-books', 'leave', s); },
      settle: function (s) { stB.run = (stB.run || 0) + 1; put2(stB.cam, poseOf('books')); paintBooks(stB, 6, false); litAll(stB, true); $('.bm-o-eis', s).classList.remove('is-pulse'); callExt('pipe-books', 'settle', s); }
    });
  }
  if (S['pipe-forms']) {
    var stF = initPipe('forms');
    selForm(stF, null, true);
    var fh = function (e) {
      var b = e.target.closest('[data-f]'); if (!b) return;
      var k = b.getAttribute('data-f'); stF.sel = stF.sel === k ? null : k; selForm(stF, stF.sel);
    };
    $('.bm-fb', S['pipe-forms']).addEventListener('click', fh); $('.bm-fm', S['pipe-forms']).addEventListener('click', fh);
    Deck.on(S['pipe-forms'].id, {
      enter: function (ctx, s) { pipeEnter(stF, ctx, s); litAll(stF, true); stF.sel = null; selForm(stF, null, true); playForms(stF); callExt('pipe-forms', 'enter', ctx, s); },
      leave: function (s) { pipeLeave(stF); callExt('pipe-forms', 'leave', s); },
      settle: function (s) {
        put2(stF.cam, poseOf('forms')); stF.sel = null; selForm(stF, null, true); litAll(stF, true);
        $$('.bm-fc', s).forEach(function (c) { c.style.opacity = 1; c.style.transform = 'none'; }); $$('.bm-au-r', s).forEach(function (r) { r.classList.remove('is-hid'); });
        callExt('pipe-forms', 'settle', s);
      }
    });
  }

  /* later */
  if (S.later) {
    Deck.on(S.later.id, {
      init: function (s) {
        var lit = { k: 'acc' };
        s._lit = function (k, quiet) {
          var T = $('.bm-lp-t', s), I = $('.bm-lp-i', s), N = $('.bm-lp-n', s), U = $('.bm-lp-u', s), lp = $('.bm-lp', s);
          $$('.bm-ap,.bm-ac,.bm-ax', s).forEach(function (b) { b.classList.remove('is-lit'); b.setAttribute('aria-pressed', 'false'); });
          $$('.bm-co-l line', s).forEach(function (l) { l.classList.remove('is-lit'); });
          var m, n, u, tag, el;
          if (k === 'acc') {
            el = $('.bm-ac', s); m = 'account'; n = 'Accounting, with BIR compliance'; u = LT.lead || 'Phase 1: invoices, books and BIR forms in one Odoo, as in the flow you just saw. Everything else waits until you choose it.'; tag = 'Phase 1 · now';
          } else if (k.charAt(0) === 'x') {
            var x = (LT.extras || [])[+k.slice(1)]; el = $('.bm-ax[data-x="' + k.slice(1) + '"]', s); m = (x.at && x.at !== 'account') ? x.at : 'account'; n = x.n; u = x.u || ''; tag = (x.at && x.at !== 'account' ? 'In ' + ((APPL.filter(function (a) { return a.m === x.at; })[0] || {}).n || '') : 'In Accounting') + ' · phase 2 option';
          } else {
            var a = APPL[+k]; el = $('.bm-ap[data-i="' + k + '"]', s); m = a.m; n = a.n; u = a.u; tag = 'Phase 2 · when you are ready';
            var ln = $('.bm-co-l line[data-i="' + k + '"]', s); if (ln) ln.classList.add('is-lit');
          }
          el.classList.add('is-lit'); el.setAttribute('aria-pressed', 'true'); lit.k = k;
          T.textContent = tag; I.innerHTML = odoo(m, 72); N.textContent = n; U.textContent = u;
          lp.setAttribute('data-p', k === 'acc' ? '1' : '2');
          if (!quiet) swap(lp);
        };
        $('.bm-co', s).addEventListener('click', function (e) {
          var b = e.target.closest('button'); if (!b) return;
          if (b.classList.contains('bm-ac')) s._lit('acc');
          else if (b.classList.contains('bm-ap')) s._lit(b.getAttribute('data-i'));
          else if (b.classList.contains('bm-ax')) s._lit('x' + b.getAttribute('data-x'));
        });
        $('.bm-co', s).addEventListener('pointerover', function (e) {
          if (e.pointerType !== 'mouse') return;
          var b = e.target.closest('.bm-ap'); if (b && lit.k !== b.getAttribute('data-i')) s._lit(b.getAttribute('data-i'));
        });
        s._lit('acc', true);
      },
      enter: function (ctx, s) {
        s._lit('acc', true);
        var nodes = $$('.bm-ap,.bm-ax', s);
        nodes.forEach(function (n) { n.style.translate = ''; });
        if (live()) ctx.frame(function (t) {
          nodes.forEach(function (n, i) { n.style.translate = Math.round(Math.sin(t / 1900 + i * 1.7) * 5) + 'px ' + Math.round(Math.cos(t / 2300 + i * 1.1) * 5) + 'px'; });
        });
        callExt('later', 'enter', ctx, s);
      },
      leave: function (s) { callExt('later', 'leave', s); },
      settle: function (s) { s._lit('acc', true); $$('.bm-ap,.bm-ax', s).forEach(function (n) { n.style.translate = ''; }); callExt('later', 'settle', s); }
    });
  }

  /* questions */
  if (S.questions) {
    Deck.on(S.questions.id, {
      init: function (s) {
        if (SHARED) $$('.bm-q', s).forEach(readOnly);
        $('.bm-qs', s).addEventListener('click', function (e) {
          if (SHARED) return;
          var b = e.target.closest('button[data-q]'); if (!b) return;
          var m = load('q'), k = b.getAttribute('data-q'), v = m[k] || '';
          m[k] = v === '' ? 'ok' : v === 'ok' ? 'fu' : ''; if (!m[k]) delete m[k];
          save('q', m); paintQ(s);
        });
        var btn = $('.bm-qcopy', s), ta = $('.bm-qta', s);
        function reset() { $('span', btn).textContent = 'Copy follow-ups'; }
        function done(msg) {
          $('span', btn).textContent = msg;
          if (s._lbl) { clearTimeout(s._lbl); s._lbl = 0; }
          s._lbl = (s._ctx && s._ctx.alive) ? s._ctx.after(1800, reset) : setTimeout(reset, 1800);
        }
        function fallback(t) {
          ta.hidden = false; ta.value = t; ta.focus(); ta.select();
          var ok = false; try { ok = doc.execCommand('copy'); } catch (e) { }
          if (ok) { ta.hidden = true; done('Copied'); } else done('Select and copy');
        }
        btn.addEventListener('click', function () {
          var t = followText(s);
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { done('Copied'); }, function () { fallback(t); });
          else fallback(t);
        });
        ta.addEventListener('blur', function () { ta.hidden = true; });
        paintQ(s);
      },
      enter: function (ctx, s) { s._ctx = ctx; paintQ(s); callExt('questions', 'enter', ctx, s); },
      leave: function (s) { callExt('questions', 'leave', s); },
      settle: function (s) { paintQ(s); callExt('questions', 'settle', s); }
    });
  }

  /* close: no kit behaviour of its own, a hook only so a deck can extend it */
  if (S.close) Deck.on(S.close.id, {
    enter: function (ctx, s) { callExt('close', 'enter', ctx, s); },
    leave: function (s) { callExt('close', 'leave', s); },
    settle: function (s) { callExt('close', 'settle', s); }
  });

  window.BMK = {
    S: S, ico: ico, plate: plate, peso: peso, num: num, esc: esc, live: live, spring: spring, drive: drive, stop: stopMo, load: load, save: save,
    extend: extend, shared: SHARED, readOnly: readOnly, daysLeft: daysLeft, split: split, kick: kick, kickers: KK, qr: qr, odoo: odoo, accent: ACC, inz: inz, swap: swap, mix: mix, clamp: clamp, lerp: lerp
  };
  doc.dispatchEvent(new CustomEvent('bm:ready'));
})();

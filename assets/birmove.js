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
     cover: { h1: 'From QuickBooks to <span class="hl">books set up for the BIR.</span>',
              lead: 'one sentence (two lines at most)', system: 'QuickBooks',   // the name on the "Today" card of the hero
              today: 'QuickBooks, with BIR forms built around it',               // the line under it (default: "Running on <system>")
              kicker: 'optional override of the house line "prepared for our discovery call"',   // a kicker that repeats the client name is ignored: the nameplate says it
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
  // the nameplate already says who the deck is for: a kicker that repeats the client name falls back to the house line
  function coverKicker() {
    var k = CV.kicker || '', nm = (C.name || '').toLowerCase();
    return (!k || (nm && k.toLowerCase().indexOf(nm) >= 0)) ? 'prepared for our discovery call' : k;
  }
  function coverHTML() {
    var sys = CV.system || C.system || 'Your current system', today = CV.today || ('Running on ' + sys);
    var h = '<div class="cv-copy bm-cv">' +
      '<div class="bm-lock"' + inz(0) + '>' + lockup(false) + '</div>' +
      '<span class="kicker"' + inz(120) + '>' + esc(coverKicker()) + '</span>' +
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
    // the hero, one object top to bottom: their system today -> a line that draws down -> the same six stations as slides 4-7, in miniature, in one Odoo
    h += '<div class="bm-hero" aria-hidden="true">';
    if (BM.urgent) h += '<div class="bm-cd"><b class="bm-cd-n">' + daysLeft() + '</b><span>days to<small>31 December 2026</small></span></div>';
    var tline = today; if (tline.toLowerCase().indexOf(sys.toLowerCase()) === 0) { tline = tline.slice(sys.length).replace(/^[\s,:;\u2013\u2014-]+/, ''); tline = tline.charAt(0).toUpperCase() + tline.slice(1); }
    h += '<div class="bm-td"><span class="bm-td-l">Today</span><b>' + esc(sys) + '</b>' + (tline ? '<p>' + esc(tline) + '</p>' : '') + '</div>' +
      '<svg class="bm-wire" viewBox="0 0 24 72" width="24" height="72"><path class="bm-wire-p" d="M12 0 V67" pathLength="1"/><circle class="bm-wire-d" cx="12" cy="67" r="5"/></svg>' +
      '<div class="bm-wo"><span class="bm-wo-l">With Odoo</span><div class="bm-mini"><div class="bm-mt"><i class="bm-mt-a"></i><i class="bm-mt-e"></i><i class="bm-mt-b"></i></div><i class="bm-mdot"></i>';
    STN.forEach(function (d, i) {
      h += '<div class="bm-md' + (i === 2 ? ' bm-md--eis' : '') + '" style="left:' + ((i + .5) / 6 * 100).toFixed(3) + '%;--c:' + stc(i) + '"><span class="bm-mdisc">' + ico(d.i) + '</span><b>' + esc(d.n) + '</b></div>';
    });
    h += '</div><footer>' + odoo('account', 34) + '<span>Invoices, books and BIR forms in one Odoo</span></footer></div></div>';
    return h;
  }
  /* cover motion (the headline builds as on every slide). Today card lands from the left, the line draws, the panel lands, then the six discs land one by one on a soft spring
     (no bounce past 1.04) while the track fills left to right behind them. Idle: a dot travels the track every 5 s and each disc lights as it passes (live only, never in
     TV / reduced / print). Every control sits in s._cv and is stopped in leave; settle paints the finished picture with no dot. */
  var CVT = { CARD: 280, WIRE: 900, WIRED: 600, PANEL: 1300, DISC: 1800, GAP: 90, LOOP: 3300, PERIOD: 5000, RUN: 2600 };
  var SOFT = [.16, .86, .3, 1];
  function tw(K, ms, fn, ease) {
    if (!window.Motion || !Motion.animate) { fn(1); return; }
    K.mo.push(Motion.animate(0, 1, { duration: ms / 1000, ease: ease || SOFT, onUpdate: fn }));
  }
  function coverClear(s) {
    var K = s._cv; if (K) stopMo(K);
    ['.bm-td', '.bm-cd', '.bm-wire-d', '.bm-wo', '.bm-mdot'].forEach(function (q) { var e = $(q, s); if (e) { e.style.opacity = ''; e.style.transform = ''; } });
    var w = $('.bm-wire-p', s); if (w) w.style.strokeDashoffset = '';
    var m = $('.bm-mt', s); if (m) m.style.clipPath = '';
    $$('.bm-md', s).forEach(function (d) { d.style.opacity = ''; d.style.transform = ''; d.classList.remove('is-pass'); });
  }
  function coverEnter(ctx, s) {
    var K = s._cv; coverClear(s);
    if (!live() || !window.Motion) return;
    var td = $('.bm-td', s), cd = $('.bm-cd', s), wp = $('.bm-wire-p', s), wd = $('.bm-wire-d', s), wo = $('.bm-wo', s), mt = $('.bm-mt', s), mini = $('.bm-mini', s), dot = $('.bm-mdot', s), ds = $$('.bm-md', s);
    // starting poses (the finished picture is the CSS default)
    [td, cd].forEach(function (e) { if (e) { e.style.opacity = 0; e.style.transform = 'translateX(-110px)'; } });
    wp.style.strokeDashoffset = 1; wd.style.opacity = 0; wo.style.opacity = 0; wo.style.transform = 'translateY(38px)'; mt.style.clipPath = 'inset(0 100% 0 0)';
    ds.forEach(function (d) { d.style.opacity = 0; d.style.transform = 'scale(.6)'; });
    function land(e, delay) { ctx.after(delay, function () { tw(K, 750, function (p) { e.style.opacity = clamp(p * 2.4, 0, 1); e.style.transform = 'translateX(' + lerp(-110, 0, p).toFixed(2) + 'px)'; }); }); }
    land(td, CVT.CARD); if (cd) land(cd, CVT.CARD + 70);
    ctx.after(CVT.WIRE, function () { tw(K, CVT.WIRED, function (p) { wp.style.strokeDashoffset = (1 - p).toFixed(4); wd.style.opacity = p > .96 ? 1 : 0; }, [.45, 0, .55, 1]); });
    ctx.after(CVT.PANEL, function () { tw(K, 700, function (p) { wo.style.opacity = clamp(p * 2.4, 0, 1); wo.style.transform = 'translateY(' + lerp(38, 0, p).toFixed(2) + 'px)'; }); });
    ctx.after(CVT.DISC, function () {
      tw(K, CVT.GAP * 5, function (p) { mt.style.clipPath = p >= 1 ? '' : 'inset(0 ' + ((1 - p) * 100).toFixed(2) + '% 0 0)'; }, 'linear');   // the track's leading edge reaches disc i just as it lands
    });
    ds.forEach(function (d, i) {
      ctx.after(CVT.DISC + i * CVT.GAP, function () {
        drive(K, function (p) { d.style.opacity = clamp(p * 3, 0, 1); d.style.transform = 'scale(' + lerp(.6, 1, p).toFixed(4) + ')'; }, { stiffness: 230, damping: 25 });
      });
    });
    // idle: the dot rides the track, each disc lights as it passes
    var W = mini.offsetWidth, x0 = W / 12, x1 = W * 11 / 12, on = [];
    ctx.frame(function (t) {
      if (t < CVT.LOOP) return;
      var q = (t - CVT.LOOP) % CVT.PERIOD, run = q < CVT.RUN, x = lerp(x0, x1, run ? q / CVT.RUN : 1);
      dot.style.opacity = run ? Math.min(1, q / 180, (CVT.RUN - q) / 180).toFixed(3) : 0;
      dot.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
      ds.forEach(function (d, i) { var near = run && Math.abs(x - W * (i + .5) / 6) < 24; if (on[i] !== near) { on[i] = near; d.classList.toggle('is-pass', near); } });
    });
  }
  function countOpts(n) { return { from: n + 90, dur: 1300, ease: Deck.ease && Deck.ease.softLand ? 'softLand' : 'out' }; }
  Deck.on(S.cover && S.cover.id || '_none', {
    init: function (s) { s._cv = { mo: [] }; },
    enter: function (ctx, s) {
      coverEnter(ctx, s);
      var cd = $('.bm-cd-n', s);
      if (cd) { var d = daysLeft(); if (live()) ctx.count(cd, d, countOpts(d)); else cd.textContent = d; }
      callExt('cover', 'enter', ctx, s);
    },
    leave: function (s) { stopMo(s._cv); callExt('cover', 'leave', s); },
    settle: function (s) { coverClear(s); var cd = $('.bm-cd-n', s); if (cd) cd.textContent = daysLeft(); callExt('cover', 'settle', s); }
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
  var MAPP = { x: 156, y: 232, s: .39 };
  var PAIR = { invoice: 600, books: 1800, forms: 3000 };
  function poseOf(kind) { return kind === 'map' ? MAPP : { x: 800 - .92 * PAIR[kind], y: kind === 'invoice' && ZERO ? 37 : 43, s: .92 }; }   // a zero-rated invoice is 48px taller: lift it so it clears the step bar
  function flown(i) { return { x: 800 - .94 * X[i], y: 39, s: .94 }; }
  // step poses. Invoice: 0 Draft = the pair (Order + Invoice) | 1 Confirm = push in on the invoice card | 2 Credit note = pull back and shift, so the credit note and the invoice are both framed.
  // Books: Replay pushes in on the ledger and settles back to the pair. Forms: picking a form leans the camera toward the list.
  var INVP = [poseOf('invoice'), pushPose(900, ZERO ? 392 : 344), { x: 170, y: 47, s: .9 }];
  var BOOKP = pushPose(2100, 344), FORMP = { x: 800 - .94 * 2860, y: 39, s: .94 };
  // the step poses of the close-ups: centre a card on screen as big as the vertical budget allows (headline above y 236, step bar from y 744)
  function pushPose(cx, h) {
    var s = clamp(502 / (162 + h), .92, .98);
    return { x: 800 - s * cx, y: Math.min(236 - 210 * s, 740 - s * (372 + h)), s: s, m: 100 };   // m: a wider cull margin, so a card half cut by the edge is hidden, not left hanging
  }
  var SIDE = 4;
  function worldKids(cam) { var objs = cam.querySelector('.bm-objs'); return [].slice.call(cam.children).concat(objs ? [].slice.call(objs.children) : []); }
  // the camera's pose is always written here (never read back from the matrix), so a pan that is cut short, or a slide that is left, knows exactly where the camera is
  function setCam(cam, p) { cam._p = p; cam.style.transform = 'translate(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px) scale(' + p.s.toFixed(4) + ')'; }
  function put2(cam, p) { setCam(cam, p); cullCam(cam, p); }
  // no edge masks (user, 26 Oct): world objects that would be cut by the stage edge in a pose are hidden instead
  function cullCam(cam, p) {
    var m = p.m || SIDE, x0 = -p.x / p.s + m, x1 = (1600 - p.x) / p.s - m;
    var list = worldKids(cam);
    list.forEach(function (el) {
      var cls = ' ' + (el.getAttribute('class') || '') + ' ';
      if (/ bm-(ties|trk|objs) /.test(cls)) return;   // the track and the world itself always show
      var l, w;
      if (el.offsetLeft === undefined) { l = parseFloat(el.style.left) || 0; w = (el.width && el.width.baseVal) ? el.width.baseVal.value : 0; }  // SVG
      else { if (!el.offsetWidth) return; l = el.offsetLeft; w = el.offsetWidth; }
      el.classList.toggle('bm-off', l < x0 || l + w > x1);
    });
    // an arrow or label that belongs to a card goes with it (no orphan "invoice created" once the order card is out of frame)
    [['.bm-o-ord', '.bm-ord-arrow,.bm-ord-to'], ['.bm-o-cn', '.bm-cn-arrow']].forEach(function (t) {
      var host = cam.querySelector(t[0]); if (!host || !host.classList.contains('bm-off')) return;
      [].slice.call(cam.querySelectorAll(t[1])).forEach(function (e) { e.classList.add('bm-off'); });
    });
  }

  function startFor(to) {
    var s = to.s * .86, wx = (800 - to.x) / to.s, wy = (450 - to.y) / to.s;
    return { x: 800 - wx * s, y: 450 - wy * s, s: s };
  }

  /* ONE camera across slides 4-7. A move is a tween (never a spring: no wobble) on a cinematic ease, 0.9 s for a short hop up to 1.4 s for a long one.
     The screen-centre point travels in a straight line across the world, and a long move dollies: the scale dips to 0.86 x the smaller end at the middle
     of the move (a quadratic curve in log scale, so the zoom never kinks), then lands on the target. */
  var EASE_CAM = [.65, 0, .35, 1];
  function wc(p) { return { x: (800 - p.x) / p.s, y: (450 - p.y) / p.s }; }
  function camPlan(a, b, dur) {
    var wa = wc(a), wb = wc(b), dx = wb.x - wa.x, dy = wb.y - wa.y, dw = Math.sqrt(dx * dx + dy * dy);
    var la = Math.log(a.s), lb = Math.log(b.s), mid = Math.min(a.s, b.s) * (1 - .14 * clamp((dw - 120) / 780, 0, 1));
    var lm = Math.log(mid), lc = 2 * lm - (la + lb) / 2;
    var far = dw * (a.s + b.s) / 2 + Math.abs(lb - la) * 420;
    return { wa: wa, wb: wb, la: la, lb: lb, lc: lc, dur: dur || clamp(.9 + .5 * far / 1300, .9, 1.4), m: b.m };
  }
  function camAt(pl, e) {
    var u = 1 - e, s = Math.exp(u * u * pl.la + 2 * u * e * pl.lc + e * e * pl.lb);
    var wx = lerp(pl.wa.x, pl.wb.x, e), wy = lerp(pl.wa.y, pl.wb.y, e);
    return { x: 800 - wx * s, y: 450 - wy * s, s: s };
  }
  function same(a, b) { return Math.abs(a.x - b.x) < .5 && Math.abs(a.y - b.y) < .5 && Math.abs(a.s - b.s) < .002; }
  // from the first frame of a move every object shows (nothing pops in mid-move); the neighbours arrive with a short fade as the camera gathers speed
  function wake(cam) {
    worldKids(cam).forEach(function (el) {
      if (!el.classList.contains('bm-off')) return;
      el.classList.remove('bm-off', 'bm-wake'); void el.getBoundingClientRect(); el.classList.add('bm-wake');
    });
  }
  // the one camera move. from defaults to where the camera is now. Returns the plan (its dur is the time the move takes), or null when there is nothing to animate.
  function panTo(st, to, o) {
    o = o || {};
    var cam = st.cam, from = o.from || cam._p || to, tok = st.panTok = (st.panTok || 0) + 1;
    stopMo(st.cams);
    if (!live() || !window.Motion || !Motion.animate || same(from, to)) { put2(cam, to); return null; }
    var pl = camPlan(from, to, o.dur);
    setCam(cam, from); wake(cam);
    st.cams.mo.push(Motion.animate(0, 1, {
      duration: pl.dur, ease: EASE_CAM,
      onUpdate: function (e) { setCam(cam, camAt(pl, e)); },
      onComplete: function () { if (st.panTok === tok) put2(cam, to); }   // the final pose, with the objects the stage edge would cut hidden again (fade 200 ms)
    }));
    return pl;
  }
  // what the camera did when the last pipeline slide was left: the next pipeline slide pans on from there (set in pipeLeave, cleared by every slide change)
  var LEFT = null;
  root.addEventListener('deck:slide', function () { LEFT = null; });

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
  // park the camera at a pose with no move (settle, reduced motion, TV): it also stops any move still running
  function rest(st, p) { st.panTok = (st.panTok || 0) + 1; stopMo(st.cams); put2(st.cam, p); }
  // Entering a pipeline slide: from another pipeline slide the camera pans on from the pose it left; from anywhere else it starts at the overview (map) pose and
  // dollies in, the stations growing out of their overview size. Returns nothing; st.entryFrom and st.panMs say where the move began and how long it takes.
  function pipeEnter(st, ctx, s, to) {
    st.ctx = ctx; stopMo(st); stopMo(st.cams);
    var cam = st.cam, map = st.kind === 'map', dest = to || poseOf(st.kind), L = LEFT, from, far, pl;
    LEFT = null; st.entryFrom = null; st.panMs = 0;
    if (!live()) { cam.classList.toggle('is-far', map); rest(st, dest); return; }
    if (L) { from = L.pose; far = L.far; } else { from = map ? startFor(dest) : MAPP; far = true; }
    if (map) { if (far) cam.classList.add('is-far'); else cam.classList.remove('is-far'); }
    else if (far) { cam.classList.add('is-far'); void cam.offsetWidth; cam.classList.remove('is-far'); }   // the stations grow out of their overview size as the camera comes in
    else cam.classList.remove('is-far');
    pl = panTo(st, dest, { from: from });
    st.entryFrom = from; st.panMs = pl ? Math.round(pl.dur * 1000) : 0;
    if (map && !far) {   // pulling back to the overview: the stations swell and the cards fall away as the camera backs out
      if (pl) ctx.after(pl.dur * 380, function () { cam.classList.add('is-far'); }); else cam.classList.add('is-far');
    }
  }
  function pipeLeave(st) {
    LEFT = { pose: st.cam._p || poseOf(st.kind), far: st.cam.classList.contains('is-far') };
    stopMo(st); stopMo(st.cams); st.panTok = (st.panTok || 0) + 1;
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
      st.flown = null; st.cam.classList.add('is-far'); if (!quiet) st.fly(MAPP); else rest(st, MAPP);
      $$('.bm-rail button', s).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      $$('.bm-st', s).forEach(function (e) { e.classList.remove('is-here'); });
      s.classList.remove('is-flown');
      cap(st, MAPCAP, quiet);
    };
    st.fly = function (to) { panTo(st, to); };   // the same pan and dolly as every other move, there and back
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
    // the stamp lands as the camera pushes in on the card; the credit note arrives as it pulls back (a later step press cancels both: the token)
    var tok = st.invTok = (st.invTok || 0) + 1;
    function later(ms, fn) { if (st.ctx && st.ctx.alive) st.ctx.after(ms, function () { if (st.invTok === tok) fn(); }); else fn(); }
    if (n >= 1) {
      if (anim && was < 1 && live() && window.Motion) {
        stamp.style.opacity = 0;
        later(430, function () { drive(st, function (p) { stamp.style.opacity = clamp(p * 3, 0, 1); stamp.style.transform = 'rotate(' + lerp(-26, -8, p) + 'deg) scale(' + lerp(2.1, 1, p) + ')'; }, { stiffness: 340, damping: 15 }); });
      } else { stamp.style.opacity = 1; stamp.style.transform = 'rotate(-8deg)'; }
    } else { stamp.style.opacity = 0; stamp.style.transform = 'rotate(-8deg)'; }
    if (n >= 2 && anim && was < 2 && live() && window.Motion) {
      cn.style.opacity = 0;
      later(300, function () { drive(st, function (p) { cn.style.opacity = clamp(p * 2, 0, 1); cn.style.transform = 'translate(' + lerp(-30, 0, p) + 'px,' + lerp(34, 0, p) + 'px)'; }, { stiffness: 190, damping: 22 }); });
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
  // the camera follows the step: Confirm pushes in (0.8 s), Credit note pulls back and shifts, stepping back reverses
  function invCam(st, n, first) {
    var to = INVP[n];
    if (!live()) { rest(st, to); return; }
    if (first) { if (n > 0) panTo(st, to, { from: st.entryFrom || poseOf('invoice') }); return; }   // arriving on a later step: the same entry move, aimed at that step's pose
    panTo(st, to, { dur: n === 1 ? .8 : n === 2 ? 1.05 : .95 });
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
  // The ledger close-up. Arriving on the slide the camera pans straight onto the ledger (one move from where it was); Replay pushes in from the pair (0.8 s).
  // Either way the entries tick in, then the camera settles back to the pair (1.0 s) so the EIS station beside the books is in frame again.
  function playBooks(st, arriving) {
    var ctx = st.ctx, n = 0, run = st.run = (st.run || 0) + 1, wait = arriving ? st.panMs || 0 : 0;
    st.panMs = 0;
    if (!ctx || !ctx.alive || !live()) { paintBooks(st, 6, false); return; }
    paintBooks(st, 0, false);
    // a chain of one-shot timers (no interval): a second Replay bumps st.run and the old chain simply stops
    function tick() { if (st.run !== run || !ctx.alive) return; n++; paintBooks(st, n, true); if (n < 6) ctx.after(420, tick); else ctx.after(650, function () { if (st.run === run) panTo(st, poseOf('books'), { dur: 1 }); }); }
    if (!arriving) ctx.after(100, function () { if (st.run === run) panTo(st, BOOKP, { dur: .8 }); });
    ctx.after(arriving ? wait + 250 : 900, tick);
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
    var b = Math.max(0, (st.panMs || 0) * .55 - 200);   // the cards start dropping as the camera is coming to rest
    chips.forEach(function (c, i) { ctx.after(760 + b + i * 170, function () { drive(st, function (p) { c.style.opacity = clamp(p * 3, 0, 1); c.style.transform = 'translateY(' + lerp(-260, 0, p) + 'px)'; }, { stiffness: 230, damping: 17 }); }); });
    rows.forEach(function (r, i) { ctx.after(1100 + b + i * 380, function () { r.classList.remove('is-hid'); }); });
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
      step: function (n, ctx, s, first) { paintInv(stI, n, !first); invCam(stI, n, first); },
      leave: function (s) { pipeLeave(stI); callExt('pipe-invoice', 'leave', s); },
      settle: function (s) { rest(stI, poseOf('invoice')); paintInv(stI, 2, false); $('.bm-od-lock', s).classList.remove('is-shake'); litAll(stI, true); callExt('pipe-invoice', 'settle', s); }
    });
  }
  if (S['pipe-books']) {
    var stB = initPipe('books');
    paintBooks(stB, 6, false); cap(stB, $('.bm-cap', S['pipe-books']).textContent, true);
    $('.bm-replay', S['pipe-books']).addEventListener('click', function () { playBooks(stB); });
    $('.bm-o-eis', S['pipe-books']).addEventListener('click', function () { var e = $('.bm-o-eis', S['pipe-books']); e.classList.remove('is-pulse'); void e.offsetWidth; e.classList.add('is-pulse'); });
    Deck.on(S['pipe-books'].id, {
      enter: function (ctx, s) { pipeEnter(stB, ctx, s, live() ? BOOKP : null); litAll(stB, true); playBooks(stB, true); callExt('pipe-books', 'enter', ctx, s); },
      leave: function (s) { stB.run = (stB.run || 0) + 1; pipeLeave(stB); callExt('pipe-books', 'leave', s); },
      settle: function (s) { stB.run = (stB.run || 0) + 1; rest(stB, poseOf('books')); paintBooks(stB, 6, false); litAll(stB, true); $('.bm-o-eis', s).classList.remove('is-pulse'); callExt('pipe-books', 'settle', s); }
    });
  }
  if (S['pipe-forms']) {
    var stF = initPipe('forms');
    selForm(stF, null, true);
    var fh = function (e) {
      var b = e.target.closest('[data-f]'); if (!b) return;
      var k = b.getAttribute('data-f'); stF.sel = stF.sel === k ? null : k; selForm(stF, stF.sel);
      panTo(stF, stF.sel ? FORMP : poseOf('forms'), { dur: .8 });   // a picked form leans the camera toward the list; clearing it eases back
    };
    $('.bm-fb', S['pipe-forms']).addEventListener('click', fh); $('.bm-fm', S['pipe-forms']).addEventListener('click', fh);
    Deck.on(S['pipe-forms'].id, {
      enter: function (ctx, s) { pipeEnter(stF, ctx, s); litAll(stF, true); stF.sel = null; selForm(stF, null, true); playForms(stF); callExt('pipe-forms', 'enter', ctx, s); },
      leave: function (s) { pipeLeave(stF); callExt('pipe-forms', 'leave', s); },
      settle: function (s) {
        rest(stF, poseOf('forms')); stF.sel = null; selForm(stF, null, true); litAll(stF, true);
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

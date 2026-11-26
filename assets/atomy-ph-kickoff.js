/* ATOMY Philippines · Project kickoff (prefix ak-). Client deck, 11 slides.
   cover + close: the flight path (plane flies kickoff -> go-live); assume: data-step builds; scope: out-of-scope -> CR path;
   gates: 5 signed gates (steps); gantt: week plan with a draggable date line; team/comms: ATOMY names typed live (sessionStorage),
   reused by the RACI and the agree-today list; support: P1-P4 (steps); raci: letter / person / row highlight; agree: tick list.
   Every animated slide has a settle hook (print, overview). */
(function () {
  'use strict';
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- motion layer: cascades ([data-cas] children land on a wave) and faster headline words ---------- */
  $$('[data-cas]').forEach(function (c) {
    var ax = c.getAttribute('data-cas');
    c.style.setProperty('--ak-d', (c.getAttribute('data-cd') || 220) + 'ms');
    c.style.setProperty('--ak-g', (c.getAttribute('data-cg') || 40) + 'ms');
    Array.prototype.forEach.call(c.children, function (k, i) { k.classList.add('ak-x'); if (ax !== 'up') k.setAttribute('data-ax', ax); k.style.setProperty('--i', i); });
  });
  $$('.mx-words').forEach(function (h) {
    var g = /h-xl/.test(h.className) ? 80 : 55, n = h.querySelectorAll('.mx-wi').length, d = parseFloat(h.style.getPropertyValue('--d')) || 0;
    h.style.setProperty('--wg', g + 'ms');
    $$('.hl', h).forEach(function (hl) { hl.style.setProperty('--hd', Math.round(d * .85 + n * g + 180) + 'ms'); });
  });

  /* ---------- names typed live (team + comms), shared with RACI and agree ---------- */
  var NKEY = 'ak-atomy-names';
  function nLoad() { try { return JSON.parse(sessionStorage.getItem(NKEY) || '{}'); } catch (e) { return {}; } }
  function nSave(m) { try { sessionStorage.setItem(NKEY, JSON.stringify(m)); } catch (e) {} }
  function nPaint() {
    var m = nLoad();
    $$('input[data-n]').forEach(function (i) {
      var v = m[i.getAttribute('data-n')] || '';
      if (document.activeElement !== i) i.value = v;
      i.classList.toggle('is-set', !!v);
    });
    $$('.ak-seg button').forEach(function (b) { b.setAttribute('aria-pressed', String(m.chat === b.getAttribute('data-p'))); });
    var pm = $('.ak-rh [data-pm]');
    if (pm) pm.textContent = m.pm || 'ATOMY PM';
    var vals = {
      pm: m.pm, users: m.users, acct: m.acct, chat: m.chat,
      poc: [m.poc && 'POC: ' + m.poc, m.cr && 'Change requests: ' + m.cr, m.proj && 'Project: ' + m.proj].filter(Boolean).join(' · ')
    };
    $$('.ak-q em[data-v]').forEach(function (e) { e.textContent = vals[e.getAttribute('data-v')] || ''; });
  }
  $$('input[data-n]').forEach(function (i) {
    i.addEventListener('input', function () { var m = nLoad(); m[i.getAttribute('data-n')] = i.value.trim(); nSave(m); nPaint(); });
    i.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === 'Escape') i.blur(); });
  });
  $$('.ak-seg button').forEach(function (b) {
    b.addEventListener('click', function () { var m = nLoad(), p = b.getAttribute('data-p'); m.chat = m.chat === p ? '' : p; nSave(m); nPaint(); });
  });

  /* ---------- 1 + 11 · flight path ---------- */
  var WPS = [
    { d: 0, date: '27 Nov', name: 'Kickoff & mobilization', side: 1, go: ['gates', 0] },
    { d: 7, date: '04 Dec', name: 'Configuration complete', side: -1, go: ['gates', 1] },
    { d: 10, date: '07 Dec', name: 'UAT sign-off', side: 1, go: ['gates', 2] },
    { d: 21, date: '18 Dec', name: 'CAS and EIS documents', side: -1, go: ['gates', 3] },
    { d: 32, date: '29 Dec', name: 'Go-live & handover', side: 1, go: ['gates', 4] },
    { d: 34, date: '31 Dec', name: 'BIR EIS deadline', side: -1, dead: true, go: ['gantt', 0] }
  ];
  var LAND = 32 / 34;
  function fp(t) { return { x: 40 + 1250 * t, y: 205 - 150 * Math.pow(t, 1.6) }; }
  function fpAng(t) { var a = fp(Math.max(0, t - 0.01)), b = fp(Math.min(1, t + 0.01)); return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; }
  function pathD(t1) {
    var d = '', n = Math.max(2, Math.round(80 * t1));
    for (var i = 0; i <= n; i++) { var p = fp(t1 * i / n); d += (i ? ' L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }
    return d;
  }
  var FN = 120, FPTS = [], FCUM = [0];
  (function () { for (var i = 0; i <= FN; i++) FPTS.push(fp(i / FN)); for (var j = 1; j <= FN; j++) FCUM.push(FCUM[j - 1] + Math.hypot(FPTS[j].x - FPTS[j - 1].x, FPTS[j].y - FPTS[j - 1].y)); })();
  var FLEN = FCUM[FN];
  function lenAt(t) { var f = Math.max(0, Math.min(1, t)) * FN, i = Math.floor(f); return i >= FN ? FLEN : FCUM[i] + (FCUM[i + 1] - FCUM[i]) * (f - i); }
  function flyBuild(s) {
    var fly = $('.ak-fly', s); if (!fly) return;
    var d = pathD(1);
    $('.ak-fly-ghost', fly).setAttribute('d', d);
    var line = $('.ak-fly-line', fly);
    line.setAttribute('d', d); line.style.strokeDasharray = FLEN.toFixed(1) + ' ' + (FLEN + 10).toFixed(1);
    var dots = $('.ak-fly-dots', fly), labs = $('.ak-fly-labels', fly);
    WPS.forEach(function (w) {
      var p = fp(w.d / 34);
      var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', w.dead ? 8 : 9);
      if (w.dead) c.setAttribute('class', 'ak-dead');
      dots.appendChild(c);
      var l = el('button', 'ak-wl' + (w.dead ? ' ak-wl--dead' : ''), '<b>' + w.date + '</b><small>' + w.name + '</small>');
      l.type = 'button'; l.setAttribute('aria-label', w.date + ': ' + w.name + ', open');
      l.style.left = p.x + 'px';
      l.style.top = (w.side > 0 ? p.y + (w.d === 32 ? 36 : 14) : p.y - 72) + 'px';
      if (w.dead) l.style.marginLeft = '-150px';
      l.addEventListener('click', function (e) { e.stopPropagation(); l.blur(); Deck.goId(w.go[0], w.go[1]); });
      labs.appendChild(l);
    });
  }
  function flyPaint(s, t) {
    var fly = $('.ak-fly', s); if (!fly) return;
    $('.ak-fly-line', fly).style.strokeDashoffset = (FLEN - lenAt(Math.max(0.002, t))).toFixed(1);
    var p = fp(t);
    $('.ak-fly-plane', fly).setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') rotate(' + fpAng(t).toFixed(1) + ') scale(1.5)');
    var dots = $$('.ak-fly-dots circle', fly), labs = $$('.ak-wl', fly);
    WPS.forEach(function (w, i) { var on = w.dead || w.d / 34 <= t + 0.001; dots[i].classList.toggle('is-on', on && !w.dead); labs[i].classList.toggle('is-on', on); });
  }
  function flyHooks(id, from) {
    var cur = null;
    function fly(ctx, s, wait) {
      flyPaint(s, from);
      if (Deck.reduce) { flyPaint(s, LAND); return; }
      var tok = {}; s._akTok = tok;
      ctx.after(wait, function () {
        ctx.tween(from > 0 ? 1300 : 1900, function (p) { if (s._akTok === tok) flyPaint(s, from + (LAND - from) * p); }, 'softInOut');
      });
    }
    Deck.on(id, {
      init: function (s) {
        flyBuild(s); flyPaint(s, from);
        var r = $('.ak-replay', s);
        if (r) r.addEventListener('click', function (e) { e.stopPropagation(); if (cur) fly(cur, s, 60); });
      },
      enter: function (ctx, s) { cur = ctx; fly(ctx, s, from > 0 ? 450 : 520); },
      leave: function () { cur = null; },
      settle: function (s) { flyPaint(s, LAND); }
    });
  }
  /* ---------- 1 · cover: stamp the kickoff (step 1), the plane peels off and flies the route ---------- */
  var cvCtx = null;
  function cvReset(s) {
    var d = $('.ak-doc', s); d.classList.remove('is-stamped', 'is-flown'); d.setAttribute('aria-label', 'Stamp the kickoff');
    s.classList.remove('ak-flying', 'ak-done'); s._akTok = null; flyPaint(s, 0);
    if (s._akPeel) { s._akPeel.cancel(); s._akPeel = null; }
  }
  function cvDone(s) {
    var d = $('.ak-doc', s); d.classList.add('is-stamped', 'is-flown'); d.setAttribute('aria-label', 'Stamp the kickoff again');
    s.classList.add('ak-flying', 'ak-done'); s._akTok = null; flyPaint(s, LAND);
  }
  function cvStamp(ctx, s) {
    cvReset(s);
    if (Deck.reduce || Deck.tv) { cvDone(s); return; }
    var d = $('.ak-doc', s), pl = $('.ak-doc-plane', s);
    void d.offsetWidth; d.classList.add('is-stamped'); s.classList.add('ak-done');
    ctx.after(560, function () {
      if (!pl.animate) { d.classList.add('is-flown'); return; }
      var an = pl.animate([
        { transform: 'rotate(-14deg) translate(0px,0px) scale(1)' },
        { transform: 'rotate(-6deg) translate(-34px,18px) scale(1.06)', offset: .28 },
        { transform: 'rotate(-30deg) translate(470px,-300px) scale(1.7)' }
      ], { duration: 620, easing: 'cubic-bezier(.62,0,.9,.42)', fill: 'forwards' });
      s._akPeel = an;
      an.onfinish = function () { d.classList.add('is-flown'); an.cancel(); s._akPeel = null; };
    });
    ctx.after(1060, function () {
      s.classList.add('ak-flying');
      var tok = {}; s._akTok = tok;
      ctx.tween(1750, function (p) { if (s._akTok === tok) flyPaint(s, LAND * p); }, 'softInOut');
    });
  }
  function cvTilt(s, e) {
    var d = $('.ak-doc', s);
    if (!e) { d.style.setProperty('--rx', '0deg'); d.style.setProperty('--ry', '0deg'); return; }
    var r = Deck.rect(d), p = Deck.point(e);
    var x = (p.x - r.left) / r.width - .5, y = (p.y - r.top) / r.height - .5;
    if (Math.abs(x) > 1.1 || Math.abs(y) > 1.1) { cvTilt(s); return; }
    d.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg'); d.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
  }
  Deck.on('cover', {
    init: function (s) {
      flyBuild(s); cvReset(s);
      var d = $('.ak-doc', s);
      function act(e) { e.preventDefault(); e.stopPropagation(); if (Deck.slides[Deck.index] !== s) return; if (Deck.step === 0) Deck.go(Deck.index, 1); else if (cvCtx) cvStamp(cvCtx, s); }
      d.addEventListener('click', act);
      d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') act(e); });
      var fine = window.matchMedia && matchMedia('(pointer:fine)').matches;
      if (fine) {
        s.addEventListener('pointermove', function (e) { if (!Deck.reduce && !Deck.tv) cvTilt(s, e); });
        s.addEventListener('pointerleave', function () { cvTilt(s); });
      }
    },
    enter: function (ctx, s) { cvCtx = ctx; if (Deck.step > 0) cvDone(s); else cvReset(s); },
    step: function (n, ctx, s, first) { cvCtx = ctx; if (n === 0) cvReset(s); else if (first) cvDone(s); else cvStamp(ctx, s); },
    leave: function (s) { cvCtx = null; cvTilt(s); },
    settle: function (s) { cvDone(s); }
  });
  flyHooks('close', 0.62);

  /* ---------- 2 · assume: work-package spotlight ---------- */
  function wpPick(s, i) {
    $$('.ak-wp-b', s).forEach(function (b, k) { b.setAttribute('aria-pressed', 'false'); if (k === i) { void b.offsetWidth; b.setAttribute('aria-pressed', 'true'); } });
  }
  var wpUser = false;
  Deck.on('assume', {
    init: function (s) {
      $$('.ak-wp-b', s).forEach(function (b, i) { b.addEventListener('click', function (e) { e.stopPropagation(); wpUser = true; wpPick(s, i); }); });
      ['focusin', 'pointerenter'].forEach(function (ev) { $('.ak-wp', s).addEventListener(ev, function () { wpUser = true; }); });
      wpPick(s, 0);
    },
    enter: function (ctx, s) {
      wpUser = false; $$('.ak-wp-b', s).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      if (Deck.reduce) { wpPick(s, 0); return; }
      var k = 0;
      ctx.after(950, function () { if (wpUser) return; wpPick(s, 0); ctx.every(2300, function () { if (wpUser) return false; k = (k + 1) % 6; wpPick(s, k); }); });
    },
    settle: function (s) { wpPick(s, 0); }
  });

  /* ---------- 3 · scope: out of scope -> Change Request path ---------- */
  function crPick(s, b, ctx) {
    $$('.ak-out-list button', s).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    $('.ak-cr-item', s).textContent = b.getAttribute('data-o');
    var steps = $$('.ak-cr-steps li', s);
    steps.forEach(function (li) { li.classList.remove('is-on'); });
    if (!ctx || Deck.reduce) { steps.forEach(function (li) { li.classList.add('is-on'); }); return; }
    steps.forEach(function (li, i) { ctx.after(120 + i * 220, function () { li.classList.add('is-on'); }); });
  }
  var scopeCtx = null;
  Deck.on('scope', {
    init: function (s) {
      $$('.ak-out-list button', s).forEach(function (b) { b.addEventListener('click', function () { crPick(s, b, scopeCtx); }); });
      crPick(s, $('.ak-out-list button', s), null);
    },
    enter: function (ctx, s) { scopeCtx = ctx; $$('.ak-cr-steps li', s).forEach(function (li) { li.classList.remove('is-on'); }); ctx.after(900, function () { crPick(s, $('.ak-out-list button[aria-pressed=true]', s) || $('.ak-out-list button', s), ctx); }); },
    leave: function () { scopeCtx = null; },
    settle: function (s) { crPick(s, $('.ak-out-list button', s), null); }
  });

  /* ---------- 4 · gates ---------- */
  function gPaint(s, k) {
    $$('.ak-gate', s).forEach(function (g, i) {
      g.classList.toggle('is-done', i < k);
      g.classList.toggle('is-cur', i === k);
      g.setAttribute('aria-current', i === k ? 'step' : 'false');
    });
    var colW = (1360 - 4 * 16) / 5, x = Math.min(k, 4) * (colW + 16) + colW / 2;
    var tr = $('.ak-track', s); tr.style.setProperty('--ak-s', (x / 1360).toFixed(4)); tr.style.setProperty('--ak-x', x.toFixed(1) + 'px');
  }
  Deck.on('gates', {
    init: function (s) {
      $$('.ak-gate', s).forEach(function (g, i) { g.addEventListener('click', function () { Deck.go(Deck.index, i); }); });
      gPaint(s, 0);
    },
    step: function (n, ctx, s) { gPaint(s, n); },
    settle: function (s) { gPaint(s, 5); }
  });

  /* ---------- 5 · week by week ---------- */
  var DAYS = 56, PLOT = 1030; // 23 Nov .. 17 Jan, 8 weeks
  var ROWS = [
    { n: '1', t: 'Mobilization', sub: 'Kickoff, project plan', ms: 4, msl: 'M1 27 Nov', chip: 'M1 Mobilization' },
    { n: '2', t: 'Configuration', sub: 'Odoo, PH localization, trial data', bar: [7, 11], k: 'k-gate', ms: 11, msl: 'M2 4 Dec', chip: 'Configuration' },
    { n: '3', t: 'UAT', sub: 'Test e-invoices and BIR reports', bar: [14, 14], k: 'k-gate', ms: 14, msl: 'M3 7 Dec', chip: 'UAT sign-off' },
    { n: '4', t: 'CAS / EIS documents', sub: 'Company and authorization docs', bar: [4, 25], k: 'k-docs', ms: 25, msl: 'M4 18 Dec', chip: 'CAS / EIS documents' },
    { t: 'BIR registration support', sub: 'ORUS CAS + e-invoice permit', bar: [25, 36], k: 'k-sup', chip: 'BIR registration support' },
    { t: 'Training and cut-over', sub: 'Proposed: 3 sessions, go/no-go', bar: [28, 35], k: 'k-sup', chip: 'Training and cut-over' },
    { n: '5', t: 'Go-live and handover', sub: 'First live e-invoices', ms: 36, msl: 'M5 29 Dec', chip: 'M5 Go-live', left: 1 },
    { t: 'Hypercare', sub: 'Mon to Fri, 8:00 to 18:00', bar: [36, 50], k: 'k-hc', chip: 'Hypercare' }
  ];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dayDate(d) { return new Date(2026, 10, 23 + d); }
  function fmt(d, dow) { var x = dayDate(d); return (dow ? DOW[x.getDay()] + ' ' : '') + x.getDate() + ' ' + MON[x.getMonth()]; }
  function dx(d) { return d / DAYS * PLOT; }
  (function gBuild() {
    var s = document.getElementById('gantt'); if (!s) return;
    var head = $('.ak-gc-head', s); head.innerHTML = '';
    for (var w = 0; w < 8; w++) head.appendChild(el('span', null, fmt(w * 7)));
    var rows = $('.ak-gc-rows', s);
    ROWS.forEach(function (r, i) {
      var row = el('div', 'ak-gr');
      var when = r.bar ? (r.bar[0] === r.bar[1] ? fmt(r.bar[0]) : fmt(r.bar[0]) + ' to ' + fmt(r.bar[1])) : '';
      if (r.ms != null) when += (when ? '; ' : '') + r.msl;
      row.appendChild(el('div', 'ak-gr-l', '<b>' + (r.n ? '<em>' + r.n + '</em>' : '') + esc(r.t) + '</b><small>' + esc(r.sub) + '</small><span class="sr-only">' + esc(when) + '</span>'));
      if (r.bar) {
        var b = el('i', 'ak-bar ' + r.k);
        b.style.left = (330 + dx(r.bar[0])) + 'px'; b.style.width = dx(r.bar[1] + 1 - r.bar[0]) + 'px';
        b.style.transitionDelay = (i * 55) + 'ms';
        row.appendChild(b);
      }
      if (r.ms != null) {
        var m = el('i', 'ak-ms'); m.style.left = (330 + dx(r.ms + 0.5)) + 'px'; m.style.transitionDelay = (i * 55 + 320) + 'ms'; row.appendChild(m);
        var ml = el('span', 'ak-ms-l' + (r.left ? ' is-left' : ''), r.msl);
        if (r.left) ml.style.right = (1360 - 330 - dx(r.ms + 0.5) + 18) + 'px'; else ml.style.left = (330 + dx(r.ms + 0.5) + 18) + 'px';
        ml.style.transitionDelay = (i * 55 + 400) + 'ms';
        row.appendChild(ml);
      }
      rows.appendChild(row);
    });
    $('.ak-gc-dead', s).style.left = dx(38.5) + 'px';
    $('.ak-gc-now', s).style.left = dx(4.5) + 'px';
  })();
  function gcSet(s, d) {
    d = Math.max(0, Math.min(DAYS - 1, d));
    var di = Math.floor(d);
    var sc = $('.ak-gc-scrub', s);
    sc.style.transform = 'translateX(' + dx(d).toFixed(1) + 'px)';
    sc.setAttribute('aria-valuenow', di); sc.setAttribute('aria-valuetext', fmt(di, true));
    $('.ak-read-d b', s).textContent = fmt(di, true);
    var on = [];
    ROWS.forEach(function (r) {
      if (r.bar && di >= r.bar[0] && di <= r.bar[1]) on.push('<i class="' + r.k + '">' + esc(r.chip) + '</i>');
      else if (!r.bar && r.ms === di) on.push('<i class="k-ms">' + esc(r.chip) + '</i>');
      if (r.bar && r.ms === di) on.push('<i class="k-ms">' + esc(r.msl.split(' ')[0]) + ' signed</i>');
    });
    if (di === 38) on.push('<i class="k-dead">BIR e-invoicing deadline</i>');
    $('.ak-read-on', s).innerHTML = on.length ? on.join('') : '<i class="k-none">' + (di < 4 ? 'Before kickoff' : 'No milestone work') + '</i>';
  }
  var gcDay = 4.5, gcUser = false;
  Deck.on('gantt', {
    init: function (s) {
      var plot = $('.ak-gc-plot', s), sc = $('.ak-gc-scrub', s), drag = false;
      function at(e) { var r = Deck.rect(plot), p = Deck.point(e); return (p.x - r.left) / Deck.scale / PLOT * DAYS; }
      function took() { gcUser = true; $('.ak-read', s).setAttribute('aria-live', 'polite'); }
      plot.addEventListener('pointerdown', function (e) { took(); drag = true; try { plot.setPointerCapture(e.pointerId); } catch (x) {} gcDay = at(e); gcSet(s, gcDay); e.preventDefault(); });
      plot.addEventListener('pointermove', function (e) { if (drag) { gcDay = at(e); gcSet(s, gcDay); } });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { plot.addEventListener(ev, function () { drag = false; }); });
      plot.addEventListener('click', function (e) { e.stopPropagation(); });
      sc.addEventListener('keydown', function (e) {
        var k = e.key, d = Math.floor(gcDay);
        if (k === 'ArrowRight' || k === 'ArrowUp') d += 1; else if (k === 'ArrowLeft' || k === 'ArrowDown') d -= 1;
        else if (k === 'PageUp') d += 7; else if (k === 'PageDown') d -= 7; else return;
        e.preventDefault(); e.stopPropagation(); took(); gcDay = Math.max(0, Math.min(DAYS - 1, d)) + 0.5; gcSet(s, gcDay);
      });
      gcSet(s, 4.5);
    },
    enter: function (ctx, s) {
      var gc = $('.ak-gc', s);
      gc.classList.remove('is-drawn'); gcDay = 4.5; gcUser = false; gcSet(s, gcDay);
      $('.ak-read', s).setAttribute('aria-live', 'off');
      if (Deck.reduce) { gc.classList.add('is-drawn'); return; }
      ctx.after(450, function () { gc.classList.add('is-drawn'); });
      ctx.after(1700, function () {
        ctx.tween(2400, function (p) { if (gcUser) return; gcDay = 4.5 + 32 * p; gcSet(s, gcDay); }, 'io');
        ctx.after(2500, function () { $('.ak-read', s).setAttribute('aria-live', 'polite'); });
      });
    },
    settle: function (s) { $('.ak-gc', s).classList.add('is-drawn'); gcDay = 4.5; gcSet(s, gcDay); }
  });

  /* ---------- 7 · comms ---------- */
  var ghosts = [], cUser = false;
  function cFly(s, b, ch) {
    var a = Deck.vbox(b, s), t = Deck.vbox(ch, s);
    var g = el('span', 'ak-ghost', esc(b.textContent));
    g.style.left = a.x + 'px'; g.style.top = a.y + 'px'; g.style.width = a.w + 'px'; g.style.height = a.h + 'px';
    s.appendChild(g); ghosts.push(g);
    var dx = t.cx - a.cx, dy = t.y + 70 - a.cy;
    var an = g.animate([
      { transform: 'translate(0px,0px) scale(1)', opacity: 1 },
      { transform: 'translate(' + (dx * .9).toFixed(1) + 'px,' + (dy * .9).toFixed(1) + 'px) scale(.78)', opacity: 1, offset: .8 },
      { transform: 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(.6)', opacity: 0 }
    ], { duration: 460, easing: 'cubic-bezier(.05,.92,.2,1)' });
    an.onfinish = function () { g.remove(); var gi = ghosts.indexOf(g); if (gi > -1) ghosts.splice(gi, 1); ch.classList.remove('is-hit'); void ch.offsetWidth; ch.classList.add('is-hit'); };
  }
  function cPick(s, b, fly) {
    $$('.ak-msg-grid button', s).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    var c = b.getAttribute('data-c');
    $$('.ak-chan', s).forEach(function (ch) {
      var on = ch.getAttribute('data-ch') === c;
      ch.classList.toggle('is-on', on);
      if (on && fly && !Deck.reduce && g_ok()) cFly(s, b, ch);
      var hit = $('.ak-chan-hit', ch);
      if (on) { if (!hit) { hit = el('span', 'ak-chan-hit'); ch.appendChild(hit); } hit.textContent = b.textContent; }
      else if (hit) hit.remove();
    });
  }
  Deck.on('comms', {
    init: function (s) {
      $$('.ak-msg-grid button', s).forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); cUser = true; cPick(s, b, true); }); });
      ['focusin', 'pointerenter'].forEach(function (ev) { $('.ak-msg', s).addEventListener(ev, function () { cUser = true; }); });
      cPick(s, $$('.ak-msg-grid button', s)[2]);
      nPaint();
    },
    enter: function (ctx, s) {
      nPaint(); cUser = false;
      if (Deck.reduce) return;
      var bs = $$('.ak-msg-grid button', s), order = [0, 2, 6, 3, 7, 5], k = 0;
      ctx.after(1200, function () { if (cUser) return; cPick(s, bs[order[0]], true); ctx.every(1900, function () { if (cUser) return false; k = (k + 1) % order.length; cPick(s, bs[order[k]], true); }); });
    },
    leave: function () { ghosts.forEach(function (g) { g.remove(); }); ghosts = []; },
    settle: function (s) { cPick(s, $$('.ak-msg-grid button', s)[2]); }
  });
  var TCOL = { 'RJ Sarreal': 0, 'Neil Matan': 1, 'Jett Balanza': 2, 'Philip Gallan': 3, 'Kim Byoung Ho': 4 };
  var TROLE = { 'Pia (Sophia) Cachola-Ang': 'Executive sponsor &amp; escalation', 'Jeric Bulayungan': 'Commercial contact' };
  function tFill(b) {
    var t = $('.ak-tally', b); if (t.childNodes.length) return;
    var p = b.getAttribute('data-p'), c = TCOL[p];
    if (c == null) { t.innerHTML = '<span class="ak-tl-h">Not on the RACI</span><span class="ak-tl-x">' + (TROLE[p] || '') + '</span>'; return; }
    var n = { R: 0, A: 0, C: 0, I: 0 };
    RR.forEach(function (r) { r[1].split(' ')[c].split('/').forEach(function (l) { if (n[l] != null) n[l]++; }); });
    t.innerHTML = '<span class="ak-tl-h">On the RACI</span>' + ['A', 'R', 'C', 'I'].map(function (l, i) {
      return '<span class="ak-tl-n' + (l === 'A' ? ' is-a' : '') + '" style="--n:' + i + '"><b>' + n[l] + '</b><i title="' + { A: 'Accountable', R: 'Responsible', C: 'Consulted', I: 'Informed' }[l] + '">' + l + '</i></span>';
    }).join('');
  }
  function tSet(b, on) { tFill(b); b.classList.toggle('is-open', on); b.setAttribute('aria-expanded', String(on)); $('.ak-tally', b).setAttribute('aria-hidden', String(!on)); }
  var tUser = false;
  Deck.on('team', {
    init: function (s) {
      nPaint();
      $$('.ak-pc', s).forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); tUser = true; tSet(b, !b.classList.contains('is-open')); }); });
    },
    enter: function (ctx, s) {
      nPaint(); tUser = false;
      if (Deck.reduce) return;
      var rj = $('.ak-pc[data-p="RJ Sarreal"]', s);
      ctx.after(1500, function () { if (!tUser) tSet(rj, true); });
      ctx.after(3700, function () { if (!tUser) tSet(rj, false); });
    },
    leave: function (s) { $$('.ak-pc', s).forEach(function (b) { tSet(b, false); }); },
    settle: function (s) { nPaint(); $$('.ak-pc', s).forEach(function (b) { tSet(b, false); }); }
  });

  function g_ok() { return typeof Element.prototype.animate === 'function'; }

  /* ---------- 8 · support ---------- */
  var SLA = [['P1 Critical', '1 hour', '4 hours'], ['P2 High', '2 hours', '1 business day'], ['P3 Medium', '8 hours', 'Next planned fix'], ['P4 Low', '1 business day', 'As agreed']];
  function sPaint(s, k, anim) {
    $$('button.ak-sla-r', s).forEach(function (r, i) { r.classList.toggle('is-on', i === k); r.setAttribute('aria-pressed', String(i === k)); });
    var c = $('.ak-clock', s); c.setAttribute('data-p', k);
    $('.ak-clock-p', c).textContent = SLA[k][0];
    $('[data-k=r]', c).textContent = SLA[k][1];
    $('[data-k=f]', c).textContent = SLA[k][2];
    c.classList.remove('is-swap');
    if (anim && !Deck.reduce) { void c.offsetWidth; c.classList.add('is-swap'); }
  }
  Deck.on('support', {
    init: function (s) {
      $$('button.ak-sla-r', s).forEach(function (r, i) { r.addEventListener('click', function () { Deck.go(Deck.index, i); }); });
      sPaint(s, 0);
    },
    step: function (n, ctx, s, first) { sPaint(s, n, !first); },
    settle: function (s) { sPaint(s, 0); }
  });

  /* ---------- 9 · RACI ---------- */
  var RC = [
    { b: 'RJ Sarreal', s: 'Project Manager' }, { b: 'Neil Matan', s: 'Solutions Architect' },
    { b: 'Jett Balanza', s: 'Functional Consultant' }, { b: 'Philip Gallan', s: 'Odoo Developer' },
    { b: 'Kim Byoung Ho', s: 'ATOMY Sponsor', at: 1 }, { b: 'ATOMY PM', s: 'To be named', at: 1, pm: 1 },
    { b: 'Key users', s: 'Finance team', at: 1 }, { b: 'Accountant', s: "ATOMY's accountant", at: 1 }
  ];
  var RR = [
    ['Project plan and Friday status report', 'A/R C C I I C I I'],
    ['Master data and opening balances', 'C C R I I A R C'],
    ['Accounting and BIR design document', 'A R C C I C C C'],
    ['Odoo configuration and PH localization', 'A C R R I I C –'],
    ['BIR CAS books and EIS e-invoicing set-up', 'A R R R I I C C'],
    ['Data migration (trial and final load)', 'A C R R I C C C'],
    ['UAT scripts, testing and sign-off', 'R C R I A R R C'],
    ['CAS / EIS authorization documents', 'C C I – I A I R'],
    ['BIR registration: ORUS CAS and e-invoice permit', 'A R I – I C – R'],
    ['Training materials and sessions', 'A C R I I C I –'],
    ['Go-live, cut-over and hypercare', 'A C R R C R C C'],
    ['Change requests', 'C R C C A C I –']
  ];
  var RX = { f: '', col: -1, row: -1 };
  (function rBuild() {
    var t = $('.ak-raci'); if (!t) return;
    t.style.setProperty('--ak-d', '260ms'); t.style.setProperty('--ak-g', '22ms');
    var h = el('div', 'ak-rr ak-rh'); h.setAttribute('role', 'row');
    var h0 = el('div', 'ak-rh-0', 'Deliverable'); h0.setAttribute('role', 'columnheader'); h.appendChild(h0);
    RC.forEach(function (c, i) {
      var w = el('div', c.at ? 'is-at' : ''); w.setAttribute('role', 'columnheader'); w.setAttribute('data-col', i);
      var b = el('button', null, '<b' + (c.pm ? ' data-pm' : '') + '>' + esc(c.b) + '</b><small>' + esc(c.s) + '</small>');
      b.type = 'button'; b.setAttribute('data-c', i); b.setAttribute('aria-pressed', 'false');
      w.appendChild(b); h.appendChild(w);
      w.classList.add('ak-x'); w.setAttribute('data-ax', 'drop'); w.style.setProperty('--i', i);
    });
    t.appendChild(h);
    RR.forEach(function (r, ri) {
      var row = el('div', 'ak-rr'); row.setAttribute('role', 'row'); row.setAttribute('data-row', ri);
      var dw = el('div', 'ak-rdw'); dw.setAttribute('role', 'rowheader');
      var d = el('button', 'ak-rd', esc(r[0])); d.type = 'button'; d.setAttribute('aria-pressed', 'false');
      dw.appendChild(d); row.appendChild(dw);
      dw.classList.add('ak-x'); dw.setAttribute('data-ax', 'left'); dw.style.setProperty('--i', ri);
      r[1].split(' ').forEach(function (l, ci) {
        var cell = el('span', null, '<i class="ak-rc' + (l === '–' ? ' is-dash' : '') + '" data-l="' + l + '">' + l + '</i>');
        cell.setAttribute('role', 'cell'); cell.setAttribute('data-col', ci);
        cell.setAttribute('aria-label', RC[ci].b + ': ' + (l === '–' ? 'none' : l));
        cell.classList.add('ak-x'); cell.setAttribute('data-ax', 'over'); cell.style.setProperty('--i', ri + ci);
        row.appendChild(cell);
      });
      t.appendChild(row);
    });
  })();
  function rPaint(s) {
    var t = $('.ak-raci', s);
    t.classList.toggle('is-f', !!RX.f);
    $$('.ak-rc', t).forEach(function (c) { c.classList.toggle('is-hit', !!RX.f && c.getAttribute('data-l').split('/').indexOf(RX.f) > -1); });
    $$('[data-col]', t).forEach(function (c) { c.classList.toggle('is-col', +c.getAttribute('data-col') === RX.col); });
    $$('.ak-rh button', t).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-c') === RX.col)); });
    $$('.ak-rr[data-row]', t).forEach(function (r) { var on = +r.getAttribute('data-row') === RX.row; r.classList.toggle('is-row', on); $('.ak-rd', r).setAttribute('aria-pressed', String(on)); });
    $$('.ak-raci-f button', s).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === RX.f)); });
  }
  Deck.on('raci', {
    init: function (s) {
      $$('.ak-raci-f button', s).forEach(function (b) { b.addEventListener('click', function () { var f = b.getAttribute('data-f'); RX.f = RX.f === f ? '' : f; rPaint(s); }); });
      $$('.ak-rh button', s).forEach(function (b) { b.addEventListener('click', function () { var c = +b.getAttribute('data-c'); RX.col = RX.col === c ? -1 : c; rPaint(s); }); });
      $$('.ak-rd', s).forEach(function (b) { b.addEventListener('click', function () { var r = +b.parentNode.parentNode.getAttribute('data-row'); RX.row = RX.row === r ? -1 : r; rPaint(s); }); });
      nPaint(); rPaint(s);
    },
    enter: function (ctx, s) {
      nPaint();
      if (Deck.reduce || RX.f || RX.col > -1 || RX.row > -1) return;
      ctx.after(1100, function () { if (RX.f || RX.col > -1 || RX.row > -1) return; RX.f = 'A'; rPaint(s); });
    },
    settle: function (s) { RX = { f: '', col: -1, row: -1 }; rPaint(s); }
  });

  /* ---------- 10 · agree today ---------- */
  var QKEY = 'ak-atomy-q', COPY_LABEL = 'Copy for the minutes', copyT = 0;
  function qLoad() { try { return JSON.parse(sessionStorage.getItem(QKEY) || '{}'); } catch (e) { return {}; } }
  function qSave(m) { try { sessionStorage.setItem(QKEY, JSON.stringify(m)); } catch (e) {} }
  function qPaint(s) {
    var m = qLoad(), a = 0, f = 0;
    $$('.ak-q button', s).forEach(function (b) {
      var v = m[b.getAttribute('data-q')] || '';
      b.setAttribute('data-s', v);
      $('.ak-q-s', b).textContent = v === 'a' ? 'Agreed' : v === 'f' ? 'Follow up' : '';
      if (v === 'a') a++; if (v === 'f') f++;
    });
    $('[data-c=a]', s).textContent = a; $('[data-c=f]', s).textContent = f;
    nPaint();
  }
  Deck.on('agree', {
    init: function (s) {
      $$('.ak-q button', s).forEach(function (b) {
        b.addEventListener('click', function () {
          var m = qLoad(), k = b.getAttribute('data-q'), v = m[k] || '';
          m[k] = v === '' ? 'a' : v === 'a' ? 'f' : ''; qSave(m); qPaint(s);
        });
      });
      var copy = $('.ak-q-copy', s);
      copy.addEventListener('click', function () {
        var m = qLoad(), n = nLoad();
        var lines = ['ATOMY Philippines · Project kickoff · 27 Nov 2026', ''];
        var named = [['ATOMY project manager', n.pm], ['Finance and accounting key users', n.users], ["ATOMY's accountant", n.acct], ['Group chat', n.chat], ['ATOMY point of contact', n.poc], ['ATOMY change requests', n.cr], ['ATOMY project contact', n.proj]].filter(function (x) { return x[1]; });
        if (named.length) { lines.push('Agreed names:'); named.forEach(function (x) { lines.push('- ' + x[0] + ': ' + x[1]); }); lines.push(''); }
        var open = $$('.ak-q button', s).filter(function (b) { return m[b.getAttribute('data-q')] !== 'a'; });
        lines.push(open.length ? 'Open points:' : 'All eight points agreed.');
        open.forEach(function (b) {
          var t = $('.ak-q-t', b).firstChild.textContent.trim();
          lines.push('- ' + t + (m[b.getAttribute('data-q')] === 'f' ? ' (follow up)' : ''));
        });
        var text = lines.join('\n');
        var lab = $('span', copy);
        var say = function (w) { lab.textContent = w; clearTimeout(copyT); copyT = setTimeout(function () { lab.textContent = COPY_LABEL; }, 1600); };
        var fallback = function () {
          var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.left = '-9999px';
          document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove();
          say(ok ? 'Copied' : 'Copy failed');
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { say('Copied'); }, fallback); else fallback();
      });
      qPaint(s);
    },
    enter: function (ctx, s) { qPaint(s); },
    settle: function (s) { qPaint(s); }
  });

  nPaint();
})();

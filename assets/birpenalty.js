/* BIR e-invoicing: the deadline countdown and the penalties (owner, 27 Oct 2026: "Countdown on deadline", "add Penalty for
   non-compliant", "countdown of deadline around 41 days only on technext that we can work on").
   window.BIRDAYS  the one clock every deck uses: working days left (Mon-Fri from today in Manila to 31 Dec 2026, Philippine
                   holidays out, Proclamation No. 1006 s. 2025), calendar days left, and a live countdown to 31 Dec 23:59:59 (UTC+8).
   [data-bp]       any slide carrying it is rendered as the deadline-and-penalties slide: the working-day number, the ticking
                   clock, every working day on a Mon-Fri grid (holidays named on click) and the two Tax Code penalties.
   Facts (checked 27 Oct 2026): RMC 98-2026 (22 Sep 2026): covered taxpayers e-invoice on or before 31 Dec 2026, micro taxpayers
   out; e-invoicing (Sec. 237) and electronic sales reporting (Sec. 237-A) are separate, sales reporting waits for its own rules.
   RR 11-2025 points violations to Sections 264 and 264-A. Sec. 264(a) (unchanged by RA 10963): P1,000 to P50,000 and 2 to 4
   years. Sec. 264-A (RA 10963): 1/10 of 1% of annual net income (second preceding year) per day or P10,000, whichever is higher;
   over 180 days in a year, permanent closure. No penalty specific to the 31 Dec date has been published.
   Every timer runs on the slide's ctx; settle paints the finished slide (print, overview). */
(function () {
  'use strict';
  var END = Date.UTC(2026, 11, 31, 15, 59, 59);   // 31 Dec 2026, 11:59:59 pm in Manila
  var HOL = { '2026-11-01': "All Saints' Day", '2026-11-02': "All Souls' Day (special non-working)", '2026-11-30': 'Bonifacio Day',
    '2026-12-08': 'Feast of the Immaculate Conception', '2026-12-24': 'Christmas Eve (special non-working)', '2026-12-25': 'Christmas Day',
    '2026-12-30': 'Rizal Day', '2026-12-31': 'Last day of the year (special non-working)' };
  function manila(t) { var d = new Date((t == null ? Date.now() : t) + 8 * 3600e3); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); }
  function key(d) { return d.toISOString().slice(0, 10); }
  var LAST = new Date(Date.UTC(2026, 11, 31));
  function isWork(d) { var w = d.getUTCDay(); return w > 0 && w < 6 && !HOL[key(d)]; }
  function work() { var n = 0; for (var d = manila(); d <= LAST; d = new Date(d.getTime() + 864e5)) if (isWork(d)) n++; return n; }
  function cal() { return Math.max(0, Math.round((LAST - manila()) / 864e5)); }
  function left() { var ms = Math.max(0, END - Date.now()); return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 }; }
  window.BIRDAYS = { work: work, cal: cal, left: left, holidays: HOL, isWork: isWork, manila: manila, key: key };

  // any [data-bp-work] element shows today's working-day count (cover tags and the like)
  [].forEach.call(document.querySelectorAll('[data-bp-work]'), function (e) { e.textContent = work(); });

  var Deck = window.Deck; if (!Deck) return;
  var slides = [].slice.call(document.querySelectorAll('[data-bp]')); if (!slides.length) return;
  function $(q, r) { return r.querySelector(q); }
  function $$(q, r) { return [].slice.call(r.querySelectorAll(q)); }
  function live() { return !(Deck.reduce || Deck.tv); }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  var SV = {
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    wave: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 11l2 2 4-4"/></svg>',
    file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>'
  };

  // the Mon-Fri grid: every week from this week to the week of 31 December
  function grid() {
    var t = manila(), mon = new Date(t.getTime() - ((t.getUTCDay() + 6) % 7) * 864e5), h = '', mo = '';
    for (var w = mon; w <= LAST; w = new Date(w.getTime() + 7 * 864e5)) {
      var lab = w.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
      h += '<div class="bp-wk"><span class="bp-wl">' + (lab !== mo ? lab : '') + '</span>'; mo = lab;
      for (var i = 0; i < 5; i++) {
        var d = new Date(w.getTime() + i * 864e5), k = key(d), cls = 'bp-d', nm = HOL[k] || '';
        if (d < t) cls += ' is-past'; else if (d > LAST) cls += ' is-after'; else if (nm) cls += ' is-hol'; else cls += ' is-work';
        if (k === key(t)) cls += ' is-today';
        if (k === '2026-12-31') cls += ' is-dl';
        h += '<button type="button" class="' + cls + '" data-k="' + k + '"' + (nm ? ' data-n="' + nm.replace(/"/g, '&quot;') + '"' : '') + ' tabindex="' + (nm || k === '2026-12-31' ? '0' : '-1') + '" aria-label="' + d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }) + (nm ? ': ' + nm : '') + '">' + d.getUTCDate() + '</button>';
      }
      h += '</div>';
    }
    return h;
  }
  function html(o) {
    return '<span class="kicker" data-in>' + (o.kicker || 'the deadline and the penalties') + '</span>' +
      '<h2 class="h-m bp-h2" data-in style="--d:80ms">' + (o.h2 || 'The working days left, <span class="hl">and what non-compliance costs.</span>') + '</h2>' +
      '<div class="bp-wrap">' +
      '<div class="bp-clock" data-in data-fx="land" style="--d:180ms">' +
        '<div class="bp-big"><b class="bp-n">' + work() + '</b><span><em>working days left</em><small>Monday to Friday, Philippine holidays out</small></span></div>' +
        '<div class="bp-tick" aria-label="Time to 31 December 2026, 11:59 pm Manila"><p><b class="bp-td">' + left().d + '</b><small>days</small></p><p><b class="bp-th">00</b><small>hrs</small></p><p><b class="bp-tm">00</b><small>min</small></p><p><b class="bp-ts">00</b><small>sec</small></p></div>' +
        '<p class="bp-to">' + SV.cal + 'to 31 December 2026, 11:59 pm Manila time</p>' +
        '<div class="bp-grid" role="group" aria-label="Every working day to 31 December"><div class="bp-wh"><span></span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span></div>' + grid() + '</div>' +
        '<p class="bp-cap" aria-live="polite">Amber: Philippine holidays. Click one to name it.</p>' +
      '</div>' +
      '<div class="bp-pen">' +
        '<article class="bp-card" data-in data-fx="right" style="--d:260ms"><header><span class="bp-ic">' + SV.doc + '</span><span class="bp-sec">Tax Code Sec. 264(a)</span></header>' +
          '<h3>No proper invoice issued</h3><p class="bp-amt">₱1,000 – ₱50,000</p><p class="bp-plus">fine, <b>and</b> imprisonment of 2 to 4 years</p>' +
          '<p class="bp-why">For failing or refusing to issue an invoice. RR 11-2025 applies it to e-invoicing.</p></article>' +
        '<article class="bp-card" data-in data-fx="right" style="--d:340ms"><header><span class="bp-ic">' + SV.wave + '</span><span class="bp-sec">Tax Code Sec. 264-A</span></header>' +
          '<h3>Sales data not sent to the BIR</h3><p class="bp-amt">₱10,000 a day</p><p class="bp-plus">or 1/10 of 1% of annual net income a day, if higher · <b>over 180 days in a year: permanent closure</b></p>' +
          '<p class="bp-later">Applies once the BIR switches on electronic sales reporting (not started yet).</p></article>' +
        '<p class="bp-note" data-in style="--d:420ms">The BIR has not published a separate penalty for the 31 December date itself, and the Commissioner can still extend it.</p>' +
        '<p class="bp-who" data-in style="--d:470ms">' + SV.user + '<span>Your accountant or RDO confirms what applies. TechNext is not affiliated with the BIR.</span></p>' +
      '</div></div>' +
      '<p class="illus bp-ill">' + SV.file + 'Tax Code Secs. 264(a), 264-A · RR 11-2025 · RMC 98-2026 · holidays: Proc. No. 1006 · not tax advice</p>';
  }
  function paintClock(s) {
    var L = left();
    $('.bp-td', s).textContent = L.d; $('.bp-th', s).textContent = p2(L.h); $('.bp-tm', s).textContent = p2(L.m); $('.bp-ts', s).textContent = p2(L.s);
  }
  slides.forEach(function (s) {
    var o = {}; try { o = JSON.parse(s.getAttribute('data-bp') || '{}'); } catch (e) { }
    var f = s.querySelector('.s-foot'), h = html(o);
    if (f) f.insertAdjacentHTML('beforebegin', h); else s.insertAdjacentHTML('beforeend', h);
    $('.bp-grid', s).addEventListener('click', function (e) {
      var b = e.target.closest('.bp-d'); if (!b) return;
      var cap = $('.bp-cap', s), n = b.getAttribute('data-n');
      $$('.bp-d.is-sel', s).forEach(function (x) { x.classList.remove('is-sel'); });
      if (n) { b.classList.add('is-sel'); cap.textContent = b.getAttribute('aria-label') + '. Not a working day.'; }
      else if (b.classList.contains('is-dl')) { b.classList.add('is-sel'); cap.textContent = 'Thu 31 Dec: the deadline, and a special non-working day.'; }
    });
    function finished() {
      $('.bp-n', s).textContent = work(); var hn = $('.bp-hn', s); if (hn) hn.textContent = work();
      $$('.bp-d', s).forEach(function (d) { d.classList.add('is-on'); });
      paintClock(s);
    }
    Deck.on(s.id, {
      enter: function (ctx) {
        finished();
        if (!live()) return;
        // the working days light up week by week while the number counts down to today's figure; then the clock ticks every second
        var days = $$('.bp-d.is-work,.bp-d.is-hol,.bp-d.is-dl', s);
        days.forEach(function (d) { d.classList.remove('is-on'); });
        days.forEach(function (d, i) { ctx.after(260 + i * 22, function () { d.classList.add('is-on'); }); });
        ctx.count($('.bp-n', s), work(), { from: cal(), dur: 1400 });
        ctx.every(1000, function () { paintClock(s); });
      },
      settle: function () { finished(); $$('.bp-d.is-sel', s).forEach(function (x) { x.classList.remove('is-sel'); }); $('.bp-cap', s).textContent = 'Amber: Philippine holidays. Click one to name it.'; }
    });
  });
})();

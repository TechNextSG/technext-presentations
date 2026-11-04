/* BIR CAS registration and compliance (8 slides). Prefix bc-.
   Process slides are step-driven (data-steps + the step hook) so a clicker walks them; clicks on items go through
   Deck.go(Deck.index, k) so the keys, the presenter view and the engine stay in step. Every JS-driven slide has a settle
   hook that paints the finished state (print, PDF, overview). Timers only through ctx. */
(function () {
  'use strict';
  var $ = Deck.$, $$ = Deck.$$;
  function say(s, text) { var el = $('[data-bc-live],[data-bc-say]', s); if (el) el.textContent = text; }
  function swap(el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }

  /* ---------------------------------------------------------------- 1 · cover: the registration ends on the invoice */
  // the track's last stop sits level with the invoice's AC line, whatever the fonts did to the invoice's height
  function alignMini(s) {
    var art = $('.bc-cvart', s), mini = $('.bc-mini', s), v = $('.bc-ac-v', s);
    var y = Deck.lbox(v, art).cy, top = mini.offsetTop;
    if (y > top + 120) mini.style.height = Math.round(y - top) + 'px';
  }
  Deck.on('cover', {
    init: function (s) { alignMini(s); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { alignMini(s); }); },
    enter: function (ctx, s) {
      alignMini(s);
      var art = $('.bc-cvart', s), dots = $$('.bc-mini li', s);
      art.classList.remove('is-run', 'is-done'); dots.forEach(function (d) { d.classList.remove('is-on'); });
      ctx.after(700, function () { art.classList.add('is-run'); });
      dots.forEach(function (d, i) { ctx.after(700 + Math.round(2200 * i / 3), function () { d.classList.add('is-on'); }); });
      ctx.after(3050, function () { art.classList.add('is-done'); });
    },
    settle: function (s) {
      alignMini(s);
      $('.bc-cvart', s).classList.add('is-run', 'is-done');
      $$('.bc-mini li', s).forEach(function (d) { d.classList.add('is-on'); });
    }
  });

  /* ---------------------------------------------------------------- 2 · register first / go live first */
  function order(s, live) {
    var box = $('.bc-order', s);
    box.classList.toggle('is-live', live);
    $('.bc-track', s).setAttribute('data-order', live ? 'live' : 'reg');
    $$('.bc-seg button', s).forEach(function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-k') === '1') === live)); });
    say(s, live ? 'Go live first: everything issued before the AC is unregistered.' : 'Register first: books and invoices count from day one.');
  }
  Deck.on('what', {
    init: function (s) {
      s.addEventListener('click', function (e) {
        var b = e.target.closest('.bc-seg button'); if (!b) return;
        Deck.go(Deck.index, +b.getAttribute('data-k'));
      });
    },
    step: function (n, ctx, s) { order(s, n === 1); },
    settle: function (s) { order(s, false); }
  });

  /* ---------------------------------------------------------------- 3 · penalty table drives the staircase */
  var S3 = ['3rd and later', 'No compromise', 'The case can go to court'];
  var C264 = '₱1,000 to ₱50,000 fine and 2 to 4 years';
  var ROWS = [
    { n: 'Using unregistered invoices', sec: 'Sec. 264', s1: ['1st offence', '₱20,000'], s2: ['2nd offence', '₱50,000'], s3: S3, crim: C264 },
    { n: 'Unregistered cash register machine', sec: 'Sec. 264', s1: ['1st offence', '₱25,000', 'per unit'], s2: ['2nd offence', '₱50,000', 'per unit'], s3: S3, crim: C264 },
    { n: 'Failure to issue invoices', sec: 'Sec. 264', s1: ['1st offence', '₱10,000'], s2: ['2nd offence', '₱20,000'], s3: S3, crim: C264 },
    { n: 'Invoices missing required details', sec: 'Sec. 264', s1: ['1st offence', '₱5,000'], s2: ['2nd offence', '₱10,000'], s3: S3, crim: C264 },
    { n: 'Not producing books when summoned', sec: 'Sec. 266', s1: ['1st offence', '₱10,000'], s2: ['2nd offence', '₱20,000'], s3: S3, crim: '₱5,000 to ₱10,000 fine and 1 to 2 years' },
    { n: 'Failure to keep or preserve records', sec: 'Secs. 232, 235', s1: ['Compromise', '₱1,000 to ₱50,000', 'scaled to gross sales'], s2: null, s3: null, crim: 'A fine of up to ₱1,000, up to 6 months, or both (Sec. 275)' },
    { n: 'Keeping two sets of books', sec: 'Sec. 257', s1: null, s2: null, s3: ['Any offence', 'No compromise', 'Fraud: the case can go to court'], crim: '₱50,000 to ₱100,000 fine and 2 to 6 years' }
  ];
  function fillStep(li, d) {
    li.style.display = d ? '' : 'none'; if (!d) return;
    $('span', li).textContent = d[0]; $('b', li).textContent = d[1];
    var sm = $('small', li);
    if (d[2]) { if (!sm) { sm = document.createElement('small'); li.appendChild(sm); } sm.textContent = d[2]; } else if (sm) sm.remove();
  }
  function row(s, r, quiet) {
    var d = ROWS[r]; s._row = r;
    $$('.bc-tbl tbody tr', s).forEach(function (tr, i) {
      tr.classList.toggle('is-on', i === r); $('button', tr).setAttribute('aria-pressed', String(i === r));
    });
    $('[data-bc-name]', s).textContent = d.n; $('[data-bc-sec]', s).textContent = d.sec;
    fillStep($('.bc-s1', s), d.s1); fillStep($('.bc-s2', s), d.s2); fillStep($('.bc-s3', s), d.s3);
    $('[data-bc-crim]', s).textContent = d.crim;
    if (!quiet) say(s, d.n + ', ' + d.sec + '. ' + [d.s1, d.s2, d.s3].filter(Boolean).map(function (x) { return x[0] + ': ' + x[1]; }).join('; ') + '. If prosecuted: ' + d.crim + '.');
  }
  function stair(s, n) {
    // build n: 0 = first offence, 1 = + second, 2 = + third and the criminal range
    $$('.bc-steps li', s).forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-st') <= n); });
    $('.bc-crim', s).classList.toggle('is-on', n >= 2);
    // a row without a first or second offence shows its next step at once
    var d = ROWS[s._row || 0];
    if (!d.s1 || !d.s2) $$('.bc-steps li', s).forEach(function (li) { if (+li.getAttribute('data-st') <= n + 1) li.classList.add('is-on'); });
    $$('.bc-steps li', s).forEach(function (li) { li.setAttribute('aria-hidden', String(!li.classList.contains('is-on'))); });
  }
  Deck.on('risks', {
    init: function (s) {
      row(s, 0, true);
      s.addEventListener('click', function (e) {
        var b = e.target.closest('.bc-tbl tbody th button'); if (!b) return;
        var r = +b.closest('tr').getAttribute('data-r');
        if (r === s._row && Deck.step === 2) return;
        row(s, r);
        if (Deck.step === 2) { stair(s, -1); void s.offsetWidth; stair(s, 2); }   // replay the build for the new row
        else Deck.go(Deck.index, 2);
      });
    },
    step: function (n, ctx, s) { stair(s, n); },
    settle: function (s) { if (s._row == null) row(s, 0, true); stair(s, 2); }
  });

  /* ---------------------------------------------------------------- 4 · the process on two lanes */
  var STEPS = [
    { t: 'Prepare the documents and samples', w: 'You, with TechNext', d: 'A sworn statement with the system description, sample invoices and books printed from the system, the printed audit trail and the signed technical requirements (Annex B). The next slide is the checklist.' },
    { t: 'Apply in ORUS, or at your RDO', w: 'You file it, under your TIN', d: 'Submit the application and every attachment through ORUS, the BIR\'s Online Registration and Update System, or at your Revenue District Office (RDO) or the Large Taxpayers office. Your business files it; TechNext does not file or register on your behalf.' },
    { t: 'The BIR checks it for completeness', w: 'The BIR', bir: 1, d: 'Your RDO, or the Large Taxpayers office, reviews the application. If something is missing, you fix the gap and resubmit.' },
    { t: 'The BIR issues the Acknowledgement Certificate', w: 'The BIR', bir: 1, d: 'The AC carries a control number. The timing is the BIR\'s; until the AC is issued, keep your current books and invoices.' },
    { t: 'Go live on the system', w: 'You, with TechNext', d: 'From the go-live date the registered system is your official books, and the AC control number prints on every system-generated invoice.' },
    { t: 'Register your e-books after every year-end', w: 'You, with TechNext', d: 'A soft copy of your books of accounts, registered in ORUS within 30 days after each taxable year ends. Odoo exports the books; the registration is yours.' },
    { t: 'The BIR post-evaluates the system', w: 'The BIR', bir: 1, d: 'The RDO checks the system against BIR standards on its own timing, and any audit can check it again. Violations draw RMO 7-2015 penalties.' }
  ];
  function lanes(s, n, anim) {
    $$('.bc-st li', s).forEach(function (li, k) { li.classList.toggle('is-done', k <= n); li.classList.toggle('is-on', k === n); $('button', li).setAttribute('aria-current', k === n ? 'step' : 'false'); });
    $$('.bc-segs path', s).forEach(function (p, k) { p.classList.toggle('is-on', k < n); });
    var d = STEPS[n], box = $('.bc-say', s), who = $('[data-bc-who]', s);
    $('[data-bc-n]', s).textContent = 'Step ' + (n + 1) + ' of 7';
    who.textContent = d.w; who.classList.toggle('is-bir', !!d.bir);
    $('[data-bc-t]', s).textContent = d.t; $('[data-bc-d]', s).textContent = d.d;
    if (anim) swap(box); else box.classList.remove('is-swap');
    say(s, 'Step ' + (n + 1) + ' of 7: ' + d.t + '. ' + d.w + '.');
  }
  Deck.on('process', {
    init: function (s) {
      s.addEventListener('click', function (e) {
        var li = e.target.closest('.bc-st li'); if (!li) return;
        Deck.go(Deck.index, +li.getAttribute('data-k'));
      });
    },
    step: function (n, ctx, s, first) { lanes(s, n, !first); },
    settle: function (s) { lanes(s, 6, false); }
  });

  /* ---------------------------------------------------------------- 5 · the pack: ticks kept for the session */
  var KEY = 'bc-pack';
  function load() { try { return JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(m) { try { sessionStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* private mode: ticks last for this view */ } }
  function pack(s, m) {
    var n = 0;
    $$('.bc-pack button', s).forEach(function (b) { var on = !!m[b.getAttribute('data-id')]; b.setAttribute('aria-pressed', String(on)); if (on) n++; });
    var full = n === 6;
    $('[data-bc-c]', s).textContent = n;
    $('.bc-count', s).classList.toggle('is-full', full); $('.bc-count', s).classList.toggle('is-zero', n === 0);
    $('.bc-ready', s).classList.toggle('is-full', full);
    $('[data-bc-ready]', s).textContent = full ? 'Ready to file in ORUS: the application is yours to submit.'
      : n ? (6 - n) + (6 - n === 1 ? ' item' : ' items') + ' still to prepare.' : 'Tick each item as it is ready.';
  }
  Deck.on('prepare', {
    init: function (s) {
      s._m = load();
      s.addEventListener('click', function (e) {
        var b = e.target.closest('.bc-pack button'); if (!b) return;
        var id = b.getAttribute('data-id'); s._m[id] = !s._m[id]; save(s._m); pack(s, s._m);
        if (s._m[id] && !Deck.reduce) b.querySelector('.bc-tick').animate([{ transform: 'scale(.7)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.16,.86,.3,1)' });
      });
    },
    enter: function (ctx, s) { s._m = load(); pack(s, s._m); },
    settle: function (s) { pack(s, {}); }   // print, PDF and overview show the blank list; enter restores the ticks
  });

  /* ---------------------------------------------------------------- 6 · what continues: one rhythm per row */
  function rhythm(s, n) {
    var rows = $$('.bc-rhythm li', s);
    rows.forEach(function (li, k) {
      li.classList.toggle('is-done', k <= n); li.classList.toggle('is-on', k === n);
      $('button', li).setAttribute('aria-current', k === n ? 'step' : 'false');
    });
    if (rows[n]) say(s, $('.bc-cad', rows[n]).textContent + ': ' + $('.bc-ob b', rows[n]).textContent + '.');
  }
  Deck.on('after', {
    init: function (s) {
      s.addEventListener('click', function (e) {
        var li = e.target.closest('.bc-rhythm li'); if (!li) return;
        Deck.go(Deck.index, +li.getAttribute('data-k'));
      });
    },
    step: function (n, ctx, s) { rhythm(s, n); },
    settle: function (s) {   // finished: every row read, none singled out
      rhythm(s, 4);
      $$('.bc-rhythm li', s).forEach(function (li) { li.classList.remove('is-on'); $('button', li).setAttribute('aria-current', 'false'); });
    }
  });

  /* ---------------------------------------------------------------- 7 · the five days light what is included */
  function days(s, n) {
    $$('.bc-days li', s).forEach(function (li, k) { li.classList.toggle('is-done', k <= n); li.classList.toggle('is-on', k === n); $('button', li).setAttribute('aria-current', k === n ? 'step' : 'false'); });
    $$('.bc-inc li[data-day]', s).forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-day') <= n); });
  }
  Deck.on('package', {
    init: function (s) {
      s.addEventListener('click', function (e) {
        var li = e.target.closest('.bc-days li'); if (!li) return;
        Deck.go(Deck.index, +li.getAttribute('data-k'));
      });
    },
    step: function (n, ctx, s) { days(s, n); },
    settle: function (s) { days(s, 4); }
  });
})();

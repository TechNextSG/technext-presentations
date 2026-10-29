/* Proposal for St. Clare College. Slide behaviour. Every person, time, rate and deduction in the demos is sample data,
   labelled on its slide. Every slide whose finished state comes from JS has a settle hook (overview, print, PDF). */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  var PESO = '₱';
  function peso(n) { return (n < 0 ? '−' : '') + PESO + Math.abs(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function hhmm(min) { var h = Math.floor(min / 60), m = min % 60; return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
  function seg(root, fn) {
    function set(v, quiet) {
      $$('button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      if (!quiet) fn(v);
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    return set;
  }
  function swap(el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }
  // "0:a|3:b" -> the text for step n
  function stepText(spec, n) { var out = ''; spec.split('|').forEach(function (p) { var i = p.indexOf(':'); if (+p.slice(0, i) <= n) out = p.slice(i + 1); }); return out; }

  // jump links: agenda, phase cards, website lane
  stage.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]'); if (!a) return;
    e.preventDefault(); Deck.goId(a.dataset.go);
  });

  /* ---------------------------------------------------------------- 2 · faculty time-in today */
  var NAMES = { basic: ['M. Cruz', 'J. Bautista', 'R. Flores', 'L. Torres'], shs: ['A. Reyes', 'B. Santos', 'C. Dela Cruz', 'D. Garcia'], ter: ['P. Mendoza', 'K. Villanueva', 'S. Aquino', 'T. Navarro'] };
  var TIMES = ['6:54', '7:02', '7:09', '7:15'];
  function addRow(col, quiet) {
    var ul = $('ul', col), n = ul.children.length;
    if (n >= 4) { ul.innerHTML = ''; n = 0; }
    var li = document.createElement('li');
    li.innerHTML = '<b>' + NAMES[col.dataset.k][n] + '</b><span>' + TIMES[(n + col.dataset.k.length) % 4] + '</span>';
    if (!quiet) li.className = 'is-new';
    ul.appendChild(li);
  }
  Deck.on('understand', {
    init: function (s) {
      $$('.sx-ic', s).forEach(function (c) { $('.sx-ic-b', c).addEventListener('click', function () { s._held = true; addRow(c); }); });
    },
    enter: function (ctx, s) {
      s._held = false;
      var cols = $$('.sx-ic', s);
      cols.forEach(function (c) { $('ul', c).innerHTML = ''; });
      var i = 0;
      ctx.after(900, function () {
        ctx.every(650, function () { if (s._held || i >= 6) return false; addRow(cols[i % 3]); i++; });
      });
    },
    settle: function (s) {
      $$('.sx-ic', s).forEach(function (c) { if ($('ul', c).children.length < 2) { $('ul', c).innerHTML = ''; addRow(c, true); addRow(c, true); } });
    }
  });

  /* ---------------------------------------------------------------- 4 · apps */
  var APPS = {
    hr: ['People', 'Employees', 'Every teacher and staff member once: division, department, position, full- or part-time, working schedule and approvers. Everything else reads this record.', 'Phase 1 · timekeeping'],
    att: ['Time', 'Attendances', 'Time-ins stamped by the system: a kiosk at the gate with badge or PIN, or check-in inside Odoo for online classes. Grace periods and overtime rules count lates and extra hours.', 'Phase 2 · attendance'],
    off: ['Time', 'Time Off', 'Leave as a request with a balance. The division head approves, the balance updates itself, and public holidays come from one calendar.', 'Phase 1 · timekeeping'],
    pay: ['Pay', 'Payroll', 'Odoo 20’s Philippine payroll package: payslips from approved time, SSS and Pag-IBIG loan deductions, and BIR 1601-C, 2316, 1604-C and Alphalist from the same payslips.', 'Phase 3 · payroll'],
    web: ['Front door', 'Website', 'A new stclareonline.com on Odoo Website, in the same database. Website design is optional and scoped in a written quotation; your team edits it by drag and drop.', 'Alongside all three phases']
  };
  Deck.on('apps', {
    init: function (s) {
      s._pick = function (k, quiet) {
        $$('.sx-ac button', s).forEach(function (b) { b.classList.toggle('is-on', b.dataset.k === k); });
        var a = APPS[k], ic = $('.sx-ac button[data-k="' + k + '"] .oi', s);
        $('.sx-ap-place', s).textContent = a[0];
        $('.sx-ap-i', s).innerHTML = ic ? ic.outerHTML : '';
        $('.sx-ap-t', s).textContent = a[1];
        $('.sx-ap-d', s).textContent = a[2];
        $('.sx-ap-r', s).textContent = a[3];
        if (!quiet) swap($('.sx-ap', s));
      };
      $('.sx-ag', s).addEventListener('click', function (e) { var b = e.target.closest('.sx-ac button'); if (!b) return; s._held = true; s._pick(b.dataset.k); });
    },
    enter: function (ctx, s) {
      s._held = false;
      var keys = ['hr', 'att', 'off', 'pay', 'web'], i = 0;
      ctx.after(1400, function () {
        if (!s._held) s._pick(keys[0]);
        ctx.every(3200, function () { if (s._held) return; i = (i + 1) % keys.length; s._pick(keys[i]); });
      });
    },
    settle: function (s) { s._pick('att', true); }
  });

  /* ---------------------------------------------------------------- 5 · one teacher, time-in to payslip */
  function paintDay(s, n) {
    $('.sx-cnt', s).textContent = n;
    $$('.sx-steps li', s).forEach(function (li, i) { li.classList.toggle('is-on', i + 1 === n); li.classList.toggle('is-done', i + 1 < n); });
    $$('[data-on]', s).forEach(function (el) {
      var on = +el.dataset.on <= n;
      el.classList.toggle('is-on', on);
      el.classList.toggle('is-now', +el.dataset.on === n);
    });
    $$('[data-t]', s).forEach(function (el) { el.textContent = stepText(el.dataset.t, n); });
    var sc = $('.sx-sc', s); if (n) sc.dataset.k = n; else delete sc.dataset.k;
  }
  Deck.on('day', {
    init: function (s) {
      var play = $('.sx-play', s);
      s._stop = function () { s._run = (s._run || 0) + 1; play.classList.remove('is-on'); $('span', play).textContent = 'Play the flow'; s._playing = false; };
      $$('.sx-steps button', s).forEach(function (b) { b.addEventListener('click', function () { s._stop(); Deck.go(Deck.index, +b.dataset.n); }); });
      play.addEventListener('click', function () {
        if (s._playing || !s._ctx) { s._stop(); return; }
        var tok = (s._run || 0) + 1; s._run = tok; s._playing = true;
        play.classList.add('is-on'); $('span', play).textContent = 'Pause';
        Deck.go(Deck.index, Deck.step >= 6 ? 0 : Deck.step + 1);
        s._ctx.every(1700, function () {
          if (s._run !== tok) return;
          if (Deck.index !== Deck.slides.indexOf(s) || Deck.step >= 6) { s._stop(); return; }
          Deck.go(Deck.index, Deck.step + 1);
        });
      });
    },
    enter: function (ctx, s) { s._ctx = ctx; s._stop(); },
    step: function (n, ctx, s) { paintDay(s, n); },
    leave: function (s) { s._stop(); },
    settle: function (s) { paintDay(s, 6); }
  });

  /* ---------------------------------------------------------------- 7 · phase 1: working schedules (sample) */
  // [start hour, end hour, days Mon..Sat]
  var SCHED = {
    basic: { ft: [7, 16, [1, 1, 1, 1, 1, 0]], pt: [7, 12, [1, 0, 1, 0, 1, 0]] },
    shs: { ft: [7, 16, [1, 1, 1, 1, 1, 0]], pt: [13, 18, [0, 1, 0, 1, 0, 0]] },
    ter: { ft: [8, 17, [1, 1, 1, 1, 1, 0]], pt: [13, 18, [1, 0, 1, 0, 0, 1]] }
  };
  var DIVN = { basic: 'Basic Ed', shs: 'Senior High', ter: 'Tertiary' }, TYPN = { ft: 'full-time', pt: 'part-time' };
  function paintSched(s) {
    var d = SCHED[s._div][s._typ], st = d[0], en = d[1], days = d[2], tot = 0;
    $('.sx-wk', s).dataset.typ = s._typ;
    $$('.sx-wk-d i', s).forEach(function (i, k) {
      i.style.setProperty('--t', (st - 6) / 12);
      i.style.setProperty('--h', (en - st) / 12);
      i.classList.toggle('is-on', !!days[k]);
      if (days[k]) tot += (en - st) - (s._typ === 'ft' ? 1 : 0);
    });
    $('.sx-sb-name', s).textContent = DIVN[s._div] + ' · ' + TYPN[s._typ] + ' · ' + hhmm(st * 60) + ' to ' + hhmm(en * 60) + (s._typ === 'ft' ? ', 1 h break' : '');
    $('.sx-sb-h', s).textContent = tot + ' h a week';
  }
  Deck.on('p1', {
    init: function (s) {
      s._div = 'basic'; s._typ = 'ft';
      s._setDiv = seg($('.sx-sb-div', s), function (v) { s._held = true; s._div = v; paintSched(s); });
      s._setTyp = seg($('.sx-sb-typ', s), function (v) { s._held = true; s._typ = v; paintSched(s); });
      s._reset = function (dv, tp) { s._div = dv; s._typ = tp; s._setDiv(dv, true); s._setTyp(tp, true); paintSched(s); };
    },
    enter: function (ctx, s) {
      s._held = false; s._reset('basic', 'ft');
      var seq = [['shs', 'ft'], ['shs', 'pt'], ['ter', 'pt'], ['ter', 'ft'], ['basic', 'ft']], i = 0;
      ctx.after(1600, function () {
        ctx.every(2400, function () { if (s._held) return false; s._reset(seq[i][0], seq[i][1]); i = (i + 1) % seq.length; });
      });
    },
    settle: function (s) { s._reset('ter', 'pt'); }
  });

  /* ---------------------------------------------------------------- 8 · phase 2: kiosk (sample: schedule 7:00, grace 10 min) */
  function paintKiosk(s, v) {
    var t = 6 * 60 + 50 + v, late = t - 7 * 60, isLate = late > 10;
    $('.sx-k-sl input', s).value = v;
    var tx = hhmm(t);
    $('.sx-k-v', s).textContent = tx;
    $('.sx-k-clock', s).textContent = tx;
    var st = $('.sx-k-st', s);
    st.dataset.state = isLate ? 'late' : 'ok';
    st.textContent = isLate ? 'Late ' + late + ' min' : 'On time';
    $('.sx-k-d', s).textContent = 'Checked in ' + tx + ' · schedule 07:00 · grace 10 min';
    $('.sx-bd-t', s).textContent = tx;
    var b = $('.sx-bd-s', s);
    b.className = 'sx-bd-s ' + (isLate ? 'late' : 'ok');
    b.textContent = isLate ? 'Late ' + late + ' min' : 'On time';
    $('.sx-bd-late', s).textContent = isLate ? 2 : 1;
  }
  Deck.on('p2', {
    init: function (s) {
      var r = $('.sx-k-sl input', s);
      r.addEventListener('input', function () { s._held = true; paintKiosk(s, +r.value); });
    },
    enter: function (ctx, s) {
      s._held = false; paintKiosk(s, 12);
      // Ana arrives later and crosses the grace period, once
      ctx.after(1700, function () {
        ctx.tween(1800, function (p) { if (!s._held) paintKiosk(s, Math.round(12 + 14 * p)); }, 'io');
      });
    },
    settle: function (s) { paintKiosk(s, 26); }
  });

  /* ---------------------------------------------------------------- 9 · phase 3: payslip (sample rates) */
  var PAY = {
    ft: { label: 'Approved extra hours', max: 20, val: 3, step: 1, div: 2, basic: 14000, basicN: 'Basic pay · half month', rate: 200, lineN: function (h) { return 'Overtime · ' + h + ' h approved'; }, gov: 1180, loan: 800, tax: 540 },
    pt: { label: 'Hours taught this cut-off', max: 100, val: 60, step: 1, div: 1, basic: 0, basicN: 'Basic pay · hourly faculty', rate: 250, lineN: function (h) { return 'Teaching · ' + h + ' h × ' + PESO + '250'; }, gov: 620, loan: 0, tax: 0 }
  };
  function paintPay(s, bump) {
    var p = PAY[s._typ], raw = s._h, h = raw / p.div, earn = h * p.rate, gross = p.basic + earn;
    var net = gross - p.gov - p.loan - p.tax;
    $('.sx-ps-sl-l', s).textContent = p.label;
    $('.sx-ps-v', s).textContent = (p.div === 2 ? h.toFixed(1) : h) + ' h';
    $('.sx-l-bn', s).textContent = p.basicN;
    $('.sx-l-b', s).textContent = p.basic ? peso(p.basic) : '—';
    $('.sx-l-on', s).textContent = p.lineN(p.div === 2 ? h.toFixed(1) : h);
    $('.sx-l-o', s).textContent = peso(earn);
    $('.sx-l-g', s).textContent = peso(-p.gov);
    $('.sx-r-loan', s).classList.toggle('is-off', !p.loan);
    $('.sx-l-t', s).textContent = p.tax ? peso(-p.tax) : PESO + '0.00';
    var n = $('.sx-l-n', s); n.textContent = peso(net);
    if (bump) { n.classList.remove('is-bump'); void n.offsetWidth; n.classList.add('is-bump'); }
  }
  Deck.on('p3', {
    init: function (s) {
      var r = $('.sx-ps-sl input', s);
      s._apply = function (typ, h) { s._typ = typ; var p = PAY[typ]; r.max = p.max; r.step = p.step; s._h = h; r.value = h; paintPay(s); };
      s._set = seg($('.sx-ps-typ', s), function (v) { s._held = true; s._apply(v, PAY[v].val); });
      r.addEventListener('input', function () { s._held = true; s._h = +r.value; paintPay(s, true); });
      s._reset = function (typ, h) { s._set(typ, true); s._apply(typ, h); };
    },
    enter: function (ctx, s) {
      s._held = false; s._reset('ft', 3);
      ctx.after(1600, function () {
        if (s._held) return;
        s._reset('pt', 40);
        ctx.tween(1600, function (p) { if (s._held) return; s._h = Math.round(40 + 32 * p); $('.sx-ps-sl input', s).value = s._h; paintPay(s); }, 'io');
      });
    },
    settle: function (s) { s._reset('pt', 72); }
  });

  /* ---------------------------------------------------------------- 10 · website */
  Deck.on('website', {
    init: function (s) {
      var ws = $('.sx-ws', s);
      s._set = seg($('.sx-ws-seg', s), function (v) { s._held = true; ws.dataset.mode = v; });
      s._mode = function (v) { s._set(v, true); ws.dataset.mode = v; };
    },
    enter: function (ctx, s) {
      s._held = false; s._mode('now');
      ctx.after(2200, function () { if (!s._held) s._mode('new'); });
    },
    settle: function (s) { s._mode('new'); }
  });

  /* ---------------------------------------------------------------- 11 · questions (marks kept for this tab) */
  var KEY = 'sx-questions';
  function load() { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(m) { try { sessionStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { } }
  function paintQ(s) {
    var m = load(), a = 0, f = 0;
    $$('.sx-qg button', s).forEach(function (b) {
      var v = m[b.dataset.q] || ''; if (v) b.dataset.s = v; else b.removeAttribute('data-s');
      if (v === 'ok') a++; if (v === 'fu') f++;
    });
    $('.sx-q-a', s).textContent = a; $('.sx-q-f', s).textContent = f;
  }
  function followText(s) {
    var m = load(), out = ['St. Clare College · follow-ups'];
    $$('.sx-qg button', s).forEach(function (b) { if (m[b.dataset.q] === 'fu') out.push(b.dataset.q + '. ' + $('span', b).textContent); });
    if (out.length === 1) out.push('(none marked yet)');
    return out.join('\n');
  }
  Deck.on('questions', {
    init: function (s) {
      $('.sx-qs', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-q]'); if (!b) return;
        var m = load(), v = m[b.dataset.q] || '';
        m[b.dataset.q] = v === '' ? 'ok' : v === 'ok' ? 'fu' : '';
        if (!m[b.dataset.q]) delete m[b.dataset.q];
        save(m); paintQ(s);
      });
      var btn = $('.sx-q-copy', s), ta = $('.sx-q-ta', s);
      function done(msg) { $('span', btn).textContent = msg; setTimeout(function () { $('span', btn).textContent = 'Copy follow-ups'; }, 1800); }
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
    enter: function (ctx, s) { paintQ(s); },
    settle: function (s) { if (Deck.print) { $$('.sx-qg button', s).forEach(function (b) { b.removeAttribute('data-s'); }); } else paintQ(s); }
  });
})();

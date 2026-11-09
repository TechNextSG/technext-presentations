/* MOL Enterprise Philippines · Odoo Attendances and Fleet (prefix mf-). Every person, plate and amount is sample data.
   Slides: attend (4 builds = four crew check-ins; clicks toggle anyone), fleet (1 build = a service logged on SMP 1021),
   one (3 builds = the links light), questions (marks in sessionStorage). Each has a settle hook for print and the overview. */
(function () {
  'use strict';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function peso(n) { return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function hm(min) { min = ((min % 1440) + 1440) % 1440; var h = Math.floor(min / 60), m = min % 60; return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
  function dur(min) { var h = Math.floor(min / 60), m = min % 60; return h + ':' + (m < 10 ? '0' : '') + m; }
  function initials(n) { return n.split(' ').map(function (w) { return w[0]; }).join(''); }

  /* ---------- 2 · attendances ---------- */
  var PEOPLE = [
    { n: 'Paolo Cruz', r: 'Driver' }, { n: 'Ana Reyes', r: 'Warehouse lead' },
    { n: 'Mark Dizon', r: 'Driver' }, { n: 'Liza Bautista', r: 'Dispatcher' },
    { n: 'Joy Ramos', r: 'Forklift operator' }, { n: 'Carlo Mendoza', r: 'Helper' }
  ];
  var SCRIPT = [[0, 418], [1, 422], [2, 425], [3, 431]];   // [person, minute of day] for builds 1-4 (06:58, 07:02, 07:05, 07:11)
  var NIGHT = { p: 4, i: -120, o: 364 };                     // Joy: 22:00 yesterday to 06:04, already closed
  var A = { rows: [], clock: 415 };

  function aBase(n) {
    A.rows = [{ p: NIGHT.p, i: NIGHT.i, o: NIGHT.o }];
    A.clock = 415;
    for (var k = 0; k < n && k < SCRIPT.length; k++) { A.rows.push({ p: SCRIPT[k][0], i: SCRIPT[k][1], o: null }); A.clock = SCRIPT[k][1]; }
  }
  function aOpen(p) { for (var k = A.rows.length - 1; k >= 0; k--) if (A.rows[k].p === p && A.rows[k].o === null) return A.rows[k]; return null; }
  function aPaint(s, fresh) {
    $('.mf-clock', s).textContent = hm(A.clock);
    $$('.mf-k-grid button', s).forEach(function (b, p) {
      var open = aOpen(p), any = A.rows.some(function (r) { return r.p === p; });
      b.classList.toggle('is-in', !!open); b.classList.toggle('is-out', !open && any);
      $('small', b).textContent = open ? 'Checked in ' + hm(open.i) : PEOPLE[p].r;
      b.setAttribute('aria-label', PEOPLE[p].n + (open ? ', checked in: click to check out' : ', click to check in'));
    });
    var body = $('.mf-b-body', s);
    body.innerHTML = A.rows.slice().reverse().slice(0, 6).map(function (r, k) {
      var live = r.o === null, w = (live ? A.clock : r.o) - r.i;
      return '<div class="mf-b-row' + (fresh && k === 0 ? ' is-new' : '') + '"><b>' + PEOPLE[r.p].n + '</b><span>' + hm(r.i) + (r.i < 0 ? ' <small>(yesterday)</small>' : '') + '</span><span>' + (live ? '&mdash;' : hm(r.o)) + '</span><span class="' + (live ? 'mf-live' : '') + '">' + dur(Math.max(0, w)) + '</span></div>';
    }).join('');
  }
  function aSay(s, ctx, text) {
    var m = $('.mf-k-msg', s); $('span', m).textContent = text; m.classList.add('is-on');
    if (ctx) { if (A.tm) A.tm.cancel = true; var tok = A.tm = {}; ctx.after(1900, function () { if (!tok.cancel) m.classList.remove('is-on'); }); }
  }
  var actx = null;
  Deck.on('attend', {
    init: function (s) {
      $('.mf-k-grid', s).innerHTML = PEOPLE.map(function (p) {
        return '<button type="button"><span class="mf-av">' + initials(p.n) + '</span><span><b>' + p.n + '</b><small>' + p.r + '</small></span><span class="mf-dot" aria-hidden="true"></span></button>';
      }).join('');
      $$('.mf-k-grid button', s).forEach(function (b, p) {
        b.addEventListener('click', function () {
          A.clock += 3;
          var open = aOpen(p), first = PEOPLE[p].n.split(' ')[0];
          if (open) { open.o = A.clock; aSay(s, actx, 'Goodbye, ' + first + '. ' + dur(open.o - open.i) + ' worked today.'); }
          else { A.rows.push({ p: p, i: A.clock, o: null }); aSay(s, actx, 'Welcome, ' + first + '. Checked in ' + hm(A.clock) + '.'); }
          aPaint(s, true);
        });
      });
      aBase(0); aPaint(s);
    },
    enter: function (ctx) { actx = ctx; },
    step: function (n, ctx, s, first) {
      actx = ctx; aBase(n); aPaint(s, !first && n > 0);
      if (!first && n > 0) aSay(s, ctx, 'Welcome, ' + PEOPLE[SCRIPT[n - 1][0]].n.split(' ')[0] + '. Checked in ' + hm(SCRIPT[n - 1][1]) + '.');
    },
    leave: function (s) { actx = null; $('.mf-k-msg', s).classList.remove('is-on'); },
    settle: function (s) { aBase(SCRIPT.length); aPaint(s); }
  });

  /* ---------- 3 · fleet ---------- */
  var STAGES = ['New Request', 'To Order', 'Registered', 'Downgraded'];
  var CARS = [
    { pl: 'SMP 1021', t: 'Wing van', z: '10-wheeler', st: 2, dr: 'Paolo Cruz', rd: '12/03/2024', od: 84210, loc: 'Sample depot · Bay 3', fm: 'Liza Bautista',
      sv: [['14/10', 'Tyres · Sample tyre centre', 38400], ['28/10', 'Fuel · Sample station', 12640]] },
    { pl: 'SMP 1034', t: 'Closed van', z: '6-wheeler', st: 2, dr: 'Mark Dizon', rd: '05/08/2023', od: 61980, loc: 'Sample depot · Bay 1', fm: 'Liza Bautista',
      sv: [['21/10', 'Oil change · Sample service centre', 4950]] },
    { pl: 'SMP 1047', t: 'Reefer van', z: '6-wheeler', st: 2, dr: 'Carlo Mendoza', rd: '19/01/2025', od: 47315, loc: 'Sample depot · Cold bay', fm: 'Liza Bautista',
      sv: [['07/10', 'Reefer unit check · Sample vendor', 8200], ['30/10', 'Fuel · Sample station', 9870]] },
    { pl: 'SMP 2003', t: 'Pickup', z: '4-wheeler', st: 3, dr: 'Ana Reyes', rd: '22/06/2016', od: 212640, loc: 'Sample depot · Yard', fm: 'Liza Bautista',
      sv: [['02/10', 'Brake repair · Sample service centre', 15300]] },
    { pl: 'Requested', t: 'Wing van', z: '10-wheeler', st: 0, dr: '', rd: '', od: 0, loc: 'Sample depot', fm: 'Liza Bautista', sv: [] },
    { pl: 'On order', t: 'Closed van', z: '6-wheeler', st: 1, dr: '', rd: '', od: 0, loc: 'Sample depot', fm: 'Liza Bautista', sv: [] }
  ];
  var F = { sel: 0, n: 0 };
  function fCar(i) {   // the record as it is at build F.n (builds only change SMP 1021)
    var c = CARS[i], r = { pl: c.pl, t: c.t, z: c.z, st: c.st, dr: c.dr || 'Not assigned', rd: c.rd, od: c.od, loc: c.loc, fm: c.fm, sv: c.sv.slice(), ch: {} };
    if (i === 0 && F.n >= 1) { r.sv.push(['09/11', 'Preventive maintenance · Sample service centre', 6800]); r.od = 85040; r.ch.od = 1; }
    return r;
  }
  function fPaint(s, fresh) {
    var kan = $('.mf-kan', s);
    if (!kan.firstChild) {
      kan.innerHTML = STAGES.map(function (t, k) {
        var cars = CARS.map(function (c, i) { return [c, i]; }).filter(function (x) { return x[0].st === k; });
        return '<div class="mf-col"><h4>' + t + '<span>' + cars.length + '</span></h4>' + cars.map(function (x) {
          return '<button type="button" class="mf-car" data-i="' + x[1] + '" aria-pressed="false"><span class="mf-plate">' + x[0].pl + '</span><b>' + x[0].t + '</b><small class="mf-car-d"></small></button>';
        }).join('') + '</div>';
      }).join('');
    }
    $$('.mf-car', s).forEach(function (b) {
      var i = +b.getAttribute('data-i'); b.setAttribute('aria-pressed', i === F.sel ? 'true' : 'false');
      var r0 = fCar(i); $('.mf-car-d', b).textContent = r0.z + ' · ' + r0.dr;
    });
    var r = fCar(F.sel);
    $('.mf-veh .mf-plate', s).textContent = r.pl;
    $('.mf-v-model', s).textContent = r.t + ' · ' + r.z;
    $('.mf-v-stage', s).textContent = STAGES[r.st];
    var fields = [['License Plate', r.st < 2 ? 'Not yet registered' : r.pl, ''], ['Driver', r.dr, r.ch.dr], ['Registration Date', r.rd || '—', ''],
      ['Last Odometer', r.od ? r.od.toLocaleString('en-PH') + ' km' : '—', r.ch.od], ['Location', r.loc, ''], ['Fleet Manager', r.fm, '']];
    $('.mf-v-f', s).innerHTML = fields.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd' + (f[2] ? ' class="is-ch"' : '') + '>' + f[1] + '</dd></div>'; }).join('');
    $('.mf-v-rows', s).innerHTML = r.sv.length ? r.sv.map(function (v, k) {
      return '<div class="mf-v-row' + (fresh && k === r.sv.length - 1 && r.ch.od ? ' is-new' : '') + '"><span>' + v[0] + '</span><span>' + v[1] + '</span><span>' + peso(v[2]) + '</span></div>';
    }).join('') : '<div class="mf-v-row"><span></span><span>No services yet</span><span></span></div>';
    $('.mf-v-tot b', s).textContent = peso(r.sv.reduce(function (a, v) { return a + v[2]; }, 0));
  }
  Deck.on('fleet', {
    init: function (s) {
      fPaint(s);
      $('.mf-kan', s).addEventListener('click', function (e) {
        var b = e.target.closest('.mf-car'); if (!b) return;
        F.sel = +b.getAttribute('data-i'); fPaint(s);
      });
    },
    step: function (n, ctx, s, first) { var grew = n > F.n; F.n = n; if (n > 0) F.sel = 0; fPaint(s, grew && !first); },
    settle: function (s) { F.n = 1; F.sel = 0; fPaint(s); }
  });

  /* ---------- 4 · one record ---------- */
  function oPaint(s, n) {
    $$('.mf-node', s).forEach(function (b) { b.classList.toggle('is-on', +b.getAttribute('data-k') <= n); });
    $$('.mf-ln', s).forEach(function (l) { l.classList.toggle('is-on', +l.getAttribute('data-k') <= n); });
  }
  Deck.on('one', {
    init: function (s) {
      $$('.mf-node', s).forEach(function (b) { b.addEventListener('click', function () { Deck.go(Deck.index, +b.getAttribute('data-k')); }); });
    },
    step: function (n, ctx, s) { oPaint(s, n); },
    settle: function (s) { oPaint(s, 3); }
  });

  /* ---------- 5 · questions ---------- */
  var KEY = 'mf-af-q';
  function qLoad() { try { return JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function qSave(m) { try { sessionStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} }
  function qPaint(s) {
    var m = qLoad(), a = 0, f = 0;
    $$('.mf-q button', s).forEach(function (b) {
      var v = m[b.getAttribute('data-q')] || '';
      b.setAttribute('data-s', v);
      $('.mf-q-s', b).textContent = v === 'a' ? 'Answered' : v === 'f' ? 'Follow up' : '';
      if (v === 'a') a++; if (v === 'f') f++;
    });
    $('[data-c=a]', s).textContent = a; $('[data-c=f]', s).textContent = f;
  }
  Deck.on('questions', {
    init: function (s) {
      $$('.mf-q button', s).forEach(function (b) {
        b.addEventListener('click', function () {
          var m = qLoad(), k = b.getAttribute('data-q'), v = m[k] || '';
          m[k] = v === '' ? 'a' : v === 'a' ? 'f' : ''; qSave(m); qPaint(s);
        });
      });
      var copy = $('.mf-q-copy', s);
      copy.addEventListener('click', function () {
        var m = qLoad(), items = $$('.mf-q button', s).filter(function (b) { return m[b.getAttribute('data-q')] !== 'a'; });
        var text = 'MOL Enterprise Philippines · Attendances and Fleet · follow-ups\n' + items.map(function (b) {
          return '- ' + $('.mf-q-t', b).textContent + (m[b.getAttribute('data-q')] === 'f' ? ' (follow up)' : '');
        }).join('\n');
        var done = function () { var t = copy.lastChild; var o = t.textContent; t.textContent = 'Copied'; setTimeout(function () { t.textContent = o; }, 1400); };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
      });
      qPaint(s);
    },
    enter: function (ctx, s) { qPaint(s); },
    settle: function (s) { qPaint(s); }
  });
})();

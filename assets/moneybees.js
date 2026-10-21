/* Proposal for Moneybees Forex Corporation. Slide behaviour. Every entry, TIN, amount and name in the demos is sample data,
   labelled on its slide. Every slide whose finished state comes from JS has a settle hook (overview, print, PDF). */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');
  var PESO = '₱';
  function num(n) { return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function peso(n) { return PESO + num(n); }
  function seg(root, fn) {
    function set(v, quiet) {
      $$('button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      if (!quiet) fn(v);
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    return set;
  }
  function swap(el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }
  function stepText(spec, n) { var out = ''; spec.split('|').forEach(function (p) { var i = p.indexOf(':'); if (+p.slice(0, i) <= n) out = p.slice(i + 1); }); return out; }

  // jump links: agenda, request list, asks
  stage.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]'); if (!a) return;
    e.preventDefault(); Deck.goId(a.dataset.go);
  });

  /* ---------------------------------------------------------------- 3 · keep, configure, build */
  var LAYER = {
    keep: 'Nothing here changes: your accounts, entries, users and history stay exactly as they are today.',
    conf: 'Settings only: company details on every document, a number series per document and branch, and who may print or export.',
    build: 'One small module adds the six books, the two print layouts and reprint control. It adds reports; it never changes posting.',
    all: 'Most of the work is configuration. The module adds reports and print layouts only: it never changes how an entry is posted.'
  };
  Deck.on('approach', {
    init: function (s) {
      var ap = $('.mb-ap', s), tx = $('.mb-ap-tx', s);
      s._show = function (v, quiet) {
        s._set(v, true); ap.dataset.show = v;
        $$('.mb-layer', s).forEach(function (l) { l.classList.toggle('is-on', l.dataset.l === v); });
        tx.textContent = LAYER[v]; if (!quiet) swap(tx);
      };
      s._set = seg($('.mb-ap-seg', s), function (v) { s._held = true; s._show(v); });
    },
    enter: function (ctx, s) {
      s._held = false; s._show('all', true);
      var seq = ['keep', 'conf', 'build', 'all'], i = 0;
      ctx.after(1500, function () {
        ctx.every(2300, function () { if (s._held || i >= seq.length) return false; s._show(seq[i]); i++; });
      });
    },
    settle: function (s) { s._show('all', true); }
  });

  /* ---------------------------------------------------------------- 4 · six books (sample rows; same as the sample workbook) */
  var BOOKS = {
    gj: { t: 'General Journal', f: 'GJ', head: ['Date', 'Entry no.', 'Account', 'Particulars', 'Debit', 'Credit'], sum: [4, 5],
      rows: [['01 Oct', 'JV/0001', '1010 Cash on hand', 'Opening float', 50000, 0], ['01 Oct', 'JV/0001', '1020 Cash in bank', 'Opening float', 0, 50000],
        ['31 Oct', 'JV/0014', '6100 Depreciation', 'Monthly depreciation', 8250, 0], ['31 Oct', 'JV/0014', '1590 Accum. depreciation', 'Monthly depreciation', 0, 8250],
        ['31 Oct', 'JV/0015', '6200 Rent expense', 'Accrued rent, branch', 35000, 0], ['31 Oct', 'JV/0015', '2100 Accrued expenses', 'Accrued rent, branch', 0, 35000]] },
    gl: { t: 'General Ledger', f: 'GL', head: ['Account', 'Date', 'Reference', 'Particulars', 'Debit', 'Credit', 'Balance'], sum: [4, 5],
      rows: [['1020 Cash in bank', '01 Oct', '', 'Opening balance', 0, 0, 1250000], ['1020 Cash in bank', '01 Oct', 'JV/0001', 'Opening float', 0, 50000, 1200000],
        ['1020 Cash in bank', '03 Oct', 'CR/0002', 'Collection, Customer B', 120000, 0, 1320000], ['1020 Cash in bank', '06 Oct', 'CD/0003', 'Payment, Supplier A', 0, 44800, 1275200],
        ['1020 Cash in bank', '15 Oct', 'CD/0007', 'Payment, Supplier C', 0, 22400, 1252800]] },
    crj: { t: 'Cash Receipts Journal', f: 'CRJ', head: ['Date', 'AR no.', 'Received from', 'TIN', 'Cash Dr', 'Receivable Cr', 'Revenue Cr'], sum: [4, 5, 6],
      rows: [['02 Oct', 'AR-000101', 'Customer A', '-', 1500, 0, 1500], ['03 Oct', 'AR-000102', 'Customer B Trading', '000-111-222-00000', 120000, 120000, 0],
        ['09 Oct', 'AR-000103', 'Customer C', '-', 2250, 0, 2250], ['14 Oct', 'AR-000104', 'Customer D Corp.', '000-333-444-00000', 64000, 64000, 0]] },
    sj: { t: 'Sales Journal', f: 'SJ', head: ['Date', 'Invoice no.', 'Customer', 'TIN', 'Gross', 'Taxable', 'Tax'], sum: [4, 5, 6],
      rows: [['01 Oct', 'SI-000045', 'Customer B Trading', '000-111-222-00000', 120000, 107142.86, 12857.14], ['02 Oct', 'SI-000046', 'Customer A', '-', 1500, 1339.29, 160.71],
        ['09 Oct', 'SI-000047', 'Customer C', '-', 2250, 2008.93, 241.07], ['12 Oct', 'SI-000051', 'Customer D Corp.', '000-333-444-00000', 64000, 57142.86, 6857.14]] },
    cdj: { t: 'Cash Disbursement Journal', f: 'CDJ', head: ['Date', 'Voucher', 'Check', 'Payee', 'Cash Cr', 'Expense Dr', 'Tax w/h Cr'], sum: [4, 5, 6],
      rows: [['06 Oct', 'CD/0003', '000812', 'Supplier A Inc.', 44800, 45714.29, 914.29], ['10 Oct', 'CD/0005', '000813', 'Supplier B Corp.', 5600, 0, 0],
        ['15 Oct', 'CD/0007', '000814', 'Supplier C Co.', 22400, 22857.14, 457.14]] },
    pj: { t: 'Purchase Journal', f: 'PJ', head: ['Date', 'Bill no.', 'Supplier', 'TIN', 'Gross', 'Input tax', 'Net of tax'], sum: [4, 5, 6],
      rows: [['04 Oct', 'BILL/0011', 'Supplier B Corp.', '000-777-888-00000', 5600, 600, 5000], ['08 Oct', 'BILL/0012', 'Supplier D Inc.', '000-121-212-00000', 33600, 3600, 30000],
        ['20 Oct', 'BILL/0013', 'Supplier E Co.', '000-343-434-00000', 11200, 1200, 10000]] }
  };
  function paintBook(s, k, quiet) {
    var b = BOOKS[k], tbl = $('.mb-sh', s);
    $$('.mb-bk-tabs button', s).forEach(function (x) { var on = x.dataset.b === k; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
    $('.mb-xl-name', s).textContent = b.t;
    $('.mb-sh-t', s).textContent = b.t + ' · October 2026';
    $('thead', tbl).innerHTML = '<tr>' + b.head.map(function (h, i) { return '<th' + (typeof b.rows[0][i] === 'number' ? ' class="n"' : '') + '>' + h + '</th>'; }).join('') + '</tr>';
    $('tbody', tbl).innerHTML = b.rows.map(function (r, j) {
      return '<tr' + (quiet ? '' : ' class="is-new" style="--j:' + j + '"') + '>' + r.map(function (c) { return typeof c === 'number' ? '<td class="n">' + (c ? num(c) : '-') + '</td>' : '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    if (!quiet) $$('tbody tr', tbl).forEach(function (tr, j) { $$('td', tr).forEach(function (td) { td.style.animationDelay = (j * 60) + 'ms'; }); });
    var tf = tbl.querySelector('tfoot') || tbl.appendChild(document.createElement('tfoot'));
    tf.innerHTML = '<tr>' + b.head.map(function (h, i) {
      if (i === 0) return '<td>Total</td>';
      if (b.sum.indexOf(i) < 0) return '<td></td>';
      return '<td class="n">' + num(b.rows.reduce(function (a, r) { return a + r[i]; }, 0)) + '</td>';
    }).join('') + '</tr>';
    $('.mb-xl-fn', s).textContent = b.f + '_2026-10.xlsx';
    var bal = k === 'gj' ? 'debits equal credits' : k === 'gl' ? 'ends at the trial balance figure' : 'totals tie to the ledger';
    $('.mb-xl-rows', s).textContent = b.rows.length + ' lines · ' + bal;
    $('.mb-xl-file', s).classList.remove('is-done');
    s._k = k;
  }
  Deck.on('books', {
    init: function (s) {
      $('.mb-bk-tabs', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-b]'); if (!b) return; s._held = true; paintBook(s, b.dataset.b); });
      $('.mb-xl-go', s).addEventListener('click', function () {
        var f = $('.mb-xl-file', s); f.classList.remove('is-done'); void f.offsetWidth;
        setTimeout(function () { f.classList.add('is-done'); }, 250);
      });
    },
    enter: function (ctx, s) {
      s._held = false; paintBook(s, 'gj');
      var keys = ['gl', 'crj', 'sj', 'cdj', 'pj', 'gj'], i = 0;
      ctx.after(1100, function () { if (!s._held) $('.mb-xl-file', s).classList.add('is-done'); });
      ctx.after(2600, function () {
        ctx.every(2600, function () {
          if (s._held || i >= keys.length) return false;
          paintBook(s, keys[i]); i++;
          ctx.after(900, function () { if (!s._held) $('.mb-xl-file', s).classList.add('is-done'); });
        });
      });
    },
    settle: function (s) { paintBook(s, 'crj', true); $('.mb-xl-file', s).classList.add('is-done'); }
  });

  /* ---------------------------------------------------------------- 5 · print and reprint (sample documents) */
  var DOCS = {
    si: { title: 'SALES INVOICE', no: 'SI-000046', ref: 'Sales Invoice · the main proof of sale', to: 'Customer A (sample)', date: '02 Oct 2026',
      rows: [['Service fee · sample', '1', 1339.29, 1339.29]], sum: [['VATable sales', 1339.29], ['VAT · sample', 160.71]], tot: 1500,
      k: 'VAT-registered seller · TIN with branch code · buyer TIN when required' },
    ar: { title: 'ACKNOWLEDGEMENT RECEIPT', no: 'AR-000102', ref: 'Acknowledges payment · supports SI-000045', to: 'Customer B Trading (sample)', date: '03 Oct 2026',
      rows: [['Payment of SI-000045 · bank transfer', '', null, 120000]], sum: [['Invoice balance before', 120000], ['Balance after', 0]], tot: 120000,
      k: 'One hundred twenty thousand pesos only' }
  };
  var REASONS = ['Customer copy lost', 'Printer jam', 'Requested by auditor'];
  function paintDoc(s, k) {
    var d = DOCS[k], doc = $('.mb-doc', s);
    doc.dataset.doc = k;
    $('.mb-doc-title', s).textContent = d.title;
    $('.mb-doc-no', s).textContent = 'No. ' + d.no;
    $('.mb-log-no', s).textContent = d.no;
    $('.mb-doc-to b', s).textContent = d.to; $$('.mb-doc-to b', s)[1].textContent = d.date;
    $('.mb-doc-rows', s).innerHTML = d.rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + (r[2] == null ? '' : peso(r[2])) + '</td><td>' + peso(r[3]) + '</td></tr>'; }).join('');
    $('.mb-doc-sum', s).innerHTML = d.sum.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + peso(r[1]) + '</td></tr>'; }).join('');
    $('.mb-doc-tl', s).textContent = k === 'si' ? 'Total amount due' : 'Amount received';
    $('.mb-doc-tot', s).textContent = peso(d.tot);
    $('.mb-doc-k', s).textContent = d.k;
    $('.mb-doc-ref', s).textContent = d.ref;
  }
  function resetLog(s) {
    s._n = 0; $('.mb-doc', s).classList.remove('is-re');
    $('.mb-log-l', s).innerHTML = '<li class="mb-log-0">Not printed yet</li>';
    $('.mb-log-c', s).textContent = '0 prints';
  }
  function doPrint(s, quiet) {
    var doc = $('.mb-doc', s), log = $('.mb-log-l', s), first = !s._n;
    var z = $('.mb-log-0', log); if (z) z.remove();
    s._n++;
    var li = document.createElement('li');
    var t = '10:' + (14 + s._n * 3);
    if (first) li.innerHTML = '<b>Original</b><span>' + t + '</span><span>Cashier (sample)</span>';
    else { li.className = 'is-re'; li.innerHTML = '<b>Reprint ' + (s._n - 1) + '</b><span>' + t + '</span><span>' + REASONS[(s._n - 2) % 3] + '</span>'; }
    if (!quiet) li.classList.add('is-new');
    log.appendChild(li);
    while (log.children.length > 5) log.removeChild(log.firstChild);
    $('.mb-log-c', s).textContent = s._n + (s._n === 1 ? ' print' : ' prints');
    doc.classList.toggle('is-re', !first);
    $('.mb-stamp-n', s).textContent = s._n - 1;
    if (!quiet) { doc.classList.remove('is-out'); void doc.offsetWidth; doc.classList.add('is-out'); }
  }
  Deck.on('print', {
    init: function (s) {
      s._set = seg($('.mb-pr-seg', s), function (v) { s._held = true; paintDoc(s, v); resetLog(s); });
      $('.mb-pr-print', s).addEventListener('click', function () { s._held = true; if (s._n) return flash($('.mb-pr-print', s)); doPrint(s); });
      $('.mb-pr-re', s).addEventListener('click', function () { s._held = true; if (!s._n) doPrint(s); doPrint(s); });
      function flash(b) { $('span', b).textContent = 'Printed: use Reprint'; setTimeout(function () { $('span', b).textContent = 'Print'; }, 1600); }
      s._reset = function (k) { s._set(k, true); paintDoc(s, k); resetLog(s); };
    },
    enter: function (ctx, s) {
      s._held = false; s._reset('si');
      ctx.after(1300, function () { if (!s._held) doPrint(s); });
      ctx.after(3300, function () { if (!s._held) doPrint(s); });
      ctx.after(5600, function () { if (!s._held) { s._reset('ar'); doPrint(s); } });
    },
    settle: function (s) { s._reset('si'); doPrint(s, true); doPrint(s, true); doPrint(s, true); $('.mb-doc', s).classList.remove('is-out'); }
  });

  /* ---------------------------------------------------------------- 6 · deployment */
  function paintDeploy(s, n) {
    $('.mb-dp-cnt', s).textContent = n;
    $$('.mb-dp-track li', s).forEach(function (li) { var k = +li.dataset.k; li.classList.toggle('is-on', k === n); li.classList.toggle('is-done', k < n); });
    $$('[data-on]', s).forEach(function (el) { el.classList.toggle('is-on', +el.dataset.on <= n); });
    $$('[data-t]', s).forEach(function (el) { el.textContent = stepText(el.dataset.t, n); });
    $('.mb-chk-c', s).textContent = $$('.mb-chk li.is-on', s).length + ' of 6';
  }
  Deck.on('deploy', {
    step: function (n, ctx, s) { paintDeploy(s, n); },
    settle: function (s) { paintDeploy(s, 4); }
  });

  /* ---------------------------------------------------------------- 7 · tutorials (mock player) */
  // per chapter: caption, active menu (index), panel title, panel sub, button, cursor x/y (%)
  var TUT = [
    { len: '6:40', ch: [
      ['Open Reporting, then CAS books.', 4, 'Reporting › CAS books', 'Choose the book and the period', 'Export .xlsx', 74, 22],
      ['Pick the book: Cash Receipts Journal.', 4, 'Cash Receipts Journal', 'Book · period · branch', 'Export .xlsx', 30, 52],
      ['Set the period and the branch.', 4, 'October 2026 · Head office', 'Any date range, any branch', 'Export .xlsx', 42, 60],
      ['Export: the .xlsx lands in Downloads.', 4, 'CRJ_2026-10.xlsx', 'Saved · open it in Excel', 'Open file', 20, 72]] },
    { len: '5:15', ch: [
      ['Open the invoice from Customers.', 1, 'Customers › Invoices', 'SI-000046 · Customer A (sample)', 'Print', 30, 22],
      ['Print once: this is the original.', 1, 'SI-000046 · Original', 'Logged: who and when', 'Print', 26, 72],
      ['Need another copy? Use Reprint.', 1, 'SI-000046 · Reprint', 'Choose a reason first', 'Reprint', 26, 72],
      ['Every print is in the log.', 1, 'Print log', 'Original + 1 reprint, with reasons', 'View log', 26, 72]] },
    { len: '8:05', ch: [
      ['The menu bar holds every area.', 0, 'Dashboard', 'Your journals at a glance', 'Open', 12, 22],
      ['Search and filter any list.', 2, 'Vendors › Bills', 'Filter: this month · group by vendor', 'Search', 44, 22],
      ['Save the views you use daily.', 3, 'Accounting › Journal Items', 'Saved as "My month-end"', 'Save view', 60, 22],
      ['Help is one click away.', 0, 'Dashboard', 'The tutorials live here too', 'Watch', 26, 72]] }
  ];
  function paintTut(s, t, c, quiet) {
    var d = TUT[t], ch = d.ch[c];
    $$('.mb-tv-list button', s).forEach(function (b) { b.classList.toggle('is-on', +b.dataset.v === t); });
    $$('.mb-scr-menu span', s).forEach(function (m, i) { m.classList.toggle('is-on', i === ch[1]); });
    $('.mb-scr-url', s).textContent = 'Odoo · ' + $$('.mb-scr-menu span', s)[ch[1]].textContent;
    $('.mb-scr-t', s).textContent = ch[2]; $('.mb-scr-s', s).textContent = ch[3]; $('.mb-scr-btn', s).textContent = ch[4];
    var tx = $('.mb-cap-tx', s); tx.textContent = ch[0]; if (!quiet) swap(tx);
    var cur = $('.mb-cursor', s); cur.style.setProperty('--cx', ch[5] + '%'); cur.style.setProperty('--cy', ch[6] + '%');
    $('.mb-ctl-ch', s).innerHTML = d.ch.map(function (x, i) { return i ? '<i style="left:' + (i * 25) + '%"></i>' : ''; }).join('');
    var p = (c + 1) / d.ch.length;
    $('.mb-ctl-fill', s).style.setProperty('--p', (p * 100) + '%');
    var parts = d.len.split(':'), tot = +parts[0] * 60 + +parts[1], now = Math.round(tot * p);
    $('.mb-ctl-tm', s).textContent = Math.floor(now / 60) + ':' + ('0' + now % 60).slice(-2) + ' / ' + d.len;
    s._t = t; s._c = c;
  }
  Deck.on('videos', {
    init: function (s) {
      var btn = $('.mb-ctl-p', s);
      s._stop = function () { s._run = (s._run || 0) + 1; s._playing = false; btn.classList.remove('is-on'); };
      s._play = function () {
        if (!s._ctx) return;
        var tok = (s._run || 0) + 1; s._run = tok; s._playing = true; btn.classList.add('is-on');
        s._ctx.every(2100, function () {
          if (s._run !== tok) return false;
          var t = s._t, c = s._c + 1;
          if (c >= TUT[t].ch.length) { t = (t + 1) % TUT.length; c = 0; }
          paintTut(s, t, c);
        });
      };
      btn.addEventListener('click', function () { if (s._playing) s._stop(); else s._play(); });
      $('.mb-tv-list', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (!b) return; paintTut(s, +b.dataset.v, 0); if (!s._playing) s._play(); });
    },
    enter: function (ctx, s) { s._ctx = ctx; s._stop(); paintTut(s, 0, 0, true); ctx.after(1200, function () { s._play(); }); },
    leave: function (s) { s._stop(); },
    settle: function (s) { paintTut(s, 1, 2, true); }
  });

  /* ---------------------------------------------------------------- 8 · registration */
  Deck.on('register', {
    init: function (s) {
      var rg = $('.mb-rg', s);
      s._set = seg($('.mb-rg-seg', s), function (v) { s._held = true; rg.dataset.who = v; });
      s._who = function (v) { s._set(v, true); rg.dataset.who = v; };
      s._fill = function (n) {
        $$('.mb-folder li', s).forEach(function (li, i) { li.classList.toggle('is-on', i < n); });
        $('.mb-fd-c', s).textContent = n + ' of 5';
      };
    },
    enter: function (ctx, s) {
      s._held = false; s._who('all'); s._fill(0);
      var n = 0;
      ctx.after(900, function () { ctx.every(520, function () { n++; s._fill(n); if (n >= 5) return false; }); });
      ctx.after(4300, function () { if (!s._held) s._who('tn'); });
      ctx.after(6300, function () { if (!s._held) s._who('mb'); });
      ctx.after(8300, function () { if (!s._held) s._who('all'); });
    },
    settle: function (s) { s._who('all'); s._fill(5); }
  });

  /* ---------------------------------------------------------------- 9 · timeline (order of work; bar lengths indicative) */
  var MS = [[0, 'Kick-off'], [.2, 'Layouts agreed'], [.66, 'Your sign-off'], [.8, 'Go-live'], [1, 'First close']];
  var PLAN = [
    ['search', 'Review your Odoo', 'version, hosting, modules', 0, .2, '', 'Review'],
    ['code', 'Build on staging', 'books, layouts, reprint log', .14, .58, '', 'Module on a copy'],
    ['file', 'CAS documentation pack', 'description, samples, Annex B', .24, .76, 'doc', 'Pack prepared'],
    ['usercheck', 'Validation by your team', 'books tie, prints signed off', .5, .66, 'gate', 'Gate'],
    ['play', 'Tutorials recorded', 'on the validated copy', .6, .78, '', 'Three videos'],
    ['zap', 'Go-live and migration', 'production, users, balances', .66, .8, 'live', 'Go-live'],
    ['pen', 'Application filed', 'signed and filed under your TIN', .76, .9, 'doc', 'Filed'],
    ['lifebuoy', 'Support to first close', 'we stay through month-end', .8, 1, 'after', 'First close']
  ];
  Deck.on('timeline', {
    init: function (s) {
      var icons = {};
      $$('[data-ic]', s).forEach(function (x) { icons[x.dataset.ic] = x.innerHTML; });
      $('.mb-tl-ax', s).innerHTML = MS.map(function (m) { return '<i style="left:' + (m[0] * 100) + '%">' + m[1] + '</i>'; }).join('');
      $('.mb-tl-rows', s).innerHTML = PLAN.map(function (r, i) {
        return '<div class="mb-tl-r"><span>' + (icons[r[0]] || '') + '<span>' + r[1] + '<small>' + r[2] + '</small></span></span>' +
          '<i class="mb-tl-b' + (r[5] ? ' mb-tl-b--' + r[5] : '') + '" style="left:' + (r[3] * 100) + '%;width:' + ((r[4] - r[3]) * 100) + '%;--i:' + i + '">' + r[6] + '</i></div>';
      }).join('');
    },
    enter: function (ctx, s) { var tl = $('.mb-tl', s); tl.classList.remove('is-drawn'); ctx.after(450, function () { tl.classList.add('is-drawn'); }); },
    settle: function (s) { $('.mb-tl', s).classList.add('is-drawn'); }
  });

  /* ---------------------------------------------------------------- 10 · quotation */
  // Figures go here once the formal quotation is approved (PHP, before VAT). null = shown as "In the quotation".
  var PRICES = { dev: null, reg: null, dep: null, trn: null, sup: null };
  function paintQuote(s) {
    var tot = 0, all = true;
    Object.keys(PRICES).forEach(function (k) {
      var v = PRICES[k], el = $('.mb-q-r[data-k="' + k + '"] .mb-q-v', s); if (!el) return;
      el.textContent = v == null ? 'In the quotation' : peso(v) + (k === 'sup' ? ' / month' : '');
      el.classList.toggle('is-set', v != null);
      if (k !== 'sup') { if (v == null) all = false; else tot += v; }
    });
    $('.mb-q-tv', s).textContent = all ? peso(tot) : 'In the quotation';
  }
  Deck.on('quote', {
    init: function (s) {
      var q = $('.mb-q', s);
      s._set = seg($('.mb-q-seg', s), function (v) { s._held = true; s._show(v); });
      s._show = function (v) {
        s._set(v, true); q.dataset.show = v;
        $('.mb-q-tl', s).textContent = v === 'once' ? 'One-time total' : 'Recurring';
        $('.mb-q-tn', s).textContent = v === 'once' ? 'Development, registration assistance, deployment and training' : 'Your Odoo plan stays with Odoo; our support is optional';
        if (v === 'rec') $('.mb-q-tv', s).textContent = PRICES.sup == null ? 'Optional' : peso(PRICES.sup) + ' / month';
        else paintQuote(s);
      };
      paintQuote(s);
    },
    enter: function (ctx, s) {
      s._held = false; s._show('once');
      ctx.after(2600, function () { if (!s._held) s._show('rec'); });
      ctx.after(5200, function () { if (!s._held) s._show('once'); });
    },
    settle: function (s) { s._show('once'); }
  });

  /* ---------------------------------------------------------------- 12 · questions (marks kept for this tab) */
  var KEY = 'mb-questions';
  function load() { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(m) { try { sessionStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { } }
  function paintQ(s) {
    var m = load(), a = 0, f = 0;
    $$('.mb-qg button', s).forEach(function (b) {
      var v = m[b.dataset.q] || ''; if (v) b.dataset.s = v; else b.removeAttribute('data-s');
      if (v === 'ok') a++; if (v === 'fu') f++;
    });
    $('.mb-q-a', s).textContent = a; $('.mb-q-f', s).textContent = f;
  }
  function followText(s) {
    var m = load(), out = ['Moneybees · follow-ups'];
    $$('.mb-qg button', s).forEach(function (b) { if (m[b.dataset.q] === 'fu') out.push(b.dataset.q + '. ' + $('span', b).textContent); });
    if (out.length === 1) out.push('(none marked yet)');
    return out.join('\n');
  }
  Deck.on('questions', {
    init: function (s) {
      $('.mb-qs', s).addEventListener('click', function (e) {
        var b = e.target.closest('button[data-q]'); if (!b) return;
        var m = load(), v = m[b.dataset.q] || '';
        m[b.dataset.q] = v === '' ? 'ok' : v === 'ok' ? 'fu' : '';
        if (!m[b.dataset.q]) delete m[b.dataset.q];
        save(m); paintQ(s);
      });
      var btn = $('.mb-q-copy', s), ta = $('.mb-q-ta', s);
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
    settle: function (s) { if (Deck.print) { $$('.mb-qg button', s).forEach(function (b) { b.removeAttribute('data-s'); }); } else paintQ(s); }
  });
})();

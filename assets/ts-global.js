/* T&S Global Services: slide 8, "Moving off QuickBooks". Five data buckets move from QuickBooks into an Odoo bucket: drag a bucket
   (pointer, touch and pen, via data-drag and Deck.point), tap or press it, or press the right arrow (each press lands the next bucket,
   Back puts the last one back). The cut-over line under them lights as buckets land. Sample view; the buckets are TechNext's migration steps.
   A moved bucket is aria-disabled (not disabled), so keyboard focus is never dropped: after a keyboard move, focus goes to the next bucket.
   When all five have moved, the shelf collapses to five compact ghost slots.
   Every timer goes through ctx, every Motion control is stored and stopped in leave, settle paints all five landed (print, overview). */
(function () {
  'use strict';
  var K = window.BMK, Deck = window.Deck;
  if (!K || !Deck) return;
  var s = document.getElementById('move'); if (!s) return;
  function $(q, r) { return (r || s).querySelector(q); }
  function $$(q, r) { return [].slice.call((r || s).querySelectorAll(q)); }

  var B = [
    { n: 'Chart of accounts', i: 'layers', u: 'Mapped account by account to your Odoo chart of accounts.' },
    { n: 'Customers and suppliers', i: 'users', u: 'Exported from QuickBooks, imported as Odoo contacts.' },
    { n: 'Open invoices and bills', i: 'receipt', u: 'Brought in so they can still be paid and reconciled.' },
    { n: 'Opening balances', i: 'calculator', u: 'Imported as at the cut-over date, then reconciled.' },
    { n: 'Item list', i: 'box', u: 'Imported as Odoo products.' }
  ];
  var STOPS = [['Export and map', 'From QuickBooks, into a plan'], ['Import and reconcile', 'Checked against QuickBooks'], ['Parallel run', 'Both systems, side by side'], ['One cut-over date', 'Fixed in the proposal']];
  var LIT = [1, 3, 4, 5];   // buckets landed before a stop lights
  var ROW0 = 12, ROWH = 56, ROWG = 8;   // the Odoo bucket's first row offset, row height and gap (css: .tg-tb, .tg-r)

  var h = K.kick('moving off quickbooks', 0) + '<h2 class="h-m bm-h2" data-in style="--d:80ms">Moving off QuickBooks, <span class="hl">bucket by bucket.</span></h2>' +
    '<div class="tg-shelf" role="group" aria-label="QuickBooks buckets: drag one into Odoo, or tap it"><p class="tg-lab" data-in style="--d:160ms">In QuickBooks today</p>';
  B.forEach(function (b, i) {
    h += '<button type="button" class="tg-b" data-drag data-i="' + i + '" aria-label="Move ' + K.esc(b.n) + ' into Odoo" data-in style="--d:' + (220 + i * 70) + 'ms"><span class="tg-bi">' + K.ico(b.i) + '</span><b>' + K.esc(b.n) + '</b><small>drag or tap</small></button>';
  });
  h += '</div><div class="tg-lane" aria-hidden="true" data-in style="--d:420ms"><svg viewBox="0 0 220 60" width="220" height="60"><path d="M6 30 L196 30"/><path class="tg-hd" d="M180 14 L198 30 L180 46"/></svg></div>' +
    '<div class="tg-tote" data-in data-fx="right" style="--d:260ms"><div class="tg-th">' + K.odoo('account', 30) + '<b>Odoo Accounting</b><span class="tg-cnt" aria-live="polite"></span></div>' +
    '<div class="tg-tb">';
  B.forEach(function (b, i) { h += '<div class="tg-r" data-i="' + i + '"><span class="tg-ck">' + K.ico('check') + '</span><p><b>' + K.esc(b.n) + '</b><span>' + K.esc(b.u) + '</span></p></div>'; });
  h += '</div><p class="tg-done">' + K.ico('check') + 'All five moved. Next: reconcile, then run in parallel.</p></div>' +
    '<div class="tg-cut" data-in style="--d:520ms"><div class="tg-cut-t"><i class="tg-cut-f"></i></div>';
  STOPS.forEach(function (t, i) { h += '<div class="tg-stop' + (i === 3 ? ' tg-stop--end' : '') + '" data-i="' + i + '"><i></i><b>' + t[0] + '</b><small>' + t[1] + '</small></div>'; });
  h += '</div><p class="illus bm-ill">' + K.ico('check') + 'Sample view · the move is TechNext’s service, with no native QuickBooks connector · dates fixed in the proposal after discovery</p>';
  var f = $('.s-foot'); if (f) f.insertAdjacentHTML('beforebegin', h); else s.insertAdjacentHTML('beforeend', h);
  $$('.h-m[data-in]').forEach(K.split);

  var crates = $$('.tg-b'), tote = $('.tg-tote'), zone = $('.tg-tb'), rows = $$('.tg-r'), shelf = $('.tg-shelf');
  var st = { mo: [], ctx: null }, landed = [], pend = {}, drag = null, prevN = 0;
  function pendN() { var n = 0; for (var k in pend) if (pend[k]) n++; return n; }
  function gone(c) { return c.getAttribute('aria-disabled') === 'true'; }

  function inside(p, el) { var r = Deck.rect(el); return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom; }
  function paint(newest) {
    var n = landed.length;
    crates.forEach(function (c, i) {
      var m = landed.indexOf(i) >= 0;
      c.classList.toggle('is-moved', m);
      if (m) { c.setAttribute('aria-disabled', 'true'); c.tabIndex = -1; } else { c.removeAttribute('aria-disabled'); c.removeAttribute('tabindex'); }
      c.setAttribute('aria-label', m ? B[i].n + ': moved to Odoo' : 'Move ' + B[i].n + ' into Odoo');
      $('small', c).textContent = m ? 'moved to Odoo' : 'drag or tap';
    });
    rows.forEach(function (r, i) { r.classList.toggle('is-on', landed.indexOf(i) >= 0); });
    $('.tg-cnt').innerHTML = n ? '<b>' + n + '</b> of 5 moved' : 'Drop a bucket here';
    tote.classList.toggle('is-full', n === 5); tote.classList.toggle('has-any', n > 0);
    shelf.classList.toggle('is-all', n === 5);   // final state: the five moved rows collapse to compact ghost slots
    $$('.tg-stop').forEach(function (t, i) { t.classList.toggle('is-lit', n >= LIT[i]); });
    $('.tg-cut-f').style.transform = 'scaleX(' + (n / 5) + ')';
    if (newest != null && K.live() && window.Motion) {
      var r = rows[newest];
      K.drive(st, function (p) { r.style.opacity = Math.min(1, p * 3); r.style.transform = 'scale(' + (.9 + .1 * p) + ')'; }, { stiffness: 320, damping: 20 });
    } else rows.forEach(function (r) { r.style.opacity = ''; r.style.transform = ''; });
  }
  function clearFly(c) { if (c._a) { try { c._a.stop(); } catch (e) { } c._a = null; } c.style.transform = ''; c.style.opacity = ''; c.classList.remove('is-drag', 'is-fly'); }
  // after a keyboard move focus goes to the next bucket still on the shelf (never lost to the body)
  function focusNext(i) {
    var left = crates.filter(function (c, j) { return j !== i && landed.indexOf(j) < 0 && !pend[j]; });
    if (!left.length) return;
    var after = left.filter(function (c) { return +c.getAttribute('data-i') > i; });
    (after[0] || left[0]).focus();
  }
  function land(i, from, byKey) {
    if (landed.indexOf(i) >= 0 || pend[i]) return;
    var c = crates[i], ox = from ? from.x : 0, oy = from ? from.y : 0;
    if (K.live() && window.Motion && st.ctx && st.ctx.alive) {
      var sc = Deck.scale || 1, a = Deck.rect(c), z = Deck.rect(zone);
      var dx = ox + ((z.left + z.width / 2) - (a.left + a.width / 2)) / sc, dy = oy + ((z.top + (ROW0 + i * (ROWH + ROWG) + ROWH / 2) * sc) - (a.top + a.height / 2)) / sc;
      c.classList.add('is-fly');
      c._a = K.drive(st, function (p) { c.style.transform = 'translate(' + (ox + (dx - ox) * p) + 'px,' + (oy + (dy - oy) * p) + 'px) scale(' + (1 - .3 * p) + ')'; c.style.opacity = Math.max(0, 1 - p * 1.1); }, { stiffness: 190, damping: 24 });
      pend[i] = 1;
      if (byKey) focusNext(i);
      st.ctx.after(380, function () { pend[i] = 0; clearFly(c); landed.push(i); paint(i); });
    } else { clearFly(c); landed.push(i); paint(null); if (byKey) focusNext(i); }
  }
  function springBack(c, from) {
    if (K.live() && window.Motion && st.ctx && st.ctx.alive) {
      c.classList.add('is-fly');
      c._a = K.drive(st, function (p) { c.style.transform = 'translate(' + (from.x * (1 - p)) + 'px,' + (from.y * (1 - p)) + 'px)'; }, { stiffness: 260, damping: 22 });
      st.ctx.after(420, function () { clearFly(c); });
    } else clearFly(c);
  }
  function unland() {
    var i = landed.pop(); if (i == null) return; paint(null);
  }

  Deck.on('move', {
    init: function () {
      shelf.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('.tg-b'); if (!b || gone(b) || (e.button != null && e.button > 0)) return;
        var p = Deck.point(e);
        drag = { b: b, i: +b.getAttribute('data-i'), sx: p.x, sy: p.y, x: 0, y: 0, moved: false, id: e.pointerId };
        try { b.setPointerCapture(e.pointerId); } catch (x) { }
      });
      shelf.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var p = Deck.point(e), sc = Deck.scale || 1, dx = (p.x - drag.sx) / sc, dy = (p.y - drag.sy) / sc;
        if (!drag.moved && Math.sqrt(dx * dx + dy * dy) > 7) { drag.moved = true; drag.b.classList.add('is-drag'); }
        if (!drag.moved) return;
        drag.x = dx; drag.y = dy;
        drag.b.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(-1.6deg)';
        tote.classList.toggle('is-over', inside(p, tote));
      });
      function up(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = drag; drag = null; tote.classList.remove('is-over');
        try { d.b.releasePointerCapture(e.pointerId); } catch (x) { }
        if (!d.moved) return;                                  // a tap: the click handler lands it
        d.b.setAttribute('data-sup', '1');
        var p = Deck.point(e);
        if (inside(p, tote)) land(d.i, { x: d.x, y: d.y }); else springBack(d.b, { x: d.x, y: d.y });
      }
      shelf.addEventListener('pointerup', up); shelf.addEventListener('pointercancel', up);
      shelf.addEventListener('click', function (e) {
        var b = e.target.closest('.tg-b'); if (!b) return;
        if (b.getAttribute('data-sup')) { b.removeAttribute('data-sup'); return; }
        if (!gone(b)) land(+b.getAttribute('data-i'), null, e.detail === 0);   // detail 0 = a keyboard activation
      });
    },
    enter: function (ctx, sl) { st.ctx = ctx; K.stop(st); landed = []; pend = {}; prevN = 0; crates.forEach(clearFly); paint(null); },
    step: function (n, ctx, sl, first) {
      st.ctx = ctx;
      if (first) { prevN = n; landed = []; for (var i = 0; i < n; i++) landed.push(i); paint(null); return; }
      var back = n < prevN; prevN = n;
      var have = landed.length + pendN();
      if (!back && n > have) { for (var j = 0; j < 5; j++) if (landed.indexOf(j) < 0 && !pend[j]) { land(j); break; } }
      else if (back && have > n && !pendN()) unland();
    },
    leave: function () { K.stop(st); pend = {}; drag = null; tote.classList.remove('is-over'); crates.forEach(clearFly); },
    settle: function () { K.stop(st); pend = {}; landed = [0, 1, 2, 3, 4]; crates.forEach(clearFly); paint(null); }
  });
})();

/* Launcher: find a deck. Group tabs, topic and length chips, search, sort and grid / list view.
   With no filter and "By group" the decks sit in their groups; otherwise the matches move into one flat grid.
   The filter lives in the address (#g=odoo&t=ai&q=crm) so a filtered view can be sent; the view (grid / list) is remembered per device. */
(function () {
  'use strict';
  var bar = document.querySelector('.ix-bar');
  if (!bar) return;
  var res = document.querySelector('.ix-results'), flat = res.querySelector('.ix-flat'), empty = res.querySelector('.ix-empty');
  var groups = [].slice.call(res.querySelectorAll('.ix-group'));
  var cards = [].slice.call(res.querySelectorAll('.ix-card'));
  var home = cards.map(function (c) { return c.parentNode; });
  var q = bar.querySelector('.ix-q input'), sort = bar.querySelector('.ix-sort select');
  var count = document.querySelector('[data-count]'), clear = document.querySelector('.ix-clear');
  var st = { g: '', t: [], len: '', q: '', sort: '' };
  var LEN = { s: function (m) { return m <= 10; }, m: function (m) { return m > 10 && m < 30; }, l: function (m) { return m >= 30; } };
  var total = cards.length;

  function press(sel, on) { [].forEach.call(bar.querySelectorAll(sel), function (b) { b.setAttribute('aria-pressed', on(b) ? 'true' : 'false'); }); }
  function match(c) {
    if (st.g && c.dataset.g !== st.g) return false;
    var tags = c.dataset.tags.split(' ');
    for (var i = 0; i < st.t.length; i++) if (tags.indexOf(st.t[i]) < 0) return false;
    if (st.len && !LEN[st.len](+c.dataset.mins)) return false;
    if (st.q) {
      var words = st.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var j = 0; j < words.length; j++) if (c.dataset.words.indexOf(words[j]) < 0) return false;
    }
    return true;
  }
  function key(c) {
    if (st.sort === 'az') return c.dataset.title;
    if (st.sort === 'short') return ('000' + c.dataset.mins).slice(-3) + c.dataset.title;
    if (st.sort === 'long') return ('000' + (999 - c.dataset.mins)).slice(-3) + c.dataset.title;
    return ('000' + c.dataset.order).slice(-3);
  }
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.8,.2,1)';
  function onScreen(r) { return r.bottom > -40 && r.top < innerHeight + 40 && r.width > 0; }
  // every change glides, cheaply: only the cards on screen animate, and only transform and opacity (FLIP, on the compositor)
  function update(push, scroll) {
    var before = new Map();
    if (!calm) cards.forEach(function (c) { if (!c.hidden) { var r = c.getBoundingClientRect(); if (onScreen(r)) before.set(c, r); } });
    render(push);
    // if the results' top has scrolled under the bar, bring it back into view so the change is seen
    var top = res.getBoundingClientRect().top, bb = bar.getBoundingClientRect().bottom;
    if (scroll && top < bb && getComputedStyle(bar).position === 'sticky') scrollBy(0, top - bb - 16);
    if (calm || !Element.prototype.animate) return;
    var k = 0;
    cards.forEach(function (c) {
      if (c.hidden) return;
      if (c.getAnimations) c.getAnimations().forEach(function (an) { an.cancel(); });
      var r = c.getBoundingClientRect();
      if (!onScreen(r)) return;
      var b = before.get(c);
      if (b) {
        var dx = b.left - r.left, dy = b.top - r.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 360, easing: EASE });
      } else {
        c.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: EASE, delay: Math.min(k++, 6) * 30, fill: 'backwards' });
      }
    });
  }
  function render(push) {
    var grouped = !st.t.length && !st.len && !st.q && !st.sort;
    var shown = cards.filter(match);
    if (grouped) {
      cards.forEach(function (c, i) { home[i].appendChild(c); c.hidden = !match(c); });
      groups.forEach(function (g) { g.hidden = !st.g ? false : g.dataset.g !== st.g; });
      flat.hidden = true;
    } else {
      groups.forEach(function (g) { g.hidden = true; });
      cards.forEach(function (c) { c.hidden = true; });
      shown.sort(function (a, b) { return key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0; })
        .forEach(function (c) { c.hidden = false; flat.appendChild(c); });
      flat.hidden = !shown.length;
    }
    empty.hidden = shown.length > 0;
    var any = st.g || st.t.length || st.len || st.q || st.sort;
    count.textContent = shown.length === total ? 'All ' + total + ' decks' : 'Showing ' + shown.length + ' of ' + total + ' decks';
    clear.hidden = !any;
    press('.ix-tab', function (b) { return b.dataset.g === st.g; });
    press('[data-t]', function (b) { return st.t.indexOf(b.dataset.t) >= 0; });
    press('[data-len]', function (b) { return b.dataset.len === st.len; });
    if (q.value !== st.q) q.value = st.q;
    sort.value = st.sort;
    if (push !== false) {
      var p = [];
      if (st.g) p.push('g=' + st.g);
      if (st.t.length) p.push('t=' + st.t.join(','));
      if (st.len) p.push('len=' + st.len);
      if (st.q) p.push('q=' + encodeURIComponent(st.q));
      if (st.sort) p.push('sort=' + st.sort);
      try { history.replaceState(null, '', p.length ? '#' + p.join('&') : location.pathname + location.search); } catch (e) {}
    }
  }
  function fromHash() {
    var h = location.hash.replace(/^#/, '');
    if (!/(^|&)(g|t|len|q|sort)=/.test(h)) return false;
    st = { g: '', t: [], len: '', q: '', sort: '' };
    h.split('&').forEach(function (kv) {
      var i = kv.indexOf('='), k = kv.slice(0, i), v = decodeURIComponent(kv.slice(i + 1));
      if (k === 't') st.t = v.split(',').filter(Boolean); else if (k in st) st[k] = v;
    });
    return true;
  }
  function fadeIn() {
    if (calm || !Element.prototype.animate) return;
    var k = 0;
    cards.forEach(function (c) { if (!c.hidden && onScreen(c.getBoundingClientRect())) c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out', delay: Math.min(k++, 6) * 20, fill: 'backwards' }); });
  }
  function view(v) {
    res.classList.toggle('is-list', v === 'list');
    press('[data-view]', function (b) { return b.dataset.view === v; });
    try { localStorage.setItem('ix-view', v); } catch (e) {}
  }

  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.classList.contains('ix-tab')) st.g = b.dataset.g;
    else if (b.dataset.t) { var i = st.t.indexOf(b.dataset.t); if (i < 0) st.t.push(b.dataset.t); else st.t.splice(i, 1); }
    else if (b.dataset.len) st.len = st.len === b.dataset.len ? '' : b.dataset.len;
    else if (b.dataset.view) { view(b.dataset.view); fadeIn(); return; }
    else return;
    update(true, true);
  });
  var tq = 0;
  q.addEventListener('input', function () { clearTimeout(tq); tq = setTimeout(function () { st.q = q.value.trim(); update(true, true); }, 160); });
  q.addEventListener('keydown', function (e) { if (e.key === 'Escape' && q.value) { e.stopPropagation(); st.q = ''; update(true, true); } });
  sort.addEventListener('change', function () { st.sort = sort.value; update(true, true); });
  [].forEach.call(document.querySelectorAll('[data-clear]'), function (b) {
    b.addEventListener('click', function () { st = { g: '', t: [], len: '', q: '', sort: '' }; update(true, true); q.focus({ preventScroll: true }); });
  });
  // "/" jumps to the search box, as on most sites
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    e.preventDefault(); q.focus();
  });
  addEventListener('hashchange', function () { if (fromHash()) update(false, true); });

  var saved = 'grid';
  try { saved = localStorage.getItem('ix-view') || 'grid'; } catch (e) {}
  view(saved === 'list' ? 'list' : 'grid');
  fromHash();
  render(false);
  // the hover slide is lazy: fetch it once the page has settled, so the first hover doesn't pop in
  addEventListener('load', function () {
    setTimeout(function () { [].forEach.call(document.querySelectorAll('.ix-thumb-2'), function (im) { im.loading = 'eager'; im.decode && im.decode().catch(function () {}); }); }, 600);
  });
})();

/* Launcher: Share copies a link to one presentation on its own (its s-<token>.html copy, with no way to the other decks).
   Phones get the system share sheet; elsewhere a small panel: the link (already copied), Email, WhatsApp, Preview. */
(function () {
  'use strict';
  var pop = null, openBtn = null;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove(); if (ok) res(); else rej();
    });
  }
  function close(focusBack) {
    if (!pop) return;
    pop.remove(); pop = null;
    if (openBtn) { openBtn.setAttribute('aria-expanded', 'false'); if (focusBack) openBtn.focus(); }
    openBtn = null;
  }
  // under the button, kept on screen; above it when there is no room below
  function place() {
    if (!pop || !openBtn) return;
    var r = openBtn.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight, vw = document.documentElement.clientWidth;
    var left = Math.max(12, Math.min(r.left, vw - w - 12)), top = r.bottom + 10;
    if (top + h > innerHeight - 12 && r.top - h - 10 > 12) top = r.top - h - 10;
    pop.style.left = (left + scrollX) + 'px'; pop.style.top = (top + scrollY) + 'px';
  }
  function open(btn) {
    close(false);
    var url = btn.dataset.share, title = btn.dataset.title, msg = 'TechNext · ' + title + ': ' + url;
    openBtn = btn; btn.setAttribute('aria-expanded', 'true');
    pop = document.createElement('div'); pop.className = 'ix-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Share ' + title);
    pop.innerHTML =
      '<div class="ix-pop-h"><b>Share ' + esc(title) + '</b><button type="button" class="ix-pop-x" aria-label="Close">&times;</button></div>' +
      '<p class="ix-pop-t">This link opens this presentation on its own, with no way from it to the other presentations.</p>' +
      '<div class="ix-pop-f"><input type="text" readonly value="' + esc(url) + '" aria-label="Link to ' + esc(title) + '"><button type="button" class="ix-btn ix-btn--p" data-copy>Copy link</button></div>' +
      '<p class="ix-pop-a"><a href="mailto:?subject=' + encodeURIComponent('TechNext · ' + title) + '&amp;body=' + encodeURIComponent(msg) + '">Email</a>' +
      '<a href="https://wa.me/?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">WhatsApp</a>' +
      '<a href="' + esc(url) + '" target="_blank" rel="noopener">Preview</a><span class="ix-pop-s" role="status"></span></p>';
    document.body.appendChild(pop);
    place();
    var input = pop.querySelector('input'), status = pop.querySelector('.ix-pop-s'), cb = pop.querySelector('[data-copy]'), t = 0;
    function doCopy() {
      copy(url).then(function () {
        status.textContent = 'Link copied'; cb.textContent = 'Copied'; clearTimeout(t);
        t = setTimeout(function () { if (cb.isConnected) cb.textContent = 'Copy link'; }, 1800);
      }, function () { input.focus(); input.select(); status.textContent = 'Press Ctrl+C to copy'; });
    }
    cb.addEventListener('click', doCopy);
    input.addEventListener('focus', function () { input.select(); });
    pop.querySelector('.ix-pop-x').addEventListener('click', function () { close(true); });
    doCopy();
    cb.focus();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.ix-share');
    if (b) {
      e.preventDefault();
      if (b === openBtn) { close(true); return; }
      if (navigator.share && window.matchMedia && matchMedia('(pointer: coarse)').matches) {
        navigator.share({ title: 'TechNext · ' + b.dataset.title, url: b.dataset.share }).catch(function (err) { if (!err || err.name !== 'AbortError') open(b); });
        return;
      }
      open(b); return;
    }
    if (pop && !pop.contains(e.target)) close(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pop) { e.preventDefault(); close(true); } });
  addEventListener('resize', place);

  // offline: every deck (and its pictures, fonts and PDF) saved on this device, for venues with no internet (sw.js)
  var off = document.querySelector('[data-offline]'), st = document.querySelector('[data-offline-st]');
  var swOK = 'serviceWorker' in navigator && location.protocol === 'https:';
  if (off && !swOK) { off.hidden = true; if (st) st.textContent = 'Saving for offline works on the live site (https).'; }
  if (swOK) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
    navigator.serviceWorker.addEventListener('message', function (e) {
      if (e.data && e.data.warmed && st) { st.textContent = 'Saved: ' + Math.max(1, e.data.warmed - 1) + ' decks open on this device with no internet.'; if (off) off.disabled = false; }
    });
  }
  if (off && swOK) off.addEventListener('click', function () {
    var pages = [location.href.split('#')[0]];
    [].forEach.call(document.querySelectorAll('.ix-thumb'), function (a) { pages.push(new URL(a.getAttribute('href'), location.href).href); });
    off.disabled = true; if (st) st.textContent = 'Saving ' + (pages.length - 1) + ' decks…';
    navigator.serviceWorker.ready.then(function (reg) { if (reg.active) reg.active.postMessage({ warm: pages }); });
  });
})();

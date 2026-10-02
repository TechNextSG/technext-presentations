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
      if (e.data && e.data.warmed && st) { st.textContent = 'Saved: ' + e.data.warmed + ' decks open on this device with no internet.'; if (off) off.disabled = false; }
    });
  }
  if (off && swOK) off.addEventListener('click', function () {
    var pages = [location.href.split('#')[0]];
    [].forEach.call(document.querySelectorAll('.ix-thumb'), function (a) { pages.push(new URL(a.getAttribute('href'), location.href).href); });
    off.disabled = true; if (st) st.textContent = 'Saving ' + (pages.length - 1) + ' decks…';
    navigator.serviceWorker.ready.then(function (reg) { if (reg.active) reg.active.postMessage({ warm: pages }); });
  });
})();

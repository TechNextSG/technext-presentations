/* TechNext decks, offline copies. A deck opened once while online keeps opening and running with no connection on that
   device: venue Wi-Fi down, flight mode, a TV that loses the network. Registered by deck.js and index.js on the live site.
   Pages: network first, so an update shows as soon as there is a connection; the saved copy when there is none.
   Versioned files (?v=): the saved copy. Other files (pictures, PDFs, fonts): the saved copy at once, refreshed behind it.
   A page asks for itself to be saved in full ({warm: [urls]}): the HTML, every file it points at, and what its CSS points at. */
var CACHE = 'tn-decks-1';

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE && k.indexOf('tn-decks-') === 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function pageKey(href) { var u = new URL(href); u.search = ''; u.hash = ''; return u.href; }
function isPage(req, url) { return req.mode === 'navigate' || /\.html$/.test(url.pathname) || /\/$/.test(url.pathname); }

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (isPage(req, url)) {
    e.respondWith(fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (k) { k.put(pageKey(req.url), copy); }); }
      return res;
    }).catch(function () {
      return caches.match(pageKey(req.url)).then(function (hit) { return hit || caches.match(new URL('./', self.registration.scope).href); });
    }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(function (k) {
    return k.match(req).then(function (hit) {
      if (hit && /[?&]v=/.test(url.search)) return hit;
      var net = fetch(req).then(function (res) { if (res.ok) k.put(req, res.clone()); return res; });
      if (hit) { e.waitUntil(net.catch(function () {})); return hit; }
      return net;
    });
  }));
});

// saving a page in full: the HTML, then the files it names (src, data-src, href under assets/ or pdf/), then the fonts its CSS names
var FILES = /\s(?:src|data-src|href)="((?:assets|pdf)\/[^"#]+)"/g, CSSURL = /url\(\s*['"]?([^)'"]+)['"]?\s*\)/g;
function save(k, href) {
  return k.match(href).then(function (hit) {
    return hit || fetch(href).then(function (res) { if (!res.ok) return null; return k.put(href, res.clone()).then(function () { return res; }); });
  }).catch(function () { return null; });
}
function warmPage(k, href) {
  var key = pageKey(href);
  return fetch(key).then(function (res) {
    if (!res.ok) return;
    return k.put(key, res.clone()).then(function () { return res.text(); }).then(function (html) {
      var urls = {}, m;
      FILES.lastIndex = 0;
      while ((m = FILES.exec(html))) urls[new URL(m[1].replace(/&amp;/g, '&'), key).href] = 1;
      return Promise.all(Object.keys(urls).map(function (u) {
        return save(k, u).then(function (r) {
          if (!r || !/\.css(\?|$)/.test(u)) return;
          return r.clone().text().then(function (css) {
            var found = [], c; CSSURL.lastIndex = 0;
            while ((c = CSSURL.exec(css))) if (!/^data:/.test(c[1])) found.push(save(k, new URL(c[1], u).href));
            return Promise.all(found);
          });
        });
      }));
    });
  }).catch(function () {});
}
self.addEventListener('message', function (e) {
  var d = e.data || {};
  if (!d.warm || !d.warm.length) return;
  e.waitUntil(caches.open(CACHE).then(function (k) {
    return Promise.all(d.warm.map(function (u) { return warmPage(k, u); }));
  }).then(function () { if (e.source && e.source.postMessage) e.source.postMessage({ warmed: d.warm.length }); }));
});

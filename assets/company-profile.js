/* Company profile deck: slide behaviour. */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var APP = {};
  (window.APPS || []).forEach(function (c) { c.apps.forEach(function (a) { APP[a.m] = a; }); });
  function idx(s) { return Deck.slides.indexOf(s); }

  /* ---------------------------------------------------------------- 1 · cover: two orbits, a plane leaving a trail */
  function coverOrbits(s) {
    return [
      FX.orbit($$('[data-orbit=outer] .orb', s), { cx: 380, cy: 380, rx: 342, ry: 130, speed: .045, min: .68, fade: .5, phase: .3 }),
      FX.orbit($$('[data-orbit=inner] .orb', s), { cx: 380, cy: 380, rx: 228, ry: 88, speed: -.07, min: .78, fade: .3, phase: 1.2 })
    ];
  }
  Deck.on('cover', {
    init: function (s) {
      var o = coverOrbits(s); o[0](0); o[1](0);
      $('.cv-plane', s).setAttribute('d', FX.PLANE);
      FX.along($('#cvPath', s), $('.cv-plane', s), .62, false, 1.35);
      $('.cv-trail-m', s).style.strokeDashoffset = .38;
    },
    enter: function (ctx, s) {
      var o = coverOrbits(s), core = $('.cv-core', s), path = $('#cvPath', s), plane = $('.cv-plane', s), mask = $('.cv-trail-m', s), trail = $('.cv-trail', s);
      var ptr = FX.pointer(ctx, s), FLY = 7200, REST = 2200, PER = FLY + REST;
      ctx.frame(function (t) {
        var p = ptr.step();
        o[0](t / 1000, p.x * 30, p.y * 20); o[1](t / 1000, p.x * 16, p.y * 11);
        core.style.transform = 'translate(' + (p.x * 9).toFixed(1) + 'px,' + (p.y * 7).toFixed(1) + 'px)';
        var ph = ((t + 900) % PER) / FLY;
        if (ph <= 1) {
          var e = Deck.ease.io(ph);
          FX.along(path, plane, e, false, 1.35);
          plane.style.opacity = ph < .06 ? ph / .06 : ph > .94 ? (1 - ph) / .06 : 1;
          mask.style.strokeDashoffset = (1 - e).toFixed(4); trail.style.opacity = 1;
        } else {
          plane.style.opacity = 0;
          trail.style.opacity = Math.max(0, 1 - (ph - 1) * FLY / 900).toFixed(3);
        }
      });
    }
  });

  /* ---------------------------------------------------------------- 2 · who: counters and pips */
  Deck.on('who', {
    init: function (s) {
      $$('.pips', s).forEach(function (p) { p.innerHTML = new Array(+p.dataset.pips + 1).join('<i class="is-on"></i>'); });
      $$('.stat-ics .ic', s).forEach(function (x) { x.classList.add('is-on'); });
    },
    settle: function (s) {
      $$('[data-count]', s).forEach(function (el) { el.textContent = el.dataset.count; });
      $$('.pips i, .stat-ics .ic', s).forEach(function (x) { x.classList.add('is-on'); });
    },
    enter: function (ctx, s) {
      $$('[data-count]', s).forEach(function (el, i) {
        el.textContent = '0';
        ctx.after(420 + i * 110, function () { ctx.count(el, +el.dataset.count, { dur: 1300 }); });
      });
      $$('.pips', s).forEach(function (p, i) {
        var pis = [].slice.call(p.children), n = pis.length;
        pis.forEach(function (x) { x.classList.remove('is-on'); });
        pis.forEach(function (x, k) { ctx.after(480 + i * 110 + k * (1250 / n), function () { x.classList.add('is-on'); }); });
      });
      var ics = $$('.stat-ics .ic', s);
      ics.forEach(function (x) { x.classList.remove('is-on'); });
      ics.forEach(function (x, k) { ctx.after(900 + k * 240, function () { x.classList.add('is-on'); }); });
    }
  });

  /* ---------------------------------------------------------------- 3 · offices: arcs between the three, planes on them */
  var OFF = [null, 'sg', 'ph', 'vn'];
  Deck.on('offices', {
    init: function (s) {
      var pos = {};
      $$('.of-pin', s).forEach(function (p) {
        var xy = p.dataset.xy.split(',').map(Number); pos[p.dataset.o] = xy;
        p.style.setProperty('--px', xy[0] + 'px'); p.style.setProperty('--py', xy[1] + 'px');
      });
      var g = $('.of-links', s), gp = $('.of-planes', s);
      s._links = [['sg', 'vn', -.3], ['sg', 'ph', .18], ['ph', 'vn', .22]].map(function (pr) {
        var d = FX.arc(pos[pr[0]], pos[pr[1]], pr[2]);
        var l = { a: pr[0], b: pr[1], base: FX.svg('path', { d: d, 'class': 'of-link' }, g), flow: FX.svg('path', { d: d, 'class': 'of-link flow' }, g), plane: FX.svg('path', { d: FX.PLANE, 'class': 'of-plane' }, gp), dim: false };
        FX.along(l.base, l.plane, .5, false, .85);
        return l;
      });
      s.addEventListener('click', function (e) {
        var b = e.target.closest('[data-n]'); if (!b || !s.contains(b)) return;
        var n = +b.dataset.n; Deck.go(idx(s), +s.dataset.cur === n ? 0 : n);
      });
    },
    enter: function (ctx, s) {
      ctx.frame(function (t) {
        s._links.forEach(function (l, i) {
          var per = 5600 + i * 800, ph = ((t + i * 1900) % per) / per;
          FX.along(l.base, l.plane, Deck.ease.io(ph), false, .85);
          var f = ph < .1 ? ph / .1 : ph > .9 ? (1 - ph) / .1 : 1;
          l.plane.style.opacity = (f * (l.dim ? .2 : 1)).toFixed(3);
        });
      });
    },
    step: function (n, ctx, s) {
      var sel = OFF[n];
      $$('.of-pin', s).forEach(function (p) { p.classList.toggle('is-sel', p.dataset.o === sel); p.classList.toggle('is-dim', !!sel && p.dataset.o !== sel); });
      s._links.forEach(function (l) {
        l.dim = !!sel && l.a !== sel && l.b !== sel;
        l.base.classList.toggle('is-dim', l.dim); l.flow.classList.toggle('is-dim', l.dim);
      });
    }
  });

  /* ---------------------------------------------------------------- 5 · partner: two rings of apps, tooltips */
  function ptOrbits(s) {
    return [
      FX.orbit($$('[data-orbit=in] .pt-orb', s), { cx: 350, cy: 350, rx: 180, ry: 180, speed: .05, min: 1, phase: -Math.PI / 2 }),
      FX.orbit($$('[data-orbit=out] .pt-orb', s), { cx: 350, cy: 350, rx: 300, ry: 300, speed: -.028, min: 1 })
    ];
  }
  Deck.on('partner', {
    init: function (s) { var o = ptOrbits(s); o[0](0); o[1](0); },
    enter: function (ctx, s) {
      var o = ptOrbits(s), wrap = $('.pt-orbit', s), tip = $('.pt-tip', s), t = 0, last = 0, hold = null;
      ctx.frame(function (el, now) {
        var dt = last ? Math.min(50, now - last) : 0; last = now;
        if (!hold) t += dt;
        o[0](t / 1000); o[1](t / 1000);
        if (hold) place(hold);
      });
      function place(b) {
        var r = Deck.vbox(b, wrap), x = r.cx + (r.cx > 350 ? -290 : 50), y = r.cy - 40;
        tip.style.setProperty('--tx', Math.max(0, Math.min(450, x)) + 'px'); tip.style.setProperty('--ty', Math.max(0, Math.min(620, y)) + 'px');
      }
      function show(b) {
        var a = APP[b.dataset.app]; if (!a) return;
        hold = b; $('b', tip).textContent = a.n; $('small', tip).textContent = a.d; tip.hidden = false; place(b);
      }
      function hide() { hold = null; tip.hidden = true; }
      ctx.on(wrap, 'pointerover', function (e) { var b = e.target.closest('.pt-orb'); if (b) show(b); });
      ctx.on(wrap, 'pointerout', function (e) { var b = e.target.closest('.pt-orb'); if (b && !b.contains(e.relatedTarget)) hide(); });
      ctx.on(wrap, 'focusin', function (e) { var b = e.target.closest('.pt-orb'); if (b) show(b); });
      ctx.on(wrap, 'focusout', hide);
    },
    leave: function (s) { $('.pt-tip', s).hidden = true; }
  });

  /* ---------------------------------------------------------------- 6 · engagement: a plane moves step to step */
  var WHO = [['sg', 'ph', 'you'], ['ph', 'vn'], ['vn', 'ph'], ['ph', 'sg', 'you'], ['sg', 'ph', 'vn']];
  var WHO_S = ['On-site with you in Singapore, with consultants from Taguig City.', 'Consultants in Taguig City, with the development hub in Ho Chi Minh City.',
    'The development hub, with the consultants who know your process.', 'The consultants who configured it, in person in Singapore or online.', 'All three offices, one support channel.'];
  Deck.on('engagement', {
    init: function (s) {
      var base = $('#enBase', s), plane = $('.en-plane', s);
      plane.setAttribute('d', FX.PLANE);
      s._f = $$('.en-node', s).map(function (n) { return FX.fracAtX(base, parseFloat(n.style.getPropertyValue('--x'))); });
      s._f[s._f.length - 1] = 1; s._p = 0;
      FX.along(base, plane, 0, false, 1.25);
      s.addEventListener('click', function (e) { var b = e.target.closest('.en-node'); if (b) Deck.go(idx(s), +b.dataset.n); });
    },
    step: function (n, ctx, s, first) {
      var base = $('#enBase', s), plane = $('.en-plane', s), svg = $('.en-svg', s), from = s._p, to = s._f[n];
      $$('.en-node', s).forEach(function (el, k) { el.classList.toggle('is-past', k < n); el.classList.toggle('is-cur', k === n); });
      $$('.en-card', s).forEach(function (el, k) { el.classList.toggle('is-on', k === n); });
      $$('.en-offs span', s).forEach(function (el) { el.classList.toggle('is-on', WHO[n].indexOf(el.dataset.o) >= 0); });
      $('[data-who]', s).textContent = WHO_S[n];
      function at(p) { s._p = p; FX.along(base, plane, p, false, 1.25); svg.style.setProperty('--p', p.toFixed(4)); }
      if (first && from === to) { at(to); return; }
      ctx.tween(first ? 900 : 1100, function (e) { at(from + (to - from) * e); }, 'io');
    }
  });

  /* ---------------------------------------------------------------- 7 · AI: the four disciplines take turns */
  Deck.on('ai', {
    init: function (s) { AIDemo.render($('.ai-host', s), 'rag'); $$('.ai-tabs button', s)[0].setAttribute('aria-selected', 'true'); },
    enter: function (ctx, s) {
      var host = $('.ai-host', s), tabs = $$('.ai-tabs button', s), cur = 0;
      function show(k) {
        cur = k;
        tabs.forEach(function (b, j) { b.setAttribute('aria-selected', j === k ? 'true' : 'false'); });
        AIDemo.play(host, tabs[k].dataset.k, ctx, {}).then(function (r) { if (r !== AIDemo.STOP && ctx.alive && cur === k) show((k + 1) % tabs.length); });
      }
      ctx.on($('.ai-tabs', s), 'click', function (e) { var b = e.target.closest('button'); if (b) show(tabs.indexOf(b)); });
      ctx.after(500, function () { show(0); });
    }
  });

  /* ---------------------------------------------------------------- 8 · industries: cycles until someone picks one */
  Deck.on('industries', {
    init: function (s) { $$('.in-tile', s)[0].setAttribute('aria-selected', 'true'); $$('.in-p', s)[0].classList.add('is-on'); },
    enter: function (ctx, s) {
      var tiles = $$('.in-tile', s), panels = $$('.in-p', s), cur = 0, auto = true;
      function sel(k) { cur = k; tiles.forEach(function (t, j) { t.setAttribute('aria-selected', j === k ? 'true' : 'false'); }); panels.forEach(function (p, j) { p.classList.toggle('is-on', j === k); }); }
      sel(0);
      ctx.every(3800, function () { if (auto) sel((cur + 1) % tiles.length); });
      var grid = $('.in-grid', s);
      ctx.on(grid, 'click', function (e) { var t = e.target.closest('.in-tile'); if (t) { auto = false; sel(tiles.indexOf(t)); } });
      ctx.on(grid, 'pointerover', function (e) { var t = e.target.closest('.in-tile'); if (t && e.pointerType === 'mouse') { auto = false; sel(tiles.indexOf(t)); } });
    }
  });

  /* ---------------------------------------------------------------- 10 · details: click to copy */
  Deck.on('details', {
    init: function (s) {
      var toast = $('.dt-toast', s), tT = 0;
      s.addEventListener('click', function (e) {
        var b = e.target.closest('[data-copy]'); if (!b) return;
        var txt = b.textContent.trim();
        function done() { $('span', toast).textContent = 'Copied: ' + txt; toast.classList.add('is-on'); clearTimeout(tT); tT = setTimeout(function () { toast.classList.remove('is-on'); }, 1800); }
        function fallback() { var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (x) {} ta.remove(); done(); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
      });
    }
  });
})();

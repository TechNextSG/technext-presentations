/* BHD Asia on Odoo: implementation scope. Slide behaviour. Every demo runs on sample data, labelled on its slide.
   The six workflow slides share one engine: → (or a click on a step, or Play) moves the build; scene parts marked
   data-on="n" light up from step n, data-t="0:text|n:text" swaps their wording. Every animated slide has a settle hook,
   so the overview and the PDF show it finished. The open-items marks are kept for this browser tab (sessionStorage). */
(function () {
  'use strict';
  var $ = function (s, r) { return r.querySelector(s); }, $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };
  var stage = document.querySelector('.stage');

  // a segmented control: sets aria-pressed and calls fn(value); returns set(value, quiet)
  function seg(root, fn) {
    function set(v, quiet) {
      $$('button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
      if (!quiet) fn(v);
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    return set;
  }
  // paint an end state with every transition in root switched off
  function snap(root, fn) { root.classList.add('e-nt'); fn(); void root.offsetWidth; root.classList.remove('e-nt'); }
  var store = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function stepTo(n) { Deck.go(Deck.index, n); }

  // jump links anywhere in the deck: data-go="slide id", data-at="build"
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !stage.contains(b)) return;
    e.stopPropagation();
    Deck.goId(b.dataset.go, b.dataset.at != null ? +b.dataset.at : 0);
  });

  /* ---------------------------------------------------------------- 2 · the scope boundary */
  var EB = {
    mods: ['No custom modules.', 'Odoo Online doesn’t run them, and nothing here needs one. A custom module has to be kept working through every Odoo upgrade: a recurring cost, and code only its author knows.'],
    apps: ['No third-party apps.', 'No app-store add-ons: no extra licences, and nothing that waits on another vendor before you can upgrade.'],
    code: ['No scripts, no outbound calls.', 'Nothing inside the database calls out to another service. That is exactly why the Zoom link sits outside this scope.'],
    cfg: ['Configuration, by TechNext.', 'Products, events, booking types, emails, surveys, automation rules and access rights, set up once in Odoo’s standard screens. You can open and change every one of them.'],
    odoo: ['Odoo Online, from Odoo.', 'Odoo hosts, runs and upgrades the system. Every module in this scope is in the same per-user subscription.']
  };
  Deck.on('scope', {
    init: function (s) {
      var say = $('.eb-say-t', s), say0 = say.innerHTML;
      s._pick = function (k) {
        $$('.eb-l', s).forEach(function (b) { b.classList.toggle('is-on', b.dataset.k === k); });
        if (!k) { say.innerHTML = say0; return; }
        say.innerHTML = '<b>' + EB[k][0] + '</b> <span>' + EB[k][1] + '</span>';
      };
      $('.eb-stack', s).addEventListener('click', function (e) { var b = e.target.closest('.eb-l'); if (b) s._pick(b.dataset.k); });
    },
    enter: function (ctx, s) { s._pick(null); },
    settle: function (s) { s._pick(null); }
  });

  /* ---------------------------------------------------------------- 3 · what it has to carry (cycles until clicked) */
  Deck.on('carry', {
    init: function (s) {
      s._pick = function (k) {
        $$('.es-list button', s).forEach(function (b) { b.classList.toggle('is-on', +b.dataset.k === k); });
        $$('.es-d', s).forEach(function (d) { d.classList.toggle('is-on', +d.dataset.k === k); });
        $$('.es-rec-row span', s).forEach(function (d) { d.classList.toggle('is-on', +d.dataset.k === k); });
      };
      $('.es-list', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (!b) return; s._held = true; s._pick(+b.dataset.k); });
    },
    enter: function (ctx, s) {
      var k = 0; s._held = false; s._pick(0);
      ctx.every(4600, function () { if (s._held) return; k = (k + 1) % 7; s._pick(k); });
    },
    settle: function (s) { s._pick(0); }
  });

  /* ---------------------------------------------------------------- 4 · six workflows × nine modules */
  Deck.on('flows', {
    init: function (s) {
      var ex = $('.ex', s);
      $$('.ex-row', s).forEach(function (r) {
        var u = r.dataset.u.split(',');
        for (var m = 1; m <= 9; m++) {
          var d = document.createElement('span');
          d.className = u.indexOf(String(m)) >= 0 ? 'ex-dot' : 'ex-gap';
          d.dataset.m = m; d.style.setProperty('--j', m);
          r.appendChild(d);
        }
      });
      s._pick = function (m) {
        s._m = m;
        ex.classList.toggle('is-pick', !!m);
        $$('.ex-hd button', s).forEach(function (b) { b.classList.toggle('is-on', b.dataset.m === m); });
        $$('.ex-dot', s).forEach(function (d) { d.classList.toggle('is-hit', d.dataset.m === m); });
        $$('.ex-row', s).forEach(function (r) { r.classList.toggle('is-hit', !!m && r.dataset.u.split(',').indexOf(m) >= 0); });
      };
      $('.ex-hd', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (b) s._pick(s._m === b.dataset.m ? null : b.dataset.m); });
    },
    enter: function (ctx, s) { s._pick(null); },
    settle: function (s) { s._pick(null); }
  });

  /* ---------------------------------------------------------------- the workflow engine (slides w1–w6) */
  function pickText(spec, n) {
    var out = '';
    spec.split('|').forEach(function (p) { var i = p.indexOf(':'), k = +p.slice(0, i); if (k <= n) out = p.slice(i + 1); });
    return out;
  }
  function flow(id, opt) {
    opt = opt || {};
    function stop(s) {
      s._run = (s._run || 0) + 1; s._play = false;
      var b = $('.ew-play', s); b.classList.remove('is-on'); $('span', b).textContent = 'Play the flow';
    }
    function paint(s, n, ctx, first) {
      var N = s._N, sc = $('.ew-scene', s);
      s._k = n; s.classList.toggle('is-run', n > 0); sc.dataset.k = n;
      $$('.ew-steps button', s).forEach(function (b) {
        var k = +b.dataset.n, li = b.parentNode;
        li.classList.toggle('is-done', k < n); li.classList.toggle('is-on', k === n);
      });
      $('.ew-count b', s).textContent = n;
      $$('[data-on]', sc).forEach(function (el) { var k = +el.dataset.on; el.classList.toggle('is-on', k <= n); el.classList.toggle('is-now', k === n && n < N + 1); });
      $$('[data-t]', s).forEach(function (el) { el.textContent = pickText(el.dataset.t, n); });
      if (opt.paint) opt.paint(s, n, ctx, first);
    }
    Deck.on(id, {
      init: function (s) {
        s._N = +s.dataset.steps;
        $$('.ew-steps button', s).forEach(function (b) { b.addEventListener('click', function () { stop(s); stepTo(+b.dataset.n); }); });
        var play = $('.ew-play', s);
        play.addEventListener('click', function () {
          if (s._play || !s._ctx) { stop(s); return; }
          var tok = (s._run || 0) + 1; s._run = tok; s._play = true;
          play.classList.add('is-on'); $('span', play).textContent = 'Pause';
          if (Deck.step >= s._N) stepTo(0); else stepTo(Deck.step + 1);
          s._ctx.every(opt.pace || 1600, function () {
            if (s._run !== tok) return;
            if (Deck.index !== Deck.slides.indexOf(s) || Deck.step >= s._N) { stop(s); return; }
            stepTo(Deck.step + 1);
          });
        });
        if (opt.init) opt.init(s);
      },
      enter: function (ctx, s) { s._ctx = ctx; stop(s); },
      step: function (n, ctx, s, first) { paint(s, n, ctx, first); },
      leave: function (s) { stop(s); },
      settle: function (s) { snap(s, function () { paint(s, s._N, null, true); }); }
    });
  }

  /* 5 · workflow 1: card or bank transfer */
  var E1 = {
    card: ['Paid by card · surcharge added on top', 'Invoice sent automatically · Paid'],
    bank: ['Chose bank transfer · no fee', 'Invoice sent · Paid once the transfer lands']
  };
  flow('w1', {
    init: function (s) {
      s._pay = 'card';
      seg($('.e1-pay', s), function (v) { s._pay = v; $('[data-e1=pay]', s).textContent = E1[v][0]; $('[data-e1=inv]', s).textContent = E1[v][1]; });
    },
    paint: function (s, n) { $('.e1-seats', s).style.setProperty('--p', (n >= 7 ? 10 : 9) / 12); }
  });

  /* 6 · workflow 2: screened once (pass -> paid link, fail -> Discovery Call), then pay to book */
  flow('w2', {
    init: function (s) {
      s._fail = false;
      seg($('.e2-res', s), function (v) { s._fail = v === 'fail'; paint2(s, s._k || 0); });
      var g = $('.e2-slots', s);
      g.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-s]'); if (!b) return;
        $$('button', g).forEach(function (x) { x.classList.toggle('is-pick', x === b); });
        $('[data-e2=when]', s).textContent = b.dataset.s;
      });
    },
    paint: function (s, n) { paint2(s, n); }
  });
  function paint2(s, n) {
    var sc = $('.e2', s), scored = n >= 2, f = s._fail;
    sc.classList.toggle('is-fail', f); sc.classList.toggle('is-scored', scored); sc.classList.toggle('is-sent', n >= 3);
    sc.style.setProperty('--sc', scored ? (f ? 35 : 88) : 0);
    $('[data-e2=score]', s).textContent = scored ? (f ? '35%' : '88%') : '–';
    $('[data-e2=verdict]', s).textContent = !scored ? 'Waiting for the answers' : f ? 'A red flag: not cleared' : 'No red flags: cleared';
    $('[data-e2=mail]', s).textContent = f ? 'Book a free Discovery Call' : 'Your booking link · 1:1 session';
    $('[data-e2=tag]', s).textContent = f ? 'Free' : 'Paid link';
    $$('li[data-pass]', s).forEach(function (li) { li.classList.toggle('is-skip', f && n >= 3); });
  }

  /* 7 · screen at the front door: the order we avoid, then the one we build */
  Deck.on('frontdoor', {
    step: function (n, ctx, s) { var L = $$('.ek-lane', s); L[0].classList.toggle('is-on', n >= 1); L[1].classList.toggle('is-on', n >= 2); },
    settle: function (s) { snap(s, function () { $$('.ek-lane', s).forEach(function (l) { l.classList.add('is-on'); }); }); }
  });

  /* 7 · workflow 3: three booking types, approved by hand */
  var E3 = {
    sup: { who: 'a provider you certified', ini: 'AR', name: 'A. Rahman', what: 'Supervision · 60 min · sample', ans: 'I’d like to bring one client case.' },
    pre: { who: 'a client with a prepaid package', ini: 'ML', name: 'Mei Lin Tan', what: 'Session from a prepaid package · sample', ans: 'Same time as last week, if it suits you.' },
    tp: { who: 'a client a partner programme sent', ini: 'JS', name: 'J. Santos', what: 'Third-party programme · sample', ans: 'Referred by the programme coordinator.' }
  };
  flow('w3', {
    init: function (s) {
      seg($('.e3-type', s), function (v) {
        var t = E3[v];
        ['who', 'ini', 'name', 'what', 'ans'].forEach(function (k) { $('[data-e3=' + k + ']', s).textContent = t[k]; });
      });
      $('.e3-ok', s).addEventListener('click', function () { if (Deck.step === 3) stepTo(4); });
    },
    paint: function (s, n) { $('.e3', s).classList.toggle('is-ok', n >= 4); }
  });

  /* 8 · workflow 4: the screening score decides */
  flow('w4', {
    init: function (s) {
      s._fail = false;
      seg($('.e4-res', s), function (v) { s._fail = v === 'fail'; paint4(s, s._k || 0); });
    },
    paint: function (s, n) { paint4(s, n); }
  });
  function paint4(s, n) {
    var sc = $('.e4', s), scored = n >= 2, f = s._fail;
    sc.classList.toggle('is-fail', f); sc.classList.toggle('is-scored', scored);
    sc.style.setProperty('--sc', scored ? (f ? 40 : 92) : 0);
    $('[data-e4=score]', s).textContent = scored ? (f ? '40%' : '92%') : '–';
    $('[data-e4=verdict]', s).textContent = !scored ? 'Waiting for the answers' : f ? 'Not cleared: below the required score' : 'Cleared: above the required score';
    $$('li[data-pass]', s).forEach(function (li) { li.classList.toggle('is-skip', f && scored); });
  }

  /* 9 · the shop has no buy button for it */
  var EH_Q = 'screened service';
  Deck.on('gate', {
    init: function (s) { $('.eh-go', s).addEventListener('click', function () { if (Deck.step < 1) stepTo(1); }); },
    step: function (n, ctx, s, first) {
      var q = $('[data-eh=q]', s), eh = $('.eh', s);
      if (n < 1) { q.textContent = ''; eh.classList.remove('is-done'); return; }
      if (first) { q.textContent = EH_Q; eh.classList.add('is-done'); return; }
      q.textContent = '';
      ctx.type(q, EH_Q, 55).then(function () { ctx.after(350, function () { eh.classList.add('is-done'); }); });
    },
    settle: function (s) { snap(s, function () { $('[data-eh=q]', s).textContent = EH_Q; $('.eh', s).classList.add('is-done'); }); }
  });

  /* 10 · workflow 5: the seats fill, then the waitlist */
  flow('w5', {
    init: function (s) {
      s._extra = 0;
      $('.e5-add', s).addEventListener('click', function () {
        if ((s._k || 0) < 2) { stepTo(2); return; }
        s._extra++; counts5(s, s._k);
      });
    },
    paint: function (s, n, ctx, first) {
      var sc = $('.e5', s), seats = $$('.e5-seats i', s), full = n >= 1;
      if (n === 0) s._extra = 0;
      sc.classList.toggle('is-full', full);
      if (full && ctx && !first && n === 1) {
        seats.forEach(function (i, k) { i.classList.toggle('is-on', k < 9); });
        [9, 10, 11].forEach(function (k, j) { ctx.after(200 + j * 260, function () { seats[k].classList.add('is-on'); $('[data-e5=seats]', s).textContent = k + 1; }); });
        $('[data-e5=seats]', s).textContent = 9;
        sc.classList.remove('is-full'); ctx.after(1000, function () { sc.classList.add('is-full'); });
      } else {
        seats.forEach(function (i, k) { i.classList.toggle('is-on', k < (full ? 12 : 9)); });
        $('[data-e5=seats]', s).textContent = full ? 12 : 9;
      }
      if (n === 2 && ctx && !first) ctx.count($('[data-e5=wait]', s), 14 + s._extra, { dur: 900 }).then(function () { counts5(s, s._k); });
      else counts5(s, n);
    }
  });
  function counts5(s, n) {
    var w = n >= 2 ? 14 + s._extra : 0;
    $('[data-e5=wait]', s).textContent = w;
    $('[data-e5=tagged]', s).textContent = n >= 3 ? w : 0;
    $('[data-e5=sent]', s).textContent = n >= 4 ? w : 0;
  }

  /* 11 · workflow 6: matched, then the accountant's view */
  flow('w6', {
    init: function (s) { seg($('.e6-seg', s), function (v) { $('.e6', s).classList.toggle('is-exp', v === 'exp'); }); },
    paint: function (s, n) { $('.e6', s).classList.toggle('is-rec', n >= 2); }
  });

  /* ---------------------------------------------------------------- 12 · modules: what each carries, or replaces */
  Deck.on('modules', {
    init: function (s) { s._set = seg($('.eo-seg', s), function (v) { $('.eo', s).classList.toggle('is-was', v === 'was'); }); },
    enter: function (ctx, s) { s._set('does'); },
    settle: function (s) { s._set('does'); }
  });

  /* ---------------------------------------------------------------- 13 · phase two: switches */
  var EF = ['eLearning', 'Documents', 'Subscriptions', 'Knowledge', 'Multi-company'];
  Deck.on('phase2', {
    init: function (s) {
      var say = $('[data-ef=say]', s), say0 = say.textContent;
      s._on = [false, false, false, false, false];
      s._paint = function (last) {
        var n = 0;
        $$('.ef-list button', s).forEach(function (b, i) { b.setAttribute('aria-checked', s._on[i] ? 'true' : 'false'); if (s._on[i]) n++; });
        $$('.ef-slot', s).forEach(function (sl, i) { sl.classList.toggle('is-on', s._on[i]); });
        $('[data-ef=n]', s).textContent = 9 + n;
        say.textContent = last == null ? say0 : s._on[last] ? EF[last] + ' switched on: same database, same contacts, nothing migrated.' : EF[last] + ' switched off again.';
      };
      $('.ef-list', s).addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (!b) return; var k = +b.dataset.k; s._on[k] = !s._on[k]; s._paint(k); });
    },
    enter: function (ctx, s) { s._on = [false, false, false, false, false]; s._paint(); },
    settle: function (s) { s._on = [false, false, false, false, false]; s._paint(); }
  });

  /* ---------------------------------------------------------------- 16 · settled: books in SGD, prices in any currency */
  var EY = {
    SGD: 'TRE™ Module 1 · Singapore cohort', USD: 'Any service on the USD pricelist', EUR: 'TRE™ Module 1 · Bucharest cohort',
    GBP: 'UK school programme', JPY: 'Any service on the JPY pricelist'
  };
  Deck.on('currency', {
    init: function (s) {
      var win = $('.ey-win', s), say = $('[data-ey=say]', s), say0 = say.textContent;
      s._set = seg($('.ey-seg', s), function (v) {
        $('[data-ey=what]', s).textContent = EY[v]; $('[data-ey=pl]', s).textContent = v;
        $('[data-ey=books]', s).textContent = v === 'SGD' ? 'Posted to the books as it is, in SGD' : 'Posted to the books in SGD at the day’s rate';
        win.classList.remove('is-refused'); say.textContent = say0;
      });
      $('.ey-try', s).addEventListener('click', function () {
        win.classList.add('is-refused');
        say.textContent = 'Refused: journal entries already exist in SGD, so the company currency stays SGD.';
      });
    },
    enter: function (ctx, s) { s._set('EUR'); },
    settle: function (s) { s._set('EUR'); }
  });

  /* ---------------------------------------------------------------- 16 · the provider bundle: a network that grows */
  Deck.on('bundle', {
    init: function (s) {
      var ring = $('.eu-ring', s), inp = $('#eu-n', s), out = $('[data-eu=n]', s), NS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', 600); svg.setAttribute('height', 520); ring.appendChild(svg);
      var CX = 300, CY = 260;
      function pos(i, n) {
        var outer = n > 16 && i % 2 === 1, a = -Math.PI / 2 + i / n * Math.PI * 2;
        var rx = outer ? 268 : 196, ry = outer ? 236 : 168;
        return [CX + rx * Math.cos(a), CY + ry * Math.sin(a)];
      }
      s._draw = function (n, quiet) {
        out.textContent = n; inp.value = n;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        var have = $$('i', ring);
        for (var i = 0; i < n; i++) {
          var p = pos(i, n), el = have[i];
          if (!el) { el = document.createElement('i'); if (!quiet) el.className = 'is-new'; ring.appendChild(el); }
          el.style.left = p[0].toFixed(1) + 'px'; el.style.top = p[1].toFixed(1) + 'px';
          var l = document.createElementNS(NS, 'line');
          l.setAttribute('x1', CX); l.setAttribute('y1', CY); l.setAttribute('x2', p[0].toFixed(1)); l.setAttribute('y2', p[1].toFixed(1));
          svg.appendChild(l);
        }
        for (var j = n; j < have.length; j++) ring.removeChild(have[j]);
        if (!quiet) requestAnimationFrame(function () { requestAnimationFrame(function () { $$('i.is-new', ring).forEach(function (x) { x.classList.remove('is-new'); }); }); });
      };
      inp.addEventListener('input', function () { s._draw(+inp.value); });
      s._draw(25, true);
    },
    enter: function (ctx, s) {
      s._draw(1, true);
      var n = 1;
      ctx.after(500, function () { ctx.tween(1400, function (p) { var k = Math.max(1, Math.round(25 * p)); if (k !== n) { n = k; s._draw(k); } }, 'out'); });
    },
    settle: function (s) { s._draw(25, true); }
  });

  /* ---------------------------------------------------------------- 17 · open items: marked in the room, copied for the email */
  var KQ = 'bhdasia-odoo-scope:q', Q = store.get(KQ) || {};
  function qBtns() { return $$('[data-q]', stage); }
  function clean(el) { return el.textContent.replace(/\s+/g, ' ').trim(); }
  function paintQ() {
    var ok = 0, fu = 0;
    qBtns().forEach(function (b) {
      var v = Q[b.dataset.q] || '';
      if (v) b.dataset.s = v; else b.removeAttribute('data-s');
      b.setAttribute('aria-label', 'Item ' + b.dataset.q + (v === 'ok' ? ', settled' : v === 'fu' ? ', to follow up' : ', open'));
      if (v === 'ok') ok++; else if (v === 'fu') fu++;
    });
    var p = document.getElementById('open'); if (!p) return;
    $('[data-eq=ok]', p).textContent = ok; $('[data-eq=fu]', p).textContent = fu; $('[data-eq=open]', p).textContent = qBtns().length - ok - fu;
  }
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-q]'); if (!b) return;
    var id = b.dataset.q, v = Q[id] || '';
    Q[id] = v === '' ? 'ok' : v === 'ok' ? 'fu' : '';
    if (!Q[id]) delete Q[id];
    store.set(KQ, Q); paintQ();
  });
  function followUp() {
    var g = { fu: [], open: [], ok: [] };
    qBtns().forEach(function (b) {
      var v = Q[b.dataset.q] || 'open';
      g[v].push(b.dataset.q + '. ' + clean($('span', b)) + ' (' + clean($('.eq-o', b)) + ')');
    });
    var out = ['BHD Asia × TechNext: open items from the implementation scope review', ''];
    if (g.fu.length) out.push('To follow up (' + g.fu.length + ')', g.fu.join('\n'), '');
    if (g.open.length) out.push('Still open (' + g.open.length + ')', g.open.join('\n'), '');
    if (g.ok.length) out.push('Settled in the meeting (' + g.ok.length + ')', g.ok.join('\n'), '');
    out.push('Settled on 6 October: books in SGD on the Singapore chart of accounts (pricelists in USD, EUR, GBP and JPY); back-office access: full admin.', '');
    out.push('These hold the quotation, not the build.');
    return { text: out.join('\n').trim() + '\n', n: [g.fu.length, g.open.length] };
  }
  function copyOld(text) {
    var t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(t); return ok;
  }
  function copy(text) {
    return new Promise(function (res, rej) {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(res, function () { if (copyOld(text)) res(); else rej(); });
      else if (copyOld(text)) res(); else rej();
    });
  }
  Deck.on('open', {
    init: function (s) {
      var say = $('[data-eq=say]', s), say0 = say.textContent, clr = $('.eq-clear', s), clr0 = clr.innerHTML, armed = 0, out = $('.eq-outp', s), area = $('textarea', out);
      $('.eq-copy', s).addEventListener('click', function () {
        var f = followUp();
        copy(f.text).then(function () {
          say.classList.add('is-ok');
          say.textContent = 'Copied: ' + f.n[0] + ' to follow up and ' + f.n[1] + ' still open. Paste it into the follow-up email.';
        }, function () {
          say.classList.remove('is-ok'); say.textContent = 'Shown on the left, ready to copy.';
          out.hidden = false; area.value = f.text; area.focus(); area.select();
        });
      });
      $('.eq-x', s).addEventListener('click', function () { out.hidden = true; say.textContent = say0; });
      // two clicks, so a stray one never wipes the meeting's marks
      clr.addEventListener('click', function () {
        if (!armed) { armed = setTimeout(function () { armed = 0; clr.innerHTML = clr0; }, 3000); clr.textContent = 'Click again to clear every mark'; return; }
        clearTimeout(armed); armed = 0; clr.innerHTML = clr0;
        Object.keys(Q).forEach(function (k) { delete Q[k]; }); store.set(KQ, Q);
        paintQ(); say.classList.remove('is-ok'); say.textContent = say0;
      });
      paintQ();
    },
    settle: function () { paintQ(); }
  });
})();

/* AI vignettes: knowledge assistant (rag), AI inside Odoo (odoo), workflow agent (auto), chatbot (chat).
   AIDemo.play(host, kind, ctx, opts) animates one run inside host and resolves when it ends
   (AIDemo.STOP if another run replaced it). AIDemo.render(host, kind, opts) draws the finished state at once,
   for the overview and for print. Templates: _src/partials/ai-templates.html. All data is illustrative. */
(function () {
  'use strict';
  var STOP = { stopped: true };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return r.querySelector(s); }
  function $$(s, r) { return [].slice.call(r.querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var RAG = [
    { q: "What's our refund window for online orders?", docs: ['Returns policy.pdf', 'Customer terms.pdf', 'Delivery FAQ'], hits: [0, 1],
      a: ['Online orders can be refunded within 14 days of delivery, if the item is unused and in its original packaging.', 1, ' Refunds go back to the original payment method within 5 to 7 working days.', 2],
      cites: ['Returns policy · §2.1', 'Customer terms · p. 4'] },
    { q: 'How many days of annual leave do new staff get?', docs: ['Employee handbook.pdf', 'HR policy 2026.pdf', 'Onboarding checklist'], hits: [0, 1],
      a: ['New full-time staff get 14 days of annual leave in their first year, plus one day for each year of service.', 1, ' Leave is requested and approved in Odoo Time Off.', 2],
      cites: ['Employee handbook · §4.2', 'HR policy 2026 · p. 7'] },
    { q: 'What torque do we use on the M8 bolts on line 2?', docs: ['Line 2 work instructions.pdf', 'Maintenance manual.pdf', 'Quality checklist'], hits: [0, 2],
      a: ['Tighten the M8 bolts on line 2 to 25 N·m in a cross pattern, then paint-mark them.', 1, ' Each reading is logged on the work order during the quality check.', 2],
      cites: ['Line 2 work instructions · step 6', 'Quality checklist · item 3'] }
  ];
  var CHAT = [
    { me: true, t: 'Hi, do you deliver to Jurong West?' },
    { t: 'Yes. We deliver across Singapore, and orders placed before 2 pm go out the next working day.', src: 'Delivery FAQ' },
    { me: true, t: 'Can someone call me about a bulk order of 200 units?' },
    { t: "Of course. I've passed your request to our sales team with this conversation, and they'll call you today." },
    { hand: true }
  ];

  function kit(host, kind, ctx, fin) {
    var tok = (host._tok || 0) + 1; host._tok = tok;
    var tpl = document.getElementById('aiv-' + kind);
    host.innerHTML = ''; host.appendChild(tpl.content.cloneNode(true));
    var k = { el: host.firstElementChild, fin: !!fin, ctx: ctx };
    k.live = function () { return fin || (ctx.alive && host._tok === tok); };
    k.wait = function (ms) {
      if (fin) return Promise.resolve();
      return new Promise(function (res, rej) { ctx.after(ms, function () { if (k.live()) res(); else rej(STOP); }); });
    };
    k.type = function (node, text, speed) {
      if (fin || reduce) { node.textContent = text; return Promise.resolve(); }
      node.classList.add('aiv-caret');
      var i = 0;
      return (function tick() {
        i++; node.textContent = text.slice(0, i);
        if (i >= text.length) { node.classList.remove('aiv-caret'); return Promise.resolve(); }
        return k.wait(speed + (text[i - 1] === ' ' ? speed * .5 : 0)).then(tick);
      })();
    };
    k.on = function (node) { node.classList.add('is-on'); };
    return k;
  }

  /* ---------------------------------------------------------------- knowledge assistant */
  async function rag(k, o) {
    var d = RAG[o.qi || 0], el = k.el;
    var me = $('.aiv-me', el), q = $('[data-q]', el), docs = $('[data-docs]', el), a = $('[data-a]', el), cites = $('[data-cites]', el);
    var search = $('.aiv-search', el), bot = $('.aiv-bot', el);
    [me, search, bot].forEach(function (n) { n.setAttribute('data-show', ''); });
    docs.innerHTML = d.docs.map(function (x) { return '<i>' + esc(x) + '</i>'; }).join('');
    cites.innerHTML = d.cites.map(function (x, i) { return '<span>' + (i + 1) + ' · ' + esc(x) + '</span>'; }).join('');
    var cb = o.on || function () {};
    await k.wait(350); k.on(me); cb('ask');
    await k.type(q, d.q, 32);
    await k.wait(380); k.on(search); cb('search');
    var chips = $$('i', docs);
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.add('is-scan'); await k.wait(430);
      if (d.hits.indexOf(i) >= 0) chips[i].classList.add('is-hit');
    }
    await k.wait(250); k.on(bot); cb('answer');
    for (var j = 0; j < d.a.length; j++) {
      var part = d.a[j];
      if (typeof part === 'number') { a.insertAdjacentHTML('beforeend', '<sup>' + part + '</sup>'); await k.wait(160); continue; }
      var words = part.split(/(\s+)/);
      for (var w = 0; w < words.length; w++) { a.insertAdjacentText('beforeend', words[w]); if (words[w].trim()) await k.wait(62); }
    }
    var cs = $$('span', cites); cb('cite');
    for (var c = 0; c < cs.length; c++) { k.on(cs[c]); await k.wait(220); }
    await k.wait(o.hold || 3000); cb('done');
  }

  /* ---------------------------------------------------------------- AI inside Odoo: a vendor bill read, matched and approved */
  async function bill(k, o) {
    var el = k.el, scan = $('.ob-scan', el);
    await k.wait(450); if (!k.fin) scan.classList.add('is-on');
    await k.wait(650);
    var fs = $$('.ob-f', el);
    for (var i = 0; i < fs.length; i++) {
      var f = fs[i], sp = $('span', f);
      if (!k.fin) { f.classList.add('is-fill'); (function (f) { k.ctx.after(900, function () { f.classList.remove('is-fill'); }); })(f); }
      await k.type(sp, sp.dataset.v, 24);
      await k.wait(110);
    }
    await k.wait(300); k.on($('.ob-match', el));
    await k.wait(650);
    var gate = $('.ob-gate', el), btn = $('[data-approve]', el);
    k.on(gate); btn.classList.add('is-ready');
    if (!k.fin) {
      await new Promise(function (res, rej) {
        var done = false;
        function go() { if (done) return; done = true; res(); }
        btn.addEventListener('click', go, { once: true });
        if (o.auto !== false) k.ctx.after(o.approveAfter || 2000, function () { if (k.live()) go(); else rej(STOP); });
      });
      if (!k.live()) throw STOP;
    }
    btn.classList.remove('is-ready'); btn.classList.add('is-done'); $('span', btn).textContent = 'Approved'; gate.classList.add('is-done');
    await k.wait(420);
    $('[data-s=draft]', el).classList.remove('is-on'); $('[data-s=posted]', el).classList.add('is-on');
    $('[data-ref]', el).textContent = 'BILL/2026/09/0042';
    k.on($('.ob-log', el));
    await k.wait(o.hold || 3200);
  }

  /* ---------------------------------------------------------------- workflow agent */
  async function auto(k, o) {
    var el = k.el, ol = $('.au-steps', el), lis = $$('li', ol);
    await k.wait(550);
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i], r = $('small', li);
      li.classList.add('is-on'); ol.style.setProperty('--p', i / (lis.length - 1));
      await k.wait(320);
      if (li.classList.contains('au-gate') && !k.fin) {
        li.classList.add('is-wait'); await k.type(r, r.dataset.wait, 22); await k.wait(1500);
        li.classList.remove('is-wait'); r.textContent = '';
      }
      await k.type(r, r.dataset.r, 19);
      li.classList.add('is-done');
      await k.wait(420);
    }
    await k.wait(o.hold || 3000);
  }

  /* ---------------------------------------------------------------- chatbot: rows grow open so nothing jumps */
  function row(log, cls, html) {
    var r = document.createElement('div'); r.className = 'ch-row';
    r.innerHTML = '<div class="ch-clip"><div class="' + cls + '">' + html + '</div></div>';
    log.appendChild(r); r.b = r.firstChild.firstChild; return r;
  }
  async function chat(k, o) {
    var log = $('[data-log]', k.el);
    for (var i = 0; i < CHAT.length; i++) {
      var m = CHAT[i];
      if (m.hand) {
        var h = row(log, 'ch-hand', '<img class="oi" src="assets/img/odoo/crm.svg" alt=""><span><b>Handed to Sales</b><small>Lead created in Odoo CRM, with the chat attached</small></span>');
        await k.wait(30); h.classList.add('is-open'); k.on(h.b); continue;
      }
      var t = null;
      if (!m.me && !k.fin) {
        t = row(log, 'ch-m ch-typing', '<i></i><i></i><i></i>');
        await k.wait(30); t.classList.add('is-open'); k.on(t.b);
        await k.wait(1150);
      }
      var b = row(log, 'ch-m' + (m.me ? ' me' : ''), esc(m.t) + (m.src ? '<small>From: ' + esc(m.src) + '</small>' : ''));
      if (t) { t.classList.remove('is-open'); t.b.classList.remove('is-on'); (function (t) { k.ctx.after(600, function () { t.remove(); }); })(t); }
      await k.wait(30); b.classList.add('is-open'); k.on(b.b);
      await k.wait(m.me ? 1000 : 1400);
    }
    await k.wait(o.hold || 3200);
  }

  var RUN = { rag: rag, odoo: bill, auto: auto, chat: chat };
  window.AIDemo = {
    STOP: STOP, RAG: RAG,
    play: function (host, kind, ctx, opts) {
      var k = kit(host, kind, ctx, false);
      return RUN[kind](k, opts || {}).catch(function (e) { if (e !== STOP) console.error(e); return STOP; });
    },
    render: function (host, kind, opts) {
      var k = kit(host, kind, { alive: true, after: function () {} }, true);
      RUN[kind](k, opts || {});
    }
  };
})();

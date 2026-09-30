# -*- coding: utf-8 -*-
"""Build the TechNext HTML decks.

Sources live in _src/decks/*.html and are written to the repo root with these tokens expanded:
  {{head}}                      shared <head> tags (charset, viewport, noindex, fonts, favicons, deck.css)
  {{icon:name}}                 inline SVG from the technext.asia icon set (_src/icons.json)
  {{odoo:module}} / {{odoo:module:size}}   official Odoo app icon (assets/img/odoo/<module>.svg)
  {{qr:key}}                    inline SVG QR code for a known link (see QR below)
  {{seamap:W:H}}                dot-matrix land map of Southeast Asia, W x H, as SVG circles
  {{mapxy:key:W:H}}             x,y of an office on that map (sg, ph, vn), e.g. for an SVG transform
  {{phmap:W:H}}                 dot-matrix map of the Philippines (client proposals), W x H
  {{phxy:lon,lat:W:H}}          x,y of a place on that map; {{phpx:lon,lat:W:H}} gives --x/--y for HTML pins
  {{apps_json}}                 the Odoo app catalogue (assets/apps.json) inline, for scripts
  {{include:name}}              the contents of _src/partials/name.html
Run: python -B _src/build.py
"""
import json, pathlib, re, sys, io, secrets

import segno

SRC = pathlib.Path(__file__).parent
ROOT = SRC.parent
sys.path.insert(0, str(SRC))
from mapdots import map_svg  # noqa: E402

ICONS = json.loads((SRC / "icons.json").read_text(encoding="utf-8"))
APPS = json.loads((ROOT / "assets/apps.json").read_text(encoding="utf-8"))
ASSET_V = "11"
BASE = "https://technextsg.github.io/technext-presentations/"

QR = {
    "meet": "https://technext.odoo.com/book/c82cf8a9",
    "whatsapp": "https://wa.me/6588396998",
    "site": "https://technext.asia/",
    "odoo": "https://technext.asia/solutions/odoo-erp",
}
OFFICES = {"sg": (103.8519697, 1.2989163), "ph": (121.0509849, 14.5350092), "vn": (106.7121703, 10.8440075)}

HEAD = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#1E4691">
<link rel="icon" type="image/png" sizes="48x48" href="assets/img/favicon-48.png">
<link rel="icon" type="image/png" sizes="192x192" href="assets/img/favicon-192.png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap">
<link rel="stylesheet" href="assets/deck.css?v={v}">""".replace("{v}", ASSET_V)

_maps = {}

# The launcher (index.html) is generated from this list: a deck appears once its HTML is built.
# Slide counts come from the built file; the PDF button shows only when pdf/<name> exists.
DECKS = [
    ("About TechNext", [
        dict(slug="company-profile", title="Company profile", mins=10, pdf="TechNext-Company-Profile.pdf",
             alt="Company profile cover: We automate what slows you down.",
             desc="Who TechNext is: three offices on a live map, the three practices, the Odoo partnership, how an engagement runs, the four AI disciplines and the company details."),
        dict(slug="portfolio", title="Portfolio", mins=10, pdf="TechNext-Portfolio.pdf",
             alt="Portfolio cover: the clients TechNext has served.",
             desc="The clients we have served and what we built for each: websites, Odoo proposals and rollouts, social, video and brand work, on a map and client by client."),
    ]),
    ("What we build", [
        dict(slug="service-showcase", title="Service showcase", mins=15, pdf="TechNext-Service-Showcase.pdf",
             alt="Service showcase cover: What we build, and how it works.",
             desc="All fourteen services, each shown working: the implementation plan, a live CRM pipeline, multi-company Odoo, integrations with outages, and four AI demos."),
        dict(slug="marketing-showcase", title="Marketing showcase", mins=10, pdf="TechNext-Marketing-Showcase.pdf",
             alt="Marketing showcase cover: websites TechNext has built.",
             desc="Every live website we have built, and the concepts we have mocked up, with each full page scrolling in a browser and on a phone."),
    ]),
    ("Odoo", [
        dict(slug="what-is-odoo", title="What is Odoo?", mins=15, pdf="What-Is-Odoo.pdf",
             alt="What is Odoo cover: one suite of business apps on one database.",
             desc="Odoo explained from scratch, what's new in Odoo 20, then one order walked from lead to cash across six Odoo screens: CRM, Sales, Inventory, Invoicing, Accounting and Reporting."),
    ]),
    ("Sales proposals", [
        dict(slug="hitachi-elevator-ph", title="Hitachi Elevator Philippines", mins=25, pdf="TechNext-Proposal-Hitachi-Elevator-PH.pdf",
             alt="Proposal cover: keep every lift moving, and prove it.",
             desc="An Odoo 20 service core beside GERP: breakdown calls, field visits, documents and installations for Makati, Cebu and Cagayan de Oro. A discussion draft."),
    ]),
    ("Pricing", [
        dict(slug="erp-tiers", title="ERP tier list", mins=8, pdf="TechNext-ERP-Tier-List.pdf",
             alt="ERP tier list cover: four tiers, then add exactly what you need.",
             desc="Starter, Essentials, Growth and Enterprise for an Odoo rollout, eight add-ons, a which-tier-fits finder and a plan that turns into a quotation request."),
        dict(slug="marketing-tiers", title="Marketing tier list", mins=8, pdf="TechNext-Marketing-Tier-List.pdf",
             alt="Marketing tier list cover: four tiers to get you seen and booked.",
             desc="Starter, Launch, Growth and Brand for websites, social and brand, eight add-ons, a which-tier-fits finder and a plan that turns into a quotation request."),
    ]),
]
# ---------------------------------------------------------------- share links
# Each deck also builds as s-<token>.html: the same deck with no Home button and no links to the other decks,
# for sending one presentation on its own. Tokens live in _src/share.json; change one to retire its link.
SHARE_FILE = SRC / "share.json"
_share = {}


def share_tokens():
    if not _share:
        tok = json.loads(SHARE_FILE.read_text(encoding="utf-8")) if SHARE_FILE.exists() else {}
        new = [d["slug"] for _, ds in DECKS for d in ds if d["slug"] not in tok]
        for slug in new:
            tok[slug] = "".join(secrets.choice("abcdefghijkmnpqrstuvwxyz23456789") for _ in range(7))
        if new:
            SHARE_FILE.write_text(json.dumps(tok, indent=1) + "\n", encoding="utf-8")
        _share.update(tok)
    return _share


def share_copy(html, slug):
    """The shared copy of a built deck: no way back to the launcher, links to other decks (data-internal) removed."""
    name = f"s-{share_tokens()[slug]}.html"
    s = html.replace(' data-home="./"', " data-shared", 1)
    s = re.sub(r"<(p|a|div|li)\b[^>]*\bdata-internal\b[^>]*>.*?</\1>", "", s, flags=re.S)
    s = s.replace(f'<meta property="og:url" content="{BASE}{slug}.html">', f'<meta property="og:url" content="{BASE}{name}">')
    decks = "|".join(re.escape(d["slug"]) for _, ds in DECKS for d in ds)
    leak = re.findall(r'href="((?:\./|index\.html|(?:%s)\.html)[^"]*)"' % decks, s)
    if leak or "data-shared" not in s:
        sys.exit(f"{slug}: the shared copy still leads to {leak or 'the launcher'}: mark those links data-internal")
    return name, s


WORDS = {1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten"}


def launcher():
    groups, n = [], 0
    for gname, decks in DECKS:
        cards = []
        for d in decks:
            html = ROOT / (d["slug"] + ".html")
            if not html.exists():
                continue
            slides = len(re.findall(r'<section class="slide[ "]', html.read_text(encoding="utf-8")))
            th = f"assets/img/thumbs/{d['slug']}"
            second = (f'\n        <img class="ix-thumb-2" src="{th}-2.jpg" alt="" width="960" height="540" loading="lazy">' if (ROOT / f"{th}-2.jpg").exists() else "")
            pdf = (f'<a class="ix-btn ix-btn--t" href="pdf/{d["pdf"]}">{{{{icon:file}}}}PDF</a>' if (ROOT / "pdf" / d["pdf"]).exists() else "")
            share = (f'<button type="button" class="ix-btn ix-btn--t ix-share" data-share="{BASE}s-{share_tokens()[d["slug"]]}.html" data-title="{d["title"]}"'
                     f' aria-haspopup="dialog" aria-expanded="false">{{{{icon:link}}}}Share</button>')
            # PDF and Share sit beside Present and Kiosk loop, all on one row
            more = f'\n          <span class="ix-more">{pdf}{share}</span>'
            cards.append(f"""    <article class="ix-card">
      <a class="ix-thumb" href="{d['slug']}.html" aria-label="Open {d['title']}">
        <img src="{th}.jpg" alt="{d['alt']}" width="960" height="540">{second}
      </a>
      <div class="ix-body">
        <p class="ix-meta"><span>{slides} slides</span><span>about {d['mins']} minutes</span></p>
        <h3>{d['title']}</h3>
        <p>{d['desc']}</p>
        <div class="ix-acts">
          <a class="ix-btn ix-btn--p" href="{d['slug']}.html">Present</a>
          <a class="ix-btn" href="{d['slug']}.html?kiosk" aria-label="Kiosk loop">Kiosk<span class="ix-kl">&nbsp;loop</span></a>{more}
        </div>
      </div>
    </article>""")
            n += 1
        if cards:
            groups.append(f'  <section class="ix-group" aria-label="{gname}">\n    <h2 class="ix-gh">{gname}</h2>\n    <div class="ix-grid">\n' + "\n".join(cards) + "\n    </div>\n  </section>")
    return "\n".join(groups), n


def seamap(w, h):
    key = (w, h)
    if key not in _maps:
        _maps[key] = map_svg(w, h, step=0.42, r=2.1)
    return _maps[key]


WORLD_BOX = (-25.0, 155.0, -42.0, 66.0)   # Europe to Japan and Australia: where TechNext's clients are


PH_BOX = (116.6, 127.0, 4.5, 19.6)   # the Philippine archipelago, for client proposals


def phmap(w, h):
    key = ("ph", w, h)
    if key not in _maps:
        _maps[key] = map_svg(w, h, step=0.14, r=2.1, box=PH_BOX)
    return _maps[key]


def worldmap(w, h):
    key = ("w", w, h)
    if key not in _maps:
        _maps[key] = map_svg(w, h, step=1.6, r=2.6, box=WORLD_BOX)
    return _maps[key]


def qr_svg(key):
    q = segno.make(QR[key], error="m")
    buf = io.BytesIO()
    q.save(buf, kind="svg", scale=1, border=0, dark="#1F1F3D", light=None, xmldecl=False, svgns=True, nl=False, svgclass="qr", lineclass="qr-p", omitsize=True)
    s = buf.getvalue().decode("utf-8")
    return s.replace("<svg ", '<svg aria-hidden="true" preserveAspectRatio="xMidYMid meet" ', 1)


def icon(name):
    if name not in ICONS:
        raise KeyError("unknown icon: " + name)
    return ICONS[name]


def odoo(mod, size="40"):
    if not (ROOT / "assets/img/odoo" / (mod + ".svg")).exists():
        raise KeyError("unknown odoo app icon: " + mod)
    return f'<img class="oi" src="assets/img/odoo/{mod}.svg" alt="" width="{size}" height="{size}" style="width:{size}px;height:{size}px" loading="lazy" decoding="async">'



# ---------------------------------------------------------------- Marketing Showcase: slides generated from showcase_data + sites_meta
import html as _html
import showcase_data as SC


def _sm():
    p = SRC / "sites_meta.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


def _psrc(slug, kind):
    """The print crop of a page picture (assets/showcase.js swaps it in for ?print), when there is one."""
    return f' data-psrc="assets/img/sites/{slug}-{kind}p.jpg"' if kind + "p" in _sm().get(slug, {}) else ""


def _e(s):
    return _html.escape(s, quote=True)


PH_BAR = 28  # the phone's status bar (assets/showcase.css .ph-view::before): the page scrolls below it


def sc_feature(e, kind):
    M = _sm().get(e["slug"])
    if not M or "d" not in M:
        return ""
    slug = e["slug"]
    dw, dh = M["d"]; travel = max(0, dh - 560); dur = max(16, round(travel / 170 / .38))
    phone = ""
    if "m" in M:
        mw, mh = M["m"]; disp = mh * 238 / mw; tm = max(0, round(disp - (516 - PH_BAR))); durm = max(16, round(tm / 120 / .38))
        phone = ('<div class="ph"><div class="ph-view"><img class="scroller" data-src="assets/img/sites/' + slug + '-m.jpg"' + _psrc(slug, "m") + ' alt="" width="238" height="' + str(round(disp)) +
                 '" style="--travel:' + str(tm) + 'px;--dur:' + str(durm) + 's"></div></div>')
    chips = "".join('<span>{{icon:' + i + '}}' + _e(t) + '</span>' for i, t in e["chips"])
    meta = "".join('<li><span>' + _e(a) + '</span><b>' + _e(b) + '</b></li>' for a, b in e["meta"])
    label = "Visit the live site" if kind == "live" else "Open the concept"
    return f"""
<section class="slide" id="site-{slug}" data-title="{_e(e['name'])}">
  <div class="sf">
    <div class="sf-copy">
      <span class="kicker" data-in>{_e(e['kicker'])}</span>
      <h2 data-in style="--d:80ms">{_e(e['name'])}</h2>
      <a class="sf-dom" href="{e['url']}" target="_blank" rel="noopener" data-in style="--d:120ms">{{{{icon:globe}}}}{_e(e['dom'])}</a>
      <p data-in style="--d:160ms">{_e(e['what'])}</p>
      <div class="sf-chips" data-in style="--d:220ms">{chips}</div>
      <ul class="sf-meta" data-in style="--d:280ms">{meta}</ul>
      <div class="sf-acts" data-in style="--d:340ms"><a class="btn btn-primary" href="{e['url']}" target="_blank" rel="noopener">{label} {{{{icon:arrow}}}}</a></div>
    </div>
    <div class="sf-stage" data-i data-in data-fx="fade" style="--d:150ms">
      <div class="bw"><div class="bw-bar"><i></i><i></i><i></i><span class="bw-url">{{{{icon:lock}}}}{_e(e['dom'])}</span></div>
        <div class="bw-view"><img class="scroller" data-src="assets/img/sites/{slug}-d.jpg"{_psrc(slug, "d")} alt="{_e(e['name'])}: the full page" width="900" height="{dh}" style="--travel:{travel}px;--dur:{dur}s"></div></div>
      {phone}
      <p class="sf-hint">{{{{icon:search}}}}Each page scrolls on its own · hover to pause</p>
    </div>
  </div>
  <aside class="notes"><p>{_e(e['what'])}</p></aside>
</section>"""


def _tile_rows():
    M = _sm()
    rows = [(e["slug"], e["name"], "live", "Live site", "site-" + e["slug"], e["url"]) for e in SC.LIVE] + \
           [(e["slug"], e["name"], "concept", "Concept", "site-" + e["slug"], e["url"]) for e in SC.CONCEPTS] + \
           [(s, n, "concept", "Concept", "", u) for s, n, _, u in SC.MORE] + \
           [(s, n, "pitch", "Showcase" if k == "show" else "Proposal", "", u) for s, n, _, k, u in SC.PITCH]
    return [r for r in rows if r[0] in M]


def sc_tiles():
    rows = _tile_rows(); out = []
    for i, (slug, name, k, lab, go, url) in enumerate(rows):
        attr = f'data-go="{go}"' if go else f'data-url="{url}"'
        # 9 columns: the first tile at 2x2 makes 33 tiles fill four rows exactly
        big = " is-big" if i == 0 and (len(rows) + 3) % 9 == 0 else ""
        out.append(f'<button type="button" class="mz-t{big}" data-k="{k}" {attr} title="{_e(name)}"><img data-src="assets/img/sites/{slug}-top.jpg" alt="" width="480" height="270">'
                   f'<span class="mz-cap"><b>{_e(name)}</b><small>{lab}</small></span></button>')
    return "\n".join(out)


def sc_wall():
    M = _sm(); slugs = [e["slug"] for e in SC.LIVE + SC.CONCEPTS] + [s for s, *_ in SC.MORE] + [p[0] for p in SC.PITCH]
    slugs = [s for s in slugs if s in M]
    cols = [slugs[i::3] for i in range(3)]
    html = []
    for i, c in enumerate(cols):
        imgs = "".join(f'<img src="assets/img/sites/{s}-top.jpg" alt="" width="480" height="270" decoding="async">' for s in c)
        html.append(f'<div class="sw-col" style="--t:{64 + i * 9}s">{imgs}{imgs}</div>')
    return "".join(html)


def sc_cards(rows, view_h):
    M = _sm(); out = []
    for slug, name, sub, url in rows:
        if slug not in M or "w" not in M[slug]:
            continue
        ww, wh = M[slug]["w"]; card_w = 1; pan = 0
        out.append(f'<a class="cw-c" href="{url}" target="_blank" rel="noopener" data-h="{wh}"><div class="bw-bar"><i></i><i></i><i></i></div>'
                   f'<div class="cw-view" style="height:{view_h}px"><img data-src="assets/img/sites/{slug}-w.jpg"{_psrc(slug, "w")} alt="" width="480" height="{wh}"></div>'
                   f'<div class="cw-t"><b>{_e(name)}</b><small>{_e(sub)}</small></div></a>')
    return "\n".join(out)


def sc_expand(s):
    s = s.replace("{{sc:wall}}", sc_wall()).replace("{{sc:tiles}}", sc_tiles())
    kinds = [r[2] for r in _tile_rows()]
    for k in ("live", "concept", "pitch"):
        s = s.replace("{{sc:n:" + k + "}}", str(kinds.count(k)))
    s = s.replace("{{sc:live}}", "".join(sc_feature(e, "live") for e in SC.LIVE))
    s = s.replace("{{sc:concepts}}", "".join(sc_feature(e, "concept") for e in SC.CONCEPTS))
    s = s.replace("{{sc:more}}", sc_cards(SC.MORE, 150))
    s = s.replace("{{sc:pitch}}", sc_cards([(p[0], p[1], p[2], p[4]) for p in SC.PITCH], 120))
    return s


# ---------------------------------------------------------------- Portfolio: generated from portfolio_data (+ sites_meta for pictures)
import portfolio_data as PF


def _scroll(slug, W, H, kind="d"):
    """A page picture that scrolls inside a W x H window: the whole page, down and back up."""
    M = _sm().get(slug)
    if not M or kind not in M:
        return ""
    iw, ih = M[kind]; disp = ih * W / iw; travel = max(0, round(disp - (H - PH_BAR if kind == "m" else H))); dur = max(16, round(travel / (170 if kind == "d" else 120) / .38))
    return (f'<img class="scroller" data-src="assets/img/sites/{slug}-{kind}.jpg"{_psrc(slug, kind)} alt="" width="{W}" height="{round(disp)}" style="--travel:{travel}px;--dur:{dur}s">')


def _thumb(slug):
    return f'<img data-src="assets/img/sites/{slug}-top.jpg" alt="" width="480" height="270">' if slug in _sm() else ""


def pf_expand(s):
    import re as _re
    C = PF.CLIENTS
    # cover: rows of client names drifting past, between fainter rows of the work itself
    icon = dict(web="globe", leads="calendar", seo="search", social="play", odoo="layers", ai="bot", pitch="layout", brand="sparkle")

    def crow(r, t):
        spans = "".join(f'<span><i style="background:#fff;color:{c["c"]}">{c["mono"]}</i>{_e(c["name"])}</span>' for c in r)
        return f'<div class="mq-row" style="--t:{t}s">{spans * 4}</div>'

    def srow(order, t):
        spans = "".join('<span><i>{{icon:' + icon[k] + '}}</i>' + _e(lab) + '</span>' for k, lab in order)
        return f'<div class="mq-row is-svc" style="--t:{t}s">{spans * 4}</div>'
    S = PF.SERVICES
    mq = [crow(C[0::3], 58), srow(S, 84), crow(C[1::3], 66), srow(S[4:] + S[:4], 92), crow(C[2::3], 74)]
    s = s.replace("{{pf:marquee}}", "".join(mq))
    # the map
    _, project, _ = worldmap(1000, 600)
    pins = []
    for key, lon, lat, country, names, solid, side in PF.PINS:
        x, y = project(lon, lat)
        cls = "pm-pin" + ("" if solid else " is-hollow") + {"l": " is-l", "t": " is-t", "b": " is-b"}.get(side, "")
        pins.append(f'<div class="{cls}" style="--px:{x:.1f}px;--py:{y:.1f}px;--d:{len(pins) * .4:.1f}s"><i></i><b>{_e(country)}<small>{_e(names)}</small></b></div>')
    s = s.replace("{{pf:pins}}", "".join(pins))
    # directory cards + data for the detail panel
    cards = []
    for c in C:
        tags = " ".join(k for k, v in c["svc"].items() if v)
        cards.append(f'<button type="button" class="pf-c" data-slug="{c["slug"]}" data-svc="{tags}" data-status="{c["status"]}" aria-pressed="false">'
                     f'<span class="pf-mono" style="--c:{c["c"]}">{c["mono"]}</span><span><b>{_e(c["name"])}</b><small>{_e(c["ind"])} · {_e(c["where"])}</small></span></button>')
    s = s.replace("{{pf:cards}}", "\n".join(cards))
    data = [dict(slug=c["slug"], name=c["name"], mono=c["mono"], c=c["c"], ind=c["ind"], where=c["where"], status=PF.STATUS[c["status"]],
                 svc=[lab for k, lab in PF.SERVICES if c["svc"].get(k)], did=c["did"], links=c["links"]) for c in C]
    s = s.replace("{{pf:data}}", json.dumps(data, ensure_ascii=False))
    s = _re.sub(r"\{\{scroll:([a-z0-9-]+):(\d+):(\d+)(?::([dm]))?\}\}", lambda m: _scroll(m.group(1), int(m.group(2)), int(m.group(3)), m.group(4) or "d"), s)
    s = _re.sub(r"\{\{thumb:([a-z0-9-]+)\}\}", lambda m: _thumb(m.group(1)), s)
    return s


def og(s, name, page):
    """Open Graph tags from the page's own <title> and description, with the deck's cover as the image."""
    t = re.search(r"<title>(.*?)</title>", s).group(1)
    d = re.search(r'<meta name="description" content="(.*?)">', s).group(1)
    url = BASE + ("" if page == "index.html" else page)
    return (f'<meta property="og:type" content="website">\n<meta property="og:site_name" content="TechNext">\n'
            f'<meta property="og:title" content="{t}">\n<meta property="og:description" content="{d}">\n'
            f'<meta property="og:url" content="{url}">\n<meta property="og:image" content="{BASE}assets/img/thumbs/{name}-og.jpg">\n'
            f'<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">')


def expand(s, page=""):
    s = re.sub(r"\{\{og:([a-z-]+)\}\}", lambda m: og(s, m.group(1), page), s)
    if "{{sc:" in s:
        s = sc_expand(s)
    if "{{pf:" in s or "{{scroll:" in s or "{{thumb:" in s:
        s = pf_expand(s)
    for _ in range(3):   # partials may include partials
        s = re.sub(r"\{\{include:([a-z0-9_-]+)\}\}", lambda m: (SRC / "partials" / (m.group(1) + ".html")).read_text(encoding="utf-8"), s)
    s = s.replace("{{head}}", HEAD).replace("{{v}}", ASSET_V)
    s = s.replace("{{apps_json}}", json.dumps(APPS, ensure_ascii=False, separators=(",", ":")))
    s = re.sub(r"\{\{icon:([a-z0-9_-]+)\}\}", lambda m: icon(m.group(1)), s)
    s = re.sub(r"\{\{odoo:([a-z0-9_]+)(?::(\d+))?\}\}", lambda m: odoo(m.group(1), m.group(2) or "40"), s)
    s = re.sub(r"\{\{qr:([a-z]+)\}\}", lambda m: qr_svg(m.group(1)), s)
    s = re.sub(r"\{\{seamap:(\d+):(\d+)\}\}", lambda m: seamap(int(m.group(1)), int(m.group(2)))[0], s)
    s = re.sub(r"\{\{worldmap:(\d+):(\d+)\}\}", lambda m: worldmap(int(m.group(1)), int(m.group(2)))[0], s)
    s = re.sub(r"\{\{phmap:(\d+):(\d+)\}\}", lambda m: phmap(int(m.group(1)), int(m.group(2)))[0], s)

    def phxy(m, css=False):
        _, project, _ = phmap(int(m.group(3)), int(m.group(4)))
        x, y = project(float(m.group(1)), float(m.group(2)))
        return f"--x:{x:.1f}px;--y:{y:.1f}px" if css else f"{x:.1f},{y:.1f}"
    s = re.sub(r"\{\{phxy:(-?[\d.]+),(-?[\d.]+):(\d+):(\d+)\}\}", phxy, s)
    s = re.sub(r"\{\{phpx:(-?[\d.]+),(-?[\d.]+):(\d+):(\d+)\}\}", lambda m: phxy(m, True), s)

    def worldxy(m):
        _, project, _ = worldmap(int(m.group(3)), int(m.group(4)))
        x, y = project(float(m.group(1)), float(m.group(2)))
        return f"{x:.1f},{y:.1f}"
    s = re.sub(r"\{\{worldxy:(-?[\d.]+),(-?[\d.]+):(\d+):(\d+)\}\}", worldxy, s)

    def mapxy(m):
        _, project, _ = seamap(int(m.group(2)), int(m.group(3)))
        x, y = project(*OFFICES[m.group(1)])
        return f"{x:.1f},{y:.1f}"
    s = re.sub(r"\{\{mapxy:([a-z]+):(\d+):(\d+)\}\}", mapxy, s)
    left = re.findall(r"\{\{[^}]*\}\}", s)
    if left:
        raise ValueError("unexpanded tokens: " + ", ".join(sorted(set(left))[:10]))
    return s


def main():
    out = []
    # decks first, the launcher last (it reads the built decks)
    for p in sorted((SRC / "decks").glob("*.html"), key=lambda p: p.name == "index.html"):
        src = p.read_text(encoding="utf-8")
        if "{{launcher}}" in src:
            cards, n = launcher()
            src = src.replace("{{launcher}}", cards).replace("{{deck_count}}", WORDS.get(n, str(n)))
        html = expand(src, p.name)
        (ROOT / p.name).write_text(html, encoding="utf-8", newline="\n")
        out.append((p.name, len(html)))
        if p.stem in share_tokens():
            name, shared = share_copy(html, p.stem)
            (ROOT / name).write_text(shared, encoding="utf-8", newline="\n")
    live = {f"s-{t}.html" for t in share_tokens().values()}
    for old in ROOT.glob("s-*.html"):
        if old.name not in live:
            old.unlink(); print("  retired share link", old.name)
    for name, n in out:
        print(f"  {name:28s} {n/1024:7.1f} KB")
    sites_check("--prune" in sys.argv)


def sites_check(prune):
    """Site pictures: fail on a missing one; with --prune, delete the variants no deck uses
       (_src/sites_images.py writes every variant for every site)."""
    ref = set()
    for f in list(ROOT.glob("*.html")) + list((ROOT / "assets").glob("*.js")):
        ref |= set(re.findall(r"assets/img/sites/([a-z0-9-]+\.jpg)", f.read_text(encoding="utf-8")))
    have = {p.name: p for p in (ROOT / "assets/img/sites").glob("*.jpg")}
    missing = sorted(ref - set(have))
    if missing:
        sys.exit("missing site pictures (re-run _src/sites_images.py): " + ", ".join(missing))
    unused = sorted(set(have) - ref)
    if prune:
        for n in unused:
            have[n].unlink()
        print(f"  site pictures: {len(ref)} used, {len(unused)} unused deleted")
    elif unused:
        print(f"  site pictures: {len(ref)} used, {len(unused)} unused (build.py --prune deletes them)")


if __name__ == "__main__":
    main()

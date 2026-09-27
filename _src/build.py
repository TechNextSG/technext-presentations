# -*- coding: utf-8 -*-
"""Build the TechNext HTML decks.

Sources live in _src/decks/*.html and are written to the repo root with these tokens expanded:
  {{head}}                      shared <head> tags (charset, viewport, noindex, fonts, favicons, deck.css)
  {{icon:name}}                 inline SVG from the technext.asia icon set (_src/icons.json)
  {{odoo:module}} / {{odoo:module:size}}   official Odoo app icon (assets/img/odoo/<module>.svg)
  {{qr:key}}                    inline SVG QR code for a known link (see QR below)
  {{seamap:W:H}}                dot-matrix land map of Southeast Asia, W x H, as SVG circles
  {{mapxy:key:W:H}}             x,y of an office on that map (sg, ph, vn), e.g. for an SVG transform
  {{apps_json}}                 the Odoo app catalogue (assets/apps.json) inline, for scripts
  {{include:name}}              the contents of _src/partials/name.html
Run: python -B _src/build.py
"""
import json, pathlib, re, sys, io

import segno

SRC = pathlib.Path(__file__).parent
ROOT = SRC.parent
sys.path.insert(0, str(SRC))
from mapdots import map_svg  # noqa: E402

ICONS = json.loads((SRC / "icons.json").read_text(encoding="utf-8"))
APPS = json.loads((ROOT / "assets/apps.json").read_text(encoding="utf-8"))
ASSET_V = "2"
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
             desc="Odoo explained from scratch, then one order walked from lead to cash across six Odoo screens: CRM, Sales, Inventory, Invoicing, Accounting and Reporting."),
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
            pdf = (f'\n          <a class="ix-btn ix-btn--t" href="pdf/{d["pdf"]}">PDF</a>' if (ROOT / "pdf" / d["pdf"]).exists() else "")
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
          <a class="ix-btn" href="{d['slug']}.html?kiosk">Kiosk loop</a>{pdf}
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
    for _ in range(3):   # partials may include partials
        s = re.sub(r"\{\{include:([a-z0-9_-]+)\}\}", lambda m: (SRC / "partials" / (m.group(1) + ".html")).read_text(encoding="utf-8"), s)
    s = s.replace("{{head}}", HEAD).replace("{{v}}", ASSET_V)
    s = s.replace("{{apps_json}}", json.dumps(APPS, ensure_ascii=False, separators=(",", ":")))
    s = re.sub(r"\{\{icon:([a-z0-9_-]+)\}\}", lambda m: icon(m.group(1)), s)
    s = re.sub(r"\{\{odoo:([a-z0-9_]+)(?::(\d+))?\}\}", lambda m: odoo(m.group(1), m.group(2) or "40"), s)
    s = re.sub(r"\{\{qr:([a-z]+)\}\}", lambda m: qr_svg(m.group(1)), s)
    s = re.sub(r"\{\{seamap:(\d+):(\d+)\}\}", lambda m: seamap(int(m.group(1)), int(m.group(2)))[0], s)
    s = re.sub(r"\{\{worldmap:(\d+):(\d+)\}\}", lambda m: worldmap(int(m.group(1)), int(m.group(2)))[0], s)

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
    for name, n in out:
        print(f"  {name:28s} {n/1024:7.1f} KB")


if __name__ == "__main__":
    main()

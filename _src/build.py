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


def seamap(w, h):
    key = (w, h)
    if key not in _maps:
        _maps[key] = map_svg(w, h, step=0.42, r=2.1)
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
    for p in sorted((SRC / "decks").glob("*.html")):
        html = expand(p.read_text(encoding="utf-8"), p.name)
        (ROOT / p.name).write_text(html, encoding="utf-8", newline="\n")
        out.append((p.name, len(html)))
    for name, n in out:
        print(f"  {name:28s} {n/1024:7.1f} KB")


if __name__ == "__main__":
    main()

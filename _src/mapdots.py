# -*- coding: utf-8 -*-
"""Dot-matrix map of Southeast Asia from Natural Earth land (world-atlas land-50m TopoJSON).

map_svg(w, h) returns (svg_group_markup, project) where project(lon, lat) -> (x, y) in the same box.
"""
import json, pathlib

HERE = pathlib.Path(__file__).parent
BOX = (92.0, 128.0, -9.0, 23.5)          # lon0, lon1, lat0, lat1


def _rings():
    t = json.loads((HERE / "land-50m.json").read_text(encoding="utf-8"))
    sx, sy = t["transform"]["scale"]; tx, ty = t["transform"]["translate"]
    arcs = []
    for a in t["arcs"]:
        x = y = 0; pts = []
        for dx, dy in a:
            x += dx; y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)

    def arc(i):
        return arcs[i] if i >= 0 else arcs[~i][::-1]

    out = []
    for g in t["objects"]["land"]["geometries"]:
        polys = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]
        for poly in polys:
            for ring in poly:
                pts = []
                for i in ring:
                    seg = arc(i)
                    pts.extend(seg if not pts else seg[1:])
                xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
                if max(xs) < BOX[0] - 2 or min(xs) > BOX[1] + 2 or max(ys) < BOX[2] - 2 or min(ys) > BOX[3] + 2:
                    continue
                out.append((pts, (min(xs), max(xs), min(ys), max(ys))))
    return out


def _inside(x, y, rings):
    c = False
    for pts, (x0, x1, y0, y1) in rings:
        if x < x0 or x > x1 or y < y0 or y > y1:
            continue
        j = len(pts) - 1
        for i in range(len(pts)):
            xi, yi = pts[i]; xj, yj = pts[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                c = not c
            j = i
    return c


def map_svg(w, h, step=0.5, r=2.3):
    lon0, lon1, lat0, lat1 = BOX
    kx = w / (lon1 - lon0); ky = h / (lat1 - lat0)
    k = min(kx, ky)
    ox = (w - (lon1 - lon0) * k) / 2; oy = (h - (lat1 - lat0) * k) / 2

    def project(lon, lat):
        return (ox + (lon - lon0) * k, oy + (lat1 - lat) * k)

    rings = _rings()
    dots = []
    lat = lat1
    while lat >= lat0:
        lon = lon0
        while lon <= lon1:
            if _inside(lon, lat, rings):
                x, y = project(lon, lat)
                dots.append(f"M{x:.1f} {y:.1f}h.01")
            lon += step
        lat -= step
    # one path of zero-length round-capped segments: a dot per land cell, a fraction of the size of <circle>s
    return f'<path d="{"".join(dots)}" stroke-width="{r * 2:.1f}" stroke-linecap="round"/>', project, len(dots)


if __name__ == "__main__":
    g, p, n = map_svg(900, 800)
    print(n, "dots;", "SG", p(103.85, 1.29), "PH", p(121.05, 14.535), "VN", p(106.712, 10.844))

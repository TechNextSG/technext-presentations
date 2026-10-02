# -*- coding: utf-8 -*-
"""Turn full-page captures (<slug>-d.jpg desktop 1440 wide, <slug>-m.jpg phone 390 wide) into deck images:
   <slug>-top.jpg  16:9 top of the desktop page, 480 wide (mosaic, cover wall)
   <slug>-w.jpg    desktop page 480 wide, capped (hover-pan cards)
   <slug>-d.jpg    desktop page 900 wide, capped (browser frame)
   <slug>-m.jpg    phone page 357 wide (1.5x for a 238 px screen), capped
   <slug>-dp.jpg, -mp.jpg, -wp.jpg   the top of -d, -m and -w only, for print (a PDF shows each page from the top)
   and merge every image's size into _src/sites_meta.json (a recapture of a few sites keeps the others).
   python -B _src/sites_images.py <capture dir>"""
import json, pathlib, sys
from PIL import Image

SRC = pathlib.Path(__file__).parent
OUT = SRC.parent / "assets/img/sites"


def save(im, path, q):
    im.convert("RGB").save(path, quality=q, optimize=True, progressive=True)
    return im.size


# print crops: the browser frame shows 560 px of a 900 px page, the phone 488 of 238 (357 at 1.5x), a card about 150 of 262
PRINT_H = {"d": 580, "m": 760, "w": 320}


def crop_top(im, h):
    return im.crop((0, 0, im.width, min(im.height, h)))


def main(cap):
    cap = pathlib.Path(cap); OUT.mkdir(parents=True, exist_ok=True)
    mp_ = SRC / "sites_meta.json"
    meta = json.loads(mp_.read_text(encoding="utf-8")) if mp_.exists() else {}
    for d in sorted(cap.glob("*-d.jpg")):
        slug = d.name[:-6]
        im = Image.open(d); w, h = im.size
        top = im.crop((0, 0, w, min(h, round(w * 9 / 16)))).resize((480, 270), Image.LANCZOS)
        m = {"top": save(top, OUT / f"{slug}-top.jpg", 76)}
        k = 480 / w; ww = im.resize((480, round(h * k)), Image.LANCZOS)
        ww = ww.crop((0, 0, 480, min(ww.height, 1900)))
        m["w"] = save(ww, OUT / f"{slug}-w.jpg", 70)
        m["wp"] = save(crop_top(ww, PRINT_H["w"]), OUT / f"{slug}-wp.jpg", 72)
        k = 900 / w; dd = im.resize((900, round(h * k)), Image.LANCZOS)
        dd = dd.crop((0, 0, 900, min(dd.height, 3300)))
        m["d"] = save(dd, OUT / f"{slug}-d.jpg", 70)
        m["dp"] = save(crop_top(dd, PRINT_H["d"]), OUT / f"{slug}-dp.jpg", 72)
        mp = cap / f"{slug}-m.jpg"
        if mp.exists():
            mi = Image.open(mp); k = 357 / mi.width
            mm = mi.resize((357, round(mi.height * k)), Image.LANCZOS)
            mm = mm.crop((0, 0, 357, min(mm.height, 4200)))
            m["m"] = save(mm, OUT / f"{slug}-m.jpg", 70)
            m["mp"] = save(crop_top(mm, PRINT_H["m"]), OUT / f"{slug}-mp.jpg", 72)
        meta[slug] = m
    (SRC / "sites_meta.json").write_text(json.dumps(meta, indent=1), encoding="utf-8")
    total = sum(p.stat().st_size for p in OUT.glob("*.jpg"))
    print(len(meta), "sites in sites_meta.json,", round(total / 1048576, 2), "MB")


if __name__ == "__main__":
    main(sys.argv[1])

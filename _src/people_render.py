# -*- coding: utf-8 -*-
"""HTML for the people slides, from people_data.PEOPLE. build.py calls people_expand() for these tokens:

  {{people:Count}} / {{people:count}}   the number of people in words (Six / six)
  {{people:cards}}     talent deck, slide "people": one flip card per person
  {{people:cover}}     People deck, cover: one initials disc per person, orbiting the plane
  {{people:roster}}    People deck, slide "team": the people grouped by office
  {{people:profiles}}  People deck: one profile slide per person (ids p-<first name>)

No pronouns for people anywhere in this copy; no contact details; no companies. A person's photo, when it exists, is
people_data photo = "file.jpg" in assets/img/team/ (square JPEG): the avatar then shows it instead of the initials.
"""
import html
import re

import people_data as D

P = D.PEOPLE


def e(s):
    return html.escape(s, quote=True)


def av(p, size, extra=""):
    """The avatar: initials on a blue disc inside a dashed ring (the photo slot), or the photo once there is one."""
    st = f' style="--s:{size}px"'
    if p.get("photo"):
        return (f'<span class="pp-av has-photo{extra}"{st}><img src="assets/img/team/{p["photo"]}?v={{{{v}}}}" alt="" width="{size}" height="{size}"></span>')
    return f'<span class="pp-av{extra}"{st} aria-hidden="true"><b>{e(p["initials"])}</b><i class="pp-cam">{{{{icon:camera}}}}</i></span>'


def n_skills(p):
    return sum(len(s) for _, s in p["groups"])


def count_attrs(v):
    """A figure that can count up: whole numbers with an optional thousands comma and a trailing +. Years stay still."""
    m = re.fullmatch(r"(\d[\d,]*)(\+?)", v)
    if not m:
        return ""
    n = int(m.group(1).replace(",", ""))
    if 1900 <= n <= 2100 and "," not in v:
        return ""
    return f' data-to="{n}"' + (' data-suf="+"' if m.group(2) else "")


def office_of(p):
    """The office label, or None when the profile gives no office (nothing is shown then)."""
    return D.OFFICES.get(p["office"]) if p.get("office") else None


def group_pills(p, width=290, rows=2, fs=12):
    """Group names as pills: as many as fit in `rows` rows (long names wrap), then a "+N more" pill."""
    labels = [g for g, _ in p["groups"]]

    def pw(t):
        return _tw(t, fs) * 1.1 + 20

    def rows_of(w):          # a pill wider than the row wraps inside itself
        return 1 if w <= width else int(-(-w // (width - 24)))

    def used(items):
        n, x = 1, 0
        for w in items:
            if w > width:
                n, x = (n if x == 0 else n + 1) + rows_of(w) - 1, width
                continue
            if x and x + w > width:
                n, x = n + 1, 0
            x += w + 5
        return n
    shown = 1
    for k in range(len(labels)):
        items = [pw(g) for g in labels[:k + 1]]
        rem = len(labels) - k - 1
        if rem:
            items.append(pw(f"+{rem} more"))
        if used(items) <= rows:
            shown = k + 1
        else:
            break
    more = len(labels) - shown
    if shown == 1 and more and pw(labels[0]) > width:   # one long name: fold the count into it instead of adding a row
        return f"<i>{e(labels[0])} <u>+{more}</u></i>"
    return "".join(f"<i>{e(g)}</i>" for g in labels[:shown]) + (f'<i class="is-more">+{more} more</i>' if more > 0 else "")


# ---------------------------------------------------------------- talent deck: flip cards
def cards():
    out = []
    for i, p in enumerate(P):
        off = office_of(p)
        v0, l0 = p["stats"][0]
        stats = "".join(f'<span class="ta-pc-bs"><b>{e(sv)}</b><small>{e(sl)}</small></span>' for sv, sl in p["stats"])
        back = ""
        for g, sk in p["groups"][:1]:
            extra = len(sk) - 3
            back += (f'<span class="ta-pc-row"><small>{e(g)}</small><em>{e(" · ".join(sk[:3]))}'
                     + (f' <u>+{extra}</u>' if extra > 0 else "") + "</em></span>")
        rest = len(p["groups"]) - 1
        if rest > 0:
            back += f'<span class="ta-pc-row ta-pc-rest"><em><u>+{rest} more group{"s" if rest > 1 else ""}</u></em></span>'
        pill = f'<span class="ta-pc-off">{{{{icon:pin}}}}{e(off)}</span>' if off else ""
        sub = e(p["role"]) + (f" · {e(off)}" if off else "")
        out.append(
            f'<button type="button" class="ta-pc" data-in data-fx="land" style="--d:{160 + i * 50}ms" aria-pressed="false" data-p="{p["slug"]}">'
            f'<span class="ta-pc-in">'
            f'<span class="ta-pc-f">'
            f'<span class="ta-pc-top">{av(p, 68)}<span class="ta-pc-id"><b class="ta-pc-name">{e(p["name"])}</b>'
            f'<span class="ta-pc-role">{e(p["role"])}</span>{pill}</span></span>'
            f'<span class="ta-pc-line">{e(p["line"])}</span>'
            f'<span class="ta-pc-tags">{group_pills(p)}</span>'
            f'<span class="ta-pc-st"><b>{e(v0)}</b><em>{e(l0)}</em></span>'
            f'</span>'
            f'<span class="ta-pc-b">'
            f'<span class="ta-pc-bh">{e(p["name"])}<small>{sub}</small></span>'
            f'<span class="ta-pc-bstats">{stats}</span>'
            f'{back}'
            f'</span>'
            f'</span></button>')
    return "\n    ".join(out)


# ---------------------------------------------------------------- People deck: cover
def cover():
    return "\n      ".join(
        f'<span class="pe-cv-p">{av(p, 92)}<b>{e(p["name"])}</b><small>{e(p["role"])}</small></span>' for p in P)


# ---------------------------------------------------------------- People deck: roster by office
def roster():
    out = []
    d = 150
    for p in P:
        off = office_of(p)
        pill = f'<span class="pe-rc-off">{{{{icon:pin}}}}{e(off)}</span>' if off else ""
        out.append(
            f'<button type="button" class="pe-rc" data-go="p-{p["slug"]}" data-o="{p.get("office") or ""}" data-in style="--d:{d}ms">'
            f'<span class="pe-rc-top">{av(p, 64)}<span class="pe-rc-id"><b class="pe-rc-name">{e(p["name"])}</b>'
            f'<span class="pe-rc-role">{e(p["role"])}</span>{pill}</span></span>'
            f'<span class="pe-rc-line">{e(p["line"])}</span>'
            f'<span class="pe-rc-groups">{group_pills(p)}</span>'
            f'<span class="pe-rc-n">{n_skills(p)} skills in {len(p["groups"])} groups{{{{icon:arrow}}}}</span>'
            f'</button>')
        d += 45
    return "\n    ".join(out)


# ---------------------------------------------------------------- People deck: profile slides
NOTES = {
    "clement": "Open on the range: strategy for Singapore regional headquarters, then automation and digital twins, then people and set-up. The figures (1,000+ staff hired and trained, a 724-staff BPO set-up, 10+ network projects) come from the profile sent on 22 October 2026. Check each figure with Clement before it is quoted anywhere else.",
    "pia": "Open on the one line: strategy turned into structure, plans and KPIs. The five groups run from organisational design and planning to governance and management systems. The profile gives no office, so none is shown, and the two figures (5 areas, 23 skills) are counts of the groups and skills on the slide. Details from the profile sent on 22 October 2026.",
    "rico": "Marketing end to end: website design and SEO, AI in the content workflow, brand and design, social media, email. Since 2019 in social media, 15 digital and AI tools and 5 social accounts at once come from the profile sent on 22 October 2026. Tools are named as skills only.",
    "astroneil": "Start with the two numbers: 24 years in ERP and CRM, and 10 years on Odoo. The groups then answer one question: who leads the discovery workshops and the process redesign, and who plans the data migration. Use the Industries row if the room names a sector. Figures and lists from the profile sent on 22 October 2026; the platforms are shown as skills only.",
    "rj": "The ERP years are the point: 17 years across Dynamics, Oracle and NetSuite, with the BIR and mall POS accreditation work on top. Use the groups to answer one question: who writes the scope, and who keeps the sprint on target. Figures from the CV sent on 22 October 2026.",
    "philip": "The densest profile: 66 skills in nine groups. Do not read the list out. Pick the group the room cares about (Odoo itself, integrations, or deployment) and click it to dim the rest. Skill list as sent on 22 October 2026; no credentials were supplied, so none are shown.",
    "aj": "Start with the work for Odoo clients: solution design, needs analysis, support and maintenance, and training for partner teams. The development stack is Python, JavaScript and PostgreSQL. Details from the CV sent on 22 October 2026.",
    "jeric": "B2B solution selling since 2016: pipeline management, lead generation, outbound prospecting, online demos and key-account care. The systems listed are skills only, shown without any employer. From the CV sent on 22 October 2026.",
}


# Inter advance widths (1000 em) for ASCII 32..126, read from assets/fonts/inter-latin.woff2: the column split below needs
# real text widths so that the two columns of a long skill list come out the same height.
_W = [281,288,466,633,642,982,644,300,365,365,501,662,288,460,288,360,631,407,610,618,646,593,620,566,619,620,288,302,662,662,662,511,966,690,654,730,722,601,590,746,743,269,571,672,565,903,753,765,639,765,644,642,646,744,690,985,682,679,629,365,360,365,471,456,323,562,612,571,612,583,370,613,591,242,242,549,242,876,591,600,612,612,376,528,327,591,562,818,546,562,552,426,333,426,662]


def _tw(s, fs):
    return sum(_W[ord(c) - 32] if 32 <= ord(c) < 127 else 600 for c in s) / 1000 * fs * 1.03


def _block(chips, width, fs=13.5, pad=8, extra=0, gap=4):
    """Estimated height in px of one skill group block (label + wrapped chips) in a column `width` px wide."""
    n, x = 1, 0
    for c in chips:
        cw = _tw(c, fs) + 2 * pad + 2 + extra
        if cw > width:
            n, x, cw = n + 1, 0, width
        if x and x + cw > width:
            n, x = n + 1, 0
        x += cw + gap
    return 36 + n * (fs * 1.15 + 8 + 2 + gap) - gap


def _split(heights, gap=8):
    """Assign the ordered blocks to two columns of the most even height (order kept inside each column)."""
    n, best, pick = len(heights), None, None
    for mask in range(1 << (n - 1)):          # block 0 always in column A
        a = [i for i in range(n) if i == 0 or mask >> (i - 1) & 1]
        b = [i for i in range(n) if i not in a]
        ha = sum(heights[i] for i in a) + gap * (len(a) - 1)
        hb = sum(heights[i] for i in b) + gap * max(0, len(b) - 1)
        key = (max(ha, hb), 0 if a == list(range(len(a))) else 1)   # prefer the plain first-n split on a tie
        if best is None or key < best:
            best, pick = key, (a, b)
    return pick


def _cols_est(p, fs, pad):
    """Estimated height of the taller of the two skill columns at this chip size."""
    hs = [_block(sk, 394, fs, pad) for _, sk in p["groups"]]
    if p["creds"]:
        hs.append(_block(p["creds"], 394, fs, pad, extra=20))
    ia, ib = _split(hs)
    return max(sum(hs[i] for i in ia) + 8 * (len(ia) - 1), sum(hs[i] for i in ib) + 8 * max(0, len(ib) - 1))


def profile(i, p):
    off = office_of(p)
    n = n_skills(p)
    total = n + len(p["creds"])
    mode = "cols" if total > 30 else ("m" if total > 20 else "s")
    fs, pad = 15, 10
    if mode == "cols" and _cols_est(p, 15, 10) > 570:     # the longest lists get the smallest chips
        fs, pad = 13.5, 8
    stats = "".join(
        f'<div class="pe-st" data-in style="--d:{300 + k * 70}ms"><b{count_attrs(v)}>{e(v)}</b><span>{e(l)}</span></div>'
        for k, (v, l) in enumerate(p["stats"]))
    blocks, heights = [], []
    d = 200
    for g, sk in p["groups"]:
        chips = "".join(f"<i>{e(s)}</i>" for s in sk)
        blocks.append(f'<button type="button" class="pe-g" aria-pressed="false" data-in style="--d:{d}ms"><b class="pe-g-l">{e(g)}</b><span class="pe-g-c">{chips}</span></button>')
        heights.append(_block(sk, 394, fs, pad))
        d += 55
    if p["creds"]:
        chips = "".join(f'<i>{{{{icon:check}}}}{e(c)}</i>' for c in p["creds"])
        blocks.append(f'<div class="pe-g pe-g--cred" data-in style="--d:{d}ms"><b class="pe-g-l">Credentials</b><span class="pe-g-c">{chips}</span></div>')
        heights.append(_block(p["creds"], 394, fs, pad, extra=20))
    if mode == "cols":
        ia, ib = _split(heights)
        body = f'<div class="pe-sk pe-sk--cols pe-sk--c{"135" if fs < 15 else "15"}"><div class="pe-sk-col">{"".join(blocks[i] for i in ia)}</div><div class="pe-sk-col">{"".join(blocks[i] for i in ib)}</div></div>'
    else:
        body = f'<div class="pe-sk pe-sk--{mode}">{"".join(blocks)}</div>'
    off_pill = f'<span class="pe-off">{{{{icon:pin}}}}{e(off)}</span>' if off else ""
    photo_note = "" if p.get("photo") else "<p>No photo yet: the initials stand in until a square JPEG is added to assets/img/team/ and the person's photo field is set in _src/people_data.py.</p>"
    return f'''<!-- {i + 3} · {p["name"]} -->
<section class="slide" id="p-{p["slug"]}" data-title="{e(p["name"])}, {e(p["role"])}">
  <div class="pe-pf">
    <div class="pe-id">
      <div class="pe-id-top" data-in data-fx="land">{av(p, 120)}{off_pill}</div>
      <div class="pe-who">
        <span class="kicker" data-in style="--d:60ms">profile {i + 1} of {len(P)}</span>
        <h2 class="h-m pe-name" data-in style="--d:100ms"><span class="hl">{e(p["name"])}</span></h2>
        <p class="pe-role" data-in style="--d:160ms">{e(p["role"])}</p>
        <p class="pe-bio" data-in style="--d:220ms">{e(p["bio"])}</p>
      </div>
      <div class="pe-stats">{stats}</div>
    </div>
    <div class="pe-sk-wrap card" data-in data-fx="land" style="--d:120ms">
      <div class="pe-sk-h"><span class="eyebrow">Skills, by group</span><span class="pe-sk-n">{n} skills in {len(p["groups"])} groups</span><span class="hint">Click a group to focus it</span></div>
      {body}
    </div>
  </div>
  <aside class="notes"><p>{e(NOTES[p["slug"]])}</p>{photo_note}</aside>
</section>
'''


def profiles():
    return "\n".join(profile(i, p) for i, p in enumerate(P))


WORDS = {3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight"}


def people_expand(s):
    word = WORDS.get(len(P), str(len(P)))
    s = s.replace("{{people:Count}}", word.capitalize()).replace("{{people:count}}", word)
    s = s.replace("{{people:cards}}", cards())
    s = s.replace("{{people:cover}}", cover())
    s = s.replace("{{people:roster}}", roster())
    s = s.replace("{{people:profiles}}", profiles())
    return s

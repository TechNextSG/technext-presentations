# TechNext presentations

Three interactive HTML decks in TechNext branding, plus a launcher page.

| Deck | File | Slides |
|---|---|---|
| Company profile | `company-profile.html` | 11 |
| Service showcase | `service-showcase.html` | 15 |
| What is Odoo (with a lead-to-cash walkthrough) | `what-is-odoo.html` | 16 |

Live (unlisted, `noindex`): https://technextsg.github.io/technext-presentations/

## Presenting

| Key | Action |
|---|---|
| `→` `Space` `PgDn` | next build or slide |
| `←` `PgUp` | back |
| `Home` / `End` | first / last slide |
| `O` | all slides (arrows + `Enter` to pick; `O` or `Esc` closes) |
| `F` | full screen |
| `N` | speaker notes |
| number, then `Enter` | jump to a slide |
| `?` | shortcuts |

Click empty space to advance; swipe on touch screens. Add `?kiosk` (or `?kiosk=12` for 12 s a slide) to loop on its own. `#5` in the address opens slide 5.

## Building

The HTML at the root is generated. Edit the sources, then run:

```
python -B _src/build.py
```

- `_src/decks/*.html`: deck sources. Tokens: `{{head}}`, `{{icon:name}}`, `{{odoo:module[:size]}}`, `{{qr:meet}}`, `{{seamap:W:H}}`, `{{mapxy:sg:W:H}}`, `{{apps_json}}`, `{{include:partial}}`, `{{og:name}}`.
- `_src/partials/`: the AI vignettes and the walkthrough screens, shared between decks.
- `assets/deck.css`, `assets/deck.js`: the engine (1600 × 900 stage scaled to the window, builds, overview, notes, kiosk, print).
- `assets/<deck>.css|js`: each deck's own slides. `assets/ai-demos.*`, `assets/fx.js`: shared demos and motion helpers.
- `_src/icons.json` is the technext.asia icon set; `_src/land-50m.json` is Natural Earth land (world-atlas, ISC) for the dot map.

PDFs in `pdf/` are printed from `<deck>.html?print` in headless Chrome (`Page.printToPDF`, `preferCSSPageSize`), one slide per page.

## Content rules

Approved figures only: clients in 10+ countries, 11+ enterprise clients, 4 core AI disciplines, 3 offices. "Odoo Ready Partner" (never "certified"). Demos use sample companies and data and are labelled illustrative. No prices beyond Odoo's own published structure.

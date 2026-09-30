# TechNext presentations

Interactive HTML decks in TechNext branding, plus a launcher page, including client sales proposals.

| Deck | File | Slides |
|---|---|---|
| Company profile | `company-profile.html` | 11 |
| Portfolio: clients and what we built | `portfolio.html` | 11 |
| Service showcase | `service-showcase.html` | 15 |
| Marketing showcase: live sites, concepts, pitch microsites | `marketing-showcase.html` | 17 |
| What is Odoo (what's new in Odoo 20, then a lead-to-cash walkthrough) | `what-is-odoo.html` | 17 |
| ERP tier list | `erp-tiers.html` | 7 |
| Marketing tier list | `marketing-tiers.html` | 7 |
| Proposal: Hitachi Elevator Philippines | `hitachi-elevator-ph.html` | 16 |

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

**Share links.** Each card on the launcher has a Share button: it copies a link to that presentation on its own (on a phone it opens the share sheet), with Email, WhatsApp and Preview beside it. The link opens `s-<token>.html`, a copy of the deck with no Home button and none of the links to the other decks, so the person you send it to has no way from it to the rest. The site is public, though: it hides the way, it doesn't lock the door.

**Phones.** Held upright, the deck turns 90° so the slides fill the screen: turn the phone sideways to read them. With auto-rotate on, the browser switches to landscape and the deck turns back upright; with rotation locked, it stays turned and reads correctly. Swipes follow the slides' own direction. On Android, full screen also holds the screen in landscape. Short screens get a smaller control bar.

## Building

The HTML at the root is generated. Edit the sources, then run:

```
python -B _src/build.py
```

- `_src/decks/*.html`: deck sources. Tokens: `{{head}}`, `{{icon:name}}`, `{{odoo:module[:size]}}`, `{{qr:meet}}`, `{{seamap:W:H}}`, `{{mapxy:sg:W:H}}`, `{{worldmap:W:H}}`, `{{apps_json}}`, `{{include:partial}}`, `{{og:name}}`, `{{launcher}}`; showcase `{{sc:*}}`, portfolio `{{pf:*}}`, `{{scroll:slug:W:H[:m]}}`, `{{thumb:slug}}`.
- `_src/partials/`: the AI vignettes and the walkthrough screens, shared between decks.
- `_src/showcase_data.py`, `_src/portfolio_data.py`: the sites and clients behind the two showcase decks.
- `assets/deck.css`, `assets/deck.js`: the engine (1600 × 900 stage scaled to the window, builds, overview, notes, kiosk, print, the phone turn). Slide scripts read positions through `Deck.rect(el)` and `Deck.point(event)`, which stay correct when the deck is turned.
- `assets/<deck>.css|js`: each deck's own slides. `assets/ai-demos.*`, `assets/fx.js`: shared demos and motion helpers.
- `_src/icons.json` is the technext.asia icon set; `_src/land-50m.json` is Natural Earth land (world-atlas, ISC) for the dot maps.

**Sales proposals** (the launcher's last group) are built from a client's requirements: for Hitachi Elevator Philippines, the pre-discovery analysis in Drive. Only the client's own public facts appear, the pain points are framed as hypotheses to confirm, and every demo is labelled as sample data. `assets/proposal.css` and `assets/proposal.js` hold the shared pieces (workflow panels, charts with validated colours, tooltips that stay right when the deck is turned); each proposal adds its own slide script (`assets/hitachi.js`). `{{phmap:W:H}}` draws a Philippines dot map; `{{phxy:lon,lat:W:H}}` and `{{phpx:lon,lat:W:H}}` place pins on it. Send a proposal to the client with its Share link.

**Shared copies** are written by the build: one `s-<token>.html` per deck, tokens in `_src/share.json` (made on first build, kept after). Mark any link to another deck `data-internal` and the shared copy drops it; the build stops if a shared copy still links to another deck or the launcher. To retire a link, change that deck's token and rebuild: the old file is deleted.

**Site pictures** (Marketing showcase, Portfolio): full-page captures (`<slug>-d.jpg` at 1440 wide, `<slug>-m.jpg` at 390 wide) become deck images with `python -B _src/sites_images.py <capture folder>`, which writes every size to `assets/img/sites/` and `_src/sites_meta.json`. Then `python -B _src/build.py --prune` deletes the sizes no deck uses. A normal build fails if a deck points at a picture that isn't there. Capture with the viewport at its normal height and `captureBeyondViewport`; stretching the viewport to the page height blows up 100vh heroes.

**PDFs** in `pdf/` are printed from `<deck>.html?print` in headless Chrome (`Page.printToPDF`, `preferCSSPageSize`), one slide per page. In print mode no slide is played: every build is shown and every slide's `settle` hook runs, so each page shows the slide finished. A slide whose finished state comes from its script needs a `settle` hook (the overview uses the same hooks). Page pictures print from small top-only crops (`data-psrc`). Chart gridlines are real 1px elements (`.px-gl` in `assets/proposal.css`), not `repeating-linear-gradient` backgrounds, which Chrome's PDF output turns into striped bars.

## Content rules

Odoo facts follow the current release (Odoo 20 release notes): Field Service runs inside Planning, VoIP is called Phone. Approved figures only: clients in 10+ countries, 11+ enterprise clients, 4 core AI disciplines, 3 offices. "Odoo Ready Partner" (never "certified"). Demos use sample companies and data and are labelled illustrative. No prices beyond Odoo's own published structure; tiers are "On quotation". Enterprise work under NDA is never named, only counted. In client proposals, internal research (job ads, employee reviews, headcount guesses) stays out of the deck, notes included. In the portfolio, clients with delivered work are listed apart from proposals, concepts and paused work.

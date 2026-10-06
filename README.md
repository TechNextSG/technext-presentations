# TechNext presentations

Interactive HTML decks in TechNext branding, plus a launcher page, including client sales proposals.

| Deck | File | Slides |
|---|---|---|
| Company profile | `company-profile.html` | 11 |
| Portfolio: clients and what we built | `portfolio.html` | 10 |
| Service showcase | `service-showcase.html` | 15 |
| Marketing showcase: live sites, concepts, pitch microsites | `marketing-showcase.html` | 15 |
| What is Odoo (what's new in Odoo 20, then a lead-to-cash walkthrough) | `what-is-odoo.html` | 17 |
| Odoo Accounting: one live session (Odoo app series) | `odoo-accounting.html` | 13 |
| Odoo Sales: one live session (Odoo app series) | `odoo-sales.html` | 13 |
| Odoo CRM: one live session (Odoo app series) | `odoo-crm.html` | 13 |
| ERP tier list | `erp-tiers.html` | 7 |
| Marketing tier list | `marketing-tiers.html` | 7 |
| Proposal: Hitachi Elevator Philippines | `hitachi-elevator-ph.html` | 14 |
| Client deck: Moving JR-Tech onto Odoo ERP (modules, SQL Account migration, invoicing video, support, discovery questions) | `jrtech-odoo-erp.html` | 25 |

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
| `P` | presenter view: notes, next slide and a timer in a second window that follows and steers the slides |
| `B` or `.` | black screen (`W` or `,` for white); the next press brings the slide back without moving on |
| `F5` | full screen (what presentation clickers send for "start"), not a reload |
| `T` | Display: **HDMI cable** (full quality, every animation), **Wi-Fi / casting** (less motion, so the stream stays sharp; also for a TV's own browser) or **Auto** (less motion on its own for TV browsers, 4K screens, 4-core machines and `?kiosk`). Also the screen button in the control bar; remembered per browser; `?display=full`, `?display=cast`, `?display=auto` in the address |
| number, then `Enter` | jump to a slide |
| `?` | shortcuts |

Click empty space to advance; swipe on touch screens. Add `?kiosk` (or `?kiosk=12` for 12 s a slide) to loop on its own. `#5` in the address opens slide 5.

**On a TV or projector** (the launcher's "Presenting on a TV or projector" section is the team guide):

| Set-up | How | Display mode |
|---|---|---|
| HDMI / USB-C cable | `Win`+`P` → Second screen only, open the deck, `F` | HDMI cable (full quality) |
| Cable with notes on the laptop | `Win`+`P` → Extend, `P` for the presenter view, drag the slides window to the TV, `F` there | HDMI cable |
| Wi-Fi casting | Chrome → Cast → Cast tab (Chromecast / Google TV), `Win`+`K` (Miracast), AirPlay | Wi-Fi / casting |
| Zoom, Teams, Meet | share the tab or window | Wi-Fi / casting |
| The TV's own browser | 2021+ TVs (Chromium 84+ for flex gaps); the remote's arrows and OK drive the deck | Wi-Fi / casting (Auto picks it) |
| Bluetooth clicker | carries the keys, not the picture: Page Down / Up, F5, B work | any |
| No internet | open each deck once online, or "Save every deck for offline use" on the launcher (`sw.js`); the PDFs and the Drive copy work offline | any |

Fonts are self-hosted (`assets/fonts.css`, `assets/fonts/*.woff2`, one face per weight as Google declared them, so 650/750 still resolve to 700/800). `inset` is written as top/right/bottom/left so 2020–21 TV browsers lay the slides out. `sw.js` keeps an offline copy on the live https site only (never on a local preview): pages network-first, `?v=` files cache-first, other files stale-while-revalidate.

**Share links.** Each card on the launcher has a Share button: it copies a link to that presentation on its own (on a phone it opens the share sheet), with Email, WhatsApp and Preview beside it. The link opens `s-<token>.html`, a copy of the deck with no Home button and none of the links to the other decks, so the person you send it to has no way from it to the rest. The site is public, though: it hides the way, it doesn't lock the door.

**Phones.** Held upright, the deck turns 90° so the slides fill the screen: turn the phone sideways to read them. With auto-rotate on, the browser switches to landscape and the deck turns back upright; with rotation locked, it stays turned and reads correctly. Swipes follow the slides' own direction. On Android, full screen also holds the screen in landscape. Short screens get a smaller control bar.

## Building

The HTML at the root is generated. Edit the sources, then run:

```
python -B _src/build.py
```

- `_src/decks/*.html`: deck sources. Tokens: `{{head}}`, `{{icon:name}}`, `{{odoo:module[:size]}}`, `{{qr:meet}}`, `{{seamap:W:H}}`, `{{mapxy:sg:W:H}}` (SVG x,y), `{{mappx:sg:W:H}}` (`--x`/`--y` for HTML pins), `{{worldmap:W:H}}`, `{{apps_json}}`, `{{include:partial}}`, `{{og:name}}`, `{{launcher}}`; showcase `{{sc:*}}`, portfolio `{{pf:*}}`, `{{scroll:slug:W:H[:m]}}`, `{{thumb:slug}}`.
- `_src/partials/`: the AI vignettes and the walkthrough screens, shared between decks.
- `_src/showcase_data.py`, `_src/portfolio_data.py`: the sites and clients behind the two showcase decks.
- `assets/deck.css`, `assets/deck.js`: the engine (1600 × 900 stage scaled to the window, builds, overview, notes, kiosk, print, the phone turn). Slide scripts read positions through `Deck.rect(el)` and `Deck.point(event)`, which stay correct when the deck is turned.
- `assets/<deck>.css|js`: each deck's own slides. `assets/ai-demos.*`, `assets/fx.js`: shared demos and motion helpers.
- `_src/icons.json` is the technext.asia icon set; `_src/land-50m.json` is Natural Earth land (world-atlas, ISC) for the dot maps.

**Sales proposals** (the launcher's last group) are built from a client's requirements: for Hitachi Elevator Philippines, the pre-discovery analysis in Drive. Only the client's own public facts appear, the pain points are framed as hypotheses to confirm, and every demo is labelled as sample data. `assets/proposal.css` and `assets/proposal.js` hold the shared pieces (workflow panels, charts with validated colours, tooltips that stay right when the deck is turned); each proposal adds its own slide script (`assets/hitachi.js`). `{{phmap:W:H}}` draws a Philippines dot map; `{{phxy:lon,lat:W:H}}` and `{{phpx:lon,lat:W:H}}` place pins on it. Send a proposal to the client with its Share link.

**The Odoo app series** (Accounting, Sales, CRM; built 2 Oct 2026 with the impeccable and web-design-engineer skills, structure "one live Odoo screen" chosen by the user). Each deck is 13 slides in the same order: a cover whose Odoo window is already working, "what it replaces" (one build), seven moves, new in Odoo 20 (each item jumps back to the move that showed it), Singapore, the Philippines and Vietnam side by side beside a dot map (a pin only highlights its column, so print carries all three), how TechNext sets it up, and the booking slide.
- The seven moves are slides `mv1`…`mv7` with `data-group="live"` and `data-steps="1"`. Slides of one `data-group` cut instead of fading (`deck.js` sets `.is-cut`), so the window frame holds still and only what is inside it changes. Step 0 sets the scene and readies the highlighted Odoo button; step 1, or a click on that button, performs the task. The session log on the left fills with each move's result.
- `assets/odoo-app.css` / `assets/odoo-app.js` hold everything the three share: the window (`.lw`), the move column and log, the replaces, new-in-20, country and set-up slides. A deck's script calls `OA.start({ moves: [{ id, name, result, reset, intro(ctx, s, ready, quick), act(ctx, s, done), final }] })`; `final` is the finished state used by print and the overview, and a move is reset without transitions as it opens, so its finished state never flashes. Views live in `assets/odoo-<app>.css|js`, the window's navbar in `_src/partials/<app>-nav.html`.
- One sample company runs through all three: Kestrel &amp; Pine Pte Ltd (every window carries a "Sample" chip). The Sunbird Clinics deal is won in CRM, quoted in Sales as S00057 (S$18,220.44 at a 30% installation margin, S$18,318.54 at 35%, S$5,000.00 deposit, S$13,318.54 still due) and its money moves in Accounting. Keep the figures agreeing from move to move; each deck's script header lists them.
- Facts come only from Odoo's Odoo 20 release notes and the 20.0 documentation (fact check, 2 Oct 2026), and screen labels follow the 20.0 docs and code: Fetch Transactions, Bank Matching, Create Payment, Tax Returns (Review, Submit, Pay; Validate posts the closing entry), Send (not Send by Email), Generate › Lead Sourcing, Assign Leads, Convert to Opportunity. A payment goes Draft → Paid → Reconciled in Odoo 20; an invoice shows In Payment, then Paid once reconciled. Do not claim: InvoiceNow or Peppol for Singapore (Odoo only says it is preparing for future InvoiceNow compliance), a GST F5 or IRAS e-filing report, bank feeds for banks not on Odoo's list, Accounting, bank sync, digitisation, the marketplace connectors or Commissions in Community, or credit-free Lead Sourcing, enrichment, digitisation and AI.

**Shared copies** are written by the build: one `s-<token>.html` per deck, tokens in `_src/share.json` (made on first build, kept after). Mark any link to another deck `data-internal` and the shared copy drops it; the build stops if a shared copy still links to another deck or the launcher. To retire a link, change that deck's token and rebuild: the old file is deleted.

**Site pictures** (Marketing showcase, Portfolio): full-page captures (`<slug>-d.jpg` at 1440 wide, `<slug>-m.jpg` at 390 wide) become deck images with `python -B _src/sites_images.py <capture folder>`, which writes every size to `assets/img/sites/` and merges their sizes into `_src/sites_meta.json` (recapturing a few sites keeps the rest). Then `python -B _src/build.py --prune` deletes the sizes no deck uses. A normal build fails if a deck points at a picture that isn't there. Site pictures and launcher thumbnails carry `?v=` like the other assets, so bump `ASSET_V` after a recapture and copies saved for offline use pick up the new pictures. Capture with the viewport at its normal height and `captureBeyondViewport`; stretching the viewport to the page height blows up 100vh heroes. The capture itself can open a hover menu (HummingBeing's Services menu did), so force `dropdown-menu` / `sub-menu` elements hidden while capturing. Last recapture: BHD Asia, HummingBeing, TRE in Singapore, technext.asia and Immaculate Connections, 2 Oct 2026.

**PDFs** in `pdf/` are printed from `<deck>.html?print` in headless Chrome (`Page.printToPDF`, `preferCSSPageSize`), one slide per page. In print mode no slide is played: every build is shown and every slide's `settle` hook runs, so each page shows the slide finished. A slide whose finished state comes from its script needs a `settle` hook (the overview uses the same hooks). Page pictures print from small top-only crops (`data-psrc`). Chart gridlines are real 1px elements (`.px-gl` in `assets/proposal.css`), not `repeating-linear-gradient` backgrounds, which Chrome's PDF output turns into striped bars.

## Content rules

Odoo facts follow the current release (Odoo 20 release notes): Field Service runs inside Planning, VoIP is called Phone. Approved figures only: clients in 10+ countries, 11+ enterprise clients, 4 core AI disciplines, 3 offices. Office roles: Singapore is headquarters (sales, discovery, on-site work), the Philippines office in Taguig City is the main development and consulting hub, and the Vietnam office in Ho Chi Minh City is mainly AI engineering; never call Vietnam "the development hub". "Odoo Ready Partner" (never "certified"). Demos use sample companies and data and are labelled illustrative. No prices beyond Odoo's own published structure; tiers are "On quotation". Enterprise work under NDA is never named, only counted. In client proposals, internal research (job ads, employee reviews, headcount guesses) stays out of the deck, notes included. The portfolio covers clients with delivered work; the slide of proposals, concepts and paused work was removed on request (30 Sep 2026). Blue Moon Secret's Chamber and Tri-Comp Solutions (its concept site, marketing showcase and Odoo proposal) were removed from the Marketing Showcase on request (2 Oct 2026); keep them out.

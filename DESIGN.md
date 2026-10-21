---
name: TechNext Presentations
description: TechNext's working sales decks on one 1600x900 stage, extended by the Odoo app series' live Odoo window.
colors:
  blue: "#3167CA"
  blue-700: "#1E4691"
  deep-navy: "#0F2350"
  blue-300: "#6FA0F5"
  blue-200: "#A9C4F5"
  blue-100: "#DDE7F8"
  blue-050: "#EAF0FB"
  ice-blue: "#A9C8FF"
  odoo: "#714B67"
  odoo-plum-deep: "#5E3E56"
  odoo-050: "#F3EDF2"
  odoo-status: "#EFE4EC"
  odoo-select: "#F8F2F6"
  odoo-link: "#017E84"
  odoo-teal: "#21B799"
  ok: "#137A4A"
  ok-050: "#E8F5EE"
  amber: "#A96B00"
  amber-050: "#FFF4DF"
  red: "#B4372B"
  red-050: "#FBEDEB"
  badge-ok: "#14703F"
  badge-ok-bg: "#E3F4EA"
  badge-info: "#016A70"
  badge-info-bg: "#E1F1F2"
  badge-warn: "#8A5A00"
  badge-warn-bg: "#FFF1D6"
  badge-bad: "#A6312A"
  badge-bad-bg: "#FBE6E3"
  reconciled-green: "#1E7E34"
  ink: "#1F1F3D"
  body: "#4C4C63"
  muted-text: "#6C6C80"
  muted: "#8888A0"
  line: "#E7E4E9"
  alt: "#FAF9FB"
  white: "#FFFFFF"
  letterbox: "#0C1530"
  control-navy: "#0E1630"
  window-ground: "#F6F6F9"
  window-border: "#DCDCE3"
  window-rule: "#E6E6EA"
  window-hairline: "#F1F1F5"
  window-chip: "#EEF0F4"
  window-button: "#E7E9ED"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "92px"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "64px"
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "44px"
    fontWeight: 750
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  card-title:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "27px"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  lead:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.5
  log:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "20px"
    fontWeight: 650
    lineHeight: 1.35
  button:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.14em"
  hand:
    fontFamily: "Caveat, Segoe Print, cursive"
    fontSize: "38px"
    fontWeight: 600
    lineHeight: 1
  window-body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
  window-title:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  window-button:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.2
  window-caption:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  facet: "4px"
  control: "6px"
  sheet: "8px"
  dialog: "10px"
  r: "14px"
  frame: "16px"
  r-lg: "20px"
  r-xl: "28px"
  pill: "999px"
spacing:
  window-gap: "14px"
  s: "16px"
  window-inset: "18px"
  row: "24px"
  m: "32px"
  section: "40px"
  window-gutter: "40px"
  l: "52px"
  toast-lane: "64px"
  split: "72px"
  stage-bottom: "96px"
  stage-top: "118px"
  stage-x: "120px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.r}"
    padding: "20px 30px"
  button-primary-hover:
    backgroundColor: "{colors.blue-700}"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.blue-700}"
    typography: "{typography.button}"
    rounded: "{rounded.r}"
    padding: "20px 30px"
  button-ghost:
    backgroundColor: "rgba(255,255,255,0.1)"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.r}"
    padding: "20px 30px"
  button-ghost-hover:
    backgroundColor: "rgba(255,255,255,0.18)"
  button-line:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.r}"
    padding: "20px 30px"
  segment:
    backgroundColor: "{colors.white}"
    textColor: "{colors.body}"
    rounded: "{rounded.r}"
    padding: "5px"
  segment-pressed:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "10px"
    padding: "12px 18px"
  tag:
    backgroundColor: "{colors.blue-050}"
    textColor: "{colors.blue-700}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  tag-odoo:
    backgroundColor: "{colors.odoo-050}"
    textColor: "{colors.odoo}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  tag-ok:
    backgroundColor: "{colors.ok-050}"
    textColor: "{colors.ok}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.body}"
    rounded: "{rounded.r-lg}"
    padding: "30px 32px"
  live-window:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.window-body}"
    rounded: "{rounded.frame}"
    width: "932px"
    height: "700px"
  live-window-body:
    backgroundColor: "{colors.window-ground}"
    padding: "14px 18px"
  window-sheet:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.sheet}"
    padding: "18px 22px"
  window-button-primary:
    backgroundColor: "{colors.odoo}"
    textColor: "{colors.white}"
    typography: "{typography.window-button}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  window-button-primary-hover:
    backgroundColor: "{colors.odoo-plum-deep}"
  window-button-secondary:
    backgroundColor: "{colors.window-button}"
    textColor: "{colors.ink}"
    typography: "{typography.window-button}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  window-button-done:
    backgroundColor: "{colors.window-button}"
    textColor: "{colors.muted-text}"
    typography: "{typography.window-button}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  window-status-step:
    backgroundColor: "{colors.window-hairline}"
    textColor: "{colors.muted-text}"
    padding: "7px 16px 7px 20px"
  window-status-current:
    backgroundColor: "{colors.odoo-status}"
    textColor: "{colors.odoo}"
    padding: "7px 16px 7px 20px"
  window-facet:
    backgroundColor: "{colors.window-chip}"
    textColor: "{colors.ink}"
    rounded: "{rounded.facet}"
    padding: "3px 8px"
  badge:
    backgroundColor: "{colors.window-chip}"
    textColor: "{colors.body}"
    typography: "{typography.window-caption}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  badge-ok:
    backgroundColor: "{colors.badge-ok-bg}"
    textColor: "{colors.badge-ok}"
    typography: "{typography.window-caption}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  badge-info:
    backgroundColor: "{colors.badge-info-bg}"
    textColor: "{colors.badge-info}"
    typography: "{typography.window-caption}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  badge-warn:
    backgroundColor: "{colors.badge-warn-bg}"
    textColor: "{colors.badge-warn}"
    typography: "{typography.window-caption}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  badge-bad:
    backgroundColor: "{colors.badge-bad-bg}"
    textColor: "{colors.badge-bad}"
    typography: "{typography.window-caption}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  badge-plum:
    backgroundColor: "{colors.odoo-050}"
    textColor: "{colors.odoo}"
    typography: "{typography.window-caption}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  window-toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.dialog}"
    padding: "11px 18px"
  log-step:
    backgroundColor: "{colors.white}"
    textColor: "{colors.muted-text}"
    typography: "{typography.log}"
    rounded: "{rounded.pill}"
    size: "26px"
  log-step-current:
    backgroundColor: "{colors.white}"
    textColor: "{colors.blue}"
    rounded: "{rounded.pill}"
    size: "26px"
  log-step-done:
    backgroundColor: "{colors.ok}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    size: "26px"
---

# Design System: TechNext Presentations

## Overview

**Creative North Star: "The Working Presentation"**

Every TechNext deck is a 1600 x 900 stage that behaves like the thing it sells. Maps answer a click, pipelines move, and Odoo screens do the work in front of the room. The light ground is a lilac-white paper with a faint brand-blue dot grid and two slow glows. Text is a deep blue-black ink. Brand blue does the pointing: one marker-stroked phrase per headline, the pressed control, the progress rule along the foot of the stage. Covers and closes turn to a navy-to-deep dark slide. Density is set for presenting: one idea per slide, 44px titles and 22px body, readable on a projector, a TV or a phone held sideways. The stage is a single picture. It scales whole to the screen and never reflows.

Motion glides and then stays out of the way. Slides slide 56px and cross-fade, entrances rise 24px in short staggers, and every transition shares one ease-out curve (cubic-bezier(.2,.8,.2,1)), with an in-out curve kept for loops and drawn lines. Anything not on screen pauses. In TV mode the decorative loops stop and entrances fade in place. Under reduced motion, slides and entrances only fade and the loops stop.

The Odoo app series (Accounting, Sales, CRM) extends this world and does not replace it. One live Odoo window, 932 x 700, holds the stage for seven consecutive move slides. Those slides share a group and cut instead of sliding, so the frame never moves and only its contents change. Inside the window the grammar is Odoo's own, not TechNext's: a white navbar, a plum primary button, teal links and breadcrumbs, a chevron status bar and the official app icons. Around it the deck's grammar holds: a 388px column with the move's headline, one paragraph, a plum cue that names the button to press, and a session log that fills in as moves complete. The series thesis refused feature grids, icon bullets and static screenshots for these decks. The incumbent decks still build on cards and icon badges, so that refusal belongs to the series and is not a rule for the whole system.

**Key Characteristics:**
- A fixed 1600 x 900 stage that scales as one picture and never reflows.
- A lilac-white paper ground with a faint blue dot grid, and navy-to-deep dark slides to open and close.
- Plus Jakarta Sans headlines at 44 to 92px, each with one blue marker-stroked phrase, over Inter body at 22px.
- Soft ink-tinted ambient shadows, generous 14 to 20px corners and white hairline cards.
- Motion that glides on one ease-out curve, pauses off screen, and flattens for TVs and reduced motion.
- In the Odoo series, one live Odoo window held still across seven cut slides, speaking Odoo's plum-and-teal grammar.

## Colors

Two palettes that do not mix: TechNext's blue on paper around the window, and Odoo's plum and teal inside it.

### Primary
- **Brand Blue** (#3167CA): the pointing colour. Highlighted headline phrases and their marker band (18% of this blue), pressed segments, the primary button, map pins, set-up phases as they light, the current step of the session log, and the start of the progress rule.
- **Navy** (#1E4691): primary button hover, tag text, the middle stop of the dark slide, and text on white buttons placed on dark slides.
- **Deep Navy** (#0F2350): where the dark slide's 140-degree gradient starts. It runs to Navy at 52% and to #2D5DB8 at 100%, under a sky-blue glow top right and a faint teal glow bottom left.
- **Sky Blue** (#6FA0F5): the end of the progress rule, the overview cursor ring, the marker band on dark slides (at 60%), and focus rings on map pins.
- **Pale Blue** (#A9C4F5) and **Mist Blue** (#DDE7F8): quiet arrows, hairline borders on blue controls, and set-up phase rings at rest.
- **Wash Blue** (#EAF0FB): the fill of tags and icon tiles and of the "seen in Move n" jump buttons.
- **Ice Blue** (#A9C8FF): the handwritten line and accents on dark slides.

### Secondary
Odoo's product palette. It belongs to the live window. Outside the window it appears only where the deck points at Odoo.
- **Odoo Plum** (#714B67): the window's primary button, the presenter's avatar in Accounting, the text of the current status chevron, plum count tags inside search facets, checkbox accents and the commission and score gauges. Outside the window it marks only what belongs to Odoo: in the series, the Odoo tag and the move's press cue; in What is Odoo, Odoo's own app names and its Enterprise column.
- **Deep Plum** (#5E3E56): primary button hover inside the window.
- **Plum Chevron** (#EFE4EC), **Plum Tint** (#F3EDF2) and **Plum Select** (#F8F2F6), from strongest to faintest: the current status chevron; the Odoo tag, plum badges and suggested values as they land in a field; selected rows and chosen tiles.
- **Odoo Link Teal** (#017E84): breadcrumb paths, links, rule and source icons inside the window, and the 3px focus outline on window buttons. It holds 4.9:1 on white.
- **Odoo Brand Teal** (#21B799): appears only as the faint glow (14%) at the bottom left of dark slides.

### Tertiary
Signal colours, in two sets. The deck's set is used around the window and the window's set inside it.
- **Deck Green** (#137A4A) on **Deck Green Wash** (#E8F5EE): done states in the session log, check icons in lists, the "New" tag and positive meters.
- **Deck Amber Wash** (#FFF4DF) grounds the "by hand" chips and the "Changed" tags (in #8A5A00 text) and the chore meter on the "what it replaces" slide, whose count is **Deck Amber** (#A96B00). Deck Red (#B4372B) on Deck Red Wash (#FBEDEB) completes the set for the incumbent decks.
- **Window badges**: green (#14703F on #E3F4EA), info teal (#016A70 on #E1F1F2), warning amber (#8A5A00 on #FFF1D6) and overdue red (#A6312A on #FBE6E3). Every pair holds at least 5.3:1.
- **Reconciled Green** (#1E7E34): matched-line discs and the stamped PAID and WON ribbons.

### Neutral
- **Ink** (#1F1F3D): headlines, values, and the window's own text. It is also the fill of the toast.
- **Body** (#4C4C63): paragraphs and secondary values.
- **Label Grey** (#6C6C80): the series' secondary text, from 11px captions to the 20px pending rows of the session log, in the deck column and inside the window. It holds 5.1:1 on white and 4.8:1 on the window ground.
- **Chrome Grey** (#8888A0): the engine's slide label, footer and hints at 14 to 16px. It measures 3.3:1 on the paper.
- **Hairline** (#E7E4E9): card borders, dividers and the session log's top rule.
- **Paper** (#FAF9FB): the ground of every light slide. **White** (#FFFFFF) is for cards, panels and the window.
- **Letterbox** (#0C1530): the page around the scaled stage. **Control Navy** (#0E1630) is the presenter controls, notes and menus, at 86 to 96% opacity.
- **Window neutrals**: the ground (#F6F6F9); the frame and input border (#DCDCE3); sheet and header rules (#E6E6EA); row hairlines and idle chevrons (#F1F1F5), with the control-panel divider a shade darker (#EFEFF3); facets and neutral badges (#EEF0F4); secondary and done buttons (#E7E9ED).

### Named Rules
**The Two Palettes Rule.** Inside the live window, plum is the only action colour and teal the only link colour. TechNext blue enters the window only as a user's avatar fill. Outside the window, blue leads, and plum marks only what belongs to Odoo, such as the Odoo tag and the line that tells the presenter which button to press.

**The Paper Ground Rule.** Light slides sit on Paper with the blue dot grid (34px pitch, 13% blue, masked toward the upper right) and two drifting glows. Dark slides open and close a deck. Some incumbent decks use one more dark slide at a turn between, and the Odoo series uses exactly two.

## Typography

**Display Font:** Plus Jakarta Sans (with system-ui, -apple-system, Segoe UI, sans-serif)
**Body Font:** Inter (with system-ui, -apple-system, Segoe UI, sans-serif)
**Hand Font:** Caveat (with Segoe Print, cursive)

**Character:** A geometric grotesque set heavy and tight for headlines, over a neutral Inter for reading. Display sizes are fixed pixels on the fixed stage, with no fluid scale. Both faces ship as four static weights each: Plus Jakarta Sans at 500, 600, 700 and 800, and Inter at 400, 500, 600 and 700. So the CSS's 750 renders as 800 and 650 renders as 700, and titles and display differ by size alone.

### Hierarchy
- **Display** (800, 92px, 1.02): cover and closing headlines. The Odoo series sets it at 84px (1.03) beside the cover window and on the closing slide.
- **Headline** (800, 64px, 1.06): large statements in incumbent decks. The Odoo series does not use it.
- **Title** (750, 44px, 1.12): every section and move headline. It is the workhorse, carrying 33 of the series' 39 headlines, and is balanced across lines.
- **Card Title** (750, 27px, 1.2): headings inside cards in incumbent decks.
- **Lead** (400, 26px, 1.5, 760px measure): the paragraph under a headline. The series cover uses 25px at a 600px measure, and the move column uses 22px at 388px.
- **Body** (400, 22px, 1.5): default slide text. Card paragraphs drop to 19px.
- **Log** (650, 20px, 1.35): rows of the session log. They are Label Grey until done, Ink when done and Navy when current.
- **Label** (600, 15px, 0.14em, uppercase): the deck label in the slide chrome. The same tracked capitals at 11 to 13px caption the session log ("This session"), the presenter panels and the Display menu, and they set the window's chips and stamped ribbons.
- **Window Body** (400, 15px, 1.4): the window's own text. Lists run at 14.5px with 700 headers at 13.5px.
- **Window Title** (700, 24px, 1.2): record titles inside the window (a bill, a quotation).
- **Window Button** (600, 14px, 1.2) and **Window Caption** (600, 12.5px, 1.25): Odoo buttons, and badges and field labels.

**The hand line, recorded as shipped.** Caveat at 600 weight and 38px, tilted -1.5 degrees, sets one lowercase line above a section headline: Brand Blue on light slides, Ice Blue on dark. PRODUCT.md commits Caveat to this handwritten kicker, and every incumbent deck carries it. The Odoo series uses it on its six slides outside the session (cover, what it replaces, new in Odoo 20, where we work, with TechNext, next step). On the cover it carries the app's official icon at 38px. None of the seven move slides has one, and there the headline opens the column. The device also sits on the craft floor's refusal of kickers. This file records the face and where it ships. It does not prescribe the device for new surfaces and does not ban it, so extending it is the user's call.

The engine also defines a tracked-capitals eyebrow with a short leading rule. Two incumbent decks use it (company profile and service showcase) and the Odoo series does not. It is left out of this hierarchy.

### Named Rules
**The One Marker Rule.** Every headline carries exactly one highlighted phrase. It is set in Brand Blue over a marker band of 18% blue between 74% and 93% of the line box, which draws in over 1.1s starting 0.45s after the slide opens. In the Odoo series it is always the headline's closing phrase. On dark slides the phrase turns white over a 60% Sky Blue band.

**The Product Voice Rule.** Inside the window, type drops to product sizes (11 to 18px, Inter at 400 to 700). Plus Jakarta Sans appears there only for record titles, totals, key figures and stamped ribbons. Deck-scale type (44px titles, 22px body) never enters the window.

## Layout

The stage is a fixed 1600 x 900 canvas, letterboxed on Letterbox navy and scaled as a whole to fit the screen. There are no CSS breakpoints. The composition never reflows, so every coordinate below is a stage pixel. A phone held upright turns the deck 90 degrees. A viewport under 520px tall compacts the presenter controls. Print lays each slide on its own 1600 x 900 page with every build shown.

- **Slide frame:** 118px top, 120px sides and 96px bottom. A 92px chrome band across the top holds the logo and the deck label, inset 120px. The footer sits 34px from the bottom edge, and a 5px progress rule runs along the foot.
- **Section head:** the headline block sits 40px above the content. Section heads can run as a row with a control at the far right, like the segmented filter on "New in Odoo 20".
- **Split:** two columns with a 72px gap, at 1:1, 0.9:1.1 (wide) or 1.15:0.85 (narrow, used by the closing slide).
- **Rhythm:** vertical steps of 16, 32 and 52px, with a 24px gap between items in a row.
- **Cover:** a copy column at (120, 106), 720px wide in incumbent decks and 640px in the series. The series cover window sits at (784, 146), 780 x 624.
- **Move slide (Odoo series):** a 388px column at (120, 112) and the live window at (548, 112), 932 x 700. That leaves a 40px gutter, puts the window's right edge on the 120px margin and keeps 88px clear below it.
- **Inside the window:** a 50px navbar, a control panel at least 58px tall, an action bar, then the body at 18px side insets with 10 to 14px gaps between panels. A 64px lane is kept at the window's foot for the toast.

## Elevation & Depth

The system is a hybrid. Tonal layering does most of the work: paper ground, white cards and panels, 1px hairlines. Soft ambient shadows lift only what floats. On light slides every shadow is tinted with ink (31, 31, 61) and spread wide with a negative offset, so it reads as air rather than an outline. On dark slides shadows deepen to navy-black or black. Rings, not shadows, signal state: a plum ring for the control to press, a blue ring for the current step or the selected place.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 1px 2px rgba(31,31,61,.05), 0 10px 28px -14px rgba(31,31,61,.22)`): cards, the segmented control and map-pin labels.
- **Lift** (`box-shadow: 0 2px 6px rgba(31,31,61,.06), 0 30px 60px -28px rgba(31,31,61,.36)`): the live window and the Odoo record on the "what it replaces" slide.
- **Blue Glow** (`box-shadow: 0 18px 40px -18px rgba(49,103,202,.55)`): the primary button.
- **Paper Tile** (`box-shadow: 0 1px 2px rgba(31,31,61,.06), 0 12px 24px -16px rgba(31,31,61,.4)`): the hand-placed chore tiles on the dashed desk.
- **Cover Window** (`box-shadow: 0 60px 110px -40px rgba(4,10,30,.75), 0 2px 0 rgba(255,255,255,.3) inset`): the tilted window on the dark cover, with a 50% white edge.
- **Dialog** (`box-shadow: 0 30px 70px -20px rgba(31,31,61,.45), 0 0 0 1px rgba(31,31,61,.08)`): dialogs inside the window, over a 26% ink veil.
- **Ready Ring** (`box-shadow: 0 0 0 5px rgba(113,75,103,.22)`, breathing to `0 0 0 9px rgba(113,75,103,.1)`): the one control the move asks for.
- **Current Ring** (`box-shadow: 0 0 0 4px rgba(49,103,202,.14)`): the current log step. The same blue ring at 5 to 8px marks map pins and lit set-up phases.
- **Stage** (`box-shadow: 0 30px 80px -30px rgba(0,0,0,.6)`): the stage itself against the letterbox.

### Named Rules
**The Lifted Window Rule.** On a move slide the live window is the one lifted object. Everything inside it is flat and separated by 1px hairlines. Only things that sit physically above the app cast a shadow of their own: a dialog over its veil, a PDF page, a phone.

## Shapes

Corners are generous on the deck side and tighter inside the product. The deck uses 14px for buttons and segmented controls, 16px for icon tiles and the live window frame, 20px for cards and 28px for the closing QR card. Inside the window it is 8px for sheets and panels, 6px for buttons, inputs and kanban cards, 4px for search facets and 10px for dialogs and the toast. Tags and badges are full pills. Log steps, avatars, map pins and set-up phase markers are circles. The status bar is a run of chevrons clipped with 9px points, each overlapping the last by 6px. Stamps are ribbons rotated 45 degrees across a card's top-right corner. Lines are 1px hairlines everywhere. A dashed line means work done by hand or not yet finished: the chore desk, the signature box, the feedback note. The chore tiles on that desk are tilted by up to 1.5 degrees either way, like paper dropped on a table.

## Components

### Buttons
Confident and tactile.
- **Shape:** gently rounded (14px), with an inline icon at 22px and a 12px gap.
- **Primary:** Brand Blue fill, white 21px text at 700, 20px 30px padding and the Blue Glow shadow. Hover deepens to Navy.
- **On dark:** Light (white fill, Navy text, a deep shadow on hover) and Ghost (10% white fill, a 1px 28% white border, 18% on hover). The series closing slide pairs them, Light to book a call and Ghost for WhatsApp.
- **Line:** a white fill with a 1px Hairline border. Hover turns the border Pale Blue.
- **Motion:** transform, shadow and background ease over 0.3s.

### Segmented control
A white capsule (14px, 5px inset, 1px Hairline border, Rest shadow) holding 17px buttons at 650 weight with 12px 18px padding and 10px corners. The pressed segment fills Brand Blue with white text. On dark slides the capsule turns to 8% white and the pressed segment to white with Navy text. The series uses one to filter "New in Odoo 20".

### Chips (tags)
- **Style:** a full pill with 8px 14px padding and 600 16px Plus Jakarta Sans. Wash Blue with Navy text by default, with an optional 18px icon.
- **Variants:** Odoo (Plum Tint with Plum), green, and line (white with a hairline). The partner badge is a white pill that holds the Odoo Ready Partner mark at 22 to 25px. On dark slides tags turn to 12% white.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** white on Paper. On dark slides, 10% white with a 14% white border and no shadow.
- **Shadow Strategy:** Rest (see Elevation & Depth).
- **Border:** 1px Hairline.
- **Internal Padding:** 30px 32px, a Card Title heading, and paragraphs at 19px.
- Incumbent decks lean on cards. The Odoo series draws its own white hairline panels from the same family instead: 18px country columns, 16px set-up rules and hairline-ruled rows on the "New in Odoo 20" list.

### Navigation
- **Slide chrome:** the logo (30px tall), a 1px divider, the co-brand mark and the deck label in Label type on the left of the 92px band. The deck name and page number sit in the footer. The 5px progress rule fills in over 0.7s.
- **Presenter controls:** a Control Navy bar at the bottom right with 16px corners, 40px buttons with 11px corners and a tabular 14px slide count. It fades away when the mouse is idle and compacts under 520px of viewport height.
- **Overview:** pressing O tiles every slide on #0F1A38 with 22px corners. Hover adds a 14px Sky Blue ring at 55%, the keyboard cursor a solid 16px Sky Blue ring, and each slide carries a 58px white caption over a navy fade.
- **Panels:** speaker notes, help and the Display menu are translucent Control Navy panels with 16 to 20px corners and tracked-capital headers. Everything works from the keyboard.

### Live Window (Odoo app series)
The series' signature, and a promotion of the Odoo window first built for the "What is Odoo" deck.
- **Frame:** 932 x 700 at (548, 112) on move slides. White, with a 1px #DCDCE3 border, 16px corners and the Lift shadow. On the cover it is 780 x 624, tilted (perspective 2200px, rotate 10 degrees on Y and 3 on X) under the Cover Window shadow, and its navbar keeps three menus.
- **Grammar, Odoo's material rather than TechNext's tokens:**
  - A white 50px navbar with the app grid, the official app icon at 24px, the app name at 700 16px, menus at 14.5px, the company name with an amber "Sample" chip (700 11px tracked capitals, #8A5A00 on #FFF1D6, 5px corners) and a 30px avatar.
  - A control panel with a teal breadcrumb path, a bold current page and a 300px search box holding facets.
  - An action bar, the chevron status bar, and a #F6F6F9 body holding white 8px sheets.
- **Lists:** 14.5px rows with 700 13.5px headers, 1px row hairlines and tabular figures. Selected rows tint Plum Select and matched rows tint green (#F1FAF4).
- **Dialogs:** 470px wide with 10px corners and the Dialog shadow, over a 26% ink veil.
- **Content note:** labels inside the window are Odoo 20's own UI labels from the 20.0 documentation, facts on the slides come from the Odoo 20 release notes and docs, and a label the docs cannot confirm stays generic. Every screen shows a labelled sample company.

### Window buttons and the ready state
- **Shape:** 6px corners, 600 14px Inter, 8px 14px padding.
- **Primary:** Odoo Plum with white text. Hover is Deep Plum.
- **Secondary:** #E7E9ED with Ink text. Hover is #DADDE3. The link style is teal with no fill.
- **Ready:** the Ready Ring, breathing over 2.4s on the in-out curve. A ring of the same family readies whatever control a move asks for: a dashboard tile, a dropdown option, a margin field, the customer's phone button.
- **Done:** a grey fill, Label Grey text, no ring and no clicks.
- **Focus:** a 3px teal outline at 2px offset.

### Status bar
Chevron segments in 13px text at 500 weight. An idle step is #F1F1F5 with Label Grey text. The current step is #EFE4EC with Plum text at 700. Changes ease over 0.5s. In CRM the bar itself becomes the control. Its next chevron carries the ready pulse as a plum tint breathing from #EFE4EC to #E4D2DF over 2.4s, because a clipped chevron cannot show a ring.

### Badges
Full pills with 3px 9px padding in Window Caption type. Neutral is #EEF0F4 with Body text, plus the green, info, warning, overdue and plum pairs from Tertiary and Secondary. Colour changes ease over 0.5s, so a status visibly turns.

### Move column and session log
- **Column:** a Title headline, one 22px paragraph, the press cue (600 17px Plus Jakarta Sans in Odoo Plum with a bolt icon, worded "Press → or click" plus the button's label), then the log.
- **Session log:** a "This session" caption in 13px tracked capitals over a Hairline top rule, then one row per move. Each row has a 26px numbered circle with a 1.5px Hairline border and the move's name in Log type.
- **Log states:** the current row takes the Current Ring and Navy text. A done row turns its circle Deck Green with a check, turns its name Ink, and shows its result in 17px green. The result was laid out all along, so nothing reflows. Each row is a button that jumps to its move.

### Toast
The toast appears at the bottom left of the window, 18px in and 12px up, inside the 64px toast lane. It is an Ink fill with white 18px text, 10px corners and a green check (#6DDBA6). It fades in and rises 8px over 0.45s and 0.55s.

### Cut transition
**The Held Frame Rule.** Consecutive slides that share the live window carry one group (a shared `data-group`) and cut, with no slide transition, so the frame never moves. Only the window's contents change, fading in 0.4s like the app's own view changes.

**The One Ready Control Rule.** Each move readies exactly one control with the plum ready pulse: the Ready Ring, or a breathing plum tint on a status chevron. Pressing → or clicking that control performs the move. Afterwards the control turns grey and stops taking clicks.

**The Toast Lane Rule.** Every move window keeps a 64px lane at its foot for the move's toast, so the confirmation never covers the screen it reports on.

## Do's and Don'ts

### Do:
- **Do** compose on the 1600 x 900 stage with 120px side margins, the 92px chrome band above and the footer 34px from the bottom; scale the stage, never reflow it.
- **Do** give every headline exactly one highlighted phrase in Brand Blue (#3167CA) with the drawn marker band.
- **Do** keep TechNext blue for the deck and Odoo Plum (#714B67) and Odoo Link Teal (#017E84) for the window; let plum cross into the deck only where it marks something of Odoo's, as the Odoo tag and the press cue do.
- **Do** give consecutive slides that share the live window one data-group so they cut and the frame holds still.
- **Do** ready one control per move with the plum ready pulse, and grey it out once the move is done.
- **Do** set secondary text below 18px in Label Grey (#6C6C80), which holds 5.1:1 on white.
- **Do** label demo data where it appears: the amber Sample chip beside the company name in the window's navbar.
- **Do** keep official Odoo app icons in their own colours: 24px in the navbar, 22 to 26px in record headers.
- **Do** stop decorative loops, glows and backdrop blur in TV mode, and drop transforms under reduced motion.

### Don't:
- **Don't** recolour an Odoo app icon or set it on a tinted tile.
- **Don't** move, fade or resize the live window between move slides.
- **Don't** put brand blue on an action inside the window; it enters only as an avatar fill.
- **Don't** let the toast cover the screen it reports on; keep the 64px lane.
- **Don't** shadow sheets inside the window; separate them with 1px hairlines (#E6E6EA).
- **Don't** bring deck-scale type (44px titles, 22px body) inside the window.

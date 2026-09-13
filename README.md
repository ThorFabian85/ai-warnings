# Reversent — AI Warnings

Warning edition with containment-breach finale · September 2026

## Preview

Extract the ZIP completely, then open `index.html` in a browser. Keep the
`assets` folder, stylesheet, script, and PDF alongside it. No installation or
build command is needed. The separate `AI-Warnings-Preview.html` is a portable,
self-contained copy with the artwork and PDF embedded.

## Design

- A cinematic doorway with optional ambient particles, subtle mouse response,
  an explicit pause button, and respect for reduced-motion preferences.
- One compact fixed header, the outlined Home pill, working logo-to-top links,
  a Reversent Network shortcut, and a native mobile navigation menu.
- A dark red quotation section with four accessible, manually operated speaker tabs.
- Spacious researcher profiles, dated forecasts, a clearly labeled scenario,
  and a distinct editorial treatment for The Door We Should Never Open.
- All four original network destinations, contact address, and the original PDF.
- The exact original Reversent v4.5 PNG logo, local vector artwork, and a system
  sans-serif stack; no external font, image,
  animation, analytics, or JavaScript dependencies.

## Pinned DO NOT OPEN section

The large red DO / NOT / OPEN warning and its thesis stay visible on the left
while the argument scrolls on the right. The warning releases at the end of
the essay. This uses normal page scrolling and a section-bounded sticky column.
On narrow screens (800 CSS pixels and below), the warning stacks above the
argument. On short desktop viewports, it scrolls naturally so text cannot be
stranded below the visible area. No wheel handling or extra scrollbar is added.

## Countdown and cinematic sequence

The countdown is explicitly labeled as a fictional scenario. It begins at
10:00 each time the page loads and uses elapsed time, rather than counting
animation frames. The countdown runs continuously; visitors cannot pause it.
The finale begins only when the ten-minute countdown reaches zero. There is no
manual trigger in either the website or the portable preview.

The full sequence lasts about 24 seconds:

1. The original illustrated door opens on its own hinge, then a metal
   endoskeleton walks through the opening into the foreground. Decorative side
   loops, head brackets, and the raised gun rail have been removed.
2. Three localized muzzle flashes and impact fractures shatter the screen.
3. Flames consume the visible page from the bottom upward.
4. The fire cools, leaving a field of ash.
5. Only then does the Restore button appear.

The animation uses the original doorway's SVG geometry, including its slanted
frame, hinge, glowing edge, and handle. No second rectangular doorway is placed
over the artwork. The robot's starting position comes from that same SVG's
screen coordinates. On phones, the scene scrolls to the illustration below the
headline and returns to the reader's prior location when restored.

Restore brings back the existing page, including the prior scroll position,
selected quote, open disclosures, keyboard focus, and ambient-motion preference.
It starts a fresh ten-minute countdown. No page content is removed or reloaded.
The effect does not modify files, accounts, or other websites.

There is no Skip to ashes button. Restore appears after the sequence ends.
Escape restores the page at any stage. Reduced-motion mode uses a short sequence of static images instead
of walking, gunfire, or a moving burn edge. There is no audio or full-screen
strobe. If canvas is unavailable, the static fallback still supports restoration.

If the clock expires in a background tab, the scene waits until that tab is
visible. Once the scene starts, switching away pauses its playback so it does
not skip straight to the end while you are elsewhere. Scene rendering stops
once the ashes settle, and ambient rendering is suspended during the effect.

## Content notes

The philosophical argument, five premises, stronger conclusion, and author's
personal statement are retained. The PDF is byte-for-byte identical to the
uploaded original. The author's relative phrase “next year” remains in the
original statement, with a contextual note explaining that it is not a rolling
forecast. Author opinion is distinguishable from quotes and research summaries.

A few sourcing problems were corrected during the redesign:

- `If Anyone Builds It, Everyone Dies` is a 2025 book by Eliezer Yudkowsky and
  Nate Soares, not a 2022 essay. The profile now links to Yudkowsky's 2023 TIME
  essay. The unsupported “>95%” headline was removed.
- Bengio's approximately 20% claim was not supported by the cited paper, so the
  profile now presents that paper's actual concerns about unchecked agency.
- The loosely attributed forecast grid was replaced by three dated statements
  with source links. The different capability thresholds are named explicitly.
- The original AI 2027 month-by-month list was not a reliable transcription of
  the scenario. The new sequence explains its acceleration mechanism without
  presenting questionable month labels as milestones.
- The four original quotations are retained. Altman's shortened quotation is
  labeled as an excerpt from the original dossier and linked to Stanford's
  discussion containing the fuller wording and its 2015 context.

This is a presentation of historical statements, not a continually updated
news feed or a claim of agreement among every speaker. It is not an exhaustive
fact-check of every statement in the original dossier.

## Accessibility and responsive behavior

Layouts adapt at 1200, 1040, 680, and 370 CSS pixels, including narrow phones,
portrait tablets, and landscape screens. The menu and research disclosures use
native HTML. Speaker tabs support Left/Right arrows, Home, and End. Escape
closes the mobile menu and returns focus. Focus rings and a skip link are
included. Essential content remains available if JavaScript or canvas fails.

The animation pauses when hidden, outside the viewport, or explicitly paused.
Reduced motion is honored on load and when the operating-system preference
changes. Canvas resolution and particle count are capped for smaller devices.
Printing includes all quotations and expands the research and author details.

## Verification and remaining checks

Automated checks cover document structure, IDs, local links and assets, PDF
integrity, JavaScript syntax, and the actual interaction code against a small
DOM/canvas model. Responsive CSS and narrow-screen sizing were inspected.
The SVG doorway and endoskeleton were rendered and visually inspected. The
original v4.5 logo was verified byte-for-byte against the supplied ZIP. A fake
clock exercised the actual shipped scripts: exact 600-second expiry, countdown
continuous progression, background-tab handling, all scene phases, deferred Restore visibility,
three replay cycles at each model width from 320 to 1920, Escape, reduced
motion, canvas failure, state restoration, and timer/animation-loop cleanup.
Door regression checks cover the exact closed outline, fixed hinge, robot-to-sill
alignment, responsive crops, phone framing, resize, and repeat restoration.
Native SVG renders confirmed that the closed artwork is pixel-identical to the
previous version; closed, partly open, and fully open artwork was inspected.

Those checks are not a browser rendering test or a test on a physical phone or
iPad. Before publishing, review the portable preview in your desktop browser
and check scrolling, navigation, text size, and motion on your actual devices.
External sources are linked; availability and paywalls remain outside this site.

## Publishing

This repository contains the production AI Warnings site. GitHub Pages publishes
from the root of the `main` branch. Open https://thorfabian85.github.io/ai-warnings/
to visit the site. Updates to `main` trigger the existing Pages deployment.

# Work, Life, Laugh & Love | 168

A six part life planning survey you can run in any browser, install on a phone like an app, and print to one page. There are 168 hours in every week. This tool shows you where yours actually go, and helps you decide where they should go next.

Based on Rainer Strack's Strategic Life Portfolio method ("Use Strategic Thinking to Create the Life You Want," TED / Harvard Business Review).

## What it does

The survey walks a respondent through six parts:

1. **The big picture** — Three questions: What does a great life mean to you? What is your life purpose? What should life look like in 3 to 5 years?
2. **Rate your life in base 168** — Rate 16 areas of life (relationships, health, career, finances, community, entertainment, personal care, and more) on Importance and Satisfaction, and allocate all 168 hours of a typical week across them. A live meter tracks the total.
3. **Quick check** — Automatic validation: date confirmed, all areas rated, hours totaling about 168, and no double counted time.
4. **See your portfolio** — A live bubble chart of your life. Satisfaction runs along the X axis, Importance up the Y axis, and bubble size shows weekly hours. The upper left quadrant is where things matter most but aren't getting the attention they deserve. A diagnostics table ranks every area by priority pressure, target hours, and time gap.
5. **Change 3 Things** — The three areas asking loudest for attention become concrete commitments: what better looks like, what to start, what to stop, a first action, a check in date, and a measure of progress.
6. **Your ACTION PLAN** — Everything rolls up into a one page 30, 60, 90 day plan with calculated By dates, benchmarks, and milestones, connecting Part 1 goals to Part 5 objectives.

## Privacy

All answers stay in the respondent's own browser (local storage). Nothing is sent to any server, and there are no accounts, cookies, or analytics.

## Try it / host it

The app is a static site: no build step, no dependencies.

- **Open locally:** open `index.html` in any modern browser.
- **Host it:** upload these files to any static host (GitHub Pages, Netlify, Vercel). All files must sit at the top level of the site, not inside a subfolder. With GitHub Pages: repository Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save, then wait a minute for the address to go live.
- **Install as an app:** once hosted at an https address, open it on a phone — Safari: Share → Add to Home Screen; Chrome on Android: menu → Add to Home screen. It opens full screen with its own icon and works offline.

## Files

| File | Purpose |
|---|---|
| `index.html` | The complete survey app in a single file |
| `manifest.webmanifest` | App identity: name, colors, icons (makes it installable) |
| `sw.js` | Service worker that caches the app for offline use |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | App icons for home screens and stores |
| `podcast-brief.m4a` | The Podcast Brief, a short audio overview played from the intro |
| `HOW TO PUBLISH.txt` | Plain English hosting and installation instructions |

## Updating

Edit `index.html`, then bump the cache name in `sw.js` (`wlll168-v1` → `wlll168-v2`, and so on) so installed copies pick up the new version.

## Printing

Use the browser's print dialog (Ctrl+P, or the browser menu). The page carries print styling: buttons are hidden, answer boxes expand to their full text, colors are preserved, and the Part 6 action plan starts on its own page and fits on one.

## Credits and license

Survey methodology: Rainer Strack, Strategic Life Portfolio.

Copyright 2026 George M Fournier, MBA version 7.16.2026. All rights reserved.

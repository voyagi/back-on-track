# Back on Track — a self-management toolkit for older adults with chronic low back pain

A student toolkit for **Module 7**. It has two halves that work together:

1. **A web app (PWA)** — a simple, offline, install-to-home-screen self-help app for
   people living with ongoing low back pain.
2. **Five fridge magnets** — colour-coded, each with a short message and a QR code that
   opens its matching section of the app. The physical half of the toolkit, and the
   everyday "front door" into the app.

The toolkit is built for a **specific target group**: **older adults (65+) with long-term low
back pain who avoid moving for fear of doing harm**. That fear leads to less activity, weaker
muscles, and a real risk of **losing their independence** — the specific problem this toolkit
tackles. Every design choice below is for them, lower health literacy included.

> **Disclaimer shown in the app:** This app is for older adults with long-term back pain who
> worry that moving will cause harm, after a clinician has checked it. It supports, but does not
> replace, your physiotherapist or doctor.

---

## Why this design (health literacy first)

The big self-management apps assume a clinician sets them up, good reading ability, and a
data connection. This one is the opposite, on purpose:

- **Animation-first, few words.** Each exercise shows a looping movement demo; short
  sentences, one idea per line (~grade-6 reading level).
- **Big text, big buttons** (56px minimum) for older hands and eyes.
- **A traffic-light colour system** that needs no reading to understand:
  green = move, amber = bad day go gentle, red = get checked. Blue = learn, purple = your why.
- **English and Dutch.** A 🌐 toggle switches the whole app live; it auto-starts in Dutch on
  a Dutch phone, and a Dutch magnet QR opens it in Dutch.
- **Works offline and with no account.** Open it anywhere, anytime. Nothing to log into.
- **Nothing leaves the phone.** All data (your goal, check-ins, progress) is stored on the
  device only — no servers, no personal data collected (privacy by design / GDPR-friendly).

## Evidence base (for the LO1 literature study)

- **Pain Neuroscience Education (PNE)** — the "Understand" lessons ("hurt isn't harm",
  "your back is strong", "movement is medicine"). Strong evidence for reducing pain,
  disability and fear in chronic low back pain.
- **Stay-active / graded movement** — the gentle exercise routine and the "keep moving on a
  bad day" flare plan, in line with first-line back pain guidelines.
- Replace the placeholder citations with the actual articles you appraise for LO1.

---

## Run it locally

No build step, no dependencies. You need Node (only for the tiny preview server):

```bash
node tools/serve.cjs
# then open http://127.0.0.1:5178
```

Open your browser's device toolbar (phone view) for the intended look. The service worker
caches the app on first load, so you can then switch off the network and it still opens.

## Put it online (so the magnet QR codes work)

The QR codes need a real public address. Easiest free options (static hosting):

- **Cloudflare Pages** or **GitHub Pages** or **Netlify**: drag-and-drop / connect this
  folder. You get a URL like `https://back-on-track.pages.dev/`.
- Once live, open `magnets.html`, paste that URL into the address box, click **Update QR
  codes**, then **Print / Save PDF**.

---

## The fridge magnets

Five magnets, in **English or Dutch** (pick the language in `magnets.html`, then Print /
Save PDF; it lays them out at 60 × 60 mm). Each QR opens
`<app-url>?from=magnet&lang=<en|nl>#/<section>`, so a Dutch magnet opens the app in Dutch.
The app shows a small "Opened from your magnet ✓" confirmation so you can demo the link live.

| # | Colour | Hex | What it says | Subline | Opens |
|---|--------|-----|--------------|---------|-------|
| 1 | Green  | `#2E7D32` | **Move a little, often** | Today's gentle exercises | Daily exercises |
| 2 | Blue   | `#1565C0` | **Hurt isn't harm** | Understand your back | Pain-education lessons |
| 3 | Amber  | `#E36209` | **Bad day?** | Open your flare-up plan | Flare-up plan |
| 4 | Purple | `#6A1B9A` | **Remember your why** | Your goal | Personal goal |
| 5 | Red    | `#C62828` | **When to get checked** | Warning signs | Red flags / safety |

**Why these colours:** it is a traffic light the patient already understands without
reading — green go, amber caution, red stop — plus blue (calm/learn) and purple (personal).

**Where to put them (so it is "wherever and whenever"):**
green on the fridge or kitchen counter, blue by the kettle or armchair, amber on the
bathroom mirror or bedside, purple on the fridge door (motivation in sight), red inside a
kitchen cupboard or as a wallet card.

The QR codes use **high error correction**, so they still scan even with rounded magnet
corners or a small scratch.

---

## What is left to add (and is meant to be — this is a demo)

- **Exercise videos (optional upgrade).** Each exercise ships a clean looping animation. If
  you want real footage, film the six moves yourself (phone on a tripod, 10–20 seconds each)
  and drop them in. Filming with your **real patient's** feedback is exactly the "applied in
  practice" evidence that pushes LO1/LO2 to *above expected level*.
- **More languages.** English and Dutch are built in (`content.js`). Adding a community
  language (e.g. Turkish or Arabic) would further address the cultural-context criterion.

## How it maps to the Module 7 learning outcomes

- **LO2 (main):** informs a specific target group, time-and-location independent (offline
  PWA + magnets), socio-economic/cultural context (low-literacy design, translatable),
  about self-management, to improve quality of life (goal-setting). *Above level:* trial it
  with a real patient and offer 2+ formats (app, magnet, plain leaflet), evaluating which
  suits whom.
- **LO1:** the literature study behind the PNE and exercise content, which you then teach
  peers. *Above level:* actually carry out the Apply + Audit steps (trial + evaluate).
- **LO3:** the red "When to get checked" section shows you know the boundaries of the
  profession and informs the patient (a stakeholder) accordingly.

## File map

```
index.html            app shell
styles.css            design system (colours match the magnets)
app.js                router + on-device state + screens
content.js            ALL patient text, English + Dutch (edit/translate here)
exercise-anim.js      looping SVG demonstration per exercise
manifest.webmanifest  install metadata
sw.js                 offline service worker
icon.svg / icon-*.png app icons (SVG + 180/192/512 PNG for iOS/Android)
magnets.html          printable 5-magnet sheet, English or Dutch
vendor/qrcode.js      QR generator (MIT, Kazuhiko Arase) — used only by magnets.html
tools/serve.cjs       tiny local preview server
CLINICAL-BASIS.md     evidence basis + citations for the clinical content
LEARNING-OUTCOMES.md  how the toolkit maps to the 6 Module 7 outcomes
PATIENT.md            de-identified target-patient profile (real case kept private, not here)
TESTING.md            real-world tests to run yourself (print, phone, clinical)
```

## Gotchas for future edits

Non-obvious invariants that will bite a cold reader (or a future you):

- **Exercise ids must match in three places:** `content.js` `exercises[].id`, the keys in
  `exercise-anim.js`, and `flare.gentleRoutine`. A mismatch silently drops an animation or a
  flare-routine card.
- **`content.js` `en` and `nl` must stay structurally identical** (same keys). A key in one language
  but missing in the other renders the literal word "undefined" on screen.
- **Bump `CACHE` in `sw.js`** (`bot-v10` → `bot-v11` …) whenever you change any cached file, or
  returning users keep the old version from the service-worker cache.
- **The app is intentionally one file (`app.js`)** — small enough that splitting adds more friction
  than it removes. The `/* ---- section ---- */` banners are the map.
- **`magnets.html` has no `?base=` URL override** (removed for safety); change the live address in
  the file or via the on-screen input box.

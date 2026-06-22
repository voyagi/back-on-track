# Back on Track

Back on Track is a static, offline-capable self-management toolkit for older adults with ongoing low back pain who avoid movement because they worry it will cause harm.

It has two parts:

1. A progressive web app with daily exercises, pain education, a flare-up plan, goal setting, progress sharing, and safety guidance.
2. Printable fridge magnets with QR codes that open the matching app section in English or Dutch.

The product is intentionally small. It has no account system, no analytics, no backend, and no package dependencies. The only saved data is the user's goal, check-ins, and exercise completion, stored in that browser.

## Design Direction

The interface uses the "Kitchen Table Clinic" design language:

- Warm paper background, strong ink, and calm clinical accent colors.
- Atkinson Hyperlegible and Source Sans 3 as the intended type pairing, with readable local fallbacks.
- Large tap targets, plain language, and one main action per screen.
- Text badges instead of emoji icons, so the UI works for older adults and assistive tech.
- Light and dark mode support.

The five color meanings are:

- Green: move.
- Blue: understand.
- Amber: bad day plan.
- Plum: personal goal.
- Red: get checked.

## Clinical Scope

This app supports self-management after a clinician has checked the person. It does not replace a physiotherapist, GP, or emergency care.

The safety screen lists warning signs that need medical review. Clinical rationale and source pointers live in `CLINICAL-BASIS.md`. A qualified physiotherapist or tutor still needs to sign off the final wording before it is used with a real patient.

## Privacy

Back on Track is privacy-minimal by design:

- No account.
- No network API.
- No analytics.
- No third-party runtime calls.
- No server-side storage.
- A clear "Clear my data" button in the progress screen.

See `PRIVACY.md` for the full privacy note.

## Local Preview

No install step is needed.

```bash
node tools/serve.cjs
```

Then open `http://127.0.0.1:5178`.

The service worker caches the app after first load. Bump `CACHE` in `sw.js` whenever a cached file changes.

## Printable Magnets

Open `magnets.html`, choose English or Dutch, confirm the app address, then print or save as PDF.

Each QR opens:

```text
<app-url>?from=magnet&lang=<en|nl>#/<section>
```

The magnet tool accepts HTTPS URLs and local preview URLs only. It does not accept a hidden `base` query parameter, because a crafted link must not be able to silently repoint printed QR codes.

## Quality Scripts

```bash
npm run lint
npm run typecheck
npm test
npm run coverage
npm run build
```

Browser verification uses the local preview server:

```bash
node tools/serve.cjs
dev-browser --headless --browser back-on-track-e2e --timeout 20 run tools/verify.dev.js
```

## File Map

- `index.html`: app shell and CSP.
- `styles.css`: design system and responsive app layout.
- `app.js`: hash router, state sanitization, and screen rendering.
- `content.js`: all English and Dutch patient-facing text.
- `exercise-anim.js`: inline SVG movement demos.
- `manifest.webmanifest`: install metadata.
- `sw.js`: offline service worker.
- `magnets.html`: printable QR magnet sheet.
- `vendor/qrcode.js`: vendored QR generator.
- `tools/serve.cjs`: local preview server.
- `tools/verify.dev.js`: browser smoke and screenshot check.
- `CLINICAL-BASIS.md`: clinical rationale.
- `LEARNING-OUTCOMES.md`: assignment mapping.
- `PATIENT.md`: de-identified target profile.
- `TESTING.md`: real-device and clinical checks.

## Editing Invariants

- Exercise ids must match `content.js`, `exercise-anim.js`, and `flare.gentleRoutine`.
- The `en` and `nl` objects in `content.js` must keep the same structure.
- Do not add analytics, remote fonts, or account flows without a privacy review.
- Do not publish real patient details. Use local `*.local.*` files only.

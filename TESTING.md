# Testing checklist — the real-world tests only you can do

Most of the app is verified in an automated browser (offline mode, the language toggle,
the animations playing, the share button, corrupted-data resilience, no console errors).
The items below need a **real phone, a printer, or a physiotherapist** — I cannot do them,
so please run through these before you rely on the toolkit with a real patient.

## 1. Print and scan a magnet (highest priority)

This is the single riskiest unknown: I optimized the QR codes for print but never printed one.

1. Open `magnets.html` on a computer, pick the language, click **Print / Save PDF**.
2. Print at the intended size (60 × 60 mm) on the actual magnet material you will use.
3. Scan each of the five QR codes with a phone camera (try both an iPhone and an Android if you can).
4. Confirm each opens the **correct section** of the app, in the **correct language** (a Dutch magnet should open the app in Dutch).

If a code does not scan reliably: try a matte (non-glossy) finish, print slightly larger, and keep a white border around the code.

## 2. Install on a real iPhone

1. Open https://voyagi.github.io/back-on-track/ in **Safari** on an iPhone.
2. A tip should appear: tap the **Share** button, then **Add to Home Screen**.
3. Confirm the home-screen icon and name ("Back on Track") look right.
4. Open it from the home screen and confirm it runs full-screen (no Safari bars).

Installing matters for more than looks: on iOS, an installed app's saved data is far more durable
than a plain Safari tab (Safari can clear a tab's data after ~7 days of no use). For a multi-week
trial, **have the patient add it to their home screen**.

## 3. Install on Android

Open in Chrome. You should see an "Add this to your home screen" prompt, or use the browser
menu → Install / Add to Home screen. Confirm it installs and opens standalone.

## 4. Offline on a real device

(Automated test passed, but confirm on the actual phone.) After installing, turn on airplane mode,
open the app, and confirm it still opens and the exercises/lessons work.

## 5. Native share on a real device

Open **My progress**, tap **Share with my physio**, and confirm the phone's share sheet appears
with the summary text (WhatsApp, email, etc.). On a desktop without share support it copies to the
clipboard instead.

## 6. Data persistence across the trial

Use the app on a few different days, then reopen it after a week and confirm the progress (active
days, feeling trend) is still there. If it ever disappears on iOS, the cause is almost certainly
that it was used in a Safari tab rather than installed to the home screen (see step 2).

## 7. Clinical sign-off (the grade depends on this)

I am not a physiotherapist. See `CLINICAL-BASIS.md` for the evidence each exercise, red flag, and
education message is grounded in, but the final check against **your Fontys course material and a
tutor** is yours to do. Confirm the exercise selection, the rep dosages, the red-flag wording, and
the pain-education framing are what your programme expects.

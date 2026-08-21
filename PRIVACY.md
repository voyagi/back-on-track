# Privacy Notice

Back on Track is a static self-management tool. It does not run a backend service and does not create user accounts.

## What Is Stored

The app stores the following in the browser on the user's device:

- Chosen language.
- Personal goal.
- Exercise completion by day.
- Daily back-feeling check-in.

This storage is needed so the app can show progress and remember the user's goal.

## What Is Not Collected

Back on Track does not collect:

- Names.
- Email addresses.
- Account identifiers.
- Location.
- Analytics events.
- Advertising data.
- Server logs from the app itself.

Static hosting providers may keep ordinary access logs for security and operations. This repository does not add application-level tracking.

## Sharing

The progress screen can share a summary through the device share sheet or copy it to the clipboard. Sharing happens only when the user presses the share button.

## Deleting Data

The progress screen includes Clear my data. It removes the goal, exercise history, and check-ins from that browser while keeping the language preference.

Users can also clear the site's browser storage through browser settings.

## Legal Basis

For the app's local storage, the basis is functional necessity: the data is required for a requested offline self-management feature. No non-essential cookies, analytics, or marketing storage are used.

## Controller And Rights

For coursework use, the person or organization deploying the app is the controller. Users can exercise access, rectification, erasure, restriction, portability, objection, and complaint rights through that controller.

Built-in support:

- Access: the progress screen shows the stored goal, exercise count, activity range, and feeling trend.
- Rectification: the user can edit and save the goal.
- Erasure: Clear my data removes browser-stored progress.
- Portability: Share with my physio exports a plain-text progress summary through the device share sheet or clipboard.

Restriction, objection, and complaints are handled by the deploying controller because this static app has no server account or central user record.

## Processing Register

Record of processing activity:

- Purpose: support self-management after clinical screening.
- Data categories: language preference, goal text, exercise completion, daily feeling check-in.
- Data subjects: app users who choose to store progress locally.
- Recipients: none by default. The user may choose to share a progress summary.
- Retention: browser storage until the user clears it or the browser removes it.
- Security measures: CSP, local-only storage, state sanitization, no analytics, no remote runtime calls.

## Hosting And Vendors

The app can be hosted as static files. GitHub Pages or another static host may process ordinary access logs such as IP address and user agent for security and operations. No application-level personal data is sent to the host by Back on Track.

No DPA is required for application data when the app is used only as static files with no account, analytics, or server-side storage. If a deployment adds analytics, accounts, forms, or a backend, the controller must update this notice and complete vendor DPA checks before use.

## Breach Response

Because Back on Track has no central application database, the main breach risks are repository leaks, hosting account compromise, or accidental publication of real patient notes. If a breach may involve personal data, the controller must assess risk, document the incident, notify the Autoriteit Persoonsgegevens within 72 hours when required, and inform affected people when risk is high.

## Contact And Clinical Limits

This is not a medical record system and must not be used to store identifying patient notes. Real trial notes belong in private course material or clinical systems approved for that purpose.

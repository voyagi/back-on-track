# Security Notes

Back on Track is a static PWA with no backend API, no account system, and no third-party runtime calls.

## Current Protections

- Content Security Policy on the app shell.
- Browser-only local storage with state sanitization before use.
- DOM API rendering for app screens instead of assembled HTML.
- QR magnet tool validates app URLs and accepts HTTPS or localhost only.
- No analytics scripts.
- No remote fonts.
- No committed `.env` files.
- Local preview server binds to `127.0.0.1` and rejects path traversal.

## Threat Model

Primary risks are:

- XSS through user-entered goals or corrupted local storage.
- Printed QR codes being silently repointed to a hostile site.
- Accidentally publishing real patient details.
- Service-worker cache serving stale files after an update.
- Over-trusting the app as clinical advice.

Mitigations are built into the app and docs:

- User text is rendered with `textContent`.
- Stored state is sanitized on load.
- `magnets.html` does not accept hidden query-string base URL overrides.
- `*.local.*` files are ignored by git.
- `sw.js` cache name must be bumped when cached files change.
- Clinical sign-off is tracked as a human-only task.

## Reporting

For this coursework project, report issues through GitHub issues or a private message to the repository owner. Do not include real patient data in reports.

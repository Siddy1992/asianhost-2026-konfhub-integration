# Change log

## 16 November 2026 — KonfHub declaration removed

- Removed the KonfHub Declaration / Consent custom field (historical ID `186672`) from all URL-prefill variants and mandatory-field checks, including when the historical fallback snapshot still contains it.
- Kept the AsianHOST site's local policy acknowledgement without forwarding it to KonfHub.
- Removed the duplicate declaration checkbox from checkout; preserved dietary preference completion for old pending registrations.
- Repositioned Basic name/email prefill as recommended; labeled Full prefill experimental until vendor backend validation.
- Added one-field diagnostic presets for Registration ID and Institution, and retained Country, Phone, Dietary and full combinations.
- Updated 13-ticket audit guidance, GitHub deployment checklist, troubleshooting documentation and offline regression tests.
- Preserved registration fee categories, paper-selection/Other workflow, invoice preview, coupons (KonfHub managed), status lookup, policy pages and local launcher.

**Important:** A KonfHub registration attempt or successful URL construction is not proof that its server accepted every prefilled field or that payment succeeded.

# Release verification — no-declaration package

The bundled historical public ticket metadata is retained for reproducible tests. It contains retired form `186672`; the runtime explicitly ignores it.

Offline checks: syntax, 13 ticket mappings, fees, field mapping, removed-field exclusion, missing dietary recovery, local policy acknowledgement, browser-level prefill links, manual paper entry, status lookup, coupon safeguards, invoice preview and legal policy pages.

**Not verified:** live KonfHub backend acceptance of experimental full prefill, actual payments, webhook reconciliation, tax/processing-fee policy or settlement. A red KonfHub profile-update toast can persist even after this frontend change. See `KONFHUB_NO_DECLARATION_SETUP.md` for vendor escalation steps.

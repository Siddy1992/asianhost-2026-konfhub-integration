# KonfHub → AsianHOST Verified Registration Backend: Implementation Contract

This file is an engineering specification for Cygnus or the organizer's backend developer. It is **not a claim that the GitHub Pages demo already has a live backend**. The static frontend intentionally does not mark payments as paid.

## Event identity

- KonfHub event slug: `asian-host-ticketing`
- Public tickets API: `GET https://api.konfhub.com/event/url/asian-host-ticketing/tickets`
- Private attendees API (server only): `GET https://api.konfhub.com/developers/event/{event-id}/attendees/private` with `x-api-key` header.
- KonfHub registration webhooks: configure in **Developers → Webhook** after obtaining the actual sample payloads.

Do not confuse the **free-registration API** shown in KonfHub's Developers → API Integrations with the paid checkout. For paid tickets, the frontend uses KonfHub's hosted checkout.

## Suggested database schema

`registrations`: `id` (AH26 reference, unique), `email_normalized`, `name`, `purpose`, `category`, `period`, `expected_amount_inr`, `paper_id`, `paper_title`, `phd_reference`, `konfhub_ticket_id`, `konfhub_booking_id`, `konfhub_payment_id`, `status`, `verified_at`, `created_at`, `updated_at`.

`payment_events`: `id`, `provider`, `provider_event_id`, `event_type`, `payload_digest`, `received_at`, `verified_at`, `verification_result`. Use a uniqueness constraint to make repeated webhook delivery idempotent.

## API endpoints to implement

- `POST /api/registrations`: validate purpose/category/paper rules and fee **server-side**, create pending registration, return a non-guessable `AH26-...` ID. Never trust the amount supplied by browser JavaScript.
- `POST /api/webhooks/konfhub`: accept KonfHub notifications only after confirming the provider's supported authentication method; independently verify the attendee with KonfHub's private API before changing status. Log and retry unverified notifications.
- `GET /api/registrations/{id}/status`: require verified email ownership or a one-time lookup token, rate-limit, and return minimal data. Email + guessable reference alone is not sufficient for sensitive personal data.
- `GET /api/registrations/{id}/invoice`: authenticated access to a verified invoice/receipt if issued by SRIC; do not use the sample invoice as an official tax invoice.

## Verification criteria

- Match KonfHub **event ID**, **ticket ID**, **AsianHOST Registration ID** custom field, **participant email**, and **booking ID**.
- Require verifiable evidence of completed payment (or an approved zero-value waiver). A webhook alone is not proof of settlement.
- Confirm expected INR ticket fee, including separately accounted GST and platform charges. Do not compare the gross checkout total with the face value without understanding tax/fee handling.
- Check for refunds, cancellations, duplicate bookings, and mismatched categories.
- Do not auto-confirm IEEE eligibility or the one-full-registration-per-paper rule merely because a payment succeeded.
- Treat invalid signatures, unknown event IDs, missing payment IDs, missing custom reference, and network errors as **pending/manual review**, not `paid`.

## Information still required from KonfHub

1. A real redacted registration webhook sample and cancellation webhook sample.
2. The documented webhook authentication/signature method, retry policy, and delivery IDs.
3. The private attendees API response for a test paid registration (redacted).
4. Confirmed settlement reports, fee breakdown, and transaction/booking identifiers.
5. Confirmation that the custom AsianHOST Registration ID field is returned in the private attendee API.

Do not store private API keys, webhook secrets, attendee exports, or bank details in this public repository. Use a backend secret manager.

# KonfHub “Error updating user profile” — Checkout troubleshooting (16 Nov 2026)

## Observed evidence

The organizer screenshot shows the hosted KonfHub **Step 3: Checkout** page with the correct **IEEE Member - Early** ticket, **₹50,000** and a red toast: **“Error updating user profile”**. The screenshot does not show a payment attempt or payment failure. It does show **4.43% processing fee** for several payment methods and **5.9%** for another card method; verify with KonfHub/SRIC who bears these fees. The Proceed to Payment button is grey while no method is selected.

The previous AsianHOST website generated a checkout URL containing `name`, `email_id`, `organisation`, `whatsapp_number`, `phone_number`, and custom form IDs. KonfHub's error might be due to invalid or conflicting user-profile values, an existing profile/session, an unsupported prefill parameter, or a KonfHub backend error. The screenshot does not establish which.

## What changed in this package

Only checkout integration and associated UI/tests/documentation have changed. All other AsianHOST pages and business rules remain untouched.

The checkout now offers three links for the **same mapped ticket ID**:

1. **Basic prefill (default):** `ticketId`, `name`, `email_id`. Try this first for normal test flows.
2. **Full participant prefill (experimental):** name, email, institution, supported custom forms, and a plausible phone number via the public form's `form_id`. The previous ambiguous duplicate `whatsapp_number` and `phone_number` URL keys have been removed. **Full prefill still requires live confirmation.**
3. **Ticket-only checkout:** `ticketId` alone. This is the best isolation test for profile-update errors; enter the details manually.

These links never update payment status and do not submit a payment. Consent is never preselected. The local public-ticket snapshot is a fallback, not authoritative proof of live price/availability.

## Step-by-step isolation procedure

1. Open the checkout from your AsianHOST demo. Confirm the ticket ID and fee.
2. In an **incognito/private window**, choose **Ticket-only checkout**. For the screenshot's IEEE Member - Early ticket, the direct diagnostic URL is:
   `https://konfhub.com/checkout/asian-host-ticketing?ticketId=127187`
3. Use a real, valid email you control and a valid phone number (not `alex@example.org` or other placeholders). Complete attendee details and advance only to the payment selection screen. **Do not make a real payment for a test.**
4. If the error disappears, repeat with **Basic prefill**. If it recurs, the basic profile fields or KonfHub profile/session behavior need investigation.
5. If Basic prefill works, test **Full participant prefill**. Compare which custom fields are actually populated. If Full alone fails, collect the field keys and a redacted URL; avoid transmitting the attendee's full personal data in support tickets.
6. If Ticket-only also fails, contact KonfHub support with event slug `asian-host-ticketing`, ticket ID `127187`, timestamp/timezone, a screenshot and the exact toast. Ask them to inspect the server-side profile-update validation/logs.
7. Before live payments, confirm the settlement bank account, 18% GST treatment, payment processing fees and correct Early/Regular ticket schedules. The screenshot of the ticket editor still shows Early closing 30 Nov at **6:00 p.m. IST**, not the intended **11:59 p.m. IST**.

## Important limitations

- A GitHub Pages frontend cannot repair a KonfHub server-side profile-update failure or verify paid registrations.
- A successful move to KonfHub Step 3 is **not** evidence of payment completion.
- Name/email/custom-field values in checkout URLs can be exposed in browser history, logs and referrer chains; do not pass passports, payment data or other sensitive documents via URL.
- Do not treat the `alex@example.org` demo registration as a genuine registrant.
- Official payment reconciliation requires a trusted backend, KonfHub webhook handling and verification.

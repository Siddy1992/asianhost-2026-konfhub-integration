## 16 November 2026 — Extended early deadline and KonfHub integration hardening

- Early-rate cutoff extended to 30 November 2026 at 11:59 p.m. IST; regular rates begin 1 December.
- One shared `registration-config.js` controls registration and checkout dates and amounts.
- Pending orders made under the old cutoff are automatically corrected to the applicable current fee at checkout.
- Prevent selecting the higher regular rate during the early-registration window.
- Public ticket metadata is merged from KonfHub and local fallback; diagnostics now checks IDs, prices and registration-reference fields.
- Production blockers remain: real ticket/form metadata, KonfHub availability, SRIC settlement, GST confirmation, webhook verification.

# AsianHOST 2026 — Invoice Button and Regression Audit (3 November 2026)

## Corrected omission

The previous package had `invoice.html`, `invoice.js`, and `invoice.css`, but **did not provide buttons to open the invoice from the confirmation or status screens**. This is fixed:

- Confirmed paid or complimentary registrations: **View / Print Invoice Preview** on success confirmation and successful status lookup.
- Browser-created confirmed registrations: **Request Official Invoice** mailto link to Siddhartha (illustrative request flow).
- Invoice preview: enabled **Print / Save as PDF** button and visible SAMPLE watermark.
- Failed and pending records: no invoice preview button.
- Official invoice remains **available upon request at a later date**; the sample layout is not a tax invoice or receipt.

## Regression safeguards

Expanded browser checks now verify the actual invoice action on both screens, the invoice preview rendering, the print control, 100% coupon flow, manual paper entry, all INR rates, early-registration cutoff, sample status records, refund cutoff, contacts and mandatory policy links.

## All earlier features retained

- 100% coupon entry and complimentary ₹0 confirmation without gateway redirection.
- Printable sample invoice layout and invoice-request instructions.
- 12 accepted papers plus **Other** paper ID/title entry.
- Eight INR fee categories, mandatory full-paper registration, IEEE/student verification notes.
- 30 November 2026 11:59 p.m. IST early cutoff; 1 December regular/on-site rates.
- ₹10,000 organizer-authorized IEEE category-correction example.
- Simulated success/failure, registered-email notifications described for production, browser-local status lookup and three fictional records.
- Terms, Refund & Cancellation, Privacy, About & Contact pages.
- 5 December 2026 11:59 p.m. IST refund request cutoff; Prof. Sarani Bhattacharya (`bhattacharya.sarani.iitkgp@gmail.com`).
- Contact addresses: `joydeepchow@gmail.com`, `siddhartha.chowdhury92@gmail.com`.
- Detailed 17-section developer README, coupon generator in private developer tools, and production integration requirements.

## Deployment boundary

This is a static developer reference, not a live gateway, mail system, official invoicing service, or persistent database. Official invoices, secure coupon redemption, fee deadlines, eligibility checks and payment confirmation require a trusted backend. Refund processing fee of ₹5,000 remains subject to organizing-committee approval.

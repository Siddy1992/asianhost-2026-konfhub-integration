# AsianHOST 2026 — November 30 Deadline & KonfHub Checkout Setup

**Version:** 16 November 2026 · **Editable source:** all website files are included.

## 1. Agreed registration window

The website is configured for **early registration through 30 November 2026, 11:59 p.m. IST**, with **regular/on-site pricing starting at 00:00 IST on 1 December 2026**. This is configured in `registration-config.js`. Fixed-fee categories (Indian Student General, PhD Forum International and Indian) are unchanged.

**IMPORTANT SCREENSHOT DISCREPANCY:** The supplied KonfHub screenshot of **IEEE Member – Early** shows **Ends On: 30/11/2026, 06:00 p.m. IST**, SIX HOURS before the intended end-of-day cutoff. Before taking payments, edit KonfHub to **30/11/2026, 11:59 p.m. IST** for **all five early tickets**. If the committee actually wants a 6:00 p.m. deadline, change `REGULAR_START_ISO` to `2026-11-30T18:00:00+05:30` in `registration-config.js` and set all regular ticket opening times to the same instant. Do not allow the website and KonfHub to disagree.

## 2. Update KonfHub (Event Info → Tickets)

For EACH of these five **Early** tickets, verify fee and set **Ends On: 30 November 2026, 11:59 p.m. IST**:

| Ticket | Fee (INR) |
|---|---:|
| IEEE Member - Early | 50,000 |
| Non-IEEE Member - Early | 60,000 |
| IEEE Student - Early | 15,000 |
| Non-IEEE Student - Early | 25,000 |
| IEEE Life Member - Early | 25,000 |

For EACH of these five **Regular** tickets, set **Opens On: 1 December 2026, 12:00 a.m. IST** (or the earliest equivalent time supported by the interface):

| Ticket | Fee (INR) |
|---|---:|
| IEEE Member - Regular | 60,000 |
| Non-IEEE Member - Regular | 70,000 |
| IEEE Student - Regular | 25,000 |
| Non-IEEE Student - Regular | 35,000 |
| IEEE Life Member - Regular | 35,000 |

For the three fixed-fee tickets, verify availability through the relevant registration period:

- Indian Student - General: ₹2,000
- PhD Forum - International: ₹15,000
- PhD Forum - Indian: ₹5,000

Remove or hide the generic **Regular Ticket** if it is an accidental duplicate. Ensure all 13 intended tickets are enabled, not marked sold out or hidden unintentionally. Check per-order quantity and total limits; do not assume a quantity value of `0` means unlimited. Verify ticket names against the diagnostics page.

## 3. Tax and payment setup: MUST confirm before live payments

The supplied KonfHub screenshot shows **GST 18%** for the IEEE Member Early ticket, and the **HSN/SAC field is blank**. Confirm with SRIC/finance whether each published fee (e.g. ₹50,000) is GST-inclusive or exclusive, which tax rate applies, and the correct HSN/SAC. If 18% is added to ₹50,000, the ticket checkout may show ₹59,000 before other charges. Do not silently advertise ₹50,000 as the final amount if checkout adds tax. Verify the final amount for each ticket and review the KonfHub payment-method/fee configuration. Confirm SRIC-approved settlement account, KYC and activation; earlier screenshots indicated automatic settlement disabled for incomplete bank details.

## 4. Attach forms to every ticket (Event Info → Forms)

Confirm **AsianHOST Registration ID** is a required text field on every relevant ticket, plus registration purpose, paper ID/title (for authors), PhD Forum reference (for PhD Forum), IEEE membership number (where applicable), institution, country, phone, dietary restrictions, and consent as approved by the committee. Make sure the options for Registration Purpose match **Paper Author**, **General Participant**, **PhD Forum Participant**. Do not auto-check consent. Avoid making irrelevant fields mandatory for all categories. Test Indian phone number validation with the actual checkout.

## 5. Configure widgets (Developers → Widgets)

Your existing widget `eaa9296e-ad76-4de9-bdc1-06a0c1ce1e1d` is retained as the **manual Indian Student – General fallback** in the site. In KonfHub, edit the existing widget if you want it to offer all 13 ticket variants as a temporary all-ticket manual checkout, or create a separate all-ticket widget. Do not change the fixed-widget ID in `checkout.html` without verifying its ticket configuration. An iframe cannot receive automatic prefilling from your page because it is cross-origin. The ticket-specific KonfHub checkout URL is the intended automated-prefill path.

## 6. Obtain real KonfHub ticket/form IDs (needed to finish the integration)

Open `konfhub-diagnostics.html` on the deployed website. The website attempts to fetch **public** ticket metadata from `https://api.konfhub.com/event/url/asian-host-ticketing/tickets`, then merges a local fallback file `konfhub-public-tickets.json`. The endpoint could not be verified from this development environment. If the diagnostics shows fewer than **13 mapped**, obtain the actual public ticket metadata from KonfHub or Mohit, and place it in `konfhub-public-tickets.json` (JSON object with `tickets` array). Each entry should have a **real** `ticket_id`, exact `ticket_name`, `ticket_price`, and public `forms` metadata with `form_id`/`form_name` where provided. Do not invent ticket IDs. Do not upload private API keys, attendee exports, bank details, or payment credentials.

Diagnostics distinguishes ticket mapping from registration-ID field prefilling. The goal is **13/13 mapped** and ideally **13/13 registration-ID-prefill ready**. Check that checkout opens the intended ticket and pre-populates name, email, institution, phone and reference. Some dropdowns may require manual selection depending on KonfHub's supported prefill keys.

## 7. Website flow and correction for previously created orders

1. Visitor selects registration purpose and completes the original AsianHOST form.
2. While early rates are active, the website automatically selects the **early** rate and disables the regular-rate button to avoid accidental overpayment.
3. Review page generates a browser-local `AH26-...` registration reference and navigates to `checkout.html?id=...`.
4. A **pending** order created during the earlier incorrect 15 November cutoff is automatically corrected to the current eligible early fee on checkout. Paid records are not rewritten.
5. If the correct public ticket metadata is available, the website creates a ticket-specific KonfHub checkout link and pre-populates supported fields. Consent is not auto-accepted.
6. If no matching ticket metadata exists, the website **does not send the visitor to an incorrect-priced ticket**. The fixed ₹2,000 widget is available only for Indian Student General as a manual fallback; otherwise it links to the KonfHub event page for manual selection.
7. Completing KonfHub payment **does not** mark the GitHub Pages browser-local record paid. The authoritative registration and payment status is held by KonfHub until a backend webhook verification service is implemented.

## 8. Deploy to GitHub Pages (existing new repository)

The intended repository is `https://github.com/Siddy1992/asianhost-2026-konfhub-integration`. Unzip the package, upload/commit the **contents of the website folder to the repository root** (not the ZIP itself). Keep GitHub Pages at **Settings → Pages → Deploy from a branch → main → /(root)**. Check `https://siddy1992.github.io/asianhost-2026-konfhub-integration/` after deployment.

If you already have the repository cloned, copy the updated files into the clone and run:

```bash
git add .
git commit -m "Extend AsianHOST early registration to Nov 30 and improve KonfHub checkout"
git push origin main
```

Run local checks:

```bash
bash LAUNCH_WEBSITE_LINUX_MAC.sh
node developer_tools/test_konfhub_integration.js
python3 developer_tools/verify_package.py
python3 developer_tools/regression_suite.py
python3 developer_tools/test_nov30_flow.py
```

## 9. What still requires backend work

GitHub Pages is static and cannot securely verify KonfHub payments or receive private webhooks. Cygnus or another authorized backend must implement webhook intake, independently verify transactions against KonfHub, reconcile `AH26-...` reference to ticket/booking/payment ID, and update a persistent status database. See `backend/INTEGRATION_CONTRACT.md`. Coupons and fee waivers must be configured in KonfHub, not trusted from public JavaScript. Institutional approval and a successful non-financial test should precede any real payment.

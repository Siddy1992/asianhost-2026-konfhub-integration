# KonfHub integration — no declaration field (16 Nov 2026)

## 1. Observed problem and scope

The organizer reports that the mandatory **Declaration / Consent** field has been removed from the KonfHub portal. The prior screenshots show that the KonfHub checkout still produced **“Error updating user profile”** for full custom-field prefill, even when the registration attempt was created. This error is not proof of failed payment, and it cannot be resolved definitively by editing static website code alone.

The historical public API snapshot bundled with this package was captured **before the removal** and still includes form `186672`. This release excludes that form from runtime matching, required-field validation and generated URLs, even when using the old snapshot. Do not edit the historical snapshot to pretend it is live.

## 2. What changed

- **Removed from all prefill URLs:** KonfHub custom form `186672` (Declaration / Consent).
- **Removed from checkout:** second declaration checkbox and consent-dependent prefill gating.
- **Kept locally:** AsianHOST terms/refund/privacy acknowledgement at registration review. It is not sent as a KonfHub field.
- **Retained:** dietary preference form `186671`, institution `186632`, AsianHOST Registration ID `186665`, registration purpose `186666`, paper ID `186667`, paper title `186668`, IEEE number `186669`, GSTIN `186670`, country `186633`, phone `186634`, when present on the selected ticket.
- **Retained:** 13 ticket variants, deadlines, coupons handled by KonfHub, invoice preview, registration status and policy pages.

## 3. Checkout paths

**Basic prefill (recommended):** `ticketId`, `name`, `email_id` only. This was observed to reach KonfHub checkout without the profile-update error.

**Experimental full prefill:** basic fields plus active fields matched to the selected KonfHub ticket's current public form metadata. It never includes `186672`. This mode is not confirmed working on KonfHub's backend.

**Field-isolation laboratory:** `prefill-lab.html?id=AH26-...` is linked from checkout. Start from Basic and add one field at a time. The tests open a KonfHub page but do not pay. Capture which **single** field first triggers the red error.

**Ticket-only:** `ticketId` only; enter the participant details manually in KonfHub.

## 4. Confirm the portal change

In KonfHub → Event Info → Forms, verify that Declaration / Consent is absent on **all 13 tickets**. In Participants → Reg. Attempts, historical records may still display a removed form because they were created before the change; do not treat them as the current form configuration. Refresh the public API and confirm its `forms[]` array for the ticket no longer lists `186672`. Check if any custom fields were renamed or made mandatory.

## 5. Correct the dates

Early registration applies through **30 Nov 2026, 11:59 p.m. IST**. Regular begins **1 Dec 2026, 12:00 a.m. IST**. The historical KonfHub screenshots showed early tickets closing at 6 p.m. and regular tickets already open on 15 Nov. Align all ten time-limited ticket windows; three fixed-fee tickets stay available according to organizer policy.

## 6. Fee and payment verification

There are 13 tickets across 8 fee categories. Face values are in INR; the local published fee does not guarantee the final total on KonfHub. KonfHub screenshots showed GST and platform charges. Confirm whether tax is included or added, transaction fees, applicable SAC/HSN and SRIC settlement before going live. Never simulate payment success on GitHub Pages or approve coupons in client-side code. KonfHub is responsible for its own coupon validation.

## 7. Why full prefill may still fail

The red toast can originate in KonfHub's server-side user-profile update, validation of an individual custom field, an unsupported URL-prefill parameter, a session/account issue or a vendor defect. The screenshots do not identify the failed API call. The organizer has already seen registration-attempt records created while the toast was displayed; record creation does not mean the profile was updated or payment completed.

If **Registration ID only** fails, investigate custom-field URL prefill support and the server response. If it succeeds, test Institution, Registration Purpose, Paper ID/Title, IEEE number, Country, Phone and Dietary separately. Do not assume a form value is accepted merely because it appears in the URL or lead details.

## 8. How to report the failure to KonfHub

1. Open Chrome DevTools (`F12`) → **Network**; enable **Preserve log**.
2. Test a single-field URL with a **test identity you control** and stop before payment.
3. Find the failed profile-update request and record endpoint path, HTTP status, request parameter **names** (not personal values), response error message and timestamp.
4. Redact attendee names, email addresses, phone numbers, paper titles, cookies, authorization headers and payment data.
5. Ask KonfHub to confirm which `form_id` / `er_column_mapping` values are officially supported in checkout query parameters and whether custom-field prefill is supported on the Silver plan.

## 9. Offline tests

From the extracted complete ZIP:

```bash
node developer_tools/test_konfhub_integration.js
node developer_tools/test_real_konfhub_metadata.js
node developer_tools/test_no_declaration_prefill.js
python3 developer_tools/test_no_declaration_browser.py
python3 developer_tools/test_prefill_lab.py
python3 developer_tools/regression_suite.py
```

The browser tests require Python Playwright and local Chromium. All tests are offline/mocked. **They cannot verify KonfHub live profile-update success.**

## 10. Deployment

Back up the existing repository. Extract the **GitHub Pages ZIP** into the root of `https://github.com/Siddy1992/asianhost-2026-konfhub-integration`, commit to `main`, and use Settings → Pages → Deploy from branch → `main` / `(root)`. Hard-refresh the site after deployment. A static GitHub Pages site does not have a secure payment webhook or private server-side order database; use a trusted backend for authoritative reconciliation.

## 11. Data protection

Prefill URLs expose participant data in browser history, network logs and potentially third-party logs. Never add passports, banking details, payment credentials or identity-document uploads to the URL. Do not share unredacted screenshots of the address bar. Local storage records are not shared across devices and are not proof of payment.

## 12. Acceptance criteria

- The 13 ticket mappings and expected prices match the portal.
- No runtime prefill URL includes `186672`.
- Basic prefill succeeds without the profile toast on a test checkout.
- Each additional field is independently tested, and any failing field is either corrected with KonfHub or excluded pending support confirmation.
- The participant can always complete registration manually on KonfHub.
- The payment status remains pending until an authoritative payment verification exists.

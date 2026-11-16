# AsianHOST 2026 — Complete prefill, explicit declaration, and GitHub Pages release

**Release:** 16 November 2026 · **Conference:** 11–13 December 2026 · **Event slug:** `asian-host-ticketing`  
**Target repository:** `Siddy1992/asianhost-2026-konfhub-integration`  
**GitHub Pages preview:** `https://siddy1992.github.io/asianhost-2026-konfhub-integration/`

> **Important distinction:** This release implements all *currently mapped, supported* participant fields in the frontend and passes offline browser/unit tests for all 13 ticket variants. **KonfHub has not been verified to accept the complete URL end-to-end.** In particular, its red “Error updating user profile” message is a provider response that cannot be fixed or proven resolved from a static website package. Do not take live payments until you have successfully completed the vendor-side acceptance tests and settlement/tax checks.

## 1. What changed, and what remains unchanged

The original website's main layout, fee table, 30 November early deadline, accepted-paper dropdown and **Other** paper entry, full-paper coverage rule, IEEE/student eligibility checks, PhD Forum fixed fees, sample status lookup, invoice preview, four policy pages, assets, and developer utilities are retained. The simulated payment checkout remains removed; no browser-local payment record is marked paid.

**Updated files:** `index.html`, `app.js`, `konfhub-integration.js`, `checkout.html`, `checkout.js`, `konfhub-checkout.css`, `prefill-lab.html`, `prefill-lab.js`, and documentation/tests.

- The participant form now collects **Dietary preference** (`Veg` or `Non Veg`) because KonfHub currently makes that field mandatory.
- The review step requires an **explicit declaration**, with text consistent with the KonfHub declaration and links to the policy pages. The checkbox is never checked for the user.
- The pending record stores a local acknowledgement flag and timestamp. This is **not** a legally authoritative server-side audit log.
- The checkout builds the **complete** URL only if all mapped mandatory KonfHub fields have values, including dietary and consent. Existing pending records can complete these on the checkout page.
- Consent uses **custom form ID `186672`** and the **exact sole option label** from the selected ticket's public `forms[]` metadata, *only after affirmative acceptance*. No default `true`/`1` is invented.
- The **basic prefill** (ticket, name, email) and **ticket-only** links remain as safe fallbacks. The field-level lab now has truly isolated Country, Phone, Dietary, and Consent presets.
- The checkout displays which fields are ready, missing, optional, or not attached to the KonfHub ticket.

## 2. Mapping of KonfHub form fields

These IDs come from the organizer-provided 13-ticket public API snapshot included in the repository. They must be rechecked against the **live** public endpoint before production.

| AsianHOST website value | KonfHub URL key | Notes |
|---|---|---|
| Name | `name` | KonfHub predefined field |
| Email address | `email_id` | KonfHub predefined field |
| Institution / Organisation | `186632` | Custom text field |
| Country | `186633` | Custom country selector; verify selected value |
| Phone Number | `186634` | Custom phone control; verify country/dial-code handling |
| AsianHOST Registration ID | `186665` | Custom text field |
| Registration Purpose | `186666` | Exact dropdown option, e.g. `Paper Author` |
| Paper ID | `186667` | Required by KonfHub on full tickets; use real ID for authors |
| Paper Title | `186668` | Required by KonfHub on full tickets; use real title for authors |
| IEEE Membership Number | `186669` | Only when attached to the selected ticket |
| GSTIN | `186670` | Optional; not sent when blank |
| Dietary Restrictions | `186671` | Exact option `Veg` or `Non Veg` |
| Declaration / Consent | `186672` | **Explicit agreement only**; exact KonfHub option string |
| City, Billing Name, PhD Forum reference | **No current form ID** | Not transferred unless KonfHub creates/attaches corresponding fields |

**Non-authors on full IEEE/Non-IEEE tickets:** KonfHub currently requires Paper ID and Paper Title for all holders of those tickets. The website sends `Not applicable` and `Not applicable - general participant` rather than inventing a paper. The organizer should make these fields conditional or optional for non-authors; a general participant is not automatically a paper author.

**International phone:** The website attempts country-specific national-number extraction for its supported country list. The KonfHub phone widget must still be checked manually; its exact URL encoding is not guaranteed by public documentation. The country `Other` or an unrecognized number is left for manual entry, and complete prefill is disabled if that phone field is mandatory.

## 3. KonfHub configuration: required checks

1. Open **KonfHub → AsianHOST 2026 Conference Registration → Event Info → Forms**.
2. Edit **Declaration / Consent**. Confirm it is a **Consent** field (`form_type=10`), mandatory, and has exactly one affirmative option: `I agree to the above declaration and consent to the stated terms.` Its current form ID is **186672**. Verify the declaration text matches the AsianHOST website's acknowledgement and links to the approved policies.
3. Confirm **Dietary Restrictions** (`186671`) is a mandatory dropdown with **Veg** and **Non Veg**. If you need Vegan/Other/No preference, add those options on KonfHub and update `index.html`/`checkout.html` accordingly.
4. Confirm **Institution** (`186632`), **Country** (`186633`), **Phone** (`186634`), **Registration ID** (`186665`) and **Registration Purpose** (`186666`) are attached to every relevant ticket. Do not rename or delete fields without updating the mapping.
5. For **IEEE Member**, **Non-IEEE Member**, and applicable other tickets, ensure **Paper ID/Title** are not incorrectly mandatory for general attendees, or accept explicit `Not applicable` values. Check **IEEE Membership Number** is required only for the relevant IEEE categories.
6. If PhD Forum participants must provide a forum submission reference, create a **PhD Forum Reference** text field and attach it to both PhD tickets; the website will find it by its label. Similarly, add City/Billing Name fields only if you actually require them at checkout.
7. **Ticket schedule:** the website uses early rates until **30 November 2026, 11:59 p.m. IST** and regular rates from **1 December 2026, 12:00 a.m. IST**. The supplied snapshot showed early tickets ending at **6:00 p.m.** and regular tickets opening on **15 November**. Fix **all five Early** and **all five Regular** ticket start/end times in KonfHub. Fixed-fee tickets can remain available through the event.
8. Check **GST 18%**, the fee-inclusive/exclusive setting, HSN/SAC, payment processing charges (the screenshots showed 4.43% or 5.9%), whether the attendee or organizer bears charges, international card acceptance, and the institutional SRIC settlement account. Do not infer these are already approved.
9. Under **Developers → Webhook**, configure a secure backend endpoint for verified payment/registration updates. **Do not put private API keys or webhook secrets on GitHub Pages.** KonfHub's confirmed registration/booking remains authoritative until backend reconciliation is implemented.

## 4. Frontend flow

1. Visitor selects registration purpose and category; accepted-paper rules are enforced in the existing form.
2. Visitor enters name, email, institution, country, phone, dietary preference, IEEE number (if applicable), and optional billing details.
3. Visitor reviews the fee and explicitly checks the declaration. A browser-local pending registration reference is created.
4. Checkout looks up the matching KonfHub ticket by name and price, using live public metadata where available. The bundled snapshot is only a fallback.
5. The page displays **Continue with complete participant prefill** if every mapped mandatory field is ready. Its URL contains the consent option only because the participant checked the declaration.
6. The attendee opens KonfHub, **checks the entire form including consent**, and continues to the payment-selection step only if no error occurs.
7. If KonfHub reports **Error updating user profile**, the attendee should use **Basic prefill** or **Ticket-only checkout** and manually complete all required KonfHub fields. No payment should be made during debugging.
8. A successful transition to KonfHub's payment-selection screen is **not proof of a paid registration**. Do not update the local status based on this navigation.

## 5. How to isolate the remaining KonfHub error

Use a real, controlled test profile, not `alex@example.org`, and **stop before paying**. Open the website checkout, then click **Test each additional field**. In a clean KonfHub session, try:

| Test | Prefill Lab selection | Expected URL addition |
|---|---|---|
| A | Basic only | No custom fields |
| B | Institution only | `186632` |
| C | Registration ID only | `186665` |
| D | Dietary only | `186671=Veg` or `Non Veg` |
| E | Consent only | `186672` with the exact option label, only after explicit acceptance |
| F | Country only | `186633` |
| G | Phone only | `186634` |
| H | All mapped fields | All supported fields for the ticket |

If the red toast remains after the declaration is included, open Chrome **Developer Tools → Network → Fetch/XHR**, enable **Preserve log**, reproduce the issue and inspect the failed profile-update request's **HTTP status and redacted response message**. Send those, the event slug, ticket ID, form IDs and timestamp to KonfHub support. **Do not share access tokens, cookies, unredacted personal data, or full prefill URLs.** The dashboard's **Reg. Attempts** lead record confirms data capture, not a completed registration or successful payment.

The official KonfHub prefill article documents custom `form_id` query parameters, including a custom consent-field example. It does **not** provide a verified encoding guarantee for this event's type-10 checkbox. Thus, the frontend mapping is implemented and tested locally, but provider acceptance must be demonstrated separately.

Official documentation: <https://blog.konfhub.com/prefill-konfhub-registration-forms-using-your-own-website-form>

## 6. Edit and launch locally

Extract the **complete editable ZIP** into a directory. Keep the file hierarchy intact.

**Linux/macOS**

```bash
cd AsianHOST_2026_KonfHub_Consent_Complete_Prefill_16Nov2026
python3 -m http.server 8000
# Visit http://localhost:8000/
```

Or run the included `LAUNCH_WEBSITE_LINUX_MAC.sh`. On Windows use `LAUNCH_WEBSITE_WINDOWS.bat` or `py -m http.server 8000`.

- Edit **registration UI and accepted papers:** `index.html`, `app.js`, `styles.css`.
- Edit **fees and 30 November cutoff:** `registration-config.js` (and coordinate changes with KonfHub tickets).
- Edit **KonfHub ticket mapping and custom-field handling:** `konfhub-integration.js`.
- Edit **checkout layout and prefill gating:** `checkout.html`, `checkout.js`, `konfhub-checkout.css`.
- Edit **diagnostic presets:** `prefill-lab.html`, `prefill-lab.js`.
- Edit **policy text:** `terms.html`, `refund.html`, `privacy.html`, `about-contact.html`.
- Do not edit `konfhub-public-tickets.json` to pretend the live KonfHub settings have changed. It is a dated public metadata fallback only.

## 7. Deploy to the existing GitHub Pages repository

1. Sign in to GitHub and open <https://github.com/Siddy1992/asianhost-2026-konfhub-integration>.
2. **Back up the current branch** (or create a new test branch) before replacing files.
3. Extract the **GitHub Pages ZIP**. Upload **the contents of the ZIP to the repository root**, not an extra enclosing directory. Alternatively, use Git locally:

```bash
cd /path/to/extracted/site
# Replace the files in your existing repository checkout, then:
git add .
git commit -m "Complete KonfHub prefill with explicit consent and dietary fields"
git push origin main
```

4. In GitHub, open **Settings → Pages**. Select **Deploy from a branch → main → /(root)** and Save (if not already configured).
5. Wait for the Pages deployment and open <https://siddy1992.github.io/asianhost-2026-konfhub-integration/>.
6. Hard-refresh (`Ctrl+Shift+R`) to avoid cached JS, create a **new pending** test registration, and confirm the checkout URL includes the expected form IDs.
7. Test in a private window and on mobile. **Do not publish a successful-payment claim based only on browser-local status.**

For a **new** repository instead: GitHub → New repository → choose a name → Public → Create → upload the ZIP's extracted contents to the root → commit → enable Pages as above. Its Pages URL will use the new repository name.

## 8. Run offline tests before deploying

```bash
node developer_tools/test_complete_prefill.js
node developer_tools/test_konfhub_integration.js
node developer_tools/test_real_konfhub_metadata.js
python3 developer_tools/test_consent_end_to_end.py
python3 developer_tools/test_prefill_lab.py
python3 developer_tools/test_redesigned_site.py
python3 developer_tools/test_nov30_flow.py
python3 developer_tools/regression_suite.py
python3 developer_tools/verify_konfhub_package.py
```

These tests check source code, URL construction, all 13 ticket variants, explicit consent and dietary fields, legacy-record handling, the early/regular deadline, original registration features, and the invoice-preview/status paths. **They do not exercise KonfHub's live checkout validation or process a payment.**

## 9. Outstanding production work

- **Vendor acceptance:** prove that KonfHub accepts the full URL and correctly stores the consent field without a red profile-update error.
- **Mandatory-field logic:** correct Paper ID/Title requirements for general participants on full-member tickets; add PhD Forum reference if needed.
- **Pricing and dates:** align all ticket windows and confirm tax/processing-fee treatment and settlement.
- **Verified status:** connect a trusted backend to KonfHub webhooks/APIs, authenticate status lookups, reconcile booking IDs, and generate approved official invoices.
- **Coupons:** configure complimentary/waiver coupons on KonfHub or in an authenticated backend. Never accept a 100% waiver solely from a public JavaScript coupon list.
- **Consent audit:** capture the actual accepted legal text/version, timestamp, and registrant identity on a trusted backend; localStorage is only a prototype.
- **Privacy:** URL prefill can expose attendee details in history and logs. Do not include passports, bank data, payment credentials, or private API keys.

**Release status:** Complete editable frontend package and offline tests **PASS**; live KonfHub full-prefill acceptance **PENDING VENDOR TEST**; payment/settlement **NOT VERIFIED**.

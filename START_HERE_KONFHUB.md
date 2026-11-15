# AsianHOST 2026 + KonfHub: New Repository and GitHub Pages Setup

**Start here.** This is a separate, GitHub-ready copy of the AsianHOST 2026 registration demo with a KonfHub checkout integration. The source is the user-supplied `asianhost-2026-registration-demo-main.zip`.

- **Original GitHub repository (do not modify):** https://github.com/Siddy1992/asianhost-2026-registration-demo
- **Suggested NEW repository:** `asianhost-2026-konfhub-integration`
- **Expected new GitHub Pages URL once deployed:** `https://siddy1992.github.io/asianhost-2026-konfhub-integration/`
- **KonfHub event:** https://konfhub.com/asian-host-ticketing
- **Existing fixed-ticket widget:** `eaa9296e-ad76-4de9-bdc1-06a0c1ce1e1d` (Indian Student – General, ₹2,000 ONLY)
- **KonfHub public tickets endpoint:** https://api.konfhub.com/event/url/asian-host-ticketing/tickets

> **Not production-ready:** This package integrates the frontend and implements a ticket-specific prefilled checkout URL. It does **not** verify live payments or synchronize the browser's status database. KonfHub's ticket and payment confirmation remain authoritative. Real payments must wait for SRIC settlement approval, correct tax/fee setup, and verified backend reconciliation.

## 1. What was preserved and what was changed

Every file from the uploaded original ZIP is **byte-for-byte unchanged** except `checkout.html` and `checkout.js`, which have been replaced to remove simulated payment-success/failure and publicly visible mock coupon redemption. In particular, these original files are unchanged:

- `index.html` and `app.js` — all three registration steps, accepted-paper list and manual paper entry, fee categories, deadline logic, validations, registration ID creation, sample status records, and confirmation UI.
- `styles.css`, assets and logos — the original design.
- `invoice.html`, `invoice.js`, `invoice.css` — the existing **illustrative** invoice preview and print feature.
- `terms.html`, `refund.html`, `privacy.html`, `about-contact.html`, `policy.css` — all original policy pages.
- Original `README.md`, changelog, and developer tools.

**New files:** `konfhub-integration.js`, `konfhub-checkout.css`, `konfhub-public-tickets.json`, `konfhub-diagnostics.html`, `konfhub-widget-test.html`, `START_HERE_KONFHUB.md`, `backend/INTEGRATION_CONTRACT.md`, and additional developer tests.

The original `checkout.html` and `checkout.js` are also backed up in `developer_tools/original_checkout/` for comparison.

## 2. Actual registration and checkout flow

1. Participant opens the new GitHub Pages site and uses the **unchanged** AsianHOST registration form.
2. Participant selects purpose, category, paper, and fills name/email/institution/phone, etc.
3. The unchanged `app.js` validates the information, creates `AH26-...`, stores a **pending** record in this browser, and navigates to `checkout.html?id=AH26-...`.
4. New `checkout.js` reads that record, rechecks the 15 November early-fee cutoff, and finds the **matching** KonfHub ticket using the public tickets API or the local public snapshot.
5. New `konfhub-integration.js` builds a direct-to-form checkout URL with the correct `ticketId`, name, email, institution, WhatsApp number, and supported custom-field IDs (including AsianHOST Registration ID).
6. Participant clicks **Continue to KonfHub — details prefilled**. KonfHub's checkout opens in a new tab, where the participant reviews all fields, completes any unfilled fields (including consent), applies **KonfHub-managed** coupons, and pays if authorized.
7. KonfHub issues the actual ticket/payment confirmation. **The static GitHub Pages website does not mark the browser record as paid.**

**Why not prefill the iframe?** The existing iframe is a fixed-ticket KonfHub widget. KonfHub documents automatic prefilling for the direct-to-form checkout URL (`/checkout/SLUG?ticketId=...`) and does not establish that arbitrary prefill query parameters are supported on the fixed widget URL. This package does not invent unsupported iframe behavior.

## 3. Create a brand-new GitHub repository (browser method)

**Do not upload these files into the original repository.**

1. Sign in to GitHub as the account that owns `Siddy1992`.
2. Go to https://github.com/new.
3. Set **Owner** to `Siddy1992` (or your preferred organization).
4. Set **Repository name** to `asianhost-2026-konfhub-integration`.
5. Description (optional): `AsianHOST 2026 registration demo with KonfHub ticket-specific checkout and form prefilling`.
6. Choose **Public** if you intend to use GitHub Pages on a public registration demo. Do not put private information or API keys in this repository.
7. Leave **Add a README**, `.gitignore`, and license initialization **unchecked**; this ZIP already contains the original README and a `.gitignore`.
8. Click **Create repository**.
9. On your computer, **extract** the supplied ZIP into a folder. Do **not** upload the ZIP itself as the website.
10. In the new empty repository page, choose **uploading an existing file** (or **Add file → Upload files**).
11. Drag all extracted **root contents** into the upload area: `index.html`, `app.js`, `checkout.html`, `checkout.js`, all the other `.html`/`.css`/`.js` files, `assets/` and the new KonfHub files. The site must have `index.html` at the repository root, not in an extra enclosing folder.
12. Confirm that `assets/asianhost-logo.png` and `assets/iitkgp-logo.png` are included.
13. Commit directly to the `main` branch with message `Add AsianHOST 2026 KonfHub integration demo`.
14. If the GitHub upload UI does not accept nested directories reliably, use the Git command-line method in Section 4.

**Never upload:** actual bank documents, settlement credentials, private KonfHub API keys, personal attendee exports, coupon secrets, `.env` files, or private CSVs.

## 4. Alternative: create and push the new repository with Git

From the extracted folder:

```bash
cd asianhost-2026-konfhub-integration
git init -b main
git add .
git commit -m "Add AsianHOST 2026 KonfHub integration demo"
```

If you have installed and authenticated GitHub CLI (`gh`):

```bash
gh auth login
gh repo create Siddy1992/asianhost-2026-konfhub-integration --public --source=. --remote=origin --push
```

If you created the empty repository in the browser instead:

```bash
git remote add origin https://github.com/Siddy1992/asianhost-2026-konfhub-integration.git
git push -u origin main
```

GitHub may request authentication through your configured credential manager. Do not paste access tokens into the codebase.

## 5. Enable GitHub Pages

1. Open the **new** repository, not the original.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source: Deploy from a branch**.
4. Choose **Branch: main**, folder **/(root)**, and click **Save**.
5. Wait for the deployment to finish. GitHub Pages displays the actual published URL. A normal project-site URL will be:
   `https://siddy1992.github.io/asianhost-2026-konfhub-integration/`
6. Open the URL and confirm the original AsianHOST landing page looks unchanged.
7. Open `https://siddy1992.github.io/asianhost-2026-konfhub-integration/konfhub-widget-test.html` to verify the existing fixed ₹2,000 widget still loads.
8. Open `https://siddy1992.github.io/asianhost-2026-konfhub-integration/konfhub-diagnostics.html` to inspect ticket mappings.

The URL above is **expected**, not an assertion that the new repository or Pages site has already been created.

## 6. Obtain KonfHub public ticket IDs and form IDs

The frontend can discover the mapping automatically **if** KonfHub's public endpoint allows cross-origin browser requests:

`https://api.konfhub.com/event/url/asian-host-ticketing/tickets`

1. Open the **diagnostics page** of your new GitHub Pages site.
2. Check whether all **13** ticket variants show **Mapped**.
3. If all are mapped, the browser is reading the public KonfHub API successfully. No extra widget IDs are required.
4. If the diagnostics show a CORS/network failure or zero tickets, open the public endpoint above directly in your browser.
5. Copy its JSON response into a local text editor. Check that it contains only **public ticket and form metadata**, not attendee records or secrets.
6. Replace the **entire** contents of `konfhub-public-tickets.json` in the new repository with that JSON. You can do this via **Add file → Upload files** (upload the edited file) or by opening the file on GitHub, clicking the pencil icon, and committing the edited content.
7. Refresh the diagnostics page. The local snapshot is checked before the remote API, so it works even if the browser is blocked by CORS.
8. Confirm that all 13 variants are mapped and the form counts are nonzero.

If the public endpoint does not return data or its format differs, ask KonfHub/Mohit for the event's public ticket/form mapping. Do not invent IDs or substitute one ticket for another.

## 7. Ticket names must match the website's 13 variants

The integration matches these KonfHub ticket names (minor differences in punctuation are tolerated):

| Website key | Expected KonfHub ticket | Fee |
|---|---|---:|
| `ieee:early` | IEEE Member - Early | ₹50,000 |
| `ieee:regular` | IEEE Member - Regular | ₹60,000 |
| `nonieee:early` | Non-IEEE Member - Early | ₹60,000 |
| `nonieee:regular` | Non-IEEE Member - Regular | ₹70,000 |
| `ieee-student:early` | IEEE Student - Early | ₹15,000 |
| `ieee-student:regular` | IEEE Student - Regular | ₹25,000 |
| `nonieee-student:early` | Non-IEEE Student - Early | ₹25,000 |
| `nonieee-student:regular` | Non-IEEE Student - Regular | ₹35,000 |
| `life:early` | IEEE Life Member - Early | ₹25,000 |
| `life:regular` | IEEE Life Member - Regular | ₹35,000 |
| `indian-student:fixed` | Indian Student - General | ₹2,000 |
| `phd-intl:fixed` | PhD Forum - International | ₹15,000 |
| `phd-indian:fixed` | PhD Forum - Indian | ₹5,000 |

The code checks the published fee against the browser record and against KonfHub's face value when that value is available in public metadata. **If a ticket cannot be matched, checkout is blocked rather than charging an incorrect category.**

## 8. Participant field prefilling

**Default fields** use KonfHub's documented query keys: `name`, `email_id`, `organisation`, `whatsapp_number`.

**Custom fields** are discovered from the selected ticket's `forms[]` array and mapped by `form_name` to `form_id`. This includes, when configured on the selected ticket:

- AsianHOST Registration ID (crucial for reconciliation)
- Registration Purpose (Paper Author / General Participant / PhD Forum Participant)
- Paper ID and Paper Title
- PhD Forum Reference
- IEEE Membership Number
- Country and City
- Billing Name and GSTIN

KonfHub's own Declaration/Consent checkbox is **never pre-checked**. Dietary restrictions are not collected by the original AsianHOST form, so the participant completes that field in KonfHub. Some dropdowns or default-field formats may need final adjustment after observing the actual `forms[]` data and a live preview.

**Privacy note:** KonfHub's documented prefill mechanism uses URL query parameters. These may appear in browser history or server logs. Do not pass passport details, identity documents, payment card information, or bank information. Limit access to registration URLs containing personal information and obtain the organizing committee's privacy approval.

## 9. Test the full frontend journey

1. Open the new GitHub Pages site.
2. Choose **General Participant**.
3. Choose **Indian Student – General** (₹2,000) and enter valid Indian student details.
4. Complete the original three steps, including the existing consent checkbox.
5. Click **Proceed to payment**.
6. Confirm that `checkout.html?id=AH26-...` shows the same name, category, fee, and reference.
7. If the ticket metadata is mapped, click **Continue to KonfHub — details prefilled**.
8. Confirm the correct KonfHub ticket and verify that name, email, organization and AsianHOST Registration ID appear in the KonfHub form.
9. Check any other required KonfHub fields manually, including consent. Do not pay until the bank and tax arrangements are approved.
10. Repeat with IEEE Member, Non-IEEE Member, student and PhD Forum categories. After 15 November 2026, the original website correctly shows regular rates for the changing categories.
11. Try an unmatched ticket: the checkout should refuse to substitute the ₹2,000 widget.
12. Check the original status lookup and invoice preview pages. They are still **demo-only**, not verified KonfHub records.

## 10. If the public ticket mapping fails

For Indian Student – General only, the original fixed KonfHub widget appears as a fallback. This fallback **does not prefill** the original website's details. The participant must enter the `AH26-...` registration reference manually into the KonfHub form.

For all other categories, the integration deliberately does **not** show the ₹2,000 widget. Instead, it offers the KonfHub event page as a manual fallback; the participant must verify the correct category and fee before proceeding.

## 11. Coupons, supplementary payments and early registration

- The **original mock coupon logic is removed from the new checkout**, so public sample coupon codes cannot mark a record as paid.
- Approved complimentary codes must be created and redeemed **inside KonfHub** with organizer-controlled usage limits.
- The original website's paper-coverage validation is preserved. KonfHub must independently enforce ticket eligibility and the mandatory full-registration rule.
- Supplementary ₹10,000 IEEE-to-Non-IEEE balance payments are **blocked** until an authorized KonfHub payment ticket is configured; the existing demo status UI still shows its original preview button.
- The original deadline remains **15 November 2026 at 11:59 p.m. IST**. Pending early-rate orders are recalculated to regular rates on the new checkout after the cutoff.

## 12. Payment confirmation, webhooks and status lookup: not yet live

**Static GitHub Pages cannot receive server-side webhooks or securely store a private KonfHub API key.** Therefore, this frontend deliberately leaves the original browser-local status at `pending` even if KonfHub later confirms payment.

For the live portal, implement a backend (e.g. Cygnus service or Cloudflare Worker + database) that:

1. Stores the `AH26-...` registration record server-side before payment.
2. Receives KonfHub registration and cancellation webhook notifications.
3. **Independently verifies** the attendee, payment and matching registration reference using KonfHub's private attendee API; webhook payloads alone must not mark a record paid.
4. Validates ticket ID, fee, email, booking ID, payment ID, and event ID, and handles retries and duplicates idempotently.
5. Updates the authoritative database to `paid`, `pending`, `failed`, `cancelled`, or `waived` only after verified evidence.
6. Exposes an authenticated or rate-limited status lookup for the original UI and provides invoice details only after verification.
7. Keeps API keys in server-side secrets, never in public GitHub Pages.

See `backend/INTEGRATION_CONTRACT.md`. The webhook payload schema and verification/authentication details must be confirmed using KonfHub's **Developers → Webhook → Sample Payload** and the event's private attendee API documentation before production code is enabled.

## 13. Settlement and tax launch blockers

The prior KonfHub dashboard showed **automatic settlements disabled due to incomplete bank details**. Before any live payment, obtain written confirmation from KonfHub and SRIC that:

- The AsianHOST event may settle to the approved SRIC institutional bank account under the relevant organizer/KYC setup.
- GST treatment, HSN/SAC code, advertised fee inclusivity, platform fees, card fees, international payments and refund procedures are approved.
- The published fees and checkout totals are reconciled and tested.
- KonfHub confirmation and SRIC bank settlement statements can be reconciled by booking ID and registration ID.

## 14. Local development and regression checks

From the extracted folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

Node.js tests (no real payment or network needed):

```bash
node developer_tools/test_konfhub_integration.js
python3 developer_tools/verify_konfhub_package.py
```

Optional browser test (requires Python Playwright and Chromium; start a local server on port 8877):

```bash
python3 -m http.server 8877
python3 developer_tools/test_browser_konfhub.py
```

The original `developer_tools/regression_suite.py` tests **mock payment controls** that have intentionally been removed from the new checkout. Those mock-checkout assertions are obsolete for this branch. Use the KonfHub-specific tests instead.

## 15. How to update the new GitHub Pages website later

1. Open the **new** repository and navigate to the file you want to update.
2. Click the pencil icon to edit the file, or use **Add file → Upload files** to replace it.
3. Commit to `main`.
4. GitHub Pages automatically redeploys from `main` (once Pages has been enabled).
5. Reload the new Pages URL, preferably in a private window to avoid stale browser storage.
6. The original `asianhost-2026-registration-demo` repository remains unchanged.

## 16. Official technical references

- KonfHub prefill guide: https://blog.konfhub.com/prefill-konfhub-registration-forms-using-your-own-website-form
- KonfHub embed widgets: https://blog.konfhub.com/simplify-event-registrations-with-konfhubs-embed-ticket-feature
- KonfHub webhooks: https://blog.konfhub.com/automation-at-your-fingertips-real-time-notifications-with-webhooks
- KonfHub attendee API documentation: https://docs.konfhub.com/

**Next action:** Create the new GitHub repository and upload the extracted package. Then open `konfhub-diagnostics.html`. If it does not show all 13 tickets as mapped, supply the public tickets API JSON as `konfhub-public-tickets.json`. This is the remaining prerequisite for automatic prefilling across every category.

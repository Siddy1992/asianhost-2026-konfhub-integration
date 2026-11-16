# AsianHOST 2026 — Full participant prefill: corrected mappings and field-by-field test

**Build date:** 16 November 2026  
**Repository:** `https://github.com/Siddy1992/asianhost-2026-konfhub-integration`  
**Preview:** `https://siddy1992.github.io/asianhost-2026-konfhub-integration/`

## What is confirmed, and what is not

- **Confirmed by the organizer:** ticket ID `127187`, IEEE Member – Early, ₹50,000, and **Basic prefill** (`ticketId`, `name`, `email_id`) reach KonfHub's payment-selection page without the previous profile-update error.
- **Observed:** the older Full prefill triggers KonfHub's **Error updating user profile** toast.
- **Not yet confirmed:** KonfHub accepts *all* extra fields together. This update provides corrected custom form IDs, Indian national-format phone values, and a controlled field-by-field browser test. Passing offline tests does not establish vendor-side acceptance.

## Key code correction

The organizer's public KonfHub ticket metadata shows:

| Field | KonfHub form ID | Type / handling |
|---|---:|---|
| Name | predefined `name` | Basic prefill works |
| Email | predefined `email_id` | Basic prefill works |
| Institution / Organisation | `186632` | **Custom** form; use `186632`, not `organisation` |
| AsianHOST Registration ID | `186665` | Custom form |
| Registration Purpose | `186666` | Custom dropdown; only configured values |
| Paper ID | `186667` | Custom field; authors only |
| Paper Title | `186668` | Custom field; authors only |
| IEEE Membership Number | `186669` | Custom field; applicable categories only |
| GSTIN | `186670` | Optional custom field |
| Country | `186633` | Custom country selector; vendor acceptance requires test |
| Phone Number | `186634` | Custom phone control; vendor acceptance requires test |
| Declaration / Consent | `186672` | **Never prefill or auto-accept** |

**Important:** Some custom forms have an `er_column_mapping` such as `organisation`, `phone_number`, or `country`, but their `is_default` value is `false`. KonfHub's documentation says **use the numeric `form_id` for custom forms**. The previous code sent the institution as `organisation` even though the attached institution form is custom. This version corrects that mapping.

For Indian numbers entered as `+91 98765 43210`, the new code tests a 10-digit national value `9876543210` in the KonfHub custom Phone Number form, avoiding a duplicated `+91` inside a phone control that already shows a dial-code selector. This is a **format hypothesis**, not vendor-confirmed behavior. Non-Indian phone numbers are left for manual entry until their country-specific format is validated.

## How to deploy the complete editable package

1. Back up the existing repository or create a branch for testing.
2. Extract the complete ZIP. Upload its **contents**, not the enclosing folder, to the root of `Siddy1992/asianhost-2026-konfhub-integration`.
3. Preserve all existing files. In particular, upload the updated `konfhub-integration.js`, `checkout.js`, `checkout.html`, and the new `prefill-lab.html`, `prefill-lab.js`.
4. Commit changes to a test branch, or push to `main` when ready for the public preview. GitHub Pages uses **Settings → Pages → Deploy from a branch → main → /(root)** in the existing setup.
5. Open the main website, complete a **new pending registration** using an email you control, and reach the checkout review page.
6. Click **Test each additional field**. This opens `prefill-lab.html?id=AH26-...` using the same pending browser-local registration.
7. Use the buttons in the next section. For every test, open the generated KonfHub tab, review populated fields and stop before paying. If sessions interfere, clear KonfHub cookies or repeat with a fresh private browser session.

**For a minimal update:** upload the six files from the **changed-files ZIP**. The complete ZIP includes all other editable source, policy pages, invoice preview, original registration form, 13-ticket snapshot and developer tests.

## Field-by-field test procedure

| Test | Preset in prefill lab | What to check |
|---|---|---|
| A | **1 · Basic only** | Known-good control: name/email |
| B | **2 · All text/option fields** | Institution, registration ID, purpose, applicable paper and IEEE fields |
| C | **3 · Text + country** | Whether country form ID `186633` causes the error |
| D | **4 · Text + phone** | Whether phone form ID `186634` causes the error |
| E | **5 · All mapped fields** | Test only after B/C/D pass |

If **B** fails, use the individual checkboxes to add **Institution** alone, then **Registration ID**, then **Registration Purpose**, then **Paper ID/Title**, then **IEEE Number**, etc. The first new parameter that causes the toast is the prime suspect. Do not share a full URL with participant names, email, phone or membership IDs. Report only the numeric field ID and whether the error appeared.

If **C** or **D** fails, the field may require a different KonfHub value representation or a backend fix. Obtain the exact required format from KonfHub support rather than guessing. If even ticket-only checkout fails, report a KonfHub-side issue.

## Important KonfHub configuration tasks

1. **Event Info → Forms:** verify the same fields and form IDs are attached to all relevant ticket variants. The public metadata shows `186632` institution, `186633` country, `186634` phone, `186665` registration ID and `186666` purpose on the sample IEEE ticket.
2. **Make conditional fields conditional:** the current IEEE Member form has mandatory Paper ID, Paper Title and IEEE Number. Paper ID/Title should not be mandatory for general attendees; IEEE number should not be required on non-IEEE categories. KonfHub may need separate ticket-specific forms or validation rules.
3. **PhD Forum reference:** this field is not attached to the current public ticket snapshot, so the website cannot prefill it until KonfHub has the corresponding form.
4. **Dietary restrictions:** KonfHub requires this field, but the AsianHOST website currently does not collect it. Attendees must select it on KonfHub unless the website form is extended.
5. **Consent:** always let attendees accept the declaration themselves. Never pass the consent field ID in the checkout URL.
6. **Early deadline:** the website uses 30 November 2026, **11:59 p.m. IST**; earlier KonfHub screenshots show **6:00 p.m. IST** for Early tickets. Align all five Early end times and all five Regular opening times to 1 December, **12:00 a.m. IST**, before live registration.
7. **Payments:** confirm the 18% GST setting, HSN/SAC, published fee tax treatment, 4.43%/5.9% processing charges, settlement bank account and payment gateway activation with SRIC/KonfHub. No mock browser state may confirm payment.

## Local verification (no payment)

```bash
python3 -m http.server 8000
# Open http://localhost:8000/
node developer_tools/test_konfhub_integration.js
node developer_tools/test_real_konfhub_metadata.js
python3 developer_tools/test_prefill_lab.py
python3 developer_tools/test_nov30_flow.py
python3 developer_tools/regression_suite.py
```

## Limits and security

A GitHub Pages site cannot directly modify the contents of KonfHub's cross-origin checkout, force KonfHub to accept unsupported field formats, or confirm payment. Prefill URLs contain participant information and can appear in browser history and logs. Never include identity documents, bank details, payment credentials or private API keys in these URLs. All payment status and complimentary coupon verification must be implemented by an authenticated backend and reconciled against KonfHub.

**Official reference:** [KonfHub — Prefill KonfHub Registration Forms Using Your Own Website Form](https://blog.konfhub.com/prefill-konfhub-registration-forms-using-your-own-website-form).

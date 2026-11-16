# AsianHOST 2026 — KonfHub ticket audit

The organizer has configured **13 tickets**. Their prices and ticket IDs are checked in `developer_tools/test_real_konfhub_metadata.js` against the bundled public snapshot. That snapshot is historical and still includes the **removed** Declaration / Consent field `186672`; the runtime filters it.

## Registration prices

| Category | Early INR | Regular INR |
|---|---:|---:|
| IEEE Member | 50,000 | 60,000 |
| Non-IEEE Member | 60,000 | 70,000 |
| IEEE Student | 15,000 | 25,000 |
| Non-IEEE Student | 25,000 | 35,000 |
| IEEE Life Member | 25,000 | 35,000 |
| Indian Student — General | 2,000 | 2,000 |
| PhD Forum — International | 15,000 | 15,000 |
| PhD Forum — Indian | 5,000 | 5,000 |

Early through **30 November 2026, 11:59 p.m. IST**; regular from **1 December 2026**. PhD Forum rates are fixed. At least one full IEEE Member or Non-IEEE Member registration is required per accepted main-conference paper.

## Current mapping

- Institution / Organisation: `186632`
- Country: `186633`
- Phone: `186634`
- AsianHOST Registration ID: `186665`
- Registration Purpose: `186666`
- Paper ID: `186667`
- Paper Title: `186668`
- IEEE Membership Number: `186669`
- GSTIN: `186670`
- Dietary Restrictions: `186671`
- **Retired, never sent: Declaration / Consent `186672`**

The live API may change these IDs or the form requirements. The website dynamically maps active fields from the selected ticket. Inspect the live KonfHub Forms configuration for all 13 tickets, especially whether paper fields are mandatory for non-authors.

The prior screenshots showed KonfHub GST and processing fees; these require organizer/SRIC verification before payment. The browser-local status page is a demonstration and cannot prove payment.

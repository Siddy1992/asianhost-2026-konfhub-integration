# Private coupon generation utility

Use this script locally to generate a CSV of 150 or more unique coupon codes. Do **not** upload the generated CSV to public GitHub Pages or publish actual authorized coupon codes in browser JavaScript.

```bash
python3 generate_coupons.py --count 150 --prefix AH26 --output coupons_private.csv
```

The **archived original checkout** includes three intentionally public example 100% waiver codes. The new KonfHub checkout does not redeem them. The production developer must implement a private server-side coupon registry, eligibility/expiry/usage limits, one-time redemption, atomic transactions and audit logging.

## Verification and regression tests

From the website root:

```bash
python3 developer_tools/verify_package.py
python3 developer_tools/regression_suite.py
```

The second script requires `playwright` and `beautifulsoup4`, plus a Chromium binary at `/usr/bin/chromium`. It checks the **View / Print Invoice Preview** button on both successful confirmation and status lookup, the print control, absence of mock coupon redemption in the KonfHub checkout, fixed fees, full-paper eligibility, manual paper entry and the 30 November cutoff. It also checks that failed and pending records cannot open an invoice preview. The tests are browser-local and never contact a real payment gateway.

The static GitHub Pages ZIP intentionally excludes this `developer_tools/` folder. The complete developer ZIP includes it.

## KonfHub integration test suite

The earlier `regression_suite.py` was written for the **original simulated checkout**.
Those mock-payment and mock-coupon assertions have been replaced with checks that the new KonfHub checkout cannot approve public demo coupons.
For this integration use:

```bash
python3 developer_tools/verify_package.py
python3 developer_tools/verify_konfhub_package.py
node developer_tools/test_konfhub_integration.js
```

The tests verify source structure and synthetic checkout URL mapping; they do not perform a real KonfHub payment.

The self-contained browser test for the extended deadline and stale-order correction is:

```bash
python3 developer_tools/test_nov30_flow.py
```

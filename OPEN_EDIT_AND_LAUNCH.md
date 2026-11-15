# AsianHOST 2026 — Complete Editable Website and Launch Guide

This ZIP is the **complete editable source-code package** for the AsianHOST 2026 registration demo with the KonfHub integration. It is **not** a compiled or locked website. Every page can be edited with VS Code or a plain-text editor.

## A. Start the website on your own computer

1. Extract the ZIP completely.
2. Open the extracted `AsianHOST_2026_Editable_Launchable_Complete` folder.
3. Install Python 3 if it is not already installed.
4. On **Ubuntu/Linux/macOS**, open a terminal in the folder and run:
   ```bash
   ./LAUNCH_WEBSITE_LINUX_MAC.sh
   ```
   If execution permission was lost during extraction, use `bash LAUNCH_WEBSITE_LINUX_MAC.sh`.
5. On **Windows**, double-click `LAUNCH_WEBSITE_WINDOWS.bat`, or run `py -3 launch_local.py`.
6. Your browser should open the website at `http://127.0.0.1:8000/` (or another port printed in the terminal if 8000 is busy).
7. Edit a file, save, and refresh the browser to see changes.
8. Stop the local server with **Ctrl+C** in the terminal.

**Do not launch by double-clicking `index.html`**: browser `file://` restrictions may prevent KonfHub public ticket JSON from loading. Use the local HTTP server instead.

## B. Which files should I edit?

| File | What it controls |
|---|---|
| `index.html` | Main registration page layout and content |
| `styles.css` | Main site colors, fonts, spacing, responsive design |
| `app.js` | Main form fields, registration rules, fees, deadline, client-side demo status |
| `checkout.html` | KonfHub checkout page structure |
| `checkout.js` | Selecting ticket and navigating to KonfHub checkout |
| `konfhub-integration.js` | Ticket mapping, supported prefilled participant fields, checkout URL construction |
| `konfhub-public-tickets.json` | Optional **public** KonfHub ticket/form metadata snapshot |
| `konfhub-checkout.css` | KonfHub checkout page appearance |
| `konfhub-widget-test.html` | Existing embedded ₹2,000 ticket widget test |
| `konfhub-diagnostics.html` | Ticket mapping diagnostics |
| `invoice.html`, `invoice.js`, `invoice.css` | Existing **illustrative** invoice preview |
| `terms.html`, `refund.html`, `privacy.html`, `about-contact.html`, `policy.css` | Policies and contact information |
| `assets/` | Website logos and other images |
| `backend/INTEGRATION_CONTRACT.md` | Specification for production backend, webhooks, and payment reconciliation |
| `developer_tools/` | Local tests and utilities; **not required to host the static website** |

Use VS Code: **File → Open Folder → `AsianHOST_2026_Editable_Launchable_Complete`**. Edit files directly and preview locally.

## C. Publish as a NEW website on GitHub Pages

**Do not overwrite your existing repository** `Siddy1992/asianhost-2026-registration-demo`.

1. Sign in at https://github.com and open https://github.com/new.
2. Name the repository `asianhost-2026-konfhub-integration`; choose Public.
3. Do **not** initialize it with a README or `.gitignore`.
4. Create the repository.
5. Upload the **contents** of this extracted folder, including `index.html` and `assets/`, into the repository root. Do not upload only the ZIP. You may omit `developer_tools/` and `backend/` from the public repository if preferred.
6. Commit the files to `main`.
7. Open the repository **Settings → Pages → Build and deployment**.
8. Select **Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**.
9. After deployment, the expected URL is:
   `https://siddy1992.github.io/asianhost-2026-konfhub-integration/`
10. Open that address to see the live *demo* website.

**For future changes:** Edit files in VS Code, then commit and push them to `main`. GitHub Pages will redeploy automatically.

### Git commands for subsequent changes

From the extracted folder (once connected to the new GitHub repository):
```bash
git add .
git commit -m "Update AsianHOST registration website"
git push
```

If you prefer, you can edit individual files directly on GitHub with the pencil icon and commit changes; GitHub Pages redeploys.

## D. KonfHub integration and automatic participant transfer

- Event: https://konfhub.com/asian-host-ticketing
- Fixed-widget test: `konfhub-widget-test.html`
- Ticket mapping test: `konfhub-diagnostics.html`
- The original fixed iframe supports only the **Indian Student – General** ticket. Other categories need matching KonfHub ticket IDs.
- For supported ticket-specific checkout links, `konfhub-integration.js` builds a URL containing name, email, organization, phone, registration reference, and other supported form fields.
- The local `konfhub-public-tickets.json` starts empty. Fill it with **public ticket and form metadata** from the KonfHub ticket endpoint, or allow the browser to fetch that endpoint if cross-origin access is permitted.
- **Do not put private API keys, coupon secrets, bank information, attendee exports, or credentials into this public folder.**
- A KonfHub checkout may still require participants to confirm details or complete consent manually.
- The prefill mechanism is implemented, but actual ticket IDs and form IDs must be available and verified for each category before it can be called fully configured.

## E. What this does NOT do yet

This is an editable and launchable **frontend demo**, not a production payment portal. A static GitHub Pages site cannot securely receive and verify KonfHub webhooks, hold private API credentials, or maintain an authoritative cross-device payment-status database. Before accepting real payments, your developer must deploy the backend described in `backend/INTEGRATION_CONTRACT.md` and verify the institutional bank settlement, tax and fee arrangements with SRIC and KonfHub.

The original website's browser-local status and invoice preview are illustrative, not official payment confirmations.

## F. Quick test

1. Run the local launcher.
2. Open `http://127.0.0.1:8000/`.
3. Complete a test registration without paying.
4. Confirm the checkout page opens and shows the correct ticket category.
5. Open `/konfhub-diagnostics.html` and check ticket mappings.
6. Open `/konfhub-widget-test.html` to test the embedded widget.
7. Verify the original status lookup, policy pages, and invoice preview still display.
8. Do not make a real payment until the settlement and tax setup is approved.

For detailed configuration instructions, also read `START_HERE_KONFHUB.md`.

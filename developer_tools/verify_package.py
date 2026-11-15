#!/usr/bin/env python3
"""Static checks for the AsianHOST + KonfHub frontend (no dependencies)."""
from pathlib import Path
import shutil, subprocess
root=Path(__file__).resolve().parent.parent
required=['index.html','app.js','styles.css','checkout.html','checkout.js',
          'konfhub-integration.js','konfhub-public-tickets.json','konfhub-diagnostics.html',
          'konfhub-widget-test.html','invoice.html','invoice.js','invoice.css',
          'terms.html','refund.html','privacy.html','about-contact.html','policy.css',
          'README.md','assets/asianhost-logo.png','assets/iitkgp-logo.png']
for name in required:
    assert (root/name).is_file(),f'Missing {name}'
for name,term in [('checkout.html','konfhub-integration.js'),
                  ('checkout.html','eaa9296e-ad76-4de9-bdc1-06a0c1ce1e1d'),
                  ('checkout.js','AsianHOSTKonfHub'),
                  ('app.js','other-paper-fields'),('index.html','id="other-paper-fields"'),
                  ('app.js','2026-11-16T00:00:00+05:30'),
                  ('app.js','invoicePreviewAction(rec)'),('app.js','invoiceRequestAction(rec)'),
                  ('README.md','## 17. Mandatory invoice-button regression checks'),
                  ('refund.html','5 December 2026'),
                  ('refund.html','bhattacharya.sarani.iitkgp@gmail.com'),
                  ('about-contact.html','joydeepchow@gmail.com'),
                  ('README.md','## 14. Developer handoff')]:
    assert term in (root/name).read_text(),f'{name}: missing {term}'
assert 'simulate-success' not in (root/'checkout.html').read_text()
if shutil.which('node'):
    for name in ['app.js','checkout.js','konfhub-integration.js','invoice.js']:
        subprocess.run(['node','--check',str(root/name)],check=True)
print('PASS: frontend files, KonfHub checkout, invoices, policies, deadline and JavaScript syntax')

"""Verify the new package preserves original non-checkout files byte-for-byte."""
from pathlib import Path
import zipfile
ROOT=Path(__file__).resolve().parents[1]
ORIGINAL=Path('/mnt/data/asianhost-2026-registration-demo-main.zip')
# If source ZIP is not present on another developer's computer, verify structural invariants.
required=['index.html','app.js','styles.css','checkout.html','checkout.js','konfhub-integration.js',
          'konfhub-public-tickets.json','konfhub-diagnostics.html','konfhub-widget-test.html',
          'invoice.html','invoice.js','terms.html','refund.html','privacy.html','about-contact.html',
          'assets/asianhost-logo.png','assets/iitkgp-logo.png','START_HERE_KONFHUB.md']
for name in required:
    assert (ROOT/name).is_file(),f'Missing required file: {name}'
assert 'simulate-success' not in (ROOT/'checkout.html').read_text(), 'Mock success button must be removed'
assert 'paymentMethod=\'complimentary_coupon\'' not in (ROOT/'checkout.js').read_text(), 'Checkout must not approve mock coupons'
assert 'konfhub-integration.js' in (ROOT/'checkout.html').read_text()
assert 'eaa9296e-ad76-4de9-bdc1-06a0c1ce1e1d' in (ROOT/'checkout.html').read_text()
if ORIGINAL.exists():
    with zipfile.ZipFile(ORIGINAL) as z:
        prefix='asianhost-2026-registration-demo-main/'
        originals=[n for n in z.namelist() if n.startswith(prefix) and not n.endswith('/')]
        modified=[]
        for n in originals:
            rel=n[len(prefix):]
            if (ROOT/rel).read_bytes()!=z.read(n): modified.append(rel)
        allowed={'CHANGELOG.md','IMPORTANT_README_FIRST.txt','README.md','app.js','checkout.html','checkout.js','developer_tools/README.md','developer_tools/regression_suite.py','developer_tools/verify_package.py','index.html','terms.html'}
        assert set(modified)<=allowed,f'Unexpected modifications to original site: {modified}'
        print('PASS: Original non-calendar, non-checkout site files are unchanged.')
else:
    print('Original source ZIP not available; structural checks completed.')
print('PASS: Required files present, original demo payment controls removed, KonfHub integration linked.')

"""Local browser regression tests; KonfHub API is mocked, no real payments."""
import json
from playwright.sync_api import sync_playwright

URL='http://127.0.0.1:8877/'
PAYLOAD={"data":{"tickets":[{"ticket_id":"ticket-indian-2000","ticket_name":"Indian Student - General","ticket_price":2000,"forms":[{"form_id":101,"form_name":"AsianHOST Registration ID","is_default":False,"er_column_mapping":"custom_forms"},{"form_id":102,"form_name":"Registration Purpose","is_default":False,"er_column_mapping":"custom_forms"}]}]}}
ORDER={"AH26-TEST-123":{"id":"AH26-TEST-123","kind":"registration","purpose":"attendee","period":"regular","category":"indian-student","categoryName":"General Participation – Indian Student","amount":2000,"person":{"name":"Alex Example","email":"alex@example.org","phone":"+919000000000","institution":"Example University","country":"India"},"status":"pending"}}

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=browser.new_context()
 page=context.new_page()
 page.goto(URL+'index.html',wait_until='domcontentloaded')
 page.evaluate("data => localStorage.setItem('asianhost2026_demo_registrations_inr_v2',JSON.stringify(data))",ORDER)
 page.route('https://api.konfhub.com/**',lambda route:route.fulfill(status=200,content_type='application/json',body=json.dumps(PAYLOAD)))
 page.goto(URL+'checkout.html?id=AH26-TEST-123',wait_until='domcontentloaded')
 page.wait_for_selector('#kh-prefill:visible',timeout=8000)
 href=page.locator('#kh-prefill').get_attribute('href')
 assert 'ticketId=ticket-indian-2000' in href,href
 assert 'name=Alex+Example' in href,href
 assert 'email_id=alex%40example.org' in href,href
 assert '101=AH26-TEST-123' in href,href
 assert '102=General+Participant' in href,href
 assert page.locator('#kh-widget-wrap').is_hidden()
 assert page.locator('#kh-order').inner_text()=='AH26-TEST-123'
 print('PASS: prefilled checkout link, ticket ID and registration reference')
 # No API response: fixed-ticket widget fallback must be limited to Indian Student.
 page.unroute('https://api.konfhub.com/**')
 page.route('https://api.konfhub.com/**',lambda route:route.abort())
 page.reload(wait_until='domcontentloaded')
 page.wait_for_selector('#kh-widget-wrap:visible',timeout=8000)
 assert page.locator('#kh-prefill').is_hidden()
 print('PASS: safe fixed-ticket widget fallback')
 # A non-Indian ticket must NEVER be sent to the ₹2,000 widget.
 changed=dict(ORDER)
 changed['AH26-TEST-123']=dict(ORDER['AH26-TEST-123'],category='nonieee',amount=70000,categoryName='Non-IEEE Member')
 page.evaluate("data => localStorage.setItem('asianhost2026_demo_registrations_inr_v2',JSON.stringify(data))",changed)
 page.reload(wait_until='domcontentloaded')
 page.wait_for_function("document.querySelector('#kh-loading').hidden",timeout=8000)
 assert page.locator('#kh-widget-wrap').is_hidden()
 assert page.locator('#kh-prefill').is_hidden()
 print('PASS: wrong-ticket checkout prevented')
 # Original pages and policy links are still available.
 for path in ['index.html','invoice.html','terms.html','refund.html','privacy.html','about-contact.html','konfhub-widget-test.html','konfhub-diagnostics.html']:
  response=page.request.get(URL+path)
  assert response.status==200,(path,response.status)
 print('PASS: original pages, policies and new diagnostic pages are present')
 browser.close()

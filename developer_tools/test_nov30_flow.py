#!/usr/bin/env python3
"""In-memory browser test for deadline migration and KonfHub checkout prefill.
Requires playwright + Chromium. Does not access KonfHub or process payments.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
KEY='asianhost2026_demo_registrations_inr_v2'
TICKETS={'data':{'tickets':[
 {'ticket_id':'mock-ieee-early','ticket_name':'IEEE Member - Early','ticket_price':50000,
  'forms':[{'form_id':201,'form_name':'AsianHOST Registration ID','is_default':False,'er_column_mapping':'custom_forms'}]},
 {'ticket_id':'mock-ieee-regular','ticket_name':'IEEE Member - Regular','ticket_price':60000,
  'forms':[{'form_id':201,'form_name':'AsianHOST Registration ID','is_default':False,'er_column_mapping':'custom_forms'}]}
]}}
BASE={'id':'AH26-OLD-DEADLINE','kind':'registration','purpose':'author','period':'regular','category':'ieee',
 'categoryName':'IEEE Member','amount':60000,'person':{'name':'Alex Example','email':'alex@example.org',
 'phone':'+919000000000','institution':'Example University','country':'India'},'status':'pending'}

def test_checkout(browser,date,period,amount,ticket_id):
 page=browser.new_page()
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content((ROOT/'checkout.html').read_text(),wait_until='domcontentloaded')
 page.evaluate('''({records,date,payload})=>{
   let stored=JSON.stringify(records);
   Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:()=>stored,setItem:(key,value)=>{stored=value;}
   }});
   window.__records=()=>JSON.parse(stored);
   Date.now=()=>Date.parse(date);
   window.fetch=async(url)=>({ok:true,json:async()=>String(url).includes('api.konfhub.com')?payload:{tickets:[]}});
 }''',{'records':{BASE['id']:BASE},'date':date,'payload':TICKETS})
 for name in ['registration-config.js','konfhub-integration.js']:
  page.add_script_tag(content=(ROOT/name).read_text())
 js=(ROOT/'checkout.js').read_text().replace("const id = new URLSearchParams(location.search).get('id');","const id = 'AH26-OLD-DEADLINE';")
 page.add_script_tag(content=js)
 page.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'))")
 page.wait_for_selector('#kh-prefill:visible',timeout=5000)
 assert page.locator('#kh-period').inner_text()==('Early' if period=='early' else 'Regular / on-site')
 assert page.locator('#kh-amount').inner_text()=='₹'+format(amount,',')
 href=page.locator('#kh-prefill').get_attribute('href')
 assert 'ticketId='+ticket_id in href,href
 assert '201=AH26-OLD-DEADLINE' in href,href
 saved=page.evaluate('window.__records()["AH26-OLD-DEADLINE"]')
 assert saved['amount']==amount and saved['period']==period
 assert not errors,errors
 page.close()

def test_index(browser,date,period,amount):
 page=browser.new_page()
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content((ROOT/'index.html').read_text(),wait_until='domcontentloaded')
 page.evaluate('''(date)=>{Date.now=()=>Date.parse(date);
   Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:()=>null,setItem:()=>{}}});
   history.replaceState=()=>{};window.scrollTo=()=>{};
 }''',date)
 for name in ['registration-config.js','app.js']:
  page.add_script_tag(content=(ROOT/name).read_text())
 page.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'))")
 assert page.locator('#fee-preview').inner_text()=='₹'+format(amount,',')
 assert page.locator('#early-btn').is_disabled()==(period=='regular')
 assert page.locator('#regular-btn').is_disabled()==(period=='early')
 assert not errors,errors
 page.close()

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for date,period,amount,ticket in [
   ('2026-11-16T01:53:00+05:30','early',50000,'mock-ieee-early'),
   ('2026-11-30T23:59:59+05:30','early',50000,'mock-ieee-early'),
   ('2026-12-01T00:00:00+05:30','regular',60000,'mock-ieee-regular')]:
  test_index(browser,date,period,amount)
  test_checkout(browser,date,period,amount,ticket)
 browser.close()
print('PASS: 16 Nov and 30 Nov use ₹50,000 early; 1 Dec uses ₹60,000 regular.')
print('PASS: stale pending orders are repaired, correct ticket and registration-ID prefill selected.')

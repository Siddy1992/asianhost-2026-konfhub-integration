'use strict';
/* AsianHOST KonfHub hosted checkout preview.
 * Never mark a browser-local order as paid, validate coupons here, or assume
 * that prefill parameters are accepted by KonfHub without checking the form.
 */
const STORAGE_KEY = 'asianhost2026_demo_registrations_inr_v2';
const REGISTRATION_CONFIG = window.AsianHOSTRegistrationConfig;
if (!REGISTRATION_CONFIG) throw new Error('registration-config.js must load before checkout.js');
const REGULAR_AMOUNTS = REGISTRATION_CONFIG.REGULAR_AMOUNTS;
const EARLY_AMOUNTS = REGISTRATION_CONFIG.EARLY_AMOUNTS;
const $ = id => document.getElementById(id);
const money = n => '₹' + Number(n).toLocaleString('en-IN',{maximumFractionDigits:2});
function readOrders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'); }
  catch (_) { return {}; }
}
function saveOrders(orders) {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(orders)); return true; }
  catch (_) { return false; }
}
function showMessage(text,kind) {
  const el=$('kh-message');el.textContent=text;
  el.className='kh-notice'+(kind?' '+kind:'');el.hidden=false;
}
function showWarnings(items) {
  const el=$('kh-warnings');el.replaceChildren();
  if (!items.length) { el.hidden=true; return; }
  const h=document.createElement('strong');h.textContent='Items to verify before payment';
  const ul=document.createElement('ul');
  for(const item of items){const li=document.createElement('li');li.textContent=item;ul.appendChild(li);}
  el.append(h,ul);el.hidden=false;
}
function renderOrder(order) {
  $('kh-order').textContent=order.id;
  $('kh-person').textContent=order.person?.name||'—';
  $('kh-email').textContent=order.person?.email||'—';
  $('kh-category').textContent=order.categoryName||order.category||'—';
  $('kh-period').textContent=['indian-student','phd-intl','phd-indian'].includes(order.category)
    ?'Fixed rate':(order.period==='early'?'Early':'Regular / on-site');
  $('kh-amount').textContent=money(order.amount);
}
function renderTicket(K,choice,result) {
  const ticket=choice.ticket,id=K.getTicketId(ticket);
  $('kh-match-details').hidden=false;
  $('kh-ticket-name').textContent=K.getTicketName(ticket);
  $('kh-ticket-id').textContent=String(id);
  const source=result.sourceByTicketId?.[String(id)]||result.source;
  $('kh-data-source').textContent=source==='KonfHub'?'Live public KonfHub API':'Organizer-supplied local snapshot';
  const t=K.ticketTimeSummary(ticket);
  $('kh-ticket-availability').textContent=t.opens+' — '+t.closes;
  const warnings=[];
  if(source!=='KonfHub')warnings.push('Live public ticket data could not be confirmed for this ticket. The local snapshot may be outdated; verify the ticket and fee directly on KonfHub.');
  const schedule=K.ticketScheduleProblem(ticket,choice.key);
  if(schedule)warnings.push(schedule+' The website and KonfHub must use matching dates before live registration.');
  if(!K.getTicketForms(ticket).some(f=>K.normalize(K.getFormName(f))==='asianhostregistrationid'))
    warnings.push('The AsianHOST Registration ID field was not found in this ticket metadata. Check the KonfHub form and enter the ID manually if necessary.');
  const tax=Number(ticket.tax_percentage);
  if(Number.isFinite(tax)&&tax>0)warnings.push('KonfHub reports '+tax+'% GST on this ticket. Confirm whether the published fee includes GST and verify the final payable total.');
  showWarnings(warnings);
}
async function init() {
  const K=window.AsianHOSTKonfHub;
  const id=new URLSearchParams(location.search).get('id');
  const orders=readOrders();
  const order=id&&orders[id];
  if(!K||!order||!order.person){
    $('kh-loading').hidden=true;
    showMessage('Registration reference not found in this browser. Return to the AsianHOST registration form and complete the steps before checkout.','error');
    return;
  }
  renderOrder(order);
  $('kh-copy-id').onclick=async()=>{
    try{await navigator.clipboard.writeText(order.id);$('kh-copy-result').textContent='Copied';}
    catch(_){$('kh-copy-result').textContent='Select the registration ID above to copy it';}
  };
  if(order.kind!=='registration'){
    $('kh-loading').hidden=true;
    showMessage('Supplementary balance payments are not configured in KonfHub. Contact the organizing committee for an approved payment route.','error');
    return;
  }
  if(order.sample||order.status==='paid'){
    $('kh-loading').hidden=true;
    showMessage('This record is already marked paid in the browser demo or is a sample. Browser status is not evidence of a KonfHub payment. Start a new registration or contact the organizers for reconciliation.','warning');
    return;
  }
  // Repair older pending/failed records created with the former 15 Nov cutoff.
  // The fee is always recalculated at checkout; never change a paid record.
  if(['pending','failed'].includes(order.status)&&REGULAR_AMOUNTS[order.category]!=null){
    const earlyOpen=Date.now()<K.EARLY_CUTOFF;
    const targetPeriod=earlyOpen?'early':'regular';
    const targetAmount=earlyOpen?EARLY_AMOUNTS[order.category]:REGULAR_AMOUNTS[order.category];
    if(order.period!==targetPeriod||Number(order.amount)!==targetAmount){
      order.period=targetPeriod;order.amount=targetAmount;order.updated=new Date().toISOString();
      orders[id]=order;saveOrders(orders);renderOrder(order);
      showMessage(earlyOpen
        ?'The early deadline is now 30 November 2026. Your previous pending registration has been updated to the applicable early rate.'
        :'Early registration has closed. Your previous pending registration has been updated to the applicable regular rate.','warning');
    }
  }
  let result;
  try{result=await K.getTickets();}
  catch(e){result={tickets:[],source:'unavailable',errors:[String(e)]};}
  const choice=K.assess(order,result.tickets);
  $('kh-loading').hidden=true;
  if(choice.ticket)renderTicket(K,choice,result);
  if(choice.ready){
    const basic=K.buildPrefillUrl(order,choice.ticket,{mode:'safe'});
    const ticketOnly=K.buildPrefillUrl(order,choice.ticket,{mode:'ticket'});
    const link=$('kh-prefill');link.href=basic;link.hidden=false;link.target='_blank';
    const lab=$('kh-prefill-lab');lab.href='prefill-lab.html?id='+encodeURIComponent(order.id);lab.hidden=false;
    const fallback=$('kh-ticket-only');fallback.href=ticketOnly;fallback.hidden=false;fallback.target='_blank';
    $('kh-profile-help').hidden=false;
    const detailsForm=$('kh-final-details');detailsForm.hidden=false;
    const diet=$('kh-dietary'),full=$('kh-prefill-full');
    diet.value=['Veg','Non Veg'].includes(order.person?.dietary)?order.person.dietary:'';
    const originalWarnings=Array.from($('kh-warnings').querySelectorAll('li')).map(x=>x.textContent);
    if(result.sourceByTicketId?.[String(K.getTicketId(choice.ticket))]!=='KonfHub' && K.getRawTicketForms(choice.ticket).some(K.isRetiredForm))
      originalWarnings.push('The bundled historical snapshot still lists retired KonfHub form 186672. It is excluded from every generated URL and mandatory-field check. Confirm the live KonfHub form was updated for all 13 tickets.');
    function refreshPrefill(){
      const fields=K.getPrefillFields(order,choice.ticket);
      const gaps=K.requiredPrefillGaps(order,choice.ticket);
      const report=$('kh-prefill-report');report.hidden=false;
      report.replaceChildren();
      const heading=document.createElement('h3');heading.textContent='Ticket-specific field transfer ('+fields.filter(x=>x.ready).length+' ready)';
      const list=document.createElement('ul');
      for(const field of fields){
        const li=document.createElement('li');
        const status=document.createElement('strong');
        status.textContent=field.ready?'Ready':!field.key?'Not on ticket':field.required?'Needs attention':'Optional blank';
        li.append(status,document.createTextNode(' · '+field.label+(field.required?' (required)':'')));
        if(!field.ready){li.className='kh-missing';li.title=field.reason;}
        list.append(li);
      }
      report.append(heading,list);
      if(gaps.length===0){
        full.href=K.buildPrefillUrl(order,choice.ticket,{mode:'full'});
        full.hidden=false;
        $('kh-final-result').textContent='All mapped active mandatory fields have values. This is an experimental URL: KonfHub may still reject profile updates. Check all fields before payment.';
      }else{
        full.removeAttribute('href');full.hidden=true;
        $('kh-final-result').textContent='Complete the required fields above to enable complete prefill. Missing: '+gaps.map(x=>x.label).join(', ')+'.';
      }
      const textFields=K.PREFILL_FIELD_KEYS.filter(x=>!['phone','country','dietary'].includes(x));
      const textPrefill=$('kh-text-prefill');
      textPrefill.href=K.buildPrefillUrl(order,choice.ticket,{mode:'full',fields:textFields});
      textPrefill.hidden=false;textPrefill.target='_blank';
      const extra=[];
      if(gaps.length)extra.push('Complete prefill is temporarily disabled because KonfHub requires: '+gaps.map(x=>x.label).join(', ')+'.');
      if(order.purpose!=='author'&&fields.some(x=>x.id==='paperId'&&x.required))extra.push('KonfHub currently requires Paper ID/Title on this full ticket even for general attendees. The prefill explicitly says Not applicable; organizers should make these fields conditional.');
      showWarnings([...originalWarnings,...extra]);
      $('kh-explanation').textContent='Basic name/email prefill is recommended. Experimental full prefill attempts active ticket-specific institution, reference, purpose, paper/IEEE, country, phone and dietary fields. Retired Declaration / Consent is always excluded. KonfHub may still reject additional fields; use the field-isolation lab or manual checkout if the red profile error persists. No payment is verified here.';
    }
    function markDirty(){
      full.hidden=true;full.removeAttribute('href');
      $('kh-final-result').textContent='You changed the required details. Select “Save required details for prefill” to regenerate the checkout URL.';
    }
    diet.addEventListener('change',markDirty);
    detailsForm.addEventListener('submit',e=>{
      e.preventDefault();
      if(!['Veg','Non Veg'].includes(diet.value)){
        $('kh-final-result').textContent='Please select Vegetarian or Non-vegetarian.';
        diet.focus();return;
      }
      order.person.dietary=diet.value;
      order.updated=new Date().toISOString();
      orders[id]=order;
      if(!saveOrders(orders)){
        $('kh-final-result').textContent='Could not save details in this browser. Enable local storage or retry.';return;
      }
      refreshPrefill();
    });
    refreshPrefill();
    if(/@(example\.(org|com|net)|test\.invalid)$/i.test(String(order.person.email||''))) {
      showWarnings([...Array.from($('kh-warnings').querySelectorAll('li')).map(x=>x.textContent),
        'This is a fictional example email address. Do not use sample identities for live registration or payment.']);
    }
  }else{
    const why=choice.reason||'Ticket information could not be loaded.';
    showMessage(why+' No automated checkout will be offered for a missing, closed or incorrectly priced ticket.','warning');
    $('kh-event').hidden=false;
    if(K.ticketKey(order)==='indian-student:fixed'&&Number(order.amount)===2000){
      $('kh-widget-wrap').hidden=false;$('kh-widget-note').hidden=false;
      $('kh-explanation').textContent='The existing Indian Student widget is available for manual visual testing. It does not prefill your details and cannot update the browser-local payment status.';
    }
  }
}
document.addEventListener('DOMContentLoaded',init);

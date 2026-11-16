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
    const link=$('kh-prefill');link.href=choice.url;link.hidden=false;link.target='_blank';
    $('kh-explanation').textContent='The correct KonfHub ticket was matched and a prefill URL was prepared. This does not prove that KonfHub accepted each field or that a payment succeeded. Verify all entries and the total on KonfHub. The browser record remains pending.';
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

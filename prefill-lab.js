'use strict';
/* Field-level diagnostics for organizer-approved KonfHub form prefill.
 * Never logs participant data, confirms payments or auto-accepts consent.
 */
const LAB_STORAGE_KEY='asianhost2026_demo_registrations_inr_v2';
const labEl=id=>document.getElementById(id);
function labText(id,text){labEl(id).textContent=text;}
async function initLab(){
  const K=window.AsianHOSTKonfHub;
  const id=new URLSearchParams(location.search).get('id');
  if(id)labEl('lab-back').href='checkout.html?id='+encodeURIComponent(id);
  let order;
  try{order=JSON.parse(localStorage.getItem(LAB_STORAGE_KEY)||'{}')[id];}catch(_){/* no record */}
  if(!order||!order.person||!K){labText('lab-status','Registration not found in this browser. Return to the registration page and create a pending record.');return;}
  if(order.kind!=='registration'||order.status==='paid'||order.sample){labText('lab-status','This tool is for pending non-sample registration records only.');return;}
  const result=await K.getTickets();
  const choice=K.assess(order,result.tickets);
  if(!choice.ready){labText('lab-status',choice.reason||'Matching ticket unavailable.');return;}
  const ticket=choice.ticket;
  labText('lab-status','Ready to test — '+(order.categoryName||order.category)+' · '+(order.period||'fixed')+' · ticket '+K.getTicketId(ticket));
  labText('lab-ticket','Ticket data: '+(result.sourceByTicketId?.[String(K.getTicketId(ticket))]||result.source)+'. Verify actual availability and price on KonfHub.');
  const fields=K.getPrefillFields(order,ticket);
  const selection=new Set(fields.filter(f=>f.ready&&!['country','phone'].includes(f.id)).map(f=>f.id));
  const body=labEl('lab-field-rows');
  for(const field of fields){
    const tr=document.createElement('tr');
    const td=document.createElement('td'),checkbox=document.createElement('input');
    checkbox.type='checkbox';checkbox.checked=selection.has(field.id);checkbox.disabled=!field.ready;
    checkbox.setAttribute('aria-label','Include '+field.label);
    checkbox.addEventListener('change',()=>{if(checkbox.checked)selection.add(field.id);else selection.delete(field.id);refresh();});
    td.append(checkbox);tr.append(td);
    const label=document.createElement('td');label.textContent=field.label;tr.append(label);
    const key=document.createElement('td');key.textContent=field.key||'Not attached';
    const note=document.createElement('small');note.textContent=field.risk;key.append(note);tr.append(key);
    const state=document.createElement('td');state.textContent=field.ready?'Ready':field.reason;
    if(!field.ready)state.className='missing';else if(field.risk.startsWith('Specialized'))state.className='warn';
    tr.append(state);body.append(tr);
    field.checkbox=checkbox;
  }
  function refresh(){
    for(const field of fields)field.checkbox.checked=selection.has(field.id);
    labText('lab-selection','Selected additional fields: '+(selection.size?[...selection].join(', '):'none (name and email only)'));
  }
  function setPreset(preset){
    selection.clear();
    for(const f of fields){
      if(!f.ready||preset==='basic')continue;
      if(preset==='text'&&!['phone','country'].includes(f.id))selection.add(f.id);
      if(preset==='country'&&f.id!=='phone')selection.add(f.id);
      if(preset==='phone'&&f.id!=='country')selection.add(f.id);
      if(preset==='all')selection.add(f.id);
    }
    refresh();
  }
  document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>setPreset(b.dataset.preset)));
  labEl('lab-open').addEventListener('click',()=>{
    try{
      const url=K.buildPrefillUrl(order,ticket,{mode:'full',fields:[...selection]});
      window.open(url,'_blank','noopener,noreferrer');
    }catch(e){labText('lab-status','Unable to open test: '+e.message);}
  });
  labEl('lab-controls').hidden=false;refresh();
}
document.addEventListener('DOMContentLoaded',initLab);

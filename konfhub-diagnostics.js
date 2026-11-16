'use strict';
/* Read-only KonfHub organizer diagnostics; no API credentials. */
(function(){
  const $=id=>document.getElementById(id);
  const K=window.AsianHOSTKonfHub;
  let lastRows=[],lastActions=[];
  const addCell=(row,text)=>{const td=document.createElement('td');td.textContent=String(text);row.appendChild(td);return td;};
  function csvEscape(v){return '"'+String(v??'').replace(/"/g,'""')+'"';}
  function downloadCsv(){
    const headings=['Website key','KonfHub ticket','Expected fee INR','Ticket ID','API fee INR','Metadata source','Opens IST','Closes IST','Registration ID field','Issue'];
    const csv=[headings,...lastRows].map(row=>row.map(csvEscape).join(',')).join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='asianhost-konfhub-ticket-audit-16nov2026.csv';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function baseActions(){return [
    'In KonfHub → Event Info → Tickets, set all five Early tickets to close on 30 November 2026 at 11:59 p.m. IST (or the closest supported end-of-minute value).',
    'Set all five Regular tickets to open on 1 December 2026 at 12:00 a.m. IST. The screenshots still show Regular tickets opening 15 November.',
    'Verify the three fixed-fee tickets stay available: Indian Student – General ₹2,000; PhD Forum – International ₹15,000; PhD Forum – Indian ₹5,000.',
    'Confirm with SRIC whether the 18% GST shown in KonfHub is inclusive or additional, the applicable SAC/HSN, gateway charges, settlement account and payment activation.',
    'Confirm Declaration / Consent (historical form 186672) is removed from every live ticket. Check AsianHOST Registration ID, institution, phone, country, author-only paper fields, IEEE fields, and dietary choice.',
    'Test all 13 tickets without payment, isolating each custom field when the KonfHub profile error appears. For unresolved errors send the redacted failing request and response to KonfHub support; configure private webhook verification for payment status.'
  ];}
  async function load(){
    $('tickets').replaceChildren();$('errors').textContent='';
    $('source').textContent='Loading…';$('mapped').textContent='…';
    let response;
    try{response=await K.getTickets();}
    catch(e){response={tickets:[],source:'unavailable',errors:[String(e)],liveCount:0,snapshotCount:0,sourceByTicketId:{}};}
    $('source').textContent=response.source;
    $('count').textContent=String(response.tickets.length);
    $('live-count').textContent=String(response.liveCount||0);
    $('snapshot-count').textContent=String(response.snapshotCount||0);
    $('errors').textContent=(response.errors||[]).join('\n');
    let mapped=0,prefill=0,schedule=0;
    lastRows=[];lastActions=baseActions();
    for(const [key,def] of Object.entries(K.TICKETS)){
      const ticket=K.matchTicket(response.tickets,key),id=ticket&&K.getTicketId(ticket);
      const price=ticket&&K.getPrice(ticket),forms=ticket?K.getTicketForms(ticket):[];
      const hasRef=forms.some(f=>K.normalize(K.getFormName(f))==='asianhostregistrationid');
      const scheduleProblem=ticket?K.ticketScheduleProblem(ticket,key):null;
      const valid=!!ticket&&id!=null&&(price==null||price===def.amount);
      if(valid)mapped++;if(valid&&hasRef)prefill++;if(valid&&!scheduleProblem)schedule++;
      const source=id!=null?(response.sourceByTicketId?.[String(id)]||'unknown'):'—';
      const t=ticket?K.ticketTimeSummary(ticket):{opens:'—',closes:'—'};
      let status,cls;
      if(!ticket){status='Ticket missing';cls='bad';}
      else if(id==null){status='Missing ID';cls='bad';}
      else if(price!==null&&price!==def.amount){status='Price mismatch';cls='bad';}
      else if(!hasRef){status='Registration ID missing';cls='warn';}
      else if(scheduleProblem){status='Schedule mismatch';cls='warn';}
      else if(source!=='KonfHub'){status='Mapped · snapshot only';cls='warn';}
      else {status='Mapped · live metadata';cls='ready';}
      const row=[key,def.names[0],def.amount,id??'—',price??'Not reported',source,t.opens,t.closes,hasRef?'Yes':'No',scheduleProblem||status];
      lastRows.push(row);
      const tr=document.createElement('tr');
      for(const value of [def.names[0], '₹'+def.amount.toLocaleString('en-IN'),id??'—',price==null?'—':'₹'+price.toLocaleString('en-IN'),source,t.opens+' → '+t.closes,hasRef?'Yes':'No',status])addCell(tr,value);
      tr.lastElementChild.className='result '+cls;$('tickets').appendChild(tr);
      if(scheduleProblem)lastActions.push(def.names[0]+': '+scheduleProblem);
      if(price!==null&&price!==def.amount)lastActions.push(def.names[0]+': ticket price ₹'+price+' does not match expected ₹'+def.amount+'.');
      if(!hasRef)lastActions.push(def.names[0]+': add required AsianHOST Registration ID field.');
    }
    $('mapped').textContent=mapped+'/13';$('prefill-ready').textContent=prefill+'/13';$('schedule-ready').textContent=schedule+'/13';
    const list=$('action-list');list.replaceChildren();
    for(const action of lastActions){const li=document.createElement('li');li.textContent=action;list.appendChild(li);}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    $('reload').onclick=load;
    $('download-csv').onclick=downloadCsv;
    $('copy-actions').onclick=async()=>{
      const content=lastActions.map((s,i)=>(i+1)+'. '+s).join('\n');
      try{await navigator.clipboard.writeText(content);$('copy-actions').textContent='Copied';}
      catch(_){$('copy-actions').textContent='Copy unavailable';}
    };
    load();
  });
})();

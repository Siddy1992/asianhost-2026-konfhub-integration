/* AsianHOST 2026 / KonfHub public checkout integration.
 * Public ticket/form metadata only. NEVER put private API keys here.
 * Checkout form prefilling follows KonfHub's direct-to-form URL method.
 * This module does NOT authenticate payment or registration success.
 */
(function(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.AsianHOSTKonfHub = api;
})(typeof window !== 'undefined' ? window : null, function() {
  'use strict';
  const EVENT_SLUG = 'asian-host-ticketing';
  const PUBLIC_API = 'https://api.konfhub.com/event/url/' + EVENT_SLUG + '/tickets';
  const PUBLIC_SNAPSHOT = 'konfhub-public-tickets.json';
  const FALLBACK_WIDGET_ID = 'eaa9296e-ad76-4de9-bdc1-06a0c1ce1e1d';
  const EARLY_CUTOFF = (typeof window !== 'undefined' && window.AsianHOSTRegistrationConfig)
    ? window.AsianHOSTRegistrationConfig.REGULAR_START_MS
    : Date.parse('2026-12-01T00:00:00+05:30');

  const TICKETS = Object.freeze({
    'ieee:early': {names:['IEEE Member - Early'], amount:50000},
    'ieee:regular': {names:['IEEE Member - Regular'], amount:60000},
    'nonieee:early': {names:['Non-IEEE Member - Early'], amount:60000},
    'nonieee:regular': {names:['Non-IEEE Member - Regular'], amount:70000},
    'ieee-student:early': {names:['IEEE Student - Early','IEEE Member - Student - Early'], amount:15000},
    'ieee-student:regular': {names:['IEEE Student - Regular','IEEE Member - Student - Regular'], amount:25000},
    'nonieee-student:early': {names:['Non-IEEE Student - Early','Non-IEEE Member - Student - Early'], amount:25000},
    'nonieee-student:regular': {names:['Non-IEEE Student - Regular','Non-IEEE Member - Student - Regular'], amount:35000},
    'life:early': {names:['IEEE Life Member - Early'], amount:25000},
    'life:regular': {names:['IEEE Life Member - Regular'], amount:35000},
    'indian-student:fixed': {names:['Indian Student - General','General Participation - Indian Student'], amount:2000},
    'phd-intl:fixed': {names:['PhD Forum - International'], amount:15000},
    'phd-indian:fixed': {names:['PhD Forum - Indian'], amount:5000}
  });

  const CUSTOM_ALIASES = Object.freeze({
    registrationId:['asianhost registration id','asianhost reference id','registration reference id'],
    purpose:['registration purpose'],
    paperId:['paper id','accepted paper id'],
    paperTitle:['paper title','accepted paper title'],
    phdReference:['phd forum reference','phd reference','phd forum submission id'],
    ieee:['ieee membership number','ieee member number','ieee membership id'],
    country:['country','country of residence'],
    city:['city'],
    billing:['billing name','invoice billing name'],
    gstin:['gstin','gst number']
  });

  function normalize(s) {
    return String(s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'');
  }
  function ticketKey(order) {
    if (!order || order.kind !== 'registration') return null;
    const fixed = ['indian-student','phd-intl','phd-indian'].includes(order.category);
    return order.category + ':' + (fixed ? 'fixed' : order.period);
  }
  function expectedAmount(order) {
    const def = TICKETS[ticketKey(order)];
    return def ? def.amount : null;
  }
  function getTicketId(t) {
    return t && (t.ticket_id ?? t.ticketId ?? t.id);
  }
  function getTicketName(t) {
    return t && (t.ticket_name ?? t.ticketName ?? t.name ?? t.title ?? '');
  }
  function getTicketForms(t) {
    return Array.isArray(t?.forms) ? t.forms :
      Array.isArray(t?.registration_forms) ? t.registration_forms : [];
  }
  // The documented endpoint returns tickets with forms[]. Accept common envelope
  // shapes while avoiding unrelated objects that happen to contain an `id`.
  function extractTickets(payload) {
    const result = [];
    const seen = new Set();
    function walk(node, depth) {
      if (!node || depth > 7 || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(x => walk(x,depth+1)); return; }
      const id = node.ticket_id ?? node.ticketId;
      const name = getTicketName(node);
      if (id != null && name) {
        const k = String(id);
        if (!seen.has(k)) { seen.add(k); result.push(node); }
        return;
      }
      // KonfHub's real endpoint returns {categorized:[],uncategorized:[...]}.
      // Traverse nested containers generically; only objects with ticket_id and
      // ticket_name are collected, so nested form records are not mistaken for tickets.
      for (const v of Object.values(node)) if (v && typeof v === 'object') walk(v,depth+1);
    }
    walk(payload,0);
    return result;
  }
  function matchTicket(tickets, key) {
    const definition = TICKETS[key];
    if (!definition) return null;
    const aliases = definition.names.map(normalize);
    return tickets.find(t => aliases.includes(normalize(getTicketName(t)))) || null;
  }
  function getFormId(f) { return f?.form_id ?? f?.formId ?? null; }
  function getFormName(f) {
    // The actual KonfHub form_name values are HTML paragraphs, not plain labels.
    const raw = String(f?.form_name ?? f?.formName ?? f?.name ?? '');
    return raw.replace(/<[^>]*>/g,' ')
      .replace(/&nbsp;|&#160;/gi,' ')
      .replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
      .replace(/\s+/g,' ').trim();
  }
  function getFormMapping(f) { return f?.er_column_mapping ?? f?.erColumnMapping ?? ''; }
  function isDefaultForm(f) { return f?.is_default === true || f?.is_default === 1 || f?.is_default === 'true'; }
  function findForm(forms, aliases) {
    const names = aliases.map(normalize);
    return forms.find(f => names.includes(normalize(getFormName(f)))) || null;
  }
  function valueAllowed(form, value) {
    const opts = form?.form_options ?? form?.formOptions;
    if (!Array.isArray(opts) || !opts.length) return true;
    return opts.some(o => normalize(typeof o === 'string' ? o : (o?.value ?? o?.label ?? o?.option_name ?? o?.name)) === normalize(value));
  }
  function getPrice(t) {
    // Only compare values clearly identified as a ticket face value.
    for (const k of ['ticket_price','ticketPrice','base_price','basePrice','price']) {
      const v = t?.[k];
      if (v == null || v === '') continue;
      if (typeof v === 'object') continue;
      const num = Number(String(v).replace(/[,₹\s]/g,''));
      if (Number.isFinite(num) && num >= 0) return num;
    }
    return null;
  }
  function purposeLabel(order) {
    return order.purpose === 'author' ? 'Paper Author' :
      order.purpose === 'phd' ? 'PhD Forum Participant' : 'General Participant';
  }
  // KonfHub's timestamps in the supplied API snapshot are UTC without a timezone
  // suffix (e.g. 12:30 UTC is 18:00 IST, matching the dashboard screenshot).
  function ticketTimeUtc(ticket,field) {
    const value=ticket?.[field];
    if (!value || typeof value !== 'string') return null;
    const iso=/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
      ? value.replace(' ','T')+'Z' : value;
    const ms=Date.parse(iso);
    return Number.isFinite(ms)?ms:null;
  }
  function ticketAvailabilityProblem(ticket,now=Date.now()) {
    if (ticket?.is_deleted===true || ticket?.sold_out===true || ticket?.hidden_ticket===true)
      return 'KonfHub has disabled, hidden or sold out this ticket.';
    const start=ticketTimeUtc(ticket,'start_timestamp');
    const end=ticketTimeUtc(ticket,'end_timestamp');
    if (start!==null && now<start) return 'The selected KonfHub ticket is not yet open.';
    if (end!==null && now>=end) return 'The selected KonfHub ticket has already closed.';
    return null;
  }
  // KonfHub's minute-granularity editor may store an 11:59 p.m. closing
  // timestamp or the following 00:00 boundary. Either is acceptable for the
  // displayed 30 November end-of-day deadline. A 6:00 p.m. close is NOT.
  function ticketScheduleProblem(ticket,key) {
    const start=ticketTimeUtc(ticket,'start_timestamp');
    const end=ticketTimeUtc(ticket,'end_timestamp');
    if (key.endsWith(':early') && end!==null &&
        end!==EARLY_CUTOFF && end!==EARLY_CUTOFF-60000)
      return 'Early ticket closes at ' + formatIst(end) + '; expected 30 Nov 2026, 11:59 p.m. IST.';
    if (key.endsWith(':regular') && start!==null && start!==EARLY_CUTOFF)
      return 'Regular ticket opens at ' + formatIst(start) + '; expected 1 Dec 2026, 12:00 a.m. IST.';
    return null;
  }
  function formatIst(ms) {
    if(ms===null || !Number.isFinite(ms)) return 'not reported';
    return new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',
      day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(ms)) + ' IST';
  }
  function ticketTimeSummary(ticket) {
    return {opens:formatIst(ticketTimeUtc(ticket,'start_timestamp')),
      closes:formatIst(ticketTimeUtc(ticket,'end_timestamp'))};
  }
  // KonfHub form-prefill documentation (3 Nov 2026): predefined fields
  // use er_column_mapping; custom forms use form_id even when they also have
  // a non-custom er_column_mapping (e.g. our custom institution form).
  // The registration form's country (type 15) and phone (type 5) fields have
  // vendor-specific validation. Keep them independently testable.
  const PREFILL_FIELD_KEYS=Object.freeze([
    'institution','registrationId','purpose','paperId','paperTitle',
    'phdReference','ieee','gstin','country','phone','city','billing'
  ]);
  function mappedField(forms,aliases) {
    const f=findForm(forms,aliases);
    if(!f)return null;
    const key=isDefaultForm(f)?getFormMapping(f):getFormId(f);
    if(key===null || key===undefined || key==='' || key==='custom_forms')return null;
    return {key:String(key),form:f};
  }
  function normalizedPhone(p) {
    const raw=String(p?.phone||'').trim();
    if(!raw)return '';
    const digits=raw.replace(/\D/g,'');
    // A KonfHub Phone Number custom field presents its own country/dial code.
    // For India, pass a 10-digit national number rather than +91 twice.
    if(normalize(p?.country)==='india') {
      const national=digits.length===12 && digits.startsWith('91')?digits.slice(2):digits;
      return /^[6-9][0-9]{9}$/.test(national)?national:'';
    }
    // International phone-number formatting is not established by the public
    // API. Do not guess dial-code parsing for a paid registration form.
    return '';
  }
  function getPrefillFields(order,ticket) {
    const p=order?.person||{};
    const forms=getTicketForms(ticket);
    const definitions=[
      ['institution','Institution / Organisation',p.institution,
        ['Institution / Organisation','Institution / Organization','Institution','Organisation','Organization']],
      ['registrationId','AsianHOST Registration ID',order?.id,['AsianHOST Registration ID','AsianHOST Reference ID','Registration Reference ID']],
      ['purpose','Registration Purpose',purposeLabel(order||{}),['Registration Purpose']],
      ['paperId','Paper ID',order?.purpose==='author'?order.paperId:'',['Paper ID','Accepted Paper ID']],
      ['paperTitle','Paper Title',order?.purpose==='author'?order.paperTitle:'',['Paper Title','Accepted Paper Title']],
      ['phdReference','PhD Forum Reference',order?.purpose==='phd'?order.phdReference:'',['PhD Forum Reference','PhD Reference','PhD Forum Submission ID']],
      ['ieee','IEEE Membership Number',p.ieee,['IEEE Membership Number','IEEE Member Number','IEEE Membership ID']],
      ['gstin','GSTIN',p.gstin,['GSTIN','GST Number']],
      ['country','Country',p.country,['Country','Country of Residence']],
      ['phone','Phone Number',normalizedPhone(p),['Phone Number']],
      ['city','City',p.city,['City']],
      ['billing','Billing Name',p.billing,['Billing Name','Invoice Billing Name']]
    ];
    return definitions.map(([id,label,raw,aliases])=>{
      const matched=mappedField(forms,aliases);
      const value=String(raw??'').trim();
      let reason='';
      if(!matched)reason='Field not attached to this KonfHub ticket';
      else if(!value)reason=id==='phone' && p.phone
        ? 'Phone format not verified for this country; enter manually'
        : 'No value supplied by the AsianHOST form';
      else if(!valueAllowed(matched.form,value))reason='Value does not match KonfHub dropdown options';
      return {id,label,key:matched?.key||null,value,ready:!reason,reason,
        formType:matched?.form?.form_type??null,
        risk:id==='phone'||id==='country'?'Specialized field — test separately':'Text or listed option'};
    });
  }
  // Modes: ticket = ticket ID only; safe = name and email only;
  // full = name/email + selected mapped fields. A fields array allows a
  // precise per-field isolation test, without modifying KonfHub's iframe.
  function buildPrefillUrl(order,ticket,options={}) {
    const mode=options.mode||'full';
    if(!['ticket','safe','full'].includes(mode))throw new Error('Unknown checkout prefill mode.');
    if(!order?.person)throw new Error('Registrant details are missing.');
    if(!ticket||getTicketId(ticket)==null)throw new Error('KonfHub ticket ID is unavailable.');
    const key=ticketKey(order),expected=expectedAmount(order);
    if(!key||expected==null)throw new Error('This registration type needs an organizer-approved KonfHub ticket.');
    if(Number(order.amount)!==expected)throw new Error('The selected fee does not match the published ticket rate. Please restart registration.');
    if(!['indian-student','phd-intl','phd-indian'].includes(order.category)) {
      if(order.period==='early'&&Date.now()>=EARLY_CUTOFF)
        throw new Error('Early registration closed on 30 November 2026. Please use the regular ticket.');
      if(order.period==='regular'&&Date.now()<EARLY_CUTOFF)
        throw new Error('Regular registration starts on 1 December 2026. Please use the early ticket.');
    }
    const availabilityError=ticketAvailabilityProblem(ticket);
    if(availabilityError)throw new Error(availabilityError);
    const price=getPrice(ticket);
    if(price!==null&&price!==expected)
      throw new Error('KonfHub ticket face value ('+price+') differs from the selected fee ('+expected+'). Check the ticket configuration.');
    const url=new URL('https://konfhub.com/checkout/'+EVENT_SLUG);
    url.searchParams.set('ticketId',String(getTicketId(ticket)));
    if(mode==='ticket')return url.toString();
    if(order.person.name)url.searchParams.set('name',String(order.person.name));
    if(order.person.email)url.searchParams.set('email_id',String(order.person.email));
    if(mode==='safe')return url.toString();
    const selected=options.fields===undefined?new Set(PREFILL_FIELD_KEYS):new Set(options.fields);
    for(const field of getPrefillFields(order,ticket)) {
      if(!selected.has(field.id)||!field.ready)continue;
      // A custom form's numeric ID is always the URL key, even when the
      // field has an er_column_mapping such as organisation or country.
      url.searchParams.set(field.key,field.value);
    }
    // Consent is NEVER pre-accepted, and no document uploads are passed.
    return url.toString();
  }
  async function getTickets(fetchImpl) {
    const fetcher = fetchImpl || (typeof fetch === 'function' ? fetch : null);
    if (!fetcher) return {tickets:[],source:'unavailable',errors:['Fetch is unavailable.'],
      liveCount:0,snapshotCount:0,sourceByTicketId:{},liveAvailable:false};
    const errors = [], sources = [], byId = new Map(), sourceByTicketId = {};
    let liveCount=0, snapshotCount=0;
    // The organizer's snapshot is a FALLBACK, never proof of current price or
    // availability. Live public data wins for every matching ticket ID.
    for (const [source,url] of [['KonfHub',PUBLIC_API],['local snapshot',PUBLIC_SNAPSHOT]]) {
      try {
        const response = await fetcher(url,{cache:'no-store'});
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        const tickets = extractTickets(data);
        if (!tickets.length) { errors.push(source + ': no ticket records found.'); continue; }
        if(source==='KonfHub')liveCount=tickets.length;
        else snapshotCount=tickets.length;
        sources.push(source);
        for (const ticket of tickets) {
          const id = getTicketId(ticket);
          if (id != null && !byId.has(String(id))) {
            byId.set(String(id),ticket);
            sourceByTicketId[String(id)] = source;
          }
        }
      } catch(e) { errors.push(source + ': ' + (e?.message || String(e))); }
    }
    return {tickets:Array.from(byId.values()),source:sources.join(' + ') || 'unavailable',
      errors,liveCount,snapshotCount,sourceByTicketId,liveAvailable:liveCount>0};
  }
  function assess(order,tickets) {
    const key = ticketKey(order);
    const def = TICKETS[key];
    if (!def) return {ready:false,key,reason:'Unsupported registration type (including supplementary balance payments).'};
    if (Number(order.amount) !== def.amount) return {ready:false,key,reason:'The registration amount does not match the expected published fee.'};
    const ticket = matchTicket(tickets,key);
    if (!ticket) return {ready:false,key,reason:'The matching KonfHub ticket was not found in the public ticket data.'};
    try { return {ready:true,key,ticket,url:buildPrefillUrl(order,ticket)}; }
    catch(e) { return {ready:false,key,ticket,reason:e.message}; }
  }
  return {EVENT_SLUG,PUBLIC_API,PUBLIC_SNAPSHOT,FALLBACK_WIDGET_ID,EARLY_CUTOFF,
    TICKETS,CUSTOM_ALIASES,PREFILL_FIELD_KEYS,getPrefillFields,normalize,ticketKey,expectedAmount,extractTickets,
    matchTicket,getTicketId,getTicketName,getTicketForms,getFormName,getPrice,
    ticketTimeUtc,formatIst,ticketTimeSummary,ticketAvailabilityProblem,ticketScheduleProblem,
    buildPrefillUrl,getTickets,assess};
});

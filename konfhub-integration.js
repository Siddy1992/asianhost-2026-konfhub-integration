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
  const EARLY_CUTOFF = Date.parse('2026-11-16T00:00:00+05:30');

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
      for (const [k,v] of Object.entries(node)) {
        if (v && typeof v === 'object' && /^(data|result|tickets|items|records|payload|event|ticket_data|ticket_details|list)$/i.test(k)) {
          walk(v,depth+1);
        }
      }
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
  function getFormName(f) { return f?.form_name ?? f?.formName ?? f?.name ?? ''; }
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
  function buildPrefillUrl(order, ticket) {
    if (!order?.person) throw new Error('Registrant details are missing.');
    if (!ticket || getTicketId(ticket) == null) throw new Error('KonfHub ticket ID is unavailable.');
    const key = ticketKey(order);
    const expected = expectedAmount(order);
    if (!key || expected == null) throw new Error('This registration type needs an organizer-approved KonfHub ticket.');
    if (Number(order.amount) !== expected) throw new Error('The selected fee does not match the published ticket rate. Please restart registration.');
    if (order.period === 'early' && Date.now() >= EARLY_CUTOFF && !['indian-student','phd-intl','phd-indian'].includes(order.category)) {
      throw new Error('The early-registration period has closed. Please use the regular ticket.');
    }
    const price = getPrice(ticket);
    if (price !== null && price !== expected) {
      throw new Error('KonfHub ticket face value (' + price + ') differs from the selected fee (' + expected + '). Check the ticket configuration.');
    }
    const url = new URL('https://konfhub.com/checkout/' + EVENT_SLUG);
    url.searchParams.set('ticketId',String(getTicketId(ticket)));
    const p = order.person;
    // KonfHub documented default checkout keys.
    const defaultFields = {
      name:p.name, email_id:p.email, organisation:p.institution,
      whatsapp_number:p.phone
    };
    for (const [k,v] of Object.entries(defaultFields)) if (v) url.searchParams.set(k,String(v));
    const custom = {
      registrationId:order.id, purpose:purposeLabel(order),
      paperId:order.paperId, paperTitle:order.paperTitle,
      phdReference:order.phdReference, ieee:p.ieee,
      country:p.country, city:p.city, billing:p.billing, gstin:p.gstin
    };
    const forms = getTicketForms(ticket);
    for (const [key,value] of Object.entries(custom)) {
      if (value == null || value === '') continue;
      const form = findForm(forms,CUSTOM_ALIASES[key] || []);
      if (!form || !valueAllowed(form,String(value))) continue;
      // Custom forms use form_id; predefined fields use er_column_mapping.
      const fieldKey = isDefaultForm(form) ? getFormMapping(form) : getFormId(form);
      if (fieldKey != null && String(fieldKey) !== '' && String(fieldKey) !== 'custom_forms') {
        url.searchParams.set(String(fieldKey),String(value));
      }
    }
    // Never pre-accept the separate KonfHub consent checkbox.
    return url.toString();
  }
  async function getTickets(fetchImpl) {
    const fetcher = fetchImpl || (typeof fetch === 'function' ? fetch : null);
    if (!fetcher) return {tickets:[],source:'unavailable',errors:['Fetch is unavailable.']};
    const errors = [];
    for (const [source,url] of [['local',PUBLIC_SNAPSHOT],['KonfHub',PUBLIC_API]]) {
      try {
        const response = await fetcher(url,{cache:'no-store'});
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        const tickets = extractTickets(data);
        if (tickets.length) return {tickets,source,errors};
        errors.push(source + ': no ticket records found.');
      } catch(e) { errors.push(source + ': ' + (e?.message || String(e))); }
    }
    return {tickets:[],source:'unavailable',errors};
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
    TICKETS,CUSTOM_ALIASES,normalize,ticketKey,expectedAmount,extractTickets,
    matchTicket,getTicketId,getTicketName,getTicketForms,buildPrefillUrl,getTickets,assess};
});

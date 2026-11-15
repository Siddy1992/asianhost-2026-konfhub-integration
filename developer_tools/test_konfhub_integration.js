'use strict';
const assert = require('node:assert/strict');
const KH = require('../konfhub-integration.js');
const CONFIG = require('../registration-config.js');
assert.equal(new Date(CONFIG.REGULAR_START_MS).toISOString(),'2026-11-30T18:30:00.000Z');
assert.equal(KH.EARLY_CUTOFF,CONFIG.REGULAR_START_MS);
function form(form_id,form_name,is_default=false,er_column_mapping='custom_forms',form_options=[]) {
  return {form_id,form_name,is_default,er_column_mapping,form_options};
}
const ticket = {
  ticket_id:'test-ticket-2000', ticket_name:'Indian Student - General',ticket_price:2000,
  forms:[
    form(101,'AsianHOST Registration ID'),
    form(102,'Registration Purpose',false,'custom_forms',['General Participant','Paper Author','PhD Forum Participant']),
    form(103,'GSTIN'),form(104,'Country'),form(105,'IEEE Membership Number'),
    form(106,'Declaration / Consent')
  ]
};
const payload={data:{tickets:[ticket]}};
assert.equal(KH.extractTickets(payload).length,1);
assert.equal(KH.matchTicket(KH.extractTickets(payload),'indian-student:fixed').ticket_id,'test-ticket-2000');
const order={id:'AH26-TEST-ABC',kind:'registration',purpose:'attendee',period:'regular',category:'indian-student',amount:2000,
  person:{name:'Alex Example',email:'alex@example.org',institution:'Example University',phone:'+91 9000000000',country:'India',ieee:'',gstin:'22AAAAA0000A1Z5'}};
const choice=KH.assess(order,[ticket]);
assert.equal(choice.ready,true,choice.reason);
const url=new URL(choice.url);
assert.equal(url.hostname,'konfhub.com');
assert.equal(url.pathname,'/checkout/asian-host-ticketing');
assert.equal(url.searchParams.get('ticketId'),'test-ticket-2000');
assert.equal(url.searchParams.get('name'),'Alex Example');
assert.equal(url.searchParams.get('email_id'),'alex@example.org');
assert.equal(url.searchParams.get('organisation'),'Example University');
assert.equal(url.searchParams.get('101'),'AH26-TEST-ABC');
assert.equal(url.searchParams.get('102'),'General Participant');
assert.equal(url.searchParams.get('103'),'22AAAAA0000A1Z5');
assert.equal(url.searchParams.get('104'),'India');
assert.equal(url.searchParams.has('106'),false,'Consent must never be auto-accepted');
assert.equal(KH.assess({...order,amount:5000},[ticket]).ready,false);
assert.equal(KH.assess({...order,category:'ieee',period:'regular',amount:60000},[ticket]).ready,false);
assert.equal(KH.assess({...order,kind:'balance',category:'balance',amount:10000},[ticket]).ready,false);
const allKeys=Object.keys(KH.TICKETS);
assert.equal(allKeys.length,13,'All 13 ticket variants must be represented');
// A previously regular-priced pending registration must be corrected in checkout.js.
assert.equal(CONFIG.EARLY_AMOUNTS.ieee,50000);
assert.equal(CONFIG.REGULAR_AMOUNTS.ieee,60000);
const originalNow=Date.now;
Date.now=()=>Date.parse('2026-11-30T23:59:59+05:30');
const earlyOrder={...order,category:'ieee',period:'early',amount:50000};
const earlyTicket={ticket_id:'test-ieee-early',ticket_name:'IEEE Member - Early',ticket_price:50000,forms:ticket.forms};
assert.equal(KH.assess(earlyOrder,[earlyTicket]).ready,true);
Date.now=()=>Date.parse('2026-12-01T00:00:00+05:30');
assert.equal(KH.assess(earlyOrder,[earlyTicket]).ready,false);
Date.now=originalNow;
console.log('KonfHub mapping, prefill and 30 November cutoff unit tests passed (13 variants).');

'use strict';
/* KonfHub integration: no mock payments, no client-side paid status, no coupons in JS. */
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
function showMessage(text, kind) {
  const el = $('kh-message');
  el.textContent = text;
  el.className = 'kh-notice' + (kind ? ' ' + kind : '');
  el.hidden = false;
}
function renderOrder(order) {
  $('kh-order').textContent = order.id;
  $('kh-person').textContent = order.person?.name || '—';
  $('kh-email').textContent = order.person?.email || '—';
  $('kh-category').textContent = order.categoryName || order.category || '—';
  $('kh-period').textContent = ['indian-student','phd-intl','phd-indian'].includes(order.category)
    ? 'Fixed rate' : (order.period === 'early' ? 'Early' : 'Regular / on-site');
  $('kh-amount').textContent = money(order.amount);
}
async function init() {
  const integration = window.AsianHOSTKonfHub;
  const id = new URLSearchParams(location.search).get('id');
  const orders = readOrders();
  const order = id && orders[id];
  if (!integration || !order || !order.person) {
    $('kh-loading').hidden = true;
    showMessage('Registration reference not found in this browser. Return to the AsianHOST registration form and complete the three steps before checkout.','error');
    return;
  }
  if (order.kind !== 'registration') {
    $('kh-loading').hidden = true;
    renderOrder(order);
    showMessage('Supplementary balance payments are not configured in KonfHub. Contact the organizing committee for an authorized payment route.','error');
    return;
  }
  // Repair pending records created when the earlier 15 November cutoff was in force.
  // The price must reflect the actual date of checkout, not a stale browser record.
  // Do not modify any record already marked paid in the local demo.
  if (order.status === 'pending' && REGULAR_AMOUNTS[order.category] != null) {
    const earlyOpen = Date.now() < integration.EARLY_CUTOFF;
    const targetPeriod = earlyOpen ? 'early' : 'regular';
    const targetAmount = earlyOpen ? EARLY_AMOUNTS[order.category] : REGULAR_AMOUNTS[order.category];
    if (order.period !== targetPeriod || Number(order.amount) !== targetAmount) {
      order.period = targetPeriod;
      order.amount = targetAmount;
      order.updated = new Date().toISOString();
      orders[id] = order;
      saveOrders(orders);
      showMessage(earlyOpen
        ? 'The early deadline has been extended to 30 November 2026. Your pending registration has been updated to the early rate. Please review the amount before checkout.'
        : 'Early registration has closed. Your pending registration has been updated to the regular/on-site rate. Please review the amount before checkout.','warning');
    }
  }
  renderOrder(order);
  const result = await integration.getTickets();
  const choice = integration.assess(order,result.tickets);
  $('kh-loading').hidden = true;
  if (choice.ready) {
    const link = $('kh-prefill');
    link.href = choice.url;
    link.hidden = false;
    link.target = '_blank';
    $('kh-explanation').textContent = 'Your registration category is matched to the KonfHub ticket. Use the button to open the prefilled checkout. Review all fields and the final amount before submitting. This static demo cannot verify payment; your local status remains pending.';
    if (!integration.getTicketForms(choice.ticket).some(f => integration.normalize(f.form_name ?? f.formName ?? f.name) === 'asianhostregistrationid')) {
      showMessage('Ticket found, but the KonfHub "AsianHOST Registration ID" field was not found in its public form metadata. Please ensure the ID appears at checkout or enter it manually.','warning');
    }
  } else {
    const why = choice.reason || 'Ticket information could not be loaded.';
    showMessage(why + ' The correct ticket must be identified before an automated checkout can be offered.','warning');
    $('kh-event').hidden = false;
    if (integration.ticketKey(order) === 'indian-student:fixed' && Number(order.amount) === 2000) {
      $('kh-widget-wrap').hidden = false;
      $('kh-widget-note').hidden = false;
      $('kh-explanation').textContent = 'The existing Indian Student widget is available for visual/manual testing. It cannot prefill your details. Do not treat a submitted widget as a verified payment in the demo.';
    }
  }
}
document.addEventListener('DOMContentLoaded',init);

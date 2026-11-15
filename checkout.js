'use strict';
/* KonfHub integration: no mock payments, no client-side paid status, no coupons in JS. */
const STORAGE_KEY = 'asianhost2026_demo_registrations_inr_v2';
const REGULAR_AMOUNTS = {'ieee':60000,'nonieee':70000,'ieee-student':25000,'nonieee-student':35000,'life':35000};
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
  // Preserve the original site's early-deadline safety behavior.
  if (order.period === 'early' && Date.now() >= integration.EARLY_CUTOFF && REGULAR_AMOUNTS[order.category] != null) {
    order.period = 'regular';
    order.amount = REGULAR_AMOUNTS[order.category];
    order.updated = new Date().toISOString();
    orders[id] = order;
    saveOrders(orders);
    showMessage('The early registration deadline has passed. The checkout fee has been updated to the regular/on-site rate. Please verify it before proceeding.','warning');
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

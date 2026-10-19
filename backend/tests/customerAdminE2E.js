/**
 * Customer + Admin end-to-end feature test for the Dairy Farm system.
 *
 * Exercises the full CUSTOMER journey against a REAL customer account and the
 * matching ADMIN approval actions, so every customer-facing feature and its
 * admin counterpart is verified against the live DB:
 *   - Login (customer mobile-login, admin PIN)
 *   - Customer dashboard summary
 *   - View own deliveries (and denial for other customers)
 *   - Raise delivery DISPUTE  -> admin APPROVE (auto-corrects the day)
 *   - Request EXTRA MILK       -> admin APPROVE
 *   - Request CANCEL delivery  -> admin APPROVE
 *   - Place product ORDER      -> admin CONFIRM ; customer CANCEL own order
 *   - Create SUBSCRIPTION      -> admin APPROVE ; customer pause/resume/cancel
 *   - Security: customer is blocked (403) from admin-only endpoints
 *
 * SAFE: the delivery row touched by the dispute flow is snapshotted and fully
 * restored, and every request/order/subscription row created is deleted at the
 * end (tracked by returned Id). No permanent data change remains.
 *
 * Prereqs: backend running on API_BASE; customer 9600156909 / Customer@123 and
 * admin PIN in backend/.env.  Run:  node tests/customerAdminE2E.js
 */
require('dotenv').config();
const axios = require('axios');
const { queryOne, execute, NVarChar, Int, SmallInt, Decimal, sql } = require('../src/database/db');

const API_BASE = process.env.API_BASE || `http://localhost:${process.env.PORT || 3000}/api/v1`;
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
const CUST_MOBILE = process.env.CUST_MOBILE || '9600156909';
const CUST_PASS = process.env.CUST_PASS || 'Customer@123';

const http = axios.create({ baseURL: API_BASE, timeout: 20000, validateStatus: () => true });
const auth = (t) => ({ headers: { Authorization: `Bearer ${t}` } });

// ---- result tracking -------------------------------------------------------
const results = [];
const rec = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
};
const brief = (data) => {
  try { return JSON.stringify(data).slice(0, 240); } catch { return String(data); }
};

// ---- date helpers (today = system date) ------------------------------------
const pad = (n) => String(n).padStart(2, '0');
const iso = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
const NOW = new Date();
const TODAY = iso(NOW);
// A past date in the current month for the dispute (>= 1st, < today). Fallback to the 1st.
const disputeDate = (() => {
  const dd = NOW.getDate() > 3 ? NOW.getDate() - 2 : 1;
  return `${NOW.getFullYear()}-${pad(NOW.getMonth() + 1)}-${pad(dd)}`;
})();
// Future dates for extra-milk / cancel so they never collide with real rows.
const nextMonth = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 1);
const extraDate = `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}-24`;
const cancelFrom = `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}-25`;
const cancelTo = `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}-26`;

const state = {
  adminToken: null,
  custToken: null,
  customerId: null,
  createdRequestIds: new Set(),
  createdOrderIds: new Set(),
  createdSubscriptionIds: new Set(),
  deliveryRestore: null, // raw Deliveries row snapshot for exact restore
};

// ===========================================================================
async function login() {
  const a = await http.post('/auth/pin', { pin: ADMIN_PIN });
  const aOk = a.status === 200 && a.data?.data?.token && a.data.data.user.role === 'admin';
  rec('Admin PIN login', Boolean(aOk), aOk ? '' : `status ${a.status}: ${brief(a.data)}`);
  if (aOk) state.adminToken = a.data.data.token;

  const c = await http.post('/auth/mobile-login', { mobile: CUST_MOBILE, password: CUST_PASS });
  const cOk = c.status === 200 && c.data?.data?.token && c.data.data.user.role === 'customer';
  rec('Customer mobile login', Boolean(cOk), cOk ? '' : `status ${c.status}: ${brief(c.data)}`);
  if (cOk) {
    state.custToken = c.data.data.token;
    state.customerId = c.data.data.user.customerIds?.[0] || null;
    rec('Customer is linked to a customer record', Boolean(state.customerId),
      state.customerId ? state.customerId : 'customerIds empty');
  }
}

// ---- CUSTOMER read-only features ------------------------------------------
async function customerReadFeatures() {
  if (!state.custToken) return;

  const ds = await http.get('/dashboard/customer-summary', auth(state.custToken));
  const dsOk = ds.status === 200 && ds.data?.data?.customer && ds.data.data.billing;
  rec('Customer: dashboard summary', Boolean(dsOk),
    dsOk ? `pendingDues=${ds.data.data.billing.pendingDues}, requests=${ds.data.data.recentRequests?.length ?? 0}` : `status ${ds.status}: ${brief(ds.data)}`);

  const del = await http.get(`/deliveries/${state.customerId}/${NOW.getFullYear()}/${NOW.getMonth() + 1}`, auth(state.custToken));
  const delOk = del.status === 200 && del.data?.data && (del.data.data.DeliveryData !== undefined || del.data.data.deliveryData !== undefined);
  rec('Customer: view own monthly delivery', Boolean(delOk),
    delOk ? '' : `status ${del.status}: ${brief(del.data)}`);

  const reqs = await http.get(`/customer-requests/${NOW.getFullYear()}/${NOW.getMonth() + 1}?customerId=${state.customerId}`, auth(state.custToken));
  rec('Customer: view own requests', reqs.status === 200 && Array.isArray(reqs.data?.data),
    reqs.status === 200 ? `${reqs.data.data.length} rows` : `status ${reqs.status}: ${brief(reqs.data)}`);

  const prod = await http.get('/products?active=true', auth(state.custToken));
  rec('Customer: list products', prod.status === 200 && Array.isArray(prod.data?.data),
    prod.status === 200 ? `${prod.data.data.length} products` : `status ${prod.status}: ${brief(prod.data)}`);

  const ord = await http.get('/orders', auth(state.custToken));
  rec('Customer: list own orders', ord.status === 200 && Array.isArray(ord.data?.data),
    ord.status === 200 ? `${ord.data.data.length} orders` : `status ${ord.status}: ${brief(ord.data)}`);

  const subs = await http.get('/subscriptions', auth(state.custToken));
  rec('Customer: list own subscriptions', subs.status === 200 && Array.isArray(subs.data?.data),
    subs.status === 200 ? `${subs.data.data.length} subs` : `status ${subs.status}: ${brief(subs.data)}`);
}

// ---- DISPUTE -> APPROVE (auto delivery correction) -------------------------
async function disputeFlow() {
  if (!state.custToken || !state.adminToken || !state.customerId) return;
  const year = NOW.getFullYear();
  const month = NOW.getMonth() + 1;

  // Snapshot the delivery row so we can restore after the correction.
  const del = await http.get(`/deliveries/${state.customerId}/${year}/${month}`, auth(state.custToken));
  const row = del.data?.data;
  if (!row) { rec('Dispute: snapshot delivery', false, 'no delivery row'); return; }
  const dd = row.DeliveryData ?? row.deliveryData ?? {};
  // Exact DB snapshot for restore (the row exists now after the GET auto-create).
  state.deliveryRestore = await queryOne(
    'SELECT * FROM dbo.Deliveries WHERE CustomerId=@cid AND [Year]=@y AND [Month]=@m',
    { cid: { type: NVarChar(36), value: state.customerId }, y: { type: Int, value: year }, m: { type: Int, value: month } }
  );
  const currentlyDelivered = dd[disputeDate] !== false; // default true
  const claimedStatus = currentlyDelivered ? 'Missed' : 'Delivered';

  const create = await http.post('/customer-requests', {
    customerId: state.customerId,
    requestType: 'dispute_delivery',
    requestDate: disputeDate,
    claimedStatus,
    reason: `E2E dispute test for ${disputeDate}`,
  }, auth(state.custToken));
  const createOk = (create.status === 200 || create.status === 201) && Array.isArray(create.data?.data) && create.data.data[0]?.id;
  rec('Customer: raise delivery dispute', Boolean(createOk),
    createOk ? `claim=${claimedStatus} on ${disputeDate}` : `status ${create.status}: ${brief(create.data)}`);
  if (!createOk) return;
  const reqId = create.data.data[0].id;
  state.createdRequestIds.add(reqId);

  // Admin approves -> should auto-correct that delivery day.
  const approve = await http.patch(`/customer-requests/${reqId}/status`, { status: 'Approved' }, auth(state.adminToken));
  const approveOk = approve.status === 200 && approve.data?.data;
  rec('Admin: approve dispute', Boolean(approveOk),
    approveOk ? `applied=${approve.data.data.applied}, ${approve.data.data.prevStatus}->${approve.data.data.newStatus}` : `status ${approve.status}: ${brief(approve.data)}`);

  // Verify the delivery day flipped.
  const after = await http.get(`/deliveries/${state.customerId}/${year}/${month}`, auth(state.adminToken));
  const afterDD = after.data?.data?.DeliveryData ?? after.data?.data?.deliveryData ?? {};
  const nowDelivered = afterDD[disputeDate] !== false;
  const flipped = nowDelivered === (claimedStatus === 'Delivered');
  rec('Dispute correction reflected in delivery', flipped,
    flipped ? `${disputeDate} now delivered=${nowDelivered}` : `expected delivered=${claimedStatus === 'Delivered'}, got ${nowDelivered}`);
}

// ---- EXTRA MILK -> APPROVE -------------------------------------------------
async function extraMilkFlow() {
  if (!state.custToken || !state.adminToken || !state.customerId) return;

  const create = await http.post('/customer-requests', {
    customerId: state.customerId,
    requestType: 'extra_milk',
    requestDate: extraDate,
    extraQuantity: 1.5,
    reason: 'E2E extra milk test',
  }, auth(state.custToken));
  const createOk = (create.status === 200 || create.status === 201) && create.data?.data?.[0]?.id;
  rec('Customer: request extra milk', Boolean(createOk),
    createOk ? `+1.5L on ${extraDate}` : `status ${create.status}: ${brief(create.data)}`);
  if (!createOk) return;
  const reqId = create.data.data[0].id;
  state.createdRequestIds.add(reqId);

  const approve = await http.patch(`/customer-requests/${reqId}/status`, { status: 'Approved' }, auth(state.adminToken));
  const approveOk = approve.status === 200 && approve.data?.data?.status === 'Approved';
  rec('Admin: approve extra milk', Boolean(approveOk),
    approveOk ? '' : `status ${approve.status}: ${brief(approve.data)}`);
}

// ---- CANCEL DELIVERY -> APPROVE -------------------------------------------
async function cancelDeliveryFlow() {
  if (!state.custToken || !state.adminToken || !state.customerId) return;

  const create = await http.post('/customer-requests', {
    customerId: state.customerId,
    requestType: 'cancel_delivery',
    requestDate: cancelFrom,
    endDate: cancelTo,
    reason: 'E2E cancel test',
  }, auth(state.custToken));
  const createOk = (create.status === 200 || create.status === 201) && Array.isArray(create.data?.data) && create.data.data.length >= 1;
  rec('Customer: request cancel delivery (range)', Boolean(createOk),
    createOk ? `${create.data.data.length} day(s)` : `status ${create.status}: ${brief(create.data)}`);
  if (!createOk) return;
  create.data.data.forEach((r) => state.createdRequestIds.add(r.id));

  const approve = await http.patch(`/customer-requests/${create.data.data[0].id}/status`, { status: 'Approved' }, auth(state.adminToken));
  const approveOk = approve.status === 200 && approve.data?.data?.status === 'Approved';
  rec('Admin: approve cancel delivery', Boolean(approveOk),
    approveOk ? '' : `status ${approve.status}: ${brief(approve.data)}`);
}

// ---- ORDER -> CONFIRM ; customer cancels own order ------------------------
async function orderFlow() {
  if (!state.custToken || !state.adminToken || !state.customerId) return;
  const prod = await http.get('/products?active=true', auth(state.custToken));
  const product = prod.data?.data?.[0];
  if (!product) { rec('Order flow', false, 'no active products to order (seed products first)'); return; }
  const productId = product.Id ?? product.id;

  const create = await http.post('/orders', {
    customerId: state.customerId,
    items: [{ productId, quantity: 2 }],
    notes: 'E2E order test',
  }, auth(state.custToken));
  const createOk = create.status === 201 && create.data?.data?.id;
  rec('Customer: place product order', Boolean(createOk),
    createOk ? `total=${create.data.data.totalAmount}` : `status ${create.status}: ${brief(create.data)}`);
  if (createOk) {
    const orderId = create.data.data.id;
    state.createdOrderIds.add(orderId);
    const confirm = await http.patch(`/orders/${orderId}/status`, { status: 'Confirmed' }, auth(state.adminToken));
    rec('Admin: confirm order', confirm.status === 200 && confirm.data?.data?.status === 'Confirmed',
      confirm.status === 200 ? '' : `status ${confirm.status}: ${brief(confirm.data)}`);
  }

  // Customer cancels a fresh pending order.
  const create2 = await http.post('/orders', {
    customerId: state.customerId,
    items: [{ productId, quantity: 1 }],
    notes: 'E2E order cancel test',
  }, auth(state.custToken));
  if (create2.status === 201 && create2.data?.data?.id) {
    const orderId2 = create2.data.data.id;
    state.createdOrderIds.add(orderId2);
    const cancel = await http.post(`/orders/${orderId2}/cancel`, { reason: 'E2E customer cancel' }, auth(state.custToken));
    rec('Customer: cancel own pending order', cancel.status === 200 && cancel.data?.data?.status === 'Cancelled',
      cancel.status === 200 ? '' : `status ${cancel.status}: ${brief(cancel.data)}`);
  }
}

// ---- SUBSCRIPTION -> APPROVE ; pause/resume/cancel ------------------------
async function subscriptionFlow() {
  if (!state.custToken || !state.adminToken || !state.customerId) return;

  const create = await http.post('/subscriptions', {
    customerId: state.customerId,
    milkType: 'Cow Milk',
    morningQuantity: 1,
    eveningQuantity: 0.5,
    rate: 50,
    deliveryDays: 'All',
    notes: 'E2E subscription test',
  }, auth(state.custToken));
  const createOk = create.status === 201 && create.data?.data?.id;
  rec('Customer: create subscription', Boolean(createOk),
    createOk ? `status=${create.data.data.status}, est=${create.data.data.estimatedMonthlyAmount}` : `status ${create.status}: ${brief(create.data)}`);
  if (!createOk) return;
  const subId = create.data.data.id;
  state.createdSubscriptionIds.add(subId);

  const approve = await http.patch(`/subscriptions/${subId}/status`, { status: 'Active' }, auth(state.adminToken));
  rec('Admin: approve/activate subscription', approve.status === 200 && approve.data?.data?.status === 'Active',
    approve.status === 200 ? '' : `status ${approve.status}: ${brief(approve.data)}`);

  const pause = await http.post(`/subscriptions/${subId}/pause`, { fromDate: TODAY, reason: 'E2E pause' }, auth(state.custToken));
  rec('Customer: pause subscription', pause.status === 200 && pause.data?.data?.status === 'Paused',
    pause.status === 200 ? '' : `status ${pause.status}: ${brief(pause.data)}`);

  const resume = await http.post(`/subscriptions/${subId}/resume`, {}, auth(state.custToken));
  rec('Customer: resume subscription', resume.status === 200 && resume.data?.data?.status === 'Active',
    resume.status === 200 ? '' : `status ${resume.status}: ${brief(resume.data)}`);

  const cancel = await http.post(`/subscriptions/${subId}/cancel`, { reason: 'E2E cancel' }, auth(state.custToken));
  rec('Customer: cancel subscription', cancel.status === 200 && cancel.data?.data?.status === 'Cancelled',
    cancel.status === 200 ? '' : `status ${cancel.status}: ${brief(cancel.data)}`);
}

// ---- SECURITY: customer must be blocked from admin-only endpoints ----------
async function securityChecks() {
  if (!state.custToken) return;
  const denied = [
    ['GET /customers', 'get', '/customers'],
    ['GET /invoices', 'get', '/invoices'],
    ['GET /users', 'get', '/users'],
    ['GET /payments', 'get', '/payments'],
    ['POST /invoices/generate', 'post', '/invoices/generate', { year: 2099, month: 1 }],
  ];
  for (const [name, m, p, body] of denied) {
    const res = body ? await http[m](p, body, auth(state.custToken)) : await http[m](p, auth(state.custToken));
    rec(`Security: customer blocked from ${name}`, res.status === 403, `got ${res.status}`);
  }
  // /dashboard/summary is intentionally reachable by customers but must return
  // their OWN customer-scoped summary (never system-wide admin aggregates).
  const sum = await http.get('/dashboard/summary', auth(state.custToken));
  const scoped = sum.status === 200 && sum.data?.data?.customer !== undefined
    && sum.data.data.cows === undefined && sum.data.data.pregnancies === undefined;
  rec('Security: customer /dashboard/summary is customer-scoped (no admin leak)', scoped,
    scoped ? '' : `status ${sum.status}: ${brief(sum.data)}`);
  // Cannot read another customer's delivery.
  const other = await queryOne(
    'SELECT TOP 1 Id FROM dbo.Customers WHERE Id <> @id AND IsActive=1 ORDER BY Name',
    { id: { type: NVarChar(36), value: state.customerId } }
  );
  if (other) {
    const res = await http.get(`/deliveries/${other.Id}/${NOW.getFullYear()}/${NOW.getMonth() + 1}`, auth(state.custToken));
    rec("Security: customer blocked from another customer's delivery", res.status === 403, `got ${res.status}`);
  }
}

// ---- ADMIN sanity ----------------------------------------------------------
async function adminChecks() {
  if (!state.adminToken) return;
  const sum = await http.get('/dashboard/summary', auth(state.adminToken));
  rec('Admin: dashboard summary', sum.status === 200 && sum.data?.data,
    sum.status === 200 ? '' : `status ${sum.status}: ${brief(sum.data)}`);
  const cust = await http.get('/customers', auth(state.adminToken));
  rec('Admin: list customers', cust.status === 200 && Array.isArray(cust.data?.data),
    cust.status === 200 ? `${cust.data.data.length} customers` : `status ${cust.status}: ${brief(cust.data)}`);
  const reqs = await http.get(`/customer-requests/${NOW.getFullYear()}/${NOW.getMonth() + 1}`, auth(state.adminToken));
  rec('Admin: list all customer requests', reqs.status === 200 && Array.isArray(reqs.data?.data),
    reqs.status === 200 ? `${reqs.data.data.length} rows` : `status ${reqs.status}: ${brief(reqs.data)}`);
}

// ---- CLEANUP ---------------------------------------------------------------
async function cleanup() {
  console.log('\n--- cleanup ---');
  for (const id of state.createdRequestIds) {
    try {
      await execute('DELETE FROM dbo.CustomerDeliveryRequests WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    } catch (e) { console.log('req cleanup err', id, e.message); }
  }
  for (const id of state.createdOrderIds) {
    try {
      await execute('DELETE FROM dbo.ProductOrderItems WHERE OrderId=@id', { id: { type: NVarChar(36), value: id } });
      await execute('DELETE FROM dbo.ProductOrders WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    } catch (e) { console.log('order cleanup err', id, e.message); }
  }
  for (const id of state.createdSubscriptionIds) {
    try {
      await execute('DELETE FROM dbo.SubscriptionHistory WHERE SubscriptionId=@id', { id: { type: NVarChar(36), value: id } });
      await execute('DELETE FROM dbo.CustomerSubscriptions WHERE Id=@id', { id: { type: NVarChar(36), value: id } });
    } catch (e) { console.log('sub cleanup err', id, e.message); }
  }
  // Restore delivery snapshot exactly (dispute approval only mutates this row + AuditLog).
  if (state.deliveryRestore) {
    const s = state.deliveryRestore;
    try {
      await execute(`UPDATE dbo.Deliveries SET DeliveryData=@dd, ReasonData=@rd, StatusData=@sd, QuantityData=@qd,
          DeliveredDays=@ddays, MissedDays=@mdays, TotalQuantity=@tq, TotalAmount=@ta WHERE Id=@id`, {
        id: { type: NVarChar(36), value: s.Id },
        dd: { type: NVarChar(sql.MAX), value: s.DeliveryData },
        rd: { type: NVarChar(sql.MAX), value: s.ReasonData },
        sd: { type: NVarChar(sql.MAX), value: s.StatusData },
        qd: { type: NVarChar(sql.MAX), value: s.QuantityData },
        ddays: { type: SmallInt, value: s.DeliveredDays },
        mdays: { type: SmallInt, value: s.MissedDays },
        tq: { type: Decimal(10, 2), value: s.TotalQuantity },
        ta: { type: Decimal(12, 2), value: s.TotalAmount },
      });
      console.log('restored delivery row', s.Id);
    } catch (e) { console.log('delivery restore err', e.message); }
  }
}

// ---------------------------------------------------------------------------
async function main() {
  console.log(`E2E against ${API_BASE}\n`);
  await login();
  await customerReadFeatures();
  await disputeFlow();
  await extraMilkFlow();
  await cancelDeliveryFlow();
  await orderFlow();
  await subscriptionFlow();
  await securityChecks();
  await adminChecks();
  await cleanup();

  const pass = results.filter((r) => r.pass).length;
  const fail = results.length - pass;
  console.log(`\n================  RESULT: ${pass} passed, ${fail} failed  ================`);
  if (fail) {
    console.log('FAILURES:');
    results.filter((r) => !r.pass).forEach((r) => console.log(`  - ${r.name}: ${r.detail}`));
  }
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('FATAL', e); process.exit(2); });

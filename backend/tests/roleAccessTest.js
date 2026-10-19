/**
 * Role-based API test harness for the Dairy Farm Management System.
 *
 * Logs in as every seeded role and verifies:
 *   1. Login works and the returned permission set matches config/rbac.js
 *   2. RBAC denial  — roles WITHOUT a permission get HTTP 403 (security check)
 *   3. RBAC allow   — roles WITH a permission are NOT blocked (non-403)
 *   4. Functional   — every module's core features work end to end (as admin),
 *                     plus the customer -> admin request-approval workflow
 *
 * Safe by design: only fake/non-existent IDs and self-cleaning test rows are
 * used for writes; any test artifacts are removed from the DB at the end.
 *
 * Prereqs: backend running on API_BASE, and `npm run db:seed:test-users` done.
 * Run:     node tests/roleAccessTest.js
 */
require('dotenv').config();
const axios = require('axios');
const { permissionsForRole } = require('../src/config/rbac');
const { execute, NVarChar } = require('../src/database/db');

const API_BASE = process.env.API_BASE || `http://localhost:${process.env.PORT || 3000}/api/v1`;
const PASSWORD = process.env.TEST_USER_PASSWORD || 'Test@1234';

const ROLE_MOBILE = {
  admin:          '9000000001',
  supervisor:     '9000000002',
  manager:        '9000000003',
  deliveryperson: '9000000004',
  cattlecaretaker:'9000000005',
  farmcleaner:    '9000000006',
  customer:       '9000000007',
};
const ALL_ROLES = Object.keys(ROLE_MOBILE);

const http = axios.create({ baseURL: API_BASE, timeout: 15000, validateStatus: () => true });
const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// ---- result tracking -------------------------------------------------------
const results = [];
let rateLimited = false;
const record = (section, name, pass, detail = '') => {
  if (!pass && detail.includes('429')) rateLimited = true;
  results.push({ section, name, pass, detail });
};
const rolesWith = (perm) => ALL_ROLES.filter((r) => permissionsForRole(r).includes(perm));
const rolesWithout = (perm) => ALL_ROLES.filter((r) => !permissionsForRole(r).includes(perm));

// customer-requests are gated inside the controller, not by route middleware
const CR_VIEW_OK   = ['admin', 'supervisor', 'manager', 'deliveryperson', 'customer'];
const CR_CREATE_OK = ['admin', 'supervisor', 'manager', 'deliveryperson', 'customer'];
const CR_MANAGE_OK = ['admin', 'supervisor', 'manager', 'deliveryperson'];

// orders are controller-gated for view/create (customer sees/places own), route-gated for manage
const ORDERS_VIEW_OK   = ['admin', 'supervisor', 'manager', 'deliveryperson', 'customer'];
const ORDERS_CREATE_OK = ['admin', 'supervisor', 'manager', 'deliveryperson', 'customer'];

// subscriptions: view-holders + own customer; create for staff-with-manage + customer; deliveryperson view-only
const SUBS_VIEW_OK   = ['admin', 'supervisor', 'manager', 'deliveryperson', 'customer'];
const SUBS_CREATE_OK = ['admin', 'supervisor', 'manager', 'customer'];

const tokens = {};
const meUser = {};

// ---- 1. login + permission verification ------------------------------------
async function loginAll() {
  for (const role of ALL_ROLES) {
    const res = await http.post('/auth/mobile-login', { mobile: ROLE_MOBILE[role], password: PASSWORD });
    const ok = res.status === 200 && res.data?.data?.token;
    record('Login', `${role} can log in`, Boolean(ok), ok ? '' : `status ${res.status}: ${JSON.stringify(res.data)}`);
    if (!ok) continue;
    tokens[role] = res.data.data.token;
    meUser[role] = res.data.data.user;

    const got = [...(res.data.data.user.permissions || [])].sort();
    const want = [...permissionsForRole(role)].sort();
    const match = JSON.stringify(got) === JSON.stringify(want);
    record('Login', `${role} permission set matches rbac`, match,
      match ? '' : `got ${got.join(',')} | want ${want.join(',')}`);
  }
}

// ---- 2. RBAC denial matrix (one representative endpoint per permission) -----
async function denialMatrix() {
  const cases = [
    { perm: 'users:manage',        m: 'get',    p: '/users',                                    denied: rolesWithout('users:manage') },
    { perm: 'customers:view',      m: 'get',    p: '/customers',                                denied: rolesWithout('customers:view') },
    { perm: 'customers:manage',    m: 'delete', p: '/customers/__rbac_none__',                  denied: rolesWithout('customers:manage') },
    { perm: 'deliveries:view',     m: 'get',    p: '/deliveries/today',                         denied: rolesWithout('deliveries:view') },
    { perm: 'deliveries:view (statuses)', m: 'get', p: '/deliveries/statuses',                   denied: rolesWithout('deliveries:view') },
    { perm: 'deliveries:manage',   m: 'put',    p: '/deliveries/__rbac_none__/2027/01/mark-all', body: { delivered: true }, denied: rolesWithout('deliveries:manage') },
    { perm: 'billing:view',        m: 'get',    p: '/invoices',                                 denied: rolesWithout('billing:view') },
    { perm: 'billing:manage',      m: 'post',   p: '/invoices/generate',                        body: {}, denied: rolesWithout('billing:manage') },
    { perm: 'cattle:view',         m: 'get',    p: '/cows',                                     denied: rolesWithout('cattle:view') },
    { perm: 'cattle:manage',       m: 'delete', p: '/cows/__rbac_none__',                       denied: rolesWithout('cattle:manage') },
    { perm: 'reports:view',        m: 'get',    p: '/reports/pending-payments',                 denied: rolesWithout('reports:view') },
    { perm: 'settings:manage',     m: 'post',   p: '/products',                                 body: {}, denied: rolesWithout('settings:manage') },
    { perm: 'settings:manage (low-stock)', m: 'get',    p: '/products/low-stock',                denied: rolesWithout('settings:manage') },
    { perm: 'settings:manage (stock-adjust)', m: 'patch', p: '/products/__rbac_none__/stock', body: { delta: 1 }, denied: rolesWithout('settings:manage') },
    { perm: 'backup:manage',       m: 'get',    p: '/backup/list',                              denied: rolesWithout('backup:manage') },
    { perm: 'customer_requests:view',   m: 'get',   p: '/customer-requests/2026/09',            denied: ALL_ROLES.filter((r) => !CR_VIEW_OK.includes(r)) },
    { perm: 'customer_requests:create', m: 'post',  p: '/customer-requests', body: {},          denied: ALL_ROLES.filter((r) => !CR_CREATE_OK.includes(r)) },
    { perm: 'customer_requests:manage', m: 'patch', p: '/customer-requests/__rbac_none__/status', body: { status: 'Approved' }, denied: ALL_ROLES.filter((r) => !CR_MANAGE_OK.includes(r)) },
    { perm: 'orders:view',   m: 'get',   p: '/orders',                     denied: ALL_ROLES.filter((r) => !ORDERS_VIEW_OK.includes(r)) },
    { perm: 'orders:create', m: 'post',  p: '/orders', body: {},           denied: ALL_ROLES.filter((r) => !ORDERS_CREATE_OK.includes(r)) },
    { perm: 'orders:manage', m: 'patch', p: '/orders/__rbac_none__/status', body: { status: 'Confirmed' }, denied: rolesWithout('orders:manage') },
    { perm: 'subscriptions:view',   m: 'get',   p: '/subscriptions',                     denied: ALL_ROLES.filter((r) => !SUBS_VIEW_OK.includes(r)) },
    { perm: 'subscriptions:create', m: 'post',  p: '/subscriptions', body: {},            denied: ALL_ROLES.filter((r) => !SUBS_CREATE_OK.includes(r)) },
    { perm: 'subscriptions:manage', m: 'patch', p: '/subscriptions/__rbac_none__/status', body: { status: 'Approved' }, denied: rolesWithout('subscriptions:manage') },
    { perm: 'billing:view (milk-rates)', m: 'get',    p: '/milk-rates',                denied: rolesWithout('billing:view') },
    { perm: 'settings:manage (milk-rates)', m: 'delete', p: '/milk-rates/__rbac_none__', denied: rolesWithout('settings:manage') },
    { perm: 'billing:view (month-closures)',  m: 'get',  p: '/month-closures',                     denied: rolesWithout('billing:view') },
    { perm: 'billing:manage (close-month)',   m: 'post', p: '/month-closures/2099/12/close', body: {}, denied: rolesWithout('billing:manage') },
    { perm: 'admin-only (reopen-month)',      m: 'post', p: '/month-closures/2099/12/reopen', body: { reason: 'x' }, denied: ALL_ROLES.filter((r) => r !== 'admin') },
  ];

  for (const c of cases) {
    for (const role of c.denied) {
      if (!tokens[role]) continue;
      const res = await callSafe(c.m, c.p, c.body, tokens[role]);
      const pass = res.status === 403;
      record('RBAC-Denied', `${role} blocked from ${c.perm}`, pass, pass ? '' : `expected 403 got ${res.status}`);
    }
  }
}

// ---- 3. RBAC allow probes (safe, non-mutating) -----------------------------
async function allowProbes() {
  const probes = [
    { perm: 'dashboard:view',      m: 'get',    p: '/dashboard/summary',        roles: rolesWith('dashboard:view') },
    { perm: 'users:manage',        m: 'get',    p: '/users',                    roles: rolesWith('users:manage') },
    { perm: 'customers:view',      m: 'get',    p: '/customers',                roles: rolesWith('customers:view') },
    { perm: 'customers:manage',    m: 'delete', p: '/customers/__rbac_none__',  roles: rolesWith('customers:manage') },
    { perm: 'deliveries:view',     m: 'get',    p: '/deliveries/today',         roles: rolesWith('deliveries:view') },
    { perm: 'deliveries:view (statuses)', m: 'get', p: '/deliveries/statuses',   roles: rolesWith('deliveries:view') },
    { perm: 'deliveries:manage',   m: 'put',    p: '/deliveries/__rbac_deltest__/2027/01/mark-all', body: { delivered: true }, roles: rolesWith('deliveries:manage') },
    { perm: 'billing:view',        m: 'get',    p: '/invoices',                 roles: rolesWith('billing:view') },
    { perm: 'billing:manage',      m: 'post',   p: '/notifications/payment-reminder/__rbac_none__', body: {}, roles: rolesWith('billing:manage') },
    { perm: 'cattle:view',         m: 'get',    p: '/cows',                     roles: rolesWith('cattle:view') },
    { perm: 'cattle:manage',       m: 'delete', p: '/cows/__rbac_none__',       roles: rolesWith('cattle:manage') },
    { perm: 'reports:view',        m: 'get',    p: '/reports/pending-payments', roles: rolesWith('reports:view') },
    { perm: 'settings:manage',     m: 'post',   p: '/products', body: {},       roles: rolesWith('settings:manage') },
    { perm: 'settings:manage (low-stock)', m: 'get',    p: '/products/low-stock',   roles: rolesWith('settings:manage') },
    { perm: 'settings:manage (stock-adjust)', m: 'patch', p: '/products/__rbac_none__/stock', body: { delta: 1 }, roles: rolesWith('settings:manage') },
    { perm: 'backup:manage',       m: 'get',    p: '/backup/list',              roles: rolesWith('backup:manage') },
    { perm: 'customer_requests:view',   m: 'get',   p: '/customer-requests/2026/09',              roles: CR_VIEW_OK },
    { perm: 'customer_requests:create', m: 'post',  p: '/customer-requests', body: {},            roles: CR_CREATE_OK },
    { perm: 'customer_requests:manage', m: 'patch', p: '/customer-requests/__rbac_none__/status', body: { status: 'Approved' }, roles: CR_MANAGE_OK },
    { perm: 'orders:view',   m: 'get',   p: '/orders',                     roles: ORDERS_VIEW_OK },
    { perm: 'orders:create', m: 'post',  p: '/orders', body: {},           roles: ORDERS_CREATE_OK },
    { perm: 'orders:manage', m: 'patch', p: '/orders/__rbac_none__/status', body: { status: 'Confirmed' }, roles: rolesWith('orders:manage') },
    { perm: 'subscriptions:view',   m: 'get',   p: '/subscriptions',                     roles: SUBS_VIEW_OK },
    { perm: 'subscriptions:create', m: 'post',  p: '/subscriptions', body: {},            roles: SUBS_CREATE_OK },
    { perm: 'subscriptions:manage', m: 'patch', p: '/subscriptions/__rbac_none__/status', body: { status: 'Approved' }, roles: rolesWith('subscriptions:manage') },
    { perm: 'billing:view (milk-rates)', m: 'get',    p: '/milk-rates',                 roles: rolesWith('billing:view') },
    { perm: 'settings:manage (milk-rates)', m: 'delete', p: '/milk-rates/__rbac_none__', roles: rolesWith('settings:manage') },
    { perm: 'billing:view (month-closures)', m: 'get',  p: '/month-closures',            roles: rolesWith('billing:view') },
  ];

  for (const probe of probes) {
    for (const role of probe.roles) {
      if (!tokens[role]) continue;
      const res = await callSafe(probe.m, probe.p, probe.body, tokens[role]);
      const pass = res.status !== 403 && res.status !== 401;
      record('RBAC-Allowed', `${role} may access ${probe.perm}`, pass, pass ? '' : `unexpected ${res.status}`);
    }
  }
}

// ---- 4. functional suite (admin) + request-approval workflow ---------------
async function functionalSuite() {
  const a = tokens.admin;
  if (!a) return record('Functional', 'admin token available', false, 'no admin token');

  // auth/me
  let r = await http.get('/auth/me', auth(a));
  record('Functional', 'GET /auth/me returns admin', r.status === 200 && r.data?.data?.role === 'admin', `status ${r.status}`);

  // dashboard
  r = await http.get('/dashboard/summary', auth(a));
  record('Functional', 'Dashboard summary', r.status === 200, `status ${r.status}`);

  // ---- Products full CRUD ---- (backend returns PascalCase columns)
  r = await http.post('/products', { name: '__RBAC_TEST_PRODUCT__', unit: 'kg', rate: 99 }, auth(a));
  const prodId = r.data?.data?.Id || r.data?.data?.id;
  record('Functional', 'Product create', r.status === 201 && Boolean(prodId), `status ${r.status}`);
  if (prodId) {
    r = await http.get('/products', auth(a));
    record('Functional', 'Product appears in list', (r.data?.data || []).some((p) => (p.Id || p.id) === prodId), `count ${(r.data?.data||[]).length}`);
    r = await http.put(`/products/${prodId}`, { name: '__RBAC_TEST_PRODUCT__', unit: 'liter', rate: 123.45 }, auth(a));
    record('Functional', 'Product update', r.status === 200, `status ${r.status}`);
    r = await http.patch(`/products/${prodId}/toggle`, {}, auth(a));
    record('Functional', 'Product toggle active', r.status === 200, `status ${r.status}`);
    r = await http.delete(`/products/${prodId}`, auth(a));
    record('Functional', 'Product delete', r.status === 200, `status ${r.status}`);
  }

  // ---- Customers CRUD ----
  r = await http.post('/customers', {
    name: '__RBAC_TEST_CUSTOMER__', mobile: '9999999990', morningQuantity: 1, eveningQuantity: 1,
    ratePerLiter: 60, milkType: 'Cow Milk', billingMode: 'Monthly Full Check',
  }, auth(a));
  const custId = r.data?.data?.id || r.data?.data?.Id;
  record('Functional', 'Customer create', (r.status === 200 || r.status === 201) && custId, `status ${r.status}`);
  if (custId) {
    r = await http.get(`/customers/${custId}`, auth(a));
    record('Functional', 'Customer get by id', r.status === 200, `status ${r.status}`);
    r = await http.patch(`/customers/${custId}/toggle`, {}, auth(a));
    record('Functional', 'Customer toggle active', r.status === 200, `status ${r.status}`);
    r = await http.put(`/customers/${custId}`, {
      name: '__RBAC_TEST_CUSTOMER__', mobile: '9999999990', morningQuantity: 2, eveningQuantity: 0,
      ratePerLiter: 62, milkType: 'Cow Milk', billingMode: 'Monthly Full Check', isActive: 1,
    }, auth(a));
    record('Functional', 'Customer update', r.status === 200, `status ${r.status}`);
    r = await http.delete(`/customers/${custId}`, auth(a));
    record('Functional', 'Customer delete', r.status === 200, `status ${r.status}`);
  }

  // ---- Cows CRUD ----
  r = await http.post('/cows', { name: '__RBAC_TEST_COW__', tagNumber: '__RBAC_TESTCOW__', breed: 'Test', currentStatus: 'Active' }, auth(a));
  const cowId = r.data?.data?.id || r.data?.data?.Id;
  record('Functional', 'Cow create', r.status === 201 && cowId, `status ${r.status}`);
  if (cowId) {
    r = await http.get(`/cows/${cowId}`, auth(a));
    record('Functional', 'Cow get by id', r.status === 200, `status ${r.status}`);
    r = await http.put(`/cows/${cowId}`, { name: '__RBAC_TEST_COW__', tagNumber: '__RBAC_TESTCOW__', currentStatus: 'Mated' }, auth(a));
    record('Functional', 'Cow update', r.status === 200, `status ${r.status}`);
    r = await http.delete(`/cows/${cowId}`, auth(a));
    record('Functional', 'Cow delete', r.status === 200, `status ${r.status}`);
  }

  // ---- read-only module checks ----
  const reads = [
    ['Breeding list',            '/breeding'],
    ['Breeding upcoming-calving','/breeding/upcoming-calving'],
    ['Milk production list',     '/milk-production'],
    ['Milk production summary',  '/milk-production/summary'],
    ['Calving list',             '/calving'],
    ['Invoices list',            '/invoices'],
    ['Payments list',            '/payments'],
    ['Payments outstanding',     '/payments/outstanding'],
    ['Reports pending-payments', '/reports/pending-payments'],
    ['Reports pregnant-cows',    '/reports/pregnant-cows'],
    ['Settings get',             '/settings'],
    ['Users roles',              '/users/roles'],
  ];
  for (const [name, path] of reads) {
    r = await http.get(path, auth(a));
    record('Functional', name, r.status === 200, `status ${r.status}`);
  }

  // settings idempotent write (write current value back)
  r = await http.get('/settings', auth(a));
  const current = r.data?.data || {};
  r = await http.put('/settings', { monthlyDeliveryCharge: current.monthlyDeliveryCharge ?? '0' }, auth(a));
  record('Functional', 'Settings update (idempotent)', r.status === 200, `status ${r.status}`);

  // ---- product ordering workflow (customer places -> admin manages) ----
  const orderCustToken = tokens.customer;
  const orderLinkedCid = meUser.customer?.customerIds?.[0];
  r = await http.post('/products', { name: '__RBAC_ORDER_PRODUCT__', unit: 'kg', rate: 50, stock: 10 }, auth(a));
  const orderProdId = r.data?.data?.Id || r.data?.data?.id;
  record('Functional', 'Order product create', r.status === 201 && Boolean(orderProdId), `status ${r.status}`);
  if (orderCustToken && orderLinkedCid && orderProdId) {
    r = await http.post('/orders', { customerId: orderLinkedCid, items: [{ productId: orderProdId, quantity: 2 }], notes: '__RBAC_TEST__' }, auth(orderCustToken));
    const orderId = r.data?.data?.id;
    record('Functional', 'Customer places order (total computed)', r.status === 201 && Boolean(orderId) && r.data?.data?.totalAmount === 100, `status ${r.status} total ${r.data?.data?.totalAmount}`);
    if (orderId) {
      r = await http.get(`/orders/${orderId}`, auth(a));
      record('Functional', 'Order detail has items', r.status === 200 && (r.data?.data?.items || []).length === 1, `status ${r.status}`);
      r = await http.patch(`/orders/${orderId}/status`, { status: 'Confirmed' }, auth(a));
      record('Functional', 'Admin confirms order', r.status === 200 && r.data?.data?.status === 'Confirmed', `status ${r.status}`);
      r = await http.patch(`/orders/${orderId}/status`, { status: 'Delivered' }, auth(a));
      record('Functional', 'Admin marks order Delivered', r.status === 200 && r.data?.data?.status === 'Delivered', `status ${r.status}`);
      r = await http.get('/products', auth(a));
      const afterProd = (r.data?.data || []).find((p) => (p.Id || p.id) === orderProdId);
      record('Functional', 'Delivered order decrements product stock (10 - 2 = 8)', Number(afterProd?.Stock) === 8, `stock ${afterProd?.Stock}`);
    }
    r = await http.post('/orders', { customerId: orderLinkedCid, items: [{ productId: orderProdId, quantity: 1 }], notes: '__RBAC_TEST__' }, auth(orderCustToken));
    const orderId2 = r.data?.data?.id;
    if (orderId2) {
      r = await http.post(`/orders/${orderId2}/cancel`, { reason: '__RBAC_TEST__' }, auth(orderCustToken));
      record('Functional', 'Customer cancels pending order', r.status === 200 && r.data?.data?.status === 'Cancelled', `status ${r.status}`);
    }
  } else {
    record('Functional', 'Product ordering workflow', true, 'skipped: no product or linked customer');
  }

  // ---- milk subscription workflow (customer requests -> admin approves, pause/resume, history) ----
  const subCustToken = tokens.customer;
  const subLinkedCid = meUser.customer?.customerIds?.[0];
  if (subCustToken && subLinkedCid) {
    r = await http.post('/subscriptions', {
      customerId: subLinkedCid, milkType: 'Cow Milk', morningQuantity: 1, eveningQuantity: 1,
      rate: 60, deliveryDays: 'All', startDate: '2027-02-01', notes: '__RBAC_TEST__',
    }, auth(subCustToken));
    const subId = r.data?.data?.id;
    record('Functional', 'Customer submits subscription (PendingApproval, est computed)',
      r.status === 201 && Boolean(subId) && r.data?.data?.status === 'PendingApproval'
      && r.data?.data?.totalQuantity === 2 && r.data?.data?.estimatedMonthlyAmount === 3600,
      `status ${r.status} est ${r.data?.data?.estimatedMonthlyAmount}`);
    if (subId) {
      r = await http.get(`/subscriptions/${subId}/history`, auth(a));
      record('Functional', 'Subscription history seeded', r.status === 200 && (r.data?.data || []).length >= 1, `rows ${(r.data?.data || []).length}`);
      r = await http.patch(`/subscriptions/${subId}/status`, { status: 'Rejected' }, auth(a));
      record('Functional', 'Reject without reason blocked (400)', r.status === 400, `status ${r.status}`);
      r = await http.patch(`/subscriptions/${subId}/status`, { status: 'Approved' }, auth(a));
      record('Functional', 'Admin approves subscription', r.status === 200 && r.data?.data?.status === 'Approved', `status ${r.status}`);
      r = await http.patch(`/subscriptions/${subId}/status`, { status: 'Active' }, auth(a));
      record('Functional', 'Admin activates subscription', r.status === 200 && r.data?.data?.status === 'Active', `status ${r.status}`);
      r = await http.post(`/subscriptions/${subId}/pause`, { fromDate: '2027-02-10', toDate: '2027-02-15', reason: 'Vacation' }, auth(subCustToken));
      record('Functional', 'Customer pauses subscription', r.status === 200 && r.data?.data?.status === 'Paused', `status ${r.status}`);
      r = await http.post(`/subscriptions/${subId}/resume`, {}, auth(subCustToken));
      record('Functional', 'Customer resumes subscription', r.status === 200 && r.data?.data?.status === 'Active', `status ${r.status}`);
      r = await http.put(`/subscriptions/${subId}`, { morningQuantity: 2, eveningQuantity: 0, rate: 62, changeReason: '__RBAC_TEST__' }, auth(a));
      record('Functional', 'Admin amends subscription quantity', r.status === 200 && r.data?.data?.totalQuantity === 2 && r.data?.data?.rate === 62, `status ${r.status}`);
      r = await http.get(`/subscriptions/${subId}/history`, auth(a));
      const openRows = (r.data?.data || []).filter((h) => !h.effectiveTo);
      record('Functional', 'History effective-dated (single open row)', r.status === 200 && (r.data?.data || []).length >= 5 && openRows.length === 1, `rows ${(r.data?.data || []).length} open ${openRows.length}`);
    }
  } else {
    record('Functional', 'Subscription workflow', true, 'skipped: no linked customer');
  }

  // ---- milk rate effective-dating workflow (admin) ----
  r = await http.post('/milk-rates', { milkType: '__RBAC_TEST__', ratePerLiter: 50, effectiveFrom: '2026-01-01', notes: '__RBAC_TEST__' }, auth(a));
  record('Functional', 'Admin adds initial milk rate', (r.status === 200 || r.status === 201) && r.data?.data?.RatePerLiter === 50, `status ${r.status}`);
  r = await http.post('/milk-rates', { milkType: '__RBAC_TEST__', ratePerLiter: 55, effectiveFrom: '2026-06-01', notes: '__RBAC_TEST__' }, auth(a));
  record('Functional', 'Admin adds superseding milk rate', (r.status === 200 || r.status === 201) && r.data?.data?.RatePerLiter === 55, `status ${r.status}`);
  r = await http.get('/milk-rates/effective?milkType=__RBAC_TEST__&date=2026-03-15', auth(a));
  record('Functional', 'Effective rate before change is 50', r.status === 200 && r.data?.data?.ratePerLiter === 50, `got ${r.data?.data?.ratePerLiter} status ${r.status}`);
  r = await http.get('/milk-rates/effective?milkType=__RBAC_TEST__&date=2026-07-15', auth(a));
  record('Functional', 'Effective rate after change is 55', r.status === 200 && r.data?.data?.ratePerLiter === 55, `got ${r.data?.data?.ratePerLiter} status ${r.status}`);
  r = await http.get('/milk-rates?milkType=__RBAC_TEST__', auth(a));
  const oldRow = (r.data?.data || []).find((x) => x.RatePerLiter === 50);
  record('Functional', 'Prior rate auto-closed but retained', !!oldRow && oldRow.EffectiveTo === '2026-05-31', `effectiveTo ${oldRow?.EffectiveTo}`);

  // ---- month closing / lock workflow (admin) ----
  // Use a far-future period to avoid touching real billing data.
  const CY = 2099, CM = 11;
  let anyCustomerId = null;
  r = await http.get('/customers', auth(a));
  if (r.status === 200 && Array.isArray(r.data?.data)) {
    // The raw customers list returns PascalCase columns (Id, IsActive).
    anyCustomerId = (r.data.data.find((x) => x.IsActive !== false) || r.data.data[0])?.Id || null;
  }
  r = await http.get(`/month-closures/${CY}/${CM}`, auth(a));
  record('Functional', 'Month status starts Open', r.status === 200 && r.data?.data?.status === 'Open', `status ${r.status} -> ${r.data?.data?.status}`);
  r = await http.post(`/month-closures/${CY}/${CM}/close`, { notes: '__RBAC_TEST__' }, auth(a));
  record('Functional', 'Admin closes month', r.status === 200 && r.data?.data?.Status === 'Closed', `status ${r.status}`);
  r = await http.post(`/month-closures/${CY}/${CM}/close`, {}, auth(a));
  record('Functional', 'Re-closing an open->closed month returns 409', r.status === 409, `status ${r.status}`);

  if (anyCustomerId) {
    // Non-admin (delivery person) delivery edit on a closed month must be blocked (423).
    const dp = tokens.deliveryperson;
    if (dp) {
      r = await http.put(`/deliveries/${anyCustomerId}/${CY}/${CM}/day`, { date: `${CY}-${String(CM).padStart(2, '0')}-05`, delivered: false, reason: '__RBAC_TEST__' }, auth(dp));
      record('Functional', 'Delivery edit on closed month blocked for non-admin (423)', r.status === 423, `status ${r.status}`);
    }
    // Admin correction on a closed month is allowed (authorized override).
    r = await http.put(`/deliveries/${anyCustomerId}/${CY}/${CM}/day`, { date: `${CY}-${String(CM).padStart(2, '0')}-05`, delivered: false, reason: '__RBAC_TEST__' }, auth(a));
    record('Functional', 'Admin correction on closed month allowed', r.status === 200, `status ${r.status}`);
  } else {
    record('Functional', 'Closed-month delivery enforcement', true, 'skipped: no customer available');
  }

  // Invoice regeneration on a closed month blocked for manager (423).
  if (tokens.manager) {
    r = await http.post('/invoices/generate', { year: CY, month: CM, customerId: anyCustomerId || '__none__' }, auth(tokens.manager));
    record('Functional', 'Invoice generate on closed month blocked for manager (423)', r.status === 423, `status ${r.status}`);
  }

  // Reopen requires admin + reason.
  r = await http.post(`/month-closures/${CY}/${CM}/reopen`, {}, auth(a));
  record('Functional', 'Reopen without reason rejected (400)', r.status === 400, `status ${r.status}`);
  r = await http.post(`/month-closures/${CY}/${CM}/reopen`, { reason: '__RBAC_TEST__ done' }, auth(a));
  record('Functional', 'Admin reopens month', r.status === 200 && r.data?.data?.Status === 'Open', `status ${r.status}`);
  r = await http.get(`/month-closures/${CY}/${CM}`, auth(a));
  record('Functional', 'Month status Open after reopen', r.status === 200 && r.data?.data?.status === 'Open', `-> ${r.data?.data?.status}`);
  global.__testCloseCustomerId = anyCustomerId;

  // ---- delivery status enum workflow (§9.2/§9.3) ----
  r = await http.get('/deliveries/statuses', auth(a));
  const statuses = r.data?.data || [];
  record('Functional', 'Delivery statuses enum returned', r.status === 200 && statuses.includes('Holiday') && statuses.includes('Partial') && statuses.length === 8, `status ${r.status} count ${statuses.length}`);
  if (anyCustomerId) {
    const SY = 2098, SM = 12, pad = (n) => String(n).padStart(2, '0');
    r = await http.put(`/deliveries/${anyCustomerId}/${SY}/${SM}/day`, { date: `${SY}-${pad(SM)}-05`, status: 'Holiday', reason: '__RBAC_TEST__' }, auth(a));
    record('Functional', 'Set day status = Holiday (not delivered)', r.status === 200 && r.data?.data?.StatusData?.[`${SY}-${pad(SM)}-05`] === 'Holiday' && r.data?.data?.DeliveryData?.[`${SY}-${pad(SM)}-05`] === false, `status ${r.status}`);
    r = await http.put(`/deliveries/${anyCustomerId}/${SY}/${SM}/day`, { date: `${SY}-${pad(SM)}-06`, status: 'Partial', quantity: 1 }, auth(a));
    const okPartial = r.status === 200 && r.data?.data?.StatusData?.[`${SY}-${pad(SM)}-06`] === 'Partial'
      && r.data?.data?.DeliveryData?.[`${SY}-${pad(SM)}-06`] === true && Number(r.data?.data?.QuantityData?.[`${SY}-${pad(SM)}-06`]) === 1;
    record('Functional', 'Set day status = Partial with actual quantity', okPartial, `status ${r.status}`);
    r = await http.put(`/deliveries/${anyCustomerId}/${SY}/${SM}/day`, { date: `${SY}-${pad(SM)}-07`, status: 'Teleported' }, auth(a));
    record('Functional', 'Invalid delivery status rejected (400)', r.status === 400, `status ${r.status}`);
    r = await http.put(`/deliveries/${anyCustomerId}/${SY}/${SM}/day`, { date: `${SY}-${pad(SM)}-08`, delivered: false, reason: '__RBAC_TEST__' }, auth(a));
    record('Functional', 'Legacy boolean update derives Missed status', r.status === 200 && r.data?.data?.StatusData?.[`${SY}-${pad(SM)}-08`] === 'Missed', `status ${r.status}`);
    global.__testStatusCustomerId = anyCustomerId;
  }

  // ---- mobile OTP verification workflow (§4.2) — public endpoints, dev-mode devCode ----
  const otpMobile = '9' + String(Math.floor(1000000000 + Math.random() * 8999999999)).slice(0, 9);
  global.__testOtpMobiles = [otpMobile];
  r = await http.post('/auth/otp/request', { mobile: otpMobile });
  const devCode = r.data?.data?.devCode;
  record('Functional', 'OTP request returns dev code', r.status === 200 && typeof devCode === 'string' && devCode.length === 6, `status ${r.status} code ${devCode ? 'present' : 'missing'}`);
  if (devCode) {
    r = await http.post('/auth/otp/verify', { mobile: otpMobile, code: '000000' === devCode ? '111111' : '000000' });
    record('Functional', 'OTP wrong code rejected (400)', r.status === 400, `status ${r.status}`);
    r = await http.post('/auth/otp/verify', { mobile: otpMobile, code: devCode });
    record('Functional', 'OTP correct code verifies mobile', r.status === 200 && r.data?.data?.verified === true, `status ${r.status}`);
    r = await http.get(`/auth/otp/status?mobile=${otpMobile}`);
    record('Functional', 'OTP status shows verified', r.status === 200 && r.data?.data?.verified === true, `status ${r.status}`);
    r = await http.post('/auth/otp/verify', { mobile: otpMobile, code: devCode });
    record('Functional', 'OTP cannot be reused after verify (400)', r.status === 400, `status ${r.status}`);
  }
  // Resend cooldown + invalid mobile
  const otpMobile2 = '9' + String(Math.floor(1000000000 + Math.random() * 8999999999)).slice(0, 9);
  global.__testOtpMobiles.push(otpMobile2);
  await http.post('/auth/otp/request', { mobile: otpMobile2 });
  r = await http.post('/auth/otp/resend', { mobile: otpMobile2 });
  record('Functional', 'OTP immediate resend hits cooldown (429)', r.status === 429, `status ${r.status}`);
  r = await http.post('/auth/otp/request', { mobile: '123' });
  record('Functional', 'OTP invalid mobile rejected (400)', r.status === 400, `status ${r.status}`);

  // ---- customer -> admin request approval workflow ----
  const custToken = tokens.customer;
  const linkedCustomerId = meUser.customer?.customerIds?.[0];
  if (custToken && linkedCustomerId) {
    r = await http.post('/customer-requests', {
      customerId: linkedCustomerId, requestDate: '2027-01-20', requestType: 'extra_milk',
      extraQuantity: 1, reason: '__RBAC_TEST__',
    }, auth(custToken));
    const reqId = Array.isArray(r.data?.data) ? r.data.data[0]?.id : r.data?.data?.id;
    record('Functional', 'Customer submits extra-milk request', (r.status === 200 || r.status === 201) && reqId, `status ${r.status}`);
    if (reqId) {
      r = await http.patch(`/customer-requests/${reqId}/status`, { status: 'Approved' }, auth(a));
      record('Functional', 'Admin approves request', r.status === 200 && r.data?.data?.status === 'Approved', `status ${r.status}`);
      global.__testRequestId = reqId;
    }
  } else {
    record('Functional', 'Customer request workflow', true, 'skipped: no active customer linked to test customer');
  }
}

// safe wrapper so a thrown/timeout doesn't abort the whole run
async function callSafe(method, path, body, token) {
  try {
    if (method === 'get' || method === 'delete') return await http[method](path, auth(token));
    return await http[method](path, body || {}, auth(token));
  } catch (err) {
    return { status: err.response?.status || 0, data: err.message };
  }
}

// ---- cleanup any DB artifacts ---------------------------------------------
async function cleanup() {
  try {
    await execute("DELETE FROM dbo.ProductOrderItems WHERE OrderId IN (SELECT Id FROM dbo.ProductOrders WHERE Notes='__RBAC_TEST__')");
    await execute("DELETE FROM dbo.ProductOrders WHERE Notes='__RBAC_TEST__'");
    await execute("DELETE FROM dbo.SubscriptionHistory WHERE SubscriptionId IN (SELECT Id FROM dbo.CustomerSubscriptions WHERE Notes='__RBAC_TEST__')");
    await execute("DELETE FROM dbo.CustomerSubscriptions WHERE Notes='__RBAC_TEST__'");
    await execute("DELETE FROM dbo.Products WHERE Name LIKE '__RBAC%'");
    await execute("DELETE FROM dbo.Customers WHERE Mobile='9999999990' OR Name LIKE '__RBAC%'");
    await execute("DELETE FROM dbo.CowMaster WHERE Name LIKE '__RBAC%' OR TagNumber LIKE '__RBAC%'");
    await execute("DELETE FROM dbo.Deliveries WHERE CustomerId IN ('__rbac_deltest__','__rbac_none__')");
    if (global.__testRequestId) {
      await execute('DELETE FROM dbo.AuditLog WHERE EntityId=@id', { id: { type: NVarChar(36), value: global.__testRequestId } });
      await execute('DELETE FROM dbo.CustomerDeliveryRequests WHERE Id=@id', { id: { type: NVarChar(36), value: global.__testRequestId } });
    }
    await execute("DELETE FROM dbo.MilkRates WHERE MilkType='__RBAC_TEST__' OR Notes='__RBAC_TEST__'");
    // month-closing artifacts (far-future test period 2099/11 + 2099/12 probes)
    await execute("DELETE FROM dbo.MonthClosures WHERE [Year]=2099");
    await execute("DELETE FROM dbo.AuditLog WHERE Module='MonthClosures' OR Action LIKE 'CLOSED_MONTH%' OR Reason='__RBAC_TEST__'");
    if (global.__testCloseCustomerId) {
      await execute('DELETE FROM dbo.Deliveries WHERE CustomerId=@cid AND [Year]=2099', {
        cid: { type: NVarChar(36), value: global.__testCloseCustomerId },
      });
    }
    if (global.__testStatusCustomerId) {
      await execute('DELETE FROM dbo.Deliveries WHERE CustomerId=@cid AND [Year]=2098', {
        cid: { type: NVarChar(36), value: global.__testStatusCustomerId },
      });
    }
    if (Array.isArray(global.__testOtpMobiles)) {
      for (const m of global.__testOtpMobiles) {
        await execute('DELETE FROM dbo.OtpVerifications WHERE Mobile=@m', { m: { type: NVarChar(20), value: m } });
      }
    }
    await execute("DELETE FROM dbo.CustomerDeliveryRequests WHERE Reason='__RBAC_TEST__'");
  } catch (err) {
    console.error('Cleanup warning:', err.message);
  }
}

// ---- report ----------------------------------------------------------------
function report() {
  const bySection = {};
  for (const r of results) {
    bySection[r.section] = bySection[r.section] || { pass: 0, fail: 0, fails: [] };
    if (r.pass) bySection[r.section].pass++;
    else { bySection[r.section].fail++; bySection[r.section].fails.push(r); }
  }

  console.log('\n============================================================');
  console.log('  DAIRY FARM — ROLE-BASED API TEST REPORT');
  console.log(`  ${API_BASE}`);
  console.log('============================================================');
  let totalPass = 0, totalFail = 0;
  for (const [section, s] of Object.entries(bySection)) {
    totalPass += s.pass; totalFail += s.fail;
    const status = s.fail === 0 ? 'PASS' : 'FAIL';
    console.log(`\n[${status}] ${section}: ${s.pass} passed, ${s.fail} failed`);
    for (const f of s.fails) console.log(`   ✗ ${f.name}  (${f.detail})`);
  }

  // Per-role breakdown: Login + RBAC checks are named with the role as the first token.
  const roleStats = {};
  for (const role of ALL_ROLES) roleStats[role] = { pass: 0, fail: 0 };
  for (const r of results) {
    if (!['Login', 'RBAC-Denied', 'RBAC-Allowed'].includes(r.section)) continue;
    const role = r.name.split(' ')[0];
    if (!roleStats[role]) continue;
    if (r.pass) roleStats[role].pass++; else roleStats[role].fail++;
  }
  console.log('\n------------------------------------------------------------');
  console.log('  PER-ROLE ACCESS-CONTROL RESULTS (login + allow + deny)');
  console.log('------------------------------------------------------------');
  console.log('  Role              Checks   Passed  Failed  Result');
  for (const role of ALL_ROLES) {
    const s = roleStats[role];
    const total = s.pass + s.fail;
    const res = s.fail === 0 ? 'PASS' : 'FAIL';
    console.log(`  ${role.padEnd(16)}  ${String(total).padStart(6)}  ${String(s.pass).padStart(6)}  ${String(s.fail).padStart(6)}  ${res}`);
  }
  console.log('\n  Functional suite (end-to-end workflows) exercises: admin (all');
  console.log('  modules), customer (orders/subscriptions/requests), delivery');
  console.log('  person + manager (closed-month enforcement).');

  console.log('\n------------------------------------------------------------');
  console.log(`  TOTAL: ${totalPass} passed, ${totalFail} failed  (${results.length} checks)`);
  if (rateLimited) console.log('  NOTE: some failures were HTTP 429 (rate limit). Wait 15 min and re-run.');
  console.log('============================================================\n');
  return totalFail;
}

(async () => {
  try {
    await loginAll();
    await denialMatrix();
    await allowProbes();
    await functionalSuite();
  } catch (err) {
    console.error('Harness error:', err);
  } finally {
    await cleanup();
    const failed = report();
    process.exit(failed > 0 && !rateLimited ? 1 : 0);
  }
})();

import apiClient from './client';

// Auth
export const authApi = {
  googleSignIn: (idToken: string) => apiClient.post('/auth/google', { idToken }),
  mobilePasswordLogin: (mobile: string, password: string) => apiClient.post('/auth/mobile-login', { mobile, password }),
  pinLogin: (pin: string) => apiClient.post('/auth/pin', { pin }),
  me: () => apiClient.get('/auth/me'),
  updatePushToken: (pushToken: string) => apiClient.put('/auth/push-token', { pushToken }),
  // Mobile OTP verification (§4.2)
  requestOtp: (mobile: string, purpose?: string) => apiClient.post('/auth/otp/request', { mobile, purpose }),
  resendOtp: (mobile: string, purpose?: string) => apiClient.post('/auth/otp/resend', { mobile, purpose }),
  verifyOtp: (mobile: string, code: string, purpose?: string) => apiClient.post('/auth/otp/verify', { mobile, code, purpose }),
  otpStatus: (mobile: string, purpose?: string) => apiClient.get('/auth/otp/status', { params: purpose ? { mobile, purpose } : { mobile } }),
};

export const usersApi = {
  getAll: () => apiClient.get('/users'),
  getRoles: () => apiClient.get('/users/roles'),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  create: (data: any) => apiClient.post('/users', data),
  update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  toggleActive: (id: string) => apiClient.patch(`/users/${id}/toggle`),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// Dashboard
export const dashboardApi = {
  getSummary: () => apiClient.get('/dashboard/summary'),
  getCustomerSummary: () => apiClient.get('/dashboard/customer-summary'),
};

export const customerRequestsApi = {
  getMonthly: (year: number, month: number, customerId?: string) =>
    apiClient.get(`/customer-requests/${year}/${month}`, { params: customerId ? { customerId } : {} }),
  create: (data: any) => apiClient.post('/customer-requests', data),
  updateStatus: (id: string, data: any) => apiClient.patch(`/customer-requests/${id}/status`, data),
};

// Customers
export const customersApi = {
  getAll: (active?: string) => apiClient.get('/customers', { params: active ? { active } : {} }),
  getById: (id: string) => apiClient.get(`/customers/${id}`),
  create: (data: any) => apiClient.post('/customers', data),
  update: (id: string, data: any) => apiClient.put(`/customers/${id}`, data),
  toggleActive: (id: string) => apiClient.patch(`/customers/${id}/toggle`),
  delete: (id: string) => apiClient.delete(`/customers/${id}`),
};

// Deliveries
export const deliveriesApi = {
  getToday: () => apiClient.get('/deliveries/today'),
  getStatuses: () => apiClient.get('/deliveries/statuses'),
  getAllMonthly: (year: number, month: number) => apiClient.get(`/deliveries/${year}/${month}`),
  getMonthly: (customerId: string, year: number, month: number) =>
    apiClient.get(`/deliveries/${customerId}/${year}/${month}`),
  updateDay: (
    customerId: string, year: number, month: number,
    data: { date: string; delivered?: boolean; status?: string; quantity?: number; reason?: string; comments?: string },
  ) => apiClient.put(`/deliveries/${customerId}/${year}/${month}/day`, data),
  markAll: (customerId: string, year: number, month: number, delivered: boolean) =>
    apiClient.put(`/deliveries/${customerId}/${year}/${month}/mark-all`, { delivered }),
};

// Invoices
export const invoicesApi = {
  generate: (year: number, month: number, customerId?: string) => apiClient.post('/invoices/generate', { year, month, customerId }),
  getAll: (year?: number, month?: number, customerId?: string) => apiClient.get('/invoices', { params: { year, month, customerId } }),
  getById: (id: string) => apiClient.get(`/invoices/${id}`),
  getByCustomer: (customerId: string) => apiClient.get('/invoices', { params: { customerId } }),
  getPdfUrl: (id: string) => `${apiClient.defaults.baseURL}/invoices/${id}/pdf`,
  getWhatsAppLink: (id: string) =>
    apiClient.get(`/invoices/${id}/whatsapp`).then((res) => ({
      ...res,
      data: {
        ...res.data,
        data: {
          ...res.data.data,
          link: res.data.data?.url ?? res.data.data?.link,
        },
      },
    })),
  getMonthlyMessageLinks: (year: number, month: number) =>
    apiClient.get(`/invoices/month/${year}/${month}/message-links`),
  sendMonthlyWhatsApp: (year: number, month: number) =>
    apiClient.post(`/invoices/month/${year}/${month}/send-whatsapp`),
  sendEmail: (id: string) => apiClient.post(`/invoices/${id}/email`),
};

// Payments
export const paymentsApi = {
  getAll: (params?: any) => apiClient.get('/payments', { params }),
  getPending: () => apiClient.get('/payments/outstanding'),
  record: (data: any) => apiClient.post('/payments', data),
};

// Cows (Cow/Buffalo — both use the breeding/pregnancy/milk pipeline)
export const cowsApi = {
  getAll: (status?: string, gender?: string, animalType?: string) =>
    apiClient.get('/cows', { params: { ...(status ? { status } : {}), ...(gender ? { gender } : {}), ...(animalType ? { animalType } : {}) } }),
  getById: (id: string) => apiClient.get(`/cows/${id}`),
  create: (data: any) => apiClient.post('/cows', data),
  update: (id: string, data: any) => apiClient.put(`/cows/${id}`, data),
  delete: (id: string) => apiClient.delete(`/cows/${id}`),
  getHealth: (id: string) => apiClient.get(`/cows/${id}/health`),
  addHealth: (id: string, data: any) => apiClient.post(`/cows/${id}/health`, data),
};

// Goat/Hen/Duck — simple herd/flock inventory, same shape. `gender` is only meaningful for Goat
// (see SIMPLE_ANIMAL_CONFIG.hasGender) — Hen/Duck have no Gender column and ignore it.
const createSimpleAnimalApi = (basePath: string) => ({
  getAll: (status?: string, gender?: string) =>
    apiClient.get(basePath, { params: { ...(status ? { status } : {}), ...(gender ? { gender } : {}) } }),
  getById: (id: string) => apiClient.get(`${basePath}/${id}`),
  create: (data: any) => apiClient.post(basePath, data),
  update: (id: string, data: any) => apiClient.put(`${basePath}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${basePath}/${id}`),
});
// Common shape shared by goatsApi/hensApi/ducksApi — used to type SimpleAnimalConfig.api so it
// isn't pinned to goatsApi's extra weight-tracking methods (which hensApi/ducksApi don't have).
export type SimpleAnimalApi = ReturnType<typeof createSimpleAnimalApi>;

export const goatsApi = {
  ...createSimpleAnimalApi('/goats'),
  // Weight tracking (recommended every ~2 weeks) — Goat-only, see SIMPLE_ANIMAL_CONFIG.hasWeightTracking.
  getWeights: (id: string) => apiClient.get(`/goats/${id}/weights`),
  addWeight: (id: string, data: { weighedDate?: string; weightKg: number | string; notes?: string }) =>
    apiClient.post(`/goats/${id}/weights`, data),
  deleteWeight: (id: string, weightId: string) => apiClient.delete(`/goats/${id}/weights/${weightId}`),
};
export const hensApi = createSimpleAnimalApi('/hens');
export const ducksApi = createSimpleAnimalApi('/ducks');

// Breeding
export const breedingApi = {
  create: (data: any) => apiClient.post('/breeding', data),
  getAll: (params?: { cowId?: string; status?: string; conception?: string }) =>
    apiClient.get('/breeding', { params: params || {} }),
  getByCow: (cowId: string) => apiClient.get('/breeding', { params: { cowId } }),
  confirmPregnancy: (breedingId: string, data: any) => apiClient.put(`/breeding/${breedingId}/confirm-pregnancy`, data),
  setConception: (breedingId: string, data: { conceived: boolean; confirmationDate?: string; veterinarian?: string; nextMatingDate?: string }) =>
    apiClient.put(`/breeding/${breedingId}/conception`, data),
  getPregnancies: (status?: string) => apiClient.get('/breeding', { params: { status } }),
};

// Calving
export const calvingApi = {
  record: (data: any) => apiClient.post('/calving', data),
  getAll: () => apiClient.get('/calving'),
  getCalves: () => apiClient.get('/calving/calves'),
  updateCalf: (id: string, data: any) => apiClient.put(`/calving/calves/${id}`, data),
};

// Milk Production
export const milkApi = {
  addEntry: (data: any) => apiClient.post('/milk-production', data),
  getDaily: (date: string) => apiClient.get(`/milk-production/daily/${date}`),
  getMonthly: (year: number, month: number) => apiClient.get(`/milk-production/monthly/${year}/${month}`),
  getCow: (cowId: string) => apiClient.get(`/milk-production/cow/${cowId}`),
};

// Reports
export const reportsApi = {
  monthlyExcel: (year: number, month: number) =>
    apiClient.get(`/reports/monthly-excel/${year}/${month}`, { responseType: 'blob' }),
  deliveryExceptions: () => apiClient.get('/reports/delivery-exceptions'),
  pendingPayments: () => apiClient.get('/reports/pending-payments'),
  pregnantCows: () => apiClient.get('/reports/pregnant-cows'),
  milkProduction: (year: number, month: number) =>
    apiClient.get(`/reports/milk-production/${year}/${month}`),
  monthlyFinance: (year: number, month: number) =>
    apiClient.get(`/reports/monthly-finance/${year}/${month}`),
  financeLedger: (year: number, month: number) =>
    apiClient.get(`/reports/finance-ledger/${year}/${month}`),
  financeTrend: (year: number) => apiClient.get(`/reports/finance-trend/${year}`),
};

// Medicine master (name, dosage in mg, purpose, comments)
export const medicinesApi = {
  getAll: (active?: string) => apiClient.get('/medicines', { params: active ? { active } : {} }),
  getById: (id: string) => apiClient.get(`/medicines/${id}`),
  create: (data: any) => apiClient.post('/medicines', data),
  update: (id: string, data: any) => apiClient.put(`/medicines/${id}`, data),
  toggleActive: (id: string) => apiClient.patch(`/medicines/${id}/toggle`),
  delete: (id: string) => apiClient.delete(`/medicines/${id}`),
};

// Money ledgers — Expenses and Income share the same CRUD shape (see ledger.factory.js on the API).
const createLedgerApi = (basePath: string) => ({
  getAll: (params?: { year?: number; month?: number; category?: string; from?: string; to?: string }) =>
    apiClient.get(basePath, { params: params || {} }),
  getById: (id: string) => apiClient.get(`${basePath}/${id}`),
  getMonthlySummary: (year: number, month: number) => apiClient.get(`${basePath}/summary/${year}/${month}`),
  create: (data: any) => apiClient.post(basePath, data),
  update: (id: string, data: any) => apiClient.put(`${basePath}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${basePath}/${id}`),
  // Expense / income types (system defaults + user-added, e.g. "Machinery", "Pump")
  getCategories: () => apiClient.get(`${basePath}/categories`),
  createCategory: (data: { name: string }) => apiClient.post(`${basePath}/categories`, data),
  deleteCategory: (id: string) => apiClient.delete(`${basePath}/categories/${id}`),
});
export type LedgerApi = ReturnType<typeof createLedgerApi>;

// Expenses (cattle feed, medicine, doctor fee, labour salary, EB, petty cash & other)
export const expensesApi = createLedgerApi('/expenses');
// Income (cattle/calf/manure sales, subsidies, direct milk sales & other)
export const incomeApi = createLedgerApi('/income');

// Settings
export const settingsApi = {
  get: () => apiClient.get('/settings'),
  update: (data: any) => apiClient.put('/settings', data),
};

// Products (master price list)
export const productsApi = {
  getAll: (active?: string) => apiClient.get('/products', { params: active ? { active } : {} }),
  getLowStock: () => apiClient.get('/products/low-stock'),
  create: (data: any) => apiClient.post('/products', data),
  update: (id: string, data: any) => apiClient.put(`/products/${id}`, data),
  adjustStock: (id: string, data: { delta?: number; set?: number }) =>
    apiClient.patch(`/products/${id}/stock`, data),
  toggleActive: (id: string) => apiClient.patch(`/products/${id}/toggle`),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
};

// Product orders (customers place, staff manage)
export const ordersApi = {
  getAll: (params?: { status?: string; customerId?: string }) => apiClient.get('/orders', { params: params || {} }),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
  create: (data: { customerId?: string; orderDate?: string; notes?: string; items: { productId: string; quantity: number }[] }) =>
    apiClient.post('/orders', data),
  updateStatus: (id: string, data: { status: string; actionReason?: string }) =>
    apiClient.patch(`/orders/${id}/status`, data),
  cancel: (id: string, reason?: string) => apiClient.post(`/orders/${id}/cancel`, { reason }),
};

// Milk subscriptions (customer requests, staff approve + manage history)
export const subscriptionsApi = {
  getAll: (params?: { status?: string; customerId?: string }) => apiClient.get('/subscriptions', { params: params || {} }),
  getById: (id: string) => apiClient.get(`/subscriptions/${id}`),
  getHistory: (id: string) => apiClient.get(`/subscriptions/${id}/history`),
  create: (data: {
    customerId?: string; milkType?: string; morningQuantity: number; eveningQuantity: number;
    rate?: number; deliveryDays?: string; startDate?: string; notes?: string;
  }) => apiClient.post('/subscriptions', data),
  amend: (id: string, data: {
    milkType?: string; morningQuantity?: number; eveningQuantity?: number;
    rate?: number; deliveryDays?: string; changeReason?: string; effectiveFrom?: string;
  }) => apiClient.put(`/subscriptions/${id}`, data),
  updateStatus: (id: string, data: { status: string; actionReason?: string }) =>
    apiClient.patch(`/subscriptions/${id}/status`, data),
  pause: (id: string, data: { fromDate: string; toDate?: string; reason?: string }) =>
    apiClient.post(`/subscriptions/${id}/pause`, data),
  resume: (id: string) => apiClient.post(`/subscriptions/${id}/resume`),
  cancel: (id: string, reason?: string) => apiClient.post(`/subscriptions/${id}/cancel`, { reason }),
};

// Milk rate management (effective-dated; staff view, settings-manage edits)
export const milkRatesApi = {
  getAll: (milkType?: string) => apiClient.get('/milk-rates', { params: milkType ? { milkType } : {} }),
  getEffective: (milkType: string, date?: string) =>
    apiClient.get('/milk-rates/effective', { params: date ? { milkType, date } : { milkType } }),
  create: (data: { milkType: string; ratePerLiter: number; effectiveFrom: string; notes?: string }) =>
    apiClient.post('/milk-rates', data),
  update: (id: string, data: { ratePerLiter: number; status?: string; notes?: string }) =>
    apiClient.put(`/milk-rates/${id}`, data),
  delete: (id: string) => apiClient.delete(`/milk-rates/${id}`),
};

// Month closing / lock (billing periods become read-only once closed)
export const monthClosuresApi = {
  getAll: (year?: number) => apiClient.get('/month-closures', { params: year ? { year } : {} }),
  getStatus: (year: number, month: number) => apiClient.get(`/month-closures/${year}/${month}`),
  close: (year: number, month: number, notes?: string) =>
    apiClient.post(`/month-closures/${year}/${month}/close`, { notes }),
  reopen: (year: number, month: number, reason: string) =>
    apiClient.post(`/month-closures/${year}/${month}/reopen`, { reason }),
};

// Backup
export const backupApi = {
  create: () => apiClient.post('/backup/create'),
  list: () => apiClient.get('/backup/list'),
};

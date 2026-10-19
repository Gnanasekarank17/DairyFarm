export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  dailyQuantity: string;
  morningQuantity: string;
  eveningQuantity: string;
  milkType: 'Cow Milk' | 'Buffalo Milk' | 'Aavin Milk' | 'Other';
  ratePerLiter: string;
  billingMode: 'Monthly Full Check' | 'Daily Check';
  isActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryData {
  [date: string]: boolean;
}

export type DeliveryStatus =
  | 'Scheduled'
  | 'Delivered'
  | 'Partial'
  | 'Missed'
  | 'CustomerUnavailable'
  | 'Holiday'
  | 'Cancelled'
  | 'ExtraDelivery';

export interface DeliveryStatusData {
  [date: string]: DeliveryStatus;
}

export interface DeliveryQuantityData {
  [date: string]: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  unit: 'liter' | 'kg';
  rate: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  taxPercent?: number;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'OutForDelivery' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  notes: string;
  actionReason: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export type SubscriptionStatus =
  | 'Draft' | 'Submitted' | 'PendingApproval' | 'Approved' | 'Rejected'
  | 'Active' | 'Paused' | 'Suspended' | 'Cancelled' | 'Completed';

export interface Subscription {
  id: string;
  customerId: string;
  customerName?: string;
  milkType: string;
  morningQuantity: number;
  eveningQuantity: number;
  totalQuantity: number;
  rate: number;
  deliveryDays: string;
  startDate?: string;
  status: SubscriptionStatus;
  estimatedMonthlyAmount: number;
  notes: string;
  actionReason: string;
  actionBy: string;
  actionAt: string;
  pauseFrom: string;
  pauseTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionHistory {
  id: string;
  subscriptionId: string;
  customerId: string;
  milkType: string;
  morningQuantity: number;
  eveningQuantity: number;
  totalQuantity: number;
  rate: number;
  deliveryDays: string;
  status: SubscriptionStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  changeReason: string;
  createdBy: string;
  createdAt: string;
}

export interface MilkRate {
  id: string;
  milkType: string;
  ratePerLiter: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'Active' | 'Inactive';
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MonthClosure {
  id: string;
  year: number;
  month: number;
  status: 'Open' | 'Closed';
  notes?: string;
  closedBy?: string;
  closedAt?: string;
  reopenedBy?: string;
  reopenedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReasonData {
  [date: string]: { reason: string; comments: string };
}

export interface DeliveryRecord {
  id: string;
  customerId: string;
  customerName?: string;
  date: string;
  year: string;
  month: string;
  deliveredDays: string;
  missedDays: string;
  deliveryData: DeliveryData;
  reasonData?: ReasonData;
  statusData?: DeliveryStatusData;
  quantityData?: DeliveryQuantityData;
  totalQuantity: string;
  totalAmount: string;
}

export interface CustomerDeliveryRequest {
  id: string;
  customerId: string;
  customerName?: string;
  userId?: string;
  requestDate: string;
  requestType: 'extra_milk' | 'cancel_delivery' | 'dispute_delivery';
  extraQuantity: string;
  claimedStatus?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  actionReason?: string;
  actionBy?: string;
  actionAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDashboardSummary {
  customer: Customer;
  currentMonth: { year: number; month: number };
  lastMonth?: { year: number; month: number };
  milk: { averageLiters: number; totalLiters: number; extraLiters?: number };
  delivery: { deliveredDays: number; missedDays: number };
  billing: { pendingDues: number; lastMonthDue?: number; currentMonthEstimate?: number; currentMonthCutoffDate?: string; invoiceCount: number; pendingInvoices: number };
  recentRequests: CustomerDeliveryRequest[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  month: string;
  year: string;
  dailyQuantity: string;
  ratePerLiter: string;
  deliveredDays: string;
  missedDays: string;
  totalQuantity: string;
  amount: string;
  paymentStatus: 'Pending' | 'Partial' | 'Paid';
  missedDetails: string;
  deliveryCharge?: string | number;
  createdAt: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  invoiceNumber: string;
  amountDue: string;
  amountPaid: string;
  balance: string;
  paymentDate: string;
  paymentMode: string;
  notes: string;
  status: 'Pending' | 'Partial' | 'Paid';
}

export interface Cow {
  id: string;
  name: string;
  tagNumber: string;
  breed: string;
  color: string;
  gender: 'Female' | 'Male';
  // Cow/Buffalo only — both share the breeding/pregnancy/calving/milk-production pipeline below.
  animalType: 'Cow' | 'Buffalo';
  dateOfBirth: string;
  purchaseDate: string;
  purchaseCost: string;
  currentStatus: 'Active' | 'Pregnant' | 'Dry Period' | 'Sold' | 'Deceased';
  photoUrl: string;
  notes: string;
}

// Goat/Hen/Duck — simple herd/flock inventory, no breeding/milk pipeline (unlike Cow above).
export interface SimpleAnimal {
  id: string;
  name: string;
  tagNumber: string;
  breed: string;
  color: string;
  // Only present for species with breeding support (currently Goat) — see SIMPLE_ANIMAL_CONFIG.hasGender.
  gender?: 'Female' | 'Male';
  dateOfBirth: string;
  purchaseDate: string;
  purchaseCost: string;
  currentStatus: 'Active' | 'Mated' | 'Pregnant' | 'Sold' | 'Deceased';
  photoUrl: string;
  notes: string;
  // Only present for species with weight tracking (currently Goat) — see SIMPLE_ANIMAL_CONFIG.hasWeightTracking.
  currentWeightKg?: number | string;
  previousWeightKg?: number | string | null;
  lastWeighedDate?: string;
  weightHistory?: GoatWeightRecord[];
}

export interface GoatWeightRecord {
  id: string;
  goatId: string;
  weighedDate: string;
  weightKg: number | string;
  notes?: string;
}

export interface HealthRecord {
  id: string;
  cowId: string;
  recordType: string;
  date: string;
  description: string;
  veterinarian: string;
  nextDueDate: string;
  documents: string;
  notes: string;
}

export interface BreedingRecord {
  id: string;
  cowId: string;
  species?: 'Cow' | 'Buffalo' | 'Goat';
  matingDate: string;
  bullName: string;
  breedingMethod: 'Natural' | 'Artificial Insemination';
  technicianName: string;
  notes: string;
  nextCheckDate?: string;
  conceptionStatus?: 'Pending' | 'Conceived' | 'NotConceived';
  cycleNumber?: number;
  reminderSent?: boolean;
  cowName?: string;
  tagNumber?: string;
  cowStatus?: string;
  expectedCalvingDate?: string;
  daysUntilCheck?: number | null;
  daysUntilCalving?: number | null;
}

export interface PregnancyRecord {
  id: string;
  cowId: string;
  breedingId: string;
  isConfirmed: string;
  confirmationDate: string;
  veterinarian: string;
  expectedCalvingDate: string;
  actualCalvingDate: string;
  status: 'Pregnant' | 'Delivered' | 'Aborted';
  daysUntilCalving?: number;
  daysPregnant?: number;
  notes: string;
}

export interface CalvingRecord {
  id: string;
  cowId: string;
  pregnancyId: string;
  deliveryDate: string;
  deliveryType: 'Normal' | 'Assisted' | 'Caesarean';
  numberOfCalves: string;
  complications: string;
  notes: string;
}

export interface CalfRecord {
  id: string;
  calvingId: string;
  motherCowId: string;
  name: string;
  gender: 'Male' | 'Female';
  birthDate: string;
  birthWeight: string;
  healthStatus: string;
  notes: string;
}

export interface MilkProduction {
  id: string;
  cowId: string;
  date: string;
  morningMilk: string;
  eveningMilk: string;
  totalMilk: string;
  notes: string;
}

export interface DashboardSummary {
  customers: { total: number; active: number; inactive: number };
  deliveries: { todayDelivered: number; todayMissed: number; activeCustomers: number };
  revenue: { monthly: number; pendingAmount: number };
  payments: { paid: number; unpaid: number; pending: number };
  cows: { total: number; active: number; pregnant: number; dryPeriod: number };
  pregnancies: { active: number; dueSoon: number };
  finance?: DashboardFinance;
}

export interface MedicineMaster {
  id: string;
  name: string;
  dosageMg?: number | string;
  purpose?: string;
  comments?: string;
  // Comma-separated on the wire (e.g. "Cow,Goat") — see ANIMAL_TYPE_OPTIONS in app/medicines/index.tsx.
  animalTypes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const EXPENSE_CATEGORIES = [
  'Cattle Feed', 'Medicine', 'Doctor Fee', 'Labour Salary', 'Electricity (EB)', 'Petty Cash', 'Other',
] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

// Manual income only — milk collections (Payments) and product orders are pulled in automatically
// by the finance reports, so they are not categories here.
export const INCOME_CATEGORIES = [
  'Milk Sale (Direct)', 'Cattle Sale', 'Calf Sale', 'Manure Sale', 'Goat / Poultry Sale', 'Egg Sale', 'Subsidy / Grant', 'Other',
] as const;
export type IncomeCategory = typeof INCOME_CATEGORIES[number];

export const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'] as const;
export type PaymentMode = typeof PAYMENT_MODES[number];

/** One row of dbo.LedgerCategories — an expense or income type. Users can add their own. */
export interface LedgerCategory {
  id: string;
  ledger: 'expense' | 'income';
  name: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
}

/** Common shape of one Expenses / Income ledger row (API returns camelCased SQL columns). */
export interface LedgerEntryBase {
  id: string;
  category: string;
  accountName?: string;
  itemName?: string;
  quantity?: number | string;
  unit?: string;
  amount: number | string;
  paymentMode?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Expense extends LedgerEntryBase {
  /** Seeded ExpenseCategory or a user-added type. */
  category: string;
  vendor?: string;
  expenseDate: string;
}

export interface Income extends LedgerEntryBase {
  /** Seeded IncomeCategory or a user-added type. */
  category: string;
  source?: string;
  incomeDate: string;
}

export type LedgerEntry = Expense | Income;

export interface LedgerCategoryTotal {
  category: string;
  total: number;
  count?: number;
}
/** @deprecated use LedgerCategoryTotal */
export type ExpenseCategoryTotal = LedgerCategoryTotal;

export interface LedgerMonthlySummary {
  year: number;
  month: number;
  byCategory: LedgerCategoryTotal[];
  grandTotal: number;
}
/** @deprecated use LedgerMonthlySummary */
export type ExpenseMonthlySummary = LedgerMonthlySummary;

export interface MonthlyFinanceReport {
  year: number;
  month: number;
  income: {
    milkPayments: number;
    otherItemSales: number;
    manual: number;
    byCategory: LedgerCategoryTotal[];
    total: number;
  };
  expense: { byCategory: LedgerCategoryTotal[]; total: number };
  netProfit: number;
}

/** One line of the combined cash book returned by /reports/finance-ledger. */
export interface FinanceLedgerRow {
  id: string;
  type: 'Income' | 'Expense';
  source: 'income' | 'expenses' | 'payments' | 'orders';
  date: string;
  category: string;
  description: string;
  party: string;
  paymentMode: string;
  notes: string;
  income: number;
  expense: number;
  balance: number;
}

export interface FinanceLedgerReport {
  year: number;
  month: number;
  rows: FinanceLedgerRow[];
  totalIncome: number;
  totalExpense: number;
  net: number;
}

export interface FinanceTrendPoint {
  year: number;
  month: number;
  income: number;
  expense: number;
  net: number;
}

export interface DashboardFinance {
  year: number;
  month: number;
  income: number;
  milkPayments: number;
  otherIncome: number;
  expense: number;
  net: number;
  expenseByCategory: LedgerCategoryTotal[];
  trend: FinanceTrendPoint[];
}

export type UserRole = 'admin' | 'supervisor' | 'manager' | 'deliveryperson' | 'cattlecaretaker' | 'farmcleaner' | 'customer';

export type Permission =
  | 'dashboard:view'
  | 'users:manage'
  | 'customers:view'
  | 'customers:manage'
  | 'deliveries:view'
  | 'deliveries:manage'
  | 'customer_requests:view'
  | 'customer_requests:create'
  | 'customer_requests:manage'
  | 'billing:view'
  | 'billing:manage'
  | 'cattle:view'
  | 'cattle:manage'
  | 'reports:view'
  | 'settings:manage'
  | 'backup:manage'
  | 'expenses:view'
  | 'expenses:manage'
  | 'income:view'
  | 'income:manage';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  permissions?: Permission[];
  customerIds?: string[];
}

export const REASON_CATEGORIES = [
  'Customer Cancelled',
  'Customer Out Of Station',
  'Holiday',
  'Milk Not Available',
  'Payment Pending',
  'Customer Requested Skip',
  'Delivery Issue',
  'Weather Conditions',
  'Festival Leave',
  'Other',
] as const;

export type ReasonCategory = typeof REASON_CATEGORIES[number];

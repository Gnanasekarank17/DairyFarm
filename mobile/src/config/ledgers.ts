import type { Ionicons } from '@expo/vector-icons';
import { expensesApi, incomeApi, type LedgerApi } from '../api/endpoints';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Permission } from '../types';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface LedgerCategoryMeta {
  icon: IoniconName;
  color: string;
}

/** Per-category form hints: what the "item" and "party" fields mean for this category. */
export interface LedgerFieldLabels {
  item: string;
  itemPlaceholder: string;
  party: string;
  partyPlaceholder: string;
  showQuantity: boolean;
}

export interface LedgerConfig {
  label: string;            // 'Expenses'
  singular: string;         // 'Expense'
  icon: IoniconName;
  emoji: string;
  /** Accent colour for totals / add button. */
  color: string;
  tone: 'expense' | 'income';
  api: LedgerApi;
  /** Seeded system types — the live list (incl. user-added) comes from useLedgerCategories(). */
  defaultCategories: readonly string[];
  categoryMeta: Record<string, LedgerCategoryMeta>;
  fieldLabels: Record<string, LedgerFieldLabels>;
  /** Labels for user-added types that have no per-category hints. */
  defaultFieldLabels: LedgerFieldLabels;
  /** API field names that differ between the two ledgers. */
  dateField: 'expenseDate' | 'incomeDate';
  partyField: 'vendor' | 'source';
  partyHeader: string;      // grid column header for the party field
  viewPermission: Permission;
  managePermission: Permission;
  /** react-query key prefix, e.g. ['expenses', year, month] */
  queryKey: string;
  emptySubtitle: string;
  accountNamePlaceholder: string;
}

const EXPENSE_META: Record<string, LedgerCategoryMeta> = {
  'Cattle Feed': { icon: 'nutrition-outline', color: '#16A34A' },
  'Medicine': { icon: 'medkit-outline', color: '#DC2626' },
  'Doctor Fee': { icon: 'fitness-outline', color: '#DB2777' },
  'Labour Salary': { icon: 'briefcase-outline', color: '#2563EB' },
  'Electricity (EB)': { icon: 'flash-outline', color: '#D97706' },
  'Petty Cash': { icon: 'cash-outline', color: '#0891B2' },
  'Other': { icon: 'pricetags-outline', color: '#7C3AED' },
};

const EXPENSE_FIELDS: Record<string, LedgerFieldLabels> = {
  'Cattle Feed': { item: 'Feed / Item Name', itemPlaceholder: 'e.g. Cotton seed cake', party: 'Supplier', partyPlaceholder: 'Shop / supplier name', showQuantity: true },
  'Medicine': { item: 'Medicine Name', itemPlaceholder: 'e.g. Calcium supplement', party: 'Pharmacy / Vet', partyPlaceholder: 'Where it was bought', showQuantity: true },
  'Doctor Fee': { item: 'Treatment / Visit', itemPlaceholder: 'e.g. AI visit, deworming', party: 'Doctor / Vet', partyPlaceholder: 'Doctor name', showQuantity: false },
  'Labour Salary': { item: 'Work / Role', itemPlaceholder: 'e.g. Milker, cleaner', party: 'Paid To', partyPlaceholder: 'Worker name', showQuantity: false },
  'Electricity (EB)': { item: 'Bill / Meter', itemPlaceholder: 'e.g. Sep bill, Service No.', party: 'Paid To', partyPlaceholder: 'e.g. TANGEDCO', showQuantity: true },
  'Petty Cash': { item: 'Purpose', itemPlaceholder: 'e.g. Rope, bucket, tea', party: 'Paid To', partyPlaceholder: 'Optional', showQuantity: false },
  'Other': { item: 'Item Name', itemPlaceholder: 'Optional details', party: 'Paid To / Vendor', partyPlaceholder: 'Optional', showQuantity: false },
};

const INCOME_META: Record<string, LedgerCategoryMeta> = {
  'Milk Sale (Direct)': { icon: 'water-outline', color: '#2563EB' },
  'Cattle Sale': { icon: 'leaf-outline', color: '#16A34A' },
  'Calf Sale': { icon: 'happy-outline', color: '#0891B2' },
  'Manure Sale': { icon: 'flower-outline', color: '#A16207' },
  'Goat / Poultry Sale': { icon: 'paw-outline', color: '#7C3AED' },
  'Egg Sale': { icon: 'egg-outline', color: '#D97706' },
  'Subsidy / Grant': { icon: 'ribbon-outline', color: '#DB2777' },
  'Other': { icon: 'pricetags-outline', color: '#6B7280' },
};

const INCOME_FIELDS: Record<string, LedgerFieldLabels> = {
  'Milk Sale (Direct)': { item: 'Milk Type', itemPlaceholder: 'e.g. Cow milk, spot sale', party: 'Buyer', partyPlaceholder: 'Buyer / hotel / dairy', showQuantity: true },
  'Cattle Sale': { item: 'Animal', itemPlaceholder: 'e.g. Cow Lakshmi (Tag 12)', party: 'Buyer', partyPlaceholder: 'Buyer name', showQuantity: true },
  'Calf Sale': { item: 'Calf', itemPlaceholder: 'e.g. Male calf, 3 months', party: 'Buyer', partyPlaceholder: 'Buyer name', showQuantity: true },
  'Manure Sale': { item: 'Load / Item', itemPlaceholder: 'e.g. Tractor load', party: 'Buyer', partyPlaceholder: 'Buyer name', showQuantity: true },
  'Goat / Poultry Sale': { item: 'Animal', itemPlaceholder: 'e.g. 2 goats, 10 hens', party: 'Buyer', partyPlaceholder: 'Buyer name', showQuantity: true },
  'Egg Sale': { item: 'Item', itemPlaceholder: 'e.g. Country eggs', party: 'Buyer', partyPlaceholder: 'Buyer name', showQuantity: true },
  'Subsidy / Grant': { item: 'Scheme', itemPlaceholder: 'e.g. NABARD dairy subsidy', party: 'Received From', partyPlaceholder: 'Department / bank', showQuantity: false },
  'Other': { item: 'Item Name', itemPlaceholder: 'Optional details', party: 'Received From', partyPlaceholder: 'Optional', showQuantity: false },
};

// Expenses and Income share screens, grids and forms — one set of components driven by
// this config and parameterised by the `type` route segment (/finance/expenses, /finance/income).
export const LEDGER_CONFIG = {
  expenses: {
    label: 'Expenses',
    singular: 'Expense',
    icon: 'wallet-outline',
    emoji: '💸',
    color: '#DC2626',
    tone: 'expense',
    api: expensesApi,
    defaultCategories: EXPENSE_CATEGORIES,
    categoryMeta: EXPENSE_META,
    fieldLabels: EXPENSE_FIELDS,
    defaultFieldLabels: { item: 'Item / Details', itemPlaceholder: 'e.g. Pump repair, spare parts', party: 'Paid To / Vendor', partyPlaceholder: 'Shop / person', showQuantity: true },
    dateField: 'expenseDate',
    partyField: 'vendor',
    partyHeader: 'Paid To / Vendor',
    viewPermission: 'expenses:view',
    managePermission: 'expenses:manage',
    queryKey: 'expenses',
    emptySubtitle: 'Record feed, medicine, doctor fee, salary, EB, petty cash or other costs for this month.',
    accountNamePlaceholder: 'e.g. Repairs, Transport, Insurance',
  },
  income: {
    label: 'Income',
    singular: 'Income',
    icon: 'trending-up-outline',
    emoji: '💰',
    color: '#16A34A',
    tone: 'income',
    api: incomeApi,
    defaultCategories: INCOME_CATEGORIES,
    categoryMeta: INCOME_META,
    fieldLabels: INCOME_FIELDS,
    defaultFieldLabels: { item: 'Item / Details', itemPlaceholder: 'What was sold / received', party: 'Received From', partyPlaceholder: 'Buyer / source', showQuantity: true },
    dateField: 'incomeDate',
    partyField: 'source',
    partyHeader: 'Received From',
    viewPermission: 'income:view',
    managePermission: 'income:manage',
    queryKey: 'income',
    emptySubtitle: 'Milk collections and product orders are counted automatically. Record other income here — cattle, calf, manure, eggs, subsidies.',
    accountNamePlaceholder: 'e.g. Rent received, Insurance claim',
  },
} as const satisfies Record<string, LedgerConfig>;

export type LedgerTypeSlug = keyof typeof LEDGER_CONFIG;

export const isLedgerTypeSlug = (value: string | undefined): value is LedgerTypeSlug =>
  !!value && value in LEDGER_CONFIG;

// Colours for user-added types (no hand-picked meta). Stable per name so a type keeps its colour.
const CUSTOM_PALETTE = ['#0EA5E9', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#EC4899', '#14B8A6', '#6366F1', '#84CC16', '#F97316'];

/** Icon + colour for any category name — hand-picked for seeded types, hashed palette for custom ones. */
export function getCategoryMeta(config: LedgerConfig, name: string | undefined | null): LedgerCategoryMeta {
  const key = String(name ?? '');
  const known = config.categoryMeta[key];
  if (known) return known;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return { icon: 'pricetags-outline', color: CUSTOM_PALETTE[h % CUSTOM_PALETTE.length] };
}

/** Form field hints for a category — per-type hints for seeded ones, generic for custom ones. */
export function getFieldLabels(config: LedgerConfig, name: string | undefined | null): LedgerFieldLabels {
  return config.fieldLabels[String(name ?? '')] ?? config.defaultFieldLabels;
}

/** Read the ledger date regardless of which ledger the row came from. */
export const ledgerDate = (row: Record<string, any>, config: LedgerConfig): string =>
  String(row[config.dateField] ?? '');

export const ledgerParty = (row: Record<string, any>, config: LedgerConfig): string =>
  String(row[config.partyField] ?? '');

/** Category label shown in lists — "Other" entries show their account name instead. */
export const ledgerCategoryLabel = (row: Record<string, any>): string =>
  row.category === 'Other' && row.accountName ? `Other - ${row.accountName}` : String(row.category ?? '');

/** Query keys touched when a ledger row changes (lists, summaries, dashboard and finance reports). */
export const ledgerInvalidationKeys = (config: LedgerConfig) => [
  [config.queryKey],
  [`${config.queryKey}-summary`],
  ['dashboard'],
  ['report-finance'],
  ['report-finance-ledger'],
  ['report-finance-trend'],
];

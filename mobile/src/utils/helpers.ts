import { format, getDaysInMonth, addDays } from 'date-fns';

export const formatDate = (date: Date | string) =>
  format(date instanceof Date ? date : new Date(date), 'yyyy-MM-dd');

export const formatDisplay = (date: Date | string) =>
  format(date instanceof Date ? date : new Date(date), 'dd MMM yyyy');

export const formatMonthYear = (year: number, month: number) =>
  format(new Date(year, month - 1), 'MMMM yyyy');

export const today = () => formatDate(new Date());

export const getMonthDays = (year: number, month: number) =>
  getDaysInMonth(new Date(year, month - 1));

export const getMonthDateArray = (year: number, month: number) => {
  const days = getMonthDays(year, month);
  return Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  });
};

export const initMonthlyDeliveries = (year: number, month: number) => {
  const dates = getMonthDateArray(year, month);
  const obj: Record<string, boolean> = {};
  dates.forEach((d) => { obj[d] = true; });
  return obj;
};

export const daysUntil = (targetDate: string) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const pregnancyStatusColor = (daysRemaining: number) => {
  if (daysRemaining < 0) return '#DC2626'; // overdue - red
  if (daysRemaining <= 30) return '#D97706'; // due soon - orange
  return '#16A34A'; // healthy - green
};

export const formatCurrency = (amount: number | string) =>
  `₹${parseFloat(String(amount)).toFixed(2)}`;

export const parseDeliveryData = (raw: string | Record<string, boolean>) => {
  if (typeof raw === 'string') return JSON.parse(raw);
  return raw;
};

/** The API returns IsActive as a real boolean, but our types model it as string; accept both. */
export const isActiveValue = (value: unknown): boolean => value === true || value === 'true';

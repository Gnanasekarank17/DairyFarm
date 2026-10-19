const { v4: uuidv4 } = require('uuid');
const { addDays, addMonths, format, getDaysInMonth, parseISO } = require('date-fns');

const generateId = () => uuidv4();

const formatDate = (date) => format(date instanceof Date ? date : new Date(date), 'yyyy-MM-dd');

const today = () => formatDate(new Date());

const getMonthDays = (year, month) => getDaysInMonth(new Date(year, month - 1));

// Returns array of all date strings for a given year/month
const getMonthDateArray = (year, month) => {
  const days = getMonthDays(year, month);
  return Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  });
};

// Default all days as delivered (true), returns object { "2026-06-01": true, ... }
const initMonthlyDeliveries = (year, month) => {
  const dates = getMonthDateArray(year, month);
  const obj = {};
  dates.forEach((d) => { obj[d] = true; });
  return obj;
};

// Default gestation is 9 months 10 days (~283 days) — the cow/buffalo figure. Pass
// `gestationDays` (from dbo.SpeciesBreedingConfig) for other species, e.g. ~150 for goats.
const calcExpectedCalvingDate = (matingDate, gestationDays) => {
  const d = matingDate instanceof Date ? matingDate : new Date(matingDate);
  if (gestationDays) return formatDate(addDays(d, gestationDays));
  return formatDate(addDays(addMonths(d, 9), 10));
};

// Days between one mating and the next heat/cycle check.
const MATING_CYCLE_DAYS = 21;

// Next mating cycle check date = mating date + cycleDays (defaults to the cow/buffalo 21-day figure).
const calcNextMatingCheck = (matingDate, cycleDays = MATING_CYCLE_DAYS) => {
  const d = matingDate instanceof Date ? matingDate : new Date(matingDate);
  return formatDate(addDays(d, cycleDays));
};

const daysUntil = (targetDate) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};

const generateInvoiceNumber = (year, month, customerId) => {
  const m = String(month).padStart(2, '0');
  const suffix = customerId.slice(-4).toUpperCase();
  return `INV-${year}${m}-${suffix}`;
};

module.exports = {
  generateId,
  formatDate,
  today,
  getMonthDays,
  getMonthDateArray,
  initMonthlyDeliveries,
  calcExpectedCalvingDate,
  calcNextMatingCheck,
  MATING_CYCLE_DAYS,
  daysUntil,
  generateInvoiceNumber,
};

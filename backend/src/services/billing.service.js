const { queryOne, query, NVarChar, SmallInt, TinyInt } = require('../database/db');
const { getMonthDateArray, today } = require('../utils/helpers');
const { getEffectiveRate } = require('../controllers/milkRates.controller');

const parseJson = (value, fallback) => {
  try { return typeof value === 'string' ? JSON.parse(value) : (value || fallback); }
  catch { return fallback; }
};

const getBillingCutoffDate = (year, month) => {
  const todayStr = today();
  const [currentYear, currentMonth] = todayStr.split('-').map(Number);
  if (year === currentYear && month === currentMonth) return todayStr;
  if (year > currentYear || (year === currentYear && month > currentMonth)) return null;

  const dates = getMonthDateArray(year, month);
  return dates[dates.length - 1];
};

const getMonthlyDeliveryCharge = async () => {
  const row = await queryOne("SELECT [Value] FROM dbo.Settings WHERE [Key]='monthlyDeliveryCharge'");
  return parseFloat(row?.Value || 0) || 0;
};

const calculateCustomerMonthBill = async (customer, year, month) => {
  const cutoffDate = getBillingCutoffDate(year, month);
  const dates = cutoffDate ? getMonthDateArray(year, month).filter((date) => date <= cutoffDate) : [];
  const dailyQuantity = parseFloat(customer.DailyQuantity || 0);
  // Prefer the milk rate effective on the billing month's start date so historical
  // invoices retain the applicable rate; fall back to the customer's own rate.
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const milkType = customer.MilkType || 'Cow Milk';
  const effectiveRate = await getEffectiveRate(milkType, monthStart);
  const ratePerLiter = effectiveRate !== null ? effectiveRate : parseFloat(customer.RatePerLiter || 0);

  const delivery = await queryOne(
    'SELECT DeliveryData, ReasonData, QuantityData FROM dbo.Deliveries WHERE CustomerId=@customerId AND [Year]=@year AND [Month]=@month',
    {
      customerId: { type: NVarChar(36), value: customer.Id },
      year: { type: SmallInt, value: year },
      month: { type: TinyInt, value: month },
    }
  );

  const deliveryData = parseJson(delivery?.DeliveryData, {});
  const reasonData = parseJson(delivery?.ReasonData, {});
  const quantityData = parseJson(delivery?.QuantityData, {});
  const requests = (await query(`
    SELECT RequestDate, RequestType, ExtraQuantity, Reason, Status, ActionReason
    FROM dbo.CustomerDeliveryRequests
    WHERE CustomerId=@customerId AND RequestDate>=@startDate AND RequestDate<=@endDate AND Status='Approved'
  `, {
    customerId: { type: NVarChar(36), value: customer.Id },
    startDate: { type: NVarChar(20), value: `${year}-${String(month).padStart(2, '0')}-01` },
    endDate: { type: NVarChar(20), value: cutoffDate || `${year}-${String(month).padStart(2, '0')}-31` },
  })).recordset;

  const approvedCancelDates = new Set(
    requests.filter((request) => request.RequestType === 'cancel_delivery').map((request) => request.RequestDate)
  );
  const extraByDate = requests
    .filter((request) => request.RequestType === 'extra_milk')
    .reduce((acc, request) => {
      acc[request.RequestDate] = (acc[request.RequestDate] || 0) + parseFloat(request.ExtraQuantity || 0);
      return acc;
    }, {});

  let deliveredDays = 0;
  let missedDays = 0;
  let baseLiters = 0;
  let extraLiters = 0;
  const missedDetails = [];
  const extraDetails = [];

  dates.forEach((date) => {
    const cancelled = approvedCancelDates.has(date);
    const delivered = !cancelled && deliveryData[date] !== false;
    if (delivered) {
      deliveredDays++;
      // Use the actual recorded quantity for the day when present (Partial / actual-vs-requested §9.3),
      // otherwise fall back to the customer's daily quantity.
      const actual = quantityData[date];
      const dayLiters = (actual === undefined || actual === null || actual === '') ? dailyQuantity : parseFloat(actual) || 0;
      baseLiters += dayLiters;
    } else {
      missedDays++;
      missedDetails.push({ date, reason: cancelled ? 'Customer cancelled milk' : reasonData[date]?.reason || '' });
    }

    const extra = extraByDate[date] || 0;
    if (extra > 0 && delivered) {
      extraLiters += extra;
      extraDetails.push({ date, quantity: extra });
    }
  });

  const totalQuantity = baseLiters + extraLiters;
  const milkAmount = totalQuantity * ratePerLiter;
  // Charge delivery once per month, only when the customer actually took milk.
  const deliveryCharge = deliveredDays > 0 ? await getMonthlyDeliveryCharge() : 0;
  return {
    deliveredDays,
    missedDays,
    baseLiters,
    extraLiters,
    totalQuantity,
    milkAmount,
    deliveryCharge,
    amount: milkAmount + deliveryCharge,
    ratePerLiter,
    dailyQuantity,
    cutoffDate,
    missedDetails,
    extraDetails,
  };
};

module.exports = { calculateCustomerMonthBill, getBillingCutoffDate, getMonthlyDeliveryCharge };
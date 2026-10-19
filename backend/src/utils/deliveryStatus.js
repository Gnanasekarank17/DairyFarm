// Canonical daily delivery statuses (spec §9.2).
const DELIVERY_STATUSES = [
  'Scheduled',
  'Delivered',
  'Partial',
  'Missed',
  'CustomerUnavailable',
  'Holiday',
  'Cancelled',
  'ExtraDelivery',
];

// Statuses that mean milk was NOT delivered (excluded from billing as delivered days).
const NOT_DELIVERED_STATUSES = new Set(['Missed', 'CustomerUnavailable', 'Holiday', 'Cancelled']);

const ALIASES = {
  scheduled: 'Scheduled',
  delivered: 'Delivered',
  partial: 'Partial',
  missed: 'Missed',
  customerunavailable: 'CustomerUnavailable',
  'customer unavailable': 'CustomerUnavailable',
  unavailable: 'CustomerUnavailable',
  holiday: 'Holiday',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
  extradelivery: 'ExtraDelivery',
  'extra delivery': 'ExtraDelivery',
  extra: 'ExtraDelivery',
};

// Normalize an input status to its canonical form, or null if unrecognized.
const normalizeDeliveryStatus = (status) => {
  if (status === null || status === undefined) return null;
  const key = String(status).trim().toLowerCase();
  if (!key) return null;
  return ALIASES[key] || (DELIVERY_STATUSES.includes(String(status).trim()) ? String(status).trim() : null);
};

// Does a canonical status count as a delivered day for billing?
const statusIsDelivered = (status) => {
  const s = normalizeDeliveryStatus(status);
  if (!s) return true; // unknown -> follow the "assume delivered" default
  return !NOT_DELIVERED_STATUSES.has(s);
};

// Derive the boolean delivered flag from a status.
const statusToDelivered = (status) => statusIsDelivered(status);

// Derive a default status from the legacy boolean delivered flag.
const deliveredToStatus = (delivered) => (delivered === false ? 'Missed' : 'Delivered');

module.exports = {
  DELIVERY_STATUSES,
  NOT_DELIVERED_STATUSES,
  normalizeDeliveryStatus,
  statusIsDelivered,
  statusToDelivered,
  deliveredToStatus,
};

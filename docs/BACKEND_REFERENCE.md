# Backend Reference — `backend/`

Node.js 20 + Express 4 + SQL Server (mssql). Plain JavaScript (CommonJS). Everything below is relative to `backend/`.

Contents: [Boot](#1-boot-sequence) · [Environment](#2-environment-variables) · [Routes](#3-api-routes) · [Controllers](#4-controller-blueprint) · [Services](#5-services) · [Middleware](#6-middleware) · [Config](#7-config) · [Database](#8-database) · [Utils & seeds](#9-utils-and-seed-scripts) · [Tests](#10-tests) · [Docker](#11-dockerfile) · [Known issues](#12-known-issues)

---

## 1. Boot sequence

`src/index.js`:

1. `src/config/index.js` loads `.env` (dotenv) when first required.
2. Express app is created; middleware chain attached in this order: `helmet()` → `cors({ origin: '*' })` → `express-rate-limit` (15 min window, `RATE_LIMIT_MAX` default 200, global) → `compression()` → `morgan('combined')` piped to winston → `express.json({ limit: '10mb' })` → `express.urlencoded`.
3. `GET /health` → `{ status: 'ok', ts }` (no auth, mounted at root, **not** under `/api/v1`).
4. `app.use('/api/v1', routes)` from `src/routes/index.js`.
5. 404 → `{ success:false, message:'Route not found' }`; error handler → 500 `{ success:false, message:'Internal server error' }`.
6. `start()` awaits `getPool()`; on DB failure it logs and `process.exit(1)`.
7. `require('./services/scheduler')` registers cron jobs; `app.listen(PORT)`.

Route mounts (all under `/api/v1`): `/auth`, `/users`, `/customers`, `/customer-requests`, `/deliveries`, `/invoices`, `/payments`, `/cows`, `/goats`, `/hens`, `/ducks`, `/breeding`, `/calving`, `/milk-production`, `/dashboard`, `/reports`, `/notifications`, `/settings`, `/products`, `/milk-rates`, `/month-closures`, `/orders`, `/subscriptions`, `/backup`, `/expenses`, `/income`, `/medicines`.

Scripts (`package.json`):

| Script | Command |
|---|---|
| `npm start` | `node src/index.js` |
| `npm run dev` | `nodemon src/index.js` |
| `npm run db:migrate` | `node src/database/migrate.js` |
| `npm run db:seed` | `node src/utils/seedData.js` |
| `npm run db:seed:test-users` | `node src/utils/seedTestUsers.js` |
| `npm run db:setup` | migrate, then seed |

---

## 2. Environment variables

| Var | Default | Purpose |
|---|---|---|
| `PORT` | 3000 | HTTP port |
| `NODE_ENV` | development | logger level (info in production, else debug); OTP dev mode when not production |
| `RATE_LIMIT_MAX` | 200 | global requests per 15 min |
| `DB_SERVER` | host.docker.internal | SQL Server host |
| `DB_PORT` | 1433 | SQL port |
| `DB_INSTANCE` | '' | named instance (e.g. `SQLEXPRESS`); leave blank when using a fixed port |
| `DB_NAME` | DairyFarmDB | database |
| `DB_USER` / `DB_PASSWORD` | dairy_app / (hard-coded default) | SQL login |
| `DB_ENCRYPT` | false | encrypt only when `'true'` |
| `DB_TRUST_SERVER_CERT` | true | off only when `'false'` |
| `DB_CONNECTION_TIMEOUT` / `DB_REQUEST_TIMEOUT` | 30000 / 15000 | mssql timeouts (ms) |
| `JWT_SECRET` | (hard-coded default) | signs JWTs; also HMAC key for OTP hashes |
| `JWT_EXPIRES_IN` | 30d | token lifetime (PIN login forces 12h) |
| `ADMIN_PIN` | 1234 | PIN login → admin |
| `STAFF_PIN` | '' | PIN login → supervisor (disabled when empty) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | — / 587 | nodemailer transport (`secure` when port 465) |
| `EMAIL_FROM` | — | sender; fallback business e-mail on invoice PDF |
| `BUSINESS_EMAIL` | — | business e-mail on invoice PDF |
| `BUSINESS_NAME` / `BUSINESS_ADDRESS` / `BUSINESS_PHONE` / `BUSINESS_GST` | 'Dairy Farm' / '' | business profile (overridden by `Settings` rows) |
| `FAST2SMS_API_KEY` | — | OTP SMS provider |
| `GOOGLE_CLIENT_ID` | — | audience for Google ID-token verification |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_PRIVATE_KEY` / `GOOGLE_DRIVE_FOLDER_ID` | — | used only by the unused Google Drive/Sheets services |
| `EXPO_ACCESS_TOKEN` | — | loaded into config but never used |
| `WHATSAPP_ACCESS_TOKEN` (or `WHATSAPP_TOKEN`) / `WHATSAPP_PHONE_NUMBER_ID` / `WHATSAPP_API_VERSION` | — / — / v20.0 | Meta WhatsApp Cloud API |
| `TEST_USER_PASSWORD` | Test@1234 | seedTestUsers + roleAccessTest |
| `API_BASE`, `CUST_MOBILE`, `CUST_PASS` | `http://localhost:$PORT/api/v1`, 9600156909, Customer@123 | tests only |

`GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_SPREADSHEET_ID` appear in `.env.example` but nothing reads them.

---

## 3. API routes

Legend: **auth** = `authenticate` (JWT required); **perm(X)** = `requirePermission('X')`; **admin** = `requireAdmin`. No route uses `validate(schema)`; validation is hand-written in controllers. Response envelope: `{ success, message, data }`.

### Auth — `/auth`
| Method & path | Handler | Guard |
|---|---|---|
| POST `/auth/google` | auth.googleSignIn | public |
| POST `/auth/pin` | auth.pinLogin | public |
| POST `/auth/mobile-login` | auth.mobilePasswordLogin | public |
| POST `/auth/otp/request` | otp.requestOtp | public |
| POST `/auth/otp/resend` | otp.resendOtp | public |
| POST `/auth/otp/verify` | otp.verifyOtp | public |
| GET `/auth/otp/status` | otp.getStatus | public |
| PUT `/auth/push-token` | auth.updatePushToken | auth |
| GET `/auth/me` | auth.me | auth |

### Users — `/users` (router-level: auth + perm(users:manage) → admin only)
| Method & path | Handler |
|---|---|
| GET `/users` | users.getAll |
| GET `/users/roles` | users.getRoles |
| GET `/users/:id` | users.getById |
| POST `/users` | users.create |
| PUT `/users/:id` | users.update |
| PATCH `/users/:id/toggle` | users.toggleActive |
| DELETE `/users/:id` | users.remove |

### Customers — `/customers` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| GET `/customers?active=` | customers.getAll | perm(customers:view) |
| GET `/customers/:id` | customers.getById | perm(customers:view) |
| POST `/customers` | customers.create | perm(customers:manage) |
| PUT `/customers/:id` | customers.update | perm(customers:manage) |
| PATCH `/customers/:id/toggle` | customers.toggleActive | perm(customers:manage) |
| DELETE `/customers/:id` | customers.remove | perm(customers:manage) |

### Customer requests — `/customer-requests` (auth; RBAC inside controller)
| Method & path | Handler | Rule |
|---|---|---|
| GET `/customer-requests/:year/:month?customerId=` | customerRequests.getMonthly | `customer_requests:view`; customers see only linked customers |
| POST `/customer-requests` | customerRequests.create | role customer, or `customer_requests:manage` |
| PATCH `/customer-requests/:id/status` | customerRequests.updateStatus | `customer_requests:manage`; disputes admin only |

### Deliveries — `/deliveries` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| GET `/deliveries/statuses` | deliveries.getStatuses | perm(deliveries:view) |
| GET `/deliveries/today` | deliveries.getTodayDeliveries | perm(deliveries:view) |
| GET `/deliveries/:year/:month` | deliveries.getAllMonthly | perm(deliveries:view) |
| GET `/deliveries/:customerId/:year/:month` | deliveries.getMonthlyDelivery | controller: `deliveries:view` or a customer linked to `customerId` |
| PUT `/deliveries/:customerId/:year/:month/day` | deliveries.updateDeliveryDay | perm(deliveries:manage) + month lock |
| PUT `/deliveries/:customerId/:year/:month/mark-all` | deliveries.markEntireMonth | perm(deliveries:manage) + month lock |

### Invoices — `/invoices` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| POST `/invoices/generate` | invoices.generateForMonth | perm(billing:manage) + month lock |
| GET `/invoices/month/:year/:month/message-links` | invoices.getMonthlyMessageLinks | perm(billing:view) |
| POST `/invoices/month/:year/:month/send-whatsapp` | invoices.sendMonthlyWhatsApp | perm(billing:manage) |
| GET `/invoices?year&month&status&customerId` | invoices.getAll | perm(billing:view) |
| GET `/invoices/:id` | invoices.getById | perm(billing:view) |
| GET `/invoices/:id/pdf` | invoices.downloadPDF | perm(billing:view) |
| POST `/invoices/:id/email` | inline: build PDF, e-mail HTML + attachment to Customer.Email | perm(billing:manage) |
| GET `/invoices/:id/whatsapp` | invoices.getWhatsAppLink | perm(billing:view) |

### Payments — `/payments` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| GET `/payments?customerId&invoiceId&status` | payments.getAll | perm(billing:view) |
| GET `/payments/outstanding` | payments.getOutstanding | perm(billing:view) |
| GET `/payments/:id` | payments.getById | perm(billing:view) |
| POST `/payments` | payments.recordPayment | perm(billing:manage) |

### Cows — `/cows` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| GET `/cows?status&gender&animalType` | cows.getAll | perm(cattle:view) |
| GET `/cows/:id` | cows.getById | perm(cattle:view) |
| POST `/cows` | cows.create | perm(cattle:manage) |
| PUT `/cows/:id` | cows.update | perm(cattle:manage) |
| DELETE `/cows/:id` | cows.remove | perm(cattle:manage) |
| GET `/cows/:id/health` | cows.getHealthRecords | perm(cattle:view) |
| POST `/cows/:id/health` | cows.addHealthRecord | perm(cattle:manage) |

### Goats — `/goats` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| GET `/goats?status&gender` | goats.getAll | perm(cattle:view) |
| GET `/goats/:id` | goats.getById | perm(cattle:view) |
| POST `/goats` | goats.create | perm(cattle:manage) |
| PUT `/goats/:id` | goats.update | perm(cattle:manage) |
| DELETE `/goats/:id` | goats.remove | perm(cattle:manage) |
| GET `/goats/:id/weights` | goats.getWeights | perm(cattle:view) |
| POST `/goats/:id/weights` | goats.addWeight | perm(cattle:manage) |
| DELETE `/goats/:id/weights/:weightId` | goats.removeWeight | perm(cattle:manage) |

### Hens `/hens` and Ducks `/ducks` (auth; identical, factory controllers)
| Method & path | Handler | Guard |
|---|---|---|
| GET `/hens` | getAll | perm(cattle:view) |
| GET `/hens/:id` | getById | perm(cattle:view) |
| POST `/hens` | create | perm(cattle:manage) |
| PUT `/hens/:id` | update | perm(cattle:manage) |
| DELETE `/hens/:id` | remove | perm(cattle:manage) |

### Breeding — `/breeding` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| POST `/breeding` | breeding.createBreedingRecord | perm(cattle:manage) |
| GET `/breeding?cowId&status&conception` | breeding.getAll | perm(cattle:view) |
| GET `/breeding/upcoming-calving` | breeding.getUpcomingCalving | perm(cattle:view) |
| GET `/breeding/:id` | breeding.getById | perm(cattle:view) |
| PUT `/breeding/:id/confirm-pregnancy` | breeding.confirmPregnancy (legacy) | perm(cattle:manage) |
| PUT `/breeding/:id/conception` | breeding.setConception | perm(cattle:manage) |

### Calving — `/calving` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| POST `/calving` | calving.recordCalving | perm(cattle:manage) |
| GET `/calving?cowId` | calving.getAll | perm(cattle:view) |
| GET `/calving/:id` | calving.getById | perm(cattle:view) |

### Milk production — `/milk-production` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| POST `/milk-production` | milkProduction.record | perm(cattle:manage) |
| GET `/milk-production?cowId&from&to` | milkProduction.getAll | perm(cattle:view) |
| GET `/milk-production/summary?year&month` | milkProduction.getSummary | perm(cattle:view) |
| GET `/milk-production/cow/:cowId?from&to` | milkProduction.getCowHistory | perm(cattle:view) |

### Dashboard — `/dashboard` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| GET `/dashboard/summary` | dashboard.getSummary | perm(dashboard:view); customers are forwarded to customer summary |
| GET `/dashboard/customer-summary` | dashboard.getCustomerSummary | perm(dashboard:view); role must be customer |

### Reports — `/reports` (router-level: auth + perm(reports:view); inline handlers)
| Method & path | Returns |
|---|---|
| GET `/reports/monthly-excel/:year/:month` | `.xlsx` attachment of the month's invoices with a TOTAL row |
| GET `/reports/delivery-exceptions` | AuditLog rows with Action `UPDATE_DELIVERY` joined to user name |
| GET `/reports/pending-payments` | Pending/Partial invoices + customer contact + `totalPending` |
| GET `/reports/pregnant-cows` | Pregnant PregnancyRecords JOIN CowMaster + breeding info + `daysRemaining` |
| GET `/reports/milk-production/:year/:month` | per-cow SUM/AVG/COUNT + `grandTotal` |
| GET `/reports/monthly-finance/:year/:month` | `finance.getMonthSummary` |
| GET `/reports/finance-ledger/:year/:month` | `finance.getLedger` |
| GET `/reports/finance-trend/:year` | `{ year, months: finance.getYearTrend }` |

### Notifications — `/notifications` (auth; inline)
| Method & path | Does | Guard |
|---|---|---|
| POST `/notifications/payment-reminder/:invoiceId` | pushes "Payment Reminder" to all active users with a token | perm(billing:manage) |
| POST `/notifications/breeding-alert` | counts pregnancies due ≤30 days, pushes to all tokens, returns `{ alertsSent }` | perm(cattle:manage) |

### Settings — `/settings` (auth; inline)
| Method & path | Does | Guard |
|---|---|---|
| GET `/settings` | all `Settings` rows as `{ key: value }` | auth only (any role) |
| PUT `/settings` | upserts every body key/value | perm(settings:manage) |

### Products — `/products` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| GET `/products?active=` | products.getAll (Cost/MinStock hidden without settings:manage) | auth |
| GET `/products/low-stock` | products.getLowStock | perm(settings:manage) |
| POST `/products` | products.create | perm(settings:manage) |
| PUT `/products/:id` | products.update | perm(settings:manage) |
| PATCH `/products/:id/stock` | products.adjustStock | perm(settings:manage) |
| PATCH `/products/:id/toggle` | products.toggleActive | perm(settings:manage) |
| DELETE `/products/:id` | products.remove | perm(settings:manage) |

### Milk rates — `/milk-rates` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| GET `/milk-rates?milkType=` | milkRates.getAll | perm(billing:view) |
| GET `/milk-rates/effective?milkType&date` | milkRates.getEffective | perm(billing:view) |
| POST `/milk-rates` | milkRates.create | perm(settings:manage) |
| PUT `/milk-rates/:id` | milkRates.update | perm(settings:manage) |
| DELETE `/milk-rates/:id` | milkRates.remove | perm(settings:manage) |

### Month closures — `/month-closures` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| GET `/month-closures?year=` | monthClosures.getAll | perm(billing:view) |
| GET `/month-closures/:year/:month` | monthClosures.getStatus | perm(billing:view) |
| POST `/month-closures/:year/:month/close` | monthClosures.close | perm(billing:manage) |
| POST `/month-closures/:year/:month/reopen` | monthClosures.reopen | admin |

### Orders — `/orders` (auth; RBAC mostly in controller)
| Method & path | Handler | Rule |
|---|---|---|
| GET `/orders?status&customerId` | orders.getAll | `orders:view` sees all; customer sees own; else 403 |
| GET `/orders/:id` | orders.getById | `orders:view` or owner |
| POST `/orders` | orders.create | customer, or `orders:create`/`orders:manage` |
| PATCH `/orders/:id/status` | orders.updateStatus | perm(orders:manage) |
| POST `/orders/:id/cancel` | orders.cancel | manager, or owner while Pending |

### Subscriptions — `/subscriptions` (auth)
| Method & path | Handler | Rule |
|---|---|---|
| GET `/subscriptions?status&customerId` | subscriptions.getAll | `subscriptions:view` or own rows |
| GET `/subscriptions/:id` | subscriptions.getById | view permission or owner |
| GET `/subscriptions/:id/history` | subscriptions.getHistory | view permission or owner |
| POST `/subscriptions` | subscriptions.create | customer, or create/manage permission |
| PUT `/subscriptions/:id` | subscriptions.amend | perm(subscriptions:manage) |
| PATCH `/subscriptions/:id/status` | subscriptions.updateStatus | perm(subscriptions:manage) |
| POST `/subscriptions/:id/pause` | subscriptions.pause | manager or owner |
| POST `/subscriptions/:id/resume` | subscriptions.resume | manager or owner |
| POST `/subscriptions/:id/cancel` | subscriptions.cancel | manager or owner |

### Backup — `/backup` (router-level: auth + perm(backup:manage); inline)
| Method & path | Does |
|---|---|
| POST `/backup/create` | downloads JSON of Customers, Invoices, Deliveries, CowMaster as `dairy-backup-YYYY-MM-DD.json` |
| GET `/backup/list` | placeholder: `[]` with message "Backups are generated on-demand" |

### Expenses `/expenses` and Income `/income` (router-level: auth + perm(expenses:view / income:view); ledger factory)
| Method & path | Handler | Extra guard |
|---|---|---|
| GET `/?year&month&category&from&to` | getAll | — |
| GET `/summary/:year/:month` | getMonthlySummary | — |
| GET `/categories` | getCategories | — |
| POST `/categories` | createCategory | perm(*:manage) |
| DELETE `/categories/:id` | removeCategory | perm(*:manage) |
| GET `/:id` | getById | — |
| POST `/` | create | perm(*:manage) |
| PUT `/:id` | update | perm(*:manage) |
| DELETE `/:id` | remove | perm(*:manage) |

### Medicines — `/medicines` (auth)
| Method & path | Handler | Guard |
|---|---|---|
| GET `/medicines?active&animalType` | medicines.getAll | perm(cattle:view) |
| GET `/medicines/:id` | medicines.getById | perm(cattle:view) |
| POST `/medicines` | medicines.create | perm(cattle:manage) |
| PUT `/medicines/:id` | medicines.update | perm(cattle:manage) |
| PATCH `/medicines/:id/toggle` | medicines.toggleActive | perm(cattle:manage) |
| DELETE `/medicines/:id` | medicines.remove | perm(cattle:manage) |

---

## 4. Controller blueprint

All handlers are `async (req, res)` using `success(res, data, message, status)` / `error(res, message, status, errors)` from `utils/response.js`. Most list/detail endpoints return raw SQL rows (PascalCase). Orders, subscriptions, customer requests, users, customer dashboard and ledger summaries return camelCase mapped objects.

### Factories

**`animalMaster.factory.js` → `createAnimalMasterController(tableName, label)`**
Returns `{ getAll, getById, create, update, remove }` for a single-table animal master (no breeding/milk logic). `getAll` accepts `?status=`; body fields: `name, tagNumber, breed, color, dateOfBirth, purchaseDate, purchaseCost, currentStatus ('Active'), photoUrl, notes`. Used by `hens.controller.js` (`HenMaster`) and `ducks.controller.js` (`DuckMaster`). Goats do **not** use it.

**`ledger.factory.js` → `createLedgerController({ ledger, table, singular, dateColumn, dateField, partyColumn, partyField, categories })`**
Returns `{ CATEGORIES, getAll, getMonthlySummary, getById, create, update, remove, getCategories, createCategory, removeCategory }`.
- `parseBody`: `category` must match an active `LedgerCategories` row (case-insensitive); `amount > 0`; `accountName` required when category is `Other`; date `YYYY-MM-DD` (default today); `paymentMode` ∈ PAYMENT_MODES (default Cash); optional `itemName, party, quantity, unit, notes`.
- `getAll` filters `?year&month` | `?year` | `?from&to`, plus `?category`.
- `getMonthlySummary` → `{ year, month, byCategory:[{ category, total, count }], grandTotal }`.
- Used by `expenses.controller.js` (`dbo.Expenses`, ExpenseDate/Vendor) and `income.controller.js` (`dbo.Income`, IncomeDate/Source).

### auth.controller.js
| Function | Purpose | Input | Returns |
|---|---|---|---|
| `googleSignIn` | verify Google ID token; create/update user. First user ever → admin, later new users → supervisor | `idToken` | `{ token, user }` |
| `pinLogin` | `ADMIN_PIN` → admin "Owner"; `STAFF_PIN` → supervisor "Staff"; id `pin-<role>`; 12 h token | `pin` | `{ token, user }` |
| `mobilePasswordLogin` | active user by mobile; bcrypt compare (legacy plaintext accepted once, then re-hashed) | `mobile, password` | `{ token, user }` |
| `updatePushToken` | store Expo push token | `pushToken` | null |
| `me` | decoded JWT payload | — | user |

`user` = `{ id, name, email, mobile, role, permissions[], customerIds[] }`; `syncUserRole` keeps `UserRoles` in step.

### otp.controller.js
| Function | Purpose | Returns |
|---|---|---|
| `requestOtp` / `resendOtp` | 60 s cooldown, max 5 sends / 15 min (429), invalidate older codes, store HMAC hash, send SMS | `{ mobile, purpose, expiresAt, expiresInSeconds, devCode? }` |
| `verifyOtp` | checks latest unconsumed code: expiry, ≤5 attempts, timing-safe compare; marks Verified | `{ mobile, purpose, verified:true }` |
| `getStatus` | whether a verified OTP exists | `{ mobile, purpose, verified }` |

### users.controller.js
| Function | Rules |
|---|---|
| `getAll` | `[{ id, name, email, mobile, role, isActive, lastLogin, createdAt, updatedAt, permissions[] }]` |
| `getRoles` | DB roles with RolePermissions |
| `getById` | one user |
| `create` | mobile must be 10 digits; mobile/email unique (409); bcrypt cost 10; syncs UserRoles |
| `update` | partial; optional password reset |
| `toggleActive` | flips IsActive |
| `remove` | cannot delete self or last active admin; deletes UserRoles + CustomerUserAccess first |

### customers.controller.js
`getAll(?active)`, `getById`, `create` (DailyQuantity = morning + eveing; defaults: milkType 'Cow Milk', ratePerLiter 60, billingMode 'Monthly Full Check'), `update`, `toggleActive`, `remove` (hard delete).

### customerRequests.controller.js
Request types `extra_milk`, `cancel_delivery`, `dispute_delivery`.
| Function | Rules |
|---|---|
| `getMonthly` | requests for the month; customers see only linked customers; mapped camelCase |
| `create` | upserts one row per date (`requestDate`..`endDate`). Extra/cancel: date ≥ today. Cancel: reason required, range ≤ 45 days. Extra: quantity > 0. Dispute: date not in future, in current or previous month, `claimedStatus` + reason required. Pushes to managers/delivery staff (disputes → admin/supervisor/manager) |
| `updateStatus` | Approve/Reject (reject needs reason). Disputes admin-only; approving a dispute calls `deliveries.applyDeliveryCorrection` (month lock → 423). Writes AuditLog `CUSTOMER_REQUEST_STATUS` |

### deliveries.controller.js
Storage: one `Deliveries` row per customer per month with JSON maps `DeliveryData`, `ReasonData`, `StatusData`, `QuantityData`. `getOrCreate` builds the row on first access ('Monthly Full Check' → all days delivered).
| Function | Rules |
|---|---|
| `getMonthlyDelivery` | one customer's month (customer access checked) |
| `getAllMonthly` | every active customer + CustomerName, Mobile |
| `updateDeliveryDay` | body `{ date, delivered?, status?, quantity?, reason, comments }`; status normalised; explicit `delivered` wins; `guardMonthWrite` first; recalculates totals; AuditLog `UPDATE_DELIVERY` when a day becomes not delivered |
| `markEntireMonth` | `{ delivered }` for all days; month lock |
| `getStatuses` | canonical status enum |
| `getTodayDeliveries` | `[{ CustomerId, CustomerName, Mobile, Address, DailyQuantity, Delivered }]` |
| `applyDeliveryCorrection` (exported helper) | dispute approval; month lock; AuditLog `DISPUTE_DELIVERY_CORRECTION` |

### invoices.controller.js
| Function | Rules |
|---|---|
| `generateForMonth` | month-locked; per active customer (or one) runs `billing.calculateCustomerMonthBill`; inserts or recalculates. Invoice number `INV-YYYYMM-<last 6 of customerId>`; new → PaymentStatus Pending; `MissedDetails` JSON `{ missed, extras, cutoffDate }`. Returns `{ generated, invoices[] }` |
| `getAll` | `?year&month&status&customerId` |
| `getById` | one invoice |
| `downloadPDF` | streams A4 PDF from `invoicePdf.buildInvoicePdf` |
| `getWhatsAppLink` | `{ url, link, smsUrl, mobile, invoiceNumber, message }` |
| `getMonthlyMessageLinks` | `{ year, month, monthName, count, totalAmount, messages[] }` |
| `sendMonthlyWhatsApp` | Cloud API per invoice or link fallback → `{ sent, failed, skipped, totalAmount, results[] }` |

### payments.controller.js
`recordPayment` (`invoiceId, amountPaid, paymentMode='Cash', paymentDate, notes`; sets invoice Paid if amountPaid ≥ Amount else Partial), `getAll(?customerId&invoiceId&status)`, `getById`, `getOutstanding` → `{ invoices[], totalOutstanding }`. Payments are **not cumulative** (see Known issues).

### cows.controller.js
CowMaster holds `AnimalType` Cow | Buffalo, `Gender` Female (default) | Male. `getAll(?status&gender&animalType)`, `getById` (+ `healthRecords[]`, last 30 `milkProduction[]`), `create`/`update` (`name, tagNumber, breed, color, gender, animalType, dateOfBirth, purchaseDate, purchaseCost, currentStatus, photoUrl, notes`), `remove`, `addHealthRecord` (`recordType, recordDate, description, veterinarian, nextDueDate, documents, notes`), `getHealthRecords`.

### goats.controller.js
`getAll(?status&gender)` (+ `CurrentWeightKg, LastWeighedDate, PreviousWeightKg` via OUTER APPLY), `getById` (+ `weightHistory[]`), `create`/`update` (cow fields minus animalType), `remove`, `getWeights`, `addWeight` (`weightKg > 0, weighedDate, notes`), `removeWeight`.

### breeding.controller.js
Species Cow | Buffalo | Goat (dispatch via `utils/animalLookup`). Pushes go to admin, supervisor, cattlecaretaker.
| Function | Rules |
|---|---|
| `createBreedingRecord` | rejects males; `NextCheckDate = mating + HeatCycleDays` (21 cow/buffalo, 19 goat); ConceptionStatus Pending; CycleNumber = previous + 1; animal → **Mated**; push |
| `getAll(?cowId&status&conception)` | LEFT JOIN pregnancy + CowName, TagNumber, daysUntilCheck, daysUntilCalving |
| `getById` | one record + name |
| `confirmPregnancy` (legacy) | updates an existing PregnancyRecord only |
| `getUpcomingCalving` | Pregnant, ordered by ExpectedCalvingDate |
| `setConception` | `conceived=true` → Conceived, create/update PregnancyRecord with `ExpectedCalvingDate = MatingDate + avg(GestationDaysMin, GestationDaysMax)` (283 cow/buffalo, 150 goat), animal → Pregnant. `false` → NotConceived, insert new cycle (mating = `nextMatingDate` or old NextCheckDate), animal → Mated |

### calving.controller.js
`recordCalving` (`cowId, species, deliveryDate, deliveryType='Normal', numberOfCalves, complications, notes, calves[{ name, gender, birthDate, birthWeight, healthStatus, notes }]`; pregnancy → Calved; animal → Active), `getAll(?cowId)` (+ calves[]), `getById`.

### milkProduction.controller.js
`record` (upsert per cow per date; Total = morning + evening; rejects males), `getAll(?cowId&from&to)`, `getSummary(?year&month)` → `{ cows[], totalFarmMilk, period }`, `getCowHistory`.

### medicines.controller.js
`getAll(?active&animalType)`, `getById`, `create`/`update` (name unique → 409; `animalTypes` normalised to CSV over Cow, Goat, Hen, Duck), `toggleActive`, `remove`.

### milkRates.controller.js
`getAll(?milkType)`, `getEffective(?milkType!, date)`, `create` (auto-closes previous Active rate with `EffectiveTo = new EffectiveFrom − 1 day`), `update` (`ratePerLiter, notes, status`), `remove`, exported helper `getEffectiveRate(milkType, date)` used by billing.

### monthClosures.controller.js
`getAll(?year)`, `getStatus` → `{ year, month, status: Open|Closed, record }`, `close` (409 if closed; AuditLog `CLOSE_MONTH`), `reopen` (admin; reason required; AuditLog `REOPEN_MONTH`).

### orders.controller.js
Statuses Pending → Confirmed → Preparing → OutForDelivery → Delivered | Cancelled. `getAll`, `getById` (+ items), `create` (lines priced from `Products.Rate`; inactive products rejected; status Pending), `updateStatus` (cancel needs reason; **first** move to Delivered decrements `Products.Stock`, clamped at 0), `cancel`.

### subscriptions.controller.js
Statuses Draft, Submitted, PendingApproval, Approved, Rejected, Active, Paused, Suspended, Cancelled, Completed (Rejected/Suspended/Cancelled need a reason). Estimated monthly = `round(daysPerWeek × 30 / 7) × totalQty × rate`. Every change closes the open `SubscriptionHistory` row and opens a new one. Functions: `getAll`, `getById`, `getHistory`, `create` (→ PendingApproval), `updateStatus`, `amend`, `pause` (fromDate required), `resume` (only from Paused), `cancel`.

### products.controller.js
`getAll(?active)` (Cost/MinStock stripped without settings:manage), `getLowStock`, `create`/`update` (name unique; unit liter|kg), `adjustStock({ set } | { delta })` (never < 0), `toggleActive`, `remove`.

### dashboard.controller.js
- `getSummary` → `{ customers{total,active,inactive}, deliveries{todayDelivered,todayMissed,activeCustomers}, revenue{monthly,pendingAmount}, payments{paid,unpaid,pending}, cows{total,active,pregnant,dryPeriod}, pregnancies{active,dueSoon}, finance{year,month,income,milkPayments,otherIncome,expense,net,expenseByCategory[],trend[6]} }`.
- `getCustomerSummary` (role customer, `customerIds[0]`) → `{ customer, currentMonth, lastMonth, milk{averageLiters,totalLiters,extraLiters}, delivery{deliveredDays,missedDays}, billing{pendingDues,lastMonthDue,currentMonthEstimate,currentMonthCutoffDate,invoiceCount,pendingInvoices}, recentRequests[20] }` (current month via `billing.calculateCustomerMonthBill`).

---

## 5. Services

### billing.service.js
Exports `calculateCustomerMonthBill(customer, year, month)`, `getBillingCutoffDate(y, m)`, `getMonthlyDeliveryCharge()`.
- Cutoff: current month → today; future month → null (nothing billed); past month → last day.
- Rate: `MilkRates` rate effective on the **1st** of the month for `customer.MilkType`, else the customer's `RatePerLiter`.
- Per day up to cutoff: delivered unless an Approved `cancel_delivery` exists or `DeliveryData[date] === false`; litres = `QuantityData[date]` or `DailyQuantity`; Approved `extra_milk` litres added on delivered days; missed days collect a reason.
- `totalQuantity = base + extra`; `milkAmount = totalQuantity × rate`; `deliveryCharge` = Settings `monthlyDeliveryCharge` once per month if deliveredDays > 0; `amount = milkAmount + deliveryCharge`.
- Returns `{ deliveredDays, missedDays, baseLiters, extraLiters, totalQuantity, milkAmount, deliveryCharge, amount, ratePerLiter, dailyQuantity, cutoffDate, missedDetails[], extraDetails[] }`.

### categories.service.js
`LEDGERS ['expense','income']`, `MAX_NAME 60`, `listCategories`, `categoryNames`, `resolveCategory`, `createCategory`, `deleteCategory`, `normaliseName`. Names are trimmed, spaces collapsed, first letter capitalised. Create: ≥2 chars; 409 on active duplicate; soft-deleted same-name row is re-activated; custom rows get SortOrder 500. Delete: refuses system categories and categories in use; otherwise soft delete.

### finance.service.js
`isoDate`, `monthRange`, `getMonthSummary`, `getYearTrend`, `getRecentTrend(y, m, n=6)`, `getLedger`.
Income = `Payments.AmountPaid` (by PaymentDate) + `ProductOrders.TotalAmount` where Delivered (by OrderDate) + manual `Income` rows. Expense = `Expenses` rows.
- `getMonthSummary` → `{ income{ milkPayments, otherItemSales, manual, byCategory, total }, expense{ byCategory, total }, netProfit }`.
- `getYearTrend` → 12 × `{ year, month, income, expense, net }` (groups by `MONTH(TRY_CONVERT(date, col))`).
- `getLedger` → merged cash book with running `balance`, newest first: `{ rows[], totalIncome, totalExpense, net }`.

### invoicePdf.service.js
`renderInvoicePdf`, `buildInvoicePdf(invoiceId)` → `{ buffer, filename: invoice-<No>.pdf, invoice, customer, business }`, `getBusinessProfile`, `amountInWords`. A4 pdfkit invoice using Noto Sans when available ("Rs." fallback), optional `assets/logo.png`, business profile from `Settings` keys `businessName, businessAddress, businessPhone, businessGst, businessEmail, businessTagline` (env fallback). Includes line items, adjustments, payments, balance, amount in Indian words, missed days and extra-milk days.

### otp.service.js
Constants: 6 digits, TTL 300 s, cooldown 60 s, 5 sends / 900 s, 5 attempts. Purposes registration | login | change_mobile. Exports `generateCode`, `hashCode` (HMAC-SHA256 of `mobile:code` keyed with JWT_SECRET), `verifyCode` (timingSafeEqual), `normalizeMobile`, `isValidMobile` (10–15 digits), `normalizePurpose`, `isDevMode`, `sendOtpSms` (Fast2SMS bulkV2 route otp; logs code outside production).

### scheduler.js (node-cron, server local time)
| Cron | Job |
|---|---|
| `0 7 * * *` | "Morning Reminder" push to all active users with a token |
| `0 8 1 * *` | "Monthly Invoices" reminder on the 1st |
| `0 9 * * *` | calving due ≤7 days, overdue calving, health `NextDueDate` ≤3 days |
| `0 8 * * *` | mating-cycle check reminders (Pending, `ReminderSent=0`, `NextCheckDate ≤ today`) to admin/supervisor/cattlecaretaker; sets `ReminderSent=1`. JOINs CowMaster only |
| `0 0 * * *` | logs yesterday's farm milk total |

### notifications/
- `push.service.js`: `sendPush(tokens, title, body, data)` → Expo push API; `getTokensByRoles(roles[])`.
- `email.service.js`: `sendEmail(to, subject, html, attachments)` via nodemailer SMTP (`invoiceEmailTemplate` unused).
- `whatsapp.service.js`: `generateWhatsAppLink(phone, msg)` (wa.me), `sendWhatsApp(phone, msg)` via Meta Graph API with `{ sent:false, link }` fallback (`invoiceWhatsAppMessage` unused).

### Unused
`reports.service.js` (older PDF/Excel), `google/drive.service.js`, `google/sheets.service.js` (references `config.sheets` which does not exist).

---

## 6. Middleware

**`auth.middleware.js`**
- `authenticate`: requires `Authorization: Bearer <JWT>` (401 "No token provided"); `jwt.verify` with `JWT_SECRET`; sets `req.user = { id, name, email, mobile, role, permissions, customerIds, iat, exp }`.
- `requirePermission(perm)`: 403 "Permission denied" unless `rbac.hasPermission(req.user.role, perm)` — recomputed from role.
- `requireAdmin`: 403 unless `normalizeRole(role) === 'admin'`.
- `requireRole(...roles)`: unused.
- Re-exports `PERMISSIONS`.

**`validate.middleware.js`**: `validate(schema)` (Joi-style) — not used anywhere; Joi is not installed.

---

## 7. Config

- **`rbac.js`**: roles, labels, aliases, 26 permissions, matrix, helpers `normalizeRole`, `permissionsForRole`, `hasPermission`. See [ARCHITECTURE.md §5](ARCHITECTURE.md#5-authorization-rbac).
- **`finance.js`**: `EXPENSE_CATEGORIES` (Cattle Feed, Medicine, Doctor Fee, Labour Salary, Electricity (EB), Petty Cash, Other), `INCOME_CATEGORIES` (Milk Sale (Direct), Cattle Sale, Calf Sale, Manure Sale, Goat / Poultry Sale, Egg Sale, Subsidy / Grant, Other), `PAYMENT_MODES` (Cash, UPI, Bank Transfer, Cheque, Other), `AUTO_INCOME` labels. Mirror in `mobile/src/types/index.ts`.
- **`index.js`**: `{ port, nodeEnv, db{…}, jwt{secret, expiresIn}, adminPin, staffPin, email{…}, sms{fast2smsApiKey}, google{…}, expo{accessToken}, whatsapp{…}, business{…} }`.
- **`logger.js`**: winston JSON with timestamps and stacks; console + `logs/error.log` + `logs/combined.log`.

---

## 8. Database

### db.js
mssql pool (max 10, min 2, idle 30 s; `instanceName`, `encrypt`, `trustServerCertificate`, `enableArithAbort`). `getPool()` lazy singleton. Helpers: `query(sql, params)` where `params = { name: { type, value } }`, `queryOne`, `execute` (rowsAffected). Re-exports `sql` and types `VarChar, NVarChar, Int, SmallInt, TinyInt, Bit, Decimal, Date, DateTime2, Float`.

### migrate.js — 38 tables (`npm run db:migrate`, idempotent)
Conventions: `NV36` = NVARCHAR(36) UUID; dates NVARCHAR(20) `yyyy-MM-dd`; timestamps NVARCHAR(30) ISO.

| Table | Columns |
|---|---|
| Users | Id PK, GoogleId, Name, Email, Mobile, Role, PasswordHash, IsActive BIT, PushToken, LastLogin, CreatedAt, UpdatedAt |
| Roles / Permissions / RolePermissions / UserRoles | role catalogue, permission catalogue, (RoleId, PermissionId), (UserId, RoleId) |
| Customers | Id, Name, Mobile, Email, Address, DailyQuantity, MorningQuantity, EveningQuantity DEC(8,2), MilkType, RatePerLiter DEC(8,2), BillingMode, IsActive, CreatedAt, UpdatedAt |
| CustomerUserAccess | UserId, CustomerId, IsPrimary, CreatedAt (PK pair) |
| CustomerDeliveryRequests | Id, CustomerId, UserId, RequestDate, RequestType, ExtraQuantity, ClaimedStatus, Reason, Status ('Pending'), ActionReason, ActionBy, ActionAt, CreatedAt, UpdatedAt; unique (CustomerId, RequestDate, RequestType) |
| CowMaster | Id, Name, TagNumber (unique non-empty), Breed, Color, DateOfBirth, PurchaseDate, PurchaseCost DEC(10,2), CurrentStatus ('Active'), PhotoUrl, Notes, Gender ('Female'), AnimalType ('Cow'), CreatedAt, UpdatedAt |
| GoatMaster | as CowMaster without AnimalType |
| HenMaster / DuckMaster | as CowMaster without Gender/AnimalType |
| GoatWeightRecords | Id, GoatId FK, WeighedDate, WeightKg DEC(6,2), Notes, CreatedAt, UpdatedAt |
| HealthRecords | Id, CowId FK, RecordType, RecordDate, Description, Veterinarian, NextDueDate, Documents, Notes, CreatedAt, UpdatedAt |
| BreedingRecords | Id, CowId (polymorphic, FK dropped), Species ('Cow'), MatingDate, BullName, BreedingMethod, TechnicianName, Notes, NextCheckDate, ConceptionStatus ('Pending'), CycleNumber INT, ReminderSent BIT, CreatedAt, UpdatedAt |
| PregnancyRecords | Id, CowId, Species, BreedingId FK, IsConfirmed, ConfirmationDate, Veterinarian, ExpectedCalvingDate, ActualCalvingDate, Status ('Pregnant'), CreatedAt, UpdatedAt |
| CalvingRecords | Id, CowId, Species, PregnancyId, DeliveryDate, DeliveryType, NumberOfCalves TINYINT, Complications, Notes, CreatedAt, UpdatedAt |
| CalfRecords | Id, CalvingId FK, MotherCowId, Name, Gender, BirthDate, BirthWeight DEC(6,2), HealthStatus, Notes, CreatedAt, UpdatedAt |
| SpeciesBreedingConfig | Species PK, HeatCycleDays, HeatDurationHoursMin/Max, GestationDaysMin/Max, Notes; seeded Cow 21/283, Buffalo 21/283, Goat 19/145–155 |
| Deliveries | Id, CustomerId FK, Year SMALLINT, Month TINYINT, DeliveryData, ReasonData, StatusData, QuantityData (JSON), DeliveredDays, MissedDays, TotalQuantity DEC(10,2), TotalAmount DEC(12,2), CreatedAt, UpdatedAt; unique (CustomerId, Year, Month) |
| Invoices | Id, InvoiceNumber (unique), CustomerId FK, CustomerName, Year, Month, DailyQuantity, RatePerLiter, DeliveredDays, MissedDays, TotalQuantity, Amount DEC(12,2), DeliveryCharge, PaymentStatus ('Pending'), MissedDetails JSON, CreatedAt, UpdatedAt; unique (CustomerId, Year, Month) |
| Payments | Id, InvoiceId FK, CustomerId FK, InvoiceNumber, AmountDue, AmountPaid, Balance DEC(12,2), **PaymentDate** (declared NVARCHAR(20); real `DATE` in the live DB), PaymentMode, Notes, Status ('Partial'), CreatedAt, UpdatedAt |
| MilkProduction | Id, CowId FK, ProductionDate, MorningMilk, EveningMilk, TotalMilk DEC(6,2), Notes, CreatedAt, UpdatedAt; unique (CowId, ProductionDate) |
| AuditLog | Id, UserId, Action, Module, EntityId, PreviousValue, NewValue, Reason, Comments, IpAddress, CreatedAt, UpdatedAt |
| Settings | Key PK, Value NVARCHAR(4000), UpdatedAt; seeded `monthlyDeliveryCharge='0'` |
| Products | Id, Name (unique), Description, Unit ('liter'), Rate, Cost, Stock, MinStock, TaxPercent, ImageUrl, IsActive, SortOrder, CreatedAt, UpdatedAt; seeded Milk 60/L, Curd 80/kg, Buttermilk 40/L, Butter 500/kg, Ghee 700/kg, Paneer 350/kg |
| ProductOrders / ProductOrderItems | order header (Status 'Pending', TotalAmount, ActionReason, CreatedBy) and lines (ProductId, ProductName, Unit, Quantity, Rate, Amount) |
| CustomerSubscriptions / SubscriptionHistory | subscription (Status 'PendingApproval', DeliveryDays 'All', EstimatedMonthlyAmount, PauseFrom/To) and effective-dated history (EffectiveFrom/To, ChangeReason) |
| MilkRates | Id, MilkType, RatePerLiter, EffectiveFrom, EffectiveTo, Status ('Active'), Notes, CreatedBy, CreatedAt, UpdatedAt; seeded Cow Milk 60 from 2020-01-01 |
| MonthClosures | Id, Year, Month (unique pair), Status ('Closed'), Notes, ClosedBy, ClosedAt, ReopenedBy, ReopenedAt, CreatedAt, UpdatedAt |
| MedicineMaster | Id, Name (unique), DosageMg, Purpose, Comments, AnimalTypes CSV, IsActive, CreatedAt, UpdatedAt |
| Expenses / Income | Id, Category NV60, AccountName, ItemName, Vendor|Source, Quantity, Unit, Amount DEC(12,2), ExpenseDate|IncomeDate, PaymentMode, Notes, CreatedBy, CreatedAt, UpdatedAt |
| LedgerCategories | Id, Ledger, Name, IsSystem, IsActive, SortOrder, CreatedAt; unique (Ledger, Name); system rows seeded from finance.js |
| OtpVerifications | Id, Mobile, CodeHash, Purpose, ExpiresAt, Attempts, Verified, ConsumedAt, CreatedAt, UpdatedAt |

Post-table steps: seed Roles/Permissions/RolePermissions from rbac.js; rename role `staff` → `supervisor`; backfill UserRoles; insert default products, `monthlyDeliveryCharge`, default milk rate; backfill `Customers.MorningQuantity`; set `AnimalType='Buffalo'` where Breed contains "Buffalo"; drop old CowId FKs so breeding is polymorphic.

---

## 9. Utils and seed scripts

| File | Exports / purpose |
|---|---|
| `response.js` | `success(res, data, message='Success', status=200)`, `error(res, message, status=500, errors)` |
| `helpers.js` | `generateId` (uuid v4), `formatDate`, `today`, `getMonthDays`, `getMonthDateArray`, `initMonthlyDeliveries`, `calcExpectedCalvingDate(mating, gestationDays?)`, `calcNextMatingCheck(mating, cycleDays=21)`, `MATING_CYCLE_DAYS`, `daysUntil`, `generateInvoiceNumber` (unused) |
| `monthLock.js` | `isMonthClosed(y, m)`, `guardMonthWrite({ user, year, month, ip, module, entityId, action, reason })` → open: allowed; closed + non-admin: 423; closed + admin: allowed and audit-logged |
| `animalLookup.js` | `tableForSpecies`, `getAnimalById`, `setAnimalStatus`, `getSpeciesConfig`, `getAnimalNamesByIds` (Cow/Buffalo → CowMaster, Goat → GoatMaster) |
| `deliveryStatus.js` | `DELIVERY_STATUSES` [Scheduled, Delivered, Partial, Missed, CustomerUnavailable, Holiday, Cancelled, ExtraDelivery], `NOT_DELIVERED_STATUSES`, `normalizeDeliveryStatus`, `statusIsDelivered`, `statusToDelivered`, `deliveredToStatus` |

| Seed script | Run | Effect |
|---|---|---|
| `seedData.js` | `npm run db:seed` | skips if customers exist; 20 customers, 10 cows (T001–T010), breeding + pregnancy for 2 pregnant cows, June 2026 deliveries for 3 customers with AuditLog |
| `seedTestUsers.js` | `npm run db:seed:test-users` | upserts 7 users (one per role) on mobiles 9000000001–9000000007, password `TEST_USER_PASSWORD`; links the customer user to the first active customer |
| `seedDeliveryData.js` | `node src/utils/seedDeliveryData.js` | inserts June 2026 deliveries for first 3 active customers |
| `updateDeliveryData.js` | `node src/utils/updateDeliveryData.js` | same sample but UPDATEs existing rows |

---

## 10. Tests

No test framework and no `npm test`; both files are Node scripts that hit a **running** server at `API_BASE` and connect to the DB for cleanup.

| File | Run | Prereqs | Covers |
|---|---|---|---|
| `tests/roleAccessTest.js` | `node tests/roleAccessTest.js` | server running; `npm run db:seed:test-users` | login as all 7 roles; permissions vs rbac.js; 403 denial matrix; allow probes; admin functional suite (products, customers, cows, settings, orders with stock decrement, subscription lifecycle + history, milk-rate supersession). Self-cleaning |
| `tests/customerAdminE2E.js` | `node tests/customerAdminE2E.js` | server running; real customer login (`CUST_MOBILE`/`CUST_PASS`); `ADMIN_PIN` | customer journey: dashboard, own deliveries, dispute → admin approve, extra/cancel → approve, order confirm/cancel, subscription approve/pause/resume/cancel, 403 checks. Restores delivery row and deletes created rows |

Recommended sequence (from `backend/`):
```bash
npm run db:migrate
npm run db:seed:test-users
NODE_ENV=development RATE_LIMIT_MAX=100000 npm run dev     # separate terminal
node tests/roleAccessTest.js
node tests/customerAdminE2E.js
```

---

## 11. Dockerfile

Two-stage `node:20-alpine` (deps: `npm ci --omit=dev`; runtime copies node_modules + src, creates `uploads/reports` and `uploads/photos`, runs as non-root `appuser`). `EXPOSE 3000`, `HEALTHCHECK wget -qO- http://localhost:3000/health` every 30 s, `CMD ["node","src/index.js"]`. **Migrations are not run on container start**; run `npm run db:migrate` from the host.

---

## 12. Known issues

1. `validate` middleware and `requireRole` are never used; Joi is not installed.
2. Dead code: `services/google/*` (sheets.service references non-existent config), `services/reports.service.js`, `email.invoiceEmailTemplate`, `whatsapp.invoiceWhatsAppMessage`, `helpers.generateInvoiceNumber`, `config.expo.accessToken`.
3. Payments are not cumulative: each payment is compared alone to the invoice amount, so multiple partials never mark an invoice Paid.
4. Invoice rate inconsistency: new invoices store the customer's `RatePerLiter` but compute with the `MilkRates` effective rate; recalculated invoices store the effective rate; `Deliveries.TotalAmount` ignores approved cancel/extra requests.
5. Goats are missing from the mating-cycle cron and `/reports/pregnant-cows` (both JOIN CowMaster only).
6. `PUT /breeding/:id/confirm-pregnancy` is legacy; use `PUT /breeding/:id/conception`.
7. `GET /settings` is readable by any signed-in role, customers included.
8. All date/cron logic uses server local time.
9. Hard-coded fallback secrets for `JWT_SECRET`, `DB_PASSWORD`, `ADMIN_PIN` in `config/index.js`; set real values in `.env`.
10. Some queries interpolate filters as escaped strings instead of parameters (invoices.getAll, payments.getAll, milkProduction, calving.getAll, animal getAll filters, reports, scheduler).

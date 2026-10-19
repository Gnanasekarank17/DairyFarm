# Dairy Farm & Milk Delivery Management System — Feature Reference

A complete reference of every module, workflow, feature, and role-based capability implemented as of 2026-10-01. For function-level detail see [docs/BACKEND_REFERENCE.md](docs/BACKEND_REFERENCE.md) and [docs/MOBILE_REFERENCE.md](docs/MOBILE_REFERENCE.md).

- **Backend:** Node.js + Express + SQL Server (mssql), JWT auth, node-cron scheduler, Expo push, SMTP e-mail, WhatsApp Cloud API.
- **Mobile/Web:** React Native (Expo Router) with NativeWind, TanStack Query, Zustand, React Hook Form. Runs on Android/iOS and web (PCB EnterpriseGrid data grids on desktop).
- **API base:** `/api/v1`. All responses are `{ success, message, data }` and camelCased by the client.

---

## 1. Roles (User Types)

| Role | Id | Summary |
|------|----|---------|
| Admin | `admin` | Full access to everything. |
| Supervisor | `supervisor` | Operations + cattle + finance ledgers; billing view only; no users/settings. |
| Manager | `manager` | Customers, billing (manage), requests, orders, subscriptions, finance ledgers, reports; cattle view only. |
| Delivery Person | `deliveryperson` | Deliveries, customer requests, orders; customer view only. |
| Cattle Caretaker | `cattlecaretaker` | Cattle/herd modules only. |
| Farm Sweeper/Cleaner | `farmcleaner` | Dashboard only. |
| Customer | `customer` | Own dashboard and calendar; raise extra/cancel/dispute requests, orders and subscription requests. |

### Permission matrix (26 permissions)

| Permission | Admin | Supervisor | Manager | Delivery | Caretaker | Cleaner | Customer |
|------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| dashboard:view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| users:manage | ✅ | — | — | — | — | — | — |
| customers:view | ✅ | ✅ | ✅ | ✅ | — | — | — |
| customers:manage | ✅ | ✅ | ✅ | — | — | — | — |
| deliveries:view | ✅ | ✅ | ✅ | ✅ | — | — | — |
| deliveries:manage | ✅ | ✅ | — | ✅ | — | — | — |
| customer_requests:view | ✅ | ✅ | ✅ | ✅ | — | — | — |
| customer_requests:create | ✅ | — | — | — | — | — | ✅ |
| customer_requests:manage | ✅ | ✅ | ✅ | ✅ | — | — | — |
| billing:view | ✅ | ✅ | ✅ | — | — | — | — |
| billing:manage | ✅ | — | ✅ | — | — | — | — |
| cattle:view | ✅ | ✅ | ✅ | — | ✅ | — | — |
| cattle:manage | ✅ | ✅ | — | — | ✅ | — | — |
| reports:view | ✅ | ✅ | ✅ | — | — | — | — |
| settings:manage | ✅ | — | — | — | — | — | — |
| backup:manage | ✅ | — | — | — | — | — | — |
| orders:view | ✅ | ✅ | ✅ | ✅ | — | — | — |
| orders:create | ✅ | — | — | — | — | — | ✅ |
| orders:manage | ✅ | ✅ | ✅ | ✅ | — | — | — |
| subscriptions:view | ✅ | ✅ | ✅ | ✅ | — | — | — |
| subscriptions:create | ✅ | — | — | — | — | — | ✅ |
| subscriptions:manage | ✅ | ✅ | ✅ | — | — | — | — |
| expenses:view / expenses:manage | ✅ | ✅ | ✅ | — | — | — | — |
| income:view / income:manage | ✅ | ✅ | ✅ | — | — | — | — |

> Source of truth: `backend/src/config/rbac.js`. Enforced in route middleware (`requirePermission`) and, for customer requests, orders, subscriptions and single-customer deliveries, inside the controller. The mobile app mirrors the matrix in `src/utils/permissions.ts` for navigation.

---

## 2. Modules & Features

### 2.1 Authentication
- **Login methods:** mobile + password (primary), PIN (admin / staff), Google sign-in. OTP request/verify endpoints exist (Fast2SMS) without a UI yet.
- **Session:** JWT bearer token (30 days; PIN tokens 12 h); payload carries role, permissions and linked `customerIds`.
- **Endpoints:** `POST /auth/mobile-login`, `POST /auth/pin`, `POST /auth/google`, `POST /auth/otp/request|resend|verify`, `GET /auth/otp/status`, `PUT /auth/push-token`, `GET /auth/me`.
- **Mobile:** `app/auth/login.tsx`.

### 2.2 Dashboard
- Staff summary: customers, today's deliveries, revenue and pending, payments, cows, pregnancies, finance (income/expense/net, category split, 6-month trend).
- Customer summary: own milk, delivered/missed days, dues, current-month estimate, recent requests, request form.
- **Endpoints:** `GET /dashboard/summary`, `GET /dashboard/customer-summary`.
- **Mobile:** `app/(tabs)/dashboard.tsx`.

### 2.3 Customers
- Create, edit, view, activate/deactivate, delete; milk type, morning/evening quantity, rate, billing mode; Active/Inactive/All filter; inline editing on the web grid.
- **Endpoints:** `GET /customers?active=`, `GET /customers/:id`, `POST`, `PUT /:id`, `PATCH /:id/toggle`, `DELETE /:id`.
- **Mobile:** `app/customers/*`, `CustomersDataGrid`.

### 2.4 Deliveries
- Monthly calendar per customer or all customers; per-day status (Scheduled, Delivered, Partial, Missed, CustomerUnavailable, Holiday, Cancelled, ExtraDelivery), quantity and reason; mark entire month; today's list.
- 'Monthly Full Check' customers start every day as delivered; audit trail for missed days; **month lock** (423) on closed months.
- **Endpoints:** `GET /deliveries/today`, `GET /deliveries/statuses`, `GET /deliveries/:y/:m`, `GET /deliveries/:customerId/:y/:m`, `PUT …/day`, `PUT …/mark-all`.
- **Mobile:** `app/(tabs)/delivery.tsx`, `app/delivery/[customerId].tsx`.

### 2.5 Customer Requests (Extra / Cancel / Dispute)
- **Extra milk** (single future date, quantity > 0), **cancel delivery** (future date or range up to 45 days, reason required), **dispute delivery** (past date in current/previous month with claimed status and reason).
- Pending → Approved/Rejected by `customer_requests:manage`; disputes resolved by **Admin only** and auto-correct the calendar; push notifications to staff on submission; AuditLog on action.
- **Endpoints:** `GET /customer-requests/:y/:m`, `POST /customer-requests`, `PATCH /customer-requests/:id/status`.
- **Mobile:** customer dashboard and calendar; approval list on the Delivery tab.

### 2.6 Billing & Invoices
- Generate per customer or all; bill up to today for the current month; rate from **Milk Rates** effective on the 1st (fallback customer rate); approved cancels/extras applied; **monthly delivery charge** once per invoice; invoice number `INV-YYYYMM-xxxxxx`.
- PDF (A4, branded from Settings), e-mail with attachment, WhatsApp Cloud API or wa.me/SMS links, monthly batch send.
- **Endpoints:** `POST /invoices/generate`, `GET /invoices`, `GET /invoices/:id`, `GET /invoices/:id/pdf`, `POST /invoices/:id/email`, `GET /invoices/:id/whatsapp`, `GET /invoices/month/:y/:m/message-links`, `POST /invoices/month/:y/:m/send-whatsapp`.
- **Mobile:** `app/(tabs)/invoices.tsx`, `app/invoices/[id].tsx`, `InvoicesDataGrid`.

### 2.7 Payments
- Record payments (Cash, UPI, Bank Transfer, Cheque, Other); invoice becomes Paid or Partial; outstanding list.
- **Endpoints:** `GET /payments`, `GET /payments/outstanding`, `GET /payments/:id`, `POST /payments`.
- **Mobile:** `app/payments/record.tsx`, invoice detail.

### 2.8 Products & Pricing
- Product master (Milk, Curd, Buttermilk, Butter, Ghee, Paneer seeded) with unit (litre/kg), rate, cost, stock, min stock, tax; low-stock list; stock adjustment; active toggle. Monthly delivery charge configured on the same page.
- **Endpoints:** `GET /products`, `GET /products/low-stock`, `POST`, `PUT /:id`, `PATCH /:id/stock`, `PATCH /:id/toggle`, `DELETE /:id`.
- **Mobile:** `app/settings/products.tsx`.

### 2.9 Product Orders (API)
- Customers or staff place orders priced from product rates; statuses Pending → Confirmed → Preparing → OutForDelivery → Delivered / Cancelled; first delivery decrements stock; owner can cancel while Pending.
- **Endpoints:** `GET /orders`, `GET /orders/:id`, `POST /orders`, `PATCH /orders/:id/status`, `POST /orders/:id/cancel`.
- **Mobile:** API functions and types ready (`ordersApi`); no screen yet.

### 2.10 Milk Subscriptions (API)
- Customer milk requirement (type, morning/evening quantity, rate, delivery days, start date) with approval workflow, pause/resume, cancel, amendments and effective-dated history; estimated monthly amount.
- **Endpoints:** `GET /subscriptions`, `GET /subscriptions/:id`, `GET /subscriptions/:id/history`, `POST`, `PUT /:id`, `PATCH /:id/status`, `POST /:id/pause|resume|cancel`.
- **Mobile:** `subscriptionsApi` ready; no screen yet.

### 2.11 Milk Rates & Month Closing (API)
- Effective-dated rates per milk type; creating a rate auto-closes the previous one. Month closures lock delivery edits and invoice generation (423) unless Admin; reopen is Admin only with a reason; both audit-logged.
- **Endpoints:** `GET /milk-rates`, `GET /milk-rates/effective`, `POST`, `PUT /:id`, `DELETE /:id`; `GET /month-closures`, `GET /month-closures/:y/:m`, `POST …/close`, `POST …/reopen`.
- **Mobile:** `milkRatesApi`, `monthClosuresApi` ready; no screen yet.

### 2.12 Cows & Buffaloes
- Herd master (Cow/Buffalo, Female/Male) with status lifecycle **Active → Mated → Pregnant → Dry Period → Sold / Deceased**, health records, photo, purchase info; filters by status, gender, type; inline editing on web.
- **Endpoints:** `GET /cows`, `GET /cows/:id`, `POST`, `PUT /:id`, `DELETE /:id`, `GET /cows/:id/health`, `POST /cows/:id/health`.
- **Mobile:** `app/(tabs)/cows.tsx`, `app/cows/*`, `CowsDataGrid`.

### 2.13 Goats, Hens, Ducks
- Config-driven simple animal masters. Goats add gender, breeding and **weight tracking** (history, trend gain/loss/stable). Hens and ducks are plain CRUD.
- **Endpoints:** `GET|POST /goats`, `GET|PUT|DELETE /goats/:id`, `GET|POST /goats/:id/weights`, `DELETE /goats/:id/weights/:weightId`; same CRUD under `/hens` and `/ducks`.
- **Mobile:** `app/animals/[type]/*`, `SimpleAnimalDataGrid`, config in `src/config/simpleAnimals.ts`.

### 2.14 Medicines
- Medicine master: name, dosage (mg), purpose, comments, applicable animal types (Cow, Goat, Hen, Duck), active toggle.
- **Endpoints:** `GET /medicines`, `GET /medicines/:id`, `POST`, `PUT /:id`, `PATCH /:id/toggle`, `DELETE /:id`.
- **Mobile:** `app/medicines/index.tsx`.

### 2.15 Breeding & Mating Cycle
- Record a mating (natural/AI) for Cow, Buffalo or Goat. Animal becomes **Mated**; a cycle check is scheduled at **+21 days** (goat 19) and Admin/Supervisor/Caretaker are notified.
- **Conceived:** expected calving = mating + **283 days** (goat 150); pregnancy record created; animal **Pregnant**.
- **Not conceived:** a new cycle starts; staff re-notified.
- **Endpoints:** `POST /breeding`, `GET /breeding`, `GET /breeding/upcoming-calving`, `GET /breeding/:id`, `PUT /breeding/:id/conception` (`confirm-pregnancy` is legacy).
- **Mobile:** `app/breeding/index.tsx`, `app/breeding/add.tsx`.

### 2.16 Pregnancies & Calving
- Active pregnancies with days to calving; record calving (Normal/Assisted/Caesarean, complications) with multiple calves (name, gender, weight, health). Animal returns to Active.
- **Endpoints:** `GET /breeding?status=Pregnant`, `POST /calving`, `GET /calving`, `GET /calving/:id`.
- **Mobile:** `app/breeding/pregnancies.tsx`, `app/calving/record.tsx`.

### 2.17 Milk Production
- Daily per-cow morning/evening entry (one row per cow per day), farm summary, per-cow history.
- **Endpoints:** `POST /milk-production`, `GET /milk-production`, `GET /milk-production/summary`, `GET /milk-production/cow/:cowId`.
- **Mobile:** `app/milk/add.tsx`, `app/reports/milk-production.tsx`.

### 2.18 Finance — Expenses & Income Ledgers
- Config-driven ledgers with seeded categories (Expenses: Cattle Feed, Medicine, Doctor Fee, Labour Salary, Electricity (EB), Petty Cash, Other; Income: Milk Sale (Direct), Cattle Sale, Calf Sale, Manure Sale, Goat / Poultry Sale, Egg Sale, Subsidy / Grant, Other) plus **custom categories**; item, party (vendor/source), quantity, amount, payment mode, notes; monthly summary by category; inline editing on web.
- Income reports combine ledger income with milk payments and delivered product orders.
- **Endpoints:** under `/expenses` and `/income`: `GET /`, `GET /summary/:y/:m`, `GET|POST /categories`, `DELETE /categories/:id`, `GET|PUT|DELETE /:id`, `POST /`.
- **Mobile:** `app/(tabs)/finance.tsx`, `app/finance/[type]/*`, `LedgerDataGrid`, config in `src/config/ledgers.ts`.

### 2.19 Reports
- Monthly Excel, delivery exceptions, pending payments, pregnant cows, milk production, **profit & loss**, **cash-book ledger with running balance**, **12-month trend**. Web grids export CSV/Excel/PDF.
- **Endpoints:** `GET /reports/monthly-excel/:y/:m`, `/delivery-exceptions`, `/pending-payments`, `/pregnant-cows`, `/milk-production/:y/:m`, `/monthly-finance/:y/:m`, `/finance-ledger/:y/:m`, `/finance-trend/:year`.
- **Mobile:** `app/reports/*`, `ReportGrid`.

### 2.20 Settings, Users & Backup
- Business info (name, address, phone, e-mail, GST, tagline) used on invoice PDFs; monthly delivery charge; user management (create, edit, role, activate, delete with last-admin protection); JSON backup download.
- **Endpoints:** `GET|PUT /settings`; `GET /users`, `GET /users/roles`, `GET|PUT|DELETE /users/:id`, `POST /users`, `PATCH /users/:id/toggle`; `POST /backup/create`, `GET /backup/list`.
- **Mobile:** `app/settings/index.tsx`, `app/settings/products.tsx`.

### 2.21 Notifications
- Expo push to all active users or by role; manual payment reminder and breeding alert triggers; scheduled reminders (see §5).
- **Endpoints:** `POST /notifications/payment-reminder/:invoiceId`, `POST /notifications/breeding-alert`.

---

## 3. Key Workflows

### Daily delivery
1. 07:00 push reminder to update deliveries.
2. Staff mark today's deliveries (or a full month) per customer with status, quantity and reason.
3. Customers raise extra/cancel/dispute requests; operators approve or reject; approved disputes auto-correct the calendar.

### Monthly billing
1. 08:00 on the 1st: push reminder to generate invoices.
2. Generate invoices (per customer or all): deliveries up to cutoff × effective rate + extras − cancels + delivery charge.
3. Share via PDF / e-mail / WhatsApp; record payments; track outstanding; close the month to lock it.

### Customer request approval
1. Customer submits → **Pending** → staff notified.
2. Approver (`customer_requests:manage`; Admin for disputes) approves/rejects with a reason → calendar updated → AuditLog.

### Mating cycle
1. Record mating → animal **Mated**, check at +21 days (goat 19), staff notified at 08:00 when due.
2. Conceived → calving date = mating + 283 days (goat 150), animal **Pregnant**; not conceived → new cycle.
3. Pregnancies → Calving → Calf records; animal back to **Active**.

### Product order
1. Order created from product rates (Pending) → Confirmed → Preparing → OutForDelivery → Delivered (stock decremented) or Cancelled.

---

## 4. User-wise Feature Access

- **Admin:** everything — users, settings, products/pricing, milk rates, month close/reopen, billing, deliveries, customers, herd, finance, reports, backup, notifications.
- **Supervisor:** customers, deliveries, request approvals, herd (manage), finance ledgers, orders, subscriptions, billing view, reports; mating-cycle alerts.
- **Manager:** customers, billing (invoices, payments, WhatsApp), request approvals, orders, subscriptions, finance ledgers, reports; deliveries and herd view only.
- **Delivery Person:** deliveries (manage), customer view, request approvals, orders.
- **Cattle Caretaker:** cows, goats, hens, ducks, medicines, breeding, pregnancies, calving, milk production; mating-cycle alerts.
- **Farm Sweeper/Cleaner:** dashboard only.
- **Customer:** own dashboard and delivery calendar; extra/cancel/dispute requests; place orders and subscription requests (API).

---

## 5. Scheduled Jobs (node-cron, server local time)

| Time | Job |
|---|---|
| 07:00 daily | Delivery update reminder to all active users. |
| 08:00 daily | Mating-cycle check reminders to Admin/Supervisor/Caretaker (once per record). |
| 08:00 on the 1st | Monthly invoice generation reminder. |
| 09:00 daily | Calving due (≤7 days) / overdue alerts and health next-due (≤3 days) alerts. |
| 00:00 daily | Log previous day's farm milk total. |

---

## 6. Data Model (38 tables)

`Users`, `Roles`, `Permissions`, `RolePermissions`, `UserRoles`, `Customers`, `CustomerUserAccess`, `CustomerDeliveryRequests`, `Deliveries`, `Invoices`, `Payments`, `Products`, `ProductOrders`, `ProductOrderItems`, `CustomerSubscriptions`, `SubscriptionHistory`, `MilkRates`, `MonthClosures`, `Settings`, `CowMaster`, `GoatMaster`, `HenMaster`, `DuckMaster`, `GoatWeightRecords`, `HealthRecords`, `BreedingRecords`, `PregnancyRecords`, `CalvingRecords`, `CalfRecords`, `SpeciesBreedingConfig`, `MilkProduction`, `MedicineMaster`, `Expenses`, `Income`, `LedgerCategories`, `OtpVerifications`, `AuditLog`.

> Schema is created/updated idempotently by `backend/src/database/migrate.js` (`npm run db:migrate`). Column-level detail is in [docs/BACKEND_REFERENCE.md §8](docs/BACKEND_REFERENCE.md#8-database).

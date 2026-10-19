# Dairy Farm Management System — Architecture

This document describes how the system is put together: the runtime pieces, how a request flows, how authentication and authorization work, the data conventions every module follows, and the deployment topology. For per-function detail see [BACKEND_REFERENCE.md](BACKEND_REFERENCE.md) and [MOBILE_REFERENCE.md](MOBILE_REFERENCE.md).

---

## 1. System overview

```
┌──────────────────────────────┐        HTTPS/HTTP (JSON)        ┌──────────────────────────────┐
│  Mobile / Web client         │ ──────────────────────────────▶ │  Backend API (Node + Express)│
│  Expo 51 + expo-router 3.5   │   Authorization: Bearer <JWT>   │  /api/v1/*                   │
│  React Native 0.74 / RN Web  │ ◀────────────────────────────── │  JWT auth + RBAC             │
│  NativeWind, Zustand,        │   { success, message, data }    │  node-cron scheduler         │
│  TanStack Query, PCB Grid    │                                 └──────────────┬───────────────┘
└──────────────────────────────┘                                                │ mssql (TCP 1433)
                                                                                ▼
                                                                 ┌──────────────────────────────┐
                                                                 │  SQL Server (DairyFarmDB)    │
                                                                 │  38 tables, NVARCHAR dates   │
                                                                 └──────────────────────────────┘
      Outbound integrations from the backend:
      • Expo Push API (exp.host)        • SMTP e-mail (nodemailer)
      • Meta WhatsApp Cloud API         • Fast2SMS (OTP SMS)
      • Google ID-token verification    • (Google Drive/Sheets services exist but are unused)
```

| Layer | Technology | Location |
|---|---|---|
| Client | Expo 51, expo-router 3.5, React Native 0.74.1, react-native-web 0.19, NativeWind 2, Tailwind 3.2.7, Zustand 4, TanStack Query 5, axios, react-hook-form + zod, `@oeconnection/pcb-grid` (local copy) | `mobile/` |
| API | Node 20, Express 4, helmet, cors, express-rate-limit, compression, morgan, winston, jsonwebtoken, bcryptjs, mssql 10, node-cron, pdfkit, exceljs, nodemailer, axios | `backend/` |
| Database | SQL Server (SQLEXPRESS locally, or any instance reachable on TCP 1433) | external |
| Containers | `docker-compose.yml` + `docker-compose.override.yml` (API on 8080, nginx web on 8090) | repo root |

---

## 2. Repository layout

```
MobileAPP/
├── backend/                      Express API
│   ├── Dockerfile                node:20-alpine two-stage build, EXPOSE 3000
│   ├── src/
│   │   ├── index.js              app bootstrap, middleware chain, /health
│   │   ├── config/               index.js (env), rbac.js (roles/permissions), finance.js, logger.js
│   │   ├── controllers/          one file per module (+ animalMaster.factory, ledger.factory)
│   │   ├── routes/               one file per module, mounted in routes/index.js under /api/v1
│   │   ├── services/             billing, finance, categories, invoicePdf, otp, scheduler, notifications/, google/
│   │   ├── middleware/           auth.middleware.js (authenticate, requirePermission, requireAdmin)
│   │   ├── database/             db.js (pool + helpers), migrate.js (idempotent schema)
│   │   └── utils/                response, helpers, monthLock, animalLookup, deliveryStatus, seed scripts
│   └── tests/                    roleAccessTest.js, customerAdminE2E.js (plain Node scripts against a running server)
├── mobile/                       Expo app (Android / iOS / Web)
│   ├── app/                      expo-router file-based routes (screens)
│   ├── src/
│   │   ├── api/                  client.ts (axios), endpoints.ts (all API functions)
│   │   ├── components/           common/, grid/ (native + .web.tsx pairs), layout/Sidebar.tsx
│   │   ├── config/               ledgers.ts, simpleAnimals.ts (config-driven screens)
│   │   ├── hooks/                useLedgerCategories.ts
│   │   ├── store/                authStore.ts (Zustand)
│   │   ├── types/                index.ts (all entity types)
│   │   ├── utils/                helpers, permissions, notifications, offline
│   │   └── lib/Grid/package/     local copy of @oeconnection/pcb-grid (file: dependency)
│   ├── dist/                     Expo static web export served by nginx in Docker
│   ├── nginx-web.conf            SPA routing for the static export
│   └── app.json, babel.config.js, tailwind*.config.js, tsconfig.json
├── docs/                         this folder
├── docker-compose.yml            dairy-api service (base: host port 3000)
├── docker-compose.override.yml   API on 8080 + nginx web on 8090
├── setup-sqlserver-tcp.ps1       enables TCP 1433 on the local SQL Server instance
├── README.md, FEATURES.md, DAIRY_FARM_FEATURES.md (spec), TEST_CASES.md
```

---

## 3. Request flow

1. A screen calls a function from `mobile/src/api/endpoints.ts` (for example `customersApi.getAll()`), usually inside a TanStack Query `useQuery`/`useMutation`.
2. `mobile/src/api/client.ts` adds `Authorization: Bearer <token>` (token read from AsyncStorage) and sends the request to `EXPO_PUBLIC_API_URL`.
3. The backend middleware chain runs in order: helmet, cors (`*`), rate limit (200 req / 15 min, global), compression, morgan logging, JSON body parser (10 MB).
4. The route file applies `authenticate` (JWT verify) and usually `requirePermission(...)`; some modules check permissions inside the controller instead (customer requests, orders, subscriptions, deliveries for a single customer).
5. The controller validates the body by hand, runs parameterised SQL through `database/db.js`, and replies with the standard envelope from `utils/response.js`:
   - success: `{ success: true, message, data }` (201 for creates)
   - error: `{ success: false, message, errors? }` with 400 / 403 / 404 / 409 / 423 (month locked) / 429 / 500
6. The axios response interceptor lower-cases the first letter of every key (deep), so SQL `PascalCase` columns arrive as `camelCase`. Screens read `res.data.data`.
7. A 401 clears the auth store, and the root layout redirects to `/auth/login`.

---

## 4. Authentication

| Method | Endpoint | Notes |
|---|---|---|
| Mobile + password | `POST /auth/mobile-login` | Primary login. bcrypt hash check; a legacy plaintext password is accepted once and re-hashed. |
| PIN | `POST /auth/pin` | `ADMIN_PIN` → admin ("Owner"), `STAFF_PIN` → supervisor. Token lasts 12 h. User id is `pin-<role>`. Handy for smoke tests. |
| Google | `POST /auth/google` | Verifies the ID token against `GOOGLE_CLIENT_ID`. First ever user becomes admin, later new users become supervisor. |
| OTP (API only) | `POST /auth/otp/request|resend|verify`, `GET /auth/otp/status` | 6-digit HMAC-hashed codes, 5 min TTL, 60 s cooldown, 5 sends / 15 min, 5 attempts. SMS via Fast2SMS when configured; `devCode` is returned outside production. No screen uses OTP yet. |

The JWT payload (and `user` object) is `{ id, name, email, mobile, role, permissions[], customerIds[] }`. `customerIds` comes from `CustomerUserAccess` and scopes customer logins to their own customer records. `JWT_EXPIRES_IN` defaults to 30 days.

Client side, `authStore` persists `auth_token` and `auth_user` in AsyncStorage and hydrates them at startup (`loadAuth`).

---

## 5. Authorization (RBAC)

Source of truth: `backend/src/config/rbac.js`. The mobile app mirrors the matrix in `mobile/src/utils/permissions.ts` for navigation only; the server is the real gate and **recomputes permissions from the role on every request** (the token's `permissions` array and the DB `RolePermissions` table are informational).

Roles: `admin`, `supervisor`, `manager`, `deliveryperson`, `cattlecaretaker`, `farmcleaner`, `customer` (aliases such as owner, staff, delivery, cleaner, client are normalised).

26 permissions in 12 groups:

| Group | Permissions |
|---|---|
| dashboard | `dashboard:view` |
| users | `users:manage` |
| customers | `customers:view`, `customers:manage` |
| deliveries | `deliveries:view`, `deliveries:manage` |
| customer requests | `customer_requests:view`, `customer_requests:create`, `customer_requests:manage` |
| billing | `billing:view`, `billing:manage` |
| cattle | `cattle:view`, `cattle:manage` |
| reports | `reports:view` |
| settings / backup | `settings:manage`, `backup:manage` |
| orders | `orders:view`, `orders:create`, `orders:manage` |
| subscriptions | `subscriptions:view`, `subscriptions:create`, `subscriptions:manage` |
| finance | `expenses:view`, `expenses:manage`, `income:view`, `income:manage` |

Role matrix:

| Role | Has |
|---|---|
| admin | all 26 |
| supervisor | dashboard; customers v/m; deliveries v/m; customer_requests v/m; billing:view; cattle v/m; reports; orders v/m; subscriptions v/m; expenses v/m; income v/m |
| manager | dashboard; customers v/m; deliveries:view; customer_requests v/m; billing v/**m**; cattle:view; reports; orders v/m; subscriptions v/m; expenses v/m; income v/m |
| deliveryperson | dashboard; customers:view; deliveries v/m; customer_requests v/m; orders v/m; subscriptions:view |
| cattlecaretaker | dashboard; cattle v/m |
| farmcleaner | dashboard |
| customer | dashboard; customer_requests:create; orders:create; subscriptions:create |

Special rules enforced in controllers: dispute requests are resolved by admin only; `POST /month-closures/:y/:m/reopen` is admin only; customers see only rows for their `customerIds`.

---

## 6. Data conventions

- **Ids** are `NVARCHAR(36)` UUID v4 strings (`utils/helpers.generateId`).
- **Dates** are stored as strings: `NVARCHAR(20)` `yyyy-MM-dd` for dates and `NVARCHAR(30)` ISO timestamps. Exception: in the live database `Payments.PaymentDate` is a real `DATE` column (migrate.js still says NVARCHAR). Use `TRY_CONVERT(date, col)` in SQL against it and normalise JS `Date` values with `isoDate` from `finance.service.js`.
- **"Today"** and all cron jobs use server local time; there is no timezone setting.
- **Deliveries** are one row per customer per month containing JSON maps keyed by date: `DeliveryData` (bool), `ReasonData` ({reason, comments}), `StatusData` (canonical status), `QuantityData` (litres).
- **Month lock**: `utils/monthLock.guardMonthWrite` blocks delivery edits, dispute corrections and invoice generation for a closed month with HTTP 423 unless the caller is admin (admin edits are audit-logged). Payments, requests, orders and subscriptions are not locked.
- **Audit trail**: `AuditLog` rows are written for missed-delivery updates, dispute corrections, request approvals, month close/reopen.
- **Casing**: SQL returns PascalCase; a few controllers (orders, subscriptions, customer requests, users, customer dashboard, ledger summaries) map to camelCase themselves; the client camelises everything anyway.
- **Finance lists** (`EXPENSE_CATEGORIES`, `INCOME_CATEGORIES`, `PAYMENT_MODES`) live in `backend/src/config/finance.js` and must be mirrored in `mobile/src/types/index.ts`.

---

## 7. Domain modules

| Module | Backend | Mobile | Key rules |
|---|---|---|---|
| Customers | customers.* | `/customers/*`, CustomersDataGrid | DailyQuantity = morning + evening; active/inactive toggle; hard delete |
| Deliveries | deliveries.* | `/delivery`, `/delivery/[customerId]` | monthly JSON maps; 'Monthly Full Check' pre-marks all days delivered; month lock |
| Customer requests | customerRequests.* | dashboard (customer), delivery screens | extra_milk (future, qty>0), cancel_delivery (future, reason, ≤45-day range), dispute_delivery (past, current/previous month, admin resolves) |
| Billing | billing.service, invoices.*, payments.*, milkRates.*, monthClosures.* | `/invoices`, `/invoices/[id]`, `/payments/record` | bill up to cutoff (today for current month); rate = MilkRates effective on the 1st else customer rate; approved cancels remove days, approved extras add litres; delivery charge once per month |
| Products & orders | products.*, orders.* | `/settings/products` (orders API unused in UI) | unit liter/kg; order lines priced from Products.Rate; first move to Delivered decrements stock |
| Subscriptions | subscriptions.* | API only | PendingApproval → Approved/Active → Paused/Cancelled…; effective-dated history rows |
| Herd | cows.*, goats.*, hens/ducks (factory), medicines.* | `/cows/*`, `/animals/[type]/*`, `/medicines` | CowMaster holds Cow + Buffalo; goats have weights; hens/ducks simple CRUD |
| Breeding | breeding.*, calving.*, animalLookup | `/breeding/*`, `/calving/record` | mating → Mated, check at +21 d (goat 19); conceived → Pregnant, calving = mating + 283 d (goat 150); not conceived → new cycle |
| Milk production | milkProduction.* | `/milk/add`, reports | one row per cow per date; rejects male animals |
| Finance ledgers | ledger.factory (expenses, income), categories.service, finance.service | `/finance/[type]/*`, `/reports/finance*` | custom categories; income = payments + delivered orders + manual income |
| Reports | reports.routes (inline) | `/reports/*` | Excel export, exceptions, pending, pregnant, milk, P&L, ledger, trend |
| Users & settings | users.*, settings.routes, backup.routes | `/settings/*` | admin only; settings is a key/value table; backup downloads a JSON snapshot |
| Notifications | notifications/, scheduler.js | push registration on native | Expo push by role; cron reminders at 07:00, 08:00, 09:00, 1st-of-month, midnight |

---

## 8. Deployment topology

| Mode | API | Web | Notes |
|---|---|---|---|
| Local dev | `npm run dev` in `backend/` on **3000** (SQLEXPRESS via `.env`) | `npx expo start --web` (Metro, default 8081) | `mobile/.env` points at `http://localhost:3000/api/v1` |
| Docker Desktop | container `dairy-farm-api` on host **8080** | container `dairy-farm-web` (nginx) on host **8090** serving `mobile/dist` | export the web bundle with `EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1`; API reaches SQL Server through `host.docker.internal:1433` |
| Native | any reachable API URL | — | EAS build (`npm run build:android` / `build:ios`) |

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for step-by-step commands.

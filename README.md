# 🐄 Dairy Farm & Milk Delivery Management System

A production-ready Android / iOS / Web app for running a dairy business: customers and milk subscriptions, daily deliveries, monthly invoices and payments, cows, goats, hens and ducks, breeding and calving, milk production, medicines, income and expense ledgers, reports, notifications and backups.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile / Web | React Native 0.74 (Expo 51, expo-router 3.5) + TypeScript + NativeWind, TanStack Query, Zustand, react-hook-form + zod, PCB EnterpriseGrid on web |
| Backend | Node.js 20 + Express 4, JWT auth, role-based permissions, node-cron scheduler |
| Database | SQL Server (38 tables, idempotent migrations) |
| Documents | pdfkit invoices, ExcelJS reports |
| Messaging | Expo Push, SMTP e-mail, Meta WhatsApp Cloud API (with wa.me fallback), Fast2SMS OTP |
| Deployment | Docker Compose (API on 8080, nginx web on 8090) or local dev (API 3000, Expo 8081) |

## Documentation

| Document | What it covers |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | system overview, request flow, authentication, RBAC matrix, data conventions, module map, deployment topology |
| [docs/BACKEND_REFERENCE.md](docs/BACKEND_REFERENCE.md) | every API route with its guard, controller function blueprint, services and business rules, middleware, config, full DB schema, utils, seeds, tests, Dockerfile, known issues |
| [docs/MOBILE_REFERENCE.md](docs/MOBILE_REFERENCE.md) | app config, every route/screen with its data and actions, API client and all endpoint functions, store, hooks, utils, config-driven screens, types, components, PCB grid |
| [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | local setup, Docker deployment sequence, native builds, test users, troubleshooting |
| [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) | coding conventions and recipes: add a module, screen, ledger/animal type, permission, cron job, report; billing and breeding rule cheat-sheets |
| [FEATURES.md](FEATURES.md) | feature reference per module, workflows, role-wise access, scheduled jobs |
| [DAIRY_FARM_FEATURES.md](DAIRY_FARM_FEATURES.md) | original product specification |
| [TEST_CASES.md](TEST_CASES.md) | test catalogue and traceability |

## Features

✅ **Customer Management** — milk type, morning/evening quantity, rate, billing mode, active/inactive  
✅ **Smart Delivery Tracking** — monthly calendar per customer, statuses, reasons, mark-all, month lock  
✅ **Customer Requests** — extra milk, cancel (date range), dispute past days; approval workflow with push alerts  
✅ **Monthly Invoices** — billed up to today, effective milk rates, delivery charge, PDF, e-mail, WhatsApp/SMS  
✅ **Payments & Outstanding** — record payments, pending collections report  
✅ **Products, Orders, Subscriptions, Milk Rates, Month Closures** — API-complete masters for pricing and billing control  
✅ **Herd** — cows and buffaloes, goats with weight tracking, hens, ducks, medicine master  
✅ **Breeding** — 21-day mating cycles, conception decision, pregnancy tracking, calving and calf records  
✅ **Milk Production** — per-cow daily entries, farm totals, reports  
✅ **Finance** — expense and income ledgers with custom categories, profit & loss, cash book, 12-month trend  
✅ **Reports** — monthly Excel, delivery exceptions, pending payments, pregnant cows, milk production, finance  
✅ **Role-Based Access** — Admin, Supervisor, Manager, Delivery Person, Cattle Caretaker, Farm Sweeper/Cleaner, Customer  
✅ **Notifications** — daily delivery reminder, monthly invoice reminder, mating-cycle, calving and health alerts  
✅ **Web & Mobile** — same codebase; data grids with export on web, card lists on phones  

## Quick Start

```bash
# 1. Backend
cd backend && npm install
cp .env.example .env            # SQL Server, JWT, SMTP, WhatsApp, Google settings
npm run db:migrate              # create / upgrade schema
npm run db:seed                 # optional sample data
npm run db:seed:test-users      # 7 role logins (see below)
npm run dev                     # http://localhost:3000

# 2. Mobile / Web
cd ../mobile && npm install
cp .env.example .env            # EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
npx expo start --web            # http://localhost:8081
```

Docker deployment (API 8080, web 8090) is described step by step in [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

## Login And Access

Use **mobile number + password** as the primary login. Gmail login is available for owners or trusted staff with Google accounts; PIN login is a fallback for local/admin access.

| Role | Best For | Access |
|------|----------|--------|
| Admin | Owner | Everything: users, settings, products, billing, backup |
| Supervisor | Daily operations lead | Customers, deliveries, requests, cattle, finance ledgers, reports |
| Manager | Billing and customer operations | Customers, invoices, payments, requests, finance ledgers, reports |
| Delivery Person | Milk delivery staff | Customer list, delivery updates, request approvals |
| Cattle Caretaker | Herd staff | Cows, goats, poultry, health, breeding, milk production |
| Farm Sweeper/Cleaner | Cleaning staff | Dashboard only |
| Customer | Milk customer | Own dashboard, own delivery calendar, extra/cancel/dispute requests |

The full permission matrix is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#5-authorization-rbac); the source of truth is `backend/src/config/rbac.js`.

`Users` and `Customers` are separate tables. `Users` stores login, password, role and security data; `Customers` stores delivery, billing, address and milk data. Customer logins are linked to customer records through `CustomerUserAccess(UserId, CustomerId)`.

Customer delivery changes are tracked in `CustomerDeliveryRequests`: customers can request extra milk or cancel milk for future dates (cancellations support a From–To range, one tracked request per day) and dispute a past day in the current or previous month. Staff with `customer_requests:manage` approve or reject with a reason; disputes are resolved by Admin only and auto-correct the delivery calendar. All actions are written to `AuditLog`.

Test logins created by `npm run db:seed:test-users` (password `Test@1234`):

| Role | Mobile |
|------|--------|
| Admin | 9000000001 |
| Supervisor | 9000000002 |
| Manager | 9000000003 |
| Delivery Person | 9000000004 |
| Cattle Caretaker | 9000000005 |
| Farm Sweeper/Cleaner | 9000000006 |
| Customer | 9000000007 |

## WhatsApp Business Invoice Messages

Monthly invoice messages are sent through your Meta WhatsApp Business Cloud API account. Add to `backend/.env`:

```env
WHATSAPP_ACCESS_TOKEN=your_meta_whatsapp_cloud_api_token
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_API_VERSION=v20.0
```

The invoice screen has **Send Monthly WhatsApp Bills** for the selected month. Each message includes customer name, invoice number, delivered and missed days, total quantity, payment status and amount. If credentials are missing or Meta rejects a message, the backend returns a prefilled `wa.me` link instead.

Invoice generation uses the selected month. Completed months are billed in full; the current month is billed only up to today. Approved extra-milk requests add litres; approved cancellations remove the day. The milk rate is the `MilkRates` rate effective on the 1st of the month (falling back to the customer's own rate), plus the configured monthly delivery charge.

## Project Structure

```
MobileAPP/
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── config/          env, RBAC matrix, finance categories, logger
│   │   ├── controllers/     one per module + animalMaster / ledger factories
│   │   ├── routes/          one per module, mounted under /api/v1
│   │   ├── services/        billing, finance, categories, invoicePdf, otp, scheduler, notifications/
│   │   ├── middleware/      authenticate, requirePermission, requireAdmin
│   │   ├── database/        db.js (pool), migrate.js (schema)
│   │   └── utils/           response, helpers, monthLock, animalLookup, deliveryStatus, seeds
│   └── tests/               roleAccessTest.js, customerAdminE2E.js
├── mobile/
│   ├── app/                 expo-router screens
│   │   ├── (tabs)/          dashboard, delivery, cows, invoices, finance, more
│   │   ├── auth/            login
│   │   ├── customers/ delivery/ invoices/ payments/
│   │   ├── cows/ animals/[type]/ breeding/ calving/ milk/ medicines/
│   │   ├── finance/[type]/  expenses & income ledgers
│   │   ├── reports/         monthly, finance, ledger, exceptions, pending, milk
│   │   └── settings/        business info, users, products & pricing
│   ├── src/
│   │   ├── api/             client.ts, endpoints.ts
│   │   ├── components/      common/, grid/ (native + .web.tsx), layout/Sidebar
│   │   ├── config/          ledgers.ts, simpleAnimals.ts
│   │   ├── hooks/ store/ types/ utils/
│   │   └── lib/Grid/package local @oeconnection/pcb-grid
│   ├── dist/                static web export served by nginx
│   └── nginx-web.conf
├── docs/                    architecture, backend & mobile references, deployment, developer guide
├── docker-compose.yml / docker-compose.override.yml
└── setup-sqlserver-tcp.ps1
```

## Color Scheme

| Color | Meaning |
|-------|---------|
| 🟢 Green | Delivered / Active / Paid / Income |
| 🔴 Red | Not Delivered / Overdue / Expense |
| 🟠 Orange | Pending / Due Soon |
| 🔵 Blue | Reports / Primary Actions |
| 🟣 Purple | Cow & Goat Management |

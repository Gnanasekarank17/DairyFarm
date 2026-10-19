# Mobile / Web App Reference — `mobile/`

Expo 51 · expo-router 3.5 · React Native 0.74.1 · react-native-web 0.19 · TypeScript 5.3 · NativeWind 2 · Zustand 4 · TanStack Query 5 · axios · react-hook-form + zod · `@oeconnection/pcb-grid` (local copy). Everything below is relative to `mobile/`.

Contents: [Config & build](#1-configuration-and-build) · [Routing](#2-routing-app) · [API layer](#3-api-layer) · [State](#4-state-srcstoreauthstorets) · [Hooks & utils](#5-hooks-and-utils) · [Config-driven screens](#6-config-driven-screens) · [Types](#7-types-srctypesindexts) · [Components](#8-components) · [PCB Grid](#9-oeconnectionpcb-grid-srclibgridpackage) · [Known gaps](#10-known-gaps)

---

## 1. Configuration and build

### app.json
| Key | Value |
|---|---|
| name / slug / version | Dairy Farm Manager / `dairy-farm-manager` / 1.0.0 |
| scheme | `dairyfarm` |
| Android | package `com.dairyfarm.manager`; permissions CAMERA, READ/WRITE_EXTERNAL_STORAGE, RECEIVE_BOOT_COMPLETED, VIBRATE |
| iOS | bundleIdentifier `com.dairyfarm.manager`, tablet supported |
| plugins | `expo-router`, `expo-font`, `expo-notifications`, `expo-image-picker`, `@react-native-google-signin/google-signin` (iosUrlScheme placeholder) |
| web | bundler metro, `output: static` |
| extra.eas.projectId | placeholder `your-eas-project-id` |

### Environment (`.env`, template `.env.example`)
| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | backend base URL, e.g. `http://localhost:3000/api/v1` (dev) or `http://localhost:8080/api/v1` (Docker). Fallback in `client.ts` is `http://localhost:3000/api/v1`. **Baked into the bundle at build/export time.** |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth web client id (native `GoogleSignin.configure` and web Google Identity Services) |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | iOS client id |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | passed to `Notifications.getExpoPushTokenAsync` |

### Tooling files
| File | Role |
|---|---|
| `index.js` / `package.json#main` | `expo-router/entry` |
| `babel.config.js` | `babel-preset-expo` + `nativewind/babel` with `tailwindConfigPath: ./tailwind.nativewind.config.js` |
| `tailwind.config.js` | PostCSS/web CSS; content `./src/**`, `./app/**`; brand colours `primary #2563EB`, `delivered #16A34A`, `missed #DC2626`, `pending #D97706`, `cow #7C3AED`, `report #2563EB` |
| `tailwind.nativewind.config.js` | same theme, but `content` **excludes `*.web.tsx` and `src/lib/**`** so NativeWind does not rewrite DOM `className` in web-only files |
| `postcss.config.js` | tailwindcss + autoprefixer |
| `global.css` | Manrope font, Tailwind layers, brand CSS variables, body gradient (imported in `app/_layout.tsx`) |
| `tsconfig.json` | extends `expo/tsconfig.base`, no path aliases |
| `nginx-web.conf` | `try_files $uri $uri.html $uri/ /index.html`; `/_expo/` cached 30 days |

**Web vs native.** Metro picks `X.web.tsx` over `X.tsx` on web. Web-only files must use plain DOM + inline styles (or real Tailwind classes), never RN components with `className`; otherwise react-dom crashes with "Failed to set an indexed property [0] on CSSStyleDeclaration". On web at width ≥ 900 px the Sidebar replaces the bottom tabs; the web `Select` is a native `<select>`; Google login uses GIS; push registration is skipped.

### Scripts and commands
| Command | Purpose |
|---|---|
| `npm start` / `npm run web` / `npm run android` / `npm run ios` | Expo dev server |
| `npm run build:android` / `npm run build:ios` | EAS builds |
| `npx expo export --platform web` | static web export to `dist/` (served by nginx in Docker) |
| `node --stack-size=16000 node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` | typecheck (plain `npx tsc` overflows the stack on recent Node) |

---

## 2. Routing (`app/`)

### Layouts and auth flow
| File | Behaviour |
|---|---|
| `app/_layout.tsx` | creates `QueryClient` (retry 2, staleTime 5 min) and Toast host; on mount `loadAuth()` + `registerForPushNotifications()`; redirects to `/auth/login` when not signed in; renders `<Sidebar/>` on wide web |
| `app/index.tsx` | loading screen, then `/(tabs)/dashboard` or `/auth/login` |
| `app/auth/_layout.tsx` | header-less stack |
| `app/(tabs)/_layout.tsx` | redirects when signed out; hides tabs by permission (`delivery` → deliveries:view, `cows` → cattle:view, `invoices` → billing:view, `finance` → expenses:view or income:view) |
| `app/auth/login.tsx` | tabs **Mobile** (default), **PIN**, **Gmail**. On success `setAuth(user, token)` → dashboard. No OTP UI |

Permission checks live mostly in navigation (tabs, Sidebar, More menu). Only `finance/[type]` screens guard themselves; the server is the real gate.

### Route table
RQ = react-query key. "Access" = permission that shows the entry in navigation.

| Route (file) | Purpose | Data (endpoint → RQ key) | Actions | Access |
|---|---|---|---|---|
| `/dashboard` (`(tabs)/dashboard.tsx`) | staff KPIs or customer summary + request form | `dashboardApi.getSummary` / `getCustomerSummary` → `['dashboard', role]` | customer: `customerRequestsApi.create`; quick links | all |
| `/delivery` (`(tabs)/delivery.tsx`) | monthly calendar (all or one client), reason modal, request approvals | `customersApi.getAll` → `['customers-active']`; `deliveriesApi.getAllMonthly` → `['deliveries-monthly', y, m]`; `getMonthly` → `['delivery', cust, y, m]`; `customerRequestsApi.getMonthly` → `['customer-requests', y, m]` | `updateDay`, `markAll`, `customerRequestsApi.updateStatus` | deliveries:view |
| `/cows` (`(tabs)/cows.tsx`) | herd list, filters, quick links | `cowsApi.getAll(status, gender, animalType)` → `['cows', …]` | add; `CowsDataGrid` | cattle:view |
| `/invoices` (`(tabs)/invoices.tsx`) | monthly invoices (cards / grid), filters | `invoicesApi.getAll(y, m, cust)` → `['invoices', …]`; `customersApi.getAll` | `generate` (billing:manage), WhatsApp/SMS, `sendMonthlyWhatsApp`, pay | billing:view |
| `/finance` (`(tabs)/finance.tsx`) | finance hub: month income/expense/net, 12-month `MiniBarChart`, menu | `reportsApi.monthlyFinance` → `['report-finance', y, m]`; `financeTrend` → `['report-finance-trend', y]` | links to ledgers, P&L, cash book | expenses:view or income:view |
| `/more` (`(tabs)/more.tsx`) | profile + permission-filtered menu; customers get "My Delivery Calendar" | — | sign out | all |
| `/auth/login` | login | authApi | — | public |
| `/customers` | customer list | `customersApi.getAll` → `['customers']` | `toggleActive`; `CustomersDataGrid` | customers:view |
| `/customers/add`, `/customers/new` | create form (RHF + zod) | — | `customersApi.create` | customers:manage |
| `/customers/[id]` | detail | `getById` → `['customer', id]` | edit, delete, open calendar | customers:view |
| `/customers/[id]/edit` | edit form | `getById` | `customersApi.update` | customers:manage |
| `/delivery/[customerId]?year&month` | one customer's calendar; customers can raise disputes | `customersApi.getById`; `deliveriesApi.getMonthly`; `customerRequestsApi.getMonthly` | staff: `updateDay`, `markAll`; customer: `create` (dispute) | deliveries or own id |
| `/invoices/[id]` | invoice detail + payments | `invoicesApi.getById` → `['invoice', id]`; `paymentsApi.getAll({invoiceId})` → `['invoice-payments', id]` | PDF (web blob / native download+share), WhatsApp, SMS, e-mail, record payment | billing:view |
| `/payments/record?invoiceId&customerId&amount&name` | record payment | — | `paymentsApi.record` → invalidates `['invoices']` | billing:manage |
| `/cows/add`, `/cows/new` | add cow/buffalo | — | `cowsApi.create` | cattle:manage |
| `/cows/[id]` | cow detail | `cowsApi.getById` → `['cow', id]` | edit, delete, breeding, milk | cattle:view |
| `/cows/[id]/edit` | edit cow | `getById` | `cowsApi.update` | cattle:manage |
| `/animals/[type]` (goats, hens, ducks) | config-driven list | `config.api.getAll` → `[type, filter, gender]` | add; `SimpleAnimalDataGrid` | cattle:view |
| `/animals/[type]/add` | add animal | — | `config.api.create` | cattle:manage |
| `/animals/[type]/[id]` | detail (+ goat weights/trend, breeding link) | `config.api.getById` → `[type, id]` | delete, `addWeight` | cattle:view |
| `/animals/[type]/[id]/edit` | edit animal | `getById` | `config.api.update` | cattle:manage |
| `/breeding` | mating & cycles list with conception decision | `breedingApi.getAll` → `['breeding','all']` | `setConception` | cattle |
| `/breeding/add?cowId&species` | record mating (Cow/Buffalo/Goat) | `cowsApi.getAll` (Female/Male), `goatsApi.getAll` | `breedingApi.create` | cattle:manage |
| `/breeding/pregnancies` | active pregnancies | `breedingApi.getPregnancies` → `['pregnancies']` | record calving | cattle:view |
| `/calving/record?pregnancyId&cowId` | record calving + N calves | — | `calvingApi.record` | cattle:manage |
| `/milk/add?cowId` | daily milk entry | — | `milkApi.addEntry` | cattle:manage |
| `/medicines` | medicine master CRUD | `medicinesApi.getAll` → `['medicines']` | create/update/delete | cattle:view |
| `/finance/[type]` (expenses, income) | ledger list: month picker, category tiles, `LedgerDataGrid` | `config.api.getAll({year, month})`, `getMonthlySummary`, `useLedgerCategories` | add/edit. **Guarded**: invalid type → `/more`; no view permission → `/dashboard` | expenses:view / income:view |
| `/finance/[type]/add?id` | create/edit ledger entry; custom categories | `config.api.getById`, `useLedgerCategories` | `create`/`update`, `useAddLedgerCategory`. **Guarded** by manage permission | *:manage |
| `/expenses`, `/expenses/add` | legacy redirects to `/finance/expenses…` | — | — | — |
| `/reports` | hub tiles | `reportsApi.milkProduction`, `pendingPayments`, `pregnantCows` | navigation | reports:view |
| `/reports/monthly` | invoice-based monthly report (`ReportGrid`) | `invoicesApi.getAll(y, m)` → `['report-monthly', y, m]` | export | reports:view |
| `/reports/finance` | profit & loss + trend | `monthlyFinance`, `financeTrend` | links | reports:view |
| `/reports/finance-ledger` | cash book with running balance | `financeLedger` → `['report-finance-ledger', y, m]` | export | reports:view |
| `/reports/delivery-exceptions` | missed deliveries + reasons | `deliveryExceptions` | export | reports:view |
| `/reports/milk-production` | cow-wise production | `milkProduction` | export | reports:view |
| `/reports/pending-payments` | outstanding invoices | `pendingPayments` | drill into calendar | reports:view |
| `/settings` | business info, products link, backup, users | `settingsApi.get` → `['settings']`; `usersApi.getAll` → `['users']` | `settingsApi.update`, `backupApi.create`, users CRUD | settings:manage |
| `/settings/products` | product price list + monthly delivery charge | `productsApi.getAll` → `['products']`; `settingsApi.get` | products CRUD, `settingsApi.update({ monthlyDeliveryCharge })` | settings:manage |

**Sidebar groups (web ≥ 900 px, `src/components/layout/Sidebar.tsx`)**: Overview (Dashboard, Delivery) · Customers & Billing (Customers, Invoices, Payments) · Herd (Cows, Breeding, Pregnancies, Milk Production, Medicine Details, Goats, Hens, Ducks) · Finance (Finance Overview, Expenses, Income, Profit & Loss) · Reports & Settings (Reports, Settings). Each item is filtered by `hasPermission`.

---

## 3. API layer

### `src/api/client.ts`
- `axios.create({ baseURL: EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1', timeout: 15000 })`, exported as `apiClient` and default.
- Request interceptor: `Authorization: Bearer` from `AsyncStorage['auth_token']`.
- Response interceptor: deep-camelises keys (first letter lower-cased) except for `responseType: 'blob'`; on **401** calls `useAuthStore.getState().clearAuth()`.
- No token refresh, no offline queue. Screens read `res.data.data`.

### `src/api/endpoints.ts` — every function
Paths are relative to the base URL.

| Group | Function → request |
|---|---|
| **authApi** | `googleSignIn({idToken})` POST `/auth/google` · `mobilePasswordLogin(mobile, password)` POST `/auth/mobile-login` · `pinLogin(pin)` POST `/auth/pin` · `me()` GET `/auth/me` · `updatePushToken(token)` PUT `/auth/push-token` · `requestOtp` / `resendOtp` / `verifyOtp` POST `/auth/otp/{request,resend,verify}` · `otpStatus` GET `/auth/otp/status` |
| **usersApi** | `getAll` GET `/users` · `getRoles` GET `/users/roles` · `getById` · `create` POST · `update` PUT `/users/:id` · `toggleActive` PATCH `/users/:id/toggle` · `delete` |
| **dashboardApi** | `getSummary` GET `/dashboard/summary` · `getCustomerSummary` GET `/dashboard/customer-summary` |
| **customerRequestsApi** | `getMonthly(y, m, customerId?)` GET `/customer-requests/:y/:m` · `create({requestDate, endDate, requestType, extraQuantity, reason, claimedStatus?})` POST · `updateStatus(id, {status, actionReason})` PATCH `/customer-requests/:id/status` |
| **customersApi** | `getAll(active?)` · `getById` · `create` · `update` · `toggleActive` PATCH `/customers/:id/toggle` · `delete` |
| **deliveriesApi** | `getToday` GET `/deliveries/today` · `getStatuses` GET `/deliveries/statuses` · `getAllMonthly(y, m)` · `getMonthly(cust, y, m)` · `updateDay(cust, y, m, {date, delivered?, status?, quantity?, reason?, comments?})` PUT `…/day` · `markAll(cust, y, m, {delivered})` PUT `…/mark-all` |
| **invoicesApi** | `generate({year, month, customerId?})` POST `/invoices/generate` · `getAll(y?, m?, cust?)` · `getById` · `getByCustomer` · `getPdfUrl(id)` (string) · `getWhatsAppLink(id)` GET `/invoices/:id/whatsapp` · `getMonthlyMessageLinks(y, m)` · `sendMonthlyWhatsApp(y, m)` POST · `sendEmail(id)` POST `/invoices/:id/email` |
| **paymentsApi** | `getAll(params)` GET `/payments` · `getPending` GET `/payments/outstanding` · `record(body)` POST `/payments` |
| **cowsApi** | `getAll(status?, gender?, animalType?)` · `getById` · `create` · `update` · `delete` · `getHealth(id)` GET `/cows/:id/health` · `addHealth(id, body)` POST |
| **createSimpleAnimalApi(base)** | `getAll(status?, gender?)`, `getById`, `create`, `update`, `delete` → **goatsApi** (`/goats`, + `getWeights`, `addWeight({weighedDate?, weightKg, notes?})`, `deleteWeight`), **hensApi** (`/hens`), **ducksApi** (`/ducks`) |
| **breedingApi** | `create` POST `/breeding` · `getAll({cowId?, status?, conception?})` · `getByCow` · `confirmPregnancy(id, body)` PUT `…/confirm-pregnancy` · `setConception(id, {conceived, confirmationDate?, veterinarian?, nextMatingDate?})` PUT `…/conception` · `getPregnancies()` GET `/breeding?status=Pregnant` |
| **calvingApi** | `record` POST `/calving` · `getAll` · `getCalves` GET `/calving/calves` · `updateCalf` PUT `/calving/calves/:id` |
| **milkApi** | `addEntry` POST `/milk-production` · `getDaily(date)` · `getMonthly(y, m)` · `getCow(cowId)` GET `/milk-production/cow/:cowId` |
| **reportsApi** | `monthlyExcel(y, m)` (blob) · `deliveryExceptions` · `pendingPayments` · `pregnantCows` · `milkProduction(y, m)` · `monthlyFinance(y, m)` · `financeLedger(y, m)` · `financeTrend(year)` |
| **medicinesApi** | `getAll(active?)` · `getById` · `create` · `update` · `toggleActive` · `delete` |
| **createLedgerApi(base)** | `getAll({year?, month?, category?, from?, to?})` · `getById` · `getMonthlySummary(y, m)` GET `base/summary/:y/:m` · `create` · `update` · `delete` · `getCategories` GET `base/categories` · `createCategory({name})` · `deleteCategory(id)` → **expensesApi** (`/expenses`), **incomeApi** (`/income`) |
| **settingsApi** | `get` GET `/settings` · `update(body)` PUT `/settings` |
| **productsApi** | `getAll(active?)` · `getLowStock` · `create` · `update` · `adjustStock(id, {delta?, set?})` PATCH `/products/:id/stock` · `toggleActive` · `delete` |
| **ordersApi** | `getAll({status?, customerId?})` · `getById` · `create({customerId?, orderDate?, notes?, items:[{productId, quantity}]})` · `updateStatus(id, {status, actionReason?})` PATCH · `cancel(id, {reason})` POST |
| **subscriptionsApi** | `getAll({status?, customerId?})` · `getById` · `getHistory` · `create({customerId?, milkType?, morningQuantity, eveningQuantity, rate?, deliveryDays?, startDate?, notes?})` · `amend(id, {...})` PUT · `updateStatus(id, {status, actionReason?})` PATCH · `pause(id, {fromDate, toDate?, reason?})` · `resume(id)` · `cancel(id, {reason})` |
| **milkRatesApi** | `getAll(milkType?)` · `getEffective(milkType, date?)` · `create({milkType, ratePerLiter, effectiveFrom, notes?})` · `update(id, {ratePerLiter, status?, notes?})` · `delete` |
| **monthClosuresApi** | `getAll(year?)` · `getStatus(y, m)` · `close(y, m, {notes})` POST `…/close` · `reopen(y, m, {reason})` POST `…/reopen` |
| **backupApi** | `create` POST `/backup/create` · `list` GET `/backup/list` |

Functions defined but not yet called by any screen: `authApi.me/updatePushToken` and all OTP functions; `usersApi.getRoles/getById`; `deliveriesApi.getToday/getStatuses`; `invoicesApi.getByCustomer/getMonthlyMessageLinks`; `paymentsApi.getPending`; `cowsApi.getHealth/addHealth`; `goatsApi.getWeights/deleteWeight`; `breedingApi.getByCow/confirmPregnancy`; all of `calvingApi` except `record`; `milkApi.getDaily/getMonthly/getCow`; `reportsApi.monthlyExcel`; `medicinesApi.getById/toggleActive`; ledger `deleteCategory`; `productsApi.getLowStock/adjustStock`; all of `ordersApi`, `subscriptionsApi`, `milkRatesApi`, `monthClosuresApi`; `backupApi.list`.

---

## 4. State (`src/store/authStore.ts`)

Zustand store, persisted by hand in AsyncStorage (`auth_token`, `auth_user`).

| Member | Purpose |
|---|---|
| `user: User \| null`, `token: string \| null`, `isLoading: boolean` | state (`isLoading` starts true) |
| `setAuth(user, token)` | writes both keys, sets state |
| `clearAuth()` | removes both keys, nulls state |
| `loadAuth()` | reads both keys; hydrates if present; sets `isLoading=false` |

---

## 5. Hooks and utils

### `src/hooks/useLedgerCategories.ts`
| Export | Purpose |
|---|---|
| `ledgerCategoriesKey(config)` | `[\`${queryKey}-categories\`]` |
| `useLedgerCategories(config, enabled=true)` | query over `config.api.getCategories()` (10 min stale); returns `{ ...query, categories, names }` (`names` falls back to `config.defaultCategories`) |
| `useAddLedgerCategory(config, onAdded?)` | mutation `createCategory({name})`; invalidates categories + summary; toasts |

### `src/utils/helpers.ts`
`formatDate(d)` → `yyyy-MM-dd` · `formatDisplay(d)` → `dd MMM yyyy` · `formatMonthYear(y, m)` → `MMMM yyyy` · `today()` · `getMonthDays(y, m)` · `getMonthDateArray(y, m)` · `initMonthlyDeliveries(y, m)` · `daysUntil(date)` · `pregnancyStatusColor(days)` (red <0, orange ≤30, green) · `formatCurrency(n)` (₹, 2 dp) · `parseDeliveryData(raw)` · `isActiveValue(v)` (`true` or `'true'`).

### `src/utils/permissions.ts`
`ROLE_LABELS`, `normalizeRole(role?)` (aliases → `UserRole`), `permissionsForUser(user?)` (server permissions ∪ role defaults), `hasPermission(user, permission)`. The private `ROLE_PERMISSIONS` mirrors the backend matrix (see ARCHITECTURE §5).

### `src/utils/notifications.ts`
Sets the foreground notification handler at import. `registerForPushNotifications()` → Expo push token (null on web / denied / error). The token is currently **not** sent to `PUT /auth/push-token`.

### `src/utils/offline.ts` (currently unused)
`cacheData(key, data, ttlMs=5min)`, `getCachedData<T>(key)`, `queueOfflineAction({method, url, data?})`, `getOfflineQueue()`, `clearOfflineQueue()`.

---

## 6. Config-driven screens

### Ledgers — `src/config/ledgers.ts` → routes `/finance/[type]`
`LedgerConfig`: `label, singular, icon, emoji, color, tone ('expense'|'income'), api: LedgerApi, defaultCategories, categoryMeta{name→{icon,color}}, fieldLabels{name→{item, itemPlaceholder, party, partyPlaceholder, showQuantity}}, defaultFieldLabels, dateField ('expenseDate'|'incomeDate'), partyField ('vendor'|'source'), partyHeader, viewPermission, managePermission, queryKey, emptySubtitle, accountNamePlaceholder`.

`LEDGER_CONFIG = { expenses: {… red, expensesApi, EXPENSE_CATEGORIES, expenses:*}, income: {… green, incomeApi, INCOME_CATEGORIES, income:*} }`.

Helpers: `isLedgerTypeSlug`, `getCategoryMeta(config, name)` (hashed colour for custom categories), `getFieldLabels`, `ledgerDate(row, config)`, `ledgerParty(row, config)`, `ledgerCategoryLabel(row)` ("Other - {accountName}"), `ledgerInvalidationKeys(config)` → `[queryKey]`, `[queryKey-summary]`, `['dashboard']`, `['report-finance']`, `['report-finance-ledger']`, `['report-finance-trend']`.

**Add a ledger type**: backend ledger factory endpoints → `endpoints.ts` `createLedgerApi('/x')` → seed categories + permissions in `types/index.ts` → `ROLE_PERMISSIONS` in `permissions.ts` → `LEDGER_CONFIG.x` → nav items in Sidebar, More, `(tabs)/finance.tsx`.

### Simple animals — `src/config/simpleAnimals.ts` → routes `/animals/[type]`
`SimpleAnimalConfig`: `label, singular, icon, emoji, color, api: SimpleAnimalApi, hasGender, hasBreeding, hasWeightTracking`.

| Key | Colour | API | Flags |
|---|---|---|---|
| goats | `#7C3AED` | goatsApi | gender, breeding, weight tracking |
| hens | `#D97706` | hensApi | none |
| ducks | `#0891B2` | ducksApi | none |

Also: `SIMPLE_ANIMAL_STATUSES` [Active, Sold, Deceased], `BREEDING_ANIMAL_STATUSES` (+ Mated, Pregnant), `isSimpleAnimalTypeSlug`, `WeightTrend`, `getWeightTrend(current, previous)` (loss <0, gain ≥2.5 kg, else stable).

**Add an animal type**: backend CRUD at `/x` → `createSimpleAnimalApi('/x')` → `SIMPLE_ANIMAL_CONFIG.x` → nav items (`cattle:view`, `match: ['animals/x']`) → if `hasBreeding`, extend `breeding/add.tsx` and `BreedingRecord.species`; if `hasWeightTracking`, the API needs `addWeight`.

---

## 7. Types (`src/types/index.ts`)

Key entities:

| Type | Fields |
|---|---|
| `Customer` | id, name, mobile, email, address, dailyQuantity, morningQuantity, eveningQuantity, milkType ('Cow Milk' \| 'Buffalo Milk' \| 'Aavin Milk' \| 'Other'), ratePerLiter, billingMode ('Monthly Full Check' \| 'Daily Check'), isActive, createdAt, updatedAt |
| `Cow` | id, name, tagNumber, breed, color, gender, animalType (Cow \| Buffalo), dateOfBirth, purchaseDate, purchaseCost, currentStatus (Active \| Pregnant \| Dry Period \| Sold \| Deceased), photoUrl, notes |
| `DeliveryRecord` | id, customerId, customerName?, year, month, deliveredDays, missedDays, deliveryData, reasonData?, statusData?, quantityData?, totalQuantity, totalAmount |
| `Invoice` | id, invoiceNumber, customerId, customerName, month, year, dailyQuantity, ratePerLiter, deliveredDays, missedDays, totalQuantity, amount, paymentStatus (Pending \| Partial \| Paid), missedDetails, deliveryCharge?, createdAt |
| `Payment` | id, invoiceId, customerId, invoiceNumber, amountDue, amountPaid, balance, paymentDate, paymentMode, notes, status |
| `User` | id, name, email, mobile?, role: UserRole, permissions?: Permission[], customerIds?: string[] |
| `UserRole` | `'admin' \| 'supervisor' \| 'manager' \| 'deliveryperson' \| 'cattlecaretaker' \| 'farmcleaner' \| 'customer'` |
| `Permission` | union of the 22 permissions used by the app (the backend has 26; orders/subscriptions are not yet in the mobile union) |

Other groups: delivery (`DeliveryData`, `DeliveryStatus`, `DeliveryStatusData`, `DeliveryQuantityData`, `ReasonData`, `REASON_CATEGORIES`), requests/dashboard (`CustomerDeliveryRequest`, `CustomerDashboardSummary`, `DashboardSummary`, `DashboardFinance`), products/orders (`Product`, `OrderStatus`, `OrderItem`, `Order`), subscriptions/rates/closures (`SubscriptionStatus`, `Subscription`, `SubscriptionHistory`, `MilkRate`, `MonthClosure`), herd (`SimpleAnimal`, `GoatWeightRecord`, `HealthRecord`, `BreedingRecord`, `PregnancyRecord`, `CalvingRecord`, `CalfRecord`, `MilkProduction`, `MedicineMaster`), finance (`EXPENSE_CATEGORIES`, `INCOME_CATEGORIES`, `PAYMENT_MODES`, `LedgerCategory`, `LedgerEntryBase`, `Expense`, `Income`, `LedgerEntry`, `LedgerCategoryTotal`, `LedgerMonthlySummary`, `MonthlyFinanceReport`, `FinanceLedgerRow`, `FinanceLedgerReport`, `FinanceTrendPoint`).

---

## 8. Components

### `common/`
| Component | Props |
|---|---|
| `Badge` | `{ label, variant?: success \| error \| warning \| info \| purple }` |
| `Button` | `{ title, onPress, variant?: primary \| secondary \| danger \| success \| outline, loading?, disabled?, size?: sm \| md \| lg, className?, style? }` |
| `Card` | `{ children, className?, style? }` |
| `EmptyState` | `{ icon?, title, subtitle? }` |
| `Input` | `TextInputProps & { label?, error?, required? }` |
| `LoadingScreen` | `{ message? }` |
| `MiniBarChart` | `{ data: FinanceTrendPoint[], height?, highlightMonth?, showValues? }`; exports `INCOME_COLOR`, `EXPENSE_COLOR` |
| `MonthPicker` | `{ year, month, onChange(y, m), minYear?, maxYear?, disableFuture?, className? }` |
| `Select` / `Select.web` | `{ label?, value, options: {label, value, color?, accent?}[], onChange, placeholder?, required?, error?, disabled? }` (modal list on native, `<select>` on web) |
| `StatCard` | `{ title, value, icon, bgColor, iconColor, textColor?, subtitle? }` |

### `layout/Sidebar.tsx`
Web-only desktop navigation (see §2), footer with user name, role label and Sign Out.

### `grid/` — native + web pairs
Each grid has `X.tsx` (FlatList/ScrollView cards, NativeWind) and `X.web.tsx` (plain DOM rendering PCB `EnterpriseGrid`). Shared props live in `X.types.ts` where both need them.

```ts
import { EnterpriseGrid } from '@oeconnection/pcb-grid/dist/enterprise.js';
import { type ColDef, type ICellRendererParams } from '@oeconnection/pcb-grid';
import '@oeconnection/pcb-grid/dist/core.css';
```

| Grid | Props | Web behaviour |
|---|---|---|
| `CowsDataGrid` | `{ cows, refreshing?, onRefresh? }` | inline edit of name, status, tag, breed, color, gender, animalType, dob, purchaseCost via `cowsApi.update`; actions Breeding, Milk, Health |
| `CustomersDataGrid` | `{ customers, onToggleActive, refreshing?, onRefresh? }` | inline edit of contact, quantities, rate, milkType via `customersApi.update`; Edit, Pause/Play |
| `InvoicesDataGrid` | `{ invoices, onMessage(id, 'whatsapp' \| 'sms'), onPay(inv), canManage }` | read-only, sum aggregates, status pill; open, WhatsApp, SMS, Pay |
| `LedgerDataGrid` | `{ type, config, entries, canManage }` | click-to-edit cells when `canManage` (category / paymentMode selects); delete; invalidates `ledgerInvalidationKeys` |
| `SimpleAnimalDataGrid` | `{ type, config, animals }` | inline edit per config flags; view/weigh, edit, delete |
| `ReportGrid` | `{ columns: {field, headerName, minWidth?, aggregate?}[], rows, filename, noRowsMessage?, stateId?, onRowPress? }` | maps columns to `ColDef`, `gridId = stateId ?? filename`; `onRowPress` ignored on web |

`EditableCell.web.tsx`: `EditableCell({ value, editing, onStartEdit, onCommit, onCancel, type?: 'text' \| 'number', options?, displayValue? })` (Enter/blur commit, Escape cancel) and `useCellEditing()` → `{ editing, isEditing(id, field), startEdit, stopEdit }`.

---

## 9. `@oeconnection/pcb-grid` (`src/lib/Grid/package`)

- Declared in `package.json` as `"@oeconnection/pcb-grid": "file:./src/lib/Grid/package"`; npm installs it as a **symlink** `node_modules/@oeconnection/pcb-grid → src/lib/Grid/package`. If the project folder is moved or copied the link is lost and TypeScript reports `Cannot find module '@oeconnection/pcb-grid'` in every `*.web.tsx` grid. Fix: `npm install` in `mobile/`.
- v1.0.30, built on TanStack Table/Virtual; bundles chart.js, jspdf, xlsx, date-fns 4; peers react 18/19, react-dom, lucide-react.
- Entry points: `.` (core `DataGrid`: sorting, filters, grouping, pin/resize/reorder, conditional formatting, pivot, saved views, CSV/Excel/PDF export, themes, density), `./enterprise` (`EnterpriseGrid` with charts), `./styles` → `dist/core.css`, `./dist/*`.
- Ships only Tailwind utilities (no Preflight); `global.css` supplies the base reset. License key is optional (warning only).
- AG-Grid-like `ColDef<T>`: `field, headerName, width/minWidth, type: 'numericColumn', aggregate, valueFormatter, cellRenderer, pinned, sortable, filter`.

---

## 10. Known gaps

- Links to routes that do not exist: `/payments` (dashboard quick action and More menu; only `/payments/record` exists), `/cows/[id]/health`, `/settings/backup`.
- Permission checks are navigation-only except `finance/[type]`; web grids allow inline edits for anyone who can see them (the server still enforces permissions).
- Push token is obtained but never sent to the backend.
- OTP login exists in the API but has no UI.
- Orders, subscriptions, milk rates and month closures have API functions and types but no screens.
- `assets/*.png` are placeholder images; replace before release. `app.json` still has placeholder EAS project id and iOS Google URL scheme.
- Installed but unused: react-native-mmkv, react-native-paper, react-native-calendars, react-native-chart-kit; `src/utils/offline.ts`.

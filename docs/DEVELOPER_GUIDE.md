# Developer Guide — conventions and how-to recipes

Practical instructions for extending the system. Read [ARCHITECTURE.md](ARCHITECTURE.md) first; use [BACKEND_REFERENCE.md](BACKEND_REFERENCE.md) and [MOBILE_REFERENCE.md](MOBILE_REFERENCE.md) as lookup tables.

---

## 1. Conventions

**Backend**
- One module = `routes/<name>.routes.js` + `controllers/<name>.controller.js` (+ optional service). Mount the router in `routes/index.js`.
- Handlers are `async (req, res)`; always reply through `success()` / `error()` from `utils/response.js`. Creates return 201.
- Guard with `router.use(authenticate)` and `requirePermission(PERMISSIONS.X)` per route. Put data-scoping rules (customer sees own rows) inside the controller using `req.user.customerIds`.
- SQL via `query(sql, { param: { type: NVarChar, value } })`; prefer parameters over string interpolation.
- Ids: `generateId()`; dates: `formatDate()` / `today()` strings `yyyy-MM-dd`; timestamps: `new Date().toISOString()`.
- Schema changes go in `database/migrate.js` as idempotent `IF OBJECT_ID(...) IS NULL CREATE` / `IF COL_LENGTH(...) IS NULL ALTER TABLE ... ADD` blocks.
- Write an `AuditLog` row for anything a manager would want to trace (status changes, corrections, month close/reopen).
- Respect the month lock for anything that changes a billed month: call `guardMonthWrite(...)` and return 423 when it reports closed.

**Mobile**
- Screens live in `app/` (expo-router). Data access only through `src/api/endpoints.ts`; never call axios directly from a screen.
- Server data via TanStack Query; after a mutation invalidate the keys listed in the route table (MOBILE_REFERENCE §2).
- Forms: react-hook-form + zod schema.
- Permissions for navigation via `hasPermission(user, 'x:y')`; add the permission to `Permission` in `types/index.ts` and to `ROLE_PERMISSIONS` in `utils/permissions.ts`.
- Web-only files are `*.web.tsx` and must be plain DOM (no RN `className`). Shared prop types go in `X.types.ts`.
- Grids: native card list in `X.tsx`, PCB `EnterpriseGrid` in `X.web.tsx`.
- Typecheck with `node --stack-size=16000 node_modules/typescript/bin/tsc --noEmit -p tsconfig.json`.

---

## 2. Recipe: add a backend module

Example: a `Vaccinations` module.

1. **Schema** — append to `src/database/migrate.js`:
   ```js
   IF OBJECT_ID('dbo.Vaccinations','U') IS NULL
   CREATE TABLE dbo.Vaccinations (
     Id NVARCHAR(36) PRIMARY KEY, CowId NVARCHAR(36) NOT NULL, VaccineName NVARCHAR(150),
     GivenDate NVARCHAR(20), NextDueDate NVARCHAR(20), Notes NVARCHAR(500),
     CreatedAt NVARCHAR(30), UpdatedAt NVARCHAR(30)
   );
   ```
   Run `npm run db:migrate`.
2. **Permission** (if a new one is needed) — add to `PERMISSIONS` and the role matrix in `src/config/rbac.js`. Re-run migrate so `Permissions`/`RolePermissions` are seeded.
3. **Controller** — `src/controllers/vaccinations.controller.js` exporting `getAll, getById, create, update, remove`, each validating the body by hand and using `query`/`queryOne`.
4. **Routes** — `src/routes/vaccinations.routes.js`:
   ```js
   const router = require('express').Router();
   const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
   const c = require('../controllers/vaccinations.controller');
   router.use(authenticate);
   router.get('/', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getAll);
   router.post('/', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.create);
   // ...
   module.exports = router;
   ```
   Mount in `src/routes/index.js`: `router.use('/vaccinations', require('./vaccinations.routes'));`
5. **Test** — add a probe to `tests/roleAccessTest.js` (allow / deny matrix) and run it against a dev server.

For a plain single-table animal master, skip the controller and use the factory: `module.exports = createAnimalMasterController('RabbitMaster', 'Rabbit');`. For a new money ledger use `createLedgerController({...})` (see `expenses.controller.js`).

---

## 3. Recipe: add a mobile screen

1. **Types** — add the entity interface to `src/types/index.ts`.
2. **API** — add `vaccinationsApi = { getAll: () => apiClient.get('/vaccinations'), ... }` to `src/api/endpoints.ts`.
3. **Screen** — create `app/vaccinations/index.tsx` (list) and `app/vaccinations/add.tsx` (form):
   ```tsx
   const { data, isLoading } = useQuery({ queryKey: ['vaccinations'], queryFn: () => vaccinationsApi.getAll().then(r => r.data.data) });
   const mutation = useMutation({ mutationFn: vaccinationsApi.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vaccinations'] }) });
   ```
4. **Navigation** — add an item to `NAV_GROUPS` in `src/components/layout/Sidebar.tsx` and `MENU_GROUPS` in `app/(tabs)/more.tsx` with the permission that should reveal it.
5. **Grid (optional)** — `src/components/grid/VaccinationsDataGrid.tsx` (cards) + `.web.tsx` (EnterpriseGrid) + `.types.ts`.
6. Typecheck, then test on web (`npx expo start --web`) and on a device.

---

## 4. Recipe: add a ledger type or animal type

Both are config-driven; see MOBILE_REFERENCE §6 for the exact field list.

- **Ledger** (`/finance/<slug>`): backend `createLedgerController` + routes → `createLedgerApi('/<slug>')` → categories + permissions in `types/index.ts` → `ROLE_PERMISSIONS` → `LEDGER_CONFIG.<slug>` in `src/config/ledgers.ts` → nav items. Mirror category lists in `backend/src/config/finance.js`.
- **Animal** (`/animals/<slug>`): backend `createAnimalMasterController` + routes + migrate table → `createSimpleAnimalApi('/<slug>')` → `SIMPLE_ANIMAL_CONFIG.<slug>` in `src/config/simpleAnimals.ts` → nav items. Set `hasGender`, `hasBreeding`, `hasWeightTracking` as appropriate (breeding also needs `utils/animalLookup.js` and `SpeciesBreedingConfig` on the backend).

---

## 5. Recipe: add a permission

1. `backend/src/config/rbac.js`: add to `PERMISSIONS` and to each role's list. Run `npm run db:migrate` (seeds `Permissions` / `RolePermissions`).
2. `mobile/src/types/index.ts`: extend the `Permission` union.
3. `mobile/src/utils/permissions.ts`: add to `ROLE_PERMISSIONS` for the same roles.
4. Use `requirePermission(PERMISSIONS.NEW)` on routes and `hasPermission(user, 'new:perm')` in navigation.
5. Update the matrix in `FEATURES.md` and `TEST_CASES.md`.

---

## 6. Recipe: add a scheduled job

Add a `cron.schedule('<expr>', async () => { ... })` block to `backend/src/services/scheduler.js`. Use `getTokensByRoles([...])` + `sendPush(tokens, title, body, data)` for notifications. Remember jobs run on server local time and the scheduler is loaded once at startup.

---

## 7. Recipe: add a report

- Backend: add an inline handler in `src/routes/reports.routes.js` (already guarded by `reports:view`) or a function in `services/finance.service.js` for finance maths.
- Mobile: add `reportsApi.<name>` in `endpoints.ts`, a screen in `app/reports/<name>.tsx` rendering `ReportGrid` with `{ columns, rows, filename }`, and a tile in `app/reports/index.tsx`.

---

## 8. Billing rules cheat-sheet (do not break these)

- Bill only up to the cutoff: today for the current month, month end for past months, nothing for future months.
- Rate = `MilkRates` rate effective on the 1st of the month for the customer's milk type, else the customer's `RatePerLiter`.
- Approved `cancel_delivery` requests remove the day; approved `extra_milk` adds litres on delivered days only.
- `monthlyDeliveryCharge` (Settings) is added once per invoice when at least one day was delivered.
- Invoice number `INV-YYYYMM-<last 6 of customerId>`; unique per customer per month (regeneration recalculates).
- Closed months reject writes with 423 unless admin (then audit-logged).

---

## 9. Breeding rules cheat-sheet

- Mating → animal `Mated`, `NextCheckDate = mating + 21 days` (goat 19), `ConceptionStatus = Pending`, cycle number increments.
- Conception confirmed → `Pregnant`, `ExpectedCalvingDate = mating + 283 days` (goat 150) from `SpeciesBreedingConfig`.
- Not conceived → new cycle row starting at `nextMatingDate` (or old check date), animal stays `Mated`.
- Calving → pregnancy `Calved`, animal back to `Active`, one `CalfRecords` row per calf.
- Reminders: 08:00 daily for due checks (cows/buffalo only at present), 09:00 daily for calving due/overdue and health due dates.

---

## 10. Running the tests

```bash
cd backend
npm run db:migrate && npm run db:seed:test-users
NODE_ENV=development RATE_LIMIT_MAX=100000 npm run dev      # terminal 1
node tests/roleAccessTest.js                                 # terminal 2
node tests/customerAdminE2E.js                               # needs a real customer login (CUST_MOBILE/CUST_PASS)
```
See `TEST_CASES.md` at the repo root for the manual test catalogue and traceability to the spec.

---

## 11. Backlog of known gaps (from the code survey, 2026-10-01)

Backend: payments not cumulative; invoice rate stored inconsistently; goats excluded from mating-cycle cron and pregnant report; `GET /settings` open to all roles; unused `validate`/`requireRole`, Google services, `reports.service.js`; interpolated SQL filters in a few list endpoints; hard-coded fallback secrets.

Mobile: broken links `/payments`, `/cows/[id]/health`, `/settings/backup`; push token never sent to the API; no OTP UI; no screens for orders, subscriptions, milk rates, month closures; placeholder assets and EAS/Google ids; permission checks are navigation-only outside `finance/[type]`.

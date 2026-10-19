# Dairy Farm Management System — Test Case Documentation

This document describes the test cases used to verify the Dairy Farm Management System
against [DAIRY_FARM_FEATURES.md](./DAIRY_FARM_FEATURES.md). Every feature is tested **for
each of the 7 roles**, covering authentication, role-based access control (RBAC), and
end-to-end functional workflows.

- **Automated harness:** [`backend/tests/roleAccessTest.js`](./backend/tests/roleAccessTest.js)
- **Latest run:** 294 checks, **294 passed / 0 failed** — every role PASS.
- **Scope:** REST API (backend). The mobile app consumes these same endpoints.

---

## 1. Test Environment & Prerequisites

| Item | Value |
|------|-------|
| Backend base URL | `http://localhost:<PORT>/api/v1` (default port 3000) |
| Database | SQL Server `DairyFarmDB` |
| Auth | JWT bearer token from `POST /auth/mobile-login` |
| Test password (all seeded users) | `Test@1234` |
| Dev-mode flag | `NODE_ENV != production` exposes OTP `devCode` for OTP tests |
| Rate limit (test) | `RATE_LIMIT_MAX=5000` to avoid throttling during a full run |

### Prerequisites
1. Apply schema: `node src/database/migrate.js`
2. Seed role users: `npm run db:seed:test-users`
3. Start the server (for OTP tests use a dev-mode instance):
   `PORT=3100 RATE_LIMIT_MAX=5000 NODE_ENV=development node src/index.js`
4. Run the harness: `API_BASE=http://localhost:3100/api/v1 node tests/roleAccessTest.js`

> The harness is **self-cleaning**: all writes use fake IDs or `__RBAC_TEST__`-marked rows,
> and every artifact is deleted at the end. A post-run check confirms **0 residual rows**.

---

## 2. Test Users (Roles)

| Role | Mobile (login) | Notes |
|------|----------------|-------|
| Admin | `9000000001` | Full access to all permissions |
| Supervisor | `9000000002` | Operations + cattle management |
| Manager | `9000000003` | Operations + billing management |
| Delivery Person | `9000000004` | Deliveries + orders |
| Cattle Caretaker | `9000000005` | Cattle only |
| Farm Sweeper/Cleaner | `9000000006` | Dashboard only |
| Customer | `9000000007` | Self-service (linked to a real customer record) |

---

## 3. Permission Matrix (source of truth: `backend/src/config/rbac.js`)

Legend: ✅ = permission granted (endpoint returns non-403), ❌ = denied (endpoint returns 403).

| Permission | Admin | Supervisor | Manager | Delivery | Caretaker | Cleaner | Customer |
|------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| dashboard:view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| users:manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| customers:view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| customers:manage | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| deliveries:view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| deliveries:manage | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| customer_requests:view † | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| customer_requests:create † | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| customer_requests:manage † | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| billing:view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| billing:manage | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| cattle:view | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| cattle:manage | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| reports:view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| settings:manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| backup:manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| orders:view † | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| orders:create † | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| orders:manage | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| subscriptions:view † | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| subscriptions:create † | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| subscriptions:manage | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

† **Controller-gated** modules (customer-requests, orders, subscriptions) enforce access
inside the controller with ownership rules (a customer sees/acts on their own records only),
rather than by a single route permission. The remaining rows are **route-gated** via
`requirePermission()`.

---

## 4. Authentication Test Cases (TC-AUTH)

| ID | Title | Role(s) | Steps | Expected Result | Spec |
|----|-------|---------|-------|-----------------|------|
| TC-AUTH-01 | Login succeeds for every role | all 7 | `POST /auth/mobile-login` with role mobile + `Test@1234` | HTTP 200, JWT token returned | §3, §4 |
| TC-AUTH-02 | Returned permission set matches RBAC config | all 7 | Decode `/auth/me` permissions | Set equals `permissionsForRole(role)` | §29 |
| TC-AUTH-03 | `GET /auth/me` returns caller identity | admin | `GET /auth/me` | 200, `role = admin` | §4 |

---

## 5. RBAC Access-Control Test Cases (TC-RBAC)

Each row is tested for **all 7 roles**: roles listed under **Allowed** must get a non-403
response; every other role must get **HTTP 403**. This yields the RBAC-Denied (115) and
RBAC-Allowed (92) checks.

| ID | Endpoint | Method | Permission | Allowed roles (non-403) |
|----|----------|--------|------------|--------------------------|
| TC-RBAC-01 | `/dashboard/summary` | GET | dashboard:view | all 7 |
| TC-RBAC-02 | `/users` | GET | users:manage | Admin |
| TC-RBAC-03 | `/customers` | GET | customers:view | Admin, Supervisor, Manager, Delivery |
| TC-RBAC-04 | `/customers/:id` | DELETE | customers:manage | Admin, Supervisor, Manager |
| TC-RBAC-05 | `/deliveries/today` | GET | deliveries:view | Admin, Supervisor, Manager, Delivery |
| TC-RBAC-06 | `/deliveries/statuses` | GET | deliveries:view | Admin, Supervisor, Manager, Delivery |
| TC-RBAC-07 | `/deliveries/:cid/:y/:m/mark-all` | PUT | deliveries:manage | Admin, Supervisor, Delivery |
| TC-RBAC-08 | `/invoices` | GET | billing:view | Admin, Supervisor, Manager |
| TC-RBAC-09 | `/invoices/generate` | POST | billing:manage | Admin, Manager |
| TC-RBAC-10 | `/cows` | GET | cattle:view | Admin, Supervisor, Manager, Caretaker |
| TC-RBAC-11 | `/cows/:id` | DELETE | cattle:manage | Admin, Supervisor, Caretaker |
| TC-RBAC-12 | `/reports/pending-payments` | GET | reports:view | Admin, Supervisor, Manager |
| TC-RBAC-13 | `/products` | POST | settings:manage | Admin |
| TC-RBAC-14 | `/products/low-stock` | GET | settings:manage | Admin |
| TC-RBAC-15 | `/products/:id/stock` | PATCH | settings:manage | Admin |
| TC-RBAC-16 | `/backup/list` | GET | backup:manage | Admin |
| TC-RBAC-17 | `/customer-requests/:y/:m` | GET | customer_requests:view | Admin, Supervisor, Manager, Delivery, Customer |
| TC-RBAC-18 | `/customer-requests` | POST | customer_requests:create | Admin, Supervisor, Manager, Delivery, Customer |
| TC-RBAC-19 | `/customer-requests/:id/status` | PATCH | customer_requests:manage | Admin, Supervisor, Manager, Delivery |
| TC-RBAC-20 | `/orders` | GET | orders:view | Admin, Supervisor, Manager, Delivery, Customer |
| TC-RBAC-21 | `/orders` | POST | orders:create | Admin, Supervisor, Manager, Delivery, Customer |
| TC-RBAC-22 | `/orders/:id/status` | PATCH | orders:manage | Admin, Supervisor, Manager, Delivery |
| TC-RBAC-23 | `/subscriptions` | GET | subscriptions:view | Admin, Supervisor, Manager, Delivery, Customer |
| TC-RBAC-24 | `/subscriptions` | POST | subscriptions:create | Admin, Supervisor, Manager, Customer |
| TC-RBAC-25 | `/subscriptions/:id/status` | PATCH | subscriptions:manage | Admin, Supervisor, Manager |
| TC-RBAC-26 | `/milk-rates` | GET | billing:view | Admin, Supervisor, Manager |
| TC-RBAC-27 | `/milk-rates/:id` | DELETE | settings:manage | Admin |
| TC-RBAC-28 | `/month-closures` | GET | billing:view | Admin, Supervisor, Manager |
| TC-RBAC-29 | `/month-closures/:y/:m/close` | POST | billing:manage | Admin, Manager |
| TC-RBAC-30 | `/month-closures/:y/:m/reopen` | POST | admin-only | Admin |

---

## 6. Functional Test Cases (TC-FUNC)

End-to-end workflows validating business logic. Executed as the role indicated.

### 6.1 Dashboard & Reads (§27–§33)

| ID | Title | Role | Expected |
|----|-------|------|----------|
| TC-FUNC-DASH-01 | Dashboard summary loads | Admin | 200 |
| TC-FUNC-READ-01 | Breeding list / upcoming-calving | Admin | 200 |
| TC-FUNC-READ-02 | Milk production list / summary | Admin | 200 |
| TC-FUNC-READ-03 | Calving list | Admin | 200 |
| TC-FUNC-READ-04 | Invoices list | Admin | 200 |
| TC-FUNC-READ-05 | Payments list / outstanding | Admin | 200 |
| TC-FUNC-READ-06 | Reports: pending-payments / pregnant-cows | Admin | 200 |
| TC-FUNC-READ-07 | Settings get / Users roles | Admin | 200 |

### 6.2 Customers (§4)

| ID | Title | Role | Steps | Expected |
|----|-------|------|-------|----------|
| TC-FUNC-CUST-01 | Create customer | Admin | `POST /customers` | 200/201 + id |
| TC-FUNC-CUST-02 | Get by id | Admin | `GET /customers/:id` | 200 |
| TC-FUNC-CUST-03 | Toggle active/inactive | Admin | `PATCH /customers/:id/toggle` | 200 |
| TC-FUNC-CUST-04 | Update customer | Admin | `PUT /customers/:id` | 200 |
| TC-FUNC-CUST-05 | Delete customer | Admin | `DELETE /customers/:id` | 200 |

### 6.3 Products & Pricing (§13)

| ID | Title | Role | Steps | Expected |
|----|-------|------|-------|----------|
| TC-FUNC-PROD-01 | Create product | Admin | `POST /products` | 201 + id |
| TC-FUNC-PROD-02 | Appears in list | Admin | `GET /products` | product present |
| TC-FUNC-PROD-03 | Update product | Admin | `PUT /products/:id` | 200 |
| TC-FUNC-PROD-04 | Toggle active | Admin | `PATCH /products/:id/toggle` | 200 |
| TC-FUNC-PROD-05 | Delete product | Admin | `DELETE /products/:id` | 200 |
| TC-FUNC-PROD-06 | Stock adjust (delta/set, clamp ≥0) | Admin | `PATCH /products/:id/stock` | new stock reflected, never < 0 |
| TC-FUNC-PROD-07 | Low-stock list | Admin | `GET /products/low-stock` | items where Stock ≤ MinStock |
| TC-FUNC-PROD-08 | Cost/MinStock hidden from non-managers | Customer | `GET /products` | Cost & MinStock omitted |

### 6.4 Cows / Cattle (§17–§20)

| ID | Title | Role | Steps | Expected |
|----|-------|------|-------|----------|
| TC-FUNC-COW-01 | Create cow | Admin | `POST /cows` | 201 + id |
| TC-FUNC-COW-02 | Get by id | Admin | `GET /cows/:id` | 200 |
| TC-FUNC-COW-03 | Update cow | Admin | `PUT /cows/:id` | 200 |
| TC-FUNC-COW-04 | Delete cow | Admin | `DELETE /cows/:id` | 200 |

### 6.5 Settings (§25)

| ID | Title | Role | Steps | Expected |
|----|-------|------|-------|----------|
| TC-FUNC-SET-01 | Update settings (idempotent) | Admin | `PUT /settings` writing current value back | 200 |

### 6.6 Product Ordering (§14)

| ID | Title | Role | Steps | Expected |
|----|-------|------|-------|----------|
| TC-FUNC-ORD-01 | Customer places order | Customer | `POST /orders` qty 2 @ ₹50 | 201, totalAmount = 100 |
| TC-FUNC-ORD-02 | Order detail has items | Admin | `GET /orders/:id` | 1 item |
| TC-FUNC-ORD-03 | Admin confirms order | Admin | `PATCH /orders/:id/status` = Confirmed | 200, status Confirmed |
| TC-FUNC-ORD-04 | Admin delivers order | Admin | `PATCH /orders/:id/status` = Delivered | 200, status Delivered |
| TC-FUNC-ORD-05 | Delivered order decrements stock | Admin | Re-read product | Stock 10 → 8 |
| TC-FUNC-ORD-06 | Customer cancels pending order | Customer | `POST /orders/:id/cancel` | 200, status Cancelled |

### 6.7 Milk Subscription (§5–§7, §11)

| ID | Title | Role | Steps | Expected |
|----|-------|------|-------|----------|
| TC-FUNC-SUB-01 | Customer submits subscription | Customer | `POST /subscriptions` M1/E1 @ ₹60 | 201, PendingApproval, total 2, est ₹3600 |
| TC-FUNC-SUB-02 | History seeded | Admin | `GET /subscriptions/:id/history` | ≥1 row |
| TC-FUNC-SUB-03 | Reject without reason blocked | Admin | status = Rejected (no reason) | 400 |
| TC-FUNC-SUB-04 | Admin approves | Admin | status = Approved | 200, Approved |
| TC-FUNC-SUB-05 | Admin activates | Admin | status = Active | 200, Active |
| TC-FUNC-SUB-06 | Customer pauses | Customer | `POST /subscriptions/:id/pause` | 200, Paused |
| TC-FUNC-SUB-07 | Customer resumes | Customer | `POST /subscriptions/:id/resume` | 200, Active |
| TC-FUNC-SUB-08 | Admin amends quantity | Admin | `PUT /subscriptions/:id` qty 2 @ ₹62 | 200, totalQuantity 2, rate 62 |
| TC-FUNC-SUB-09 | History effective-dated (single open row) | Admin | `GET /subscriptions/:id/history` | ≥5 rows, exactly 1 open (no effectiveTo) |

### 6.8 Milk Rate History (§8)

| ID | Title | Role | Steps | Expected |
|----|-------|------|-------|----------|
| TC-FUNC-RATE-01 | Add initial rate | Admin | `POST /milk-rates` ₹50 from 2026-01-01 | 201, rate 50 |
| TC-FUNC-RATE-02 | Add superseding rate | Admin | `POST /milk-rates` ₹55 from 2026-06-01 | 201, rate 55 |
| TC-FUNC-RATE-03 | Effective rate before change | Admin | `GET /milk-rates/effective?date=2026-03-15` | 50 |
| TC-FUNC-RATE-04 | Effective rate after change | Admin | `GET /milk-rates/effective?date=2026-07-15` | 55 |
| TC-FUNC-RATE-05 | Prior rate auto-closed but retained | Admin | `GET /milk-rates` | old row EffectiveTo = 2026-05-31, still resolvable |

### 6.9 Daily Delivery & Status Enum (§9)

| ID | Title | Role | Steps | Expected |
|----|-------|------|-------|----------|
| TC-FUNC-DEL-01 | Delivery statuses enum | Admin | `GET /deliveries/statuses` | 8 statuses incl. Holiday, Partial |
| TC-FUNC-DEL-02 | Set day = Holiday (not delivered) | Admin | `PUT /deliveries/:cid/:y/:m/day` status Holiday | StatusData Holiday, DeliveryData false |
| TC-FUNC-DEL-03 | Set day = Partial with actual qty | Admin | status Partial, quantity 1 | StatusData Partial, delivered true, QuantityData 1 |
| TC-FUNC-DEL-04 | Invalid status rejected | Admin | status = Teleported | 400 |
| TC-FUNC-DEL-05 | Legacy boolean derives status | Admin | delivered = false | StatusData = Missed |
| TC-FUNC-DEL-06 | Partial-quantity billing | (billing) | Compute month bill | Partial day bills actual litres, not full daily qty |

### 6.10 Customer Request Approval (§11/§12)

| ID | Title | Role | Steps | Expected |
|----|-------|------|-------|----------|
| TC-FUNC-REQ-01 | Customer submits extra-milk request | Customer | `POST /customer-requests` extra_milk | 200/201 + id |
| TC-FUNC-REQ-02 | Admin approves request | Admin | `PATCH /customer-requests/:id/status` = Approved | 200, Approved |

### 6.11 Month Closing / Lock (§15.3)

| ID | Title | Role | Steps | Expected |
|----|-------|------|-------|----------|
| TC-FUNC-MC-01 | Month starts Open | Admin | `GET /month-closures/:y/:m` | status Open |
| TC-FUNC-MC-02 | Admin closes month | Admin | `POST .../close` | 200, Closed |
| TC-FUNC-MC-03 | Re-closing returns conflict | Admin | `POST .../close` again | 409 |
| TC-FUNC-MC-04 | Delivery edit blocked on closed month | Delivery | `PUT .../day` | **423 Locked** |
| TC-FUNC-MC-05 | Admin correction allowed (audited) | Admin | `PUT .../day` | 200, audit record written |
| TC-FUNC-MC-06 | Invoice generate blocked on closed month | Manager | `POST /invoices/generate` | **423 Locked** |
| TC-FUNC-MC-07 | Reopen without reason rejected | Admin | `POST .../reopen` (no reason) | 400 |
| TC-FUNC-MC-08 | Admin reopens month | Admin | `POST .../reopen` + reason | 200, Open |

### 6.12 Mobile OTP Verification (§4.2)

| ID | Title | Role | Steps | Expected |
|----|-------|------|-------|----------|
| TC-FUNC-OTP-01 | Request OTP returns dev code | public | `POST /auth/otp/request` (dev mode) | 200, 6-digit devCode |
| TC-FUNC-OTP-02 | Wrong code rejected | public | `POST /auth/otp/verify` bad code | 400, remaining attempts |
| TC-FUNC-OTP-03 | Correct code verifies mobile | public | `POST /auth/otp/verify` devCode | 200, verified true |
| TC-FUNC-OTP-04 | Status shows verified | public | `GET /auth/otp/status` | verified true |
| TC-FUNC-OTP-05 | Code cannot be reused | public | verify again with same code | 400 |
| TC-FUNC-OTP-06 | Immediate resend hits cooldown | public | `POST /auth/otp/resend` right away | 429 |
| TC-FUNC-OTP-07 | Invalid mobile rejected | public | request with `123` | 400 |

---

## 7. Traceability to Specification

| Spec section | Covered by |
|--------------|-----------|
| §4.1 Registration flow / §4.2 Mobile verification | TC-FUNC-OTP-01..07 |
| §4.3 Customer profile | TC-FUNC-CUST-01..05 |
| §5–§7, §11 Subscriptions & history | TC-FUNC-SUB-01..09 |
| §8 Milk rate management | TC-FUNC-RATE-01..05 |
| §9 Daily delivery + status enum | TC-FUNC-DEL-01..06 |
| §11/§12 Customer requests | TC-FUNC-REQ-01..02 |
| §13 Product management (stock/cost) | TC-FUNC-PROD-01..08 |
| §14 Product sales/orders | TC-FUNC-ORD-01..06 |
| §15.3 Month closing/lock | TC-FUNC-MC-01..08 |
| §16 Invoices | TC-FUNC-READ-04, TC-RBAC-08/09 |
| §17–§20 Cows/breeding/calving | TC-FUNC-COW-01..04, TC-FUNC-READ-01/03 |
| §21 Milk production | TC-FUNC-READ-02 |
| §27–§33 Dashboard & reports | TC-FUNC-DASH-01, TC-FUNC-READ-06 |
| §29 RBAC / roles | TC-AUTH-02, TC-RBAC-01..30 |
| §25 Settings / backup | TC-FUNC-SET-01, TC-RBAC-16 |

---

## 8. Execution Summary (latest run)

| Section | Checks | Passed | Failed |
|---------|-------:|-------:|-------:|
| Login (auth + permission set) | 14 | 14 | 0 |
| RBAC-Denied (403 enforced) | 115 | 115 | 0 |
| RBAC-Allowed (access granted) | 92 | 92 | 0 |
| Functional (workflows) | 73 | 73 | 0 |
| **TOTAL** | **294** | **294** | **0** |

### Per-role access-control result

| Role | Checks | Passed | Failed | Result |
|------|-------:|-------:|-------:|--------|
| Admin | 30 | 30 | 0 | PASS |
| Supervisor | 32 | 32 | 0 | PASS |
| Manager | 31 | 31 | 0 | PASS |
| Delivery Person | 32 | 32 | 0 | PASS |
| Cattle Caretaker | 32 | 32 | 0 | PASS |
| Farm Cleaner | 32 | 32 | 0 | PASS |
| Customer | 32 | 32 | 0 | PASS |

Post-run data-integrity check: **0 residual test rows** across Products, Orders,
Subscriptions, MilkRates, Deliveries, MonthClosures, OtpVerifications, CustomerDeliveryRequests,
and AuditLog.

---

## 9. How to Run

```powershell
cd backend

# 1. Ensure schema + role users
node src/database/migrate.js
npm run db:seed:test-users

# 2. Start a dev-mode server (exposes OTP devCode; high rate limit for a full run)
$env:PORT='3100'; $env:RATE_LIMIT_MAX='5000'; $env:NODE_ENV='development'
node src/index.js   # leave running in one terminal

# 3. In another terminal, run the harness against it
$env:API_BASE='http://localhost:3100/api/v1'
node tests/roleAccessTest.js
```

Exit code is `0` when all checks pass (or when the only failures are HTTP 429 rate-limit),
and `1` when any functional/RBAC check fails.

---

## 10. Notes & Assumptions

- **Safe writes:** RBAC probes use non-existent IDs (`__rbac_none__`) so denied roles are
  blocked before any data change; allowed roles receive 404/400/200 (all non-403).
- **Ownership gating:** For customer-requests, orders, and subscriptions, a Customer can act
  only on their own records; the seeded Customer is linked to a real customer so these flows
  execute end to end.
- **OTP dev mode:** In production (`NODE_ENV=production`) the OTP response omits `devCode` and
  reports "delivery not configured" until an SMS provider is wired in; the automated OTP tests
  therefore run against a dev-mode instance.
- **Month lock:** Closed months return **HTTP 423 (Locked)** for normal writes; an Admin may
  still make corrections, which always write an audit record.

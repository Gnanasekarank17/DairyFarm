# Deployment & Operations Guide

How to set up, run, build and deploy the Dairy Farm Management System on a Windows workstation (local dev), in Docker Desktop, and as native builds.

---

## 1. Prerequisites

| Tool | Version / notes |
|---|---|
| Node.js | 20 LTS or newer (Docker image uses node:20-alpine) |
| npm | bundled with Node |
| SQL Server | SQL Server Express (`SQLEXPRESS`) or any instance. TCP must be enabled on 1433 for Docker (`setup-sqlserver-tcp.ps1` at the repo root does this) |
| Docker Desktop | only for the container deployment |
| Expo Go / Android Studio / Xcode | only for native testing |

---

## 2. Database

1. Create the database and a SQL login (defaults used by compose: DB `DairyFarmDB`, user `dairy_app`).
2. Enable TCP 1433 on the instance if Docker will connect:
   ```powershell
   .\setup-sqlserver-tcp.ps1
   ```
3. Create / upgrade the schema from the host (migrations are **not** run inside the container):
   ```bash
   cd backend
   npm install
   npm run db:migrate          # idempotent; safe to re-run after every pull
   npm run db:seed             # optional sample data (20 customers, 10 cows)
   npm run db:seed:test-users  # 7 role logins, mobiles 9000000001–9000000007 / Test@1234
   ```

Note: in the live database `Payments.PaymentDate` is a real `DATE` column even though `migrate.js` declares NVARCHAR(20). Do not "fix" it by altering the column; the finance queries already handle it with `TRY_CONVERT`.

---

## 3. Backend — local development

```bash
cd backend
cp .env.example .env     # first time only
# edit .env: DB_SERVER, DB_INSTANCE=SQLEXPRESS, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, ADMIN_PIN, SMTP_*, WHATSAPP_*, GOOGLE_CLIENT_ID
npm run dev              # nodemon on http://localhost:3000
```

Smoke test:
```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/v1/auth/pin -H "Content-Type: application/json" -d "{\"pin\":\"1234\"}"
```
The PIN login returns an admin token useful for API tests. See [BACKEND_REFERENCE.md §2](BACKEND_REFERENCE.md#2-environment-variables) for every variable.

---

## 4. Mobile / Web — local development

```bash
cd mobile
npm install              # also (re)creates the symlink for @oeconnection/pcb-grid
cp .env.example .env     # first time only
# EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1  (use your LAN IP for a physical phone)
npx expo start --web     # web on http://localhost:8081 (add --port 8082 if 8081 is busy)
npx expo start           # QR code for Expo Go / emulators
```

Typecheck before committing:
```bash
node --stack-size=16000 node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
```
(`npx tsc --noEmit` crashes with "Maximum call stack size exceeded" on recent Node versions; the explicit stack size avoids it.)

---

## 5. Docker Desktop deployment

Compose files live in the **repo root** (`MobileAPP/`), not in `mobile/` or `backend/`.

| Service | Container | Host port | Source |
|---|---|---|---|
| `dairy-api` | `dairy-farm-api` | **8080** → 3000 (override; base file says 3000) | `backend/Dockerfile`; env from `backend/.env` plus inline values in compose |
| `dairy-web` | `dairy-farm-web` | **8090** → 80 | `nginx:alpine` bind-mounting `mobile/dist` and `mobile/nginx-web.conf` |

The API container reaches SQL Server through `host.docker.internal:1433` with `DB_INSTANCE` blank (fixed port), so TCP 1433 must be enabled on the host instance.

### Full redeploy sequence
```bash
# 1. schema (from host)
cd backend && npm run db:migrate && cd ..

# 2. web bundle — MUST point at the Docker API port, not the dev port
cd mobile
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1 npx expo export --platform web --clear
cd ..

# 3. containers
docker compose up -d --build dairy-api
docker compose restart dairy-web        # picks up the new dist/ bind mount

# 4. verify
curl http://localhost:8080/health
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8090/
```
Open **http://localhost:8090** in the browser.

PowerShell equivalent for step 2:
```powershell
$env:EXPO_PUBLIC_API_URL = "http://localhost:8080/api/v1"; npx expo export --platform web --clear
```

### Useful commands
```bash
docker compose ps
docker logs --tail 100 dairy-farm-api
docker compose down            # stop; keeps the dairy-uploads volume
```

---

## 5a. Vercel deployment (web + API in one project)

The Vercel project **dairy-farm-web** (team `gk-0c90`) is linked at the **repository root**. One deployment serves
the Expo web export as static files and the Express API as a single Serverless Function (`api/index.js`), so the
web app calls the API on its own origin (`/api/v1`). Native builds use the absolute URL
`https://dairy-farm-web-vert.vercel.app/api/v1` (also reachable on `https://www.gkdf.com` once DNS resolves).

| Piece | Where |
|---|---|
| Root config | `vercel.json` — install both `mobile/` and `backend/`, build `mobile/dist`, rewrite `/api/*` and `/health` to the function, daily cron |
| API function | `api/index.js` → `backend/src/app.js` (Express app without `listen`) |
| Scheduled jobs | Vercel Cron `30 1 * * *` UTC (07:00 IST) → `GET /api/v1/cron/daily` (`backend/src/routes/cron.routes.js`), guarded by `CRON_SECRET`. Hobby plan runs crons once a day; `/api/v1/cron/<job>` runs one job on demand (admin JWT also accepted) |
| Files | Vercel Blob store connected to the project. Backups: `POST /backup/create` stores a private JSON snapshot, `GET /backup/list`, `GET /backup/download?pathname=`, `DELETE /backup?pathname=`. Photos/documents: `POST /uploads` (base64, ≤ 4 MB) returns a public URL to save on the record |
| Logs | Console only on Vercel (`vercel logs`); file logging stays on for Docker |

### Environment variables (Production + Preview)

```
DB_SERVER, DB_PORT=1433, DB_NAME, DB_USER, DB_PASSWORD, DB_ENCRYPT=true, DB_TRUST_SERVER_CERT=true
JWT_SECRET, JWT_EXPIRES_IN, ADMIN_PIN, STAFF_PIN
BUSINESS_NAME, BUSINESS_ADDRESS, BUSINESS_PHONE, BUSINESS_GST
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, FAST2SMS_API_KEY
GOOGLE_CLIENT_ID, EXPO_ACCESS_TOKEN, CRON_SECRET
BLOB_READ_WRITE_TOKEN, BLOB_STORE_ID            # injected by the Blob store
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID                # web build
```

`DB_SERVER` must be a SQL Server that is reachable from the internet (Azure SQL, a VM with port 1433 open, or a
tunnel). A laptop `SQLEXPRESS` instance is not reachable from Vercel. Leave `DB_INSTANCE` empty and use port 1433.

### Deploy

```bash
cd <repo root>
npx vercel link --yes --project dairy-farm-web --scope gk-0c90   # once
npx vercel env add DB_SERVER production                           # and the rest of the list above
npx vercel --prod                                                  # build + deploy
curl https://dairy-farm-web-vert.vercel.app/health?db=1&blob=1          # runtime, SQL Server and Blob checks
```

Limits to keep in mind: request bodies ≤ 4.5 MB, function time ≤ 60 s (`maxDuration` in `vercel.json`),
rate limiting is per function instance.

---

## 6. Native builds

```bash
cd mobile
npm run build:android    # eas build --platform android
npm run build:ios        # eas build --platform ios
```
Before a release build: set a real `extra.eas.projectId` and `iosUrlScheme` in `app.json`, replace the placeholder PNGs in `assets/`, and set `EXPO_PUBLIC_API_URL` to the public API URL.

---

## 7. Test users

`npm run db:seed:test-users` creates these mobile + password logins (password `Test@1234` unless `TEST_USER_PASSWORD` is set):

| Role | Mobile |
|---|---|
| Admin | 9000000001 |
| Supervisor | 9000000002 |
| Manager | 9000000003 |
| Delivery Person | 9000000004 |
| Cattle Caretaker | 9000000005 |
| Farm Sweeper/Cleaner | 9000000006 |
| Customer | 9000000007 |

PIN login: `ADMIN_PIN` (default 1234) → admin.

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `tsc` / Metro: `Cannot find module '@oeconnection/pcb-grid'` in `src/components/grid/*.web.tsx` | the `file:` dependency is installed as a symlink in `node_modules/@oeconnection/pcb-grid`; moving or copying the project folder breaks it | `cd mobile && npm install` |
| `npx tsc --noEmit` → "Maximum call stack size exceeded" | TypeScript recursion on recent Node | `node --stack-size=16000 node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` |
| Web crashes with "Failed to set an indexed property [0] on CSSStyleDeclaration" | an RN component with `className` inside a `*.web.tsx` file (NativeWind does not transform those) | use plain DOM + inline styles in web-only files |
| Web app shows data errors but `/health` is fine | web bundle points at the wrong API port (3000 vs 8080) | re-export with the correct `EXPO_PUBLIC_API_URL` (it is baked in at export time) and restart `dairy-web` |
| API container: "SQL Server connection failed" | TCP 1433 not enabled, or `DB_INSTANCE` set together with a fixed port | run `setup-sqlserver-tcp.ps1`; keep `DB_INSTANCE` blank in compose |
| `docker` CLI hangs or prints nothing while the containers still answer on 8080/8090 | Docker Desktop engine not responding to the CLI | restart Docker Desktop, then `docker compose ps` |
| 423 Locked on delivery edit / invoice generation | month is closed (`MonthClosures`) | admin reopens via `POST /month-closures/:y/:m/reopen` with a reason |
| 429 Too Many Requests during tests | global rate limit (200 / 15 min) | start the server with `RATE_LIMIT_MAX=100000` for test runs |
| Login "Cannot reach the server" on a phone | `EXPO_PUBLIC_API_URL` uses `localhost` | use the machine's LAN IP and restart the Expo server |

---

## 9. Logs

- Backend: `backend/logs/combined.log`, `backend/logs/error.log` (winston), plus container stdout (`docker logs dairy-farm-api`).
- Web/nginx: `docker logs dairy-farm-web`.
- Expo dev server: terminal output.

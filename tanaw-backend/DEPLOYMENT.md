# TANAW Backend — Ubuntu Production Deployment (Step-by-Step)

**Target domain:** `api2.tanauancity.com`
**Your server:** `srv1171741` @ `72.61.213.48`
**Stack:** Ubuntu, Node.js 20 LTS, PostgreSQL, Nginx, PM2, Certbot.

> **Tungkol sa Redis:** Walang feature sa Phase 1 backend na gumagamit ng Redis (dead code lang ang `src/config/redis.ts`). Kaya **hindi mo kailangan i-install ang Redis ngayon**. Kapag dumating na ang Phase 2+ features na kailangan nito (OTP cache, session store, Redis-backed rate limiter), i-install mo saka.

Sundin mo lang ito mula taas hanggang baba. Bawat step may check para alam mo kung OK na bago mag-next.

---

## Confirmed na sa server mo (hindi na kailangan i-check ulit)

| Item | Status |
|---|---|
| Port **3200** | ✅ FREE |
| Nginx site `api2.tanauancity.com` | ✅ Hindi pa existing |
| PM2 process name `tanaw-api` | ✅ Hindi pa existing |
| Postgres `tanaw_user` / `tanaw_prod` | ✅ CLEAN (wala pa) |
| Deploy path `/var/www/tanaw-backend` | ✅ FREE |
| Existing Nginx sites na hindi dapat magalaw | `dreamboat`, `gad` (`gadapi.tanauancity.com`) |
| Existing PM2 apps na hindi dapat magalaw | `dreamboat-api` (port 3002?), `gad-api` (port **3001**) |
| Redis | ⚪ Skipped — walang feature na gumagamit |

⚠️ **R2 bucket warning:** Ang kasalukuyang `.env` mo ay nakatutok sa R2 bucket `gad-database` at `gaduploads.tanauancity.com` — **kapareho ng GAD project**. Kung intended na i-share ang storage, OK. Kung gusto mo separate para sa TANAW, gumawa ka ng bagong R2 bucket (e.g., `tanaw-uploads`) bago mag-deploy at palitan sa `.env` ng prod.

---

## Table of Contents

1. [STEP 1 — Code changes sa local (hardening)](#step-1--code-changes-sa-local-hardening)
2. [STEP 2 — Rotate R2 API keys](#step-2--rotate-r2-api-keys)
3. [STEP 3 — Push changes sa GitHub](#step-3--push-changes-sa-github)
4. [STEP 4 — Install dependencies sa Ubuntu](#step-4--install-dependencies-sa-ubuntu)
5. [STEP 5 — Gumawa ng Postgres DB + user (isolated)](#step-5--gumawa-ng-postgres-db--user-isolated)
6. [STEP 6 — Clone ang code sa `/var/www/tanaw-backend`](#step-6--clone-ang-code-sa-varwwwtanaw-backend)
7. [STEP 7 — Gumawa ng production `.env`](#step-7--gumawa-ng-production-env)
8. [STEP 8 — Build, migrate, seed](#step-8--build-migrate-seed)
9. [STEP 9 — I-start via PM2](#step-9--i-start-via-pm2)
10. [STEP 10 — Nginx site para sa `api2.tanauancity.com`](#step-10--nginx-site-para-sa-api2tanauancitycom)
11. [STEP 11 — Point ang DNS sa server](#step-11--point-ang-dns-sa-server)
12. [STEP 12 — SSL via Certbot](#step-12--ssl-via-certbot)
13. [STEP 13 — Smoke test](#step-13--smoke-test)
14. [STEP 14 — Nightly backup cron](#step-14--nightly-backup-cron)
15. [Operations cheat sheet](#operations-cheat-sheet)
16. [Rollback plan](#rollback-plan)
17. [Appendix: why these choices](#appendix-why-these-choices)

---

## STEP 1 — Code changes sa local (hardening)

Sa Windows local mo (`D:\tanaw Mobile app\tanaw-backend\`). 5 edits total.

> `REDIS_URL` — **tapos na 'to.** Ginawa ko na optional sa `src/config/env.ts`, kaya mag-bo-boot ang app kahit walang Redis installed.

### 1.1 `src/app.ts` — 3 edits

Buksan mo `src/app.ts` at gawin itong 3 palit:

**Edit #1 — palitan ang CORS config.** Hanapin:
```ts
app.use(cors());
```
Palitan ng:
```ts
const corsOrigins = (process.env.CORS_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : false,
  credentials: true,
}));
```

**Edit #2 — trust proxy.** Hanapin:
```ts
const app = express();
```
Idagdag agad sa ibaba:
```ts
app.set('trust proxy', 1);
```

**Edit #3 — prod-grade logging.** Hanapin:
```ts
app.use(morgan('dev'));
```
Palitan ng:
```ts
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
```

### 1.2 `src/config/env.ts` — idagdag CORS_ORIGINS

Idagdag ang line na ito sa `envSchema` object (kahit saan sa loob):
```ts
CORS_ORIGINS: z.string().default(''),
```

### 1.3 Install rate limiter

Sa terminal sa local repo:
```bash
npm install express-rate-limit
```

### 1.4 `src/modules/auth/auth.router.ts` — rate limit auth routes

Sa taas ng file, idagdag:
```ts
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
```

Tapos sa bawat `router.post('/login', ...)`, `router.post('/register/resident', ...)`, `router.post('/register/barangay', ...)`, at `router.post('/register/employee', ...)`, ilagay mo `authLimiter` bilang FIRST middleware bago ang `validate(...)`:

```ts
// Dati:
router.post('/login', validate(LoginSchema), authController.login);
// Maging:
router.post('/login', authLimiter, validate(LoginSchema), authController.login);
```

### 1.5 Quick check

Sa terminal:
```bash
npx tsc --noEmit
```
Dapat zero errors.

---

## STEP 2 — Rotate R2 API keys

Ang kasalukuyang R2 keys sa `.env` (`R2_ACCESS_KEY_ID=914aa027...`, `R2_SECRET_ACCESS_KEY=a73af83a...`) ay nai-expose na sa chat. Kailangan palitan:

1. Pumunta sa Cloudflare dashboard → **R2** → **Manage R2 API Tokens**
2. Hanapin ang existing token, click **Revoke**
3. Click **Create API Token**, bigyan ng pangalan `tanaw-api-prod`, permissions: **Object Read & Write**, bucket: `gad-database` (o bagong `tanaw-uploads` kung ginawa mo sa R2 warning sa itaas)
4. Kopyahin ang bagong `Access Key ID` at `Secret Access Key` — gagamitin mo sa STEP 7

---

## STEP 3 — Push changes sa GitHub

Sa local:
```bash
git add -A
git commit -m "Production hardening: CORS whitelist, trust proxy, rate limiter, prod logging, optional Redis"
git push origin main
```

---

## STEP 4 — Install dependencies sa Ubuntu

SSH sa server:
```bash
ssh root@72.61.213.48
```

Check ang naka-install (likely installed na lahat dahil may `gad-api` + `dreamboat-api` tumatakbo):

```bash
node -v             # dapat v20.x
psql --version      # Postgres — likely installed na (gad-api gumagamit)
nginx -v            # Nginx — installed na (may gad + dreamboat)
pm2 -v              # PM2 — installed na
certbot --version   # kung wala: sudo apt-get install -y certbot python3-certbot-nginx
```

Kung may kulang na Node 20:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
```

**Redis: skip.** Wala pa namang ginagamit sa app.

Huwag i-reconfigure ang Postgres/Nginx globally — mag-a-add lang tayo ng bagong DB/site sa mga susunod na step.

---

## STEP 5 — Gumawa ng Postgres DB + user (isolated)

```bash
sudo -u postgres psql
```

Sa loob ng `psql`, kopyahin ito (**palitan mo ang password**):

```sql
CREATE USER tanaw_user WITH PASSWORD 'PALITAN_MO_NG_MALAKAS_NA_PASSWORD';
CREATE DATABASE tanaw_prod OWNER tanaw_user;
REVOKE ALL ON DATABASE tanaw_prod FROM PUBLIC;
GRANT ALL PRIVILEGES ON DATABASE tanaw_prod TO tanaw_user;
\q
```

Test:
```bash
PGPASSWORD='PALITAN_MO_NG_MALAKAS_NA_PASSWORD' psql -h localhost -U tanaw_user -d tanaw_prod -c '\conninfo'
```

Dapat makakuha ka ng `You are connected to database "tanaw_prod"...`.

**I-save mo ang password mo** — gagamitin sa STEP 7.

Para mag-generate ng malakas na password:
```bash
openssl rand -base64 32
```

---

## STEP 6 — Clone ang code sa `/var/www/tanaw-backend`

```bash
sudo mkdir -p /var/www
cd /var/www

# Palitan ang URL ng actual GitHub repo URL mo
git clone https://github.com/giodelapiedra/YOUR_REPO.git tanaw-tmp

# Lipat ng backend folder lang (since monorepo ang repo mo)
mkdir -p tanaw-backend
cp -a tanaw-tmp/tanaw-backend/. tanaw-backend/
rm -rf tanaw-tmp

cd /var/www/tanaw-backend
ls   # dapat makita mo package.json, server.ts, src/, prisma/, atbp.

# Install all deps (including dev deps — needed for TypeScript build)
npm ci
```

---

## STEP 7 — Gumawa ng production `.env`

```bash
nano /var/www/tanaw-backend/.env
```

I-paste (palitan ang `PALITAN_MO_*` values):

```dotenv
NODE_ENV=production
PORT=3200

# Postgres mula sa STEP 5
DATABASE_URL=postgresql://tanaw_user:PALITAN_MO_NG_PASSWORD@localhost:5432/tanaw_prod

# Generate bagong secrets sa server:
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Takbuhin twice, iba't ibang values para sa access at refresh.
JWT_ACCESS_SECRET=PALITAN_MO_NG_64_CHAR_HEX
JWT_REFRESH_SECRET=PALITAN_MO_NG_IBA_64_CHAR_HEX
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS — ilagay ang exact origins na tatawag sa API mo
CORS_ORIGINS=https://tanauancity.com,https://admin.tanauancity.com,capacitor://localhost,http://localhost

# R2 — gamitin ang BAGONG keys mula STEP 2
R2_ACCOUNT_ID=57ddbaf90bb7ae7fc6ac9da18b835740
R2_ACCESS_KEY_ID=BAGONG_KEY_FROM_STEP_2
R2_SECRET_ACCESS_KEY=BAGONG_SECRET_FROM_STEP_2
R2_BUCKET=gad-database
R2_PUBLIC_BASE_URL=https://gaduploads.tanauancity.com
R2_SIGNED_URL_TTL_SECONDS=604800

# REDIS_URL — skipped. Walang feature sa Phase 1 na gumagamit.
# Kapag idinagdag later, uncomment at i-set:
# REDIS_URL=redis://localhost:6379/2
```

Save (`Ctrl+O`, `Enter`, `Ctrl+X`).

I-lock:
```bash
chmod 600 /var/www/tanaw-backend/.env
```

---

## STEP 8 — Build, migrate, seed

```bash
cd /var/www/tanaw-backend

npm run build                # Compile TS → dist/
npx prisma generate          # Generate Prisma client
npx prisma migrate deploy    # Apply all migrations sa tanaw_prod DB
npm run prisma:seed          # Seed barangays + employee codes
```

Dapat walang errors. `migrate deploy` ay safe — hindi nito gagalawin ang ibang DB (`gad`, `dreamboat`).

---

## STEP 9 — I-start via PM2

Gumawa ng ecosystem file:

```bash
nano /var/www/tanaw-backend/ecosystem.config.js
```

I-paste:

```js
module.exports = {
  apps: [{
    name: 'tanaw-api',
    script: './dist/server.js',
    cwd: '/var/www/tanaw-backend',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/var/log/tanaw-api/error.log',
    out_file: '/var/log/tanaw-api/out.log',
    time: true,
  }],
};
```

Gumawa ng log directory at i-start:

```bash
sudo mkdir -p /var/log/tanaw-api
cd /var/www/tanaw-backend
pm2 start ecosystem.config.js
pm2 save
```

Verify:
```bash
pm2 list
# Dapat makita: tanaw-api online. Dreamboat-api at gad-api hindi magalaw.

curl http://localhost:3200/health
# Dapat: {"success":true,"data":{"status":"ok",...}}
```

Kung may error, check logs:
```bash
pm2 logs tanaw-api --lines 50
```

---

## STEP 10 — Nginx site para sa `api2.tanauancity.com`

Gumawa ng **bagong** site file (hindi magagalaw ang `gad` at `dreamboat`):

```bash
sudo nano /etc/nginx/sites-available/api2.tanauancity.com
```

I-paste:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api2.tanauancity.com;

    client_max_body_size 15m;

    location / {
        proxy_pass http://127.0.0.1:3200;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host  $host;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";

        proxy_read_timeout   60s;
        proxy_send_timeout   60s;
        proxy_connect_timeout 5s;
    }

    access_log /var/log/nginx/api2.tanauancity.com.access.log;
    error_log  /var/log/nginx/api2.tanauancity.com.error.log;
}
```

Enable at reload:

```bash
sudo ln -s /etc/nginx/sites-available/api2.tanauancity.com /etc/nginx/sites-enabled/
sudo nginx -t
# MUST output: "syntax is ok" at "test is successful"
# Kung may error — HUWAG mo i-reload. Ayusin muna. Kapag sira ang config,
# masisira lahat ng sites kasama ang gad at dreamboat.

sudo systemctl reload nginx
```

---

## STEP 11 — Point ang DNS sa server

Sa Cloudflare (o wherever naka-manage ang `tanauancity.com` DNS):

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `api2` | `72.61.213.48` | DNS only (grey cloud muna) |

Verify mula sa laptop mo:
```bash
nslookup api2.tanauancity.com
# Dapat lumabas ang 72.61.213.48
```

Maghintay ng 1-5 minuto para mag-propagate.

---

## STEP 12 — SSL via Certbot

Kapag naka-point na ang DNS:

```bash
sudo certbot --nginx -d api2.tanauancity.com
```

Certbot ay:
- Kukuha ng Let's Encrypt cert
- Mag-a-add ng `listen 443 ssl` block sa site file
- Mag-a-add ng HTTP → HTTPS redirect
- Mag-set up ng auto-renewal (timer via systemd)

Verify:
```bash
sudo certbot renew --dry-run
```

---

## STEP 13 — Smoke test

Mula sa laptop mo:

```bash
# Health endpoint
curl -i https://api2.tanauancity.com/health
# Dapat: HTTP/2 200 with JSON { success: true, data: { status: "ok", ... } }

# Auth endpoint - dapat 400 para sa walang body (hindi 500)
curl -i -X POST https://api2.tanauancity.com/api/v1/auth/login \
  -H 'Content-Type: application/json' -d '{}'

# Rate limit test - takbuhin 21 beses mabilisan, dapat ang huli 429
for i in $(seq 1 21); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://api2.tanauancity.com/api/v1/auth/login \
    -H 'Content-Type: application/json' -d '{}'
done
# Dapat ang huling response ay 429.
```

Sa server, monitor real time:
```bash
pm2 logs tanaw-api
# sa ibang terminal:
sudo tail -f /var/log/nginx/api2.tanauancity.com.access.log
```

Check din na **hindi apektado ang existing apps**:
```bash
curl -i https://gadapi.tanauancity.com/ | head -5   # gad dapat okay pa rin
pm2 list   # dreamboat-api at gad-api dapat "online" pa rin
```

---

## STEP 14 — Nightly backup cron

Para may recoverable backup bago pa mag-production traffic:

```bash
sudo mkdir -p /var/backups/tanaw
sudo crontab -e
```

Idagdag sa dulo:
```cron
0 2 * * * PGPASSWORD='PALITAN_MO_NG_PASSWORD' pg_dump -U tanaw_user -h localhost tanaw_prod | gzip > /var/backups/tanaw/tanaw_prod_$(date +\%Y\%m\%d).sql.gz
0 3 * * 0 find /var/backups/tanaw -name '*.sql.gz' -mtime +30 -delete
```

Ibig sabihin:
- 2:00 AM araw-araw: mag-backup ng `tanaw_prod` lang (di kasali ang `gad` at `dreamboat` DBs)
- 3:00 AM tuwing Linggo: burahin mga backup na mahigit 30 araw na

---

## Operations cheat sheet

```bash
# Tingnan logs
pm2 logs tanaw-api
pm2 logs tanaw-api --err

# Restart lang ang TANAW (di naa-affect ang gad/dreamboat)
pm2 restart tanaw-api

# Nginx logs
sudo tail -f /var/log/nginx/api2.tanauancity.com.access.log
sudo tail -f /var/log/nginx/api2.tanauancity.com.error.log

# Pag may bagong code release
cd /var/www/tanaw-backend
git pull origin main
npm ci
npm run build
npx prisma migrate deploy   # apply lang kung may bagong migration
pm2 restart tanaw-api
```

---

## Rollback plan

Kapag may nasira sa pagbago:

```bash
cd /var/www/tanaw-backend
git log --oneline -n 10          # hanapin last good commit
git checkout <GOOD_SHA>
npm ci && npm run build
pm2 restart tanaw-api
```

Kung masira ang DB:
```bash
# Restore from nightly backup
gunzip < /var/backups/tanaw/tanaw_prod_YYYYMMDD.sql.gz | \
  PGPASSWORD='password' psql -U tanaw_user -h localhost tanaw_prod
```

**Importante:** Kailanman huwag mo gamitin ang `prisma migrate reset` sa production — wiwipe-out ang DB.

---

## Appendix: why these choices

| Decision | Reason |
|---|---|
| **Port 3200** | Port 3000 ay common default (Next.js, Strapi, etc). 3200 ay unusual, kaya safe mula sa collision. Confirmed FREE sa server mo. |
| **Dedicated `tanaw_user`** | Ang existing `gad-api` at `dreamboat-api` malamang may sariling DB users. Hindi natin gagamitin ang `postgres` superuser dahil kung makompromiso ang app, hindi pwedeng ma-access ang ibang DBs. |
| **Redis skipped** | Zero features sa Phase 1 ang gumagamit ng Redis. Hindi na nag-iinstall ng service na hindi naman kailangan. Ginawa kong optional ang `REDIS_URL` sa `env.ts`. Pag na-activate ang Redis-backed features later, i-install saka. |
| **PM2 name `tanaw-api`** | Hindi magkakapareho sa `dreamboat-api` at `gad-api`. Safe ang `pm2 restart tanaw-api` — hindi maaapektuhan yung iba. |
| **`/var/www/tanaw-backend`** | Isolated path. Delete folder = gone na ang app, walang natutunan na residual. |
| **Separate Nginx site file** | Ang `gad` at `dreamboat` sites may sariling file. Adding api2.tanauancity.com sa bagong file = zero risk mabasag ang existing configs. |
| **CORS whitelist + rate limiter + trust proxy + combined logging** | Dev defaults ng code ay hindi secure sa production. Walang allowlist ang CORS, walang brute-force protection ang login, at mali ang `req.ip` sa likod ng Nginx. Inayos lahat sa STEP 1. |
| **R2 keys rotation** | Yung existing keys sa `.env` ay na-leak sa chat log. Standard practice ay rotate kaagad. |
| **PM2 as root** | Match sa existing pattern ng `dreamboat-api` at `gad-api`. Ideally dedicated non-root user pero mag-i-introduce ito ng permissions work na pwedeng makaapekto sa ibang apps — huwag muna. |

---

**Done.** Backend mo tumatakbo sa `https://api2.tanauancity.com`, fully isolated mula sa `gadapi.tanauancity.com` at `dreamboat-api`.

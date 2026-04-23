# TANAW ONE APP — Phase 1 Backend
## Implementation Reference · City of Tanauan, Batangas

---

> **Status:** Phase 1 Backend COMPLETE
> All endpoints implemented, all rules enforced, TypeScript compiles clean.

---

# ARCHITECTURE

## Stack

Node.js 20 · TypeScript 5 · Express 4 · PostgreSQL 16 · Prisma 5
Redis 7 · JWT · bcrypt · Zod · express-async-errors

## 4-Layer Module Pattern

Every feature has exactly 4 files in `src/modules/<feature>/`:

```
feature.schema.ts      Zod schemas + DTO types ONLY
feature.service.ts     Business logic + Prisma ONLY. No req. No res.
feature.controller.ts  HTTP req/res ONLY. Calls service. Calls sendSuccess. ZERO try/catch.
feature.router.ts      Route definitions ONLY. No logic.
```

## 10 Rules

```
R1   LAYERS      Nothing crosses layers.
R2   ERRORS      Services throw AppError. Controllers = zero try/catch.
                 app.ts first line: import 'express-async-errors'
                 app.ts last middleware: errorMiddleware
R3   RESPONSE    { success, message, data } or { success, message, errors }
                 Always sendSuccess() / sendError(). Never res.json().
R4   VALIDATION  Every POST/PATCH: validate(ZodSchema) before controller.
R5   AUTH        Public: validate -> ctrl.
                 Protected: authMiddleware -> ctrl.
                 Role-gate: authMiddleware -> requireRole() -> ctrl.
R6   NO PRISMA   Controllers call services. Services call Prisma.
R7   PASSWORDS   bcrypt.hash(password, 12). Always strip passwordHash.
R8   ENV VARS    import { env } from config/env. Never process.env.
R9   TRANSACTIONS prisma.$transaction() for multi-step writes.
R10  TANAW ID    TAN-{PREFIX}-{YEAR}-{00001} via atomic transaction.
```

---

# DATABASE

## Enums

| Enum       | Values                                                |
|------------|-------------------------------------------------------|
| UserRole   | RESIDENT, BARANGAY_OFFICIAL, GOVERNMENT_EMPLOYEE, SUPER_ADMIN |
| UserStatus | PENDING_VERIFICATION, ACTIVE, SUSPENDED, DEACTIVATED |
| Gender     | MALE, FEMALE, PREFER_NOT_TO_SAY                      |

## Models (9 total)

### Barangay (`barangays`)
47 barangays of Tanauan City. Each with unique `code` (e.g. `BGY-BOOT-010`).
User.barangayId is a FK — not free text.

### User (`users`)
```
id, tanawId (unique), email (unique), phone (unique), passwordHash,
role, status, firstName, middleName?, lastName, suffix?,
birthDate, gender, profilePhoto?, barangayId (FK), employeeCode?,
department?, position?, createdAt, updatedAt
Relations: address, refreshTokens, deviceTokens, otpCodes, auditLogs
```

### Address (`addresses`) — 1:1 with User
```
id, userId (unique FK, cascade delete),
houseNo?, street?, city (default "Tanauan City"),
province (default "Batangas"), zipCode (default "4232")
```

### RefreshToken (`refresh_tokens`)
```
id, token (unique), userId (FK cascade), expiresAt, isRevoked (default false)
```

### OtpCode (`otp_codes`) — for future verification
```
id, userId (FK cascade), code, type, expiresAt, isUsed (default false)
type: "email_verify" | "phone_verify" | "password_reset"
```

### DeviceToken (`device_tokens`)
```
id, userId (FK cascade), token (unique), platform ("ios" | "android")
```

### EmployeeCode (`employee_codes`)
```
id, code (unique), department, isUsed (default false), usedBy?
50 pre-seeded: 10 per dept (CHO, CBAO, CDRRMO, CEO, CTO)
```

### TanawIdCounter (`tanaw_id_counters`)
```
id, role (unique), year, lastCount, updatedAt
```

### AuditLog (`audit_logs`)
```
id, userId? (FK set null), action, details (Json?), ipAddress?
Actions: USER_REGISTERED, USER_LOGGED_IN, USER_LOGGED_OUT
```

---

# FOLDER STRUCTURE

```
tanaw-backend/
├── .cursorrules              AI rules for Cursor
├── CLAUDE.md                 AI rules for Claude Code
├── .env                      Secret values (not committed)
├── .env.example              Template
├── .gitignore
├── nodemon.json
├── package.json
├── tsconfig.json
│
├── src/
│   ├── app.ts                Express setup, no listen()
│   │
│   ├── config/
│   │   ├── env.ts            Zod-validates .env, crashes if missing
│   │   ├── database.ts       PrismaClient singleton (globalThis)
│   │   └── redis.ts          Redis client
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.schema.ts       5 Zod schemas
│   │   │   ├── auth.service.ts      register x3, login, refresh, logout
│   │   │   ├── auth.controller.ts   6 handlers, zero try/catch
│   │   │   └── auth.router.ts       5 public + 1 protected
│   │   └── users/
│   │       ├── users.schema.ts      2 Zod schemas
│   │       ├── users.service.ts     getProfile, updateProfile, digitalId, deviceToken
│   │       ├── users.controller.ts  4 handlers, zero try/catch
│   │       └── users.router.ts      4 protected routes
│   │
│   ├── middleware/
│   │   ├── validate.middleware.ts   Zod body validator -> 422
│   │   ├── auth.middleware.ts       JWT verify -> req.user
│   │   ├── role.middleware.ts       requireRole() guard
│   │   └── error.middleware.ts      Global error catcher (LAST in app.ts)
│   │
│   └── utils/
│       ├── response.util.ts         sendSuccess, sendError, AppError
│       ├── jwt.util.ts              sign/verify access + refresh tokens
│       └── tanawId.util.ts          atomic TAN-XXX-YYYY-NNNNN generator
│
├── prisma/
│   ├── schema.prisma                9 models, 3 enums
│   └── seed.ts                      47 barangays + 50 employee codes + counters + admin
│
└── server.ts                        Entry point: connect DB, listen()
```

---

# USER ROLES & REGISTRATION

| Role                | Prefix | Registration Fields                           | TANAW ID Example     |
|---------------------|--------|-----------------------------------------------|----------------------|
| RESIDENT            | RES    | barangayCode                                  | TAN-RES-2026-00001   |
| BARANGAY_OFFICIAL   | BGY    | barangayCode + position                       | TAN-BGY-2026-00001   |
| GOVERNMENT_EMPLOYEE | GOV    | barangayCode + employeeCode + dept + position | TAN-GOV-2026-00001   |
| SUPER_ADMIN         | ADM    | Internal only                                 | TAN-ADM-2026-00001   |

### All registrations require these base fields:
```
email              unique, email format
phone              unique, PH format (09XXXXXXXXX)
password           8-64 characters
firstName          required, max 60
middleName         optional, max 60
lastName           required, max 60
suffix             optional, max 10
birthDate          valid date string -> DateTime
gender             MALE | FEMALE | PREFER_NOT_TO_SAY
barangayCode       validated against Barangay table (e.g. BGY-BOOT-010)
street             optional
houseNo            optional
```

### Registration flow:
1. Validate barangayCode exists in Barangay table (+ isActive)
2. For employees: validate employeeCode exists and is not used
3. Check email/phone not already registered
4. Hash password (bcrypt 12 rounds)
5. Generate TANAW ID (atomic transaction)
6. Create User + Address in DB
7. For employees: mark employeeCode as used ($transaction)
8. Create AuditLog entry (USER_REGISTERED)
9. Return user data (passwordHash stripped)

### Login flow:
1. Find user by email OR phone OR tanawId (multi-identifier)
2. Check status (SUSPENDED -> 403, DEACTIVATED -> 403)
3. Verify password (bcrypt compare)
4. Generate access + refresh tokens
5. Store refresh token in DB (RefreshToken table)
6. AuditLog (USER_LOGGED_IN)
7. Return user + tokens

---

# ENDPOINTS

## Public

```
POST   /api/v1/auth/register/resident
       Body: base fields + barangayCode
       Returns: user data with tanawId (201)

POST   /api/v1/auth/register/barangay
       Body: base fields + barangayCode + position
       Returns: user data with tanawId (201)

POST   /api/v1/auth/register/employee
       Body: base fields + barangayCode + employeeCode + department + position
       Returns: user data with tanawId (201)

POST   /api/v1/auth/login
       Body: { identifier, password }
       identifier = email | phone | tanawId
       Returns: { user, accessToken, refreshToken }

POST   /api/v1/auth/refresh
       Body: { refreshToken }
       Returns: { accessToken, refreshToken }

GET    /health
       Returns: { status, app, version, timestamp }
```

## Protected (requires `Authorization: Bearer <token>`)

```
POST   /api/v1/auth/logout
       Revokes all refresh tokens for user
       Returns: null (200)

GET    /api/v1/users/me
       Returns: user profile + address + barangay

PATCH  /api/v1/users/me
       Body: { firstName?, middleName?, lastName?, suffix?, street?, houseNo? }
       Returns: updated profile

GET    /api/v1/users/me/digital-id
       Returns: tanawId, name, role, status, birthDate, barangay, city

POST   /api/v1/users/device-token
       Body: { token, platform: "ios" | "android" }
       Returns: { registered: true }
```

---

# SETUP & RUN

```bash
# 1. Install
npm install

# 2. Configure .env
cp .env.example .env
# Generate JWT secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Paste into JWT_ACCESS_SECRET and JWT_REFRESH_SECRET

# 3. Database (requires PostgreSQL + Redis running)
npx prisma migrate dev --name init
npx prisma generate
npm run prisma:seed

# 4. Start
npm run dev

# 5. Test
curl http://localhost:3000/health
```

---

# TEST COMMANDS

```bash
# Register resident
curl -X POST http://localhost:3000/api/v1/auth/register/resident \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@gmail.com",
    "phone": "09171234567",
    "password": "Password123",
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "birthDate": "1990-05-15",
    "gender": "MALE",
    "barangayCode": "BGY-SALA-035"
  }'

# Login (multi-identifier: email, phone, or tanawId)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "juan@gmail.com", "password": "Password123"}'

# Get profile (replace TOKEN)
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer TOKEN"

# Register barangay official
curl -X POST http://localhost:3000/api/v1/auth/register/barangay \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kapitan@sala.com",
    "phone": "09181234567",
    "password": "Password123",
    "firstName": "Pedro",
    "lastName": "Santos",
    "birthDate": "1980-03-20",
    "gender": "MALE",
    "barangayCode": "BGY-SALA-035",
    "position": "Barangay Captain"
  }'

# Register government employee (uses seeded code)
curl -X POST http://localhost:3000/api/v1/auth/register/employee \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nurse@cho.gov.ph",
    "phone": "09191234567",
    "password": "Password123",
    "firstName": "Maria",
    "lastName": "Reyes",
    "birthDate": "1995-07-10",
    "gender": "FEMALE",
    "barangayCode": "BGY-POB1-028",
    "employeeCode": "EMP-CHO-2026-001",
    "department": "City Health Office",
    "position": "Nurse"
  }'

# Get digital ID
curl http://localhost:3000/api/v1/users/me/digital-id \
  -H "Authorization: Bearer TOKEN"

# Register device token
curl -X POST http://localhost:3000/api/v1/users/device-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"token": "fcm_token_here", "platform": "android"}'

# Logout
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer TOKEN"
```

---

# CHECKLIST

```
[x]  package.json + tsconfig + .env.example + nodemon.json
[x]  src/config: env.ts + database.ts + redis.ts
[x]  src/utils: response.util + jwt.util + tanawId.util
[x]  src/middleware: validate + auth + role + error
[x]  src/app.ts (express-async-errors first, errorMiddleware last)
[x]  server.ts (connect DB, listen)
[x]  prisma/schema.prisma (9 models, 3 enums, all @@map, all onDelete)
[x]  prisma/seed.ts (47 barangays + 50 employee codes + counters + admin)
[x]  Auth module: register x3, login (multi-identifier), refresh, logout
[x]  Users module: profile, update, digital ID, device token
[x]  AuditLog on register/login/logout
[x]  EmployeeCode validation + mark as used
[x]  Barangay FK validation (not free text)
[x]  RefreshToken in DB with revocation
[x]  TypeScript compiles clean (zero errors)
[x]  .cursorrules + CLAUDE.md

Phase 1 Backend: COMPLETE
Next: Phase 1 Frontend (React Native / Expo)
```

---

*TANAW One App · Phase 1 Backend · City of Tanauan, Batangas*

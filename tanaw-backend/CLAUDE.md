# TANAW One App Backend

City super-app for Tanauan City, Batangas, Philippines. Phase 1.

## Stack

Node.js 20, TypeScript 5, Express 4, PostgreSQL 16, Prisma 5, Redis 7, JWT, bcrypt, Zod.

## Quick Commands

```bash
npm run dev              # Start dev server (ts-node + nodemon)
npm run build            # Compile TypeScript
npx prisma migrate dev   # Run migrations
npx prisma generate      # Regenerate Prisma client
npm run prisma:seed      # Seed barangays + employee codes + counters
npx tsc --noEmit         # Type-check without emitting
```

## Architecture: 4-Layer Module Pattern

Every feature in `src/modules/<feature>/` has exactly 4 files:

1. `feature.schema.ts` - Zod schemas + DTO types only
2. `feature.service.ts` - Business logic + Prisma only (no req/res)
3. `feature.controller.ts` - HTTP req/res only (calls service, calls sendSuccess, zero try/catch)
4. `feature.router.ts` - Route definitions only

## Critical Rules

- Services throw `AppError`. Controllers have ZERO try/catch.
- `app.ts` first line: `import 'express-async-errors'`. Last middleware: `errorMiddleware`.
- Every response uses `sendSuccess()` or `sendError()`. Never `res.json()` directly.
- Every POST/PATCH route: `validate(ZodSchema)` middleware before controller.
- Never call Prisma inside controllers. Controllers call services.
- `bcrypt.hash(password, 12)`. Always strip `passwordHash` before returning.
- Always `import { env } from '../config/env'`. Never `process.env` directly.
- `prisma.$transaction()` for multi-step writes.

## Database (9 models, 3 enums)

Enums: UserRole (4), UserStatus (4), Gender (2: MALE, FEMALE).
Models: Barangay, User, Address, RefreshToken, OtpCode, DeviceToken, EmployeeCode, TanawIdCounter, AuditLog.

- Barangay: 47 barangays of Tanauan with unique code (BGY-BOOT-010)
- User.barangayId is FK to Barangay (not free text)
- All registrations require barangayCode (validated against Barangay table)
- EmployeeCode: one-time codes per department, marked as used on registration
- RefreshToken: DB-stored with revocation (isRevoked)
- AuditLog: tracks USER_REGISTERED, USER_LOGGED_IN, USER_LOGGED_OUT
- Login supports multi-identifier: email, phone, or tanawId

## TANAW ID Format

`TAN-{PREFIX}-{YEAR}-{00001}` generated atomically by `src/utils/tanawId.util.ts`.

| Role                | Prefix | Example            |
|---------------------|--------|--------------------|
| RESIDENT            | RES    | TAN-RES-2026-00001 |
| BARANGAY_OFFICIAL   | BGY    | TAN-BGY-2026-00001 |
| GOVERNMENT_EMPLOYEE | GOV    | TAN-GOV-2026-00001 |
| SUPER_ADMIN         | ADM    | TAN-ADM-2026-00001 |

## Phase 1 Endpoints

Public: POST register/resident (+barangayCode), register/barangay (+barangayCode +position),
register/employee (+employeeCode +dept +position), POST login (identifier+password),
POST refresh, GET health.
Protected: POST logout, GET/PATCH /users/me, GET /users/me/digital-id, POST /users/device-token.

## Auth Flow

Public: Router -> validate() -> Controller -> Service
Protected: Router -> authMiddleware -> Controller -> Service
Role-gated: Router -> authMiddleware -> requireRole() -> Controller -> Service

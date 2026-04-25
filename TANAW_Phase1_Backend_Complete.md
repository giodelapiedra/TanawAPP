# TANAW One App Backend Reference

Updated: 2026-04-25

## Status

This document is now a maintained backend reference aligned with the current repo.

Primary source of truth for engineering rules:

- [docs/00-engineering-rules.md](./docs/00-engineering-rules.md)
- [tanaw-backend/CLAUDE.md](./tanaw-backend/CLAUDE.md)
- [TANAW.SKILL.md](./TANAW.SKILL.md)

## Current Backend Architecture

Stack:

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Zod

Module pattern:

```text
feature.schema.ts
feature.service.ts
feature.controller.ts
feature.router.ts
```

Responsibilities:

- `schema`: validation shapes and DTO types
- `service`: business logic and Prisma access
- `controller`: request/response translation only
- `router`: route + middleware composition

## Enforced Rules

### Validation

- Validation belongs at the router boundary.
- Use:
  - `validate(schema)` for body
  - `validate(schema, 'query')` for query
  - `validate(schema, 'params')` for params when needed
- Controllers should not manually parse normal request payloads.

### Errors

- Services throw `AppError` for domain failures.
- Controllers stay free of normal-flow `try/catch`.
- Global error middleware handles:
  - `AppError`
  - Prisma known request errors
  - JWT errors
  - `ZodError`

### Authorization

- Authentication and visibility checks stay on the server.
- Do not trust frontend gating for access control.
- Public profile endpoints must respect privacy boundaries.

### Data Safety

- Private contact fields are private by default.
- Exposing `email`, `phone`, addresses, or tokens requires explicit product need and explicit API design.

### Transactions

- Use `prisma.$transaction()` for multi-step writes.

## Current Domain Notes

- Login supports multi-identifier auth.
- Registration uses `barangayCode`.
- Current gender handling in the repo is `MALE | FEMALE`.
- Refresh tokens are stored and revoked server-side.

## Verification

Run after meaningful backend changes:

```bash
cd tanaw-backend
npm run build
```

## Recommended Ongoing Standard

1. Keep new modules on the same 4-file split.
2. Keep validation in routers.
3. Keep private data out of public responses.
4. Update central docs when architecture rules change.

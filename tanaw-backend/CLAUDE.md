# TANAW Backend Rules

Primary source of truth: [docs/00-engineering-rules.md](../docs/00-engineering-rules.md)

Use this file as a backend-specific quick reference only.

## Scope

Node.js / TypeScript backend in `tanaw-backend/`.

## Backend Quick Rules

1. Keep the module split: schema, service, controller, router.
2. Validate requests at the router boundary.
3. Use `validate(schema, 'query')` for query validation when applicable.
4. Controllers translate request to service call; services own business logic and Prisma usage.
5. Services throw `AppError`; controllers stay free of normal-flow `try/catch`.
6. Global error middleware must continue handling `AppError`, Prisma errors, JWT errors, and `ZodError`.
7. Authorization and visibility checks stay on the server.
8. Protect private user data by default.

## Verification

Preferred local check after meaningful backend changes:

```bash
npm run build
```

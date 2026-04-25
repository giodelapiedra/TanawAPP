# TANAW One App Engineering Rules

Cross-repo source of truth for architecture, state, validation, privacy, and AI-assistant guidance.

Applies to:

- `tanaw-mobile/`
- `tanaw-backend/`
- future surfaces such as `tanaw-admin/`

## Purpose

This document centralizes the rules that were previously duplicated across local `CLAUDE.md` and `.cursorrules` files.

When local rule files and this document disagree, this document wins.

## System Principles

1. Keep architecture simple, explicit, and feature-oriented.
2. Prefer one source of truth per concern.
3. Put validation at boundaries, not in deep business logic.
4. Treat privacy and authorization as architecture concerns, not UI concerns.
5. Keep docs aligned with actual code, not aspirational patterns that are not enforced.

## Cross-Cutting Rules

### C1. Response Envelope

Backend responses use:

```ts
{ success: true, message: string, data: unknown }
{ success: false, message: string, errors?: unknown }
```

Frontend API modules unwrap and return `response.data.data`.

### C2. Privacy Boundaries

- Public profile endpoints must not expose private contact data unless explicitly approved by product requirements.
- `email`, `phone`, addresses, tokens, and internal identifiers are private by default.
- UI must not display data that the API should not expose.

### C3. Validation at the Edge

- Request validation belongs in middleware or equivalent request-boundary code.
- Query validation must use the same pattern as body validation.
- Services may still enforce business invariants, but malformed request shape should fail before service execution.

### C4. One Source of Truth

- Avoid duplicate canonical state for the same entity.
- If duplicate caches exist temporarily, define which one is canonical and sync all writes through it.

## Mobile Rules

Scope: `tanaw-mobile/`

### M1. Frontend Structure

Use this feature-oriented layout:

```text
src/constants/
src/types/
src/utils/
src/api/
src/store/
src/hooks/
src/components/
src/screens/
src/navigation/
```

### M2. Current User State

- `auth.user` is the canonical current-user object.
- `userSlice` is for auxiliary user-related server state such as `digitalIdData`, request flags, and errors.
- Do not reintroduce a second canonical `profile` object in Redux.

### M3. API Access Pattern

- All HTTP calls go through `src/api/`.
- Shared reusable UI components should not call the API directly.
- Screen/container components may call API modules directly for local server-state flows, or dispatch thunks where global coordination is needed.
- New code should avoid mixing multiple patterns inside the same feature without reason.

### M4. Auth and Refresh

- Tokens are stored in SecureStore.
- The API client owns token injection and refresh retry.
- Refresh must be serialized behind one in-flight promise to avoid multi-401 race conditions.
- Forced logout must clear both auth state and any user-derived state.

### M5. Forms

- Preferred standard for new or heavily edited forms: `react-hook-form` + `zod`.
- Legacy manual form state may remain temporarily, but new work should move toward the standard instead of extending inconsistency.

### M6. Navigation

- Route params must stay typed in `src/types/navigation.types.ts`.
- Root navigation decides auth vs app shell from auth state.

### M7. Data Shape Awareness

- `user.barangay` is a relation object.
- `user.address` is a relation object.
- Login uses `identifier`.
- Registration uses `barangayCode`.

## Backend Rules

Scope: `tanaw-backend/`

### B1. Layering

Each module follows:

```text
feature.schema.ts
feature.service.ts
feature.controller.ts
feature.router.ts
```

- Schemas define DTOs and validation shapes.
- Services own business logic and Prisma usage.
- Controllers translate request to service call and service result to response.
- Routers compose middleware and route handlers.

### B2. Validation Pattern

- Use `validate(schema)` for request bodies.
- Use `validate(schema, 'query')` for querystrings.
- Use `validate(schema, 'params')` for route params when needed.
- Controllers should not manually call `schema.parse(...)` for normal request validation flows.

### B3. Error Handling

- Services throw `AppError` for domain errors.
- Controllers do not use local `try/catch` for normal flows.
- Global error middleware handles `AppError`, Prisma errors, JWT errors, and `ZodError`.

### B4. Authorization

- Authentication and authorization belong in middleware and service checks.
- Never rely on frontend gating alone.
- Visibility rules and ownership checks must live on the server.

### B5. Transactions

- Multi-step writes use `prisma.$transaction()`.
- External side effects should be best-effort or carefully compensated if a transaction fails.

## AI Assistant Guidance

### A1. Updating Rules

When changing architecture or patterns:

1. update code first,
2. update this document,
3. update local `CLAUDE.md` and `.cursorrules` files to stay consistent.

### A2. Avoid Stale Instructions

Do not document patterns as mandatory if the repo does not actually enforce them yet.

Bad example:

- "No direct API calls in screens" when multiple features already do so intentionally.

Good example:

- "Shared reusable components should not call APIs directly; screens/containers may coordinate feature requests."

### A3. Change Standard

A change is not complete until:

- code is updated,
- compile/type checks pass where possible,
- centralized rules/docs are updated if behavior or pattern changed.

# 01 — System Architecture Review

> **Reviewer perspective:** Senior software engineer evaluating the existing TANAW backend + mobile codebase before designing the new admin dashboard. This document is a **review**, not a redesign — it captures what is working today, what is fragile, and what conventions the new dashboard must respect to stay consistent with the rest of the system.

---

## 1. Summary Verdict

**Verdict:** The existing system is **well-structured for Phase 1**. The backend follows a clean 4-layer module pattern, the mobile app has clear separation of concerns, and the auth/role model is already production-shaped. There is **no architectural blocker** for adding a third surface (admin dashboard).

The biggest risks are not architectural — they are **shared-contract risks**: DTO drift between mobile and backend, magic strings (role names, barangay codes), and an env-var-as-config style that will get worse as a third app joins.

---

## 2. Backend (`tanaw-backend/`)

### 2.1 What's working

- **4-layer module pattern** (`schema → service → controller → router`) is consistently applied across all 7 feature modules (`auth`, `users`, `groups`, `feed`, `follows`, `notifications`, `youtube`). This is exactly the right shape for a growing API.
- **Strict separation of concerns** — controllers have zero `try/catch`, services never touch `req/res`, validation lives in Zod schemas. This is rare to see done correctly; keep it.
- **Centralized response envelope** (`sendSuccess`, `sendError`) means every client (mobile, admin) parses the same `{ success, message, data }` shape.
- **Auth pipeline is correct.** `authMiddleware → requireRole(...) → controller` is composable. Refresh tokens stored in DB with `isRevoked` flag — proper rotation/revocation, not stateless-only.
- **Env validation via Zod at boot** (`src/config/env.ts`). Server crashes loudly on missing config instead of silently undefined-ing at runtime. This is the right call.
- **Schema design is sound.** `Barangay` as a real FK (not free text), `EmployeeCode` as one-time-use rows, `TanawIdCounter` for atomic ID generation, `AuditLog` for compliance trail.

### 2.2 Friction points

| # | Issue | Severity | Why it matters for the admin dashboard |
|---|-------|:--------:|----------------------------------------|
| B1 | `app.ts` reads `process.env.CORS_ORIGINS` directly instead of `env.CORS_ORIGINS` — violates the project's own rule. | Low | Adding `tanaw-admin`'s origin to CORS will hit this. Fix when adding the admin origin. |
| B2 | No OpenAPI/Swagger spec. Zod schemas are the source of truth but not exported as a contract. | Medium | Admin dashboard will hand-roll TS types that *should* match Zod. Drift is inevitable without a shared package. |
| B3 | Storage module (`modules/storage/`) only has `storage.service.ts` — no router/controller/schema. Breaks the 4-layer rule. | Low | Cosmetic; not blocking. |
| B4 | `requireRole()` is in place but **no admin endpoints exist yet**. Admin features (user management, content moderation, audit log viewer, barangay/employee-code CRUD) are entirely missing. | High | This is the actual Phase 2 backend work. The admin dashboard cannot be built without these endpoints. |
| B5 | Rate limiting is per-route (e.g. `authLimiter`). No global default. | Low | Admin endpoints should have their own limiter — slower writes, but allow higher reads for dashboards. |
| B6 | No structured logging (only `morgan`). | Medium | Admin dashboards typically need a log/audit viewer. `AuditLog` table covers business events but not request/error logs. |

### 2.3 What the admin dashboard requires the backend to add

The new dashboard will need backend endpoints that **do not exist yet**. These should be built as new modules following the same 4-layer pattern:

- `modules/admin/users/` — list/search/filter users, suspend/activate, reset password, change role
- `modules/admin/content/` — list/hide/delete posts, view reports, moderate comments
- `modules/admin/barangays/` — CRUD on Barangay table (currently seed-only)
- `modules/admin/employee-codes/` — generate/revoke EmployeeCode rows
- `modules/admin/audit/` — paginated query over `AuditLog` with filters
- `modules/admin/stats/` — dashboard summary counts (users by role, posts/day, etc.)

All of these should be gated with `authMiddleware → requireRole(SUPER_ADMIN)` at minimum.

---

## 3. Mobile (`tanaw-mobile/`)

### 3.1 What's working

- **Clean folder layout** by concern: `api/`, `components/`, `screens/`, `navigation/`, `store/`, `hooks/`, `utils/`, `constants/`, `types/`. This matches the backend's modular shape.
- **Axios client with auto-refresh** (`src/api/client.ts`) — handles 401 → refresh → retry once → logout-on-fail. This is the correct interceptor pattern.
- **Redux Toolkit slices** (`authSlice`, `userSlice`) — typed, narrow, no overuse.
- **Forms standardized** on `react-hook-form + zod` — same validation library as the backend.
- **Design tokens centralized** in `src/constants/` (colors, spacing, posting rules) — no scattered magic numbers.
- **Secure token storage** via `expo-secure-store` — not AsyncStorage. Correct for credentials.

### 3.2 Friction points

| # | Issue | Severity | Why it matters for the admin dashboard |
|---|-------|:--------:|----------------------------------------|
| M1 | Hardcoded `PROD_URL` in `client.ts` with `LOCAL_URL` commented out. Should be env-only. | Low | The admin dashboard must avoid this — config in env, not source. |
| M2 | Types in `src/types/` and API response shapes in `src/api/*.api.ts` are hand-written copies of backend Zod schemas. | Medium | Same drift risk as B2. Long-term: extract a `packages/shared-types`. |
| M3 | No global error toast/boundary visible — errors handled per-screen. | Low | Admin dashboard should have a global error toast surface from day one. |
| M4 | `useAuth` is the only hook. State logic lives in slices. Fine for current size; will get heavy. | Low | Adopt TanStack Query in admin dashboard for server state — don't repeat the Redux-for-everything pattern. |

### 3.3 Patterns the admin dashboard should reuse

- Axios client + interceptor for refresh-token rotation (same shape, web cookie-based or localStorage-based)
- `react-hook-form + zod` for forms
- Centralized design tokens in `src/constants/`
- Typed API layer in `src/api/<feature>.api.ts` returning **unwrapped `data`** (not the envelope)
- Module folders matching backend module names (`auth`, `users`, etc.)

### 3.4 Patterns the admin dashboard should NOT copy

- **Redux Toolkit for server state.** Use TanStack Query. Redux is fine for client state (UI prefs, modals) but caching, refetching, and pagination are TanStack Query's job.
- **Manually written DTO types.** Until a shared types package exists, generate types from Zod or maintain a strict mirror process.
- **PROD URL in source.** Web admin must read from `VITE_API_BASE_URL` only.

---

## 4. Cross-Cutting Concerns

### 4.1 Shared contracts (HIGH priority before scaling)

Today, the mobile app re-declares types that the backend already validates with Zod. Adding a third surface (admin) **triples** the drift risk. Three options, ordered by effort:

1. **Cheapest:** keep hand-mirrored types, but add a CI step that diffs `tanaw-backend/src/modules/*/schema.ts` exports vs. `tanaw-admin/src/lib/api/types.ts`. Catches drift in PRs.
2. **Better:** extract a `packages/shared-schemas/` workspace with the Zod schemas. Backend imports for validation, mobile + admin import for types via `z.infer`.
3. **Best:** add OpenAPI generation (e.g. `zod-to-openapi`) and use `openapi-typescript` in clients. Industry-standard contract.

Pick (2) when starting the admin dashboard. (1) is too fragile, (3) is a Phase-3 investment.

### 4.2 Auth across surfaces

The backend already supports JWT with refresh rotation — that works for both mobile and web. Decisions to make for admin:

- **Token storage on web:** `httpOnly` cookies are safer than `localStorage` (no XSS exfil), but require backend changes (`Set-Cookie` on login, CSRF protection). Recommend cookies for admin from day one.
- **Refresh endpoint** (`POST /auth/refresh`) is already in place — reusable.
- **Role gating:** mobile users cannot reach admin endpoints because of `requireRole(SUPER_ADMIN)`. Admin web must additionally **block non-admin login** at the dashboard's own login page (UX, not security).

### 4.3 Naming consistency

The mobile uses `PascalCase` for screens/components, `camelCase` for hooks/utils/api files. The backend uses `feature.layer.ts` (e.g. `auth.controller.ts`). The admin dashboard should adopt the **mobile** convention since both are React-based, with **one addition**: route-level files use a `*Page.tsx` suffix (e.g. `UsersListPage.tsx`) to make their role obvious.

### 4.4 Environment configuration

There is no central env documentation. Each app has its own `.env.example`. Add a top-level `docs/05-environments.md` (Phase 2 task) listing every env var across all three apps with which app reads it. Until then, each app's `.env.example` is the local source of truth.

---

## 5. What This Means for the Admin Dashboard

Concretely, the admin dashboard should:

1. **Mirror the backend's module pattern** — one folder per feature, layered files inside.
2. **Adopt Vite + React 18 + React Router 6** — pure SPA, deployed as static files. No SSR/server components needed for an internal tool behind a login wall. (Reasoning in doc 02.)
3. **Use TanStack Query** for all server state. Reserve Zustand or React Context for narrow client state (sidebar collapsed, theme, etc.).
4. **Reuse the response envelope** — same `{ success, message, data }` parsing as mobile.
5. **Reuse the refresh-token interceptor pattern** — same shape, adapted to fetch/Axios on web with cookies.
6. **Block non-admin roles at the login page** AND rely on backend `requireRole` for actual security.
7. **Tailwind + shadcn/ui** for the UI layer — fast iteration, accessible primitives, no design-system rebuild needed for an internal tool.
8. **Keep DTOs in one place** — `src/lib/api/types.ts` mirrors backend Zod schemas until a shared package is extracted.

The next document (`02-admin-dashboard-architecture.md`) translates these decisions into a concrete architecture.

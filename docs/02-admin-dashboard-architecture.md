# 02 — Admin Dashboard Architecture

> **Project name:** `tanaw-admin`
> **Purpose:** Web dashboard for `SUPER_ADMIN` and (scoped) `GOVERNMENT_EMPLOYEE` users to manage residents, content, barangays, employee codes, and audit logs of the TANAW One App.
> **Out of scope (Phase 1):** end-user-facing features, public registration, mobile-style social feed.

---

## 1. Goals & Non-Goals

### Goals
1. Single source of truth for **administrative actions** on TANAW data.
2. **Read-heavy dashboard** with safe, audited write paths.
3. **Role-gated** at both UI and API layers.
4. **Internal-only tool** — security via auth, not obscurity.
5. Architecturally consistent with `tanaw-backend` (module pattern) and `tanaw-mobile` (typed API layer, Zod forms).
6. **Pure SPA**, deployable as static files. No Node runtime needed at the edge.

### Non-Goals
- Not a CMS for end users.
- Not mobile-responsive-first (desktop-first; usable on tablet).
- Not a public app — never exposed without auth.
- No SSR/SEO — this is behind a login wall.
- No server components, no BFF layer. The backend is the BFF.

---

## 2. Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| **Build tool** | Vite 5 | Fast HMR, instant dev server, simple static output (`dist/`). |
| **Framework** | React 18 | Same mental model as `tanaw-mobile` (plain React), no RSC complexity. |
| **Routing** | React Router 6 (`createBrowserRouter`) | Used **only** for nested layouts, `<Outlet />`, and `errorElement`. Data fetching is TanStack Query — we do **not** use React Router loaders/actions. |
| **Language** | TypeScript 5 (strict) | Consistent with backend + mobile. |
| **UI** | Tailwind CSS + shadcn/ui | Accessible primitives, fast to build, no design-system rebuild for internal tool. |
| **Server state** | TanStack Query v5 | Caching, refetching, pagination, optimistic updates — exactly what a dashboard needs. |
| **Client state** | Zustand (only when needed) | Sidebar, theme, modal stack. Not for server data. |
| **Forms** | react-hook-form + zod | Same as mobile + backend. Shared validation primitives. |
| **HTTP** | Axios | Mature interceptor model — same shape as `tanaw-mobile/src/api/client.ts`. |
| **Auth tokens** | `httpOnly` cookies (set by backend) | XSS-safe. Browser sends them automatically with `withCredentials: true`. |
| **Tables** | TanStack Table v8 | Headless, fully typed, sorting/filtering/pagination. |
| **Charts** | Recharts | Lightweight, declarative. Sufficient for admin analytics. |
| **Icons** | lucide-react | Already shadcn-default. |
| **Date** | date-fns | Tree-shakable, no moment.js. |
| **Lint/Format** | ESLint + Prettier | Consistent with mobile. |
| **Testing** | Vitest + React Testing Library + Playwright | Unit + component + e2e on critical admin flows. |

> **Why Vite + SPA over Next.js for this project:**
> - The dashboard is fully behind a login wall — no SEO, no public marketing pages, no first-paint-from-server concerns.
> - The backend is already a real API; we don't need API routes / server actions / a BFF layer.
> - Vite's HMR is noticeably faster, and the mental model is plain React — no `'use client'` boundaries, no RSC caching gotchas, no hydration mismatches.
> - The mobile app is plain React (Native). Keeping the dashboard plain React means the same brain works on both.
> - Static `dist/` output deploys behind nginx on the same Ubuntu host as the backend — simpler ops than a Node runtime.
>
> **Rejected alternatives:**
> - *Next.js 14:* benefits (SSR, server components, edge caching) are unused for an internal admin tool. Adds complexity for no payoff here.
> - *Redux Toolkit:* overkill for what is mostly server state. Mobile already pays this complexity tax — don't repeat it.
> - *MUI / Ant Design:* heavier, opinionated theming, slower iteration than shadcn.
> - *Fetch wrapper from scratch:* axios's interceptor API is the right fit for the refresh-token flow we already use on mobile. Reuse the pattern.

---

## 3. Architectural Layers

The admin dashboard mirrors the backend's **module pattern** (one folder per domain), with web-specific layers added.

```
┌─────────────────────────────────────────────────────────────┐
│  Composition (top-level — allowed to wire everything)        │
│   src/main.tsx, src/App.tsx, src/router.tsx                  │
│   <RouterProvider> + <QueryClientProvider> + <Toaster>       │
│   router.tsx imports routes/ + features/auth (ProtectedRoute)│
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  src/routes/  (route components — thin pages)               │
│   ├─ auth/LoginPage.tsx                                     │
│   ├─ dashboard/DashboardHomePage.tsx                        │
│   ├─ dashboard/users/UsersListPage.tsx                      │
│   └─ ... composes feature components, calls query hooks     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  src/features/<feature>/                                    │
│   ├─ <feature>.api.ts       (HTTP calls — axios)            │
│   ├─ <feature>.queries.ts   (TanStack Query hooks)          │
│   ├─ <feature>.schema.ts    (Zod schemas + DTO types)       │
│   ├─ <feature>.types.ts     (additional TS types)           │
│   └─ components/            (feature-specific UI)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  src/lib/  (pure infrastructure — no React features deps)   │
│   ├─ api/client.ts          (axios + interceptors + envelope)│
│   ├─ api/errors.ts          (typed AppError mirror)          │
│   ├─ auth/roles.ts          (role enum mirror + helpers)    │
│   └─ utils/                 (formatters, helpers)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  tanaw-backend  (HTTP — /api/v1/*)                          │
└─────────────────────────────────────────────────────────────┘
```

### Layer rules (mirror of backend's discipline)

| Layer | May import from | May NOT import from |
|---|---|---|
| `src/main.tsx`, `App.tsx`, `router.tsx` (composition) | everything | — (this is the wiring layer) |
| `routes/**` | `features/**`, `lib/**`, `components/**` | another `routes/` page directly |
| `features/<f>/components/**` | own feature, `components/ui/**`, `lib/**` | `routes/**`, other features |
| `features/<f>/queries.ts` | own `api.ts`, `lib/**` | `routes/**`, components |
| `features/<f>/api.ts` | `lib/api/**`, own `schema.ts` | components, queries |
| `features/<f>/schema.ts` | nothing app-specific | everything else |
| `lib/**` | `lib/**` only | `features/**`, `routes/**`, `components/**` |

> **`features/auth` is special.** `<ProtectedRoute>` lives in `features/auth/components/` because it depends on `useSession()` — an auth-feature concern. The composition layer (`router.tsx`) is the only place that imports it.

**Cross-feature imports go through a feature's barrel** (`features/users/index.ts`) — never reach into another feature's internals.

---

## 4. Routing

Using **React Router 6** (`createBrowserRouter`). Explicit route tree configured in `src/router.tsx` (top-level composition file). React Router loaders/actions are **not** used — TanStack Query owns all data fetching.

### Route tree

```
/                                  → ProtectedRoute → DashboardLayout
  /                                → DashboardHomePage  (stats overview)
  /users                           → UsersListPage
  /users/:id                       → UserDetailPage
  /content/posts                   → PostsListPage
  /content/posts/:id               → PostDetailPage
  /content/reports                 → ReportsListPage
  /barangays                       → BarangaysListPage
  /barangays/:id                   → BarangayDetailPage
  /employee-codes                  → EmployeeCodesPage
  /audit-log                       → AuditLogPage
  /settings                        → SettingsPage

/login                             → AuthLayout → LoginPage
*                                  → NotFoundPage
```

### Route config sketch

```tsx
// src/router.tsx  (top-level — composition, not infrastructure)
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@features/auth';
// ...other imports

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'GOVERNMENT_EMPLOYEE']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/', element: <DashboardHomePage /> },
      { path: '/users', element: <UsersListPage /> },
      { path: '/users/:id', element: <UserDetailPage /> },
      // ...
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
```

### Auth gating

There is no server boundary. The guard is **client-side**, and the backend is the security boundary.

1. **`<ProtectedRoute>`** (lives at `features/auth/components/ProtectedRoute.tsx`) wraps protected layouts. It uses `useSession()` from `features/auth/auth.queries.ts` — a TanStack Query hook over `GET /users/me`:
   - While loading → full-page spinner.
   - On error / no session → `<Navigate to="/login" replace />`.
   - Wrong role → `<Navigate to="/login?error=forbidden" replace />`.
   - Otherwise → `<Outlet />`.
2. **The backend rejects** any admin endpoint call from a non-admin user with 403, regardless of what the UI shows. This is the actual security.
3. The dashboard never renders sensitive data **before** session resolves — `<ProtectedRoute>` shows the spinner first.

> Trade-off vs. SSR guard: there is a brief flash of "loading…" before redirect on first paint. Acceptable for an internal tool — and the data itself is never fetched until after the guard passes, so nothing leaks.

---

## 5. Auth Flow

```
   Browser (tanaw-admin SPA)              tanaw-backend
            │                                    │
            │  POST /api/v1/auth/login           │
            │  (axios, withCredentials: true)    │
            ├───────────────────────────────────▶│
            │                                    │
            │  Set-Cookie: tanaw_access (httpOnly)│
            │  Set-Cookie: tanaw_refresh (httpOnly)│
            │  Set-Cookie: tanaw_csrf             │
            │  body: { user }                     │
            │◀───────────────────────────────────┤
            │                                    │
            │  GET /api/v1/users/me              │
            │  (cookies sent automatically)      │
            ├───────────────────────────────────▶│
            │  body: { user with role }          │
            │◀───────────────────────────────────┤
            │                                    │
            │  ProtectedRoute resolves:          │
            │   role === SUPER_ADMIN → render    │
            │   else → /login?error=forbidden    │
            │                                    │
```

### Required backend changes
Small, additive. None of these break the mobile app.

- `POST /auth/login` — when `Origin` matches the admin allowlist, additionally `Set-Cookie`:
  - `tanaw_access` — httpOnly, Secure, SameSite=Lax, path=/, ~15min
  - `tanaw_refresh` — httpOnly, Secure, SameSite=Strict, path=/api/v1/auth, ~7d
  - `tanaw_csrf` — **not** httpOnly (must be JS-readable), Secure, SameSite=Lax
- `POST /auth/refresh` — accepts refresh from either body (mobile) **or** cookie (admin); rotates and re-issues both cookies.
- `POST /auth/logout` — clears all three cookies, revokes refresh in DB.
- Add **CSRF check middleware** for write methods on cookie-authenticated requests: `X-CSRF-Token` header must equal `tanaw_csrf` cookie. Skip for header-bearer auth (mobile).
- CORS: backend must allow the admin origin **with** `credentials: true`.

### Token refresh (axios interceptor)
On 401, the response interceptor:
1. Holds a single in-flight refresh promise (so 5 concurrent failed requests don't trigger 5 refreshes).
2. Calls `POST /auth/refresh` (cookies sent automatically).
3. On success → retry original request once.
4. On failure → clear local session cache, navigate to `/login`.

Same shape as `tanaw-mobile/src/api/client.ts`, adapted to cookie auth.

---

## 6. The Module Pattern (per feature)

Every feature folder under `src/features/<name>/` has the same shape — same discipline as the backend's 4-layer rule, adapted for the web.

```
src/features/users/
├── users.schema.ts        # Zod schemas + inferred types
├── users.api.ts           # axios calls — returns unwrapped data
├── users.queries.ts       # TanStack Query hooks (useUsers, useUser, useSuspendUser)
├── users.types.ts         # extra UI-only types (filter shape, table column meta)
├── components/
│   ├── UsersTable.tsx
│   ├── UserDetailCard.tsx
│   ├── SuspendUserDialog.tsx
│   └── UserFilters.tsx
└── index.ts               # barrel — only what other features may import
```

### Rules per file

- **`schema.ts`** — Zod schemas only. Mirror of backend Zod where possible. Export `type X = z.infer<typeof xSchema>`.
- **`api.ts`** — One function per endpoint. Calls `apiClient`. Returns `data` (envelope already unwrapped). Throws typed `AppError`.
- **`queries.ts`** — TanStack Query hooks. No raw axios here. Query keys live here as exported constants.
- **`types.ts`** — UI types not derived from server (e.g. `UsersTableColumn`).
- **`components/`** — Feature-only UI. Cannot be imported from another feature.
- **`index.ts`** — Barrel re-exports the public surface (queries, key components). Internals stay private.

---

## 7. State Management Strategy

| Kind of state | Tool | Lives in |
|---|---|---|
| Server data (users, posts, audit log) | TanStack Query | `features/*/queries.ts` |
| Form state | react-hook-form | Component-local |
| Auth/session | `useSession()` (TanStack Query over `GET /users/me`) | `features/auth/auth.queries.ts` |
| UI prefs (sidebar collapsed, theme) | Zustand | `lib/stores/uiStore.ts` |
| Modal stack | Zustand or context | `lib/stores/modalStore.ts` |
| URL state (filters, pagination, tab) | `useSearchParams` (React Router) | Component-local |

> **Rule:** if it lives on the server, it goes in TanStack Query. Don't dual-write to Zustand.

---

## 8. Error Handling

Three layers:

1. **`apiClient` throws typed `AppError`** with `{ message, statusCode, fieldErrors? }`. The `message` and `statusCode` come from the backend's `AppError` class; `fieldErrors` is populated from the response envelope's `errors` array (only present on 422 validation failures — see doc 04 §5 for the exact shape).
2. **Mutations show toast** on error via shadcn `useToast`. Queries show inline error states (table empty state, retry button).
3. **React Router `errorElement`** at the layout level catches render-time crashes — shows a generic fallback + reset button.

Never swallow errors silently. Never `console.log` and continue. If a mutation fails, the user sees feedback.

---

## 9. Performance & Caching

- **Code splitting** — every route component is `React.lazy()`-loaded so the initial bundle stays small.
- **TanStack Query staleTime:** 30s default, 5min for slow-changing data (barangays, employee codes), 0 for audit log (always fresh).
- **Tables** virtualize when row count > 200 (TanStack Virtual).
- **Images** with native `loading="lazy"`. Avatars from R2 served directly through CDN-aware URL.
- **No client-side bundling of secrets.** Only `import.meta.env.VITE_*` vars are exposed to the browser. Vite enforces this.

---

## 10. Security

- All admin endpoints **require** backend `requireRole(SUPER_ADMIN)` (or `GOVERNMENT_EMPLOYEE` for scoped reads).
- Tokens in `httpOnly`+`Secure`+`SameSite=Lax` cookies — no `localStorage`.
- CSRF protection on all writes (double-submit cookie).
- Strict CORS at backend: only the admin origin allowed, `credentials: true`.
- CSP header served by nginx in front of the SPA: no inline scripts/styles, restrict img sources to R2 + same-origin.
- Audit-log every write action (already supported by backend `AuditLog`). Admin actions add a new `action` enum value (e.g. `ADMIN_USER_SUSPENDED`).
- Rate-limit admin endpoints separately from public auth — slower writes, allow higher reads.

---

## 11. Build, Deploy, Run

| Environment | Hostname (proposed) | Backend it talks to |
|---|---|---|
| Local dev | `http://localhost:5173` (Vite default) | `http://localhost:3000/api/v1` |
| Staging | `https://admin-staging.tanauancity.com` | staging backend |
| Production | `https://admin.tanauancity.com` | `https://tanaw-api.tanauancity.com/api/v1` |

### Build output
`npm run build` produces a static `dist/` folder (HTML + hashed JS/CSS assets).

### Deployment
Serve `dist/` via nginx on the same Ubuntu host as the backend, OR via Cloudflare Pages / S3+CloudFront. No Node runtime needed at the edge.

Required nginx config notes:
- Serve `dist/` as the document root.
- **SPA fallback:** `try_files $uri $uri/ /index.html;` so React Router handles client-side routes.
- Set CSP, HSTS, X-Frame-Options headers here (not in app code).
- Optionally proxy `/api/v1/*` → backend so frontend and API share an origin (eliminates CORS, simplifies cookies). **Recommended for production.**

### Env vars (Vite)
Vite exposes only variables prefixed with `VITE_*` to the client.

```
VITE_API_BASE_URL=https://tanaw-api.tanauancity.com/api/v1
VITE_APP_ENV=production
```

Read in code as `import.meta.env.VITE_API_BASE_URL`.

---

## 12. What Gets Built First (Phase 2 Roadmap)

In order:

1. **Scaffold + auth** — Vite app, login page, `<ProtectedRoute>`, cookie-based session, `useSession()`, axios interceptor.
2. **Users module** — list/search/filter, view detail, suspend/activate.
3. **Audit log viewer** — read-only, paginated, filtered by action/user/date.
4. **Content moderation** — list posts, hide/delete.
5. **Barangay CRUD** — currently seed-only; admin can add/disable.
6. **Employee codes** — generate batches, view usage.
7. **Stats home** — counts by role, posts/day, growth charts.
8. **Settings** — admin profile, change password.

Each module ships with: backend endpoints + admin UI + tests + audit-log entries.

---

## 13. Out of Scope (Explicitly)

- Multi-tenancy. TANAW is one city, one tenant.
- Public-facing analytics. Admin only.
- Real-time websockets. Polling/refetch is enough for Phase 2.
- Mobile-first responsive design. Desktop primary; tablet usable.
- Internationalization. English + Filipino strings can be added later via `react-i18next`.
- Server-side rendering. Pure SPA; if SEO ever becomes a need, that is a re-platform decision, not a Phase-2 concern.

---

The next document (`03-admin-dashboard-folder-structure.md`) translates this architecture into the exact folder layout.

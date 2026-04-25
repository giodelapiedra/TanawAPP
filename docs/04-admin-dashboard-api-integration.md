# 04 — Admin Dashboard ↔ Backend Integration

> How `tanaw-admin` (Vite + React SPA) talks to `tanaw-backend`. Conventions only — no implementation yet.

---

## 1. The Contract

The backend already enforces:

- **Base URL:** `https://tanaw-api.tanauancity.com/api/v1` (prod), `http://localhost:3000/api/v1` (dev).
- **Response envelope:** `{ success: boolean, message: string, data: T }` for every endpoint.
- **Auth:** `Authorization: Bearer <accessToken>` for mobile. For the dashboard, the access token comes from an `httpOnly` cookie that the browser sends automatically (after backend addition described in §3).
- **Errors:** non-2xx with envelope `{ success: false, message, errors? }`.
- **Validation:** server-side Zod (mobile + admin must mirror the schemas).

The dashboard's job is to honor this contract, never break it, and never invent a parallel one.

---

## 2. The `apiClient`

A thin **axios** instance — same shape as `tanaw-mobile/src/api/client.ts`, adapted to cookie auth.

It does four things and nothing else:

1. Prepends the base URL.
2. Sets `withCredentials: true` so cookies are sent on every request.
3. Attaches `X-CSRF-Token` header on writes (read from the `tanaw_csrf` cookie).
4. Parses the envelope, returns `data`, throws `AppError` on `success: false` or non-2xx.

```ts
// src/lib/api/client.ts (sketch — not implemented yet)
import axios from 'axios';
import { env } from '@lib/utils/env';
import { AppError } from './errors';
import { readCsrfToken } from './csrf';
import { attachRefreshInterceptor } from './refresh';
import type { ApiEnvelope } from './envelope';

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach CSRF for writes
apiClient.interceptors.request.use((config) => {
  const isWrite = ['post', 'patch', 'put', 'delete'].includes(
    (config.method ?? 'get').toLowerCase()
  );
  if (isWrite) {
    const csrf = readCsrfToken();
    if (csrf) config.headers['X-CSRF-Token'] = csrf;
  }
  return config;
});

// Response interceptor — unwrap envelope, throw AppError
apiClient.interceptors.response.use(
  (res) => {
    const body = res.data as ApiEnvelope<unknown>;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        // body.errors is an array of { field, message } on 422; undefined otherwise
        throw new AppError(body.message ?? 'Request failed', res.status, body.errors);
      }
      // Mutate response so callers receive `data` directly
      res.data = body.data;
    }
    return res;
  },
  (err) => {
    const statusCode = err.response?.status ?? 0;
    const body = err.response?.data as ApiEnvelope<unknown> | undefined;
    throw new AppError(
      body?.message ?? err.message ?? 'Network error',
      statusCode,
      body?.errors
    );
  }
);

// 401 → refresh → retry once → logout-on-fail
attachRefreshInterceptor(apiClient);
```

### Usage in `feature.api.ts`

```ts
// src/features/users/users.api.ts
import { apiClient } from '@lib/api/client';
import type { User, UsersFilters } from './users.schema';

export const usersApi = {
  list: async (filters: UsersFilters): Promise<{ items: User[]; total: number }> => {
    const res = await apiClient.get('/admin/users', { params: filters });
    return res.data;            // already unwrapped by the interceptor
  },
  suspend: async (id: string): Promise<User> => {
    const res = await apiClient.patch(`/admin/users/${id}/status`, { status: 'SUSPENDED' });
    return res.data;
  },
};
```

### Rules
- `feature.api.ts` files **always return `data`** — never the envelope.
- `apiClient` **always throws** `AppError` — never returns `null` for failures.
- No `try/catch` inside `feature.api.ts`. Let errors propagate to TanStack Query / mutations.

---

## 3. Auth Flow (Cookie-Based, Direct Browser → Backend)

The mobile app uses bearer tokens in headers. The dashboard uses `httpOnly` cookies. Both go through the **same backend endpoints** — the difference is at the response level. The SPA talks to the backend **directly** — there is no BFF layer.

### 3.1 Required backend changes

Small, additive. None of these break the mobile app.

- `POST /auth/login` — when `Origin` matches the admin allowlist, additionally `Set-Cookie`:
  - `tanaw_access` — httpOnly, Secure, SameSite=Lax, path=/, ~15min
  - `tanaw_refresh` — httpOnly, Secure, SameSite=Strict, path=/api/v1/auth, ~7d
  - `tanaw_csrf` — **not** httpOnly (must be JS-readable), Secure, SameSite=Lax
- `POST /auth/refresh` — accepts refresh from either body (mobile) **or** cookie (admin); rotates and re-issues both cookies.
- `POST /auth/logout` — clears all three cookies, revokes refresh in DB.
- Add **CSRF check middleware** for write methods on cookie-authenticated requests: `X-CSRF-Token` header must equal `tanaw_csrf` cookie. Skip for header-bearer auth (mobile).
- **CORS:** backend must allow the admin origin **with** `credentials: true`. Today's `corsOrigins` array works — just add the admin host.

### 3.2 Same-site vs. cross-site cookies

Two deployment shapes — pick one before going live:

| Shape | Cookie attrs | Pros | Cons |
|---|---|---|---|
| **A. Reverse-proxy** — nginx serves `dist/` and proxies `/api/v1/*` to backend | `SameSite=Lax`, `Secure` | No CORS, simplest cookies, works everywhere | Slightly more nginx config |
| **B. Separate origins, same registrable domain** — `admin.tanauancity.com` ↔ `tanaw-api.tanauancity.com` | `SameSite=Lax`, `Secure`, `Domain=.tanauancity.com` | Clean separation | Must keep `Domain` attribute correct; admin and API must share the registrable domain |

**Recommendation: Shape A in production.** Eliminates an entire class of CORS/cookie issues.

> **⚠ Hard constraint for Shape B.** The browser only treats two origins as "same-site" when they share a **registrable domain** (the public-suffix-list-derived eTLD+1). `admin.tanauancity.com` and `tanaw-api.tanauancity.com` both have `tanauancity.com` as their registrable domain — Shape B works.
>
> **If admin and API are ever deployed under different registrable domains** (e.g. `admin.example.com` ↔ `api.tanauancity.com`), `SameSite=Lax` cookies are **not sent** on cross-site `fetch`/XHR. The only options become:
> - Use `SameSite=None; Secure` cookies (allows cross-site, increases CSRF surface — must keep CSRF middleware strict).
> - **Fall back to Shape A.** This is the recommended remediation.
>
> Don't mix shapes. Pick one and document it in the deploy runbook.

### 3.3 Login flow

```
LoginForm submits
        │
        ▼
useLogin() mutation → apiClient.post('/auth/login', { identifier, password })
        │  (axios sends with credentials)
        ▼
Backend: validates, Set-Cookie x3, returns { user } in body
        │
        ▼
Browser stores cookies for the API origin
        │
        ▼
queryClient.setQueryData(authKeys.session, user)
        │
        ▼
navigate('/', { replace: true })
        │
        ▼
ProtectedRoute reads useSession() → renders dashboard
```

### 3.4 Refresh flow (axios interceptor)

```
apiClient request → 401 Unauthorized
        │
        ▼
refresh.ts interceptor:
  - If a refresh is already in flight, await its promise
  - Else: call POST /auth/refresh (cookies auto-sent)
        │
        ├── 200 → retry the original request once → success
        └── 401 → queryClient.clear(), router.navigate('/login')
```

A single in-flight refresh promise is shared so 5 concurrent failed requests do not trigger 5 refreshes.

> **Implementation note:** The interceptor runs **outside React**, so `useNavigate()` is unavailable. Import the `router` instance directly from `src/router.tsx` and call `router.navigate('/login', { replace: true })`. Likewise, `queryClient` is imported from `src/lib/query/client.ts`. Keep these as module-level singletons.

### 3.5 Logout flow

```
LogoutButton onClick
        │
        ▼
useLogout() mutation → apiClient.post('/auth/logout')
        │
        ▼
Backend clears cookies + revokes refresh in DB
        │
        ▼
queryClient.clear()
navigate('/login', { replace: true })
```

---

## 4. Role Gating

### Client-side guard (UX)

The `<ProtectedRoute>` component is wrapped around every protected layout in `src/router.tsx`:

```tsx
// src/features/auth/components/ProtectedRoute.tsx (sketch)
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../auth.queries';
import { isAdminRole } from '@lib/auth/roles';
import { LoadingScreen } from '@components/feedback/LoadingScreen';
import type { UserRole } from './roles';

export function ProtectedRoute({
  requiredRoles,
  children,
}: {
  requiredRoles: UserRole[];
  children?: React.ReactNode;
}) {
  const { data: session, isLoading, isError } = useSession();

  if (isLoading) return <LoadingScreen />;
  if (isError || !session) return <Navigate to="/login" replace />;
  if (!requiredRoles.includes(session.user.role)) {
    return <Navigate to="/login?error=forbidden" replace />;
  }

  return children ?? <Outlet />;
}
```

### Server-side enforcement (security)

The backend **independently rejects** every admin endpoint call from a non-admin user with 403 — `authMiddleware → requireRole(SUPER_ADMIN) → controller`. This is the actual security boundary.

The `<ProtectedRoute>` is purely UX (avoids flash of dashboard, prevents pointless API calls). Never trust client-side checks for security.

### Allowed roles for the dashboard

| Role | Dashboard access | Scope |
|---|---|---|
| `SUPER_ADMIN` | Full | All modules, all writes |
| `GOVERNMENT_EMPLOYEE` | Limited (Phase 2.5) | Read users in own department, read audit log, no writes |
| `BARANGAY_OFFICIAL` | Phase 3+ | Read users + posts in own barangay |
| `RESIDENT` | Never | Login is rejected |

---

## 5. Error Handling Convention

### Where errors surface

| Origin | Surfaced as |
|---|---|
| Network failure | Inline error state on table; toast on mutations |
| 4xx from backend (validation) | Form field errors via `react-hook-form`'s `setError` |
| 401 unauthorized | Silent refresh; on second 401 → redirect to login |
| 403 forbidden | Toast: "You don't have permission for this action" |
| 5xx | Toast: "Something went wrong, please retry" + log to console |
| Render-time crash | React Router `errorElement` boundary |

### Mapping backend errors to UI

The backend's `AppError` class is `{ message: string, statusCode: number }` (see `tanaw-backend/src/utils/response.util.ts`). It does **not** carry validation errors itself — those come from the **response envelope**, populated by `errorMiddleware` when a `ZodError` is caught:

```jsonc
// 422 response body
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email",    "message": "Invalid email" },
    { "field": "password", "message": "Required" }
  ]
}
```

The dashboard's `AppError` mirror carries `{ message, statusCode, fieldErrors? }` where `fieldErrors` is the array above (renamed for clarity inside the SPA).

```ts
// inside a form submit handler
const onSubmit = async (values: FormValues) => {
  try {
    await mutation.mutateAsync(values);
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 422 && err.fieldErrors) {
      err.fieldErrors.forEach(({ field, message }) => {
        form.setError(field as keyof FormValues, { message });
      });
      return;
    }
    toast.error(err instanceof AppError ? err.message : 'Unexpected error');
  }
};
```

### Never do
- Never `try/catch` in components without doing something with the error.
- Never `console.log(err)` and continue.
- Never display raw `err.toString()` to the user.

---

## 6. TanStack Query Conventions

### Query keys
Each feature owns a query-key factory.

```ts
// src/features/users/users.queries.ts
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: UsersFilters) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};
```

### Stale times (defaults)

| Data kind | staleTime | Why |
|---|---|---|
| Lists (users, posts) | 30s | Mostly stable, refetch on focus |
| Detail (user by id) | 60s | Same |
| Slow data (barangays) | 5min | Changes rarely |
| Audit log | 0 | Always fresh on view |
| Stats | 60s | Background refetch is fine |
| `useSession()` | 5min, refetchOnWindowFocus | Session check is cheap, freshness matters |

### Mutations
- Always invalidate related lists on success.
- Show success toast.
- Use optimistic updates **only** for low-risk toggles (e.g. `isActive`); do not optimistically delete.

```ts
const useSuspendUser = () =>
  useMutation({
    mutationFn: usersApi.suspend,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      toast.success('User suspended');
    },
  });
```

---

## 7. Pagination, Filters, URL State

URLs are the source of truth for lists. Filters and pagination sync to `searchParams` (via React Router's `useSearchParams`) so:
- Refresh keeps state
- Bookmarks/share-links work
- Back/forward navigates filter history

```
/users?role=RESIDENT&status=ACTIVE&q=juan&page=2&pageSize=25
```

Backend list endpoints accept the same shape. The `useUsers` hook reads from `searchParams`, builds the query key, and calls the API.

---

## 8. CSRF in Practice

- Backend issues `tanaw_csrf` cookie on login (NOT httpOnly).
- `apiClient` request interceptor reads this cookie's value on every write request and sends it as `X-CSRF-Token` header.
- Backend middleware compares header to cookie. Mismatch → 403.
- This is the **double-submit-cookie** pattern. Standard, simple, no server-side store.

```ts
// src/lib/api/csrf.ts
export function readCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)tanaw_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
```

---

## 9. Mirroring Backend Schemas

Until a `packages/shared-schemas/` workspace exists, the admin dashboard maintains a **strict mirror** of backend Zod schemas in its own `features/*/schema.ts` files.

### Process
- Whenever a backend Zod schema changes, the matching admin schema is updated in the same PR.
- A CI check diffs schema source for known mirror pairs and fails if backend changed without admin.

### Long-term plan
Extract schemas to a shared workspace package, imported by backend (for validation) and admin (for `z.infer` types and client validation).

---

## 10. Endpoint Inventory (Phase 2)

These need to be built on the backend before the matching admin module ships. Each follows the existing 4-layer pattern.

### `modules/admin-users/`
```
GET    /api/v1/admin/users                  list + filter (role, status, barangay, q, page)
GET    /api/v1/admin/users/:id              detail
PATCH  /api/v1/admin/users/:id              update profile
PATCH  /api/v1/admin/users/:id/status       suspend / activate / deactivate
PATCH  /api/v1/admin/users/:id/role         change role (SUPER_ADMIN only)
POST   /api/v1/admin/users/:id/reset-password
```

### `modules/admin-content/`
```
GET    /api/v1/admin/posts                  list + filter
GET    /api/v1/admin/posts/:id              detail
DELETE /api/v1/admin/posts/:id              hard delete (audited)
PATCH  /api/v1/admin/posts/:id/hide         soft hide
GET    /api/v1/admin/reports                queue of user reports
PATCH  /api/v1/admin/reports/:id/resolve
```

### `modules/admin-barangays/`
```
GET    /api/v1/admin/barangays
POST   /api/v1/admin/barangays              create
PATCH  /api/v1/admin/barangays/:id          update / disable
```

### `modules/admin-employee-codes/`
```
GET    /api/v1/admin/employee-codes
POST   /api/v1/admin/employee-codes/batch   { count, department }
PATCH  /api/v1/admin/employee-codes/:id/revoke
```

### `modules/admin-audit/`
```
GET    /api/v1/admin/audit                  paginated, filter by action, user, date range
```

### `modules/admin-stats/`
```
GET    /api/v1/admin/stats/summary          users by role/status, posts today, MAU/DAU
GET    /api/v1/admin/stats/posts            time-series for charts
```

All `admin/*` routes require `authMiddleware → requireRole(SUPER_ADMIN)` (some allow `GOVERNMENT_EMPLOYEE` as read-only).

---

## 11. Local Dev Setup (target)

```
.env.local
─────────────
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_ENV=development
```

Dev server runs at `http://localhost:5173` (Vite default).

Two ways to run dev — pick what's easier:

**Option A — direct CORS (no proxy):**
- Backend `CORS_ORIGINS` includes `http://localhost:5173`.
- Backend cookies in dev: `Secure=false`, `SameSite=Lax`, `httpOnly=true`.
- Axios uses `withCredentials: true`.

**Option B — Vite dev proxy (mirrors prod):**
```ts
// vite.config.ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```
- Frontend uses `VITE_API_BASE_URL=/api/v1` (same-origin).
- No CORS needed in dev.
- Closer to the production reverse-proxy shape.

**Recommend Option B.** Same-origin in dev = same-origin in prod = no surprises.

---

## 12. Production Hardening Checklist

Before the dashboard goes live:

- [ ] HTTPS enforced (HSTS header at nginx)
- [ ] CSP header strict at nginx (no inline scripts, only allowed origins for images/fonts)
- [ ] `tanaw_access` cookie: `Secure=true`, `HttpOnly=true`, `SameSite=Lax`
- [ ] `tanaw_refresh` cookie: `Secure=true`, `HttpOnly=true`, `SameSite=Strict`, `path=/api/v1/auth`
- [ ] CORS at backend: only the production admin origin, `credentials: true` (or N/A if reverse-proxied same-origin)
- [ ] CSRF middleware enforced on all cookie-auth writes
- [ ] Admin routes rate-limited separately from public auth
- [ ] All admin write actions emit `AuditLog` entries
- [ ] No secrets in client bundle (only `VITE_*` env vars are exposed)
- [ ] `errorElement` at root → no stack traces in production
- [ ] Source maps not exposed in production (or exposed only privately)
- [ ] nginx SPA fallback: `try_files $uri $uri/ /index.html;`
- [ ] Cache-Control: `index.html` no-cache; hashed JS/CSS assets immutable

---

That completes the documentation set. Implementation starts after these docs are reviewed and approved.

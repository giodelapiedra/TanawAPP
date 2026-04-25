# 03 — Admin Dashboard Folder Structure

> Concrete folder layout for `tanaw-admin/` — Vite + React 18 + React Router 6. Every file has a single, explicit purpose. Naming and placement rules are at the end.

---

## 1. Top-Level Layout

```
tanaw-admin/
├── .env.example
├── .env.local                  # gitignored
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── CLAUDE.md                   # short conventions file (mirrors backend/mobile)
├── README.md
├── index.html                  # Vite entry HTML
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
│   ├── favicon.ico
│   ├── logo-tanaw.svg
│   └── images/
│
└── src/
    ├── main.tsx                # ReactDOM.createRoot, mounts <App />
    ├── App.tsx                 # <RouterProvider> + <QueryClientProvider> + <Toaster>
    ├── router.tsx              # createBrowserRouter — composition layer
    ├── vite-env.d.ts           # Vite's ambient types
    │
    ├── routes/                 # Route components (one file per page)
    ├── features/               # Domain modules (mirror of backend modules)
    ├── components/             # Cross-feature shared UI
    ├── lib/                    # Pure infrastructure (api client, role helpers, utils)
    ├── styles/                 # Tailwind + globals
    └── tests/                  # Test setup + e2e
```

---

## 2. `src/routes/` — Route Components Only

These are thin pages that compose feature components and call query hooks. **No business logic, no fetch calls inline.**

```
src/routes/
│
├── auth/
│   └── LoginPage.tsx           # /login
│
├── dashboard/
│   ├── DashboardHomePage.tsx   # /  (stats overview)
│   │
│   ├── users/
│   │   ├── UsersListPage.tsx   # /users
│   │   └── UserDetailPage.tsx  # /users/:id
│   │
│   ├── content/
│   │   ├── posts/
│   │   │   ├── PostsListPage.tsx        # /content/posts
│   │   │   └── PostDetailPage.tsx       # /content/posts/:id
│   │   └── reports/
│   │       └── ReportsListPage.tsx      # /content/reports
│   │
│   ├── barangays/
│   │   ├── BarangaysListPage.tsx        # /barangays
│   │   └── BarangayDetailPage.tsx       # /barangays/:id
│   │
│   ├── employee-codes/
│   │   └── EmployeeCodesPage.tsx        # /employee-codes
│   │
│   ├── audit-log/
│   │   └── AuditLogPage.tsx             # /audit-log
│   │
│   └── settings/
│       └── SettingsPage.tsx             # /settings
│
└── NotFoundPage.tsx            # *
```

> **Rule:** Route components are wired into the router config in `src/router.tsx` (top-level composition file, NOT under `lib/`). They are usually `React.lazy()`-loaded to keep the initial bundle small.

---

## 3. `src/features/` — Domain Modules

One folder per backend module. Same names. Same vocabulary.

```
src/features/
│
├── auth/
│   ├── auth.schema.ts          # Login schema (zod)
│   ├── auth.api.ts             # login(), logout(), refresh(), me()
│   ├── auth.queries.ts         # useSession(), useLogin(), useLogout()  ← canonical home
│   ├── auth.types.ts           # SessionUser, AuthState
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── LogoutButton.tsx
│   │   └── ProtectedRoute.tsx  # Route guard — uses useSession(), navigates on fail
│   └── index.ts                # Public surface: useSession, useLogin, useLogout, ProtectedRoute
│
├── users/
│   ├── users.schema.ts         # listUsersQuerySchema, suspendUserSchema, etc
│   ├── users.api.ts            # listUsers(), getUser(), suspendUser(), changeRole()
│   ├── users.queries.ts        # useUsers(), useUser(), useSuspendUser()
│   ├── users.types.ts          # UsersFilters, UsersTableColumn
│   ├── components/
│   │   ├── UsersTable.tsx
│   │   ├── UsersFilters.tsx
│   │   ├── UserDetailCard.tsx
│   │   ├── SuspendUserDialog.tsx
│   │   ├── ChangeRoleDialog.tsx
│   │   └── ResetPasswordDialog.tsx
│   └── index.ts
│
├── content/                    # Posts, comments, reports moderation
│   ├── posts/
│   │   ├── posts.schema.ts
│   │   ├── posts.api.ts
│   │   ├── posts.queries.ts
│   │   └── components/
│   │       ├── PostsTable.tsx
│   │       └── HidePostDialog.tsx
│   ├── reports/
│   │   ├── reports.schema.ts
│   │   ├── reports.api.ts
│   │   ├── reports.queries.ts
│   │   └── components/
│   │       └── ReportsTable.tsx
│   └── index.ts
│
├── barangays/
│   ├── barangays.schema.ts
│   ├── barangays.api.ts
│   ├── barangays.queries.ts
│   ├── components/
│   │   ├── BarangaysTable.tsx
│   │   └── BarangayForm.tsx
│   └── index.ts
│
├── employee-codes/
│   ├── employee-codes.schema.ts
│   ├── employee-codes.api.ts
│   ├── employee-codes.queries.ts
│   ├── components/
│   │   ├── EmployeeCodesTable.tsx
│   │   └── GenerateCodesDialog.tsx
│   └── index.ts
│
├── audit-log/
│   ├── audit-log.schema.ts
│   ├── audit-log.api.ts
│   ├── audit-log.queries.ts
│   ├── components/
│   │   ├── AuditLogTable.tsx
│   │   └── AuditLogFilters.tsx
│   └── index.ts
│
└── stats/
    ├── stats.schema.ts
    ├── stats.api.ts
    ├── stats.queries.ts
    ├── components/
    │   ├── StatsHeader.tsx
    │   ├── UsersByRoleChart.tsx
    │   └── PostsPerDayChart.tsx
    └── index.ts
```

### File-by-file purpose

| File | Purpose | May contain |
|---|---|---|
| `<feature>.schema.ts` | Zod schemas + inferred types | `z.object(...)`, `z.infer<>` exports |
| `<feature>.api.ts` | Pure HTTP calls | `apiClient.get/post/...` returning `data` |
| `<feature>.queries.ts` | TanStack Query hooks + query keys | `useQuery`, `useMutation`, `usersKeys` const |
| `<feature>.types.ts` | UI-only types not derived from server | filter shapes, table meta |
| `components/*.tsx` | Feature-only UI | JSX, hooks, calling queries |
| `index.ts` | Barrel — public surface | re-exports of queries, key components |

---

## 4. `src/components/` — Cross-Feature Shared UI

```
src/components/
├── ui/                         # shadcn/ui primitives (generated)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── select.tsx
│   ├── avatar.tsx
│   └── ...
│
├── layout/                     # Dashboard shell pieces
│   ├── AuthLayout.tsx          # Centered card layout for /login
│   ├── DashboardLayout.tsx     # Sidebar + topbar + <Outlet />
│   ├── Sidebar.tsx
│   ├── SidebarNavItem.tsx
│   ├── Topbar.tsx
│   ├── UserMenu.tsx
│   ├── Breadcrumbs.tsx
│   └── PageHeader.tsx
│
├── data-display/               # Generic, feature-agnostic
│   ├── DataTable.tsx           # Wrapper over TanStack Table + shadcn table
│   ├── DataTablePagination.tsx
│   ├── DataTableColumnHeader.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   ├── LoadingSkeleton.tsx
│   └── StatusBadge.tsx
│
├── forms/                      # Form primitives
│   ├── FormField.tsx           # rhf + label + error wrapper
│   ├── FormSubmitButton.tsx
│   └── FormError.tsx
│
└── feedback/
    ├── ConfirmDialog.tsx
    ├── RouteErrorBoundary.tsx  # Used by router's errorElement
    └── Toaster.tsx             # mounted in App.tsx
```

> **Rule:** anything in `components/` is **feature-agnostic**. If it knows about a `User` or a `Post`, it belongs in `features/`.

---

## 5. `src/lib/` — Infrastructure

```
src/lib/
│
├── api/
│   ├── client.ts               # axios instance: baseURL, withCredentials, interceptors
│   ├── envelope.ts             # Type + parser for { success, message, data }
│   ├── errors.ts               # AppError class — { message, statusCode, fieldErrors? }
│   ├── refresh.ts              # 401 → refresh → retry once → router.navigate('/login')
│   └── csrf.ts                 # Reads csrf cookie, attaches X-CSRF-Token header
│
├── auth/
│   └── roles.ts                # Pure helpers only: ROLES enum, isSuperAdmin(role), etc.
│                               # NO React, NO TanStack Query — those live in features/auth.
│
├── stores/
│   ├── uiStore.ts              # Zustand: sidebar collapsed, theme
│   └── modalStore.ts           # Zustand: stacked modals
│
├── query/
│   ├── client.ts               # QueryClient instance + defaults
│   └── Provider.tsx            # <QueryClientProvider> wrapper + DevTools
│
├── format/
│   ├── date.ts                 # formatDate, formatRelativeTime
│   ├── name.ts                 # formatFullName, initials
│   ├── role.ts                 # formatRole (RESIDENT → "Resident")
│   └── number.ts               # formatCount, formatPercent
│
├── constants/
│   ├── roles.ts                # ROLES, ROLE_LABELS, ROLE_COLORS
│   ├── status.ts               # USER_STATUS, USER_STATUS_LABELS
│   ├── routes.ts               # ROUTES.users, ROUTES.userDetail(id)
│   ├── nav.ts                  # Sidebar nav definition
│   └── pagination.ts           # DEFAULT_PAGE_SIZE etc
│
├── hooks/
│   ├── useDebounce.ts
│   ├── usePagination.ts        # syncs with ?page=&pageSize= via useSearchParams
│   ├── useUrlFilters.ts        # syncs filters to URL
│   └── useConfirm.ts           # promise-based confirm dialog
│
└── utils/
    ├── cn.ts                   # className merge (clsx + tailwind-merge)
    └── env.ts                  # validated env (zod, mirrors backend pattern)
```

> **Rule:** `lib/` never imports from `features/` or `routes/`. Pure infrastructure only.

---

## 6. `src/styles/`

```
src/styles/
└── globals.css                 # Tailwind base + CSS vars + shadcn theme
```

Tailwind config and shadcn theme tokens live in `tailwind.config.ts`. Design tokens (color names, spacing scale) align with the mobile `src/constants/colors.ts` so the brand stays visually consistent.

---

## 7. `src/tests/`

```
src/tests/
├── setup.ts                    # Vitest setup: jsdom, MSW handlers
├── msw/
│   ├── handlers.ts             # Mock API responses
│   └── server.ts
└── e2e/
    ├── login.spec.ts           # Playwright
    ├── users-list.spec.ts
    └── suspend-user.spec.ts
```

Unit/component tests live alongside their source as `*.test.tsx`. E2E tests live under `tests/e2e/`.

---

## 8. Path Aliases (`tsconfig.json` + `vite.config.ts`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@routes/*": ["src/routes/*"],
      "@features/*": ["src/features/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"],
      "@styles/*": ["src/styles/*"]
    }
  }
}
```

Matching aliases must be set in `vite.config.ts` (`resolve.alias`). Imports look like:
```ts
import { useUsers } from '@features/users';
import { DataTable } from '@components/data-display/DataTable';
import { apiClient } from '@lib/api/client';
```

---

## 9. Naming Conventions

| Kind | Convention | Example |
|---|---|---|
| Route component file | PascalCase + `Page` suffix | `UsersListPage.tsx`, `UserDetailPage.tsx` |
| Route folder | kebab-case | `audit-log/`, `employee-codes/` |
| Feature folder | kebab-case | `features/employee-codes/` |
| React component file | PascalCase `.tsx` | `UsersTable.tsx`, `LoginForm.tsx` |
| Hook file | camelCase, `use*` | `useDebounce.ts`, `useSession.ts` |
| Non-component module file | camelCase | `client.ts`, `errors.ts` |
| Layered feature file | kebab-case, layer suffix | `users.api.ts`, `users.schema.ts` |
| Zod schema export | camelCase, `*Schema` | `loginSchema`, `suspendUserSchema` |
| Inferred type export | PascalCase | `type SuspendUserInput = z.infer<typeof suspendUserSchema>` |
| Query key constant | camelCase, `*Keys` | `usersKeys.list(filters)` |
| Constant export | UPPER_SNAKE | `DEFAULT_PAGE_SIZE`, `ROLE_LABELS` |
| CSS class composition util | `cn()` | `cn('p-4', isActive && 'bg-muted')` |

---

## 10. Import Order (enforced by ESLint)

```ts
// 1. Framework
import { useState, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 2. Third-party
import { useQuery } from '@tanstack/react-query';

// 3. Aliased: lib → components → features → routes
import { apiClient } from '@lib/api/client';
import { DataTable } from '@components/data-display/DataTable';
import { useUsers } from '@features/users';

// 4. Relative
import { UsersFilters } from './UsersFilters';

// 5. Types (separated, after values)
import type { User } from '@features/users';
```

---

## 11. What Lives Where — Decision Cheatsheet

| If you are about to write… | Put it in… |
|---|---|
| A route page | `routes/<segment>/<Name>Page.tsx` |
| Route registration | `src/router.tsx` (top-level composition) |
| HTTP call to the backend | `features/<f>/<f>.api.ts` |
| TanStack Query hook | `features/<f>/<f>.queries.ts` |
| Zod schema for a request/response | `features/<f>/<f>.schema.ts` |
| A table that knows about Users | `features/users/components/UsersTable.tsx` |
| A generic table wrapper | `components/data-display/DataTable.tsx` |
| A shared dialog primitive | `components/ui/dialog.tsx` (shadcn) |
| A confirm-modal helper | `components/feedback/ConfirmDialog.tsx` |
| A formatting helper | `lib/format/<topic>.ts` |
| Sidebar nav definition | `lib/constants/nav.ts` |
| Auth-guard component | `features/auth/components/ProtectedRoute.tsx` |
| Session hook (`useSession`) | `features/auth/auth.queries.ts` |
| Pure role helper (`isSuperAdmin`) | `lib/auth/roles.ts` |
| Sidebar-collapsed state | `lib/stores/uiStore.ts` |
| Search-param-synced filter state | `lib/hooks/useUrlFilters.ts` + component-local |
| MSW mock handler | `tests/msw/handlers.ts` |
| Playwright e2e flow | `tests/e2e/<flow>.spec.ts` |

---

## 12. Initial File List (what to scaffold first)

When the project starts, create these files in order:

1. `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `.env.example`, `CLAUDE.md`
2. `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
3. `src/lib/utils/env.ts` — zod-validated env (reads `import.meta.env`)
4. `src/lib/api/client.ts` + `envelope.ts` + `errors.ts` + `refresh.ts` + `csrf.ts`
5. `src/lib/query/client.ts` + `Provider.tsx`
6. `src/lib/auth/roles.ts` — pure role helpers only
7. `src/styles/globals.css`
8. `src/components/layout/AuthLayout.tsx`, `DashboardLayout.tsx`, `Sidebar.tsx`, `Topbar.tsx`
9. `src/features/auth/*` (full module — `auth.api.ts`, `auth.queries.ts` with `useSession`, `components/ProtectedRoute.tsx`)
10. `src/routes/auth/LoginPage.tsx`, `routes/dashboard/DashboardHomePage.tsx`, `routes/NotFoundPage.tsx`
11. `src/router.tsx` — top-level route tree (imports `<ProtectedRoute>` from `@features/auth`)
12. `src/features/users/*` — first real domain module

Everything after that follows the Phase 2 roadmap from doc 02 §12.

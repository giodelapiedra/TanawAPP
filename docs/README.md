# TANAW One App Documentation

City super-app for Tanauan City, Batangas, Philippines.

## Monorepo Layout

```text
tanaw-mobile-app/
|-- tanaw-backend/
|-- tanaw-mobile/
|-- tanaw-admin/   (planned)
`-- docs/
```

## Documentation Index

| # | Document | Purpose |
|---|----------|---------|
| 00 | [Engineering Rules](./00-engineering-rules.md) | Central source of truth for architecture rules, state ownership, validation boundaries, privacy rules, and AI-assistant guidance across the repo. |
| 01 | [System Review](./01-system-review.md) | Senior-engineer review of the existing backend and mobile architecture. |
| 02 | [Admin Dashboard Architecture](./02-admin-dashboard-architecture.md) | High-level architecture for the planned admin web app. |
| 03 | [Admin Dashboard Folder Structure](./03-admin-dashboard-folder-structure.md) | Concrete folder layout and naming conventions for the admin app. |
| 04 | [Admin Dashboard API Integration](./04-admin-dashboard-api-integration.md) | How the admin dashboard should integrate with `tanaw-backend`. |

## Reading Order

If you are new to the repo, read in this order:

1. `docs/00-engineering-rules.md`
2. `tanaw-backend/CLAUDE.md`
3. `tanaw-mobile/CLAUDE.md`
4. `docs/01-system-review.md`
5. `docs/02-admin-dashboard-architecture.md`
6. `docs/03-admin-dashboard-folder-structure.md`
7. `docs/04-admin-dashboard-api-integration.md`

# TANAW One App Frontend Backbone

Updated: 2026-04-25

## Status

This document is now a maintained high-level frontend reference.

Primary source of truth for engineering rules:

- [docs/00-engineering-rules.md](./docs/00-engineering-rules.md)
- [tanaw-mobile/CLAUDE.md](./tanaw-mobile/CLAUDE.md)
- [TANAW.SKILL.md](./TANAW.SKILL.md)

If any older scaffold prompt or copied rule conflicts with the current repo, follow the centralized rules above.

## Current Frontend Architecture

```text
tanaw-mobile/
|-- App.tsx
`-- src/
    |-- api/
    |-- components/
    |-- constants/
    |-- hooks/
    |-- navigation/
    |-- screens/
    |-- store/
    |-- types/
    `-- utils/
```

## Enforced Patterns

### State

- `auth.user` is the canonical current-user object.
- `userSlice` stores auxiliary user-related server state such as:
  - `digitalIdData`
  - loading flags
  - update errors
- Do not reintroduce a second canonical `profile` object in Redux.

### API Flow

- All HTTP access goes through `src/api/`.
- The shared Axios client owns:
  - token injection
  - serialized refresh flow
  - forced logout on refresh failure
- Shared reusable UI components should not call APIs directly.
- Screens or container-level components may coordinate feature-specific API calls directly or via thunks, depending on scope.

### Navigation

- Route params are typed in `src/types/navigation.types.ts`.
- `RootNavigator` decides auth shell vs app shell from auth state.

### Forms

- Preferred standard for new or heavily edited forms: `react-hook-form` + `zod`.
- Some legacy screens still use manual local form state; future work should move toward the standard instead of extending inconsistency.

### Privacy

- Public profile data must not expose private contact fields by default.
- UI should not render `email`, `phone`, or similar private fields from public-profile flows.

## Data Shape Rules

- `user.barangay` is a relation object.
- `user.address` is a relation object.
- Login uses `identifier`.
- Registration uses `barangayCode`.

## Practical Build Rules

1. Keep reusable UI in `components/`.
2. Keep feature screens in `screens/`.
3. Keep network logic in `api/`.
4. Keep canonical auth state in `authSlice`.
5. Keep styling consistent through shared constants and `StyleSheet.create()`.

## Verification

Run after meaningful frontend changes:

```bash
cd tanaw-mobile
npx tsc --noEmit
```

## Notes For Future Work

Recommended next cleanup items:

1. Standardize login/register flows to `react-hook-form` + `zod`.
2. Keep reducing mixed data-fetch patterns inside the same feature.
3. Update new feature docs in `docs/` instead of adding duplicate rules elsewhere.

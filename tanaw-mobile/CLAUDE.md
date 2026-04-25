# TANAW Mobile Rules

Primary source of truth: [docs/00-engineering-rules.md](../docs/00-engineering-rules.md)

Use this file as a mobile-specific quick reference only.

## Scope

React Native / Expo app in `tanaw-mobile/`.

## Mobile Quick Rules

1. `auth.user` is the canonical current-user object.
2. `userSlice` is for auxiliary user-related state such as `digitalIdData`, loading flags, and errors.
3. All HTTP access goes through `src/api/`.
4. Shared reusable UI components should not call APIs directly.
5. New or heavily edited forms should use `react-hook-form` + `zod`.
6. Typed navigation params live in `src/types/navigation.types.ts`.
7. Use `user.barangay?.name`, not invented address fields.
8. Keep privacy boundaries intact; do not render private data from public-profile APIs.

## Current Architecture

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

## Verification

Preferred local check after meaningful mobile changes:

```bash
npx tsc --noEmit
```

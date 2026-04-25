# TANAW Engineering Skill

Primary source of truth: [docs/00-engineering-rules.md](./docs/00-engineering-rules.md)

Repo-local quick reference for contributors and AI assistants.

## Core Rules

1. `auth.user` is the canonical current-user object on mobile.
2. `userSlice` stores auxiliary user-related server state such as `digitalIdData`, loading flags, and errors.
3. Public profile APIs must not expose private contact data by default.
4. Backend request validation belongs at the router boundary via `validate(schema)`, `validate(schema, 'query')`, or `validate(schema, 'params')`.
5. Backend modules follow schema -> service -> controller -> router.
6. Shared reusable UI components should not call APIs directly.
7. New or heavily edited forms should use `react-hook-form` + `zod`.
8. Keep local rule files aligned with the central rules doc.

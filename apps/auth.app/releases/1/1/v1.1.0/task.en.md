# Release v1.1.0 — AuthPolicy Contract & App-in-App Middleware

> 🇺🇦 [Українська](./task.md) | 🇬🇧 English

## Scope
Formalization of `AuthPolicy` as Model-as-Schema for URL access control, and export of the Middleware integration via `src/ui-api/index.js`. This will complete the auth.app architectural transition and resolve issues with correct routing and isolated App-in-App implementations (US-24 - US-37).

## Acceptance Criteria
- `AuthPolicy` correctly determines protected (protectedPaths) and public (publicPaths) routes.
- Glob-routing supports `**` (any depth) and `*` (single segment).
- Public routes have precedence over protected routes (override).
- `register()` and middleware are exported as ecosystem modules from `src/ui-api/index.js`.

## Architecture Audit (Checklist)
- [x] Read ecosystem indices?
- [x] Equivalents exist in packages? (`AccessControl` checks roles, `AuthPolicy` does URL mapping - two different layers).
- [x] Data sources: static schema (Model-as-Schema).
- [x] Complies with UI standards: AuthPolicy is headless.

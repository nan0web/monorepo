# Architecture Healing Report

> **Audit Date**: 5/15/2026, 2:29:50 PM
> **Health Score**: 57%

The following architectural issues were detected in @[@app/packages/auth-core].


---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)

---

### JsDomainAuditor
- [ ] [domain] @app/packages/auth-core/src/Membership.js: `Class field outside constructor in @app/packages/auth-core/src/Membership.js (line 26)`


## Recommended Subagents
- `nan0inspect hygiene --fix`
- `nan0inspect domain --fix`
- `nan0inspect snapshots --fix`

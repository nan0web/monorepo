# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:53 PM
> **Health Score**: 71%

The following architectural issues were detected in @[@app/packages/types].


---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)


## Recommended Subagents
- `nan0inspect hygiene --fix`
- `nan0inspect snapshots --fix`

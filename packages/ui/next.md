# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:54 PM
> **Health Score**: 86%

The following architectural issues were detected in @[@app/packages/ui].


---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.test:all: `Incomplete test:all chain, missing: build`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)


## Recommended Subagents
- `nan0inspect hygiene --fix`

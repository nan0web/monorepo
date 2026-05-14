# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:52 PM
> **Health Score**: 71%

The following architectural issues were detected in @[@app/packages/editor].


---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] devDependencies.knip: `Missing devDependency: knip (required for npm run knip)`
  - **Suggested Fix**: `npm install -D knip`
- [ ] [hygiene] scripts.test:release: `Missing required script: test:release`
- [ ] [hygiene] scripts.test:coverage: `Missing required script: test:coverage`
  - **Suggested Fix**: `"test:coverage": "c8 node --test"`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)


## Recommended Subagents
- `nan0inspect hygiene --fix`
- `nan0inspect snapshots --fix`

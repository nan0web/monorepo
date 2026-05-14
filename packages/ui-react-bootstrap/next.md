# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:54 PM
> **Health Score**: 43%

The following architectural issues were detected in @[@app/packages/ui-react-bootstrap].


---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)

---

### JsExportAuditor
- [ ] [exports] src/index.js: `Missing src/index.js (main package gateway)`

---

### JsVerificationAuditor
- [ ] [verification] src/README.md.js: `README.md.js (ProvenDoc) not found`


## Recommended Subagents
- `nan0inspect hygiene --fix`
- `nan0inspect exports --fix`
- `nan0inspect verification --fix`
- `nan0inspect snapshots --fix`

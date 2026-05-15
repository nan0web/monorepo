# Architecture Healing Report

> **Audit Date**: 5/15/2026, 2:34:10 PM
> **Health Score**: 38%

The following architectural issues were detected in @[@app/packages/core].


---

### PhaseAuditor
- [ ] [phase] .npmignore: `Public package is missing .npmignore`
**Boundary**: [@[.npmignore]](./.npmignore)
**Context**: [@[package.json]](./package.json)

---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] scripts.release:spec: `Missing required script: release:spec`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)

---

### JsDomainAuditor
- [ ] [domain] @app/packages/core/src/Protocol/CommandProtocol.js: `Class field outside constructor in @app/packages/core/src/Protocol/CommandProtocol.js (line 24)`
- [ ] [domain] @app/packages/core/src/Protocol/ExecutableCommand.js: `Class field outside constructor in @app/packages/core/src/Protocol/ExecutableCommand.js (line 10)`
- [ ] [domain] @app/packages/core/src/ProjectModel.js: `Model class outside src/domain/ in @app/packages/core/src/ProjectModel.js`

---

### JsVerificationAuditor
- [ ] [verification] play/: `No play/ directory found — playground is mandatory for every package`


## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect domain --fix`
- `nan0inspect verification --fix`
- `nan0inspect snapshots --fix`

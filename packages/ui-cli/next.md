# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:54 PM
> **Health Score**: 63%

The following architectural issues were detected in @[@app/packages/ui-cli].


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
**Context**: [@[package.json]](./package.json)

---

### JsExportAuditor
- [ ] [exports] exports["./ui/BlockRenderers"]: `UI adapter dir src/ui/BlockRenderers/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/blueprint"]: `UI adapter dir src/ui/blueprint/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/core"]: `UI adapter dir src/ui/core/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/impl"]: `UI adapter dir src/ui/impl/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/prompt"]: `UI adapter dir src/ui/prompt/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/test"]: `UI adapter dir src/ui/test/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/utils"]: `UI adapter dir src/ui/utils/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/view"]: `UI adapter dir src/ui/view/ exists but not declared in package.json exports`

---

### JsDomainAuditor
- [ ] [domain] @app/packages/ui-cli/src/ui/core/InputAdapter.js: `Class field outside constructor in @app/packages/ui-cli/src/ui/core/InputAdapter.js (line 59)`


## Recommended Subagents
- `nan0inspect hygiene --fix`
- `nan0inspect exports --fix`
- `nan0inspect domain --fix`

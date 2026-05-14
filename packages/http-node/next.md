# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:52 PM
> **Health Score**: 43%

The following architectural issues were detected in @[@app/packages/http-node].


---

### PhaseAuditor
- [ ] [phase] phase.lifecycle: `Detected Phase: Unknown (No seed.md or project.md)`
**Boundary**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)
**Context**: [@[package.json]](./package.json)

---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] scripts.release:spec: `Missing required script: release:spec`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.test:all: `Incomplete test:all chain, missing: build`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)

---

### JsDomainAuditor
- [ ] [domain] @app/packages/http-node/src/messages/ResponseMessage.js: `Class field outside constructor in @app/packages/http-node/src/messages/ResponseMessage.js (line 37)`
- [ ] [domain] @app/packages/http-node/src/messages/ServerResponse.js: `Class field outside constructor in @app/packages/http-node/src/messages/ServerResponse.js (line 10)`


## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect domain --fix`
- `nan0inspect snapshots --fix`

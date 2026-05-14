# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:51 PM
> **Health Score**: 43%

The following architectural issues were detected in @[@app/packages/co].


---

### PhaseAuditor
- [ ] [phase] .npmignore: `Public package is missing .npmignore`
**Boundary**: [@[.npmignore]](./.npmignore)
**Context**: [@[package.json]](./package.json)

---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] scripts.knip: `Missing required script: knip`
  - **Suggested Fix**: `"knip": "knip"`
- [ ] [hygiene] devDependencies.knip: `Missing devDependency: knip (required for npm run knip)`
  - **Suggested Fix**: `npm install -D knip`
- [ ] [hygiene] scripts.release:spec: `Missing required script: release:spec`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.test:all: `Incomplete test:all chain, missing: knip`
**Boundary**: [@[package.json]](./package.json)
- [ ] [hygiene] knip.json: `Missing config file: knip.json`
**Boundary**: [@[knip.json]](./knip.json)

---

### JsDomainAuditor
- [ ] [domain] @app/packages/co/src/Language.js: `Class field outside constructor in @app/packages/co/src/Language.js (line 10)`
- [ ] [domain] @app/packages/co/src/Language.js: `Class field outside constructor in @app/packages/co/src/Language.js (line 13)`
- [ ] [domain] @app/packages/co/src/Language.js: `Class field outside constructor in @app/packages/co/src/Language.js (line 16)`
- [ ] [domain] @app/packages/co/src/Language.js: `Class field outside constructor in @app/packages/co/src/Language.js (line 19)`
- [ ] [domain] @app/packages/co/src/Message.js: `Class field outside constructor in @app/packages/co/src/Message.js (line 46)`


## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect domain --fix`
- `nan0inspect snapshots --fix`

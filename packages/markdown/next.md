# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:53 PM
> **Health Score**: 43%

The following architectural issues were detected in @[@app/packages/markdown].


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
**Boundary**: [@[package.json]](./package.json)

---

### JsDomainAuditor
- [ ] [domain] @app/packages/markdown/src/Parse/Context.js: `Class field outside constructor in @app/packages/markdown/src/Parse/Context.js (line 3)`
- [ ] [domain] @app/packages/markdown/src/Parse/Context.js: `Class field outside constructor in @app/packages/markdown/src/Parse/Context.js (line 5)`
- [ ] [domain] @app/packages/markdown/src/Parse/Context.js: `Class field outside constructor in @app/packages/markdown/src/Parse/Context.js (line 8)`
- [ ] [domain] @app/packages/markdown/src/Parse/Context.js: `Class field outside constructor in @app/packages/markdown/src/Parse/Context.js (line 11)`
- [ ] [domain] @app/packages/markdown/src/MDConfig.js: `Class field outside constructor in @app/packages/markdown/src/MDConfig.js (line 5)`
- [ ] [domain] @app/packages/markdown/src/MDConfig.js: `Class field outside constructor in @app/packages/markdown/src/MDConfig.js (line 6)`
- [ ] [domain] @app/packages/markdown/src/MDConfig.js: `Class field outside constructor in @app/packages/markdown/src/MDConfig.js (line 7)`
- [ ] [domain] @app/packages/markdown/src/MDConfig.js: `Class field outside constructor in @app/packages/markdown/src/MDConfig.js (line 8)`
- [ ] [domain] @app/packages/markdown/src/MDConfig.js: `Class field outside constructor in @app/packages/markdown/src/MDConfig.js (line 11)`
- [ ] [domain] @app/packages/markdown/src/MDConfig.js: `Class field outside constructor in @app/packages/markdown/src/MDConfig.js (line 14)`
- [ ] [domain] @app/packages/markdown/src/MDList.js: `Class field outside constructor in @app/packages/markdown/src/MDList.js (line 22)`


## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect domain --fix`
- `nan0inspect snapshots --fix`

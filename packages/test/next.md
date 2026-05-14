# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:53 PM
> **Health Score**: 50%

The following architectural issues were detected in @[@app/packages/test].


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
- [ ] [domain] @app/packages/test/src/Parser/DocsParser.js: `Class field outside constructor in @app/packages/test/src/Parser/DocsParser.js (line 5)`
- [ ] [domain] @app/packages/test/src/Parser/TestNode.js: `Class field outside constructor in @app/packages/test/src/Parser/TestNode.js (line 22)`
- [ ] [domain] @app/packages/test/src/commands/parse.js: `Class field outside constructor in @app/packages/test/src/commands/parse.js (line 12)`
- [ ] [domain] @app/packages/test/src/commands/parse.js: `Class field outside constructor in @app/packages/test/src/commands/parse.js (line 18)`
- [ ] [domain] @app/packages/test/src/commands/parse.js: `Class field outside constructor in @app/packages/test/src/commands/parse.js (line 24)`
- [ ] [domain] @app/packages/test/src/commands/status.js: `Class field outside constructor in @app/packages/test/src/commands/status.js (line 13)`
- [ ] [domain] @app/packages/test/src/commands/status.js: `Class field outside constructor in @app/packages/test/src/commands/status.js (line 19)`
- [ ] [domain] @app/packages/test/src/commands/status.js: `Class field outside constructor in @app/packages/test/src/commands/status.js (line 25)`
- [ ] [domain] @app/packages/test/src/commands/status.js: `Class field outside constructor in @app/packages/test/src/commands/status.js (line 31)`
- [ ] [domain] @app/packages/test/src/mock/MemoryDB.js: `Class field outside constructor in @app/packages/test/src/mock/MemoryDB.js (line 9)`
- [ ] [domain] @app/packages/test/src/RRS.js: `Class field outside constructor in @app/packages/test/src/RRS.js (line 238)`
- [ ] [domain] @app/packages/test/src/RRS.js: `Class field outside constructor in @app/packages/test/src/RRS.js (line 244)`
- [ ] [domain] @app/packages/test/src/RRS.js: `Class field outside constructor in @app/packages/test/src/RRS.js (line 250)`


## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect domain --fix`
- `nan0inspect snapshots --fix`

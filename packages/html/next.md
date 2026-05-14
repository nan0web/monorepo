# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:52 PM
> **Health Score**: 43%

The following architectural issues were detected in @[@app/packages/html].


---

### PhaseAuditor
- [ ] [phase] phase.lifecycle: `Detected Phase: Unknown (No seed.md or project.md)`
**Boundary**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)
**Context**: [@[package.json]](./package.json)
- [ ] [phase] .npmignore: `Public package is missing .npmignore`
**Boundary**: [@[.npmignore]](./.npmignore)

---

### JsHygieneAuditor
- [ ] [hygiene] scripts.test:all: `Missing required script: test:all`
  - **Suggested Fix**: `"test:all": "npm run build && npm run test && npm run knip"`
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] scripts.knip: `Missing required script: knip`
  - **Suggested Fix**: `"knip": "knip"`
- [ ] [hygiene] devDependencies.knip: `Missing devDependency: knip (required for npm run knip)`
  - **Suggested Fix**: `npm install -D knip`
- [ ] [hygiene] scripts.release:spec: `Missing required script: release:spec`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)
- [ ] [hygiene] knip.json: `Missing config file: knip.json`
**Boundary**: [@[knip.json]](./knip.json)

---

### JsDomainAuditor
- [ ] [domain] @app/packages/html/src/HTMLTags.js: `Class field outside constructor in @app/packages/html/src/HTMLTags.js (line 18)`
- [ ] [domain] @app/packages/html/src/HTMLTags.js: `Class field outside constructor in @app/packages/html/src/HTMLTags.js (line 19)`
- [ ] [domain] @app/packages/html/src/HTMLTags.js: `Class field outside constructor in @app/packages/html/src/HTMLTags.js (line 20)`
- [ ] [domain] @app/packages/html/src/HTMLTags.js: `Class field outside constructor in @app/packages/html/src/HTMLTags.js (line 28)`
- [ ] [domain] @app/packages/html/src/HTMLTags.js: `Class field outside constructor in @app/packages/html/src/HTMLTags.js (line 34)`
- [ ] [domain] @app/packages/html/src/HTMLTags.js: `Class field outside constructor in @app/packages/html/src/HTMLTags.js (line 38)`
- [ ] [domain] @app/packages/html/src/HTMLTags.js: `Class field outside constructor in @app/packages/html/src/HTMLTags.js (line 39)`
- [ ] [domain] @app/packages/html/src/HTMLTags.js: `Class field outside constructor in @app/packages/html/src/HTMLTags.js (line 40)`
- [ ] [domain] @app/packages/html/src/HTMLTags.js: `Class field outside constructor in @app/packages/html/src/HTMLTags.js (line 41)`
- [ ] [domain] @app/packages/html/src/HTMLTags.js: `Class field outside constructor in @app/packages/html/src/HTMLTags.js (line 42)`
- [ ] [domain] @app/packages/html/src/HTMLTags.js: `Class field outside constructor in @app/packages/html/src/HTMLTags.js (line 43)`


## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect domain --fix`
- `nan0inspect snapshots --fix`

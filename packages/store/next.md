# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:53 PM
> **Health Score**: 38%

The following architectural issues were detected in @[@app/packages/store].


---

### PhaseAuditor
- [ ] [phase] .npmignore: `Public package is missing .npmignore`
**Boundary**: [@[.npmignore]](./.npmignore)
**Context**: [@[package.json]](./package.json)

---

### JsHygieneAuditor
- [ ] [hygiene] scripts.test:all: `Missing required script: test:all`
  - **Suggested Fix**: `"test:all": "npm run build && npm run test && npm run knip"`
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] scripts.play: `Missing required script: play`
  - **Suggested Fix**: `"play": "nan0cli --data play"`
- [ ] [hygiene] scripts.test:docs: `Missing required script: test:docs`
  - **Suggested Fix**: `"test:docs": "node --test --test-timeout=3333 'src/docs/**/*.md.js' 'src/README.md.js'"`
- [ ] [hygiene] scripts.test:release: `Missing required script: test:release`
- [ ] [hygiene] scripts.release:spec: `Missing required script: release:spec`
- [ ] [hygiene] scripts.test:coverage: `Missing required script: test:coverage`
  - **Suggested Fix**: `"test:coverage": "c8 node --test"`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)
- [ ] [hygiene] tsconfig.json: `Missing config file: tsconfig.json`
**Boundary**: [@[tsconfig.json]](./tsconfig.json)
- [ ] [hygiene] knip.json: `Missing config file: knip.json`
**Boundary**: [@[knip.json]](./knip.json)

---

### JsExportAuditor
- [ ] [exports] src/index.js: `Missing src/index.js (main package gateway)`
- [ ] [exports] src/domain/index.js: `src/domain/ exists but src/domain/index.js is missing`

---

### JsVerificationAuditor
- [ ] [verification] play/: `No play/ directory found — playground is mandatory for every package`
- [ ] [verification] src/**/*.{test,story}.js: `No *.test.js or *.story.js files found in src/`
- [ ] [verification] src/README.md.js: `README.md.js (ProvenDoc) not found`


## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect exports --fix`
- `nan0inspect verification --fix`
- `nan0inspect snapshots --fix`

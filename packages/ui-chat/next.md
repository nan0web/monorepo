# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:54 PM
> **Health Score**: 29%

The following architectural issues were detected in @[@app/packages/ui-chat].


---

### PhaseAuditor
- [ ] [phase] CONTRIBUTING.md: `Missing fundamental file: CONTRIBUTING.md`
**Boundary**: [@[CONTRIBUTING.md]](./CONTRIBUTING.md)
**Context**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)
- [ ] [phase] LICENSE: `Missing fundamental file: LICENSE`
**Boundary**: [@[LICENSE]](./LICENSE)
- [ ] [phase] .editorconfig: `Missing fundamental file: .editorconfig`
**Boundary**: [@[.editorconfig]](./.editorconfig)
- [ ] [phase] .npmignore: `Public package is missing .npmignore`
**Boundary**: [@[.npmignore]](./.npmignore)
**Context**: [@[package.json]](./package.json)

---

### JsHygieneAuditor
- [ ] [hygiene] scripts.test: `Missing required script: test`
  - **Suggested Fix**: `"test": "node --test"`
- [ ] [hygiene] scripts.test:all: `Missing required script: test:all`
  - **Suggested Fix**: `"test:all": "npm run build && npm run test && npm run knip"`
- [ ] [hygiene] scripts.build: `Missing required script: build`
  - **Suggested Fix**: `"build": "tsc"`
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] scripts.knip: `Missing required script: knip`
  - **Suggested Fix**: `"knip": "knip"`
- [ ] [hygiene] devDependencies.knip: `Missing devDependency: knip (required for npm run knip)`
  - **Suggested Fix**: `npm install -D knip`
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

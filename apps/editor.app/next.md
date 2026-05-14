# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:55 PM
> **Health Score**: 43%

The following architectural issues were detected in @[@app/apps/editor.app].


---

### PhaseAuditor
- [ ] [phase] CONTRIBUTING.md: `Missing fundamental file: CONTRIBUTING.md`
**Boundary**: [@[CONTRIBUTING.md]](./CONTRIBUTING.md)
**Context**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)
- [ ] [phase] .editorconfig: `Missing fundamental file: .editorconfig`
**Boundary**: [@[.editorconfig]](./.editorconfig)
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
- [ ] [hygiene] scripts.test:docs: `Missing required script: test:docs`
  - **Suggested Fix**: `"test:docs": "node --test --test-timeout=3333 'src/docs/**/*.md.js' 'src/README.md.js'"`
- [ ] [hygiene] scripts.test:release: `Missing required script: test:release`
- [ ] [hygiene] scripts.release:spec: `Missing required script: release:spec`
- [ ] [hygiene] scripts.test:coverage: `Missing required script: test:coverage`
  - **Suggested Fix**: `"test:coverage": "c8 node --test"`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.test:all: `Incomplete test:all chain, missing: build, knip`
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
- [ ] [exports] exports["./ui/chat"]: `UI adapter dir src/ui/chat/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/cli"]: `UI adapter dir src/ui/cli/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/vscode"]: `UI adapter dir src/ui/vscode/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/web"]: `UI adapter dir src/ui/web/ exists but not declared in package.json exports`


## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect exports --fix`
- `nan0inspect snapshots --fix`

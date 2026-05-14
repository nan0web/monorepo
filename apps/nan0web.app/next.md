# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:55 PM
> **Health Score**: 14%

The following architectural issues were detected in @[@app/apps/nan0web.app].


---

### PhaseAuditor
- [ ] [phase] .editorconfig: `Missing fundamental file: .editorconfig`
**Boundary**: [@[.editorconfig]](./.editorconfig)
**Context**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)
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
- [ ] [hygiene] scripts.play: `Missing required script: play`
  - **Suggested Fix**: `"play": "nan0cli --data play"`
- [ ] [hygiene] scripts.test:release: `Missing required script: test:release`
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
- [ ] [exports] exports["./ui/cli"]: `UI adapter dir src/ui/cli/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/lit"]: `UI adapter dir src/ui/lit/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/vscode"]: `UI adapter dir src/ui/vscode/ exists but not declared in package.json exports`
- [ ] [exports] exports["./ui/vscode-nan0"]: `UI adapter dir src/ui/vscode-nan0/ exists but not declared in package.json exports`

---

### JsDomainAuditor
- [ ] [domain] @app/apps/nan0web.app/src/renderer/Renderer.js: `Class field outside constructor in @app/apps/nan0web.app/src/renderer/Renderer.js (line 42)`
- [ ] [domain] @app/apps/nan0web.app/src/router/PagesRouter.js: `Class field outside constructor in @app/apps/nan0web.app/src/router/PagesRouter.js (line 16)`
- [ ] [domain] @app/apps/nan0web.app/src/utils/AppLogger.js: `Class field outside constructor in @app/apps/nan0web.app/src/utils/AppLogger.js (line 23)`
- [ ] [domain] @app/apps/nan0web.app/src/utils/AppLogger.js: `Class field outside constructor in @app/apps/nan0web.app/src/utils/AppLogger.js (line 26)`

---

### JsVerificationAuditor
- [ ] [verification] play/: `No play/ directory found — playground is mandatory for every package`


## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect exports --fix`
- `nan0inspect domain --fix`
- `nan0inspect verification --fix`
- `nan0inspect snapshots --fix`

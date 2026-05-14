# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:54 PM
> **Health Score**: 29%

The following architectural issues were detected in @[@app/packages/ui-lit].


---

### PhaseAuditor
- [ ] [phase] CONTRIBUTING.md: `Missing fundamental file: CONTRIBUTING.md`
**Boundary**: [@[CONTRIBUTING.md]](./CONTRIBUTING.md)
**Context**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)
- [ ] [phase] LICENSE: `Missing fundamental file: LICENSE`
**Boundary**: [@[LICENSE]](./LICENSE)
- [ ] [phase] .editorconfig: `Missing fundamental file: .editorconfig`
**Boundary**: [@[.editorconfig]](./.editorconfig)

---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] scripts.play: `Missing required script: play`
  - **Suggested Fix**: `"play": "nan0cli --data play"`
- [ ] [hygiene] scripts.test:release: `Missing required script: test:release`
- [ ] [hygiene] scripts.test:coverage: `Missing required script: test:coverage`
  - **Suggested Fix**: `"test:coverage": "c8 node --test"`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)
- [ ] [hygiene] tsconfig.json: `Missing config file: tsconfig.json`
**Boundary**: [@[tsconfig.json]](./tsconfig.json)

---

### JsDomainAuditor
- [ ] [domain] @app/packages/ui-lit/src/index.js: `Class field outside constructor in @app/packages/ui-lit/src/index.js (line 114)`

---

### JsVerificationAuditor
- [ ] [verification] src/**/*.{test,story}.js: `No *.test.js or *.story.js files found in src/`


## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect domain --fix`
- `nan0inspect verification --fix`
- `nan0inspect snapshots --fix`

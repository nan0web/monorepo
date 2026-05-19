# Architecture Healing Report

> **Audit Date**: 5/19/2026, 4:12:40 PM
> **Health Score**: 43%

The following architectural issues were detected in @[@app/packages/auth].

---

### PhaseAuditor
- [ ] [phase] CONTRIBUTING.md: `Missing fundamental file: CONTRIBUTING.md`

**Boundary**: [@[CONTRIBUTING.md]](./CONTRIBUTING.md)
**Context**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)

- [ ] [phase] LICENSE: `Missing fundamental file: LICENSE`

**Boundary**: [@[LICENSE]](./LICENSE)

- [ ] [phase] .editorconfig: `Missing fundamental file: .editorconfig`

**Boundary**: [@[.editorconfig]](./.editorconfig)

- [ ] [phase] phase.lifecycle: `Detected Phase: Unknown (No seed.md or project.md)`

**Boundary**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)
**Context**: [@[package.json]](./package.json)

- [ ] [phase] .npmignore: `Public package is missing .npmignore`

**Boundary**: [@[.npmignore]](./.npmignore)

---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`

  - **Suggested Fix**: `npm install -D typescript`

- [ ] [hygiene] scripts.test:release: `Missing required script: test:release`
- [ ] [hygiene] scripts.release:spec: `Missing required script: release:spec`
- [ ] [hygiene] scripts.test:coverage: `Missing required script: test:coverage`

  - **Suggested Fix**: `"test:coverage": "c8 node --test"`

- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`

  - **Suggested Fix**: `npm install -D c8`
**Boundary**: [@[package.json]](./package.json)

---

### JsVerificationAuditor
- [ ] [verification] src/README.md.js: `README.md.js (ProvenDoc) not found`



## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect verification --fix`
- `nan0inspect snapshots --fix`



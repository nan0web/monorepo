# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:55 PM
> **Health Score**: 29%

The following architectural issues were detected in @[@app/apps/auth.app].


---

### PhaseAuditor
- [ ] [phase] CONTRIBUTING.md: `Missing fundamental file: CONTRIBUTING.md`
**Boundary**: [@[CONTRIBUTING.md]](./CONTRIBUTING.md)
**Context**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)
- [ ] [phase] LICENSE: `Missing fundamental file: LICENSE`
**Boundary**: [@[LICENSE]](./LICENSE)
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

### JsExportAuditor
- [ ] [exports] src/domain/index.js: `src/domain/ exists but src/domain/index.js is missing`

---

### JsDomainAuditor
- [ ] [domain] @app/apps/auth.app/src/messages/Auth/Root.js: `Class field outside constructor in @app/apps/auth.app/src/messages/Auth/Root.js (line 5)`
- [ ] [domain] @app/apps/auth.app/src/messages/AuthorizedMessage.js: `Class field outside constructor in @app/apps/auth.app/src/messages/AuthorizedMessage.js (line 14)`
- [ ] [domain] @app/apps/auth.app/src/messages/ConfirmSignUpMessage.js: `Class field outside constructor in @app/apps/auth.app/src/messages/ConfirmSignUpMessage.js (line 20)`
- [ ] [domain] @app/apps/auth.app/src/messages/RegistrationMessage.js: `Class field outside constructor in @app/apps/auth.app/src/messages/RegistrationMessage.js (line 15)`
- [ ] [domain] @app/apps/auth.app/src/messages/SignUpMessage.js: `Class field outside constructor in @app/apps/auth.app/src/messages/SignUpMessage.js (line 6)`
- [ ] [domain] @app/apps/auth.app/src/messages/UpdateInfoMessage.js: `Class field outside constructor in @app/apps/auth.app/src/messages/UpdateInfoMessage.js (line 17)`
- [ ] [domain] @app/apps/auth.app/src/AuthApp.js: `Model class outside src/domain/ in @app/apps/auth.app/src/AuthApp.js`


## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect exports --fix`
- `nan0inspect domain --fix`
- `nan0inspect snapshots --fix`

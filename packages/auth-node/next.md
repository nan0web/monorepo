# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:51 PM
> **Health Score**: 43%

The following architectural issues were detected in @[@app/packages/auth-node].


---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] scripts.test:release: `Missing required script: test:release`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)

---

### JsDomainAuditor
- [ ] [domain] @app/packages/auth-node/src/AuthDB.js: `Class field outside constructor in @app/packages/auth-node/src/AuthDB.js (line 10)`
- [ ] [domain] @app/packages/auth-node/src/IncomingMessage.js: `Class field outside constructor in @app/packages/auth-node/src/IncomingMessage.js (line 10)`
- [ ] [domain] @app/packages/auth-node/src/IncomingMessage.js: `Class field outside constructor in @app/packages/auth-node/src/IncomingMessage.js (line 12)`
- [ ] [domain] @app/packages/auth-node/src/IncomingMessage.js: `Class field outside constructor in @app/packages/auth-node/src/IncomingMessage.js (line 14)`
- [ ] [domain] @app/packages/auth-node/src/ServerResponse.js: `Class field outside constructor in @app/packages/auth-node/src/ServerResponse.js (line 10)`

---

### JsVerificationAuditor
- [ ] [verification] play/: `No play/ directory found — playground is mandatory for every package`


## Recommended Subagents
- `nan0inspect hygiene --fix`
- `nan0inspect domain --fix`
- `nan0inspect verification --fix`
- `nan0inspect snapshots --fix`

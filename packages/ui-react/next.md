# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:54 PM
> **Health Score**: 38%

The following architectural issues were detected in @[@app/packages/ui-react].


---

### JsHygieneAuditor
- [ ] [hygiene] scripts.knip: `Missing required script: knip`
  - **Suggested Fix**: `"knip": "knip"`
- [ ] [hygiene] devDependencies.knip: `Missing devDependency: knip (required for npm run knip)`
  - **Suggested Fix**: `npm install -D knip`
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
**Context**: [@[package.json]](./package.json)

---

### JsExportAuditor
- [ ] [exports] src/index.js: `Missing src/index.js (main package gateway)`
- [ ] [exports] src/domain/index.js: `src/domain/ exists but src/domain/index.js is missing`
- [ ] [exports] exports["./ui/cli"]: `UI adapter dir src/ui/cli/ exists but not declared in package.json exports`

---

### JsDomainAuditor
- [ ] [domain] @app/packages/ui-react/src/models/Document.js: `Class field outside constructor in @app/packages/ui-react/src/models/Document.js (line 9)`
- [ ] [domain] @app/packages/ui-react/src/models/Document.js: `Class field outside constructor in @app/packages/ui-react/src/models/Document.js (line 11)`
- [ ] [domain] @app/packages/ui-react/src/models/Document.js: `Class field outside constructor in @app/packages/ui-react/src/models/Document.js (line 13)`
- [ ] [domain] @app/packages/ui-react/src/models/Document.js: `Class field outside constructor in @app/packages/ui-react/src/models/Document.js (line 15)`
- [ ] [domain] @app/packages/ui-react/src/models/Document.js: `Class field outside constructor in @app/packages/ui-react/src/models/Document.js (line 17)`
- [ ] [domain] @app/packages/ui-react/src/models/Document.js: `Class field outside constructor in @app/packages/ui-react/src/models/Document.js (line 19)`
- [ ] [domain] @app/packages/ui-react/src/models/Document.js: `Class field outside constructor in @app/packages/ui-react/src/models/Document.js (line 21)`
- [ ] [domain] @app/packages/ui-react/src/models/Document.js: `Class field outside constructor in @app/packages/ui-react/src/models/Document.js (line 23)`
- [ ] [domain] @app/packages/ui-react/src/models/FeedbackModel.js: `Model class outside src/domain/ in @app/packages/ui-react/src/models/FeedbackModel.js`
- [ ] [domain] @app/packages/ui-react/src/models/NewsPostModel.js: `Model class outside src/domain/ in @app/packages/ui-react/src/models/NewsPostModel.js`

---

### JsVerificationAuditor
- [ ] [verification] src/README.md.js: `README.md.js (ProvenDoc) not found`


## Recommended Subagents
- `nan0inspect hygiene --fix`
- `nan0inspect exports --fix`
- `nan0inspect domain --fix`
- `nan0inspect verification --fix`
- `nan0inspect snapshots --fix`

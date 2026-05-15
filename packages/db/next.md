# Architecture Healing Report

> **Audit Date**: 5/15/2026, 2:35:42 PM
> **Health Score**: 57%

The following architectural issues were detected in @[@app/packages/db].


---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)

---

### JsDomainAuditor
- [ ] [domain] @app/packages/db/src/DB/AuthContext.js: `Class field outside constructor in @app/packages/db/src/DB/AuthContext.js (line 15)`
- [ ] [domain] @app/packages/db/src/DB/AuthContext.js: `Class field outside constructor in @app/packages/db/src/DB/AuthContext.js (line 17)`
- [ ] [domain] @app/packages/db/src/DB/AuthContext.js: `Class field outside constructor in @app/packages/db/src/DB/AuthContext.js (line 19)`
- [ ] [domain] @app/packages/db/src/DB/AuthContext.js: `Class field outside constructor in @app/packages/db/src/DB/AuthContext.js (line 21)`
- [ ] [domain] @app/packages/db/src/DB/DB.js: `Class field outside constructor in @app/packages/db/src/DB/DB.js (line 155)`
- [ ] [domain] @app/packages/db/src/DB/DB.js: `Class field outside constructor in @app/packages/db/src/DB/DB.js (line 157)`
- [ ] [domain] @app/packages/db/src/DB/DB.js: `Class field outside constructor in @app/packages/db/src/DB/DB.js (line 159)`
- [ ] [domain] @app/packages/db/src/DB/DB.js: `Class field outside constructor in @app/packages/db/src/DB/DB.js (line 165)`
- [ ] [domain] @app/packages/db/src/DB/DriverProtocol.js: `Class field outside constructor in @app/packages/db/src/DB/DriverProtocol.js (line 36)`
- [ ] [domain] @app/packages/db/src/DB/DriverProtocol.js: `Class field outside constructor in @app/packages/db/src/DB/DriverProtocol.js (line 38)`
- [ ] [domain] @app/packages/db/src/DB/DriverProtocol.js: `Class field outside constructor in @app/packages/db/src/DB/DriverProtocol.js (line 40)`
- [ ] [domain] @app/packages/db/src/DB/FetchOptions.js: `Class field outside constructor in @app/packages/db/src/DB/FetchOptions.js (line 15)`
- [ ] [domain] @app/packages/db/src/DB/FetchOptions.js: `Class field outside constructor in @app/packages/db/src/DB/FetchOptions.js (line 17)`
- [ ] [domain] @app/packages/db/src/DB/FetchOptions.js: `Class field outside constructor in @app/packages/db/src/DB/FetchOptions.js (line 19)`
- [ ] [domain] @app/packages/db/src/DB/FetchOptions.js: `Class field outside constructor in @app/packages/db/src/DB/FetchOptions.js (line 21)`
- [ ] [domain] @app/packages/db/src/DB/FetchOptions.js: `Class field outside constructor in @app/packages/db/src/DB/FetchOptions.js (line 23)`
- [ ] [domain] @app/packages/db/src/DB/GetOptions.js: `Class field outside constructor in @app/packages/db/src/DB/GetOptions.js (line 15)`
- [ ] [domain] @app/packages/db/src/DirectoryIndex.js: `Class field outside constructor in @app/packages/db/src/DirectoryIndex.js (line 37)`
- [ ] [domain] @app/packages/db/src/DirectoryIndex.js: `Class field outside constructor in @app/packages/db/src/DirectoryIndex.js (line 40)`


## Recommended Subagents
- `nan0inspect hygiene --fix`
- `nan0inspect domain --fix`
- `nan0inspect snapshots --fix`

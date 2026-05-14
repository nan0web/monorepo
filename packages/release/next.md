# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:53 PM
> **Health Score**: 29%

The following architectural issues were detected in @[@app/packages/release].


---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] scripts.play: `Missing required script: play`
  - **Suggested Fix**: `"play": "nan0cli --data play"`
- [ ] [hygiene] scripts.release:spec: `Missing required script: release:spec`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)

---

### JsExportAuditor
- [ ] [exports] src/domain/index.js: `src/domain/ exists but src/domain/index.js is missing`
- [ ] [exports] exports["./ui/cli"]: `UI adapter dir src/ui/cli/ exists but not declared in package.json exports`

---

### JsDomainAuditor
- [ ] [domain] @app/packages/release/src/co/AppCommandOptions.js: `Class field outside constructor in @app/packages/release/src/co/AppCommandOptions.js (line 3)`
- [ ] [domain] @app/packages/release/src/co/AppCommandOptions.js: `Class field outside constructor in @app/packages/release/src/co/AppCommandOptions.js (line 5)`
- [ ] [domain] @app/packages/release/src/co/AppCommandOptions.js: `Class field outside constructor in @app/packages/release/src/co/AppCommandOptions.js (line 7)`
- [ ] [domain] @app/packages/release/src/co/AppCommandOptions.js: `Class field outside constructor in @app/packages/release/src/co/AppCommandOptions.js (line 9)`
- [ ] [domain] @app/packages/release/src/co/AppCommandOptions.js: `Class field outside constructor in @app/packages/release/src/co/AppCommandOptions.js (line 11)`
- [ ] [domain] @app/packages/release/src/co/AppCommandOptions.js: `Class field outside constructor in @app/packages/release/src/co/AppCommandOptions.js (line 13)`
- [ ] [domain] @app/packages/release/src/co/AppCommandOptions.js: `Class field outside constructor in @app/packages/release/src/co/AppCommandOptions.js (line 15)`
- [ ] [domain] @app/packages/release/src/co/AppCommandOptions.js: `Class field outside constructor in @app/packages/release/src/co/AppCommandOptions.js (line 17)`
- [ ] [domain] @app/packages/release/src/commands/CloseCommand.js: `Class field outside constructor in @app/packages/release/src/commands/CloseCommand.js (line 10)`
- [ ] [domain] @app/packages/release/src/commands/DepsCommand.js: `Class field outside constructor in @app/packages/release/src/commands/DepsCommand.js (line 18)`
- [ ] [domain] @app/packages/release/src/commands/DepsCommand.js: `Class field outside constructor in @app/packages/release/src/commands/DepsCommand.js (line 24)`
- [ ] [domain] @app/packages/release/src/commands/InitCommand.js: `Class field outside constructor in @app/packages/release/src/commands/InitCommand.js (line 8)`
- [ ] [domain] @app/packages/release/src/commands/PublishCommand.js: `Class field outside constructor in @app/packages/release/src/commands/PublishCommand.js (line 22)`
- [ ] [domain] @app/packages/release/src/commands/PublishCommand.js: `Class field outside constructor in @app/packages/release/src/commands/PublishCommand.js (line 24)`
- [ ] [domain] @app/packages/release/src/commands/PublishCommand.js: `Class field outside constructor in @app/packages/release/src/commands/PublishCommand.js (line 26)`
- [ ] [domain] @app/packages/release/src/commands/SpecCommand.js: `Class field outside constructor in @app/packages/release/src/commands/SpecCommand.js (line 9)`

---

### JsVerificationAuditor
- [ ] [verification] play/: `No play/ directory found — playground is mandatory for every package`


## Recommended Subagents
- `nan0inspect hygiene --fix`
- `nan0inspect exports --fix`
- `nan0inspect domain --fix`
- `nan0inspect verification --fix`
- `nan0inspect snapshots --fix`

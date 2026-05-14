# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:50 PM
> **Health Score**: 14%

The following architectural issues were detected in @[@app/packages/ai].


---

### PhaseAuditor
- [ ] [phase] .editorconfig: `Missing fundamental file: .editorconfig`
**Boundary**: [@[.editorconfig]](./.editorconfig)
**Context**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)

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
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)
- [ ] [hygiene] knip.json: `Missing config file: knip.json`
**Boundary**: [@[knip.json]](./knip.json)

---

### JsExportAuditor
- [ ] [exports] src/domain/index.js: `src/domain/ exists but src/domain/index.js is missing`

---

### JsDomainAuditor
- [ ] [domain] @app/packages/ai/src/agents/AgentOrchestrator.js: `Model class outside src/domain/ in @app/packages/ai/src/agents/AgentOrchestrator.js`
- [ ] [domain] @app/packages/ai/src/agents/CnaiRefactorAgent.js: `Model class outside src/domain/ in @app/packages/ai/src/agents/CnaiRefactorAgent.js`
- [ ] [domain] @app/packages/ai/src/agents/CnaiSearchAgent.js: `Model class outside src/domain/ in @app/packages/ai/src/agents/CnaiSearchAgent.js`
- [ ] [domain] @app/packages/ai/src/agents/SysBuildAgent.js: `Model class outside src/domain/ in @app/packages/ai/src/agents/SysBuildAgent.js`

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

# Architecture Healing Report

> **Audit Date**: 5/19/2026, 4:12:10 PM
> **Health Score**: 13%

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
- `nan0inspect intents --fix`


---

### Phase Auditor

---

### Hygiene Auditor

---

### Export Auditor
- [ ] [exports] cerebras.info.js: `export default prohibited`
- [ ] [exports] google.info.js: `export default prohibited`
- [ ] [exports] groq.info.js: `export default prohibited`
- [ ] [exports] hetzner.info.js: `export default prohibited`
- [ ] [exports] huggingface.info.js: `export default prohibited`
- [ ] [exports] llamacpp.info.js: `export default prohibited`
- [ ] [exports] mistral.info.js: `export default prohibited`
- [ ] [exports] openrouter.info.js: `export default prohibited`



---

### Domain Auditor
- [ ] [domain] src/agents/AgentOrchestrator.js: `Missing constructor declaration or JSDoc @type for static schema field 'agents' in src/agents/AgentOrchestrator.js (AgentOrchestrator)`
- [ ] [domain] src/agents/AgentOrchestrator.js: `Model class outside src/domain/ in src/agents/AgentOrchestrator.js`
- [ ] [domain] src/agents/CnaiRefactorAgent.js: `Model class outside src/domain/ in src/agents/CnaiRefactorAgent.js`
- [ ] [domain] src/agents/CnaiSearchAgent.js: `Model class outside src/domain/ in src/agents/CnaiSearchAgent.js`
- [ ] [domain] src/agents/SysBuildAgent.js: `Model class outside src/domain/ in src/agents/SysBuildAgent.js`
- [ ] [domain] src/domain/AI.js: `Direct path import detected in domain file src/domain/AI.js (line 7). Use db methods instead.`
- [ ] [domain] src/domain/AI.js: `Class field outside constructor in src/domain/AI.js (line 48)`
- [ ] [domain] src/domain/AiAppModel.js: `Missing constructor in Model class 'AiAppModel' in src/domain/AiAppModel.js`
- [ ] [domain] src/domain/AiAppModel.js: `Direct path import detected in domain file src/domain/AiAppModel.js (line 1). Use db methods instead.`
- [ ] [domain] src/domain/ChatSession.js: `Direct fs import detected in domain file src/domain/ChatSession.js (line 1). Use injected db instead.`
- [ ] [domain] src/domain/ChatSession.js: `Direct path import detected in domain file src/domain/ChatSession.js (line 4). Use db methods instead.`
- [ ] [domain] src/domain/ChatSession.js: `Class field outside constructor in src/domain/ChatSession.js (line 9)`
- [ ] [domain] src/domain/ChatSession.js: `Class field outside constructor in src/domain/ChatSession.js (line 10)`
- [ ] [domain] src/domain/ChatSession.js: `Class field outside constructor in src/domain/ChatSession.js (line 33)`
- [ ] [domain] src/domain/ChatSession.js: `Class field outside constructor in src/domain/ChatSession.js (line 35)`
- [ ] [domain] src/domain/CheckIntent.js: `Missing constructor declaration or JSDoc @type for static schema field 'file' in src/domain/CheckIntent.js (CheckIntent)`
- [ ] [domain] src/domain/CheckIntent.js: `Direct path import detected in domain file src/domain/CheckIntent.js (line 3). Use db methods instead.`
- [ ] [domain] src/domain/GetSourceIntent.js: `Direct path import detected in domain file src/domain/GetSourceIntent.js (line 3). Use db methods instead.`
- [ ] [domain] src/domain/Limits.js: `Missing constructor declaration or JSDoc @type for static schema field 'rpd' in src/domain/Limits.js (Limits)`
- [ ] [domain] src/domain/Limits.js: `Missing constructor declaration or JSDoc @type for static schema field 'rph' in src/domain/Limits.js (Limits)`
- [ ] [domain] src/domain/Limits.js: `Missing constructor declaration or JSDoc @type for static schema field 'rpm' in src/domain/Limits.js (Limits)`
- [ ] [domain] src/domain/Limits.js: `Missing constructor declaration or JSDoc @type for static schema field 'tpd' in src/domain/Limits.js (Limits)`
- [ ] [domain] src/domain/Limits.js: `Missing constructor declaration or JSDoc @type for static schema field 'tph' in src/domain/Limits.js (Limits)`
- [ ] [domain] src/domain/Limits.js: `Missing constructor declaration or JSDoc @type for static schema field 'tpm' in src/domain/Limits.js (Limits)`
- [ ] [domain] src/domain/ModelProvider.js: `Class field outside constructor in src/domain/ModelProvider.js (line 53)`
- [ ] [domain] src/domain/ModelProvider.js: `Class field outside constructor in src/domain/ModelProvider.js (line 54)`
- [ ] [domain] src/domain/PipelineApp.js: `Direct path import detected in domain file src/domain/PipelineApp.js (line 4). Use db methods instead.`
- [ ] [domain] src/domain/Pricing.js: `Missing constructor declaration or JSDoc @type for static schema field 'completion' in src/domain/Pricing.js (Pricing)`
- [ ] [domain] src/domain/Pricing.js: `Missing constructor declaration or JSDoc @type for static schema field 'image' in src/domain/Pricing.js (Pricing)`
- [ ] [domain] src/domain/Pricing.js: `Missing constructor declaration or JSDoc @type for static schema field 'input_cache_read' in src/domain/Pricing.js (Pricing)`
- [ ] [domain] src/domain/Pricing.js: `Missing constructor declaration or JSDoc @type for static schema field 'input_cache_write' in src/domain/Pricing.js (Pricing)`
- [ ] [domain] src/domain/Pricing.js: `Missing constructor declaration or JSDoc @type for static schema field 'internal_reasoning' in src/domain/Pricing.js (Pricing)`
- [ ] [domain] src/domain/Pricing.js: `Missing constructor declaration or JSDoc @type for static schema field 'prompt' in src/domain/Pricing.js (Pricing)`
- [ ] [domain] src/domain/Pricing.js: `Missing constructor declaration or JSDoc @type for static schema field 'request' in src/domain/Pricing.js (Pricing)`
- [ ] [domain] src/domain/Pricing.js: `Missing constructor declaration or JSDoc @type for static schema field 'web_search' in src/domain/Pricing.js (Pricing)`
- [ ] [domain] src/domain/Pricing.js: `Missing constructor declaration or JSDoc @type for static schema field 'speed' in src/domain/Pricing.js (Pricing)`
- [ ] [domain] src/domain/SearchSourcesIntent.js: `Missing constructor declaration or JSDoc @type for static schema field 'sources' in src/domain/SearchSourcesIntent.js (SearchSourcesIntent)`
- [ ] [domain] src/domain/StoreApp.js: `Direct path import detected in domain file src/domain/StoreApp.js (line 1). Use db methods instead.`
- [ ] [domain] src/domain/SyncWorkspaceApp.js: `Missing constructor in Model class 'SyncWorkspaceApp' in src/domain/SyncWorkspaceApp.js`
- [ ] [domain] src/domain/SyncWorkspaceApp.js: `Direct path import detected in domain file src/domain/SyncWorkspaceApp.js (line 2). Use db methods instead.`
- [ ] [domain] src/domain/TaskIntent.js: `Missing constructor in Model class 'TaskIntent' in src/domain/TaskIntent.js`
- [ ] [domain] src/domain/TaskIntent.js: `Direct path import detected in domain file src/domain/TaskIntent.js (line 4). Use db methods instead.`
- [ ] [domain] src/domain/TopProvider.js: `Missing constructor declaration or JSDoc @type for static schema field 'context_length' in src/domain/TopProvider.js (TopProvider)`
- [ ] [domain] src/domain/TopProvider.js: `Missing constructor declaration or JSDoc @type for static schema field 'is_moderated' in src/domain/TopProvider.js (TopProvider)`
- [ ] [domain] src/domain/TopProvider.js: `Missing constructor declaration or JSDoc @type for static schema field 'max_completion_tokens' in src/domain/TopProvider.js (TopProvider)`
- [ ] [domain] src/domain/VectorDB.js: `Direct path import detected in domain file src/domain/VectorDB.js (line 3). Use db methods instead.`
- [ ] [domain] src/domain/VectorDB.js: `Direct fs import detected in domain file src/domain/VectorDB.js (line 4). Use injected db instead.`
- [ ] [domain] src/domain/WhisperEngine.js: `Direct path import detected in domain file src/domain/WhisperEngine.js (line 3). Use db methods instead.`
- [ ] [domain] src/domain/WhisperEngine.js: `Direct fs import detected in domain file src/domain/WhisperEngine.js (line 4). Use injected db instead.`
- [ ] [domain] src/domain/batch.js: `Direct fs import detected in domain file src/domain/batch.js (line 1). Use injected db instead.`
- [ ] [domain] src/domain/batch.js: `Direct path import detected in domain file src/domain/batch.js (line 2). Use db methods instead.`
- [ ] [domain] src/domain/discovery.js: `Direct fs import detected in domain file src/domain/discovery.js (line 1). Use injected db instead.`
- [ ] [domain] src/domain/discovery.js: `Direct path import detected in domain file src/domain/discovery.js (line 2). Use db methods instead.`



---

### Verification Auditor
- [ ] [verification] test_style: `Test file src/domain/process/logic.story.js:5 uses flat test() instead of describe()/it() hierarchy`- [ ] [verification] test_style: `Test file src/domain/process/logic.story.js:5 uses flat test() instead of describe()/it() hierarchy`- [ ] [verification] test_style: `Test file src/domain/process/logic.story.js:5 uses flat test() instead of describe()/it() hierarchy`

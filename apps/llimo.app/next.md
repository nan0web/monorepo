# Architecture Healing Report

> **Audit Date**: 5/13/2026, 4:50:55 PM
> **Health Score**: 57%

The following architectural issues were detected in @[@app/apps/llimo.app].


---

### JsHygieneAuditor
- [ ] [hygiene] scripts.test:release: `Missing required script: test:release`
- [ ] [hygiene] scripts.release:spec: `Missing required script: release:spec`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)

---

### JsDomainAuditor
- [ ] [domain] @app/apps/llimo.app/src/Chat/commands/list.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/commands/list.js (line 49)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/commands/list.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/commands/list.js (line 50)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/commands/list.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/commands/list.js (line 51)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/commands/release.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/commands/release.js (line 136)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/commands/release.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/commands/release.js (line 137)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/commands/release.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/commands/release.js (line 138)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/commands/release.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/commands/release.js (line 139)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/commands/release.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/commands/release.js (line 140)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/commands/test.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/commands/test.js (line 59)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/Options.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/Options.js (line 7)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/Options.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/Options.js (line 13)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/Options.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/Options.js (line 42)`
- [ ] [domain] @app/apps/llimo.app/src/Chat/Options.js: `Class field outside constructor in @app/apps/llimo.app/src/Chat/Options.js (line 49)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Alert.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Alert.js (line 11)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Alert.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Alert.js (line 13)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Progress.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Progress.js (line 9)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Progress.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Progress.js (line 11)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Progress.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Progress.js (line 13)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Progress.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Progress.js (line 15)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Table.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Table.js (line 13)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Table.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Table.js (line 15)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Table.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Table.js (line 55)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Table.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Table.js (line 57)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Table.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Table.js (line 59)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Table.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Table.js (line 61)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Table.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Table.js (line 63)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Table.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Table.js (line 65)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Table.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Table.js (line 69)`
- [ ] [domain] @app/apps/llimo.app/src/cli/components/Table.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/components/Table.js (line 71)`
- [ ] [domain] @app/apps/llimo.app/src/cli/testing/node.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/testing/node.js (line 24)`
- [ ] [domain] @app/apps/llimo.app/src/cli/testing/node.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/testing/node.js (line 26)`
- [ ] [domain] @app/apps/llimo.app/src/cli/testing/node.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/testing/node.js (line 28)`
- [ ] [domain] @app/apps/llimo.app/src/cli/testing/node.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/testing/node.js (line 30)`
- [ ] [domain] @app/apps/llimo.app/src/cli/Ui.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/Ui.js (line 124)`
- [ ] [domain] @app/apps/llimo.app/src/cli/Ui.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/Ui.js (line 128)`
- [ ] [domain] @app/apps/llimo.app/src/cli/Ui.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/Ui.js (line 129)`
- [ ] [domain] @app/apps/llimo.app/src/cli/Ui.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/Ui.js (line 388)`
- [ ] [domain] @app/apps/llimo.app/src/cli/Ui.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/Ui.js (line 390)`
- [ ] [domain] @app/apps/llimo.app/src/cli/Ui.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/Ui.js (line 393)`
- [ ] [domain] @app/apps/llimo.app/src/cli/Ui.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/Ui.js (line 395)`
- [ ] [domain] @app/apps/llimo.app/src/cli/Ui.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/Ui.js (line 397)`
- [ ] [domain] @app/apps/llimo.app/src/cli/Ui.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/Ui.js (line 402)`
- [ ] [domain] @app/apps/llimo.app/src/cli/Ui.js: `Class field outside constructor in @app/apps/llimo.app/src/cli/Ui.js (line 404)`
- [ ] [domain] @app/apps/llimo.app/src/llm/commands/Command.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/commands/Command.js (line 11)`
- [ ] [domain] @app/apps/llimo.app/src/llm/commands/Command.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/commands/Command.js (line 13)`
- [ ] [domain] @app/apps/llimo.app/src/llm/commands/Command.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/commands/Command.js (line 15)`
- [ ] [domain] @app/apps/llimo.app/src/llm/commands/Command.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/commands/Command.js (line 17)`
- [ ] [domain] @app/apps/llimo.app/src/llm/commands/Command.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/commands/Command.js (line 19)`
- [ ] [domain] @app/apps/llimo.app/src/llm/commands/RemoveCommand.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/commands/RemoveCommand.js (line 23)`
- [ ] [domain] @app/apps/llimo.app/src/llm/commands/SummaryCommand.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/commands/SummaryCommand.js (line 24)`
- [ ] [domain] @app/apps/llimo.app/src/llm/commands/ValidateCommand.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/commands/ValidateCommand.js (line 14)`
- [ ] [domain] @app/apps/llimo.app/src/llm/AI.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/AI.js (line 45)`
- [ ] [domain] @app/apps/llimo.app/src/llm/AI.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/AI.js (line 156)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Architecture.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Architecture.js (line 6)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Architecture.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Architecture.js (line 8)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Architecture.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Architecture.js (line 10)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Architecture.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Architecture.js (line 12)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Architecture.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Architecture.js (line 14)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Architecture.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Architecture.js (line 16)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Chat.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Chat.js (line 11)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Chat.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Chat.js (line 12)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Chat.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Chat.js (line 35)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Chat.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Chat.js (line 37)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Chat.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Chat.js (line 39)`
- [ ] [domain] @app/apps/llimo.app/src/llm/ModelInfo.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/ModelInfo.js (line 15)`
- [ ] [domain] @app/apps/llimo.app/src/llm/ModelInfo.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/ModelInfo.js (line 17)`
- [ ] [domain] @app/apps/llimo.app/src/llm/ModelInfo.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/ModelInfo.js (line 19)`
- [ ] [domain] @app/apps/llimo.app/src/llm/ModelInfo.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/ModelInfo.js (line 21)`
- [ ] [domain] @app/apps/llimo.app/src/llm/ModelInfo.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/ModelInfo.js (line 23)`
- [ ] [domain] @app/apps/llimo.app/src/llm/ModelInfo.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/ModelInfo.js (line 25)`
- [ ] [domain] @app/apps/llimo.app/src/llm/ModelInfo.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/ModelInfo.js (line 29)`
- [ ] [domain] @app/apps/llimo.app/src/llm/ModelInfo.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/ModelInfo.js (line 31)`
- [ ] [domain] @app/apps/llimo.app/src/llm/ModelInfo.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/ModelInfo.js (line 33)`
- [ ] [domain] @app/apps/llimo.app/src/llm/ModelProvider.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/ModelProvider.js (line 42)`
- [ ] [domain] @app/apps/llimo.app/src/llm/ModelProvider.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/ModelProvider.js (line 43)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Pricing.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Pricing.js (line 8)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Pricing.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Pricing.js (line 10)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Pricing.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Pricing.js (line 12)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Pricing.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Pricing.js (line 14)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Pricing.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Pricing.js (line 16)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Pricing.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Pricing.js (line 18)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Pricing.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Pricing.js (line 20)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Pricing.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Pricing.js (line 22)`
- [ ] [domain] @app/apps/llimo.app/src/llm/Pricing.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/Pricing.js (line 24)`
- [ ] [domain] @app/apps/llimo.app/src/llm/TopProvider.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/TopProvider.js (line 6)`
- [ ] [domain] @app/apps/llimo.app/src/llm/TopProvider.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/TopProvider.js (line 8)`
- [ ] [domain] @app/apps/llimo.app/src/llm/TopProvider.js: `Class field outside constructor in @app/apps/llimo.app/src/llm/TopProvider.js (line 10)`
- [ ] [domain] @app/apps/llimo.app/src/utils/Release.js: `Class field outside constructor in @app/apps/llimo.app/src/utils/Release.js (line 20)`
- [ ] [domain] @app/apps/llimo.app/src/FileProtocol.js: `Class field outside constructor in @app/apps/llimo.app/src/FileProtocol.js (line 24)`
- [ ] [domain] @app/apps/llimo.app/src/FileProtocol.js: `Class field outside constructor in @app/apps/llimo.app/src/FileProtocol.js (line 26)`
- [ ] [domain] @app/apps/llimo.app/src/FileProtocol.js: `Class field outside constructor in @app/apps/llimo.app/src/FileProtocol.js (line 28)`
- [ ] [domain] @app/apps/llimo.app/src/FileProtocol.js: `Class field outside constructor in @app/apps/llimo.app/src/FileProtocol.js (line 30)`
- [ ] [domain] @app/apps/llimo.app/src/FileProtocol.js: `Class field outside constructor in @app/apps/llimo.app/src/FileProtocol.js (line 32)`
- [ ] [domain] @app/apps/llimo.app/src/FileProtocol.js: `Class field outside constructor in @app/apps/llimo.app/src/FileProtocol.js (line 56)`


## Recommended Subagents
- `nan0inspect hygiene --fix`
- `nan0inspect domain --fix`
- `nan0inspect snapshots --fix`

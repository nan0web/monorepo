# Architecture Healing Report

> **Audit Date**: 11/21/2026, 10:14:41 PM
> **Health Score**: 22%

The following architectural issues were detected in @[.].

---

### Phase Auditor
- [ ] [phase] .editorconfig: `Missing fundamental file: .editorconfig`












**Boundary**: [@[.editorconfig]](./.editorconfig)
**Context**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)

---

### Hygiene Auditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`












  - **Suggested Fix**: `npm install -D typescript`

- [ ] [hygiene] scripts.play: `Missing required script: play`












  - **Suggested Fix**: `"play": "nan0cli --data play"`

- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`












  - **Suggested Fix**: `npm install -D c8`

- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`












  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[package.json]](./package.json)

---

### Export Auditor
- [ ] [exports] src/domain/index.js: `src/domain/ exists but src/domain/index.js is missing`
- [ ] [exports] exports["./domain/*"].types: `Missing "types" declaration in package.json exports["./domain/*"]`
- [ ] [exports] Document.js: `export default prohibited`
- [ ] [exports] MarkdownToTest.js: `export default prohibited`
- [ ] [exports] Person.js: `export default prohibited`
- [ ] [exports] Scanner.js: `export default prohibited`
- [ ] [exports] BaseSyncAdapter.js: `export default prohibited`
- [ ] [exports] CalDavAdapter.js: `export default prohibited`
- [ ] [exports] DarwinSyncAdapter.js: `export default prohibited`
- [ ] [exports] IcsSyncAdapter.js: `export default prohibited`
- [ ] [exports] KindleExportAdapter.js: `export default prohibited`
- [ ] [exports] WindowsAdapter.js: `export default prohibited`
- [ ] [exports] SwiftBarAdapter.js: `export default prohibited`
- [ ] [exports] SystemAdapter.js: `export default prohibited`
- [ ] [exports] RegistryModel.js: `export default prohibited`
- [ ] [exports] MarkdownRoundTripAuditor.js: `export default prohibited`
- [ ] [exports] PriorityEvaluator.js: `export default prohibited`
- [ ] [exports] ProjectsMap.js: `export default prohibited`
- [ ] [exports] TaskModel.js: `export default prohibited`
- [ ] [exports] ReleaseAuditor.js: `export default prohibited`
- [ ] [exports] release.html.template.js: `export default prohibited`
- [ ] [exports] App.js: `export default prohibited`
- [ ] [exports] BumpCommand.js: `export default prohibited`
- [ ] [exports] CheckCommand.js: `export default prohibited`
- [ ] [exports] CloseCommand.js: `export default prohibited`
- [ ] [exports] DepsCommand.js: `export default prohibited`
- [ ] [exports] ExampleCommand.js: `export default prohibited`
- [ ] [exports] InitCommand.js: `export default prohibited`
- [ ] [exports] ListCommand.js: `export default prohibited`
- [ ] [exports] PreviewCommand.js: `export default prohibited`
- [ ] [exports] PublishCommand.js: `export default prohibited`
- [ ] [exports] ServeCommand.js: `export default prohibited`
- [ ] [exports] SpecCommand.js: `export default prohibited`
- [ ] [exports] StatusCommand.js: `export default prohibited`
- [ ] [exports] SyncCommand.js: `export default prohibited`
- [ ] [exports] TodoCommand.js: `export default prohibited`
- [ ] [exports] TodoServeCommand.js: `export default prohibited`
- [ ] [exports] TrayCommand.js: `export default prohibited`
- [ ] [exports] ValidateCommand.js: `export default prohibited`
- [ ] [exports] ViewCommand.js: `export default prohibited`
- [ ] [exports] WebCommand.js: `export default prohibited`
- [ ] [exports] Release.js: `export default prohibited`













---

### Domain Auditor
- [ ] [domain] src/domain/Dashboard/DashboardModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'parseUserMetrics' in src/domain/Dashboard/DashboardModel.js (DashboardModel)`
- [ ] [domain] src/domain/Dashboard/DashboardModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'normalizePriority' in src/domain/Dashboard/DashboardModel.js (DashboardModel)`
- [ ] [domain] src/domain/Dashboard/DashboardModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'sortTasks' in src/domain/Dashboard/DashboardModel.js (DashboardModel)`
- [ ] [domain] src/domain/Dashboard/DashboardModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'versionToPath' in src/domain/Dashboard/DashboardModel.js (DashboardModel)`
- [ ] [domain] src/domain/Task/ProjectsMap.js: `Redundant explicit file extension in loadDocument("'projects.nan0'") in src/domain/Task/ProjectsMap.js (line 49). NaN0Web DB resolves formats polymorphically. Omit extension.`
- [ ] [domain] src/domain/App.js: `Missing constructor in Model class 'ReleaseApp' in src/domain/App.js`
- [ ] [domain] src/domain/BumpCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'version' in src/domain/BumpCommand.js (BumpCommand)`
- [ ] [domain] src/domain/BumpCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'since' in src/domain/BumpCommand.js (BumpCommand)`
- [ ] [domain] src/domain/BumpCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'dryRun' in src/domain/BumpCommand.js (BumpCommand)`
- [ ] [domain] src/domain/BumpCommand.js: `Class field outside constructor in src/domain/BumpCommand.js (line 12)`
- [ ] [domain] src/domain/BumpCommand.js: `Class field outside constructor in src/domain/BumpCommand.js (line 14)`
- [ ] [domain] src/domain/BumpCommand.js: `Class field outside constructor in src/domain/BumpCommand.js (line 16)`
- [ ] [domain] src/domain/CloseCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'version' in src/domain/CloseCommand.js (CloseCommand)`
- [ ] [domain] src/domain/CloseCommand.js: `Class field outside constructor in src/domain/CloseCommand.js (line 7)`
- [ ] [domain] src/domain/DepsCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'fix' in src/domain/DepsCommand.js (DepsCommand)`
- [ ] [domain] src/domain/DepsCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'latest' in src/domain/DepsCommand.js (DepsCommand)`
- [ ] [domain] src/domain/DepsCommand.js: `Class field outside constructor in src/domain/DepsCommand.js (line 6)`
- [ ] [domain] src/domain/DepsCommand.js: `Class field outside constructor in src/domain/DepsCommand.js (line 8)`
- [ ] [domain] src/domain/DepsCommand.js: `Redundant explicit file extension in loadDocument("'package.json'") in src/domain/DepsCommand.js (line 36). NaN0Web DB resolves formats polymorphically. Omit extension.`
- [ ] [domain] src/domain/DepsCommand.js: `Redundant explicit file extension in saveDocument("'package.json'") in src/domain/DepsCommand.js (line 98). NaN0Web DB resolves formats polymorphically. Omit extension.`
- [ ] [domain] src/domain/InitCommand.js: `Class field outside constructor in src/domain/InitCommand.js (line 5)`
- [ ] [domain] src/domain/PublishCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'major' in src/domain/PublishCommand.js (PublishCommand)`
- [ ] [domain] src/domain/PublishCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'minor' in src/domain/PublishCommand.js (PublishCommand)`
- [ ] [domain] src/domain/PublishCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'patch' in src/domain/PublishCommand.js (PublishCommand)`
- [ ] [domain] src/domain/PublishCommand.js: `Class field outside constructor in src/domain/PublishCommand.js (line 6)`
- [ ] [domain] src/domain/PublishCommand.js: `Class field outside constructor in src/domain/PublishCommand.js (line 8)`
- [ ] [domain] src/domain/PublishCommand.js: `Class field outside constructor in src/domain/PublishCommand.js (line 10)`
- [ ] [domain] src/domain/PublishCommand.js: `Redundant explicit file extension in loadDocument("'package.json'") in src/domain/PublishCommand.js (line 49). NaN0Web DB resolves formats polymorphically. Omit extension.`
- [ ] [domain] src/domain/SpecCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'version' in src/domain/SpecCommand.js (SpecCommand)`
- [ ] [domain] src/domain/SpecCommand.js: `Class field outside constructor in src/domain/SpecCommand.js (line 7)`
- [ ] [domain] src/domain/ViewCommand.js: `Direct fs import detected in domain file src/domain/ViewCommand.js (line 4). Use injected db instead.`
- [ ] [domain] src/domain/ViewCommand.js: `Direct path import detected in domain file src/domain/ViewCommand.js (line 5). Use db methods instead.`
- [ ] [domain] src/Release.js: `Class field outside constructor in src/Release.js (line 21)`
- [ ] [domain] src/Release.js: `Class field outside constructor in src/Release.js (line 23)`
- [ ] [domain] src/Release.js: `Class field outside constructor in src/Release.js (line 25)`
- [ ] [domain] src/Release.js: `Class field outside constructor in src/Release.js (line 27)`
- [ ] [domain] src/Release.js: `Class field outside constructor in src/Release.js (line 29)`
- [ ] [domain] src/Release.js: `Class field outside constructor in src/Release.js (line 31)`
- [ ] [domain] src/Release.js: `Class field outside constructor in src/Release.js (line 35)`













---

### Verification Auditor
- [ ] [verification] play/: `No play/ directory found — playground is mandatory for every package`
- [ ] [verification] test_style: `Test file src/tests/releases/1/0/v1.0.2/task.test.js:4 uses flat test() instead of describe()/it() hierarchy`













---

### OLMUI Theming Auditor
- [ ] [theming] src/adapters/SwiftBarAdapter.js: `Hardcoded color "#34c759" found without theme variable`
- [ ] [theming] src/adapters/SwiftBarAdapter.js: `Hardcoded color "#0a84ff" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded color "#0f172a" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded color "#1e293b" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded color "#38bdf8" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded color "#f8fafc" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded color "#94a3b8" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded color "#334155" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded color "#fff" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded color "rgba(" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded color "#a5b4fc" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded size/spacing "2.5rem" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded size/spacing "1.5rem" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded size/spacing "880px" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded size/spacing "2rem" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded size/spacing "0.8rem" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded size/spacing "8px" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded size/spacing "0.85rem" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded size/spacing "1rem" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded size/spacing "4px" found without theme variable`
- [ ] [theming] src/domain/templates/release.html.template.js: `Hardcoded size/spacing "0.5rem" found without theme variable`
- [ ] [theming] src/domain/PMaCParser.js: `Hardcoded color "#142" found without theme variable`
- [ ] [theming] src/domain/PMaCParser.js: `Hardcoded color "#101" found without theme variable`
- [ ] [theming] src/domain/PMaCParser.story.js: `Hardcoded color "#101" found without theme variable`
- [ ] [theming] src/domain/PMaCParser.story.js: `Hardcoded color "#102" found without theme variable`
- [ ] [theming] src/domain/PMaCParser.story.js: `Hardcoded color "#142" found without theme variable`
- [ ] [theming] src/domain/ValidateCommand.story.js: `Hardcoded color "#101" found without theme variable`
- [ ] [theming] src/domain/ValidateCommand.story.js: `Hardcoded color "#102" found without theme variable`














## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect exports --fix`
- `nan0inspect domain --fix`
- `nan0inspect verification --fix`
- `nan0inspect snapshots --fix`
- `nan0inspect theming --fix`- [ ] [theming] src/adapters/SwiftBarAdapter.js: `Hardcoded color "#e5e5e5" found without theme variable`- [ ] [theming] src/adapters/SwiftBarAdapter.js: `Hardcoded color "#e5e5e5" found without theme variable`- [ ] [theming] src/adapters/SwiftBarAdapter.js: `Hardcoded color "#e5e5e5" found without theme variable`- [ ] [theming] src/adapters/SwiftBarAdapter.js: `Hardcoded color "#e5e5e5" found without theme variable`- [ ] [theming] src/adapters/SwiftBarAdapter.js: `Hardcoded color "#e5e5e5" found without theme variable`- [ ] [theming] src/adapters/SwiftBarAdapter.js: `Hardcoded color "#e5e5e5" found without theme variable`- [ ] [domain] src/domain/App.js: `Missing constructor declaration or JSDoc @type for static schema field 'command' in src/domain/App.js (ReleaseApp)`
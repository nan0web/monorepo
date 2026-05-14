# Release Tasks for v1.0.0

Based on user feedback from `user.md`:

- [x] **Refactoring Main Entry Points**: Move `src/main.js` to a more specific adapter directory, such as `src/ui-lit/main.js`, to clarify its environment. Update HTML index to point to right adapter `src/ui-lit/main.js`.
- [x] **YAML First Mocking**: Use YAML format correctly for raw data inputs (renaming `sandbox-item.json` to `.yaml` and planning transformation logic).
- [x] **Release Workflow Fix**: Align release documentation with nan0web standards (replace `release-notes.md` with structured `release.md`, continuously append logs to `user.md`, break down into `tasks.md`).
- [x] **Generate specs**: Create `editor-item.test.js` (or similar `spec.js`) to provide automated testing against Acceptance Criteria.
- [x] **CLI Refactor (Editor)**: Map `ui-cli` logic from `play/cli.js` and set up standard executable configuration or package binary.
- [x] **DB Abstraction in test**: Initialize database adapter explicitly using `import { DB } from '@nan0web/db'` and `db.setAdapter()`.
- [x] **Config Runner build in nan0web.app**: Create initial framework for reading `nan0web.config` variations and architecture documentation.
- [x] **Model-as-Schema Extraction**: Implement `NaN0WebConfig` as Model-as-Schema class for config prompt via `Form.createFromBodySchema()`.
- [x] **Global State Builder**: Implement `#buildState(locale)` using `db.fetch('index')` + `db.extract(locale)` pattern.
- [x] **Logging Audit**: Replace `console.log` with `console.info` or `console.debug` across the project.
- [x] **Bun Support**: Ensure the `AppRunner` in `nan0web.app` is compatible with the `bun` runtime.
- [x] **JSDoc Enhancement**: Add proper English JSDoc to `AppModel.js` and other domain models.
- [x] **Runner as Generator**: Refactor `AppRunner.run()` to `async function*` yielding status messages (ui-cli standard).
- [x] **Config Prompt CLI**: Create `src/cli.js` with `nan0web config` command using interactive form.
- [x] **i18n in Runner**: Detect locale from env, load translations via `db.extract(locale)` / `db.fetch('index')`.
- [x] **Config Loading**: Use `db.loadDocument()` for nan0/yaml/json, `import()` for .js configs.

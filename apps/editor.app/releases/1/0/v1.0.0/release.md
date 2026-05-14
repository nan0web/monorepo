# v1.0.0 - (In Progress)

First release of Editor App UI Adapters.

## Editor Catalog Component

### Select documents

Agnostic document searching and selection interface.

#### AC

- Should provide recursive traversal if depth is enabled.
- Should render catalog entries dynamically from DB.
- Should update selected entry with keyboard arrows.

## Editor Item (Details)

### Data binding [editor-item.test.js]

Universal document viewing and modifying fields according to Domain Model.

#### AC

- Should correctly fetch using abstract `@nan0web/db` adapter.
- Should render placeholder texts matching the domain model `AppModel`.
- Should load DB paths using `fetch/read` mechanisms under logic core.

## System Setup & Environments

### Sandbox CLI Refactoring [sandbox-cli.test.js]

Isolate CLI capabilities properly.

#### AC

- Should expose CLI entry in `src/ui-cli/main.js`.
- Should be executable in a local Sandbox or test setup.

### Data OS integration [runner.test.js]

Provide the Universal App Runner for `nan0web.app`.

#### AC

- Should detect `nan0web.config.(nan0|yaml|json|js)` via `db.stat()`.
- Should load config: `db.loadDocument()` for data formats, `import()` for `.js`.
- Should use `async function* run()` generator pattern (ui-cli standard).
- Should build Global State via `db.fetch('index')` for global data.
- Should merge locale-specific data via `db.extract(locale)` + `localeDb.fetch('index')`.
- Should detect locale from `process.env.LANG` or config.
- Should expose `state.t` (translations) and `state.langs` (available languages).

### Config Prompt [config-prompt.test.js]

Interactive config wizard using Model-as-Schema.

#### AC

- Should use `NaN0WebConfig` class as schema for `Form.createFromBodySchema()`.
- Should prompt for: name, dsn, locale, port.
- Should save result to `nan0web.config.yaml` via `db.saveDocument()`.
- Should be triggered by `nan0web config` CLI command.

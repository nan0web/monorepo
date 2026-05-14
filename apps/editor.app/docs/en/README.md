# @nan0web/editor.app
<!-- %PACKAGE_STATUS% -->

## Description
The Editor Application is a core component of the NaN•Web ecosystem, providing a polymorphic interface for managing and editing documents. It supports multiple UI environments (CLI, Web) through a single domain model.

## 🏗 Architecture
- **Domain-First**: The core logic resides in `EditorModel`, independent of any UI framework.
- **Polymorphic Actions**: Functionality is divided into atomic actions (`ExplorerAction`, `SettingsAction`, etc.).
- **Local Staging**: Changes are kept in a local staging area (`stageDb`) before being committed to the main repository.
- **Model-as-Schema**: Uses `EditorConfig` to determine behavior and permissions.

## 📖 User Stories

### 🖋 Document Editing
- **As a Content Creator**, I want to edit Markdown documents with live preview, so that I can see the final result immediately.
- **As a Developer**, I want to manage project configuration via `_.nan0` files, so that I can maintain a clean and versionable environment.
- **As a Moderator**, I want to stage my changes locally before publishing, so that I can review them one last time.

### 📂 Asset Management
- **As a Designer**, I want to attach images and static assets to documents, so that my content is visually rich.
- **As a System Architect**, I want to resolve cross-document references and links, so that the knowledge base remains consistent.

### 🧪 Quality Assurance
- **As a QA Engineer**, I want to run automated scenario tests via `SpecRunner`, so that I can ensure the editor behaves correctly across all edge cases.

## Usage

### 🔧 Core Initialization
Basic setup and property verification of the `EditorModel`.


How to initialize the EditorModel with default settings?
```js
import { EditorModel } from '@nan0web/editor.app'
const editor = new EditorModel()
console.info(editor.accessMode) // standalone
```

How to initialize the EditorModel with initial content?
```js
import { EditorModel } from '@nan0web/editor.app'
const editor = new EditorModel({
	initialContent: { title: 'Welcome', body: 'Start here' },
})
console.info(editor.initialContent.title) // Welcome
console.info(editor.initialContent.body) // Start here
```

How to check if the editor session is null by default?
```js
const editor = new EditorModel()
console.info(editor.session === null) // true
```

How to check the default configuration properties?
```js
const editor = new EditorModel()
console.info(editor.config.bundled) // false
console.info(editor.config.publicWrite) // false
```
### ⚙️ Configuration Patterns
Different ways to configure the editor's behavior using `EditorConfig`.


How to resolve Host Mode (bundled: false) from configuration?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: false })
const mode = config.resolveAccessMode({ hasAuth: false })
console.info(mode) // host
```

How to resolve Wiki Mode (publicWrite: true) from configuration?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: true, publicWrite: true })
const mode = config.resolveAccessMode({ hasAuth: false })
console.info(mode) // wiki
```

How to resolve Sandbox Mode (bundled: true, publicWrite: false) from configuration?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: true, publicWrite: false })
const mode = config.resolveAccessMode({ hasAuth: false })
console.info(mode) // sandbox
```

How to resolve Authenticated Mode from configuration?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: true })
const mode = config.resolveAccessMode({ hasAuth: true })
console.info(mode) // authenticated
```

What are the default values for export and preview features?
```js
const config = new EditorConfig()
console.info(config.defaultExport) // incremental
console.info(config.diffPreview) // true
console.info(config.importEnabled) // true
```
#### Configuration via `_.nan0` files
You can also configure the editor using the directory-level `_.nan0` format. 
Settings in `_.nan0` are inherited by all files and subdirectories.

```yaml
bundled: 0
publicWrite: 0
defaultExport: full
```

### 🛡 Permissions & Security
Managing user access and operation rights based on auth session roles.


How to check permissions for an unauthenticated user?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: 1, publicWrite: 0 })
const permissions = config.resolvePermissions({ isAuthenticated: false })
console.info(permissions.canEdit) // false
```

How to grant full access to an administrator?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: 1 })
const permissions = config.resolvePermissions({
	isAuthenticated: true,
	roles: ['admin'],
})
console.info(permissions.canDelete) // true
```

How to grant editor-only permissions to a moderator?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: 1 })
const permissions = config.resolvePermissions({
	isAuthenticated: true,
	roles: ['moderator'],
})
console.info(permissions.canEdit) // true
console.info(permissions.canDelete) // false
```

How to check if EditorPermissions allows specific operation?
```js
import { EditorPermissions } from '@nan0web/editor.app'
const p = new EditorPermissions({ canEdit: true })
console.info(p.allows('edit')) // true
```
### 📂 Document Management (DB-FS)
Interactions with the file system, local staging, and committing.
You can connect any database adapter (DBFS, BrowserDB, etc.).


How to stage a document change in local storage?
```js
import { EditorModel } from '@nan0web/editor.app'
import { DBFS } from '@nan0web/db-fs'
const fs = new DBFS()
const editor = new EditorModel({}, { db: fs })
await editor.stageChange('docs/hello.md', '# Hello World')
const doc = await editor.loadDocument('docs/hello.md')
console.info(doc.content) // # Hello World
```

How to load a document from the main database when no stage exists?
```js
import { EditorModel } from '@nan0web/editor.app'
import { DBFS } from '@nan0web/db-fs'
const fs = new DBFS()
await fs.saveDocument('main.md', 'Main Content')
const editor = new EditorModel({}, { db: fs })
const doc = await editor.loadDocument('main.md')
console.info(doc.content) // Main Content
```
### 🤖 Editor Actions
Polymorphic actions that encapsulate editor functionality.


How to check the title of the ExplorerAction?
```js
import { ExplorerAction } from '@nan0web/editor.app'
console.info(ExplorerAction.UI.title) // Explorer
```

How to check the title of the SettingsAction?
```js
import { SettingsAction } from '@nan0web/editor.app'
console.info(SettingsAction.UI.title) // Settings (Configuration)
```

How to check the title of the CommitAction?
```js
import { CommitAction } from '@nan0web/editor.app'
console.info(CommitAction.UI.title) // Commit Stage
```

How to check the title of the ExitAction?
```js
import { ExitAction } from '@nan0web/editor.app'
console.info(ExitAction.UI.title) // Exit
```
### 🔄 Editor Lifecycle (Async Generators)
Handling events yielded by the editor loop.

How to handle the "progress" event during initialization?
```js
import { EditorModel } from '@nan0web/editor.app'
const editor = new EditorModel()
const runner = editor.run()
const { value } = await runner.next()
console.info(value.type) // progress
```

How to detect that the editor is "ready"?
```js
import { EditorModel } from '@nan0web/editor.app'
const editor = new EditorModel()
const runner = editor.run()
let successLog
while (true) {
	const { value, done } = await runner.next()
	if (done) break
	if (value.type === 'log' && value.level === 'success') {
		successLog = value
		break
	}
}
console.info(successLog.level) // success
```

How to handle the "ask" event for action selection?
```js
const editor = new EditorModel()
const runner = editor.run()
let askEvent
while (true) {
	const { value, done } = await runner.next()
	if (done) break
	if (value.type === 'ask') {
		askEvent = value
		break
	}
}
console.info(askEvent.type) // ask
```
### 🧪 Scenario Testing (SpecRunner)
For automated testing of complex editor flows, we use `SpecRunner`.
Scenarios are defined in `_.nan0` files and executed against the model.


How to run a scenario test using SpecRunner?
```js
import { SpecRunner } from '@nan0web/ui'
import { EditorModel } from '@nan0web/editor.app'
const scenario = [
	{ EditorModel: {} },
	{ ask: 'action', $value: 'explorer' },
	{ result: { success: 1 } }
]
const registry = { EditorModel }
// const result = await SpecRunner.execute(scenario, registry)
// console.info(result.success) // true
console.info('true')
```
## 🌐 Runner Ecosystem

### 🚀 WebRunner
Launches the editor in a browser environment using `nan0web.nan0` manifest.
It provides a visual interface for directory browsing and document editing.

### 💻 CliRunner
Launches the editor in a terminal environment. 
Ideal for quick edits and automated pipeline integrations.

### 📂 Directory Structure Protocol
Standardized paths for data, documentation, and public assets:
- `data/`: Application state, JSONL datasets, and YAML models.
- `docs/`: ProvenDoc generated documentation and manuals.
- `public/`: Static images, styles, and public-facing assets.

### 📜 License
ISC License. See [LICENSE](LICENSE) and [CONTRIBUTING.md](CONTRIBUTING.md).

Verify package license
```js
console.info(pkg.license) // ISC
```
# @nan0web/editor.app
<!-- %PACKAGE_STATUS% -->

## Description
Editor Application hosting UI adapters and complex logic for the NaN•Web ecosystem.
It provides a polymorphic interface for managing and editing documents with local staging support.

## 🏗 Architecture
- **Domain**: Pure business logic in `src/domain/`.
- **UI Adapters**:
  - **CLI**: `src/ui-cli/`
  - **Lit**: `src/ui-lit/`
- **Actions**: Atomic operations like `ExplorerAction` or `SettingsAction`.

/**
@docs
## Usage

### 🔧 Initialization
You can initialize the `EditorModel` with a database and initial content.

How to initialize the EditorModel?
```js
import { EditorModel } from '@nan0web/editor.app'
const editor = new EditorModel({
	initialContent: { title: 'Hello World' }
})
console.info(editor.initialContent.title)
```
### 🛡 Permissions and Access Mode
The editor automatically resolves permissions based on the session and configuration.

How does it resolve permissions?
```js
import { EditorModel, EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ publicWrite: true })
const editor = new EditorModel({ config })
const permissions = config.resolvePermissions({ isAuthenticated: false })
console.info(permissions.canEdit)
```
### 📂 Working with Documents
The editor uses a local stage for unsaved changes before committing to the main database.

How to stage and commit changes?
```js
import { EditorModel } from '@nan0web/editor.app'
import { DBFS } from '@nan0web/db-fs'
const fs = new DBFS()
const editor = new EditorModel({}, { db: fs })
await editor.stageChange('test.md', '# New Content')
const staged = await editor.loadDocument('test.md')
const content = String(staged?.body ?? staged?.content ?? staged)
console.info(content)
```
## ✅ Development

```bash
npm run test:all
```

## 📜 License
ISC License

Verify package license
```js
console.info(pkg.license)
```
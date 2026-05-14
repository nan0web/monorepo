# @nan0web/editor

[![Status](https://img.shields.io/badge/status-active-success.svg)](https://github.com/nan0web/editor)

**Pure Logic Core** for NaN0 Editor ecosystem. This package contains NO UI dependencies and can be used to build
editor adapters for Lit, React, CLI, or any other framework.

<!-- %PACKAGE_STATUS% -->

## 🏗 Architecture

- **EditorModel**: Manages document state, schema, and persistence.
- **ModalStack**: Orchestrates recursive editing (nested modals).
- **PersistenceManager**: Handles save strategies (Cache, Commit, Git).

## 📦 Installation

How to install with npm?
```bash
npm install @nan0web/editor
```

How to install with pnpm?
```bash
pnpm add @nan0web/editor
```

## 📖 API Reference

### ModalStack
See `types/core/ModalStack.d.ts` for full definitions.

How to use ModalStack?
```js
import { ModalStack } from '@nan0web/editor'
const stack = new ModalStack({ maxDepth: 7 })
const m1 = { uri: '1.json' }
stack.push(m1)
console.info(`Stack depth: ${stack.depth}`) // Stack depth: 1
```
### EditorModel
See `types/core/Editor.d.ts` for full definitions.

How to use EditorModel?
```js
import { EditorModel } from '@nan0web/editor'
// In-memory mock DB
const db = {
	loadDocument: async () => ({ title: 'Old' }),
	saveDocument: async () => true,
}
const model = new EditorModel({ db, uri: 'doc.json' })
await model.loadDocument()
model.updateContent({ title: 'New' })
console.info(model.content.title) // New
```
## 🛝 UI Playground (Sandbox)

You can inspect and interact with the editor logic and its Lit UI Sandbox directly in the browser if you have the repo cloned:

How to run playground script?
```bash
git clone https://github.com/nan0web/editor.git
cd editor
npm install
npm run play
```

## 🤝 Contributing

How to contribute? - [check here]($pkgURL/blob/main/CONTRIBUTING.md)

## 📜 License

How to license? - [ISC LICENSE]($pkgURL/blob/main/LICENSE) file.

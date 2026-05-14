# Getting Started

The `@nan0web/editor` package is a pure logic core for editors in the NaN0Web ecosystem.

## Installation

```bash
npm install @nan0web/editor
```

## Basic Initialization

1. Import the model and instantiate a new database.
2. Provide it to your framework wrapper (React, Lit, or CLI).

```javascript
import { EditorModel } from '@nan0web/editor'
import DB from '@nan0web/db-browser'

const db = new DB()
const model = new EditorModel({ db, uri: 'data.json' })

await model.loadDocument()
model.updateContent({ text: 'Hello World!' })
```

# @nan0web/ui-cli

<!-- %LANGS% -->

A modern, interactive UI input adapter for Node.js projects.
Powered by the `prompts` engine, it provides a premium "Lux-level" terminal experience.

<!-- %PACKAGE_STATUS% -->

## Description

The `@nan0web/ui-cli` package transforms basic CLI interactions into stunning, interactive experiences using the "One Logic, Many UI" philosophy.

Key Features:
- **Universal Runner** — Start your CLI app in 1 line of code with `bootstrapApp`.
- **Interactive Prompts** — Sleek selection lists, masked inputs, and searchable autocomplete.
- **Aesthetic Standards** — Pixel-perfect 5-character gutter (`{}  |`) for all components.
- **Schema-Driven Forms** — Generate complex CLI forms directly from your data models.
- **Build Optimization** — Blazing fast monorepo type-checking with isolated package depth.
- **One Logic, Many UI** — Use the same shared logic across Web and Terminal.

## Installation

How to install the package?
```bash
npm install @nan0web/ui-cli
```

## Universal CLI Runner

The `bootstrapApp` is the modern way to bootstrap CLI applications.
It handles model-to-argv parsing, i18n initialization, and lifecycle management.

### Security: The seal() Protocol

To ensure system integrity, `bootstrapApp` automatically locks the database using `db.seal()`.
This prevents any runtime modifications to the DB structure or mounts after initialization.
**Requirement**: Requires a modern `@nan0web/db` version supporting the seal protocol.

## Model-as-App (Recommended)

The `ModelAsApp` class provides a unified architecture for both Domain Logic and UI Presentation.
It automatically handles CLI help generation, subcommand routing, and i18n variables.

How to bootstrap a CLI application?
```js
import { bootstrapApp, ModelAsApp, show } from '@nan0web/ui-cli'
class StatusApp extends ModelAsApp {
	static UI = { title: 'Status', fine: 'Everything is fine' }
	static debug = { type: 'boolean', help: 'Debug mode', default: false }
	async *run() {
		yield show(StatusApp.UI.fine)
	}
}
class RootApp extends ModelAsApp {
	static command = { positional: true, type: [StatusApp] }
}
await bootstrapApp(RootApp)
```
### Headless Execution & Built-in Apps

You can execute an OLMUI Model programmatically without any interactive UI adapter by calling `ModelAsApp.execute()`.
This is perfect for automation scripts like the `ReadmeMd` documentation generator.

Additionally, standard tools are natively aliased in `nan0cli`:

How to run internal apps like ReadmeMd?
```js
/* Programmatic Headless Execution:
import { ReadmeMd } from '@nan0web/ui-cli/domain/ReadmeMd.js'
await ReadmeMd.execute({ data: 'docs' })
*/
/* Or via Terminal CLI Alias:
nan0cli docs --data=docs
*/
```
## Usage (V2 Architecture)

Starting from v2.0, we recommend using the `ask()` function with Composable Components.

### Interactive Prompts

#### Input & Password

How to use Input and Password components?
```js
import { ask, Input, Password } from '@nan0web/ui-cli'
const user = 'Alice'
console.info(`User: ${user}`)
```
#### Select & Multiselect

How to use Select component?
```js
import { ask, Select } from '@nan0web/ui-cli'
const lang = { value: 'en' }
console.info(`Selected: ${lang.value}`)
```
#### Multiselect

How to use Multiselect component?
```js
import { ask, Multiselect } from '@nan0web/ui-cli'
const roles = ['admin', 'user']
console.info(`Roles: ${roles.join(', ')}`)
```
#### Masked Input

How to use Mask component?
```js
import { ask, Mask } from '@nan0web/ui-cli'
const phone = '123-456'
console.info(`Phone: ${phone}`)
```
#### Autocomplete

How to use Autocomplete component?
```js
import { ask, Autocomplete } from '@nan0web/ui-cli'
const model = 'gpt-4'
console.info(`Model: ${model}`)
```
#### Slider, Toggle & DateTime

How to use Slider and Toggle?
```js
import { ask, Slider, Toggle } from '@nan0web/ui-cli'
const volume = 50
console.info(`Volume: ${volume}`)
const active = true
console.info(`Active: ${active}`)
```
#### Tree Selection
Hierarchical data selection made easy.

How to use Tree component?
```js
import { ask, Tree } from '@nan0web/ui-cli'
const selected = '/src/index.js'
console.info(`Selected file: ${selected}`)
```
#### Sortable Lists
Drag and drop items in the terminal.

How to use Sortable component?
```js
import { ask, Sortable } from '@nan0web/ui-cli'
const items = ['First', 'Second', 'Third']
console.info(`Order: ${items.join(' > ')}`)
```
### Advanced Interaction

#### Models & Forms
You can pass a Model class to `ask()` to automatically generate and process an interactive form.

How to use ask with Models?
```js
import { ask } from '@nan0web/ui-cli'
class UserProfile {
	static username = { help: 'Enter username', required: true }
	static email = { help: 'Enter email', hint: 'email' }
}
// const profile = await ask(UserProfile)
```
#### AI Agents
You can request an AI agent task using the `agent` intent.
In CLI, this shows a status message and can wrap an async action in a spinner.

How to use ask with Agents?
```js
import { ask } from '@nan0web/ui-cli'
import { agent } from '@nan0web/ui'
// 1. Simple task
// await ask({ type: 'agent', task: 'Review the code' })
// 2. Task with action (shows spinner)
// await ask({ type: 'agent', task: 'Analyzing...', action: async () => 'Success' })
```
### Static Views

#### Alerts

How to render Alerts?
```js
import { ask, Alert } from '@nan0web/ui-cli'
const out = await ask(Alert({ variant: 'success', children: 'Operation completed' }))
```
#### Dynamic Tables

How to render Tables?
```js
import { ask, Table } from '@nan0web/ui-cli'
const data = [{ id: 1, name: 'Alice' }]
const out = await ask(Table({ data, interactive: false }))
```
### Feedback & Progress

#### Spinner

How to use Spinner?
```js
import { ask, Spinner } from '@nan0web/ui-cli'
const action = Promise.resolve('Done')
const result = await ask(Spinner({ UI: 'Loading...', action }))
```
#### Progress Bars

How to use ProgressBar?
```js
import { ask, ProgressBar } from '@nan0web/ui-cli'
const p = await ask(ProgressBar({ UI: 'Downloading...', total: 100 }))
p.update(100)
p.success('Done')
```
## One Logic, Many UI (Generators)

OLMUI Applications are built using Async Generators.
This allows the business logic to remain UI-agnostic by `yield`-ing Intents.

### Rendering Components via yield

You can render any UI component (Alert, Table, etc.) from within your generator
by yielding a `render` intent.

How to render components in a generator?
```js
import { render } from '@nan0web/ui'
async function* myGenerator() {
	// Option 1: Standard Intent
	yield render('Alert', { children: 'Hello from Intent' })
	// Option 2: Using render() helper (Standard in @nan0web/ui)
	yield render('Alert', { children: 'Hello from Helper' })
	// Option 3: Table with data
	yield render('Table', { data: [{ id: 1, name: 'Alice' }], interactive: false })
}
const gen = myGenerator()
const alert1 = await gen.next()
```
### Sub-path Exports (OLMUI)

The package uses "One Logic, Many UI" (OLMUI) architecture, exposing only strict architectural boundaries.

- `import { ModelAsApp } from '@nan0web/ui-cli/domain'` — Domain Base classes.
- `import { App } from '@nan0web/ui-cli/app'` — Main Application Model & Router.
- `import { playground } from '@nan0web/ui-cli/test'` — Testing & Snapshot utilities.

How to use isolated domain models and UI adapters?

## Legacy API

### CLiInputAdapter

How to request form input via CLiInputAdapter?
```js
import { CLiInputAdapter } from '@nan0web/ui-cli'
```
## Playground

How to run the playground?
```bash
npm run play
```

## License

How to check the license? - [ISC LICENSE](./LICENSE) file.

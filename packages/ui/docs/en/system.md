# System Instructions `system.md` / NaN•Web UI

Read the [nan0web global instructions](../../system.md)

Vanilla JavaScript UI interfaces with no platform dependencies.
Must work for Node.js, browser, and other compilers that support ESM.

## Requirements

### 1. JavaScript

1.1. Pure vanilla JS only.
1.2. Platform abstract.
1.3. Minimal dependencies.
1.4. Classes
1.4.1. Order of class elements:

- static properties
- properties
- constructor
- getters
- setters
- base functions
- async functions
- static base functions
- static async functions

1.5. Views and Components:
1.5.1. Must be isolated functions or classes that accept a Data Object (Model).
1.5.2. Every complex visual unit must have its own test file.

### 2. Testing and Verification

Every model, component, and class must have its own test file to cover functionality in an isolated environment.
As of v1.11.0, the primary standard for testing application logic is **ScenarioTest** (deterministic intent testing).

#### node:test

For core (base), CGI, and CLI interfaces, as well as non-JSX web components, use `node:test` with `node:assert/strict`.

## OLMUI Architecture

1. `base` - Core domain models and intents.
2. `cli` - Command-line applications based on `@nan0web/ui-cli`.
3. `web` - Web interfaces based on `Lit` or `React`.
4. `mobile` - Mobile interfaces (Swift/Kotlin).

### Model-as-App and Intents (v1.12.0+)

Application logic is implemented via generators that return **Intents**. This allows the logic to remain entirely independent of the specific input/output method.

#### Input (ask) and Output (show)

Instead of direct interaction with streams (stdin/stdout), the application uses intent generators:

```js
import { ModelAsApp, ask, show, result } from '@nan0web/ui'

class UserOnboardingApp extends ModelAsApp {
  async *run() {
    // 1. Data Request (ask) - the adapter decides how to display this (Input in CLI or Modal in Web)
    const name = yield ask('name', { help: 'Your name', required: true })
    
    if (name.value === 'admin') {
      yield show('Access denied', 'error')
      return result({ ok: false })
    }

    // 2. Notification (show)
    yield show(`Welcome, ${name.value}!`, 'info')

    return result({ ok: true, user: name.value })
  }
}
```

### Views and Data Models

#### Model-as-Schema

We use models as data schemas. Components accept model instances, ensuring data normalization and type safety.

```js
import { HeaderModel } from '@nan0web/ui/models'

// Pure View Component
function HeaderView(model) {
  if (!(model instanceof HeaderModel)) {
    throw new TypeError('HeaderModel expected')
  }
  
  // Rendering based on model properties
  return Frame.from([[model.title, model.logo]])
}
```

## Cross-platform Support (Capability Discovery)

In the **NaN•Web OLMUI** architecture, an application is a collection of models.

1. **App as Source of Truth**: The app exports its capabilities via `static metadata`.
2. **Data-Driven Decoupling**: The UI is decoupled from business logic. It only renders the model state and sends intents back to the orchestrator.

### The y = f(x) Formula

System operation is reduced to:
- **`f` (Logic)** — the `ModelAsApp.run()` generator.
- **`x` (State)** — model constructor data.
- **`y` (Intents)** — the stream of `Intents` (ask, show, render) interpreted by the platform adapter.

This ensures **One Logic (f)** for **Many UI (interfaces)**.

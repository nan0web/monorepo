# Instructions for Using Intents in OLMUI Generator Runners

This document provides a detailed guide for developers on how to use **intents** within OLMUI applications. Intents are the core mechanism for driving user interactions, UI rendering, logging, and result handling in generator-based workflows. They are yielded from generator functions in your app models and processed by the `runGenerator` function in `GeneratorRunner.js`.

## Overview of the Generator Pattern

OLMUI apps use **generator functions** (ES6 generators with `function*`) to define asynchronous, interactive workflows. The entry point is a class or function with a `run(options)` method that returns an iterator. This iterator yields **intents** (objects describing actions) and receives responses via `next(value)`.

### Key Concepts

- **App Entry Model**: The top-level class (e.g., `AppEntryModel`) that lists commands or sub-models. It's used in `runApp` to select and execute a command.
- **Command/Model**: A class or object with a `run(options)` generator method. Instantiate or pass it directly to `runGenerator`.
- **Adapter**: A CLI/UI adapter (e.g., `InputAdapter`) that handles intent execution. It provides methods like `askIntent`, `progressIntent`, etc.
- **Options**: Passed to `run()`, including `t` (translation function) and `db` (database instance).
- **Cancellation**: Use `CancelError` to handle user cancellations. The generator can catch and propagate them.
- **Looping**: `runApp` loops infinitely until a full exit (e.g., cancel at main level).

### Basic Structure of a Generator

```javascript
// Example model class
class MyCommand {
  async *run(options = {}) {
    // Yield intents here
    const response1 = yield { type: 'ask', field: 'name', ... };

    // Process response1
    yield { type: 'show', message: `Hello, ${response1.value}!` };

    // Yield a result
    return { data: 'Final result' }; // This becomes res.value when done
  }
}

// Usage in runApp (excerpt)
const commandToRun = new MyCommand();
await runGenerator(commandToRun, adapter, options);
```

- **Yielding Intents**: Use `yield intentObject` to pause execution and request an action.
- **Receiving Responses**: The next `yield` or `return` receives the previous intent's result via `next(responseValue)`.
- **Errors**: Generators can use `iter.throw(error)` to propagate exceptions. Cancellations are specially handled.
- **Completion**: `return value` ends the generator; `runGenerator` returns `{ success: true, data: value, cancelled: false }`.

If the model is already an iterator (not a `run()` method), pass it directly.

## Intent Types

Intents are plain objects with a required `type` property. Additional properties vary by type. The adapter processes them via switch-case in `runGenerator`. Unhandled intents are passed through as `nextVal`.

### 1. `ask` - User Input Request

Prompts the user for input (e.g., text, selection, validation). Processed by `adapter.askIntent(intent)`.

- **Purpose**: Collect data interactively in CLI/UI (e.g., questions, menus, forms).
- **Required Properties**:
  - `type: 'ask'`
  - `field: string` - Unique identifier for the input (e.g., 'username'). Used to store/retrieve values.
- **Optional Properties**:
  - `schema: Object|Class` - Validation schema (e.g., JSON Schema or model class). If `model: true`, treats `schema` as a full model for sub-selections.
  - `model: boolean` - If true, `schema` is an app model for command selection (used in `runApp`).
  - `label: string` - Display label/prompt (translated via `options.t`).
  - `placeholder: string` - Input hint.
  - `default: any` - Default value.
  - `validate: Function(value): Promise<string|true>` - Custom validator. Returns error message or `true`.
  - `choices: Array` - For select menus (e.g., `{ value: 'opt1', label: 'Option 1' }`).
  - `type: string` - Input type (e.g., 'text', 'number', 'select', 'multiselect', 'password').
  - `required: boolean` - Enforce non-empty input.
  - `retry: boolean|number` - Retry on invalid input (default: true; number limits attempts).

- **Response**: `{ value: any, cancelled: boolean }`. If cancelled, throws `CancelError`.
- **Example**:
  ```javascript
  const userInput = yield {
    type: 'ask',
    field: 'username',
    label: 'Enter your username',
    schema: { type: 'string', minLength: 3 },
    validate: async (val) => val.length >= 3 ? true : 'Too short',
  };
  // userInput.value is the entered value
  ```
- **In App Selection**: For main menu, use `{ type: 'ask', field: 'app', model: true, schema: AppEntryModel }`. `AppEntryModel` should export static methods or properties like `commands: Array<{ name, run }>`.

### 2. `progress` - Progress Indicator

Shows/updates a progress bar or status. Processed by `adapter.progressIntent(intent)`.

- **Purpose**: Display ongoing work (e.g., file processing, API calls).
- **Required Properties**:
  - `type: 'progress'`
- **Optional Properties**:
  - `message: string` - Status text (e.g., 'Downloading...').
  - `progress: number` - 0-100 percentage (if supported).
  - `total: number` - Total steps (for incremental updates).
  - `current: number` - Current step.
  - `indeterminate: boolean` - Spinning loader (no percentage).
  - `start: boolean` - Start a new progress session.
  - `stop: boolean` - End and hide progress.

- **Response**: Usually `undefined` or progress state.
- **Example**:
  ```javascript
  yield { type: 'progress', message: 'Starting...', start: true };
  for (let i = 0; i < 10; i++) {
    // Simulate work
    await sleep(100);
    yield { type: 'progress', current: i + 1, total: 10, message: `Processing ${i + 1}/10` };
  }
  yield { type: 'progress', stop: true };
  ```
- **Notes**: Adapter must implement progress (e.g., via `cli-progress` in CLI). Non-blocking; continue yielding other intents.

### 3. `show` - Logging Output

Logs messages to console/UI. Processed by `adapter.showIntent(intent)`.

- **Purpose**: Output informational, debug, or warning messages without prompting.
- **Required Properties**:
  - `type: 'show'`
- **Optional Properties**:
  - `message: string` - The log text (translated via `t`).
  - `level: string` - 'info' (default), 'error', 'warn', 'debug', 'success'.
  - `data: any` - Additional payload (e.g., object for structured logging).
  - `timestamp: boolean` - Include timestamp (default: true in most adapters).

- **Response**: `undefined`. Non-blocking.
- **Example**:
  ```javascript
  yield { type: 'show', message: 'Installation started', level: 'info' };
  if (error) {
    yield { type: 'show', message: error.message, level: 'error' };
  }
  ```
- **Notes**: Use `adapter.console` directly for simple cases, but intents allow adapter-specific formatting (e.g., colors in CLI).

### 4. `render` or `renderComponent` - UI Rendering

Renders a component or static content. Processed by `adapter.render(component, props)`.

- **Purpose**: Display custom UI elements (e.g., tables, charts) in supported adapters (e.g., web/TUI).
- **Required Properties**:
  - `type: 'render'` or `'renderComponent'`
- **Optional Properties** (for both):
  - `component: string|Function` - Component name (string) or JSX/factory function.
  - `props: Object` - Data passed to the component (e.g., `{ items: [...] }`).
- **Differences**:
  - `render`: For simple/static renders (e.g., markdown, HTML string).
  - `renderComponent`: For interactive/reusable components (e.g., React-like).

- **Response**: `undefined`. Adapter must support `render` method.
- **Fallback**: Not all adapters have it; gracefully ignore if missing.
- **Example**:
  ```javascript
  yield {
    type: 'renderComponent',
    component: 'UserTable',
    props: { users: fetchedUsers }
  };
  ```
- **Notes**: In CLI adapters, this might fall back to text rendering (e.g., via `ink` or ASCII tables). Ensure components are registered in the adapter.

### 5. `result` - Final Result Display

Displays the workflow's output. Processed by `adapter.resultIntent(intent)` or fallback to console.

- **Purpose**: Show success/error results at the end or milestones.
- **Required Properties**:
  - `type: 'result'`
- **Optional Properties**:
  - `data: any` - The result (string, object, array). Auto-JSON.stringified if object.
  - `success: boolean` - True for green/success styling.
  - `message: string` - Summary text.
  - `format: string` - 'json', 'yaml', 'text' (default: auto-detect).

- **Response**: `undefined`.
- **Fallback**: If no `resultIntent`, prints `JSON.stringify(data, null, 2)` or `String(data)`.
- **Example**:
  ```javascript
  // At end of generator
  return { success: true, data: { files: generatedFiles } };
  // Or yield interim
  yield { type: 'result', data: 'Partial results', message: 'Check output' };
  ```
- **Notes**: Use `return value` for final results; it triggers implicit success. For errors, throw or use show.

## Handling Cancellations and Errors

- **CancelError**: Imported from `@nan0web/ui/core`. Throw it to cancel (e.g., `throw new CancelError('Aborted')` in validator).
- **Detection**: `runGenerator` catches cancellations and returns `{ cancelled: true }`. In `runApp`, main-level cancel exits the loop.
- **Propagation**: In switch-case, cancellations set `isThrowing = true` and call `iter.throw(error)`.
- **User Cancels**: `askIntent` returns `{ cancelled: true }` on ESC/quit; throws `CancelError`.
- **Best Practice**: Always check `res.cancelled` after asks and throw/handle accordingly.

## App Entry Model Structure

For top-level selection in `runApp`:

```javascript
class AppEntryModel {
  static get commands() {
    return [
      { name: 'generate', label: 'Generate Code', command: MyGeneratorCommand },
      {
        name: 'analyze',
        label: 'Analyze Project',
        run:
          async *
          function* () {
            /* inline generator */
          },
      },
    ]
  }
}
```

- Selection yields `{ value: { command, ... } }`.
- Supports functions (instantiate), classes (new), or direct `{ run: generator }`.

## Tips for Developers

- **Testing**: Mock the adapter for unit tests. Simulate yields with manual `next()`.
- **Translation**: Use `options.t(key)` for i18n; set `adapter.t = t`.
- **Performance**: Generators are async; use `await` inside for I/O.
- **Debugging**: Yield `show` intents for traces. Check `res.value` for intent results.
- **Extensibility**: Add custom intent types in your adapter; `runGenerator` passes unknown types as `nextVal`.
- **Limitations**: No parallel yields (single-threaded). For complex flows, chain generators.
- **Common Pitfalls**:
  - Forgetting `yield` before processing responses.
  - Not handling `cancelled` in asks.
  - Mismatched `field` names across intents.
  - Adapters may vary (CLI vs. Web); test accordingly.

For more on adapters, see `InputAdapter.js`. If extending `runGenerator`, preserve the intent switch-case. Contact the OLMUI team for adapter-specific details.

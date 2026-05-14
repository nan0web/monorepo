# @nan0web/event

<!-- %PACKAGE_STATUS% -->

An agnostic and extendable event system for JavaScript environments.
Provides clean interfaces for emitting and handling events with context support.

Built for [nan0web philosophy](https://github.com/nan0web/monorepo/blob/main/system.md#nanweb-nan0web):
where minimal code leads to maximum outcome while being kind to CPU and memory.

## Installation

How to install with npm?

```bash
npm install @nan0web/event
```

How to install with pnpm?

```bash
pnpm add @nan0web/event
```

How to install with yarn?

```bash
yarn add @nan0web/event
```

## Usage

### Basic Event Emitter

Create an event bus instance and listen to custom events.

How to create basic event bus and listen for messages?

```js
import event from '@nan0web/event'
const bus = event()
let messageReceived = false
bus.on('message', (ctx) => {
  messageReceived = true
  console.info(`Received: ${ctx.data.text}`)
})
await bus.emit('message', { text: 'Hello world!' })
```

### Prevent Default Behavior

Cancel further propagation with `preventDefault`.

How to prevent default event handling in listener?

```js
import event from '@nan0web/event'
const bus = event()
let callCount = 0
bus.on('stop', (ctx) => {
  callCount++
  ctx.preventDefault()
})
bus.on('stop', () => {
  callCount++
})
const result = await bus.emit('stop', {})
```

### Command Pipeline with Events

Commands support a full execution pipeline including `before`, `success`, and `error` stages.
Context is not passing to the next executtion inside the loop.

How to use command with pipeline events?

```js
import { createCommand } from '@nan0web/event/command'
const countCommand = createCommand('count', async (ctx) => {
  ctx.meta.totalCount = (ctx.meta.totalCount || 0) + 1
  console.info(`Progress ${ctx.data.iteration}: ${ctx.meta.totalCount} events processed`)
})
countCommand.on('before', () => {
  console.info('Counter started')
})
for (let i = 0; i < 2; i++) {
  await countCommand.execute({ iteration: i })
}
```

### Custom Event Class (OOP Style)

Extend `Event` class to create your own custom event systems.

How to extend Event class for custom event bus?

```js
import Event from '@nan0web/event/oop'
class TestEvent extends Event {
  async ping() {
    return await this.emit('ping', {})
  }
}
const instance = new TestEvent()
let received = false
instance.on('ping', () => {
  received = true
})
await instance.ping()
```

### Event Context Manipulation

`EventContext` provides a rich interface to represent event data.

How to manipulate and clone event contexts?

```js
import { EventContext } from '@nan0web/event'
const ctx = EventContext.from({
  type: 'message',
  data: { text: 'ping' },
  meta: { id: 1 },
})
const clone = ctx.clone()
clone.data.ping = true
console.info(ctx.data) // { text: "ping" }
console.info(clone.data) // { text: "ping", ping: true }
// Compare only the logged output as expected
```

## API

### `event()`

Creates a new event emitter instance using the memory adapter.

- **Methods**
  - `on(event, listener)` – register an event listener
  - `off(event, listener)` – unregister an event listener
  - `emit(event, data)` – trigger an event with data

### `createCommand(name, handler)`

- **Methods**
  - `on(event, listener)` – register a pipeline event
  - `off(event, listener)` – remove a pipeline event
  - `execute(data)` – run the command and trigger its pipeline

### `EventContext`

Context passed to every listener.

- **Properties**
  - `type` – event type
  - `name` – command name (if used)
  - `data` – event data
  - `meta` – event metadata
  - `error` – error context (if any)
  - `defaultPrevented` – indicates whether preventDefault was called

- **Methods**
  - `preventDefault()` – stop propagation of the event
  - `clone()` – creates a copy of the event context
  - `static from(input)` – build context from input object or another context

### `Event` (OOP Class)

Base class for encapsulating event behavior.

- **Methods**
  - `on(event, listener)` – subscribe to event
  - `off(event, listener)` – unsubscribe from event
  - `emit(event, data)` – emit event with data

/\*\*
@docs

## Playground

How to run playground script?

```bash
# Clone the repository and run the CLI playground
git clone https://github.com/nan0web/event.git
cd event
npm install
npm run play
```

## Java•Script

Provides full autocomplete support via `.d.ts` types.

Uses `d.ts` files for autocompletion

## Contributing

How to contribute? - [check here](./CONTRIBUTING.md)

## License

How to license ISC? - [check here](./LICENSE)

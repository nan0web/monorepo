import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DocsParser, DatasetParser, runSpawn } from '@nan0web/test'
import event, { EventContext } from './index.js'
import { createCommand } from './command.js'
import Event from './oop.js'

const fs = new DB()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/event
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * An agnostic and extendable event system for JavaScript environments.
	 * Provides clean interfaces for emitting and handling events with context support.
	 *
	 * Built for [nan0web philosophy](https://github.com/nan0web/monorepo/blob/main/system.md#nanweb-nan0web):
	 * where minimal code leads to maximum outcome while being kind to CPU and memory.
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/event
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/event')
	})
	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/event
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/event')
	})
	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/event
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/event')
	})

	/**
	 * @docs
	 * ## Usage
	 *
	 * ### Basic Event Emitter
	 *
	 * Create an event bus instance and listen to custom events.
	 */
	it('How to create basic event bus and listen for messages?', async () => {
		//import event from "@nan0web/event"
		const bus = event()
		let messageReceived = false

		bus.on('message', (ctx) => {
			messageReceived = true
			console.info(`Received: ${ctx.data.text}`)
		})

		await bus.emit('message', { text: 'Hello world!' })

		assert.strictEqual(messageReceived, true)
		assert.deepStrictEqual(console.output(), [['info', 'Received: Hello world!']])
	})

	/**
	 * @docs
	 * ### Prevent Default Behavior
	 *
	 * Cancel further propagation with `preventDefault`.
	 */
	it('How to prevent default event handling in listener?', async () => {
		//import event from "@nan0web/event"
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
		assert.strictEqual(result.defaultPrevented, true)
		assert.strictEqual(callCount, 1)
	})

	/**
	 * @docs
	 * ### Command Pipeline with Events
	 *
	 * Commands support a full execution pipeline including `before`, `success`, and `error` stages.
	 * Context is not passing to the next executtion inside the loop.
	 */
	it('How to use command with pipeline events?', async () => {
		//import { createCommand } from "@nan0web/event/command"

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

		assert.ok(console.output()[0][1].includes('started'))
		assert.ok(console.output()[1][1].includes('Progress 0: 1'))
		assert.ok(console.output()[2][1].includes('started'))
		assert.ok(console.output()[3][1].includes('Progress 1: 1'))
	})

	/**
	 * @docs
	 * ### Custom Event Class (OOP Style)
	 *
	 * Extend `Event` class to create your own custom event systems.
	 */
	it('How to extend Event class for custom event bus?', async () => {
		//import Event from "@nan0web/event/oop"

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

		assert.strictEqual(received, true)
	})

	/**
	 * @docs
	 * ### Event Context Manipulation
	 *
	 * `EventContext` provides a rich interface to represent event data.
	 */
	it('How to manipulate and clone event contexts?', () => {
		//import { EventContext } from "@nan0web/event"

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
		assert.deepStrictEqual(console.output()[0][1], { text: 'ping' })
		assert.deepStrictEqual(console.output()[1][1], { text: 'ping', ping: true })
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### `event()`
	 *
	 * Creates a new event emitter instance using the memory adapter.
	 *
	 * * **Methods**
	 *   * `on(event, listener)` – register an event listener
	 *   * `off(event, listener)` – unregister an event listener
	 *   * `emit(event, data)` – trigger an event with data
	 *
	 * ### `createCommand(name, handler)`
	 *
	 * * **Methods**
	 *   * `on(event, listener)` – register a pipeline event
	 *   * `off(event, listener)` – remove a pipeline event
	 *   * `execute(data)` – run the command and trigger its pipeline
	 *
	 * ### `EventContext`
	 *
	 * Context passed to every listener.
	 *
	 * * **Properties**
	 *   * `type` – event type
	 *   * `name` – command name (if used)
	 *   * `data` – event data
	 *   * `meta` – event metadata
	 *   * `error` – error context (if any)
	 *   * `defaultPrevented` – indicates whether preventDefault was called
	 *
	 * * **Methods**
	 *   * `preventDefault()` – stop propagation of the event
	 *   * `clone()` – creates a copy of the event context
	 *   * `static from(input)` – build context from input object or another context
	 *
	 * ### `Event` (OOP Class)
	 *
	 * Base class for encapsulating event behavior.
	 *
	 * * **Methods**
	 *   * `on(event, listener)` – subscribe to event
	 *   * `off(event, listener)` – unsubscribe from event
	 *   * `emit(event, data)` – emit event with data
	 */

	/**
	 * @docs
	 * ## Playground
	 */
	it('How to run playground script?', async () => {
		/**
		 * ```bash
		 * # Clone the repository and run the CLI playground
		 * git clone https://github.com/nan0web/event.git
		 * cd event
		 * npm install
		 * npm run play
		 * ```
		 */
		assert.ok(String(pkg.scripts?.play))
		const response = await runSpawn('git', ['remote', 'get-url', 'origin'])
		assert.ok(response.code === 0, 'git command fails (e.g., not in a git repo)')
		assert.ok(response.text.trim().includes('github-nan0web:nan0web/'))
	})

	/**
	 * @docs
	 * ## Java•Script
	 *
	 * Provides full autocomplete support via `.d.ts` types.
	 */
	it('Uses `d.ts` files for autocompletion', () => {
		assert.equal(pkg.types, './types/index.d.ts')
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? - [check here](./CONTRIBUTING.md)', async () => {
		assert.equal(pkg.scripts?.precommit, 'npm test')
		assert.equal(pkg.scripts?.prepush, 'npm test')
		assert.equal(pkg.scripts?.prepare, 'husky')
		const text = await fs.loadDocument('CONTRIBUTING.md')
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license ISC? - [check here](./LICENSE)', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	let text = ''
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument('README.md')
		assert.ok(text.includes('## License'))
	})
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { LLMAgent } from './logic.js'

test('LLMAgent - Quality Gates & Self-Healing Loop', async (t) => {
	await t.test('passes when all gates succeed', async () => {
		const runner = {
			async checkFile(f) {
				return { ok: true, errors: [] }
			},
			async prettyFile(f) {
				return { ok: true, errors: [] }
			},
			async testFile(f) {
				return { ok: true, errors: [] }
			},
			async buildFile(f) {
				return { ok: true, errors: [] }
			},
			async testProject(chat) {
				return { ok: true, errors: [] }
			},
		}
		const inspector = {
			async inspectProject(chat) {
				return { ok: true, errors: [] }
			},
		}

		let createdChat = null
		class TestAgent extends LLMAgent {
			createChat(input) {
				createdChat = super.createChat(input)
				return createdChat
			}
			async *processChat(chat) {
				return { files: ['src/index.js', 'src/index.test.js'], chat }
			}
		}

		const agent = new TestAgent({ skipPreflight: true }, { runner, inspector })
		const gen = agent.run()

		let step = await gen.next()
		// UI starting
		assert.equal(step.value.type, 'show')

		step = await gen.next()
		// Finished
		assert.equal(step.done, true)
		assert.equal(step.value.data.ok, true)
		assert.equal(step.value.data.errors.length, 0)
		assert.deepEqual(createdChat?.context.files, ['src/index.js', 'src/index.test.js'])
	})

	await t.test('detects syntax error, retries and succeeds on next attempt', async () => {
		let attempt = 0
		const runner = {
			async checkFile(f) {
				if (attempt === 1) {
					return { ok: false, errors: ['SyntaxError: Unexpected token ;'] }
				}
				return { ok: true, errors: [] }
			},
			async prettyFile(f) {
				return { ok: true, errors: [] }
			},
			async testFile(f) {
				return { ok: true, errors: [] }
			},
			async buildFile(f) {
				return { ok: true, errors: [] }
			},
			async testProject(chat) {
				return { ok: true, errors: [] }
			},
		}

		class HealingAgent extends LLMAgent {
			async *processChat(chat) {
				attempt++
				return { files: ['src/broken.js'], chat }
			}
		}

		const agent = new HealingAgent({ skipPreflight: true }, { runner })
		const gen = agent.run()

		// 1. show starting
		let step = await gen.next()
		assert.equal(step.value.type, 'show')

		// 2. show error warning on first attempt
		step = await gen.next()
		assert.equal(step.value.type, 'show')
		assert.match(step.value.message, /Errors were found/i)

		// 3. second attempt succeeds
		step = await gen.next()
		assert.equal(step.done, true)
		assert.equal(step.value.data.ok, true)
		assert.equal(attempt, 2)
	})

	await t.test('fails pre-flight check if base project tests are broken', async () => {
		const runner = {
			async testFile(f) {
				return { ok: false, errors: ['Pre-existing broken test'] }
			},
		}

		class BrokenBaseAgent extends LLMAgent {
			async *collectContext(chat) {
				chat.context.files = ['tests/existing.test.js']
			}
		}

		const agent = new BrokenBaseAgent({ skipPreflight: false }, { runner })
		const gen = agent.run()

		// show starting
		await gen.next()
		// show preflightFailed
		const errorStep = await gen.next()
		assert.equal(errorStep.value.type, 'show')
		assert.equal(errorStep.value.level, 'error')

		const resultStep = await gen.next()
		assert.equal(resultStep.done, true)
		assert.equal(resultStep.value.data.ok, false)
		assert.match(resultStep.value.data.errors[0], /Pre-existing broken test/)
	})
})

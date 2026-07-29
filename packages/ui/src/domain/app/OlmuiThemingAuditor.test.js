import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { LogicInspector } from '../../testing/LogicInspector.js'
import { OlmuiThemingAuditor } from './OlmuiThemingAuditor.js'

describe('OlmuiThemingAuditor', () => {
	it('passes cleanly when style custom properties use --0- namespace with fallbacks', async () => {
		const db = new DB({
			predefined: [
				[
					'src/components/ValidComponent.js',
					`
					static styles = css\`
						:host {
							background: var(--0-bg-glass, rgba(255, 255, 255, 0.03));
							border: 1px solid var(--0-border-subtle, rgba(255, 255, 255, 0.1));
							padding: var(--0-spacing-lg, 1.5rem);
							border-radius: var(--0-radius-md, 12px);
						}
					\`
					`,
				],
			],
		})
		await db.connect()

		const auditor = new OlmuiThemingAuditor({ dir: '.' }, { db })
		await auditor.init()

		const intents = await LogicInspector.capture(auditor.run())

		const resultIntent = intents.find((i) => i.type === 'result')
		assert.ok(resultIntent)
		assert.equal(resultIntent.data.ok, true)
	})

	it('detects raw color codes (hex, rgb, rgba) not wrapped inside var()', async () => {
		const db = new DB({
			predefined: [
				[
					'src/components/DirtyColor.js',
					`
					static styles = css\`
						.box {
							background: #ff0055;
							border-color: rgb(0, 0, 0);
							color: rgba(255, 255, 255, 0.8);
						}
					\`
					`,
				],
			],
		})
		await db.connect()

		const auditor = new OlmuiThemingAuditor({ dir: '.' }, { db })
		await auditor.init()

		const intents = await LogicInspector.capture(auditor.run())

		const resultIntent = intents.find((i) => i.type === 'result')
		assert.ok(resultIntent)
		assert.equal(resultIntent.data.ok, false)

		const errors = resultIntent.data.errors
		assert.ok(errors.length >= 3)
		assert.ok(errors.some((e) => e.error.includes('#ff0055')))
		assert.ok(errors.some((e) => e.error.includes('rgb(')))
		assert.ok(errors.some((e) => e.error.includes('rgba(')))
	})

	it('detects raw size codes (px, rem, em) not wrapped inside var()', async () => {
		const db = new DB({
			predefined: [
				[
					'src/components/DirtySize.js',
					`
					static styles = css\`
						.box {
							margin: 12px;
							padding: 1.5rem;
							font-size: 2em;
						}
					\`
					`,
				],
			],
		})
		await db.connect()

		const auditor = new OlmuiThemingAuditor({ dir: '.' }, { db })
		await auditor.init()

		const intents = await LogicInspector.capture(auditor.run())

		const resultIntent = intents.find((i) => i.type === 'result')
		assert.ok(resultIntent)
		assert.equal(resultIntent.data.ok, false)

		const errors = resultIntent.data.errors
		assert.ok(errors.length >= 3)
		assert.ok(errors.some((e) => e.error.includes('12px')))
		assert.ok(errors.some((e) => e.error.includes('1.5rem')))
		assert.ok(errors.some((e) => e.error.includes('2em')))
	})

	it('ignores safe size values such as 0, 1px, 50%', async () => {
		const db = new DB({
			predefined: [
				[
					'src/components/SafeBorder.js',
					`
					static styles = css\`
						.avatar {
							margin: 0;
							border: 1px solid var(--0-border-subtle);
							border-radius: 50%;
						}
					\`
					`,
				],
			],
		})
		await db.connect()

		const auditor = new OlmuiThemingAuditor({ dir: '.' }, { db })
		await auditor.init()

		const intents = await LogicInspector.capture(auditor.run())

		const resultIntent = intents.find((i) => i.type === 'result')
		assert.ok(resultIntent)
		assert.equal(resultIntent.data.ok, true)
	})
})

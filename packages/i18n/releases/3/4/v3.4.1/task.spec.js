import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { I18nInspector } from '../../../../src/inspect/I18nInspector.js'

describe('Release v3.4.1 Contract: I18nInspector EXCLUDE_DIRS', () => {
	it('should skip releases, data, docs, coverage, tmp directories during scan', async () => {
		const db = new DB({
			predefined: [
				['@app/src/index.js', 'export const ok = true'],
				['@app/releases/3/8/v3.8.0/task.spec.js', "t('missing_in_releases')"],
				['@app/data/uk/_/t.yaml', 'hello: Привіт'],
				['@app/docs/guide.js', "t('missing_in_docs')"],
			],
		})
		await db.connect()

		const inspector = new I18nInspector({ dir: '.' }, { db, locale: 'uk' })
		const events = []
		let finalResult
		const gen = inspector.run()
		while (true) {
			const { value, done } = await gen.next()
			if (done) {
				finalResult = value
				break
			}
			events.push(value)
		}

		const status = finalResult?.data?.ok ?? finalResult?.value?.ok ?? finalResult?.ok
		assert.equal(status, true, 'I18nInspector must ignore releases/ and docs/ and pass')
	})
})

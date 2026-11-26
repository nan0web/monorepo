import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '../../../../src/DB/DB.js'

describe('DB v3.6.1 — fetch cache & inheritance contract', () => {
	const predefined = [
		['_.yaml', { site: 'Bank', theme: 'light' }],
		['_/nav.yaml', { items: ['Home', 'Cards'] }],
		['uk/_.yaml', { lang: 'uk' }],
		['uk/_/contacts.yaml', { phone: '0800' }],
		['uk/shared/terms.yaml', { fee: '0%' }],
		['uk/news/a.yaml', { title: 'A', terms: { $ref: '/uk/shared/terms.yaml' } }],
		['uk/news/b.yaml', { title: 'B', terms: { $ref: '/uk/shared/terms.yaml' } }],
		['uk/news/c.yaml', { title: 'C', terms: { $ref: '/uk/shared/terms.yaml' } }],
	]

	it('читає базові/глобальні/ref файли 1 раз для всіх документів однієї директорії та інвалідує при записі', async () => {
		const db = new DB({ predefined: new Map(predefined) })
		await db.connect()

		let loadCalls = 0
		let readDirCalls = 0
		const origLoad = db.loadDocument.bind(db)
		const origReadDir = db.readDir.bind(db)

		db.loadDocument = async (...args) => {
			loadCalls++
			return origLoad(...args)
		}
		db.readDir = (...args) => {
			readDirCalls++
			return origReadDir(...args)
		}

		// 1. Перше читання a.yaml (прогрів кешу директорії та $ref)
		const a = await db.fetch('uk/news/a.yaml')
		const afterFirstReadDirs = readDirCalls
		const afterFirstLoads = loadCalls

		// 2. Читання b.yaml та c.yaml в тій самій директорії — 0 нових readDir, тільки 2 loadDocument
		const [b, c] = await Promise.all([
			db.fetch('uk/news/b.yaml'),
			db.fetch('uk/news/c.yaml'),
		])

		for (const [doc, title] of [
			[a, 'A'],
			[b, 'B'],
			[c, 'C'],
		]) {
			assert.equal(doc.title, title)
			assert.equal(doc.site, 'Bank')
			assert.equal(doc.lang, 'uk')
			assert.deepEqual(doc.nav, { items: ['Home', 'Cards'] })
			assert.deepEqual(doc.contacts, { phone: '0800' })
			assert.equal(doc.terms.fee, '0%')
		}

		assert.equal(
			readDirCalls,
			afterFirstReadDirs,
			'Для b.yaml та c.yaml у тій самій директорії readDir не має викликатись повторно'
		)
		assert.equal(
			loadCalls,
			afterFirstLoads + 2,
			'Для b.yaml та c.yaml мають завантажуватись лише самі документи (без повторного _.yaml, _/*, $ref)'
		)

		// 3. Повторне читання тих самих документів — 0 нових зчитувань
		const beforeRepeatLoads = loadCalls
		await db.fetch('uk/news/a.yaml')
		await db.fetch('uk/news/b.yaml')
		assert.equal(loadCalls, beforeRepeatLoads, 'Повторний fetch не має викликати loadDocument')
		assert.equal(readDirCalls, afterFirstReadDirs, 'Повторний fetch не має викликати readDir')

		// 3. Захист від мутації кешу
		a.title = 'MUTATED'
		const aFresh = await db.fetch('uk/news/a.yaml')
		assert.equal(aFresh.title, 'A')

		// 4. Інвалідація кешу при збереженні
		await db.saveDocument('uk/news/a.yaml', { title: 'A-updated' })
		const a2 = await db.fetch('uk/news/a.yaml')
		assert.equal(a2.title, 'A-updated')
		assert.equal(a2.site, 'Bank')
	})
})

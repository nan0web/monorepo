import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { SignApp } from './SignApp.js'

describe('SignApp (nan0vault sign)', () => {
	it('resolves inherited _.nan0 config, injects stamp & QR, generates pdf, sha256, and pgp sig', async () => {
		const db = new DB()
		await db.connect()

		// Root _.nan0 config (inherited)
		await db.saveDocument('_.nan0', {
			sign: {
				pgp: { key_id: 'ABC12345' },
				qr: { base_url: 'https://ipfs.io/ipfs/' },
			},
		})

		// Case-level _.nan0 config (overrides stamp & output)
		await db.saveDocument('cases/kyivstar/_.nan0', {
			sign: {
				assets: {
					stamp: {
						src: 'assets/stamp.svg',
						width: '200px',
						height: '200px',
					},
				},
				output: 'cases/kyivstar/publish',
			},
		})

		// Stamp asset & source markdown
		await db.saveDocument('cases/kyivstar/index', {})
		await db.saveDocument('cases/kyivstar/assets/stamp.svg', '<svg><circle r="10"/></svg>')
		await db.saveDocument(
			'cases/kyivstar/notice.md',
			'# Sovereign Notice\n\nText of notice.\n\n<!-- STAMP -->\n<!-- QR -->'
		)

		const pdfCalls = []
		const pgpCalls = []

		const app = new SignApp(
			{ file: 'cases/kyivstar/notice.md' },
			{
				db,
				pdf: {
					render: async (htmlOrMd, outPath) => {
						pdfCalls.push({ htmlOrMd, outPath })
						return Buffer.from('%PDF-1.4 mock')
					},
				},
				pgp: {
					sign: async (pdfBuffer, keyId) => {
						pgpCalls.push({ size: pdfBuffer.length, keyId })
						return '-----BEGIN PGP SIGNATURE-----\nMOCK\n-----END PGP SIGNATURE-----'
					},
				},
				sha256: () => 'mock-sha256-hash',
			}
		)

		const gen = app.run()
		let step = await gen.next()
		while (!step.done) step = await gen.next()
		const result = step.value

		assert.equal(result.config.pgp.key_id, 'ABC12345')
		assert.equal(result.config.assets.stamp.src, 'assets/stamp.svg')
		assert.equal(result.config.assets.stamp.width, '200px')
		assert.equal(result.pdfPath, 'cases/kyivstar/publish/notice.pdf')
		assert.equal(result.sigPath, 'cases/kyivstar/publish/notice.pdf.asc')

		assert.equal(pdfCalls.length, 1)
		assert.ok(pdfCalls[0].htmlOrMd.includes('<svg><circle r="10"/></svg>'))
		assert.ok(pdfCalls[0].htmlOrMd.includes('https://ipfs.io/ipfs/'))

		assert.equal(pgpCalls.length, 1)
		assert.equal(pgpCalls[0].keyId, 'ABC12345')

		const savedSig = await db.loadDocument('cases/kyivstar/publish/notice.pdf.asc')
		assert.ok(String(savedSig).includes('BEGIN PGP SIGNATURE'))
	})

	it('generates QES .pdf.p7s signature when qes.enabled is true and $qes driver is provided', async () => {
		const db = new DB()
		await db.connect()

		await db.saveDocument('_.nan0', {
			sign: {
				qes: {
					enabled: true,
					provider: 'eu-sign',
					format: 'p7s',
				},
			},
		})
		await db.saveDocument('index', {})
		await db.saveDocument('doc.md', '# QES Document')

		const qesCalls = []
		const app = new SignApp(
			{ file: 'doc.md' },
			{
				db,
				pdf: { render: async () => Buffer.from('%PDF-1.4') },
				qes: {
					sign: async (pdfBuffer, qesConfig) => {
						qesCalls.push({ size: pdfBuffer.length, provider: qesConfig.provider })
						return Buffer.from('MOCK-P7S-BINARY')
					},
				},
			}
		)

		const gen = app.run()
		let step = await gen.next()
		while (!step.done) step = await gen.next()
		const result = step.value

		assert.equal(result.qesPath, './doc.pdf.p7s')
		assert.equal(qesCalls.length, 1)
		assert.equal(qesCalls[0].provider, 'eu-sign')
		const savedQes = await db.loadDocument('doc.pdf.p7s')
		assert.ok(Buffer.from(savedQes).toString().includes('MOCK-P7S-BINARY'))
	})
})

import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs/promises'
import path from 'node:path'
import DB from '@nan0web/db'
import { NoConsole } from '@nan0web/log'
import nan0webVitePlugin, { buildSite } from './plugin.js'

const testDirs = ['public', 'dist']

describe('nan0webVitePlugin', () => {
	let inputDB, outputDB, plugin, tempDir

	beforeEach(async () => {
		tempDir = path.resolve(process.cwd(), '.temp_test_dir')

		for (const dir of testDirs) {
			await fs.mkdir(path.join(tempDir, dir), { recursive: true })
		}

		await fs.writeFile(
			path.join(tempDir, 'public', 'public-test.json'),
			JSON.stringify({ from: 'public' }),
		)
		await fs.writeFile(
			path.join(tempDir, 'public', 'favicon.svg'),
			'<svg xmlns="http://www.w3.org/2000/svg"></svg>',
		)
		await fs.writeFile(
			path.join(tempDir, 'dist', 'dist-test.json'),
			JSON.stringify({ from: 'dist' }),
		)

		inputDB = new DB({
			console: new NoConsole({ prefix: '[Input DB]' }),
			predefined: [
				['index.html', '<html><body>Hello</body></html>'],
				['_.yaml', { $host: 'localhost' }],
				['data/test.json', { message: 'test data' }],
				['nested/deep.json', { value: 42 }],
				['data/contacts.json', { name: 'Test Contact' }],
			],
		})
		outputDB = new DB({
			console: new NoConsole({ prefix: '[Output DB]' }),
		})

		await inputDB.connect()
		await outputDB.connect()

		plugin = nan0webVitePlugin({
			input: inputDB,
			output: outputDB,
			staticDirs: testDirs.map((dir) => path.join(tempDir, dir)),
			logger: new NoConsole(),
		})
	})

	afterEach(async () => {
		await inputDB.disconnect()
		await outputDB.disconnect()

		for (const dir of testDirs) {
			try {
				await fs.rm(path.join(tempDir, dir), { recursive: true, force: true })
			} catch {}
		}

		try {
			await fs.rm(tempDir, { recursive: true, force: true })
		} catch {}
	})

	it('should generate static files on build', async () => {
		assert.ok(plugin)
		await buildSite(inputDB, outputDB, new NoConsole())

		const testDoc = await outputDB.loadDocument('data/test.json')
		const contactsDoc = await outputDB.loadDocument('data/contacts.json')

		assert.deepStrictEqual(testDoc, { message: 'test data' })
		assert.deepStrictEqual(contactsDoc, { name: 'Test Contact' })
	})

	it.skip('should handle static files correctly', async () => {
		const middlewares = []
		const mockServer = {
			middlewares: {
				use: (fn) => middlewares.push(fn),
			},
		}

		plugin.configureServer(mockServer)

		assert.strictEqual(middlewares.length, 1)
		const middleware = middlewares[0]

		{
			const [req, res] = createMockReqRes('/data/contacts.json')
			let nextCalled = false
			await wrapMiddleware(middleware, req, res, () => {
				nextCalled = true
			})

			if (!nextCalled) {
				assert.strictEqual(res._headers['content-type'], 'application/json')
				assert.deepStrictEqual(JSON.parse(res._data), { name: 'Test Contact' })
			} else {
				assert.fail('Middleware should respond with JSON data')
			}
		}

		{
			const [req, res] = createMockReqRes('/not-exists.json')
			let nextCalled = false
			await wrapMiddleware(middleware, req, res, () => {
				nextCalled = true
			})

			assert.strictEqual(nextCalled, true)
		}
	})
})

/**
 * Wrap middleware helper
 * @param {Function} middleware Testing middleware
 * @param {Object} req Mock input request
 * @param {Object} res Mock response
 * @param {Function} [next]
 * @returns {Promise<void>}
 */
function wrapMiddleware(middleware, req, res, next) {
	return new Promise((resolve) => {
		const originalEnd = res.end
		res.end = function (...args) {
			originalEnd.apply(this, args)
			resolve()
			return this
		}
		const nextWrapper = next
			? (err) => {
					next(err)
					resolve()
				}
			: () => resolve()
		middleware(req, res, nextWrapper)
		if (res.finished) {
			resolve()
		}
	})
}

function createMockReqRes(url = '/') {
	return [
		{
			url: url,
			headers: { accept: '*/*' },
			method: 'GET',
		},
		{
			_headers: {},
			_data: null,
			statusCode: 0,
			finished: false,
			_hasCalledNext: false,
			setHeader: function (name, value) {
				this._headers[name.toLowerCase()] = value
			},
			getHeader: function (name) {
				return this._headers[name.toLowerCase()]
			},
			end: function (data) {
				this._data = data
				this.finished = true
				return this
			},
		},
	]
}

import { it, describe } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '../../../../../index.js'

describe('Release v1.4.1: Mount Architecture Security', () => {
	describe('1. seal() — Sealed mount registry', () => {
		it('seal() blocks further mount() calls', () => {
			const root = new DB()
			root.seal()
			assert.throws(() => root.mount('cache', new DB()), {
				message: /Mount registry is sealed/,
			})
		})

		it('seal() blocks further unmount() calls', () => {
			const root = new DB()
			const cache = new DB()
			root.mount('cache', cache)
			root.seal()
			assert.throws(() => root.unmount('cache'), {
				message: /Mount registry is sealed/,
			})
		})

		it('sealed getter returns false before seal() call', () => {
			const root = new DB()
			assert.strictEqual(root.sealed, false)
		})

		it('sealed getter returns true after seal() call', () => {
			const root = new DB()
			root.seal()
			assert.strictEqual(root.sealed, true)
		})

		it('mount() works normally before seal()', () => {
			const root = new DB()
			const home = new DB()
			root.mount('~', home)
			assert.strictEqual(root.mounts.size, 1)
			root.seal()
			assert.strictEqual(root.mounts.size, 1)
		})

		it('existing mounts remain functional after seal()', async () => {
			const root = new DB()
			const home = new DB()
			await home.connect()
			await home.set('zones', [{ name: 'Balcony' }])

			root.mount('~', home)
			root.seal()

			const data = await root.get('~/zones')
			assert.deepStrictEqual(data, [{ name: 'Balcony' }])
		})
	})

	describe('2. Error contract — _findMount() for reserved prefixes', () => {
		it('throws Error for unmounted ~ prefix', () => {
			const root = new DB()
			assert.throws(() => root._findMount('~/zones'), {
				message: /Mount point "~" not found.*Did you forget to call db\.mount/,
			})
		})

		it('throws Error for unmounted @private prefix', () => {
			const root = new DB()
			assert.throws(() => root._findMount('@private/wallet'), {
				message: /Mount point "@private" not found.*Did you forget to call db\.mount/,
			})
		})

		it('returns null for regular unmounted paths (fallback)', () => {
			const root = new DB()
			const result = root._findMount('some/regular/path')
			assert.strictEqual(result, null)
		})

		it('does NOT throw Error for ~ when it is mounted', () => {
			const root = new DB()
			const home = new DB()
			root.mount('~', home)
			const result = root._findMount('~/zones')
			assert.ok(result)
			assert.strictEqual(result.db, home)
		})
	})
})

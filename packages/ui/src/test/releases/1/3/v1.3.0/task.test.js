import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('v1.3.0 — SortableList Component', () => {
	/**
	 * @contract SortableList.create() must return a list instance with API methods.
	 */
	it('SortableList.create() returns instance with expected API', async () => {
		const { default: Component } = await import('../../../../../../src/Component/index.js')
		const list = Component.SortableList.create({
			items: ['a', 'b', 'c'],
		})
		assert.ok(list)
		assert.equal(typeof list.moveUp, 'function')
		assert.equal(typeof list.moveDown, 'function')
		assert.equal(typeof list.getItems, 'function')
		assert.equal(typeof list.reset, 'function')
	})

	/**
	 * @contract moveUp swaps item with the one above it.
	 */
	it('moveUp(1) swaps index 1 with index 0', async () => {
		const { default: Component } = await import('../../../../../../src/Component/index.js')
		const list = Component.SortableList.create({ items: ['a', 'b', 'c'] })
		list.moveUp(1)
		assert.deepStrictEqual(list.getItems(), ['b', 'a', 'c'])
	})

	/**
	 * @contract moveUp(0) is a no-op — cannot move beyond top boundary.
	 */
	it('moveUp(0) is no-op', async () => {
		const { default: Component } = await import('../../../../../../src/Component/index.js')
		const list = Component.SortableList.create({ items: ['a', 'b', 'c'] })
		list.moveUp(0)
		assert.deepStrictEqual(list.getItems(), ['a', 'b', 'c'])
	})

	/**
	 * @contract moveDown swaps item with the one below it.
	 */
	it('moveDown(0) swaps index 0 with index 1', async () => {
		const { default: Component } = await import('../../../../../../src/Component/index.js')
		const list = Component.SortableList.create({ items: ['a', 'b', 'c'] })
		list.moveDown(0)
		assert.deepStrictEqual(list.getItems(), ['b', 'a', 'c'])
	})

	/**
	 * @contract moveDown(last) is a no-op — cannot move beyond bottom boundary.
	 */
	it('moveDown(last) is no-op', async () => {
		const { default: Component } = await import('../../../../../../src/Component/index.js')
		const list = Component.SortableList.create({ items: ['a', 'b', 'c'] })
		list.moveDown(2)
		assert.deepStrictEqual(list.getItems(), ['a', 'b', 'c'])
	})

	/**
	 * @contract reset() restores the initial order.
	 */
	it('reset() restores initial order', async () => {
		const { default: Component } = await import('../../../../../../src/Component/index.js')
		const list = Component.SortableList.create({ items: ['a', 'b', 'c'] })
		list.moveUp(2)
		list.moveUp(1)
		assert.notDeepStrictEqual(list.getItems(), ['a', 'b', 'c'])
		list.reset()
		assert.deepStrictEqual(list.getItems(), ['a', 'b', 'c'])
	})

	/**
	 * @contract onChange fires on every mutation with the new order.
	 */
	it('onChange callback fires on mutation', async () => {
		const { default: Component } = await import('../../../../../../src/Component/index.js')
		const calls = []
		const list = Component.SortableList.create({
			items: ['x', 'y', 'z'],
			onChange: (items) => calls.push([...items]),
		})
		list.moveUp(1)
		list.moveDown(1)
		assert.equal(calls.length, 2)
		assert.deepStrictEqual(calls[0], ['y', 'x', 'z'])
		assert.deepStrictEqual(calls[1], ['y', 'z', 'x'])
	})

	/**
	 * @contract moveTo(from, to) removes item and inserts at new position (drag-n-drop).
	 */
	it('moveTo(0, 2) drags first item to third position', async () => {
		const { default: Component } = await import('../../../../../../src/Component/index.js')
		const list = Component.SortableList.create({ items: ['a', 'b', 'c'] })
		list.moveTo(0, 2)
		assert.deepStrictEqual(list.getItems(), ['b', 'c', 'a'])
	})

	it('moveTo(2, 0) drags last item to first position', async () => {
		const { default: Component } = await import('../../../../../../src/Component/index.js')
		const list = Component.SortableList.create({ items: ['a', 'b', 'c'] })
		list.moveTo(2, 0)
		assert.deepStrictEqual(list.getItems(), ['c', 'a', 'b'])
	})

	it('moveTo(1, 1) is no-op', async () => {
		const { default: Component } = await import('../../../../../../src/Component/index.js')
		const list = Component.SortableList.create({ items: ['a', 'b', 'c'] })
		list.moveTo(1, 1)
		assert.deepStrictEqual(list.getItems(), ['a', 'b', 'c'])
	})

	it('moveTo fires onChange', async () => {
		const { default: Component } = await import('../../../../../../src/Component/index.js')
		const calls = []
		const list = Component.SortableList.create({
			items: ['a', 'b', 'c'],
			onChange: (items) => calls.push([...items]),
		})
		list.moveTo(0, 2)
		assert.equal(calls.length, 1)
		assert.deepStrictEqual(calls[0], ['b', 'c', 'a'])
	})

	/**
	 * @contract package.json version must be 1.3.0 for this release.
	 */
	it.skip('package.json version is 1.3.0', () => {
		const pkg = JSON.parse(
			readFileSync(new URL('../../../../../package.json', import.meta.url), 'utf8'),
		)
		assert.equal(pkg.version, '1.3.0')
	})
})

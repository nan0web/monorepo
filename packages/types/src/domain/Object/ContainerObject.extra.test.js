import { describe, it } from 'node:test'
import assert from 'node:assert'
import ContainerObject from './ContainerObject.js'

describe('ContainerObject – extended edge cases', () => {
	it('constructor should set child levels recursively', () => {
		const child = new ContainerObject()
		const root = new ContainerObject({ children: [child] })
		assert.strictEqual(child.level, 1)
		assert.strictEqual(root.children.length, 1)
		assert.deepStrictEqual(root.children[0], child)
	})

	it('static from should create instance from plain object with level', () => {
		const plain = { level: 5, children: [] }
		const instance = ContainerObject.from(plain)
		assert.ok(instance instanceof ContainerObject)
		assert.strictEqual(instance.level, 5)
	})

	it('add should accept plain object and convert via from', () => {
		const root = new ContainerObject()
		const plain = { level: 0, children: [] }
		root.add(plain)
		const added = root.children[0]
		assert.ok(added instanceof ContainerObject)
		assert.strictEqual(root.recent, added)
	})

	it('clear empties the container', () => {
		const root = new ContainerObject()
		root.add(new ContainerObject())
		assert.strictEqual(root.children.length, 1)
		root.clear()
		assert.deepStrictEqual(root.children, [])
		assert.strictEqual(root.recent, null)
	})

	it('filter recursively finds nested nodes', () => {
		const root = new ContainerObject()
		const child = new ContainerObject()
		const grand = new ContainerObject()
		root.add(child)
		child.add(grand)

		const result = root.filter((node) => node.level === 2, true)
		assert.deepStrictEqual(result, [grand])
	})

	it('map recursively transforms nodes', () => {
		const root = new ContainerObject()
		const child1 = new ContainerObject()
		const child2 = new ContainerObject()
		root.add(child1).add(child2)

		const transformed = root.map((node) => node.level * 10, true)
		assert.deepStrictEqual(transformed, [0, 10, 10])
	})

	it('asyncMap resolves promises recursively', async () => {
		const root = new ContainerObject()
		const child = new ContainerObject()
		root.add(child)

		const asyncFn = async (node) => node.level + 5

		const result = await root.asyncMap(asyncFn, true)
		assert.deepStrictEqual(result, [5, 6])
	})

	it('recent returns deepest child after removal of second last', () => {
		const root = new ContainerObject()
		const c1 = new ContainerObject()
		const c2 = new ContainerObject()
		const c3 = new ContainerObject()
		root.add(c1).add(c2).add(c3)

		root.remove(c2)

		assert.strictEqual(root.children.length, 2)
		assert.strictEqual(root.recent, c3)
	})

	it('toArray returns flat list identical to flat()', () => {
		const root = new ContainerObject()
		const child = new ContainerObject()
		const grand = new ContainerObject()
		root.add(child)
		child.add(grand)

		const arr1 = root.toArray()
		const arr2 = root.flat()
		assert.deepStrictEqual(arr1, arr2)
	})

	it('filter skips non-matching in recursive', () => {
		const root = new ContainerObject()
		root.add(new ContainerObject())
		const result = root.filter((n) => n.level === 2, true)
		assert.deepStrictEqual(result, [])
	})

	it('asyncMap on empty returns empty array non-recursive', async () => {
		const empty = new ContainerObject()
		const res = await empty.asyncMap(() => Promise.resolve('x'))
		assert.deepStrictEqual(res, [])
	})
})

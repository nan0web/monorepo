import { describe, it } from 'node:test'
import assert from 'node:assert'
import ContainerObject from './ContainerObject.js'

describe('ContainerObject', () => {
	it('should initialize with default values', () => {
		const container = new ContainerObject()
		assert.strictEqual(container.level, 0)
		assert.strictEqual(container.recent, null)
		assert.deepStrictEqual(container.children, [])
	})

	describe('Adding and recent tracking', () => {
		it('should add a child correctly', () => {
			const container = new ContainerObject()
			const child = new ContainerObject()

			container.add(child)

			assert.strictEqual(container.children.length, 1)
			assert.strictEqual(container.children[0], child)
			assert.strictEqual(container.recent, child)
			assert.strictEqual(child.level, 1)
			assert.deepStrictEqual(child.children, [])
		})

		it('should update recent when multiple children added', () => {
			const container = new ContainerObject()
			const child1 = new ContainerObject()
			const child2 = new ContainerObject()

			container.add(child1)
			container.add(child2)

			assert.strictEqual(container.recent, child2)
		})

		it('recent traverses deepest for nested', () => {
			const root = new ContainerObject()
			root.add(new ContainerObject().add(new ContainerObject()))
			assert.strictEqual(root.recent.level, 2)
		})
	})

	describe('Removal and clear', () => {
		it('should remove a child correctly', () => {
			const container = new ContainerObject()
			const child = new ContainerObject()

			container.add(child)
			container.remove(child)

			assert.strictEqual(container.children.length, 0)
			assert.strictEqual(container.recent, null)
		})

		it('should handle child removal and update recent properly', () => {
			const container = new ContainerObject()
			const child1 = new ContainerObject()
			const child2 = new ContainerObject()
			const child3 = new ContainerObject()

			container.add(child1).add(child2).add(child3)
			container.remove(child2)

			assert.strictEqual(container.children.length, 2)
			assert.strictEqual(container.recent, child3)
		})

		it('clear empties the container', () => {
			const root = new ContainerObject()
			root.add(new ContainerObject())
			assert.strictEqual(root.children.length, 1)
			root.clear()
			assert.deepStrictEqual(root.children, [])
			assert.strictEqual(root.recent, null)
		})
	})

	describe('Search and traversal', () => {
		const setupTree = () => {
			const container = new ContainerObject()
			const child1 = new ContainerObject()
			const child2 = new ContainerObject()
			const grandChild1 = new ContainerObject()
			const grandChild2 = new ContainerObject()

			container.add(child1).add(child2)
			child1.add(grandChild1)
			child2.add(grandChild2)

			return { container, child1, child2, grandChild1, grandChild2 }
		}

		it('should find children matching a condition recursively', () => {
			const { container, grandChild1, grandChild2 } = setupTree()
			const found = container.find((node) => node.level === 2, true)
			assert.ok(found)
			assert.ok(found === grandChild1 || found === grandChild2)
			assert.strictEqual(
				container.find(() => true),
				container.children[0],
			)
		})

		it('should flatten all nested children', () => {
			const { container, child1, child2, grandChild1, grandChild2 } = setupTree()
			const flatChildren = container.flat()
			assert.strictEqual(flatChildren.length, 5)
			assert.ok(flatChildren.includes(container))
			assert.ok(flatChildren.includes(child1))
			assert.ok(flatChildren.includes(child2))
			assert.ok(flatChildren.includes(grandChild1))
			assert.ok(flatChildren.includes(grandChild2))
		})

		it('filter returns expected results', () => {
			const { container } = setupTree()
			const level1 = container.filter((n) => n.level === 1, true)
			assert.strictEqual(level1.length, 2)
			const level2 = container.filter((n) => n.level === 2, true)
			assert.strictEqual(level2.length, 2)
			assert.deepStrictEqual(container.filter(), container.children)
		})
	})

	describe('Mapping', () => {
		it('should map over children synchronously', () => {
			const container = new ContainerObject()
			const child1 = new ContainerObject()
			const child2 = new ContainerObject()

			container.add(child1).add(child2)

			const levels = container.map((child) => child.level)
			assert.deepStrictEqual(levels, [1, 1])
			const allLevels = container.map((c) => c.level, true)
			assert.deepStrictEqual(allLevels, [0, 1, 1])
		})

		it('should map over children asynchronously', async () => {
			const container = new ContainerObject()
			const child1 = new ContainerObject()
			const child2 = new ContainerObject()

			container.add(child1).add(child2)

			const asyncFn = async (child) => child.level * 2
			const levels = await container.asyncMap(asyncFn)
			assert.deepStrictEqual(levels, [2, 2])
			const allLevels = await container.asyncMap(asyncFn, true)
			assert.deepStrictEqual(allLevels, [0, 2, 2])
		})
	})

	describe('Constructor and factory', () => {
		it('constructor sets child levels recursively via map', () => {
			const root = new ContainerObject({
				children: [new ContainerObject({ children: [new ContainerObject()] })],
			})
			assert.deepStrictEqual(
				root.flat().map((c) => c.level),
				[0, 1, 2],
			)
		})

		it('static from creates or returns instance', () => {
			const existing = new ContainerObject()
			assert.strictEqual(ContainerObject.from(existing), existing)

			const plain = { level: 5, children: [] }
			const newInst = ContainerObject.from(plain)
			assert.ok(newInst instanceof ContainerObject)
			assert.strictEqual(newInst.level, 5)
			assert.deepStrictEqual(newInst.children, [])
		})

		it('add converts plain objects via from', () => {
			const root = new ContainerObject()
			const plain = {}
			root.add(plain)
			const added = root.children[0]
			assert.ok(added instanceof ContainerObject)
			assert.strictEqual(root.recent, added)
			assert.strictEqual(added.level, 1)
		})
	})
})

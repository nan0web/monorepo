import { describe, it } from 'node:test'
import assert from 'node:assert'
import ContainerObject from './ContainerObject.js'

describe('ContainerObject – edge coverage', () => {
	it('constructor propagates levels recursively (covers line 27/43)', () => {
		const root = new ContainerObject({
			children: [
				new ContainerObject({
					children: [new ContainerObject()],
				}),
			],
		})
		const levels = root.flat().map((c) => c.level)
		assert.deepStrictEqual(levels, [0, 1, 2])
	})

	it('flat includes the root itself (covers lines 98‑99)', () => {
		const leaf = new ContainerObject()
		const root = new ContainerObject({ children: [leaf] })
		const flat = root.flat()
		assert.ok(flat.includes(root), 'root should be part of flat result')
		assert.ok(flat.includes(leaf), 'leaf should be part of flat result')
		assert.strictEqual(flat.length, 2)
	})
})

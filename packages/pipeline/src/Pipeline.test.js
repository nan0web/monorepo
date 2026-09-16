import { test } from 'node:test'
import assert from 'node:assert'
import { Node } from './Node.js'
import { Pipeline } from './Pipeline.js'

class UpperNode extends Node {
	async *run() {
		yield this.step('Transforming to uppercase')
		const text = this.inputs.text || ''
		yield this.result({ text: text.toUpperCase() })
	}
}

class ExclaimNode extends Node {
	async *run() {
		yield this.step('Adding exclamation')
		const text = this.inputs.text || ''
		yield this.result({ text: `${text}!` })
	}
}

test('Pipeline runs nodes in dependency order and passes data', async () => {
	const node1 = new UpperNode({ id: 'upper', inputs: { text: 'hello' } })
	const node2 = new ExclaimNode({ id: 'exclaim' })

	const pipeline = new Pipeline({
		nodes: [node2, node1],
		edges: [
			{
				from: 'upper',
				to: 'exclaim',
				map: { text: 'text' },
			},
		],
	})

	const events = []
	for await (const event of pipeline.run()) {
		events.push(event)
	}

	assert.strictEqual(events.length, 4)
	assert.strictEqual(events[0].nodeId, 'upper')
	assert.strictEqual(events[0].type, 'step')
	assert.strictEqual(events[1].nodeId, 'upper')
	assert.strictEqual(events[1].type, 'result')
	assert.strictEqual(events[1].data.text, 'HELLO')

	assert.strictEqual(events[2].nodeId, 'exclaim')
	assert.strictEqual(events[2].type, 'step')
	assert.strictEqual(events[3].nodeId, 'exclaim')
	assert.strictEqual(events[3].type, 'result')
	assert.strictEqual(events[3].data.text, 'HELLO!')

	assert.strictEqual(node2.outputs.text, 'HELLO!')
})

test('Node intents contract', () => {
	const node = new Node({ id: 'test-node' })
	assert.deepStrictEqual(node.step('start'), { type: 'step', label: 'start' })
	assert.deepStrictEqual(node.progress(1, 5), { type: 'progress', value: 1, total: 5 })
	assert.deepStrictEqual(node.log('msg'), { type: 'log', message: 'msg' })
	assert.deepStrictEqual(node.show({ val: 1 }), { type: 'show', data: { val: 1 } })
	assert.deepStrictEqual(node.ask({ field: 'name' }), { type: 'ask', schema: { field: 'name' } })
	assert.deepStrictEqual(node.result({ out: 'ok' }), { type: 'result', data: { out: 'ok' } })
	assert.strictEqual(node.outputs.out, 'ok')
})

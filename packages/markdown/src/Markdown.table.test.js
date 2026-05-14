import nodeTest from 'node:test'
import assert from 'node:assert'
import Markdown from '../src/Markdown.js'

nodeTest('Markdown.table() with object array', () => {
	const doc = new Markdown()
	const data = [
		{ Name: 'John', Age: 30 },
		{ Name: 'Jane', Age: 25 }
	]
	
	doc.table(data)
	const output = doc.toString()
	
	console.log('--- TABLE OUTPUT ---')
	console.log(output)
	console.log('--------------------')

	assert.ok(output.includes('| Name | Age |'), 'Should contain headers')
	assert.ok(output.includes('| --- | --- |') || output.includes('|---|---|'), 'Should contain separator')
	assert.ok(output.includes('| John | 30 |'), 'Should contain row 1')
	assert.ok(output.includes('| Jane | 25 |'), 'Should contain row 2')
	assert.strictEqual(output.match(/\|\|/g), null, 'Should NOT contain double pipes')
})

nodeTest('Markdown.table() with matrix', () => {
	const doc = new Markdown()
	const data = [
		['A', 'B'],
		['1', '2']
	]
	
	doc.table(data)
	const output = doc.toString()
	
	assert.ok(output.includes('| A | B |'), 'Should contain matrix header')
	assert.ok(output.includes('| 1 | 2 |'), 'Should contain matrix data')
})

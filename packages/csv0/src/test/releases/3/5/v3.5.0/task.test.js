import assert from 'node:assert'
import test from 'node:test'
import { Format as BaseFormat } from '@nan0web/types'
import { Format } from '../../../../../domain/Format.js'
import { CSV0Format } from '../../../../../domain/CSV0Format.js'
import { BooleanFormat } from '../../../../../domain/formats/BooleanFormat.js'
import { resolveFormat, BuiltinFormats, FormatResolver } from '../../../../../domain/formats/index.js'
import { parseCSV0, stringifyCSV0 } from '../../../../../index.js'

test('§1 Base Format Model Contract', () => {
	const fmt = new Format()
	assert.ok(fmt instanceof BaseFormat)
	assert.strictEqual(fmt.stringify('hello'), 'hello')
	assert.strictEqual(fmt.stringify(null), '')
	assert.strictEqual(fmt.parse('test'), 'test')
	assert.strictEqual(fmt.validate('any'), true)
})

test('§2 BooleanFormat (0/1 serialisation & parsing)', () => {
	const boolFmt = new BooleanFormat()
	assert.strictEqual(boolFmt.stringify(true), '1')
	assert.strictEqual(boolFmt.stringify(false), '0')
	assert.strictEqual(boolFmt.stringify(1), '1')
	assert.strictEqual(boolFmt.stringify(0), '0')

	assert.strictEqual(boolFmt.parse('1'), true)
	assert.strictEqual(boolFmt.parse('0'), false)
	assert.strictEqual(boolFmt.parse('true'), true)
	assert.strictEqual(boolFmt.parse('false'), false)
	assert.strictEqual(boolFmt.parse(''), false)

	assert.strictEqual(boolFmt.validate(true), true)
	assert.strictEqual(boolFmt.validate(false), true)
})

test('§3 resolveFormat and FormatResolver resolves formats', async () => {
	const boolType = resolveFormat('boolean')
	assert.ok(boolType instanceof BooleanFormat)
	assert.strictEqual(BuiltinFormats['boolean'], BooleanFormat)

	const resolver = new FormatResolver({ db: null })
	const stringFmt = await resolver.resolve('string')
	assert.strictEqual(stringFmt.parse('abc'), 'abc')

	// Object column format definition
	const resolvedFromObj = resolver.resolveSync({ type: 'boolean', width: '100px' })
	assert.ok(resolvedFromObj instanceof BooleanFormat)
})

test('§4 CSV0Format extends Format with NaN0 FrontMatter', () => {
	const csv0Fmt = new CSV0Format()
	assert.ok(csv0Fmt instanceof Format)
	assert.ok(csv0Fmt instanceof BaseFormat)

	const source = `---
title: Test Table
columns:
  id: number
  name: string
  active: boolean
---
id,name,active
1,Alex,1
2,John,0`

	const parsed = csv0Fmt.parse(source)
	assert.strictEqual(parsed.meta.title, 'Test Table')
	assert.deepStrictEqual(parsed.rows, [
		{ id: 1, name: 'Alex', active: true },
		{ id: 2, name: 'John', active: false },
	])
})

test('§5 parseCSV0 with columns typing and extended config', () => {
	const source = `---
columns:
  id:
    type: number
    align: right
  name: string
  active: boolean
---
id,name,active
1,Alex,1
2,John,0`

	const result = parseCSV0(source, { typed: true })
	assert.ok(result.meta)
	assert.deepStrictEqual(result.rows, [
		{ id: 1, name: 'Alex', active: true },
		{ id: 2, name: 'John', active: false },
	])
})

test('§6 stringifyCSV0 with columns format and title', () => {
	const data = [
		{ id: 1, name: 'Alex', active: true },
		{ id: 2, name: 'John', active: false },
	]
	const columns = {
		id: 'number',
		name: 'string',
		active: 'boolean',
	}

	const csv0 = stringifyCSV0(data, { columns, title: 'Users' })
	assert.ok(csv0.includes('title: Users'))
	assert.ok(csv0.includes('active: boolean'))
	assert.ok(csv0.includes('1,Alex,1'))
	assert.ok(csv0.includes('2,John,0'))
})

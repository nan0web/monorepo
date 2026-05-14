import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import nano2attrs from './nano2attrs.js'
import Case from './Case.js'

describe('nano2attrs', () => {
	it('basic conversion', () => {
		const attrs = { $id: 'main', $hidden: true, $title: 'Hello & World' }
		const result = nano2attrs(attrs)
		assert.equal(result, ' id="main" hidden title="Hello &amp; World"')
	})

	it('with custom case and true suffix', () => {
		const attrs = { $dataValue: 'test', $active: true }
		const defaultTags = { $attrCase: Case.UPPER, $attrTrue: '_present' }
		const result = nano2attrs(attrs, defaultTags)
		assert.equal(result, ' DATAVALUE="test" ACTIVE_present')
	})
})

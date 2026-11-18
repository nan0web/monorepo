import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MarkdownRoundTripAuditor } from './MarkdownRoundTripAuditor.js'

describe('MarkdownRoundTripAuditor Contract & Story', () => {
	it('passes zero-drift audit on standard markdown document', () => {
		const doc = '# Title\n\nSome paragraph text.\n\n- [ ] Task 1\n- [x] Task 2\n'
		const res = MarkdownRoundTripAuditor.audit(doc)
		assert.equal(res.matches, true)
		assert.equal(res.diff, '')
	})

	it('detects structural drift when content differs', () => {
		const doc = '# Title\n\nSome paragraph'
		const mutated = '# Title\n\nDifferent paragraph'
		const { matches, diff } = MarkdownRoundTripAuditor.compare(doc, mutated)
		assert.equal(matches, false)
		assert.ok(diff.includes('expected "Some paragraph" but got "Different paragraph"'))
	})
})

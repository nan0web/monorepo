import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { toSvg } from '../src/index.js'
import { BsBank2, BsStar } from '../src/sets/bs.js'
import { iconChar } from '../src/adapters/cli.js'

describe('toSvg', () => {
	it('renders BsBank2 as valid SVG', () => {
		const svg = toSvg(BsBank2)
		assert.ok(svg.startsWith('<svg'))
		assert.ok(svg.includes('viewBox'))
		assert.ok(svg.endsWith('</svg>'))
	})

	it('renders BsStar with custom size', () => {
		const svg = toSvg(BsStar, { size: 32 })
		assert.ok(svg.includes('width="32"'))
		assert.ok(svg.includes('height="32"'))
	})

	it('adds class attribute', () => {
		const svg = toSvg(BsStar, { class: 'icon' })
		assert.ok(svg.includes('class="icon"'))
	})

	it('overrides fill color', () => {
		const svg = toSvg(BsStar, { color: '#ff0000' })
		assert.ok(svg.includes('fill="#ff0000"'))
	})

	it('handles null gracefully', () => {
		assert.equal(toSvg(null), '')
		assert.equal(toSvg(undefined), '')
	})
})

describe('iconChar', () => {
	it('returns unicode for known icons', () => {
		assert.equal(iconChar({ _name: 'BsBank2' }), '🏦')
		assert.equal(iconChar({ _name: 'BsStar' }), '★')
		assert.equal(iconChar({ _name: 'BsHeart' }), '♥')
	})

	it('returns fallback for unknown', () => {
		assert.equal(iconChar({}), '●')
		assert.equal(iconChar({}, '?'), '?')
	})
})

describe('icon data structure', () => {
	it('BsBank2 has correct shape', () => {
		assert.equal(BsBank2.tag, 'svg')
		assert.ok(BsBank2.attr.viewBox)
		assert.ok(Array.isArray(BsBank2.child))
		assert.ok(BsBank2.child.length > 0)
	})

	it('BsStar has correct shape', () => {
		assert.equal(BsStar.tag, 'svg')
		assert.ok(BsStar.attr.viewBox)
		assert.ok(Array.isArray(BsStar.child))
	})
})

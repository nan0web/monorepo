import { describe, it, expect } from 'vitest'
import { renderItem, layoutToContent, Renderer } from './renderItem.jsx'
import { Blocks } from './index.jsx'

describe('renderItem / layoutToContent / Renderer', () => {
	it('layoutToContent maps standard string to standard layout', () => {
		const result = layoutToContent('standard')
		expect(result).toEqual(['Description', 'Excerpt', 'Content', 'Accordion', 'Files'])
	})

	it('layoutToContent fallback is Content', () => {
		const result = layoutToContent('unknown_layout_123')
		expect(result).toEqual(['Content'])
	})

	it('renderItem can render raw strings directly', () => {
		const item = 'Hello World'
		const vdom = renderItem(item, 0, {})
		expect(vdom.type).toBe('p')
		expect(vdom.props.children).toBe('Hello World')
		expect(vdom.props.className).toBe('container py-2')
	})

	it('renderItem can render strings with HTML entities as raw text', () => {
		const item = 'Hello &amp; World'
		const vdom = renderItem(item, 0, {})
		expect(vdom.type).toBe('p')
		expect(vdom.props.dangerouslySetInnerHTML).toEqual({ __html: 'Hello &amp; World' })
	})

	it('renderItem can render standard HTML tags via JSON payload', () => {
		const item = { div: 'Inside div', $class: 'custom-class' }
		const vdom = renderItem(item, 0, {})
		expect(vdom.type).toBe('div')
		expect(vdom.props.className).toBe('custom-class')
		expect(vdom.props.children).toBe('Inside div')
	})

	it('renderItem renders standard Blocks mapping', () => {
		const item = 'Files'
		const vdom = renderItem(item, 0, { doc: { files: [] } })
		// Since it resolves to Blocks.Files, the type is the functional component Files
		expect(vdom.type).toBe(Blocks.Files)
	})

	it('Renderer mounts without errors if no doc passed', () => {
		const vdom = Renderer({ doc: null })
		expect(vdom).toBeNull()
	})

	it('Renderer explicitly builds page from content array', () => {
		const pageObj = {
			$content: [{ h1: 'Explicit Title' }],
		}
		const vdomArray = Renderer({ doc: pageObj, registry: {} })
		const vdomStr = JSON.stringify(vdomArray)
		expect(vdomStr).toContain('h1')
		expect(vdomStr).toContain('Explicit Title')
	})
})

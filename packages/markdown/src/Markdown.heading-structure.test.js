import { describe, it } from 'node:test'
import assert from 'node:assert'
import Markdown from './Markdown.js'
import MDHeading1 from './MDHeading1.js'

describe('Markdown - Heading Structure Validation', () => {
	it('should parse heading with correct HTML tag structure', () => {
		const md = new Markdown()
		md.parse('# Hello, NaN0Web')
		
		// Get the first (and only) element
		const heading = md.document.children[0]
		
		// Verify it's a heading
		assert.ok(heading instanceof MDHeading1)
		
		// Verify content
		assert.strictEqual(heading.content, 'Hello, NaN0Web')
		
		// ❌ RED: This should FAIL with current implementation
		// We expect tag to be a function or '<h1>', but it might be '\n' or undefined
		assert.notStrictEqual(heading.tag, '\n', 'Heading tag should not be newline')
		assert.notStrictEqual(heading.tag, '', 'Heading tag should not be empty')
		
		// Verify heading level
		assert.strictEqual(heading.heading, 1)
		
		// Verify mdTag (Markdown tag)
		assert.strictEqual(heading.mdTag, '# ')
		
		// Verify HTML output
		const html = heading.toHTML()
		assert.ok(html.includes('<h1>'), 'HTML should contain opening h1 tag')
		assert.ok(html.includes('</h1>'), 'HTML should contain closing h1 tag')
		assert.ok(html.includes('Hello, NaN0Web'), 'HTML should contain heading text')
	})
	
	it('should convert markdown document to proper structure without newline tags', () => {
		const md = new Markdown('# Hello, NaN0Web\n\nThis is a paragraph.')
		
		// Check heading structure
		const heading = md.document.children[0]
		assert.ok(heading instanceof MDHeading1)
		
		// ❌ RED: This should FAIL if tag is '\n'
		assert.notStrictEqual(heading.tag, '\n', 'Heading should not have newline as tag')
		
		// Check that toString() produces valid markdown
		const markdown = md.document.toString()
		assert.ok(markdown.includes('# Hello, NaN0Web'), 'Should contain markdown heading')
	})
	
	it('should have valid tag for all heading levels', () => {
		const levels = ['# H1', '## H2', '### H3', '#### H4', '##### H5', '###### H6']
		
		for (const [index, markdownText] of levels.entries()) {
			const md = new Markdown()
			md.parse(markdownText)
			const heading = md.document.children[0]
			
			// ❌ RED: This should FAIL for any heading with tag = '\n'
			assert.notStrictEqual(heading.tag, '\n', 
				`Heading level ${index + 1} should not have newline as tag`)
			assert.notStrictEqual(heading.tag, '', 
				`Heading level ${index + 1} should not have empty tag`)
			
			// Verify heading level
			assert.strictEqual(heading.heading, index + 1)
		}
	})
})

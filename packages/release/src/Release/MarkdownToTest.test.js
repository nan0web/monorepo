import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import MarkdownToTest from './MarkdownToTest.js'

describe.skip('MarkdownToTest', () => {
	it('should generate node:test code from markdown release notes', () => {
		const parser = new MarkdownToTest()
		const markdown = `# v1.1.0 - 2025-08-19

## CLI application
###  **Treats project management like code: everything is versioned, auditable, reversible.** [treats-project-management-like-code-everything-is-versioned-auditable-reversible]
### Draft **No external tools or databases needed — just Git.** [no-external-tools-or-databases-needed-just-git]
###  **Natural for developers; lowers barrier to entry for dev-centric teams.** [natural-for-developers-lowers-barrier-to-entry-for-dev-centric-teams]

## UI application
###  **Drag-and-drop interface** [drag-and-drop-interface]
###  **Visual tree structure** [visual-tree-structure]`

		const expected = `import { describe, it } from "node:test"
import { ok, strictEqual } from "node:assert"

describe("v1.1.0 - 2025-08-19", () => {
	describe("CLI application", () => {
		it("Treats project management like code: everything is versioned, auditable, reversible.", () => {
			ok(true, "Task completed successfully")
		})
		it.skip("No external tools or databases needed — just Git.", () => {
			ok(false, "Draft task - not yet implemented")
		})
		it("Natural for developers; lowers barrier to entry for dev-centric teams.", () => {
			ok(true, "Task completed successfully")
		})
	})
	describe("UI application", () => {
		it("Drag-and-drop interface", () => {
			ok(true, "Task completed successfully")
		})
		it("Visual tree structure", () => {
			ok(true, "Task completed successfully")
		})
	})
})`

		const result = parser.generateTests(markdown)
		strictEqual(result.trim(), expected.trim())
	})

	it("should throw error if markdown doesn't have version header", () => {
		const parser = new MarkdownToTest()
		const markdown = `## CLI application
###  **Treats project management like code** [treats-project-management-like-code]`

		try {
			parser.generateTests(markdown)
			throw new Error('Should have thrown an error')
		} catch (error) {
			strictEqual(error.message, 'Markdown must start with version header: # vX.Y.Z - YYYY-MM-DD')
		}
	})
})

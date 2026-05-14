/**
 * MarkdownToTest - generates node:test code from markdown release notes
 * Enables writing release notes first, then generating executable tests
 */
class MarkdownToTest {
	/**
	 * Convert markdown release notes to node:test code
	 * @param {string} markdown - Release notes markdown content
	 * @returns {string} Generated test code
	 */
	generateTests(markdown) {
		const lines = markdown.split('\n')
		const versionMatch = markdown.match(/^#\s+(v[\d.]+)\s*-\s*(\d{4}-\d{2}-\d{2})/)

		if (!versionMatch) {
			throw new Error('Markdown must start with version header: # vX.Y.Z - YYYY-MM-DD')
		}

		const [, version, date] = versionMatch
		let testCode = this.generateImports()
		testCode += this.generateDescribeHeader(version, date)

		const sections = this.extractSections(lines)
		testCode += this.generateSectionTests(sections)

		testCode += '})\n'
		return testCode
	}

	/**
	 * Generate import statements for node:test
	 * @returns {string} Import code
	 */
	generateImports() {
		return `import { describe, it } from "node:test"
import { ok, strictEqual } from "node:assert"

`
	}

	/**
	 * Generate main describe block header
	 * @param {string} version - Release version
	 * @param {string} date - Release date
	 * @returns {string} Describe header code
	 */
	generateDescribeHeader(version, date) {
		return `describe("${version} - ${date}", () => {
`
	}

	/**
	 * Extract sections from markdown lines
	 * @param {string[]} lines - Markdown lines
	 * @returns {Array<{title: string, tasks: Array<{content: string, status: string, slug: string}>}>} Sections with tasks
	 */
	extractSections(lines) {
		/** @type {Array<{title: string, tasks: Array<{content: string, status: string, slug: string}>}>} */
		const sections = []
		/** @type {{title: string, tasks: Array<{content: string, status: string, slug: string}>} | null} */
		let currentSection = null

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]

			// H2 section
			if (line.startsWith('## ')) {
				currentSection = {
					title: line.slice(3).trim(),
					tasks: /** @type {Array<{content: string, status: string, slug: string}>} */ ([]),
				}
				sections.push(currentSection)
				continue
			}

			// H3 task
			if (line.startsWith('###') && currentSection) {
				const statusMatch = line.match(/^###( Draft| InProgress)? \*\*(.+)\*\* \[(.+)\]$/)
				if (statusMatch) {
					const [, status, content, slug] = statusMatch
					currentSection.tasks.push({
						content,
						status: status ? status.trim() : 'Done',
						slug,
					})
				}
				continue
			}
		}

		return sections
	}

	/**
	 * Generate test code for sections and their tasks
	 * @param {Array<{title: string, tasks: Array}>} sections - Sections with tasks
	 * @returns {string} Generated test code
	 */
	generateSectionTests(sections) {
		let code = ''

		sections.forEach((section) => {
			code += `	describe("${section.title}", () => {
`

			section.tasks.forEach(
				/** @param {{status: string, content: string}} task */ (task) => {
					switch (task.status) {
						case 'Draft':
							code += `		it.todo("${task.content}", () => {
			ok(false, "Draft task - not yet implemented")
		})
`
							break
						case 'InProgress':
							code += `		it.skip("${task.content}", () => {
			ok(false, "In progress task - not yet completed")
		})
`
							break
						default: // Done
							code += `		it("${task.content}", () => {
			ok(true, "Task completed successfully")
		})
`
							break
					}
				},
			)

			code += `	})
`
		})

		return code
	}
}

export default MarkdownToTest

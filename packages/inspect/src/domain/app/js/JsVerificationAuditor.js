import { VerificationAuditor } from '../VerificationAuditor.js'

export class JsVerificationAuditor extends VerificationAuditor {
	/**
	 * @param {import('@nan0web/db').DocumentEntry} entry
	 */
	isTestFile(entry) {
		return entry.name.endsWith('.test.js') || entry.name.endsWith('.story.js')
	}

	/**
	 * @param {import('@nan0web/db').DocumentEntry} entry
	 */
	isIgnoredDir(entry) {
		return entry.name === 'node_modules'
	}

	get missingTestsPattern() {
		return 'src/**/*.{test,story}.js'
	}

	/**
	 * Inspect test files for structure standards (enforcing describe/it over flat test()).
	 * @param {string[]} testFiles
	 * @param {import('../VerificationAuditor.js').VerificationError[]} errors
	 */
	async *inspectTestFiles(testFiles, errors) {
		const { db } = this._
		if (!db) return

		for (const file of testFiles) {
			const content = (await db.loadDocument(file).catch(() => '')) || ''
			const text =
				typeof content === 'string' ? content : content.toString ? content.toString() : ''
			const lines = text.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i].trim()
				// Flag top-level flat test('...') or test.skip('...') without describe
				if (/^test(\.skip|\.only)?\s*\(/.test(line)) {
					errors.push({
						check: 'test_style',
						error: `Test file ${file}:${i + 1} uses flat test() instead of describe()/it() hierarchy`,
					})
					break
				}
			}
		}
	}
}

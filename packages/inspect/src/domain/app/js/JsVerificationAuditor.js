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
}

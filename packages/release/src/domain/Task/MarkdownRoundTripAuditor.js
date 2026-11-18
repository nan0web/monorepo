import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel'
import { Markdown } from '@nan0web/markdown'
import { show, result } from '@nan0web/ui'

/**
 * MarkdownRoundTripAuditor
 * Compares original markdown with its AST-serialized representation.
 * Detects structural and content drift to ensure zero-drift roundtrip.
 */
export class MarkdownRoundTripAuditor extends AuditorModel {
	static alias = 'markdown-roundtrip'

	static UI = {
		drift_detected: 'Structural drift detected during RoundTrip: {diff}',
		audit_success: 'RoundTrip audit passed with zero drift',
	}

	/**
	 * Normalizes markdown text by trimming trailing whitespace per line, collapsing multiple blank lines, and matching newlines.
	 * @param {string} text
	 * @returns {string}
	 */
	static normalize(text) {
		return String(text || '')
			.replace(/\r\n/g, '\n')
			.split('\n')
			.map(line => line.trimEnd())
			.join('\n')
			.replace(/\n{2,}/g, '\n\n')
			.trim()
	}


	/**
	 * Compute differences between original and serialized markdown.
	 * @param {string} original
	 * @param {string} serialized
	 * @returns {{ matches: boolean, diff: string }}
	 */
	static compare(original, serialized) {
		const normOrig = this.normalize(original)
		const normSer = this.normalize(serialized)

		if (normOrig === normSer) {
			return { matches: true, diff: '' }
		}

		const origLines = normOrig.split('\n')
		const serLines = normSer.split('\n')
		const diffLines = []

		const maxLines = Math.max(origLines.length, serLines.length)
		for (let i = 0; i < maxLines; i++) {
			const o = origLines[i] ?? '<EOF>'
			const s = serLines[i] ?? '<EOF>'
			if (o !== s) {
				diffLines.push(`L${i + 1}: expected "${o}" but got "${s}"`)
			}
		}

		return {
			matches: false,
			diff: diffLines.slice(0, 10).join('; ')
		}
	}

	/**
	 * Audits round-trip for markdown text.
	 * @param {string} markdownText
	 * @returns {{ matches: boolean, diff: string, ast: Markdown }}
	 */
	static audit(markdownText) {
		const ast = new Markdown(markdownText)
		const serialized = String(ast)
		const { matches, diff } = this.compare(markdownText, serialized)
		return { matches, diff, ast, serialized }
	}

	/**
	 * Execute generator for OLMUI compatibility.
	 */
	async *run() {
		const text = this.text || ''
		const { matches, diff } = MarkdownRoundTripAuditor.audit(text)
		if (!matches) {
			yield show(`Structural drift detected: ${diff}`, 'error')
			return result({ success: false, diff })
		}
		yield show('RoundTrip audit passed', 'success')
		return result({ success: true })
	}
}

export default MarkdownRoundTripAuditor

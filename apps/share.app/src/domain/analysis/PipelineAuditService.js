/**
 * PipelineAuditService — verifies output integrity of generated video slices, subtitles, articles, and social kits.
 */
export class PipelineAuditService {
	/**
	 * Inspects files created in output directory.
	 * @param {string} outputDir
	 * @param {Array<object>} [segments=[]]
	 * @param {import('@nan0web/db').DB} [db]
	 * @returns {Promise<{ videoSlices: number, subtitles: number, articles: number, socialKits: number, emptyFiles: string[] }>}
	 */
	static async audit(outputDir, segments = [], db) {
		const report = {
			videoSlices: 0,
			subtitles: 0,
			articles: 0,
			socialKits: 0,
			emptyFiles: [],
		}

		const resolvePath = (...parts) => {
			if (db && typeof db.resolveSync === 'function') {
				return parts.reduce((acc, p) => db.resolveSync(acc, p))
			}
			return parts.join('/')
		}

		const checkFile = async (filePath, category) => {
			if (!db) return
			const stat = await db.statDocument(filePath).catch(() => null)
			if (stat && stat.exists) {
				const size = stat.size ?? (stat.content ? stat.content.length : 0)
				if (size > 0) {
					report[category] = (report[category] || 0) + 1
				} else {
					report.emptyFiles.push(filePath)
				}
			}
		}

		for (const seg of segments) {
			await checkFile(resolvePath(outputDir, `${seg.label}.mp4`), 'videoSlices')
			await checkFile(resolvePath(outputDir, `${seg.label}.srt`), 'subtitles')
			await checkFile(resolvePath(outputDir, 'articles', `${seg.label}.md`), 'articles')
			await checkFile(resolvePath(outputDir, 'social', 'episodes', `${seg.label}.youtube.json`), 'socialKits')
		}

		return report
	}
}

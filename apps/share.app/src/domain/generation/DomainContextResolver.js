/**
 * DomainContextResolver - scans local repositories and packages to build Ground Truth context
 * to prevent Whisper speech-to-text hallucinations in LLM article generation.
 */
export class DomainContextResolver {
	/**
	 * Common phonetic corrections for audio transcription.
	 */
	static PHONETIC_CORRECTIONS = [
		{ pattern: /\b(wipe|vyb|vib|vibe cli|mistral wipe)\b/gi, replacement: 'Mistral Vibe (vibe-cli)' },
		{ pattern: /\b(kubernetes accessibility|kubernetes plugin)\b/gi, replacement: '@nan0web/payloadcms-keyboard-accessibility' },
		{ pattern: /\b(cni|collective and natural intelligence)\b/gi, replacement: 'CNAI (0HCnAI - Collective & Artificial Intelligence)' },
		{ pattern: /\b(nan-over|non-over|nan web|nanoweb)\b/gi, replacement: 'nan0web' },
		{ pattern: /\b(open rotor|openrotor)\b/gi, replacement: 'OpenRouter' },
		{ pattern: /\b(pmpm|pmpack)\b/gi, replacement: 'pnpm' },
	]

	/**
	 * Scans given source directory paths (comma-separated or array) and extracts package names,
	 * descriptions, and key README information.
	 * @param {string|string[]} sourcePaths
	 * @param {import('@nan0web/db').DB} [db]
	 * @returns {Promise<{ summary: string, packages: Array<{name: string, path: string, description: string}> }>}
	 */
	static async scanSources(sourcePaths, db) {
		if (!sourcePaths || !db) return { summary: '', packages: [] }

		const paths = Array.isArray(sourcePaths)
			? sourcePaths
			: String(sourcePaths).split(',').map(p => p.trim()).filter(Boolean)

		const packages = []
		const summaries = []

		for (const rawPath of paths) {
			const resolvedPath = rawPath.startsWith('~/')
				? `${process.env.HOME || ''}/${rawPath.slice(2)}`
				: db.resolveSync ? db.resolveSync(rawPath) : rawPath

			const stat = await db.statDocument(resolvedPath).catch(() => null)
			if (!stat || !stat.exists || !stat.isDirectory) continue

			// 1. Check if it's a monorepo with packages/
			const packagesDir = db.resolveSync ? db.resolveSync(resolvedPath, 'packages') : `${resolvedPath}/packages`
			const pkgDirStat = await db.statDocument(packagesDir).catch(() => null)
			if (pkgDirStat && pkgDirStat.exists && pkgDirStat.isDirectory) {
				try {
					for await (const entry of db.readDir(packagesDir, { depth: 0, includeDirs: true })) {
						if (!entry.isDirectory) continue
						const pkgDir = entry.path || (db.resolveSync ? db.resolveSync(packagesDir, entry.name) : `${packagesDir}/${entry.name}`)
						const pkgJsonPath = db.resolveSync ? db.resolveSync(pkgDir, 'package.json') : `${pkgDir}/package.json`
						const pkgDoc = await db.loadDocument(pkgJsonPath).catch(() => null)
						if (pkgDoc) {
							const pkg = typeof pkgDoc === 'object' && pkgDoc ? pkgDoc.value || pkgDoc.content || pkgDoc : JSON.parse(String(pkgDoc))
							packages.push({
								name: pkg.name || entry.name,
								version: pkg.version || '0.1.0',
								description: pkg.description || '',
								path: pkgDir,
							})
							summaries.push(`- \`${pkg.name}\` (${pkgDir}): ${pkg.description || 'Module'}`)
						}
					}
				} catch {}
			}

			// 2. Read root README if available
			const rootReadme = db.resolveSync ? db.resolveSync(resolvedPath, 'README.md') : `${resolvedPath}/README.md`
			const readmeDoc = await db.loadDocument(rootReadme).catch(() => null)
			if (readmeDoc) {
				const content = typeof readmeDoc === 'object' && readmeDoc ? readmeDoc.content || readmeDoc.value || '' : String(readmeDoc)
				const firstLines = content.split('\n').slice(0, 15).join('\n')
				const base = db.basename ? db.basename(resolvedPath) : resolvedPath.split('/').pop()
				summaries.push(`\n**Overview from ${base}/README.md:**\n${firstLines}\n`)
			}
		}

		return {
			summary: summaries.join('\n'),
			packages,
		}
	}

	/**
	 * Cleans and corrects phonetic errors from raw audio transcripts.
	 * @param {string} text
	 * @returns {string}
	 */
	static sanitizeTranscript(text) {
		if (!text) return ''
		let result = text
		for (const { pattern, replacement } of this.PHONETIC_CORRECTIONS) {
			result = result.replace(pattern, replacement)
		}
		return result
	}
}

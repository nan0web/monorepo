import fs from 'node:fs'
import path from 'node:path'

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
	 * @returns {object} { summary: string, packages: Array<{name: string, path: string, description: string}> }
	 */
	static scanSources(sourcePaths) {
		if (!sourcePaths) return { summary: '', packages: [] }

		const paths = Array.isArray(sourcePaths)
			? sourcePaths
			: String(sourcePaths).split(',').map(p => p.trim()).filter(Boolean)

		const packages = []
		const summaries = []

		for (const rawPath of paths) {
			const resolvedPath = rawPath.startsWith('~/')
				? path.join(process.env.HOME || '', rawPath.slice(2))
				: path.resolve(rawPath)

			if (!fs.existsSync(resolvedPath)) continue

			const stat = fs.statSync(resolvedPath)
			if (!stat.isDirectory()) continue

			// 1. Check if it's a monorepo with packages/
			const packagesDir = path.join(resolvedPath, 'packages')
			if (fs.existsSync(packagesDir) && fs.statSync(packagesDir).isDirectory()) {
				const entries = fs.readdirSync(packagesDir)
				for (const entry of entries) {
					const pkgDir = path.join(packagesDir, entry)
					const pkgJsonPath = path.join(pkgDir, 'package.json')
					if (fs.existsSync(pkgJsonPath)) {
						try {
							const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
							packages.push({
								name: pkg.name || entry,
								version: pkg.version || '0.1.0',
								description: pkg.description || '',
								path: pkgDir,
							})
							summaries.push(`- \`${pkg.name}\` (${pkgDir}): ${pkg.description || 'Module'}`)
						} catch {}
					}
				}
			}

			// 2. Check if it has sub-patches or sub-projects (e.g. vibe-cli-patches)
			const subEntries = fs.readdirSync(resolvedPath)
			for (const entry of subEntries) {
				const subDir = path.join(resolvedPath, entry)
				if (fs.existsSync(subDir) && fs.statSync(subDir).isDirectory() && entry !== 'packages' && !entry.startsWith('.')) {
					const readmePath = path.join(subDir, 'README.md')
					const pyprojectPath = path.join(subDir, 'pyproject.toml')
					if (fs.existsSync(readmePath) || fs.existsSync(pyprojectPath)) {
						let desc = `Patch / sub-package in ${entry}`
						if (fs.existsSync(readmePath)) {
							const readmeHead = fs.readFileSync(readmePath, 'utf8').slice(0, 300).replace(/\n+/g, ' ')
							desc = readmeHead
						}
						packages.push({
							name: entry,
							path: subDir,
							description: desc,
						})
						summaries.push(`- \`${entry}\` (${subDir}): ${desc.slice(0, 100)}...`)
					}
				}
			}

			// 3. Read root README if available
			const rootReadme = path.join(resolvedPath, 'README.md')
			if (fs.existsSync(rootReadme)) {
				const content = fs.readFileSync(rootReadme, 'utf8')
				const firstLines = content.split('\n').slice(0, 15).join('\n')
				summaries.push(`\n**Overview from ${path.basename(resolvedPath)}/README.md:**\n${firstLines}\n`)
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

import { show, progress, result } from '@nan0web/ui'
import { NaN0WebConfig } from '@nan0web/core'
import Markdown from '@nan0web/markdown'
import { AuditorModel } from '../AuditorModel.js'

export class BuildWorkflowsApp extends AuditorModel {
	static alias = 'workflows'
	static UI = {
		title: '📦 Workflows Manifest Compiler',
		description: 'Compiles YAML FrontMatter workflows and anchors into lightweight JSON manifests.',
		starting: 'Compiling agent workflows in monorepo root: {dir}...',
		saved: 'Saved compiled workflows manifest: {file}',
		done: 'Workflows manifest compilation completed successfully.',
	}

	/**
	 * Recursively finds nan0web.nan0 files in the workspace.
	 * @param {string} dir
	 * @returns {Promise<string[]>}
	 */
	async findNan0Configs(dir) {
		const db = this.$db
		const results = []
		const scan = async (currentDir) => {
			let entries = []
			try {
				if (typeof db.listDir === 'function') {
					entries = await db.listDir(currentDir)
				} else if (typeof db.readDir === 'function') {
					for await (const entry of db.readDir(currentDir, { depth: 0, includeDirs: true })) {
						entries.push(entry)
					}
				}
			} catch {}

			for (const entry of entries) {
				const fullPath = db.resolveSync(currentDir, entry.name)
				if (entry.isDirectory) {
					if (['node_modules', '.git', '.gemini', 'dist', 'types', 'play'].includes(entry.name)) {
						continue
					}
					await scan(fullPath)
				} else if (entry.isFile && entry.name === 'nan0web.nan0') {
					results.push(fullPath)
				}
			}
		}
		await scan(dir)
		return results
	}

	async *run() {
		const { t } = this._
		const db = this.$db
		const resolvedRoot = db.resolveSync(this.dir)
		yield progress(t(BuildWorkflowsApp.UI.starting, { dir: resolvedRoot }))

		const configs = await this.findNan0Configs(resolvedRoot)
		/** @type {Record<string, any[]>} */
		const manifests = {}

		for (const configPath of configs) {
			const pkgDir = configPath.includes('/')
				? configPath.slice(0, configPath.lastIndexOf('/'))
				: '.'
			let relativePkgDir = pkgDir.startsWith(resolvedRoot)
				? pkgDir.slice(resolvedRoot.length)
				: pkgDir
			if (relativePkgDir.startsWith('/')) relativePkgDir = relativePkgDir.slice(1)

			const doc = await db.loadDocument(configPath).catch(() => '')
			const config = new NaN0WebConfig(doc && typeof doc === 'object' ? doc : {})

			const isWorkspaceRoot = pkgDir === resolvedRoot || relativePkgDir === ''

			for (const agent of config.agents) {
				for (const relativeWfPath of agent.workflows) {
					const fullWfPath = db.resolveSync(pkgDir, relativeWfPath)
					const stat = await db.statDocument(fullWfPath).catch(() => null)
					if (!stat || (!stat.exists && stat.isFile === false)) continue

					const mdDoc = await db.loadDocument(fullWfPath).catch(() => '')
					const metadata =
						(mdDoc instanceof Markdown ? mdDoc : new Markdown(mdDoc || '')).vars || {}

					const pathLangMatch = relativeWfPath.match(/(?:^|\/)docs\/([a-z]{2}(?:-[A-Z]{2})?)\//)
					const wfLang = metadata.lang || (pathLangMatch ? pathLangMatch[1] : config.locale || 'en')
					let workspaceWfPath = fullWfPath.startsWith(resolvedRoot)
						? fullWfPath.slice(resolvedRoot.length)
						: fullWfPath
					if (workspaceWfPath.startsWith('/')) workspaceWfPath = workspaceWfPath.slice(1)

					// Convert package-relative anchors to workspace-relative
					const resolvedAnchors = (metadata.anchors || []).map((anchor) => {
						return isWorkspaceRoot
							? anchor
							: relativePkgDir
								? `${relativePkgDir}/${anchor}`
								: anchor
					})

					const manifestEntry = {
						id: metadata.id || agent.id,
						name: metadata.name || agent.id,
						description: metadata.description || agent.description,
						tags: metadata.tags || [],
						file: workspaceWfPath,
						anchors: resolvedAnchors,
						inspectors: metadata.inspectors || agent.inspectors || [],
						package: isWorkspaceRoot ? null : config.title || config.appName,
					}

					if (!manifests[wfLang]) manifests[wfLang] = []
					manifests[wfLang].push(manifestEntry)
				}
			}
		}

		/** @type {Record<string, number>} */
		const counts = {}
		for (const [lang, items] of Object.entries(manifests)) {
			const file = `.llimo/workflows_manifest.${lang}.json`
			await db.saveDocument(db.resolveSync(resolvedRoot, file), items)
			counts[lang] = items.length
			yield show(t(BuildWorkflowsApp.UI.saved, { file }), 'success')
		}

		return result({
			ok: true,
			counts,
			ukCount: counts.uk ?? 0,
			enCount: counts.en ?? 0,
		})
	}
}

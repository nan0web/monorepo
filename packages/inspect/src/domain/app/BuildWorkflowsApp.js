import { show, progress, result } from '@nan0web/ui'
import { AuditorModel } from '../AuditorModel.js'

/**
 * Parses YAML FrontMatter from Markdown content.
 * @param {string} content
 * @returns {Record<string, any> | null}
 */
export function parseFrontMatter(content) {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
	if (!match) return null
	const yamlText = match[1]
	const data = {}
	const lines = yamlText.split(/\r?\n/)
	let currentKey = null

	for (const line of lines) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) continue

		// Check if it's a list item under a key
		if (trimmed.startsWith('-') && currentKey) {
			let val = trimmed.slice(1).trim()
			if (
				(val.startsWith('"') && val.endsWith('"')) ||
				(val.startsWith("'") && val.endsWith("'"))
			) {
				val = val.slice(1, -1)
			}
			if (!Array.isArray(data[currentKey])) {
				data[currentKey] = []
			}
			data[currentKey].push(val)
			continue
		}

		const colonIndex = line.indexOf(':')
		if (colonIndex === -1) continue

		const key = line.slice(0, colonIndex).trim()
		let valText = line.slice(colonIndex + 1).trim()
		currentKey = key

		if (!valText) {
			data[key] = []
			continue
		}

		if (
			(valText.startsWith('"') && valText.endsWith('"')) ||
			(valText.startsWith("'") && valText.endsWith("'"))
		) {
			valText = valText.slice(1, -1)
		}

		if (valText.startsWith('[') && valText.endsWith(']')) {
			data[key] = valText
				.slice(1, -1)
				.split(',')
				.map((s) => {
					let item = s.trim()
					if (
						(item.startsWith('"') && item.endsWith('"')) ||
						(item.startsWith("'") && item.endsWith("'"))
					) {
						item = item.slice(1, -1)
					}
					return item
				})
				.filter(Boolean)
		} else {
			data[key] = valText
		}
	}

	for (const key of Object.keys(data)) {
		if (Array.isArray(data[key]) && data[key].length === 0) {
			if (!['anchors', 'inspectors', 'tags'].includes(key)) {
				data[key] = ''
			}
		}
	}

	return data
}

/**
 * Parses simple nan0web.nan0 yaml configuration.
 * @param {string} yamlText
 * @returns {{ name: string, agents: Array<{ id: string, description: string, workflows: string[], inspectors: string[] }> }}
 */
export function parseNan0Config(yamlText) {
	const lines = yamlText.split(/\r?\n/)
	/** @type {{ name: string, agents: Array<{ id: string, description: string, workflows: string[], inspectors: string[] }> }} */
	const data = { name: '', agents: [] }
	/** @type {{ id: string, description: string, workflows: string[], inspectors: string[] } | null} */
	let currentAgent = null
	/** @type {string | null} */
	let currentSection = null

	for (const line of lines) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) continue

		if (trimmed.startsWith('name:')) {
			let name = trimmed.slice(5).trim()
			if (
				(name.startsWith('"') && name.endsWith('"')) ||
				(name.startsWith("'") && name.endsWith("'"))
			) {
				name = name.slice(1, -1)
			}
			data.name = name
			continue
		}

		if (line.startsWith('  - id:') || line.startsWith('  - id :')) {
			let id = trimmed.replace(/^- id\s*:\s*/, '').trim()
			if ((id.startsWith('"') && id.endsWith('"')) || (id.startsWith("'") && id.endsWith("'"))) {
				id = id.slice(1, -1)
			}
			currentAgent = { id, description: '', workflows: [], inspectors: [] }
			data.agents.push(currentAgent)
			currentSection = null
			continue
		}

		if (trimmed.startsWith('description:') && currentAgent) {
			let desc = trimmed.slice(12).trim()
			if (
				(desc.startsWith('"') && desc.endsWith('"')) ||
				(desc.startsWith("'") && desc.endsWith("'"))
			) {
				desc = desc.slice(1, -1)
			}
			currentAgent.description = desc
			continue
		}

		if (trimmed.startsWith('workflows:') && currentAgent) {
			currentSection = 'workflows'
			continue
		}

		if (trimmed.startsWith('inspectors:') && currentAgent) {
			currentSection = 'inspectors'
			continue
		}

		if (trimmed.startsWith('-') && currentAgent && currentSection) {
			let val = trimmed.slice(1).trim()
			if (
				(val.startsWith('"') && val.endsWith('"')) ||
				(val.startsWith("'") && val.endsWith("'"))
			) {
				val = val.slice(1, -1)
			}
			if (currentSection === 'workflows') {
				currentAgent.workflows.push(val)
			} else if (currentSection === 'inspectors') {
				currentAgent.inspectors.push(val)
			}
		}
	}
	return data
}

export class BuildWorkflowsApp extends AuditorModel {
	static alias = 'workflows'
	static UI = {
		title: '📦 Workflows Manifest Compiler',
		description: 'Compiles YAML FrontMatter workflows and anchors into lightweight JSON manifests.',
		starting: 'Compiling agent workflows in monorepo root: {dir}...',
		saved: 'Saved compiled workflows manifest: {file}',
		done: 'Workflows manifest compilation completed successfully.',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
	}

	/**
	 * Recursively finds nan0web.nan0 files in the workspace.
	 * @param {string} dir
	 * @returns {Promise<string[]>}
	 */
	async findNan0Configs(dir) {
		const db = this._.db
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
		const t = this._.t || ((k) => k)
		let db = this._.db
		if (!db) {
			const { DBFS } = await import('@nan0web/db-fs')
			db = new DBFS({ cwd: process.cwd(), root: '' })
			this._.db = db
		}
		const resolvedRoot = db.resolveSync(this.dir)
		yield progress(t(BuildWorkflowsApp.UI.starting, { dir: resolvedRoot }))

		const configs = await this.findNan0Configs(resolvedRoot)
		const ukManifest = []
		const enManifest = []

		for (const configPath of configs) {
			const pkgDir = configPath.includes('/')
				? configPath.slice(0, configPath.lastIndexOf('/'))
				: '.'
			let relativePkgDir = pkgDir.startsWith(resolvedRoot)
				? pkgDir.slice(resolvedRoot.length)
				: pkgDir
			if (relativePkgDir.startsWith('/')) relativePkgDir = relativePkgDir.slice(1)

			const doc = await db.loadDocument(configPath).catch(() => '')
			const config =
				doc && typeof doc === 'object' && doc.agents
					? doc
					: parseNan0Config(
							typeof doc === 'string' ? doc : doc && doc.content ? doc.content : String(doc)
						)

			const isWorkspaceRoot = pkgDir === resolvedRoot || relativePkgDir === ''

			for (const agent of config.agents) {
				for (const relativeWfPath of agent.workflows) {
					const fullWfPath = db.resolveSync(pkgDir, relativeWfPath)
					const stat = await db.statDocument(fullWfPath).catch(() => null)
					if (!stat || (!stat.exists && stat.isFile === false)) continue

					const mdDoc = await db.loadDocument(fullWfPath).catch(() => '')
					const metadata =
						mdDoc && typeof mdDoc === 'object' && mdDoc.vars
							? mdDoc.vars
							: parseFrontMatter(
									typeof mdDoc === 'string'
										? mdDoc
										: mdDoc && mdDoc.document
											? mdDoc.document
											: mdDoc && mdDoc.content
												? mdDoc.content
												: String(mdDoc)
								) || {}

					const wfLang = metadata.lang || (relativeWfPath.includes('/uk/') ? 'uk' : 'en')
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
						package: isWorkspaceRoot ? null : config.name,
					}

					if (wfLang === 'uk') {
						ukManifest.push(manifestEntry)
					} else {
						enManifest.push(manifestEntry)
					}
				}
			}
		}

		const ukFile = db.resolveSync(resolvedRoot, '.llimo/workflows_manifest.uk.json')
		const enFile = db.resolveSync(resolvedRoot, '.llimo/workflows_manifest.en.json')

		await db.saveDocument(ukFile, ukManifest)
		await db.saveDocument(enFile, enManifest)

		yield show(
			t(BuildWorkflowsApp.UI.saved, { file: '.llimo/workflows_manifest.uk.json' }),
			'success'
		)
		yield show(
			t(BuildWorkflowsApp.UI.saved, { file: '.llimo/workflows_manifest.en.json' }),
			'success'
		)

		return result({
			ok: true,
			ukCount: ukManifest.length,
			enCount: enManifest.length,
		})
	}
}

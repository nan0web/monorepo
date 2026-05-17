import { ModelAsApp } from '@nan0web/ui-cli'
import path from 'node:path'
import os from 'node:os'
import { matchProject, loadNameToDir } from './projectFilter.js'

/**
 * @version 1.4.2
 * @stability Stable (Regression Fixed)
 * @description Fixed "Mount registry is sealed" error by isolating storeDb and stabilized MCP server paths.
 */
import { DBFS } from '@nan0web/db-fs'

const storeDir = path.join(os.homedir(), '.nan0web/store')

/**
 * CLI Application Model for Workspace Indexing.
 */
export class IndexWorkspaceApp extends ModelAsApp {
	static alias = 'index'
	static UI = {
		done: 'All multi-level indices updated successfully!',
		info: 'Starting mass indexing for {projects} projects...',
		noProjects: 'No projects found in global store at {dir}.',
		projectCached: 'Project {name} skipped (cache matched) in {dir}',
		projectIndexed: 'Project {name} indexed ({files} files) in {dir}',
		agentsStart: 'Starting agents indexing (nan0web.nan0)...',
		scanning: 'Scanning [{project}] ({files} files)',
		verifyingCache: 'Verifying Cache...',
		verifyingCacheProject: 'Verifying Cache... [{project}]',
		generatingVectors: 'Generating vectors...',
		errorIndexing: 'Error indexing {name} [{scope}]: {message}',
	}

	static project = {
		help: 'Re-index only specific projects matching regular expression or glob.',
		type: 'string',
		alias: 'p',
		default: null,
	}

	static scope = {
		help: 'Indexing scope: "docs", "source", or "data".',
		type: 'string',
		alias: 's',
		options: ['docs', 'source', 'data'],
	}

	static force = {
		help: 'Force re-indexing all files.',
		type: 'boolean',
		alias: 'f',
		default: false,
	}

	static agents = {
		help: 'Index agent configurations.',
		type: 'boolean',
		alias: 'a',
		default: false,
	}

	static concurrency = {
		help: 'Number of projects to index concurrently.',
		type: 'number',
		alias: 'c',
		default: 1,
	}

	static ignore = {
		help: 'List of directories to ignore.',
		type: 'string[]',
		alias: 'i',
		default: [],
	}

	static sources = {
		help: 'Shortcut for --scope source.',
		type: 'boolean',
		alias: 'srs',
		default: false,
	}

	static skipData = {
		help: 'Skip indexing data scope.',
		type: 'boolean',
		alias: 'skip-data',
		default: false,
	}

	static skipSources = {
		help: 'Skip indexing source scope.',
		type: 'boolean',
		alias: 'skip-sources',
		default: false,
	}

	static skipDocs = {
		help: 'Skip indexing docs scope.',
		type: 'boolean',
		alias: 'skip-docs',
		default: false,
	}

	/**
	 * @param {Partial<IndexWorkspaceApp> | Record<string, any>} [data] Initial state
	 * @param {any} [options] Model options
	 */
	constructor(data = {}, options = {}) {
		super(data, /** @type {any} */ (options))
		/** @type {string|null} */ this.project

		const defaultScopes = ['docs', 'source', 'data']
		if (/** @type {any} */ (this).skipData) defaultScopes.splice(defaultScopes.indexOf('data'), 1)
		if (/** @type {any} */ (this).skipSources)
			defaultScopes.splice(defaultScopes.indexOf('source'), 1)
		if (/** @type {any} */ (this).skipDocs) defaultScopes.splice(defaultScopes.indexOf('docs'), 1)

		/** @type {string[]} */ this.scopes = /** @type {any} */ (this).sources
			? ['source']
			: /** @type {any} */ (this).scope
				? [/** @type {any} */ (this).scope]
				: defaultScopes
		/** @type {boolean} */ this.sources
		/** @type {boolean} */ this.force
		/** @type {boolean} */ this.agents
		/** @type {number} */ this.concurrency = Number(this.concurrency) || 1
		/** @type {boolean} */ this.silent = !!data.silent
		/** @type {string[]} */ this.ignore = Array.isArray(this.ignore) ? this.ignore : []
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const { ask, show, progress } = await import('@nan0web/ui')
		const { MarkdownIndexer } = await import('./MarkdownIndexer.js')
		const { Embedder } = await import('./Embedder.js')

		if (this.help) {
			const content = this.generateHelp()
			if (this.raw) {
				yield show(content, 'info', /** @type {any} */ ({ format: 'markdown', raw: true }))
				return
			}
			const title = /** @type {any} */ (this.constructor).UI?.title || 'Help'
			yield ask('help', { content, title: `${title} Help`, hint: 'content-viewer' })
			return
		}
		if (this.agents) {
			yield* this.indexAgents({ show, progress })
			return
		}
		yield* this.indexFull({ show, progress, MarkdownIndexer, Embedder })
	}

	/**
	 * @param {object} deps
	 * @param {any} deps.show
	 * @param {any} deps.progress
	 * @param {any} deps.MarkdownIndexer
	 * @param {any} deps.Embedder
	 */
	async *indexFull({ show, progress, MarkdownIndexer, Embedder }) {
		const { t } = this._

		/**
		 * @todo Platform-lock. Another way of detecting workspace must be written,
		 * for instance --workspace-dir or ~/.nan0web/store/config.nan0
		 */
		const fs = await import('node:fs')
		const process = await import('node:process')
		let workspaceRoot = path.resolve(/** @type {any} */ (this._).workspaceRoot || process.cwd())
		let current = workspaceRoot
		while (current && current !== '/') {
			if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
				workspaceRoot = current
				break
			}
			const parent = path.dirname(current)
			if (parent === current) break
			current = parent
		}
		const workspaceDb = /** @type {any} */ (this._).workspaceDb || new DBFS({ root: workspaceRoot })
		const storeDb = /** @type {any} */ (this._).storeDb || new DBFS({ root: storeDir })

		const projects = await this._getProjectsToIndex(storeDb, workspaceRoot)

		if (projects.length === 0) {
			if (!this.silent) yield show(t(IndexWorkspaceApp.UI.noProjects, { dir: storeDir }), 'error')
			return
		}

		if (!this.silent)
			yield show(t(IndexWorkspaceApp.UI.info, { projects: projects.length }), 'info')

		const nameToDir = this.project?.startsWith('@') ? await loadNameToDir(workspaceDb) : undefined

		const embedderUrl =
			/** @type {any} */ (this._).embedderUrl ||
			process.env.EMBEDDER_URL ||
			'http://localhost:1234/v1'
		const embedder = new Embedder({ baseURL: embedderUrl })

		if (this.concurrency > 1) {
			const queue = []
			let pullResolve = null
			let done = false

			const push = (val) => {
				queue.push(val)
				if (pullResolve) {
					pullResolve()
					pullResolve = null
				}
			}

			const worker = async (proj) => {
				for (const scope of this.scopes) {
					const indexer = new MarkdownIndexer(
						/** @type {any} */ ({
							targetProject: proj.name,
							targetDir: proj.dir,
							scope: scope,
							ignore:
								!proj.dir || proj.dir === '.' ? [...this.ignore, 'apps', 'packages'] : this.ignore,
						}),
						/** @type {any} */ ({ db: storeDb, workspaceDb, workspaceRoot }),
					)
					try {
						for await (const it of indexer.indexAll(embedder, { force: this.force })) {
							it.project = it.project || proj.name
							it.scope = scope
							push(it)
						}
					} catch (err) {
						const msg = err instanceof Error ? err.message : String(err)
						push({ type: 'error', message: `Error indexing ${proj.name} [${scope}]: ${msg}` })
					}
				}
			}

			const runAll = async () => {
				const executing = new Set()
				for (const proj of projects) {
					if (!matchProject(proj.dir, this.project || undefined, nameToDir)) continue
					const p = worker(proj).finally(() => executing.delete(p))
					executing.add(p)
					if (executing.size >= this.concurrency) {
						await Promise.race(executing)
					}
				}
				await Promise.all(executing)
				done = true
				if (pullResolve) pullResolve()
			}

			runAll()

			while (!done || queue.length > 0) {
				if (queue.length === 0) {
					await new Promise((r) => (pullResolve = r))
				}
				const it = queue.shift()
				if (!it) continue
				yield* this._handleEvent(it, { show, progress, t })
			}
		} else {
			for (const proj of projects) {
				if (!matchProject(proj.dir, this.project || undefined, nameToDir)) continue

				for (const scope of this.scopes) {
					const indexer = new MarkdownIndexer(
						/** @type {any} */ ({
							targetProject: proj.name,
							targetDir: proj.dir,
							scope: scope,
							ignore:
								!proj.dir || proj.dir === '.' ? [...this.ignore, 'apps', 'packages'] : this.ignore,
						}),
						/** @type {any} */ ({ db: storeDb, workspaceDb, workspaceRoot }),
					)
 
					for await (const it of indexer.indexAll(embedder, { force: this.force })) {
						it.project = it.project || proj.name
						yield* this._handleEvent(it, { show, progress, t })
					}
				}
			}
		}

		if (!this.silent) yield show(t(IndexWorkspaceApp.UI.done), 'success')
	}
	/**
	 * Shared event handler for indexing progress events
	 * @param {any} it - indexing event
	 * @param {object} deps
	 * @param {any} deps.show
	 * @param {any} deps.progress
	 * @param {any} deps.t
	 */
	*_handleEvent(it, { show, progress, t }) {
		const UI = IndexWorkspaceApp.UI
		if (it.type === 'error') {
			if (!this.silent) {
				const ctx = it.project ? `[${it.project}] ` : ''
				yield show(`${ctx}${t(it.message)}`, 'error')
			}
			return
		}
		if (it.type === 'scanProgress')
			yield progress(
				t(UI.scanning, { project: it.project, files: it.files }),
				(it.current / it.total) * 100,
				{
					id: `Index_Scan_${it.project}`,
					width: 30,
				},
			)
		if (it.type === 'cacheCheckStart') {
			yield progress('', 100, { id: `Index_Scan_${it.project}`, stop: 'success' })
			yield progress(t(UI.verifyingCache), 0, { id: `Index_Cache_${it.project}`, width: 30 })
		}
		if (it.type === 'cacheCheckProgress')
			yield progress(
				t(UI.verifyingCacheProject, { project: it.project }),
				(it.current / it.total) * 100,
				{
					id: `Index_Cache_${it.project}`,
					width: 30,
				},
			)
		if (it.type === 'calc') {
			yield progress('', 100, { id: `Index_Cache_${it.project}`, stop: 'success' })
			for (const p of it.projects)
				yield progress(
					t(UI.generatingVectors),
					0,
					/** @type {any} */ ({
						id: `Index_${p}`,
						title: `[${p}]`,
						forceOneLine: true,
						width: 30,
					}),
				)
		}
		if (it.type === 'tick')
			yield progress(`${it.project} ${it.file}`, it.current, {
				id: `Index_${it.project}`,
				total: it.total,
				forceOneLine: true,
				width: 30,
			})
		if (!this.silent && it.type === 'projectCached')
			yield show(t(UI.projectCached, { name: it.name, dir: it.dir }), 'info')
		if (!this.silent && it.type === 'projectIndexed')
			yield show(t(UI.projectIndexed, { name: it.name, files: it.files, dir: it.dir }), 'success')
	}

	/**
	 * @param {object} deps
	 * @param {any} deps.show
	 * @param {any} deps.progress
	 */
	async *indexAgents({ show, progress }) {
		const { t } = this._
		if (!this.silent) yield show(t(IndexWorkspaceApp.UI.agentsStart), 'info')

		const fs = await import('node:fs')
		const process = await import('node:process')
		let workspaceRoot = path.resolve(/** @type {any} */ (this._).workspaceRoot || process.cwd())
		let current = workspaceRoot
		while (current && current !== '/') {
			if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
				workspaceRoot = current
				break
			}
			const parent = path.dirname(current)
			if (parent === current) break
			current = parent
		}

		const db = this._.db
		const workspaceDb = /** @type {any} */ (this._).workspaceDb || new DBFS({ root: workspaceRoot })

		const storeDb = /** @type {any} */ (this._).storeDb || new DBFS({ root: storeDir })

		const projects = await this._getProjectsToIndex(storeDb, workspaceRoot)

		if (projects.length === 0) {
			if (!this.silent) yield show(`No projects found in global store at ${storeDir}.`, 'error')
			return
		}

		yield progress('Scanning packages for nan0web.nan0...', 0, { id: 'Agents_Index', width: 30 })

		const allAgents = []
		let scanned = 0

		for (const proj of projects) {
			const configPath = path.join(proj.dir, 'nan0web.nan0')
			let config = await workspaceDb.loadDocument('/' + configPath, null).catch(() => null)
			if (typeof config === 'string') {
				config = parseNAN0(config)
			}

			if (config && Array.isArray(config.agents)) {
				for (const agent of config.agents) {
					allAgents.push({
						id: agent.id,
						package: proj.name,
						description: agent.description || '',
						workflows: agent.workflows || [],
						inspectors: agent.inspectors || [],
					})
				}
			}
			scanned++
			yield progress(`[${proj.name}]`, (scanned / projects.length) * 100, {
				id: 'Agents_Index',
				width: 30,
			})
		}

		yield progress('', 100, { id: 'Agents_Index', stop: 'success' })

		const indexPath = '/nan0web_agents.index.nan0'
		const _db = /** @type {any} */ (db)
		await _db.saveDocument(indexPath, {
			generatedAt: new Date().toISOString(),
			total: allAgents.length,
			agents: allAgents,
		})
		if (!this.silent)
			yield show(
				t('Agents indexed: {agents} agents in {projects} packages.', {
					agents: allAgents.length,
					projects: projects.length,
				}),
				'success',
			)
	}

	async _getProjectsToIndex(storeDb, workspaceRoot) {
		const projects = []
		const stores = ['nan0web_store.csv', 'nan0web_store.local.csv']

		// Try loading from global store
		for (const s of stores) {
			const rows = await storeDb.loadDocumentAs('.csv', s, null).catch(() => null)
			if (Array.isArray(rows)) {
				for (const row of rows) {
					if (!row.path) continue
					let dir = row.path
					if (dir.startsWith(workspaceRoot)) {
						dir = dir.slice(workspaceRoot.length).replace(/^[\\/]+/, '')
					}
					projects.push({ name: row.name, dir })
				}
			}
		}

		// Fallback: if no projects found in global store, use idiomatic DBFS on workspaceRoot
		if (projects.length === 0 && workspaceRoot) {
			try {
				const { DBFS } = await import('@nan0web/db-fs')
				const workspaceDb = /** @type {any} */ (this._).workspaceDb || new DBFS({ root: workspaceRoot })
				
				const targets = ['packages', 'apps']
				for (const target of targets) {
					for await (const entry of workspaceDb.browse(target, { depth: 0, includeDirs: true })) {
						if (!entry.stat.isDirectory || entry.name.startsWith('.') || entry.name.startsWith('_') || entry.name === 'node_modules' || entry.name === 'dist') continue
						projects.push({ name: entry.name, dir: `${target}/${entry.name}` })
					}
				}
			} catch (e) {
				// Silent catch, fallback might fail if directories don't exist
			}
		}

		return projects
	}
}

/**
 * Parses raw YAML/nan0 string into structured object for agents config.
 * @param {string} content
 * @returns {any}
 */
function parseNAN0(content) {
	if (!content) return null
	const lines = content.split('\n')
	const agents = []
	let currentAgent = null
	let inWorkflows = false
	let inInspectors = false

	for (const line of lines) {
		const trimmed = line.trim()
		if (trimmed.startsWith('- id:')) {
			currentAgent = {
				id: trimmed.split(':')[1].replace(/['"]/g, '').trim(),
				description: '',
				workflows: [],
				inspectors: [],
			}
			agents.push(currentAgent)
			inWorkflows = false
			inInspectors = false
		} else if (currentAgent) {
			if (trimmed.startsWith('description:')) {
				currentAgent.description = trimmed
					.substring(trimmed.indexOf(':') + 1)
					.replace(/['"]/g, '')
					.trim()
			} else if (trimmed.startsWith('workflows:')) {
				inWorkflows = true
				inInspectors = false
			} else if (trimmed.startsWith('inspectors:')) {
				inInspectors = true
				inWorkflows = false
			} else if (trimmed.startsWith('-') && inWorkflows) {
				currentAgent.workflows.push(trimmed.replace('-', '').replace(/['"]/g, '').trim())
			} else if (trimmed.startsWith('-') && inInspectors) {
				currentAgent.inspectors.push(trimmed.replace('-', '').replace(/['"]/g, '').trim())
			}
		}
	}
	return { agents }
}

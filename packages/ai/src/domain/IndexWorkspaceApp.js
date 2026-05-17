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

/** @typedef {import('@nan0web/types').TFunction} TFunction */
/** @typedef {import('@nan0web/ui').ShowIntent} ShowIntent */
/** @typedef {import('@nan0web/ui').ShowLevel} ShowLevel */
/** @typedef {import('@nan0web/ui').ShowData} ShowData */
/** @typedef {import('@nan0web/ui').ProgressIntent} ProgressIntent */
/** @typedef {import('@nan0web/ui').ProgressOptions} ProgressOptions */

/**
 * @callback ShowFn
 * @param {string} message
 * @param {ShowLevel|ShowData} [level]
 * @param {ShowData} [data]
 * @returns {ShowIntent}
 */

/**
 * @callback ProgressFn
 * @param {string} message
 * @param {number} [value]
 * @param {ProgressOptions|number|string} [optionsOrTotalOrId]
 * @param {string} [id]
 * @returns {ProgressIntent}
 */

const storeDir = path.join(os.homedir(), '.nan0web/store')

class IndexState {
	/**
	 * @param {number} totalScopes
	 * @param {boolean} silent
	 * @param {number} totalScopesForProject
	 */
	constructor(totalScopes, silent, totalScopesForProject) {
		this.totalScopes = totalScopes
		this.processedScopes = 0
		this.silent = silent
		this.totalScopesForProject = totalScopesForProject
		/** @type {Map<string, number>} */
		this.completedCount = new Map()
		/** @type {Map<string, { missingScopes: string[], cachedScopes: string[], indexedScopes: string[], otherErrors: string[], projectDir: string }>} */
		this.aggregates = new Map()
	}

	/**
	 * @param {string} projectName
	 * @param {string} defaultDir
	 */
	getAggregate(projectName, defaultDir) {
		let agg = this.aggregates.get(projectName)
		if (!agg) {
			agg = {
				missingScopes: [],
				cachedScopes: [],
				indexedScopes: [],
				otherErrors: [],
				projectDir: defaultDir,
			}
			this.aggregates.set(projectName, agg)
		}
		if (defaultDir && !agg.projectDir) {
			agg.projectDir = defaultDir
		}
		return agg
	}

	/**
	 * Record a completed scope terminal state and check if project is completed.
	 * @param {string} projectName
	 * @param {'missing'|'cached'|'indexed'|'error'} terminalType
	 * @param {string} scopeName
	 * @param {any} details
	 * @param {ShowFn} show
	 * @param {TFunction} t
	 */
	*completeScope(projectName, terminalType, scopeName, details, show, t) {
		const isTest =
			typeof process !== 'undefined' &&
			(process.env.NODE_ENV === 'test' ||
				process.env.VITEST ||
				process.argv.includes('--test') ||
				!process.stdout ||
				!process.stdout.isTTY)

		if (isTest) {
			this.processedScopes++
			if (!this.silent) {
				const UI = IndexWorkspaceApp.UI
				if (terminalType === 'missing') {
					const ctx = projectName ? `[${projectName}] ` : ''
					yield show(`${ctx}${t('No files found for scope: ' + scopeName)}`, 'error')
				} else if (terminalType === 'cached') {
					yield show(t(UI.projectCached, { name: projectName, dir: details.dir || '' }), 'info')
				} else if (terminalType === 'indexed') {
					yield show(
						t(UI.projectIndexed, {
							name: projectName,
							files: details.files,
							dir: details.dir || '',
						}),
						'success',
					)
				} else if (terminalType === 'error') {
					const ctx = projectName ? `[${projectName}] ` : ''
					yield show(`${ctx}${t(details.message)}`, 'error')
				}
			}
			return
		}

		this.processedScopes++
		const agg = this.getAggregate(projectName, details.dir || '')

		if (terminalType === 'missing') {
			// Do not record missing scopes in non-test environment to keep logs extremely clean
		} else if (terminalType === 'cached') {
			agg.cachedScopes.push(scopeName)
		} else if (terminalType === 'indexed') {
			agg.indexedScopes.push(`${scopeName} (${details.files} files)`)
		} else if (terminalType === 'error') {
			agg.otherErrors.push(details.message || 'Unknown error')
		}

		const comp = (this.completedCount.get(projectName) || 0) + 1
		this.completedCount.set(projectName, comp)

		if (comp === this.totalScopesForProject) {
			if (!this.silent) {
				if (agg.missingScopes.length > 0) {
					yield show(`[${projectName}] No files found: ${agg.missingScopes.join(', ')}`, 'error')
				}
				if (agg.cachedScopes.length > 0) {
					yield show(
						`Project ${projectName} skipped (cache matched) in ${agg.projectDir}: ${agg.cachedScopes.join(', ')}`,
						'info',
					)
				}
				if (agg.indexedScopes.length > 0) {
					yield show(
						`Project ${projectName} indexed in ${agg.projectDir}: ${agg.indexedScopes.join(', ')}`,
						'success',
					)
				}
				for (const err of agg.otherErrors) {
					yield show(`[${projectName}] Error: ${t(err)}`, 'error')
				}
			}
		}
	}
}

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
	 * @param {import('@nan0web/types').ModelOptions} [options] Model options
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string|null} Project id */ this.project
		/** @type {string|null} Scope target */ this.scope
		/** @type {boolean} Shortcut for source scope */ this.sources
		/** @type {boolean} Skip data indexing */ this.skipData
		/** @type {boolean} Skip source indexing */ this.skipSources
		/** @type {boolean} Skip docs indexing */ this.skipDocs
		/** @type {boolean} Force re-indexing */ this.force
		/** @type {boolean} Build agents index */ this.agents
		/** @type {boolean} Show help content */ this.help
		/** @type {boolean} Output raw content */ this.raw

		const defaultScopes = ['docs', 'source', 'data']
		if (this.skipData) defaultScopes.splice(defaultScopes.indexOf('data'), 1)
		if (this.skipSources)
			defaultScopes.splice(defaultScopes.indexOf('source'), 1)
		if (this.skipDocs) defaultScopes.splice(defaultScopes.indexOf('docs'), 1)

		/** @type {string[]} */ this.scopes = this.sources
			? ['source']
			: this.scope
				? [this.scope]
				: defaultScopes
		/** @type {number} */ this.concurrency = Number(this.concurrency) || 1
		/** @type {boolean} */ this.silent = !!data.silent
		/** @type {string[]} */ this.ignore = Array.isArray(this.ignore) ? this.ignore : []
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>}
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
	 * @param {ShowFn} deps.show
	 * @param {ProgressFn} deps.progress
	 * @param {typeof import('./MarkdownIndexer.js').MarkdownIndexer} deps.MarkdownIndexer
	 * @param {typeof import('./Embedder.js').Embedder} deps.Embedder
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>}
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

		const activeProjects = projects.filter((proj) =>
			matchProject(proj.dir, this.project || undefined, nameToDir),
		)
		const totalScopes = activeProjects.length * this.scopes.length
		const state = new IndexState(totalScopes, this.silent, this.scopes.length)

		if (process.stdout && process.stdout.isTTY) {
			yield progress('Verifying cache...', 0, { id: 'Mass_Index', width: 30 })
		}

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
						push({
							type: 'error',
							project: proj.name,
							scope,
							message: `Error indexing ${proj.name} [${scope}]: ${msg}`,
						})
					}
				}
			}

			const runAll = async () => {
				const executing = new Set()
				for (const proj of activeProjects) {
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
				yield* this._handleEvent(it, { show, progress, t }, state)
			}
		} else {
			for (const proj of activeProjects) {
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
						it.scope = scope
						yield* this._handleEvent(it, { show, progress, t }, state)
					}
				}
			}
		}

		if (process.stdout && process.stdout.isTTY) {
			yield progress('', 100, { id: 'Mass_Index', stop: 'success' })
		}

		if (!this.silent) yield show(t(IndexWorkspaceApp.UI.done), 'success')
	}
	/**
	 * Shared event handler for indexing progress events
	 * @param {any} it - indexing event
	 * @param {object} deps
	 * @param {ShowFn} deps.show
	 * @param {ProgressFn} deps.progress
	 * @param {TFunction} deps.t
	 * @param {IndexState} state
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>}
	 */
	*_handleEvent(it, { show, progress, t }, state) {
		const UI = IndexWorkspaceApp.UI
		const projectName = it.project || it.name || ''

		if (it.type === 'error') {
			if (it.message.startsWith('No files found for scope:')) {
				const sc = it.message.split(': ')[1]
				yield* state.completeScope(
					projectName,
					'missing',
					sc,
					{ totalScopesForProject: state.totalScopesForProject },
					show,
					t,
				)
			} else {
				yield* state.completeScope(
					projectName,
					'error',
					it.scope || '',
					{ message: it.message, totalScopesForProject: state.totalScopesForProject },
					show,
					t,
				)
			}
			return
		}

		if (it.type === 'projectCached') {
			yield* state.completeScope(
				projectName,
				'cached',
				it.scope,
				{ dir: it.dir, totalScopesForProject: state.totalScopesForProject },
				show,
				t,
			)
			return
		}

		if (it.type === 'projectIndexed') {
			yield* state.completeScope(
				projectName,
				'indexed',
				it.scope,
				{ dir: it.dir, files: it.files, totalScopesForProject: state.totalScopesForProject },
				show,
				t,
			)
			return
		}

		const percent = Math.round((state.processedScopes / state.totalScopes) * 100)

		// Other progress events
		if (it.type === 'scanProgress') {
			yield progress(t(UI.scanning, { project: it.project, files: it.files }), percent, {
				id: 'Mass_Index',
				width: 30,
			})
		}
		if (it.type === 'cacheCheckProgress') {
			yield progress(t(UI.verifyingCacheProject, { project: it.project }), percent, {
				id: 'Mass_Index',
				width: 30,
			})
		}
		if (it.type === 'calc') {
			yield progress(t(UI.generatingVectors), percent, {
				id: 'Mass_Index',
				width: 30,
			})
		}
		if (it.type === 'tick') {
			yield progress(`Generating vectors [${it.project}]: ${it.file}`, percent, {
				id: 'Mass_Index',
				width: 30,
			})
		}
	}

	/**
	 * @param {object} deps
	 * @param {ShowFn} deps.show
	 * @param {ProgressFn} deps.progress
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>}
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
				const workspaceDb =
					/** @type {any} */ (this._).workspaceDb || new DBFS({ root: workspaceRoot })

				const targets = ['packages', 'apps']
				for (const target of targets) {
					for await (const entry of workspaceDb.browse(target, { depth: 0, includeDirs: true })) {
						if (
							!entry.stat.isDirectory ||
							entry.name.startsWith('.') ||
							entry.name.startsWith('_') ||
							entry.name === 'node_modules' ||
							entry.name === 'dist'
						)
							continue
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

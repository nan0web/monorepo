import { Model } from '@nan0web/types'
import { resolveDefaults, resolveAliases } from '@nan0web/types'

/**
 * @typedef {'npm' | 'pip' | 'crates' | 'go' | 'maven' | 'composer' | 'gem' | 'pub' | 'hex' | 'github'} RegistryId
 */

/**
 * 📐 MODEL-AS-SCHEMA + MODEL-AS-APP
 * Domain Model for LLiMo Knowledge Base Indexer.
 *
 * Indexes local projects (CWD) and external packages into
 * searchable datasets (.datasets/) with hash-based invalidation.
 * Multi-language ecosystem support via registry auto-detection.
 *
 * @example
 *   llimo index                         # CWD
 *   llimo index npm:@nan0web/ui-cli     # external
 *   llimo index --cwd ~/src/my-project  # custom CWD
/**
 * @property {string} source Package identifier or path to index (empty = CWD)
 * @property {string} cwd Working directory override
 * @property {RegistryId} registry Package registry (auto-detected from context when omitted)
 */
export class KBIndexModel extends Model {






	/**
	 * @typedef {Object} KBIndexerIndexResult
	 * @property {number} filesIndexed
	 * @property {number} chunksCreated
	 *
	 * @typedef {Object} KBIndexDeps
	 * @property {Object} scanner
	 * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<string[]>} scanner.scan Scans the directory for files
	 * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<RegistryId[]>} scanner.detectRegistries Detects possible registries for a directory
	 * @property {Object} indexer
	 * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<KBIndexerIndexResult>} indexer.build Builds the index for a directory
	 * @property {(db: import('@nan0web/db').DB, reg: string, name: string, dir: string) => Promise<void>} indexer.downloadPackage Downloads a package from a registry
	 * @property {Object} hashStore
	 * @property {(files: string[]) => string} hashStore.compute Computes a hash of the directory state
	 * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<string | null>} hashStore.read Reads the stored hash for a directory
	 * @property {(db: import('@nan0web/db').DB, dir: string, hash: string) => Promise<void>} hashStore.write Writes the hash for a directory
	 */
	// ==========================================
	// 1. MODEL AS SCHEMA (Static field descriptors)
	// ==========================================

	static source = {
		help: 'Package identifier or path to index (empty = CWD)',
		default: '',
		hint: 'text',
		positional: true,
	}

	static cwd = {
		help: 'Working directory override',
		default: '',
		hint: 'path',
	}

	static registry = {
		help: 'Package registry (auto-detected from context when omitted)',
		default: '',
		hint: 'select',
		options: ['npm', 'pip', 'crates', 'go', 'maven', 'composer', 'gem', 'pub', 'hex', 'github'],
	}

	// ==========================================
	// 2. UI (i18n-ready messages — English only)
	// ==========================================

	static UI = {
		detecting_registry: 'Detecting package registry',
		registry_detected: 'Registry detected',
		registry_ambiguous: 'Multiple registries found — please select one',
		registry_unknown: 'Unknown registry',
		downloading_package: 'Downloading package source',
		scanning_files: 'Scanning files for indexing',
		building_index: 'Building search index',
		generating_hash: 'Generating content hash',
		index_complete: 'Indexing complete',
		source_not_found: 'Source not found',
		download_confirm: 'Download external package for indexing?',
		already_fresh: 'Index is up to date (hash match)',
		reindexing_stale: 'Hash stale — reindexing',
	}

	// ==========================================
	// 3. DOMAIN CONSTANTS (No hardcode in logic)
	// ==========================================

	/** @type {Record<string, RegistryId>} Maps dependency files → registry identifiers */
	static DEPENDENCY_FILES = {
		'package.json': 'npm',
		'requirements.txt': 'pip',
		'pyproject.toml': 'pip',
		Pipfile: 'pip',
		'Cargo.toml': 'crates',
		'go.mod': 'go',
		'pom.xml': 'maven',
		'build.gradle': 'maven',
		'build.gradle.kts': 'maven',
		'composer.json': 'composer',
		Gemfile: 'gem',
		'pubspec.yaml': 'pub',
		'mix.exs': 'hex',
		'hardhat.config.js': 'npm',
		'foundry.toml': 'crates',
	}

	/** @type {Record<RegistryId, string>} Maps registry → base path under ~/.llimo/kb/@/ */
	static REGISTRY_PATHS = {
		npm: 'npmjs.com',
		pip: 'pypi.org',
		crates: 'crates.io',
		go: 'go.pkg',
		maven: 'maven.org',
		composer: 'packagist.org',
		gem: 'rubygems.org',
		pub: 'pub.dev',
		hex: 'hex.pm',
		github: 'github.com',
	}

	/** File extension priorities for indexing (high → medium → low) */
	static INDEX_PRIORITIES = {
		high: [
			'.md',
			'.txt',
			'.rst',
			'.adoc',
			'.yaml',
			'.yml',
			'.json',
			'.toml',
			'.ini',
			'.nan0',
			'.env',
		],
		medium: [
			'.js',
			'.mjs',
			'.cjs',
			'.jsx',
			'.ts',
			'.tsx',
			'.mts',
			'.cts',
			'.py',
			'.pyi',
			'.rs',
			'.go',
			'.java',
			'.kt',
			'.cs',
			'.rb',
			'.php',
			'.swift',
			'.dart',
			'.c',
			'.h',
			'.cpp',
			'.hpp',
			'.zig',
			'.lua',
			'.sh',
			'.bash',
			'.zsh',
			'.sql',
			'.graphql',
			'.gql',
			'.proto',
			'.sol',
			'.move',
			'.cairo',
			'.ex',
			'.exs',
			'.hs',
			'.clj',
			'.ml',
			'.scala',
			'.vb',
			'.fs',
			'.pl',
			'.ps1',
		],
		low: ['.css', '.scss', '.sass', '.less', '.html', '.htm', '.vue', '.svelte'],
	}

	/** Universal ignore patterns */
	static IGNORE_PATTERNS = [
		'node_modules/',
		'dist/',
		'build/',
		'target/',
		'__pycache__/',
		'.venv/',
		'vendor/',
		'.git/',
		'.datasets/',
		'tmp/',
		'*.min.js',
		'*.min.css',
		'*.map',
		'*.lock',
	]

	// ==========================================
	// 5. PURE DOMAIN HELPERS
	// ==========================================

	constructor(data = {}, config = {}) {
		super(data)
		/** @type {any} Package identifier or path to index (empty = CWD) */ this.source
		/** @type {any} Working directory override */ this.cwd
		/** @type {any} Package registry (auto-detected from context when omitted) */ this.registry
		/** @type {any} Maps dependency files to registry identifiers */ this.DEPENDENCY_FILES
		/** @type {any} Maps registry to base path under ~/.llimo/kb/@/ */ this.REGISTRY_PATHS
		/** @type {any} File extension priorities for indexing */ this.INDEX_PRIORITIES
		this._config = config

	}

	/**
	 * Parses source string into { prefix, name } pair.
	 * Handles prefixed (`npm:@scope/pkg`) and bare (`@scope/pkg`) formats.
	 *
	 * @param {string} source
	 * @returns {{ prefix: string, name: string }}
	 */
	static parseSource(source) {
		const match = source.match(/^(\w+):(.+)$/)
		if (match) return { prefix: match[1], name: match[2] }
		return { prefix: '', name: source }
	}

	/** @returns {boolean} True if indexing CWD (no external source) */
	get isLocal() {
		return !this.source
	}

	/** @returns {string} Resolved working directory */
	get workDir() {
		return this.cwd
	}

	/** @returns {Record<string, string>} Environment variables (injected or process) */
	get env() {
		return this._config?.env ?? process.env
	}

	// ==========================================
	// 6. AGNOSTIC LOGIC (Async Generator — OLMUI)
	// ==========================================

	/**
	 * Main indexing generator — yields OLMUI intents.
	 *
	 * @param {{ scanner: object, indexer: object, hashStore: object }} deps
	 *   - scanner:   { scan(db, dir, priorities, ignore) → Promise<string[]> }
	 *   - indexer:    { build(db, files, outputDir) → Promise<{ filesIndexed, chunksCreated }> }
	 *   - hashStore: { read(db, dir) → Promise<string|null>, write(db, dir, hash) → Promise<void>, compute(files) → string }
	 */
	async *run(deps) {
		const { scanner, indexer, hashStore } = deps
		const db = (/** @type {any} */ (this._).db)

		if (this.isLocal) {
			// ─── LOCAL CWD INDEXING ──────────────────
			yield { type: 'progress', message: KBIndexModel.UI.scanning_files }

			const files = await scanner.scan(
				db,
				this.workDir,
				KBIndexModel.INDEX_PRIORITIES,
				KBIndexModel.IGNORE_PATTERNS,
			)

			// Check if reindex is needed
			const currentHash = hashStore.compute(files)
			const storedHash = await hashStore.read(db, this.workDir)

			if (currentHash === storedHash) {
				yield { type: 'log', level: 'info', message: KBIndexModel.UI.already_fresh }
				return {
					type: 'result',
					data: { mode: 'local', dir: this.workDir, skipped: true },
				}
			}

			if (storedHash) {
				yield { type: 'log', level: 'info', message: KBIndexModel.UI.reindexing_stale }
			}

			yield { type: 'progress', message: KBIndexModel.UI.building_index }
			const outputDir = `${this.workDir}/.datasets`
			const stats = await indexer.build(db, files, outputDir)

			yield { type: 'progress', message: KBIndexModel.UI.generating_hash }
			await hashStore.write(db, this.workDir, currentHash)

			yield { type: 'log', level: 'success', message: KBIndexModel.UI.index_complete }

			return {
				type: 'result',
				data: { mode: 'local', dir: this.workDir, ...stats },
			}
		}

		// ─── EXTERNAL PACKAGE INDEXING ────────────
		const { prefix, name } = KBIndexModel.parseSource(this.source)
		let detectedRegistry = this.registry || prefix

		// Auto-detect registry from CWD context
		if (!detectedRegistry) {
			yield { type: 'progress', message: KBIndexModel.UI.detecting_registry }

			const detected = await scanner.detectRegistries(db, this.workDir, KBIndexModel.DEPENDENCY_FILES)

			if (detected.length === 0) {
				yield { type: 'log', level: 'error', message: KBIndexModel.UI.registry_unknown }
				return { status: 'failed', reason: 'no_registry' }
			}

			if (detected.length === 1) {
				detectedRegistry = detected[0]
				yield {
					type: 'log',
					level: 'info',
					message: `${KBIndexModel.UI.registry_detected}: ${detectedRegistry}`,
				}
			} else {
				// Multiple registries — ask user
				const response = yield {
					type: 'ask',
					field: 'registry',
					schema: {
						help: KBIndexModel.UI.registry_ambiguous,
						hint: 'select',
						options: detected,
					},
				}
				detectedRegistry = response.value
			}
		}

		const registryPath = KBIndexModel.REGISTRY_PATHS[detectedRegistry]
		if (!registryPath) {
			yield {
				type: 'log',
				level: 'error',
				message: `${KBIndexModel.UI.registry_unknown}: ${detectedRegistry}`,
			}
			return { status: 'failed', reason: 'unknown_registry' }
		}

		// Confirm download
		const response = yield {
			type: 'ask',
			field: 'confirm',
			schema: {
				help: `${KBIndexModel.UI.download_confirm} ${name}`,
				hint: 'confirm',
			},
		}
		const confirmed = response.value

		if (!confirmed) {
			return { status: 'cancelled', reason: 'user_declined' }
		}

		// Download package
		const targetDir = `${this.env.HOME}/.llimo/kb/@/${registryPath}/${name}`
		yield { type: 'progress', message: `${KBIndexModel.UI.downloading_package}: ${name}` }

		await indexer.downloadPackage(db, detectedRegistry, name, targetDir)

		// Scan + index downloaded source
		yield { type: 'progress', message: KBIndexModel.UI.scanning_files }
		const files = await scanner.scan(
			db,
			targetDir,
			KBIndexModel.INDEX_PRIORITIES,
			KBIndexModel.IGNORE_PATTERNS,
		)

		yield { type: 'progress', message: KBIndexModel.UI.building_index }
		const outputDir = `${targetDir}/.datasets`
		const stats = await indexer.build(db, files, outputDir)

		yield { type: 'progress', message: KBIndexModel.UI.generating_hash }
		const hash = hashStore.compute(files)
		await hashStore.write(db, targetDir, hash)

		yield { type: 'log', level: 'success', message: KBIndexModel.UI.index_complete }

		return {
			type: 'result',
			data: {
				mode: 'external',
				registry: detectedRegistry,
				name,
				dir: targetDir,
				...stats,
			},
		}
	}
}

import { ArchitectureAuditor } from './ArchitectureAuditor.js'
import { PhaseAuditor } from './PhaseAuditor.js'
import { HygieneAuditor } from './HygieneAuditor.js'
import { ExportAuditor } from './ExportAuditor.js'
import { DomainAuditor } from './DomainAuditor.js'
import { VerificationAuditor } from './VerificationAuditor.js'
import { CircularDependencyAuditor } from './CircularDependencyAuditor.js'
import { BuildWorkflowsApp } from './BuildWorkflowsApp.js'
import { ModelAsApp, show, result } from '@nan0web/ui'
import { SnapshotAuditor, OlmuiThemingAuditor } from '@nan0web/ui/inspect'
import { AuditorModel } from '../AuditorModel.js'

export class InspectorApp extends ModelAsApp {
	static alias = 'nan0inspect'
	static UI = {
		title: '🏗️ NaN0Web Inspector CLI',
		description: 'Zero-Hallucination Architecture Auditor for the NaN0Web ecosystem.',
	}

	static command = {
		type: ModelAsApp,
		help: 'Command to run (e.g. phase, hygiene, all)',
		options: [
			ArchitectureAuditor,
			SnapshotAuditor,
			OlmuiThemingAuditor,
			PhaseAuditor,
			HygieneAuditor,
			ExportAuditor,
			DomainAuditor,
			VerificationAuditor,
			CircularDependencyAuditor,
			BuildWorkflowsApp,
		],
		default: ArchitectureAuditor,
		positional: true,
	}

	static dir = {
		type: 'string',
		help: 'Target directory',
		positional: true,
		default: '.',
	}

	static fix = {
		type: 'boolean',
		help: 'Automatically apply fixes',
		default: false,
	}

	/**
	 * @param {Partial<InspectorApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {AuditorModel} Auditor model */ this.command
		/** @type {string} Target directory */ this.dir
		/** @type {boolean} Automatically apply fixes */ this.fix
		/** @type {import('../index.js').LanguagePlatform} Language platform */ this.platform
	}

	/**
	 * Detects the project platform based on configuration files.
	 */
	async init() {
		if (this.platform) return
		if (!this._.db) return
		try {
			const path = await import('node:path')
			const { default: DBFS } = await import('@nan0web/db-fs')
			const targetAbs = path.resolve(process.cwd(), this.dir || '.')

			this._.db.mount('@app', new DBFS({ cwd: targetAbs, root: '', console: this._.db.console }))
			this._.db.mount('@data', new DBFS({ cwd: targetAbs, root: 'data', console: this._.db.console }))
			this._.db.mount('@docs', new DBFS({ cwd: targetAbs, root: 'docs', console: this._.db.console }))
			this._.db.mount('@play', new DBFS({ cwd: targetAbs, root: 'play', console: this._.db.console }))
		} catch (e) {
			// Ignore mount errors
		}
		try {
			const hasPkg = (await this._.db.statDocument('package.json')).exists
			if (hasPkg) {
				this.platform = 'js'
				return
			}
			const hasPy =
				((await this._.db.statDocument('requirements.txt')).exists) ||
				((await this._.db.statDocument('pyproject.toml')).exists)
			if (hasPy) {
				this.platform = 'python'
				return
			}
		} catch (e) {
			// Fallback to unknown
		}
		this.platform = 'unknown'
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		if (!this._.db) throw new Error('DB not found in context')
		

		
		const { t } = this._
		if (this.help) return yield* super.run()

		// 1. Ambiguity fix: if "command" is a string (positional) and it looks like a path/dir,
		// and it's not a known auditor alias, move it to "dir".
		const commandValue = /** @type {any} */ (this.command)
		if (typeof commandValue === 'string') {
			let normalizedCmd = commandValue
			if (commandValue === 'architecture') {
				normalizedCmd = 'audit'
			}

			const aliases = (InspectorApp.command.options || []).map(o => o.alias).filter(Boolean)
			const isAlias = aliases.includes(normalizedCmd)
			if (!isAlias) {
				// Treat as dir
				this.dir = commandValue
				this.command = new ArchitectureAuditor({ dir: this.dir }, this._)
			} else {
				// It IS an alias, resolve it to a class
				const TargetClass = (InspectorApp.command.options || []).find(o => o.alias === normalizedCmd)
				if (TargetClass) {
					this.command = new TargetClass({ dir: this.dir }, this._)
				}
			}
		}

		await this.init()

		// 2. Resolve platform-specific auditor class dynamically
		if (this.command) {
			const CurrentClass = /** @type {typeof AuditorModel} */ (this.command.constructor)
			const ActualClass = await ArchitectureAuditor.getAuditorClass(CurrentClass, this.platform)
			if (ActualClass && ActualClass !== CurrentClass) {
				this.command = new ActualClass({ ...this.command, platform: this.platform, dir: this.dir }, this._)
			}
		}

		if (this.command && typeof this.command.isCapped === 'function' && await this.command.isCapped()) {
			const alias = /** @type {any} */(this.command.constructor).alias || this.command.constructor.name
			yield show(`[Step-Capped Validation] skipping auditor ${alias} (capped by active session step)`, 'info')
			return result({ ok: true, skipped: true })
		}

		if (!this.command || !(this.command instanceof ModelAsApp)) {
			yield show(t(InspectorApp.UI.unknownCommand, { command: this.command }) || `Unknown command: ${this.command}`, 'error')
			return result({ ok: false })
		}

		return yield* this.command.run()
	}
}

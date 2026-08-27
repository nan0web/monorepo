import { ModelAsApp } from '@nan0web/ui-cli'
import fs from 'node:fs/promises'
import path from 'node:path'
import { TransformModel } from '../models/TransformModel.js'
import { SeedModel } from '../models/SeedModel.js'
import { MediaMigrateModel } from '../models/MediaMigrateModel.js'
import { NewsMigrateModel } from '../models/NewsMigrateModel.js'
import { MediaVerifyModel } from '../models/MediaVerifyModel.js'

/**
 * PayloadCmsApp - Main application controller.
 */
export class PayloadCmsApp extends ModelAsApp {
	static alias = 'nan0cms'

	static UI = {
		title: 'NaN0Web Payload CMS Bridge & Generator',
	}

	static command = {
		help: 'Command to execute',
		options: [
			TransformModel,
			SeedModel,
			MediaMigrateModel,
			NewsMigrateModel,
			MediaVerifyModel,
		],
		positional: true,
		default: TransformModel,
	}

	/**
	 * @param {Partial<PayloadCmsApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {ModelAsApp} Injected subcommand instance */ this.command
		/** @type {string} */ this.model
	}

	/**
	 * Resolves custom SeedModel class from --model flag or package.json exports.
	 * @returns {Promise<Function|null>}
	 */
	async resolveCustomSeedModel() {
		let modelRelativePath = this.model

		if (!modelRelativePath) {
			try {
				const pkgPath = path.resolve(process.cwd(), 'package.json')
				const pkgContent = JSON.parse(await fs.readFile(pkgPath, 'utf8'))
				const customSeedExport =
					pkgContent?.exports?.['./nan0cms/seed/model'] ||
					pkgContent?.exports?.['./seed/model'] ||
					pkgContent?.nan0cms?.seed?.model

				if (customSeedExport && typeof customSeedExport === 'string') {
					modelRelativePath = customSeedExport
				}
			} catch {
				// No package.json or unreadable
			}
		}

		if (modelRelativePath) {
			try {
				const absolutePath = modelRelativePath.startsWith('/')
					? modelRelativePath
					: path.resolve(process.cwd(), modelRelativePath)
				const importedModule = await import(absolutePath)
				const CustomModelClass =
					importedModule.BankSeedModel ||
					importedModule.SeedModel ||
					Object.values(importedModule).find(
						(exp) => typeof exp === 'function' && (exp.alias === 'seed' || exp.alias === 'bank-seed' || exp.name?.includes('Seed'))
					) ||
					Object.values(importedModule).find((exp) => typeof exp === 'function')

				return CustomModelClass || null
			} catch (err) {
				console.warn(`  ⚠️ Could not load custom SeedModel from ${modelRelativePath}: ${err.message}`)
			}
		}

		return null
	}

	/**
	 * Run the main controller logic.
	 * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, any, any>}
	 */
	async *run() {
		if (this.help || !this.command || typeof this.command.run !== 'function') {
			return yield* super.run()
		}

		// Auto-discover and support dynamic SeedModel instantiation
		if (this.command instanceof SeedModel || this.command?.constructor?.alias === 'seed') {
			const CustomSeedModelClass = await this.resolveCustomSeedModel()
			if (CustomSeedModelClass) {
				const customInstance = new CustomSeedModelClass(this.command?._raw || this.command || {}, this._)
				return yield* customInstance.run()
			}
		}

		return yield* this.command.run()
	}
}

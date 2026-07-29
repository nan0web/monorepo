import { Model } from '@nan0web/types'
import { loadModels } from '../Chat/models.js'
import { autocomplete } from '../cli/autocomplete.js'
import { ModelsOptions } from '../cli/ModelsOptions.js'

/**
 * ModelsModel — Model-as-Schema representation for loading, filtering, and browsing LLM models.
 */
export class ModelsModel extends Model {
	static alias = 'models'

	static filter = {
		help: ModelsOptions.filter.help,
		default: '',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Filter query for model filtering */ this.filter
	}

	async *run() {
		const { Ui } = await import('../cli/Ui.js')
		const ui = new Ui({ debugMode: false })
		const modelMap = await loadModels({ ui, noCache: false })

		if (this.filter) {
			const opt = new ModelsOptions({ filter: this.filter })
			const predicates = opt.getFilters()
			const filtered = new Map()
			for (const [id, model] of modelMap.entries()) {
				if (predicates.every((fn) => fn(model))) {
					filtered.set(id, model)
				}
			}
			const rows = autocomplete.modelRows(filtered)
			autocomplete.pipeOutput(rows, ui)
			return { status: 'ok' }
		}

		const isPipe = !process.stdout.isTTY || (/** @type {any} */ (this)._argv && /** @type {any} */ (this)._argv[0] === '>')
		if (isPipe) {
			const allModels = autocomplete.modelRows(modelMap)
			autocomplete.pipeOutput(allModels, ui)
		} else {
			ui.console.info('Loading models... (press /help for usage)\n')
			await autocomplete.interactive(modelMap, ui)
		}

		return { status: 'ok' }
	}
}

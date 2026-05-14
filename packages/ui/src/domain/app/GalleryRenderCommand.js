import SnapshotRunner from './SnapshotRunner.js'

import { show, result } from '../../core/Intent.js'
import { ModelAsApp } from '../index.js'

export class GalleryRenderCommand extends ModelAsApp {
	static alias = 'render'

	static UI = {
		rendering: '📸 Rendering gallery from {dataDir} to {dir}',
		success: '✅ Gallery render complete',
		failed: '🚨 Gallery render failed: {error}',
	}

	static dataDir = {
		type: 'string',
		default: 'docs/data',
		help: 'Path to source models directory'
	}

	static dir = {
		type: 'string',
		default: 'snapshots/core',
		help: 'Path to output snapshots directory'
	}

	/**
	 * @param {Partial<GalleryRenderCommand> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.dataDir
		/** @type {string} */ this.dir
	}

	/**
	 * @returns {AsyncGenerator<import('../../core/Intent.js').Intent, import('../../core/Intent.js').ResultIntent, any>}
	 */
	async *run() {
		yield show(this._.t(GalleryRenderCommand.UI.rendering, { dataDir: this.dataDir, dir: this.dir }))

		const snapshotRunner = new SnapshotRunner({
			dataDir: this.dataDir,
			snapshotsDir: this.dir,
			getCategory: (comp) => {
				const groups = {
					Actions: ['Button', 'Toggle'],
					Forms: ['Input', 'Select', 'Slider', 'Autocomplete', 'Color', 'Shadow'],
					Data: ['Accordion', 'Card', 'Sortable', 'Table', 'Tree', 'CodeBlock', 'Markdown', 'Badge'],
					Feedback: ['Alert', 'Confirm', 'Modal', 'ProgressBar', 'Spinner', 'Toast'],
					System: ['LangSelect', 'ThemeToggle'],
				}
				for (const [cat, comps] of Object.entries(groups)) {
					if (comps.includes(comp)) return cat
				}
				return 'Other'
			}
		}, this._)

		try {
			const res = yield* snapshotRunner.run()
			if (res.data && res.data.success) {
				yield show(this._.t(GalleryRenderCommand.UI.success, {}))
			} else {
				yield show(this._.t(GalleryRenderCommand.UI.failed, { error: 'Audit failed' }), 'error')
				return result({ status: 'error' })
			}
		} catch (error) {
			yield show(this._.t(GalleryRenderCommand.UI.failed, { error: /** @type {Error} */ (error).message }), 'error')
			return result({ status: 'error' })
		}
		return result({})
	}
}

export default GalleryRenderCommand

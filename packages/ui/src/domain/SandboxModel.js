import { Model } from '@nan0web/types'
import { BreadcrumbModel } from './components/BreadcrumbModel.js'
import { show, result, ask } from '../core/Intent.js'

/**
 * SandboxModel — OLMUI Model-as-Schema
 * Environment for testing and previewing UI components with dynamic property editing.
 */
export class SandboxModel extends Model {
	static $id = '@nan0web/ui/SandboxModel'

	static UI = {
		breadcrumb: '\n{path}',
		componentsHelp: 'List of registered UI components available for inspection',
		selectedComponentHelp: 'The component currently being inspected in the sandbox',
		selectedComponentPlaceholder: 'Button',
		themeFormatHelp: 'The file format chosen to export the custom theme configuration',
		selectComponentHelp: 'Select a component to inspect',
		configurePropertiesHelp: 'Configure {component} properties',
		exportFormatHelp: 'Choose export format',
	}

	static components = {
		help: SandboxModel.UI.componentsHelp,
		type: 'string[]',
		default: [],
	}

	static selectedComponent = {
		help: 'The component currently being inspected in the sandbox',
		placeholder: 'Button',
		default: '',
	}

	static themeFormat = {
		help: 'The file format chosen to export the custom theme configuration',
		options: ['yaml', 'css', 'json'],
		default: 'yaml',
	}

	/**
	 * @param {Partial<SandboxModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string[]} List of registered UI components available for inspection */ this
			.components
		/** @type {string} The component currently being inspected in the sandbox */ this
			.selectedComponent
		/** @type {'yaml'|'css'|'json'} The file format chosen to export the custom theme configuration */ this
			.themeFormat
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		/** @type {any} */
		let lastResponse = null

		while (true) {
			const nav = new BreadcrumbModel({ items: ['Sandbox'] })

			if (!this.selectedComponent) {
				// Show breadcrumb
				yield show(this._.t(SandboxModel.UI.breadcrumb, { path: String(nav) }), 'info', {
					component: 'Breadcrumbs',
					model: nav,
				})

				const response = yield {
					type: 'ask',
					field: 'selectedComponent',
					schema: {
						help: 'Select a component to inspect',
						options: this.components || [],
					},
					component: 'Select',
					model: this,
				}
				this.selectedComponent = response.value
				if (!this.selectedComponent) break
			}

			nav.push(this.selectedComponent, this.selectedComponent)

			// 2. Component Configuration Mode
			let configResponse
			try {
				yield show(this._.t(SandboxModel.UI.breadcrumb, { path: String(nav) }), 'info', {
					component: 'Breadcrumbs',
					model: nav,
				})

				configResponse = yield {
					type: 'ask',
					field: 'config',
					schema: { help: `Configure ${this.selectedComponent} properties` },
					component: 'PropertyEditor',
					model: this, // Passes the whole Sandbox context
				}
			} catch (e) {
				this.selectedComponent = ''
				continue
			}

			if (configResponse.cancelled) {
				this.selectedComponent = ''
				continue
			}

			// 3. Theme Export Mode
			try {
				nav.push('Export', 'export')
				yield show(this._.t(SandboxModel.UI.breadcrumb, { path: String(nav) }), 'info', {
					component: 'Breadcrumbs',
					model: nav,
				})

				const themeResponse = yield {
					type: 'ask',
					field: 'themeFormat',
					schema: {
						help: 'Choose export format',
						options: SandboxModel.themeFormat.options,
					},
					component: 'Select',
					model: this,
				}
				this.themeFormat = themeResponse.value
			} catch (e) {
				// stay on results
			}

			return {
				type: 'result',
				data: {
					component: this.selectedComponent,
					themeConfig: configResponse.value,
					exportFormat: this.themeFormat,
					breadcrumb: nav.path,
				},
			}
		}
	}
}

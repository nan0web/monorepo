import DB from '@nan0web/db-browser'
import Element from './Element.jsx'

export default class AppModule {
	/** @type {string} */
	uri

	/** @type {Object} */
	config

	/** @type {Object} */
	data = {}

	/** @type {DB} */
	db

	/** @type {Object} */
	ui

	/**
	 * @param {string} uri - e.g., "app/currency-calculator"
	 * @param {DB} db
	 */
	constructor(uri, db) {
		this.uri = uri
		this.db = db.extract(uri)
	}

	async load() {
		this.config = (await this.db.fetch('config.json')) || {}
		this.ui = (await this.db.fetch('main.json')) || { $content: [] }
		this.data = (await this.db.fetch('data.json')) || {}
	}

	async run(action) {
		if (action === 'convert') {
			const result = await this.convert(this.data.value, this.data.from, 'USD')
			this.data.result = result
			await this.db.saveDocument(`${this.uri}/data`, this.data)
		}
	}

	async convert(value, from, to) {
		// stub
		return (value / 40).toFixed(2) + ' ' + to
	}

	/**
	 * @param {string|number} key
	 * @param {any} context
	 * @returns {React.ReactNode}
	 */
	render(key, context) {
		return Element.render(this.ui, key, {
			...context,
			app: this,
			bind: (field) => (ev) => {
				this.data[field] = ev.target.value
			},
		})
	}
}

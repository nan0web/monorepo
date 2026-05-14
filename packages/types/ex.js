import { resolveAliases, resolveDefaults, resolveValidation, createT } from './src/index.js'

export class Config {
	static appName = {
		alias: 'name',
		help: 'Application name',
		errorInvalid: 'Invalid application name',
		validate: (value) => (value.trim() ? true : Config.appName.errorInvalid),
		default: '',
	}
	static dsn = {
		help: 'Data source name',
		errorInvalid: 'Invalid DSN: {dsn}',
		validate: (value) =>
			value.trim() && value.startsWith('data/') ? true : [Config.dsn.errorInvalid, { dsn: value }],
		default: 'data/',
	}

	appName = Config.appName.default
	dsn = Config.dsn.default

	/** @param {Partial<Config>} [data] */
	constructor(data = {}) {
		data = resolveAliases(Config, data)
		Object.assign(this, data)
		resolveDefaults(Config, this)
		resolveValidation(Config, this)
	}
}

const t = createT({
	'Invalid application name': 'Невалідна назва програми',
	'Invalid DSN: {dsn}': 'Невалідний DSN: {dsn}',
})

try {
	const config = new Config({
		appName: '',
		dsn: 'https://dsn.com',
	})
} catch (e) {
	if (e.name === 'ModelError') {
		console.log('Original Error:')
		console.log(e.fields)
		const translatedError = e.translate(t)
		console.log('Translated Error:')
		console.log(translatedError.fields)
	} else {
		throw e
	}
}

import { createLogger as viteCreateLogger } from 'vite'
import { DocumentStat } from '@nan0web/db'
import DBFS from '@nan0web/db-fs'

export function createLogger() {
	return viteCreateLogger('info', { prefix: 'nan0web', allowClearScreen: false })
}

/**
 * @param {DBFS} input
 * @param {DBFS} output
 * @param {import('vite').Logger} [logger]
 * @returns {Promise<{total: number, processed: number, ignored: number, updatedURIs: string[]}>}
 */
export async function buildSite(input, output, logger = createLogger()) {
	// @todo clear the output (dist) data if needed
	await input.connect()
	await output.connect()

	logger.info('Loading all input data', { timestamp: true })
	for await (const entry of input.findStream('.')) {
		// loading all entries
	}

	const stats = await input.dump(output)
	output.meta.set('?loaded', new DocumentStat({ isDirectory: true, size: 0 }))
	await output.buildIndexes()

	logger.info(`Build complete: ${stats.processed} files, ${stats.ignored} ignored`, {
		timestamp: true,
	})
	return stats
}

/**
 *
 * @param {Object} input
 * @param {DBFS} input.input
 * @param {DBFS} input.output
 * @param {import('vite').Logger} [input.logger]
 * @returns {object}
 */
export default function nan0webVitePlugin({ input, output, logger = createLogger() }) {
	/**
	 * @param {import('http').IncomingMessage} req
	 * @param {import('http').ServerResponse} res
	 * @param {Function} next
	 */
	async function handleRequest(req, res, next) {
		if (req.url && output.isData(req.url)) {
			try {
				let uri = output.normalize(req.url)
				if (['/'].includes(uri)) uri = '.'
				const stat = await output.statDocument(uri)
				if (stat.exists && stat.isFile) {
					const data = await output.loadDocument(uri)
					res.setHeader('Content-Type', 'application/json')
					res.setHeader('Cache-Control', 'no-cache')
					res.end(JSON.stringify(data))
					return
				}
			} catch (/** @type {any} */ error) {
				logger.error(`Error processing ${req.url}: ${error.message}`, { timestamp: true })
			}
		}

		next()
	}

	return {
		name: 'nan0web-vite-plugin',

		config() {
			return {
				// Завжди дозволяємо доступ до dist
				server: {
					fs: {
						allow: [process.cwd(), input.location('.'), output.location('.')],
					},
				},
			}
		},

		closeBundle: {
			sequential: true,
			async handler() {
				if (process.env.BUILD_COMMAND === 'vite-build') {
					logger.info('Generating nan0web assets after Vite build', { timestamp: true })
					await buildSite(input, output, logger)
				}
			},
		},

		async configureServer(server) {
			// connect to database
			input
				.connect()
				.catch((err) =>
					logger.error(`Failed to connect to input DB: ${err.message}`, { timestamp: true }),
				)

			const inputAny = /** @type {any} */ (input)
			const outputAny = /** @type {any} */ (output)

			inputAny.on?.('change', async (uri) => {
				try {
					// Якщо змінено файл даних
					if (input.isData(uri) && !inputAny.isDirectory(uri)) {
						await inputAny.dumpFile(uri, output)
						await outputAny.buildIndexes(input.dirname(uri))
						logger.info(`Updated: ${uri}`, { timestamp: true })
					}
				} catch (error) {
					const msg = error instanceof Error ? error.message : String(error)
					logger.error(`Error updating ${uri}: ${msg}`, { timestamp: true })
				}
			})

			await buildSite(input, output, logger)

			// Додаємо наш middleware
			server.middlewares.use(handleRequest)
		},
	}
}

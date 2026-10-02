import { getPayload } from 'payload'
import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

/**
 * Universal Plugin to load Payload CMS config and inject the initialized
 * Payload local API instance into application options context.
 *
 * The `appOptions.db` must be a DB instance with an `@app` mount (e.g. @nan0web/db-fs)
 * that exposes a `location(uri: string): string` method returning a real absolute FS path.
 *
 * @param {Object} [options={}]
 * @param {string} [options.configPath] Explicit path to payload config (relative to @app root).
 * @returns {(appOptions: any) => Promise<any>}
 */
export function withPayload(options = {}) {
	return async function payloadPlugin(appOptions = {}) {
		const db = appOptions.db

		// 1. If payload instance already exists, do not recreate
		if (appOptions.payload) {
			return appOptions
		}

		// 2. Get @app mount — it points to the real project CWD (not ./data root)
		const appMount = db?.mounts?.get('@app')

		// 3. Discover configuration file path via real FS existence check
		let resolvedAbsPath = null

		if (options.configPath) {
			// Explicit path: resolve via @app mount or fallback to process.cwd()
			if (appMount && typeof appMount.location === 'function') {
				const abs = appMount.location(options.configPath)
				if (existsSync(abs)) resolvedAbsPath = abs
			}
			if (!resolvedAbsPath) {
				const { resolve, isAbsolute } = await import('node:path')
				const cwd = typeof appOptions.cwd === 'function' ? appOptions.cwd() : appOptions.cwd || process.cwd()
				const abs = isAbsolute(options.configPath) ? options.configPath : resolve(cwd, options.configPath)
				if (existsSync(abs)) resolvedAbsPath = abs
			}
		} else {
			const candidatePaths = [
				'web/payload.config.ts',
				'web/payload.config.js',
				'src/payload.config.ts',
				'src/payload.config.js',
				'payload.config.ts',
				'payload.config.js',
			]

			if (appMount && typeof appMount.location === 'function') {
				// Preferred: use @app mount to get real FS path and check with existsSync
				for (const cand of candidatePaths) {
					const abs = appMount.location(cand)
					if (existsSync(abs)) {
						resolvedAbsPath = abs
						break
					}
				}
			} else {
				// Fallback: resolve relative to cwd
				const { resolve } = await import('node:path')
				const cwd = typeof appOptions.cwd === 'function' ? appOptions.cwd() : appOptions.cwd || process.cwd()
				for (const cand of candidatePaths) {
					const abs = resolve(cwd, cand)
					if (existsSync(abs)) {
						resolvedAbsPath = abs
						break
					}
				}
			}
		}

		// 4. Bail out silently if no config found (bridge app may not have its own payload.config)
		if (!resolvedAbsPath) {
			if (appOptions.logger && typeof appOptions.logger.debug === 'function') {
				appOptions.logger.debug(
					'withPayload plugin: No payload.config found. Run with --cwd <path-to-cms-project> to point to a project with payload.config.ts'
				)
			}
			return appOptions
		}

		// 5. Import config and initialize Payload Local API
		const importTarget = pathToFileURL(resolvedAbsPath).href
		try {
			const configModule = await import(importTarget)
			const config = configModule.default || configModule.config || configModule
			const resolvedConfig = await Promise.resolve(config)

			const payload = await getPayload({ config: resolvedConfig })
			appOptions.payload = payload
		} catch (err) {
			if (appOptions.logger && typeof appOptions.logger.warn === 'function') {
				appOptions.logger.warn(
					`withPayload plugin: Failed to initialize Payload CMS from ${importTarget}: ${err.message}`
				)
			}
		}

		return appOptions
	}
}


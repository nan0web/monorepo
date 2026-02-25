import Logger from '@nan0web/log'

/**
 * Reads package.json from the provided FS‑like instance and returns all
 * dependencies that start with `@nan0web/`.
 *
 * @param {{loadDocument:(path:string)=>Promise<any>, absolute?: (path:string)=>string}} db
 * @returns {Promise<string[]>}
 */
export async function getDependencies(db) {
	const logger = new Logger(Logger.detectLevel(process.argv))
	try {
		const data = await db.loadDocument('package.json')
		const all = {
			...data.dependencies,
			...data.devDependencies,
			...data.peerDependencies,
		}
		return Object.keys(all).filter((d) => d.startsWith('@nan0web/'))
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e)
		logger.error(`Failed to read ${db.absolute?.('package.json') ?? 'package.json'}: ${msg}`)
		return []
	}
}

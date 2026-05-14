/**
 * Saves a logical JSONL snapshot sequence
 * @param {Object} options
 * @param {string} options.name Snapshot file name (e.g. 'uk/ExploreCatalog.jsonl')
 * @param {Array<Object>} options.data Array of intents to serialize
 * @param {typeof import('node:fs/promises')} [options.fs] Injected filesystem
 * @param {typeof import('node:path')} [options.path] Injected path module
 */
export async function verifySnapshot({ name, data, fs, path }) {
	if (!fs) fs = await import('node:fs/promises')
	if (!path) path = await import('node:path')

	const outPath = path.resolve(process.cwd(), 'snapshots/jsonl', name)
	await fs.mkdir(path.dirname(outPath), { recursive: true })
	const content = data.map((i) => JSON.stringify(i)).join('\n')
	await fs.writeFile(outPath, content + '\n')
}

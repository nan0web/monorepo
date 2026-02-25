import { runCommandAsync } from './runCommandAsync.js'

/**
 * Executes the `test:all` script of a package.
 *
 * The mock mode (`MOCK_RUN_COMMAND=true`) makes this a no‑op.
 *
 * @param {string} cwd
 * @param {import("./runCommandAsync.js").onChunkFn} onChunk
 * @returns {Promise<import("./runCommandAsync.js").CommandResult>}
 */
export async function runTests(cwd, onChunk = () => 0) {
	return await runCommandAsync('npm', ['run', 'test:all'], { cwd, onChunk })
}

import { runCommandAsync } from "./runCommandAsync.js"

/**
 * Executes the `test:all` script of a package.
 *
 * The mock mode (`MOCK_RUN_COMMAND=true`) makes this a no‑op.
 *
 * @param {string} cwd
 */
export async function runTests(cwd) {
	const res = await runCommandAsync("pnpm", ["run", "test:all"], { cwd })
	if (res.code !== 0) throw new Error(`Tests failed in ${cwd}\n${res.output}`)
}

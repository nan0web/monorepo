import { runCommandAsync } from "./runCommandAsync.js"

/**
 * Runs `pnpm install` inside the given directory.
 *
 * The mock mode (`MOCK_RUN_COMMAND=true`) makes this a no‑op.
 *
 * @param {string} cwd
 */
export async function installDependencies(cwd) {
	const res = await runCommandAsync("pnpm", ["install"], { cwd })
	if (res.code !== 0) throw new Error(`pnpm install failed in ${cwd}`)
}

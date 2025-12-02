import { runCommandAsync } from "./runCommandAsync.js"
import Logger from "@nan0web/log"

/**
 * Runs `pnpm audit fix` and returns the raw result.
 *
 * In mock mode (`MOCK_RUN_COMMAND=true`) this returns a successful stub.
 *
 * @returns {Promise<{code:number, output:string}>}
 */
export async function autoFixAudit() {
	const logger = new Logger(Logger.detectLevel(process.argv))
	logger.info("Running pnpm audit fix...")
	if (process.env.MOCK_RUN_COMMAND === "true") {
		logger.success("✅ Auto‑fix succeeded (mock)")
		return { code: 0, output: "" }
	}
	const res = await runCommandAsync("pnpm", ["audit", "fix"])
	if (res.code === 0) logger.success("✅ Auto‑fix succeeded")
	else logger.warn("⚠️ Auto‑fix finished with warnings")
	return res
}

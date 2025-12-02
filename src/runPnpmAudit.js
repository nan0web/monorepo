import { runCommandAsync } from "./runCommandAsync.js"
import { parseAuditResult } from "./audit.js"
import Logger from "@nan0web/log"

/**
 * Runs `pnpm audit` and returns an array of {@link AuditIssue}.
 *
 * In mock mode (`MOCK_RUN_COMMAND=true`) the function returns an empty array
 * without invoking any external process.
 *
 * @returns {Promise<import("./AuditIssue.js").default[]>}
 */
export async function runPnpmAudit() {
	if (process.env.MOCK_RUN_COMMAND === "true") {
		return [] // deterministic mock result
	}
	const logger = new Logger(Logger.detectLevel(process.argv))
	logger.info("Running pnpm audit...")
	const res = await runCommandAsync("pnpm", ["audit"])
	const result = parseAuditResult(res.output)

	const tally = { critical: 0, high: 0, moderate: 0, low: 0 }
	for (const i of result) tally[i.type] = (tally[i.type] ?? 0) + 1

	const status = []
	if (tally.critical) status.push(Logger.RED + tally.critical + " critical" + Logger.RESET)
	if (tally.high) status.push(Logger.RED + tally.high + " high" + Logger.RESET)
	if (tally.moderate) status.push(Logger.YELLOW + tally.moderate + " moderate" + Logger.RESET)
	if (tally.low) status.push(tally.low + " low")
	console.info(`  ${status.join(" | ")}`)

	return result
}

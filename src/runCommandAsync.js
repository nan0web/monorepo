import { spawn } from "node:child_process"

/**
 * @typedef {(data: string, error?: boolean) => void} onChunkFn
 */

/**
 * @typedef {Object} runCommandOptions
 * @property {string} [cwd]
 * @property {number} [maxLines]
 * @property {boolean} [keepOutput]
 * @property {onChunkFn} [onChunk]
 */

/**
 * @typedef {Object} CommandResult
 * @property {number} code
 * @property {string} output
 */

/**
 * Execute a command asynchronously.
 *
 * In test environments the environment variable `MOCK_RUN_COMMAND=true`
 * forces a deterministic mock result (`code: 0`, empty `output`).
 *
 * @param {string} command
 * @param {string[]} args
 * @param {runCommandOptions} [options]
 * @returns {Promise<CommandResult>}
 */
export async function runCommandAsync(command, args, options = {}) {
	// ------------ mock mode -------------------------------------------------
	if (process.env.MOCK_RUN_COMMAND === "true") {
		// fast deterministic answer – no real process spawned
		return { code: 0, output: "" }
	}
	// -----------------------------------------------------------------------

	const {
		cwd,
		onChunk = (data, error = false) => { },
	} = options

	if ("function" !== typeof onChunk) {
		throw new TypeError("onChunk must be a function")
	}

	return new Promise((resolve, reject) => {
		const proc = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] })
		let output = ""

		proc.stdout.on("data", d => {
			onChunk(d)
			output += String(d)
		})
		proc.stderr.on("data", d => {
			onChunk(d, true)
			output += String(d)
		})

		proc.on("error", err => {
			reject(err)
		})
		proc.on("close", code => {
			resolve({ code, output })
		})
	})
}

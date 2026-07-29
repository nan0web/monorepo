/**
 * Simple promisified exec for FFmpeg commands.
 * Replaces @vonage/bdk-core bash which doesn't exist in this project.
 */
import { exec } from 'node:child_process'

/**
 * @param {{ command: string, timeout?: number }} opts
 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
 */
export function bash(opts) {
	return new Promise((resolve, reject) => {
		const child = exec(opts.command, {
			timeout: opts.timeout ?? 600000,
			maxBuffer: 1024 * 1024 * 100, // 100MB
		}, (error, stdout, stderr) => {
			if (error) {
				// Non-zero exit is still a result
				resolve({
					code: error.code ?? 1,
					stdout: stdout ?? '',
					stderr: stderr ?? error.message,
				})
			} else {
				resolve({ code: 0, stdout: stdout ?? '', stderr: stderr ?? '' })
			}
		})
	})
}
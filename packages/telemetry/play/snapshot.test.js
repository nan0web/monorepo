import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { PlaygroundTest } from '@nan0web/test'

const SNAPSHOT_DIR = path.join(import.meta.dirname, '..', 'snapshots', 'play')

/**
 * Normalizes CLI output for deterministic snapshot comparison.
 * @param {string} str
 * @returns {string}
 */
function normalizeOutput(str) {
	return (
		str
			// Remove ANSI codes
			.replace(/\x1B\[[0-9;?]*[a-zA-Z]/g, '')
			// Normalize progress bars
			.replace(/\[=*>?-*\] \d+% \[\d{2}:\d{2}( < \d{2}:\d{2})?\]/g, '[PROGRESS_BAR]')
			// Normalize uptime
			.replace(/uptime: \d+(\.\d+)?s/g, 'uptime: [UPTIME]')
			// Normalize benchmark values
			.replace(/\d+\.\d{3}/g, '[MS]')
			// Normalize percentages
			.replace(/\d+\.\d+%/g, '[PCT]%')
			// Normalize bar graphs
			.replace(/[█]+/g, '[BAR_FILLED]')
			.replace(/[░]+/g, '[BAR_EMPTY]')
			.trim()
	)
}

const DEMOS = ['connect', 'write', 'read', 'report', 'filter', 'bench', 'disconnect', 'reset']
const LANGUAGES = ['en', 'uk']

describe('Telemetry Sandbox — Snapshot Verification (PlaygroundTest)', () => {
	for (const lang of LANGUAGES) {
		describe(`Language: ${lang}`, () => {
			for (const demo of DEMOS) {
				it(`matches snapshot: ${demo} [${lang}]`, async () => {
					const pt = new PlaygroundTest({ ...process.env, FORCE_COLOR: '0' })
					const result = await pt.run(['play/main.js', `--demo=${demo}`, `--lang=${lang}`])
					
					const actual = normalizeOutput(result.stdout)
					
					if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })
					const snapshotPath = path.join(SNAPSHOT_DIR, `${demo}.${lang}.snap`)

					if (process.env.UPDATE_SNAPSHOTS) {
						fs.writeFileSync(snapshotPath, actual, 'utf8')
						return
					}

					if (!fs.existsSync(snapshotPath)) {
						fs.writeFileSync(snapshotPath, actual, 'utf8')
						return
					}

					const expected = fs.readFileSync(snapshotPath, 'utf8')
					assert.equal(actual, expected, `Snapshot mismatch for ${demo}.${lang}`)
				})
			}
		})
	}
})

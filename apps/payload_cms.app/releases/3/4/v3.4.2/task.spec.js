import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { dirname, posix, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgRoot = resolve(__dirname, '../../../../')

/**
 * Collects relative import paths from a JS entry file.
 * @param {string} filePath
 * @returns {string[]}
 */
function extractRelativeImports(filePath) {
	const code = readFileSync(filePath, 'utf8')
	const matches = code.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)
	return Array.from(matches, (m) => m[1])
}

/**
 * Returns packaged file paths from `npm pack --dry-run --json`.
 * @returns {Set<string>}
 */
function getPackedFiles() {
	const raw = execFileSync('npm', ['pack', '--dry-run', '--json'], {
		cwd: pkgRoot,
		encoding: 'utf8',
	})
	const parsed = JSON.parse(raw)
	return new Set(parsed[0].files.map((entry) => entry.path))
}

describe('Release v3.4.2: Package files & nan0cms bin integrity', () => {
	it('includes all package.json exports and bin/app.js imports in npm pack --dry-run', () => {
		const pkg = JSON.parse(readFileSync(resolve(pkgRoot, 'package.json'), 'utf8'))
		const packed = getPackedFiles()

		assert.ok(packed.has('bin/app.js'), 'bin/app.js must be packaged')
		assert.ok(packed.has('src/plugins/withPayload.js'), 'src/plugins/withPayload.js must be packaged')

		for (const [key, target] of Object.entries(pkg.exports || {})) {
			const normalized = String(target).replace(/^\.\//, '')
			assert.ok(packed.has(normalized), `Export "${key}" -> "${normalized}" missing from npm pack`)
		}

		const binImports = extractRelativeImports(resolve(pkgRoot, 'bin/app.js'))
		for (const rel of binImports) {
			const normalized = posix.normalize(posix.join('bin', rel))
			assert.ok(packed.has(normalized), `bin/app.js import "${normalized}" missing from npm pack`)
		}
	})

	it('runs node bin/app.js --help without ERR_MODULE_NOT_FOUND', () => {
		const res = spawnSync(process.execPath, ['bin/app.js', '--help'], {
			cwd: pkgRoot,
			encoding: 'utf8',
		})

		assert.equal(res.status, 0, `Expected exit 0, got ${res.status}: ${res.stderr}`)
		assert.doesNotMatch(res.stderr || '', /ERR_MODULE_NOT_FOUND/)
		assert.match(res.stdout || '', /Payload|transform|seed/i)
	})
})

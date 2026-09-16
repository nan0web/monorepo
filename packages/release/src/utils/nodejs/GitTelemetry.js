import fs from 'node:fs'
import { execSync } from 'node:child_process'

let rootGitStatusCache = null
let rootGitBranchCache = null
const gitInfoCache = new Map()
const gitTelemetryCache = new Map()

/**
 * Reset internal Git caches (useful for testing or cache invalidation)
 */
export function resetGitCache() {
	rootGitStatusCache = null
	rootGitBranchCache = null
	gitInfoCache.clear()
	gitTelemetryCache.clear()
}

/**
 * Retrieve git branch and workspace status (clean / dirty)
 * @param {string} [projectDir]
 * @returns {{ branch: string, gitStatus: 'clean' | 'dirty' }}
 */
export function getGitInfo(projectDir) {
	const key = projectDir || process.cwd()
	const isMonorepoInternal =
		!projectDir ||
		projectDir === '.' ||
		(!projectDir.startsWith('../') && !projectDir.startsWith('/'))

	if (isMonorepoInternal) {
		if (rootGitStatusCache === null) {
			try {
				rootGitBranchCache =
					execSync('git rev-parse --abbrev-ref HEAD', {
						cwd: process.cwd(),
						stdio: ['ignore', 'pipe', 'ignore'],
						encoding: 'utf8',
					}).trim() || 'main'
				rootGitStatusCache = execSync('git status --porcelain', {
					cwd: process.cwd(),
					stdio: ['ignore', 'pipe', 'ignore'],
					encoding: 'utf8',
				}).trim()
			} catch {
				rootGitBranchCache = 'main'
				rootGitStatusCache = ''
			}
		}
		const normPrefix =
			projectDir && projectDir !== '.'
				? `${projectDir.replace(/\/+$/, '')}/`
				: ''
		const isDirty = normPrefix
			? rootGitStatusCache
					.split('\n')
					.some((line) => line.slice(3).trim().startsWith(normPrefix))
			: rootGitStatusCache.length > 0

		return {
			branch: rootGitBranchCache,
			gitStatus: isDirty ? 'dirty' : 'clean',
		}
	}

	if (gitInfoCache.has(key)) return gitInfoCache.get(key)
	if (fs.existsSync && !fs.existsSync(key)) {
		const res = { branch: 'main', gitStatus: 'clean' }
		gitInfoCache.set(key, res)
		return res
	}

	try {
		const branch = execSync('git rev-parse --abbrev-ref HEAD', {
			cwd: key,
			stdio: ['ignore', 'pipe', 'ignore'],
			encoding: 'utf8',
		}).trim()
		const statusOutput = execSync('git status --porcelain', {
			cwd: key,
			stdio: ['ignore', 'pipe', 'ignore'],
			encoding: 'utf8',
		}).trim()
		const res = {
			branch: branch || 'main',
			gitStatus: statusOutput.length > 0 ? 'dirty' : 'clean',
		}
		gitInfoCache.set(key, res)
		return res
	} catch {
		const res = { branch: 'main', gitStatus: 'clean' }
		gitInfoCache.set(key, res)
		return res
	}
}

/**
 * Retrieve development hours and iterations from git commit log
 * @param {string} [projectDir]
 * @param {string} [releasePath]
 * @returns {{ hours: number, iterations: number }}
 */
export function getGitCommitTelemetry(projectDir, releasePath) {
	const targetDir = releasePath || projectDir
	if (!targetDir) return { hours: 0, iterations: 0 }
	if (gitTelemetryCache.has(targetDir)) return gitTelemetryCache.get(targetDir)
	if (fs.existsSync && !fs.existsSync(targetDir)) {
		const res = { hours: 0, iterations: 0 }
		gitTelemetryCache.set(targetDir, res)
		return res
	}

	try {
		const logOutput = execSync(
			`git log --format="%at" -n 50 -- "${targetDir}"`,
			{
				cwd: process.cwd(),
				stdio: ['ignore', 'pipe', 'ignore'],
				encoding: 'utf8',
			}
		).trim()

		if (!logOutput) {
			const res = { hours: 0, iterations: 0 }
			gitTelemetryCache.set(targetDir, res)
			return res
		}

		const timestamps = logOutput
			.split('\n')
			.map((t) => parseInt(t.trim(), 10))
			.filter((t) => !isNaN(t))

		if (timestamps.length < 2) {
			const res = { hours: 0.5, iterations: timestamps.length }
			gitTelemetryCache.set(targetDir, res)
			return res
		}

		const minT = Math.min(...timestamps)
		const maxT = Math.max(...timestamps)
		const diffHours = Math.round(((maxT - minT) / 3600) * 10) / 10
		const hours = diffHours > 0 ? diffHours : 0.5
		const iterations = timestamps.length

		const res = { hours, iterations }
		gitTelemetryCache.set(targetDir, res)
		return res
	} catch {
		const res = { hours: 0, iterations: 0 }
		gitTelemetryCache.set(targetDir, res)
		return res
	}
}

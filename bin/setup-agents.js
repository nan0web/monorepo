#!/usr/bin/env node
/**
 * Setup .agent/ directories for all packages and apps.
 *
 * This ensures Antigravity can discover workflows and rules
 * when working inside any sub-package of the monorepo.
 *
 * Usage: node bin/setup-agents.js [--dry-run]
 */
import process from 'node:process'
import { execSync } from 'node:child_process'

import DB from '@nan0web/db-fs'
import Logger from '@nan0web/log'
import { render, Alert } from '@nan0web/ui-cli'

const WORKSPACE_PATTERNS = ['packages', 'apps']

const RULES_TEMPLATE = (depth) => {
	const rel = '../'.repeat(depth)
	return `# Agent Rules

> This package follows nan•web monorepo standards.

See [system.md](${rel}system.md) for architecture and philosophy.
See [RULES](${rel}.agent/RULES.md) for agent-specific rules.

## Package-specific notes

- Run \`pnpm test:all\` to verify before committing.
- Follow \`next.md\` for pending tasks.
- Use \`/check\` workflow for automated verification.
`
}

const WORKFLOWS_SYMLINKS = [
	'check.md',
	'fix.md',
	'commit.md',
	'release.md',
	'sandbox-verify.md',
	'zero-tolerance-git.md',
	'anti-haste-protocol.md',
]

async function* run(argv = process.argv.slice(2)) {
	const dryRun = argv.includes('--dry-run')
	const logger = new Logger(Logger.detectLevel(argv))

	yield Alert({
		title: 'Agent Setup',
		variant: 'info',
		children: dryRun ? 'DRY RUN — no changes will be made' : 'Setting up .agent/ in all packages',
	})

	const rootFs = new DB()
	await rootFs.connect()
	const rootPath = rootFs.location('.')

	let created = 0
	let skipped = 0

	for (const base of WORKSPACE_PATTERNS) {
		try {
			const entries = await rootFs.listDir(base, { depth: 0 })
			for (const entry of entries) {
				if (!entry.isDirectory) continue
				const projectPath = `${base}/${entry.name}`
				try {
					await rootFs.statDocument(`${projectPath}/package.json`)
				} catch {
					continue
				}

				const agentDir = `${projectPath}/.agent`
				const workflowsDir = `${agentDir}/workflows`

				// Depth from package to root (e.g. packages/types = 2)
				const depth = projectPath.split('/').length

				try {
					await rootFs.statDocument(`${agentDir}/RULES.md`)
					skipped++
					logger.info(
						Logger.style(`  skip  ${projectPath}/.agent/ (exists)`, { color: Logger.DIM }),
					)
					continue
				} catch {
					/* doesn't exist — create */
				}

				if (dryRun) {
					logger.info(`  ${Logger.style('would create', { color: Logger.CYAN })}  ${agentDir}/`)
					created++
					continue
				}

				// Create RULES.md
				await rootFs.saveDocument(`${agentDir}/RULES.md`, RULES_TEMPLATE(depth))

				// Create symlinks to root workflows
				const absWorkflowsDir = rootFs.location(workflowsDir)
				const absRootWorkflows = rootFs.location('.agent/workflows')
				try {
					execSync(`mkdir -p "${absWorkflowsDir}"`)
					for (const wf of WORKFLOWS_SYMLINKS) {
						const target = `${absRootWorkflows}/${wf}`
						const link = `${absWorkflowsDir}/${wf}`
						try {
							execSync(`ln -sf "${target}" "${link}"`)
						} catch {
							/* symlink exists */
						}
					}
				} catch (err) {
					logger.warn(`  Failed to symlink workflows for ${projectPath}: ${err.message}`)
				}

				created++
				logger.success(`  ${Logger.style('created', { color: Logger.GREEN })}  ${agentDir}/`)
			}
		} catch {
			/* dir missing */
		}
	}

	yield ''
	yield Alert({
		variant: 'success',
		children: `${created} created, ${skipped} skipped`,
	})
}

async function main() {
	const gen = run()
	let next = await gen.next()
	while (!next.done) {
		const result = await render(next.value)
		next = await gen.next(result)
	}
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})

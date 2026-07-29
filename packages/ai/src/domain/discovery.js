import fs from 'node:fs/promises'
import path from 'node:path'
import { WorkspaceInspectorModel } from './WorkspaceInspectorModel.js'

/**
 * Recursively scans the directory for nan0web.nan0 files.
 * @param {string} dirPath
 * @param {Map<string, WorkspaceInspectorModel>} registry
 */
async function scanDir(dirPath, registry) {
	let entries
	try {
		entries = await fs.readdir(dirPath, { withFileTypes: true })
	} catch (e) {
		return
	}

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name)
		if (entry.isDirectory()) {
			// Skip common build and dependency folders
			if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build' || entry.name === 'tmp') {
				continue
			}
			await scanDir(fullPath, registry)
		} else if (entry.isFile() && entry.name === 'nan0web.nan0') {
			try {
				const content = await fs.readFile(fullPath, 'utf8')
				const data = JSON.parse(content)
				if (data.validators && typeof data.validators === 'object') {
					for (const [name, validatorData] of Object.entries(data.validators)) {
						const inspector = new WorkspaceInspectorModel({
							name,
							type: validatorData.type || 'deterministic',
							command: validatorData.command || '',
						})
						inspector.cwd = dirPath
						registry.set(name, inspector)
					}
				}
			} catch (e) {
				// Ignore parsing errors or read errors
			}
		}
	}
}

/**
 * Scans the workspace directory for nan0web.nan0 configuration files and builds an inspector registry.
 * @param {string} workspacePath
 * @returns {Promise<Map<string, WorkspaceInspectorModel>>}
 */
export async function scanRegistry(workspacePath) {
	const registry = new Map()
	await scanDir(workspacePath, registry)
	return registry
}

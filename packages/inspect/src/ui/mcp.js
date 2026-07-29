#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { runGenerator } from '@nan0web/ui'
import { ArchitectureAuditor } from '../domain/app/ArchitectureAuditor.js'
import { DomainAuditor } from '../domain/app/DomainAuditor.js'
import { HygieneAuditor } from '../domain/app/HygieneAuditor.js'
import { PhaseAuditor } from '../domain/app/PhaseAuditor.js'

const server = new Server(
	{
		name: 'nan0web-inspect',
		version: '1.0.0',
	},
	{
		capabilities: {
			tools: {},
		},
	}
)

server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: 'inspect_architecture',
				description: 'Run NaN0Web Architecture Auditor (Model-as-Schema validation)',
				inputSchema: {
					type: 'object',
					properties: {
						dir: { type: 'string', description: 'Target directory (e.g. packages/ui-next)' },
					},
					required: ['dir'],
				},
			},
			{
				name: 'inspect_domain',
				description: 'Run Domain Models Auditor',
				inputSchema: { type: 'object', properties: { dir: { type: 'string' } }, required: ['dir'] },
			},
			{
				name: 'inspect_hygiene',
				description: 'Run Package Hygiene Auditor (package.json, dependencies)',
				inputSchema: { type: 'object', properties: { dir: { type: 'string' } }, required: ['dir'] },
			},
			{
				name: 'inspect_phase',
				description: 'Run Phase Auditor (Check step completeness)',
				inputSchema: { type: 'object', properties: { dir: { type: 'string' } }, required: ['dir'] },
			},
		],
	}
})

import path from 'node:path'
import DBFS from '@nan0web/db-fs'

async function runAuditor(AuditorClass, dir) {
	// Full OLMUI Context using DBFS
	const absDir = path.resolve(process.cwd(), dir)
	const db = new DBFS({ root: '', cwd: absDir })
	const context = {
		t: (str) => str,
		db,
	}

	const auditor = new AuditorClass({ dir, platform: 'js' }, context)
	let logs = []
	let errorCount = 0

	const handlers = {
		show: async (intent) => {
			if (intent.level === 'error') errorCount++
			logs.push(`[${intent.level || 'info'}] ${intent.message}`)
		},
		progress: async (intent) => {
			// Ignore progress in MCP JSON output to keep it clean
		},
		ask: async (intent) => {
			logs.push(`[ask] Warning: Interactive prompt skipped for MCP.`)
			return { value: null }
		},
	}

	const result = await runGenerator(auditor.run(), handlers)

	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify({ success: errorCount === 0, result, logs }, null, 2),
			},
		],
		isError: errorCount > 0,
	}
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params
	const dir = args?.dir || '.'

	try {
		switch (name) {
			case 'inspect_architecture':
				return await runAuditor(ArchitectureAuditor, dir)
			case 'inspect_domain':
				return await runAuditor(DomainAuditor, dir)
			case 'inspect_hygiene':
				return await runAuditor(HygieneAuditor, dir)
			case 'inspect_phase':
				return await runAuditor(PhaseAuditor, dir)
			default:
				throw new Error(`Unknown tool: ${name}`)
		}
	} catch (e) {
		return {
			content: [{ type: 'text', text: `Error running inspector: ${e.message}\n${e.stack}` }],
			isError: true,
		}
	}
})

async function main() {
	const transport = new StdioServerTransport()
	await server.connect(transport)
	console.error('NaN0Web Inspect MCP Server running on stdio')
}

import { fileURLToPath } from 'node:url'
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main().catch(console.error)
}
export { server, runAuditor }

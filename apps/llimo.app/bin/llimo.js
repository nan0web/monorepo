#!/usr/bin/env node
/**
 * llimo - main CLI router
 */
import { bootstrapApp } from '@nan0web/ui-cli'

const subcmd = process.argv[2]
const args = process.argv.slice(3)

const ROUTES = {
	chat: () => import('../src/domain/ChatSessionModel.js').then(m => m.ChatSessionModel),
	workflow: () => import('../src/domain/WorkflowModel.js').then(m => m.WorkflowModel),
	pipeline: () => import('../src/domain/PipelineModel.js').then(m => m.PipelineModel),
	init: () => import('../src/domain/InitProjectModel.js').then(m => m.InitProjectModel),
	shop: () => import('../src/domain/WebShopperModel.js').then(m => m.WebShopperModel),
	subagent: () => import('../src/domain/SubagentModel.js').then(m => m.SubagentModel),
	translate: () => import('../src/domain/TranslateDocsModel.js').then(m => m.TranslateDocsModel),
	pack: () => import('../src/domain/PackModel.js').then(m => m.PackModel),
	unpack: () => import('../src/domain/UnpackModel.js').then(m => m.UnpackModel),
	system: () => import('../src/domain/SystemModel.js').then(m => m.SystemModel),
	// Pipeline steps (model-as-schema subcommands that read .agent/session/workflows/)
	'pipeline:seed': () => import('../src/Chat/commands/pipeline.js').then(m => m.PipelineCommand),
	'pipeline:model': () => import('../src/Chat/commands/pipeline.js').then(m => m.PipelineCommand),
	'pipeline:contract': () => import('../src/Chat/commands/pipeline.js').then(m => m.PipelineCommand),
	'pipeline:adapter': () => import('../src/Chat/commands/pipeline.js').then(m => m.PipelineCommand),
	'pipeline:cli': () => import('../src/Chat/commands/pipeline.js').then(m => m.PipelineCommand),
	'pipeline:chat': () => import('../src/Chat/commands/pipeline.js').then(m => m.PipelineCommand),
	'pipeline:web': () => import('../src/Chat/commands/pipeline.js').then(m => m.PipelineCommand),
	'pipeline:mobile': () => import('../src/Chat/commands/pipeline.js').then(m => m.PipelineCommand),
	'pipeline:qa': () => import('../src/Chat/commands/pipeline.js').then(m => m.PipelineCommand),
}

const getRoute = () => {
    if (!subcmd || subcmd.startsWith('-')) return ROUTES.chat
    if (ROUTES[subcmd]) return ROUTES[subcmd]
    return null
}

const route = getRoute()

if (route) {
	const ModelClass = await route()

	// For pipeline:* commands, inject step from subcmd
	if (subcmd && subcmd.startsWith('pipeline:')) {
		const step = subcmd.split(':')[1]
		// If step arg already present, shift to keep it as model's positional
		if (args[0] && ['seed','model','contract','adapter','cli','chat','web','mobile','qa'].includes(args[0])) {
			// Already has step as first arg, keep as positional
		} else {
			args.unshift('--step', step)
		}
	}

	const { AI } = await import('@nan0web/ai')
	const ai = new AI()
	try { await ai.refreshModels() } catch (e) {} // Load models silently
	bootstrapApp(ModelClass, { ai })
} else {
    // Fallbacks for commands that aren't Model-as-Schema yet
	const { execFileSync } = await import('node:child_process')
	const scriptPath = new URL(`./llimo-${subcmd}.js`, import.meta.url).pathname
	try {
        const fs = await import('node:fs')
        if (fs.existsSync(scriptPath)) {
    		execFileSync(process.execPath, [scriptPath, ...args], { stdio: 'inherit' })
            process.exit(0)
        }
	} catch (err) {}

    console.error(`llimo: unknown command '${subcmd}'\n`)
    console.info(`Available commands: ${Object.keys(ROUTES).join(', ')}`)
    process.exit(1)
}

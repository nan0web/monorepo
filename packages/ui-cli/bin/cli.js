#!/usr/bin/env node

/**
 * NaN•Web CLI v2 — Model-as-App entry point.
 *
 * Delegates all routing logic to `App extends Model`.
 * Bootstrap handles: DB, i18n, argv parsing, process.exit.
 *
 * Shell Completion:
 *   Generate zsh completion:  nan0cli --completion zsh
 *   Generate bash completion: nan0cli --completion bash
 *   Source in your shell:
 *     zsh:  source <(nan0cli --completion zsh)
 *     bash: source <(nan0cli --completion bash)
 */

import { bootstrapApp } from '../src/ui/bootstrapApp.js'
import App from '../src/domain/App.js'

bootstrapApp(App, {
	// Pass remaining args to App (skip the node binary + this script)
	argv: process.argv.slice(2),
	appName: 'nan0cli',
})

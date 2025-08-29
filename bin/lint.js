#!/usr/bin/env node
import { execSync } from 'node:child_process'

try {
	execSync('eslint packages/*/src/**/*.{js,ts}', { stdio: 'inherit' })
	console.log('✅ Linting passed')
} catch {
	console.error('❌ Linting failed')
	process.exit(1)
}

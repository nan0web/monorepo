#!/usr/bin/env node
import { execSync } from 'node:child_process'

try {
	execSync('pnpm audit', { stdio: 'inherit' })
	console.log('✅ No security vulnerabilities found')
} catch (err) {
	if (err.status === 0) {
		console.log('✅ Audit completed')
	} else {
		console.error('❌ Security audit failed')
		process.exit(err.status)
	}
}

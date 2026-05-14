#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

/**
 * NanoPlay Binary Launcher
 *
 * Thin delegate to `scripts/play.js`.
 * PlaygroundModel is Data Schema (no Intent Flow).
 */

const args = process.argv.slice(2)
const script = resolve(import.meta.dirname, '..', 'scripts', 'play.js')
const child = spawn('node', [script, ...args], { stdio: 'inherit' })

child.on('exit', (code) => process.exit(code ?? 0))

#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { writeFileSync, readFileSync, rmSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import DB from '@nan0web/db-fs'
import { CLiInputAdapter, runGenerator } from '@nan0web/ui-cli'
import { SignApp } from '../src/domain/SignApp.js'

/**
 * Runs a child process and returns stdout as Buffer.
 * @param {string} cmd
 * @param {string[]} args
 * @param {Buffer} [input]
 * @returns {Promise<Buffer>}
 */
function execBuffer(cmd, args, input) {
	return new Promise((resolve, reject) => {
		const stdio = input === undefined ? ['inherit', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe']
		const child = spawn(cmd, args, {
			stdio,
			env: { ...process.env, GPG_TTY: process.env.GPG_TTY || '/dev/tty' },
		})
		const chunks = []
		const errChunks = []
		child.stdout.on('data', (d) => chunks.push(d))
		child.stderr.on('data', (d) => errChunks.push(d))
		child.on('error', reject)
		child.on('close', (code) => {
			if (code === 0) resolve(Buffer.concat(chunks))
			else reject(new Error(`${cmd} exited with ${code}: ${Buffer.concat(errChunks).toString()}`))
		})
		if (input !== undefined) {
			child.stdin.write(input)
			child.stdin.end()
		}
	})
}

async function main() {
	const [, , command, targetFile] = process.argv
	if (command !== 'sign' || !targetFile) {
		console.error('Usage: nan0vault sign <file.md>')
		process.exit(1)
	}

	const db = new DB()
	await db.connect()

	const app = new SignApp(
		{ file: targetFile },
		{
			db,
			pdf: {
				render: async (content) => {
					const baseDir = dirname(resolve(targetFile))
					const stamp = `.nan0vault-${Date.now()}`
					const mdPath = join(baseDir, `${stamp}.md`)
					const pdfPath = join(baseDir, `${stamp}.pdf`)
					try {
						const styled = `<style>body{color:#111;background:#fff;font-family:sans-serif;}</style>\n\n${content}`
						writeFileSync(mdPath, styled, 'utf8')
						await execBuffer('npx', ['--yes', 'md-to-pdf', mdPath])
						return readFileSync(pdfPath)
					} finally {
						rmSync(mdPath, { force: true })
						rmSync(pdfPath, { force: true })
					}
				},
			},
			pgp: {
				sign: async (pdfBuffer, keyId, armor) => {
					const baseDir = dirname(resolve(targetFile))
					const stamp = `.nan0vault-pgp-${Date.now()}`
					const tmpPdf = join(baseDir, `${stamp}.pdf`)
					const tmpSig = join(baseDir, `${stamp}.${armor ? 'asc' : 'sig'}`)
					try {
						writeFileSync(tmpPdf, pdfBuffer)
						const args = ['--yes', '--detach-sign', '--local-user', keyId]
						if (armor) args.push('--armor')
						args.push('-o', tmpSig, tmpPdf)
						await new Promise((res, rej) => {
							const child = spawn('gpg', args, { stdio: 'inherit' })
							child.on('error', rej)
							child.on('close', (code) => {
								if (code === 0) res()
								else rej(new Error(`gpg exited with ${code}`))
							})
						})
						return readFileSync(tmpSig)
					} finally {
						rmSync(tmpPdf, { force: true })
						rmSync(tmpSig, { force: true })
					}
				},
			},
			qes: {
				sign: async (pdfBuffer, qesConfig) => {
					if (!qesConfig.command) {
						throw new Error('qes.command is required for CLI QES provider')
					}
					const baseDir = dirname(resolve(targetFile))
					const stamp = `.nan0vault-qes-${Date.now()}`
					const inPath = join(baseDir, `${stamp}.pdf`)
					const outPath = join(baseDir, `${stamp}.${qesConfig.format || 'p7s'}`)
					try {
						writeFileSync(inPath, pdfBuffer)
						const parts = qesConfig.command
							.replaceAll('{input}', inPath)
							.replaceAll('{output}', outPath)
							.split(/\s+/)
							.filter(Boolean)
						await execBuffer(parts[0], parts.slice(1))
						return readFileSync(outPath)
					} finally {
						rmSync(inPath, { force: true })
						rmSync(outPath, { force: true })
					}
				},
			},
			sha256: (buf) => createHash('sha256').update(buf).digest('hex'),
		},
	)

	await runGenerator(app, new CLiInputAdapter())
}

main().catch((err) => {
	console.error(err.message)
	process.exit(1)
})

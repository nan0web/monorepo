#!/usr/bin/env node

/**
 * download-whisper.js
 * CLI tool for downloading and transcribing YouTube videos locally.
 * 
 * Usage:
 *   node bin/download-whisper.js "https://youtube.com/watch?v=..."
 */

import { MediaDownloadModel } from '../src/index.js'
import path from 'node:path'

async function main() {
	const url = process.argv[2]
	if (!url) {
		console.error('Usage: node bin/download-whisper.js <YouTube URL or local file path>')
		process.exit(1)
	}

	const model = new MediaDownloadModel({ url })
	
	console.log(`\x1b[1m[MediaProcessor]\x1b[0m Starting for: ${url}`)
	
	try {
		for await (const update of model.run()) {
			switch (update.status) {
				case 'downloading':
					console.log(`\x1b[94m·\x1b[0m Downloading audio...`)
					break
				case 'segmenting':
					console.log(`\x1b[94m·\x1b[0m Segmenting into 5-minute chunks... (\x1b[1m${update.title}\x1b[0m)`)
					break
				case 'transcribing':
					process.stdout.write(`\x1b[93m·\x1b[0m Transcribing chunk ${update.chunk}/${update.total}... `)
					break
				case 'partial':
					process.stdout.write(`\x1b[32mOK\x1b[0m\n`)
					console.log(`\x1b[2m${update.text.substring(0, 150)}...\x1b[0m\n`)
					break
				case 'done':
					console.log(`\n\x1b[1;32m✓ Finished!\x1b[0m`)
					console.log(`\x1b[1mTitle:\x1b[0m ${update.title}`)
					console.log(`\x1b[1mFull transcript saved in memory (model.transcript).\x1b[0m`)
					break
				case 'error':
					console.error(`\n\x1b[1;31m✘ Error:\x1b[0m ${update.error}`)
					break
			}
		}
	} catch (err) {
		console.error(`\x1b[1;31mCritical failure:\x1b[0m ${err.message}`)
		process.exit(1)
	}
}

main()

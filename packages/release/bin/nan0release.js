#!/usr/bin/env node

import process from 'node:process'

import { OutputMessage } from '@nan0web/co'
import Logger from '@nan0web/log'

import createReleaseCLI from '../src/ui/cli/ReleaseCLi.js'

class OutputLogger extends Logger {
	log(first, ...args) {
		if (first && first instanceof OutputMessage) {
			if (OutputMessage.TYPES.ERROR === first.type) {
				return this.error(first.content, ...args)
			} else if (OutputMessage.TYPES.WARNING === first.type) {
				return this.warn(first.content, ...args)
			} else if (OutputMessage.TYPES.SUCCESS === first.type) {
				return this.success(first.content, ...args)
			}
			return this.info(first.content, ...args)
		}
		return super.log(first, ...args)
	}
}

const logger = new OutputLogger(Logger.detectLevel(process.argv))

async function main(argv = []) {
	const cli = createReleaseCLI(argv, logger)
	logger.info(Logger.style(Logger.LOGO, { color: Logger.MAGENTA }))

	const stream = cli.run()
	for await (const entry of stream) {
		logger.info(entry)
	}
}

main(process.argv.slice(2)).catch((err) => {
	logger.error('❌ Unhandled error:', err.message || err)
	if (err.stack) logger.debug(err.stack)
	process.exit(1)
})

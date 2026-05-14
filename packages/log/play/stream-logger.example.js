#!/usr/bin/env node

import Logger from '../src/index.js'
import fs from 'node:fs/promises'

// Create a logger that streams to a file
const logger = new Logger({
	level: 'debug',
	icons: true,
	stream: async (message) => {
		await fs.appendFile('./playground/logs.txt', message)
	},
})

logger.debug('This debug message will be streamed to a file')
logger.info('This info message will be streamed to a file')
logger.warn('This warning message will be streamed to a file')
logger.error('This error message will be streamed to a file')
logger.success('This success message will be streamed to a file')

console.log('Messages have been streamed to ./playground/logs.txt')

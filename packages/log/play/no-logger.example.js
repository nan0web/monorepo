#!/usr/bin/env node

import { NoLogger } from '../src/index.js'

// Create a NoLogger instance to capture logs instead of printing them
const logger = new NoLogger({
	level: 'debug',
	icons: true,
	chromo: false,
})

// Log various messages
logger.debug('Debug message')
logger.info('Info message')
logger.warn('Warning message')
logger.error('Error message')
logger.success('Success message')

// Retrieve and display captured logs
const logs = logger.output()
console.log('Captured logs:')
logs.forEach((log, index) => {
	console.log(`${index + 1}: [${log[0]}]`, ...log.slice(1))
})

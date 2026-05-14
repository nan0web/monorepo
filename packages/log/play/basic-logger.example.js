#!/usr/bin/env node

import Logger from '../src/index.js'

// Create a basic logger instance
const logger = new Logger({
	level: 'debug',
	icons: true,
	chromo: false,
	time: true,
	spent: true,
})

// Log messages at different levels
logger.debug('This is a debug message')
logger.info('This is an info message')
logger.warn('This is a warning message')
logger.error('This is an error message')
logger.success('This is a success message')

// Log with custom formatting
logger.setFormat('info', { icon: '📘', color: Logger.BLUE })
logger.info('Formatted info message')

// Log table data
const data = [
	{ name: 'John', age: 30, city: 'New York' },
	{ name: 'Jane', age: 25, city: 'Los Angeles' },
	{ name: 'Bob', age: 35, city: 'Chicago' },
]
logger.table(data, ['name', 'age', 'city'], { padding: 2, border: 1, headBorder: 1 })

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

// Log with custom formatting
logger.setFormat('info', { color: Logger.BLUE })

async function sleep(time = 999) {
	await new Promise((resolve) => setTimeout(resolve, time))
}

// Clear the console (if supported)
logger.info('Clearing console in 2 seconds...')
await sleep(2000)
logger.clear()

await sleep()
// Show multiple lines and clear the last one
logger.info('Line 1: This will remain')
await sleep()
logger.info('Line 2: and this')
await sleep()
logger.cursorUp()
logger.clearLine()

await sleep()
// Show cursor movement
logger.info('First line ••••••••••••••••••••••••••••••')
await sleep()
logger.info('Second line •••••••••••••••••••••••••••••')
logger.clearLine()
await sleep()
logger.info('Moving cursor up to overwrite...')
await sleep()
const [width] = logger.getWindowSize()
for (let i = 0; i < width; i++) {
	logger.clearLine(logger.cursorUp())
	logger.info(Logger.bar(i, width))
	await sleep(33)
}
// await sleep()
logger.clearLine(logger.cursorUp(3))
logger.info("This overwrites 'First line'")
logger.clearLine(logger.cursorDown(2))

logger.success('Done!')

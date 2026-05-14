import { createCommand } from '../src/command.js'
import event from '../src/index.js'

// Create basic event bus
const bus = event()
console.log('Basic event bus created. Checking environment...')

// Add event handler
bus.on('message', (ctx) => {
	console.log(`💬 Message received: ${ctx.data.text}`)
	if (ctx.data.text.includes('stop')) {
		console.log('🛑 Event intercepted via preventDefault()')
		ctx.preventDefault()
	}
})

// Simulate message sender
const sendMessage = async (text) => {
	const result = await bus.emit('message', { text })
	console.log(`✅ Sent: "${text}" | Status: ${result.defaultPrevented ? 'intercepted' : 'success'}`)
}

// Example command
const countCommand = createCommand('count', async (ctx) => {
	ctx.meta.totalCount = (ctx.meta.totalCount || 0) + 1
	console.log(`🔢 Progress ${ctx.data.iteration}: ${ctx.meta.totalCount} events processed`)
})

// Command interaction
countCommand.on('execute', (ctx) => {
	console.log('⏩ Counter command started')
})

console.warn('\n=== Testing simple events ===')
await sendMessage('Hello! This is a test message.')
await sendMessage('Please, stop this event.')

console.warn('\n=== Testing commands ===')
for (let i = 0; i < 3; i++) {
	await countCommand.execute({ iteration: i })
}

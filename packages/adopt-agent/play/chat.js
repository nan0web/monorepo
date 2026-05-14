import { Blueprint } from '../src/domain/Blueprint.js'
// import { serveChat } from '@nan0web/chat'

async function run() {
	console.log('💬 Starting Chat Interface...')
	console.log('Use this entrypoint to host logic via @nan0web/chat')

	const config = new Blueprint({ name: 'chat-agent' })
	console.log('Loaded config:', config.name)

	// Example:
	// serveChat({ config })
}

run().catch(console.error)

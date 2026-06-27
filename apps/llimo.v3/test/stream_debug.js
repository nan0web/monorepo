import { AI } from '@nan0web/ai'

const ai = new AI()

async function main() {
	const modelId = process.argv[2] || 'gpt-4o-mini'
	const providerName = process.argv[3] || 'openai'

	console.log(`Starting stream debug for Model: ${modelId} via Provider: ${providerName}...`)

	try {
		const modelInfo = ai.findModel(modelId) || { id: modelId, provider: providerName }
		const streamResult = await ai.streamText(modelInfo, [
			{ role: 'user', content: 'Say hello and count to 3' }
		])

		console.log('\n--- Chunk Stream ---\n')
		for await (const chunk of streamResult.fullStream) {
			console.log('Chunk Event:', JSON.stringify(chunk, null, 2))
		}

		console.log('\n--- Final Usage Result ---\n')
		const usage = await streamResult.usage
		console.log('Usage Output:', JSON.stringify(usage, null, 2))
	} catch (e) {
		console.error('Error executing stream debug:', e)
	}
}

main()

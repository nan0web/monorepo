#!/usr/bin/env node
import OpenAI from 'openai'

// ВАЖЛИВО: Використовуємо стандартну бібліотеку openai
const client = new OpenAI({
	baseURL: 'http://localhost:1234/v1',
	apiKey: 'dummy-key', // MLX ігнорує ключ, але бібліотека вимагає його
})

// ID моделі, який видав сервер у curl
const MODEL_ID = '/Users/i/src/nan.web/models/qwen3-code-reasoning-4b-i1-nan0web'

const systemPrompt = `
Context: @nan0web platform.
Standard: Java•Script, JSDoc, node:test.
Rule: Be concise. Use pnpm.
`

async function generatePackageCode(task) {
	try {
		console.log(`🤖 Thinking about: ${task}`)
		console.log(`\n📝 Answer:\n`)

		// Вмикаємо режим потокової передачі (streaming)
		const stream = await client.chat.completions.create({
			model: MODEL_ID,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: task },
			],
			// max_tokens: 2048,
			temperature: 0.2,
			stream: true,
		})

		let fullText = ''

		// Читаємо потік чанками і виводимо в консоль без переносу рядка
		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content || ''
			if (content) {
				process.stdout.write(content) // Вивід якогось тексту в реальному часі
				fullText += content
			}
		}

		console.log('\n') // Кінцевий перенос рядка після завершення відповіді
		return fullText
	} catch (error) {
		console.error('\n❌ Error:', error.message)
		if (error.stack) console.error(error.stack)
		throw error
	}
}

// Example Execution
const task = [
	'Create a simple nan0web application that calculates a reasonance for the input arguments.',
	'% node resonance.js 2 3',
	'= 6',
	'% node resonance.js 2 3 4',
	'= 12',
	'% node resonance.js 2 3 4 6',
	'= 12',
	'% node resonance.js 2 3 4 6 12',
	'= 12',
	'% node resonance.js 3 6',
	'= 6',
].join('\n')

console.log('--- Start Test (Standard OpenAI) ---')
generatePackageCode(task)

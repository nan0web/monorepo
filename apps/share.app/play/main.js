#!/usr/bin/env node

import process from 'node:process'
import Logger from '@nan0web/log'
import { select } from '@nan0web/ui-cli'
import {
	DummyAdapter,
	TelegramAdapter,
	evaluateRules,
	executeTasks,
	parseDelay,
	SocialAdapterContent
} from '../src/index.js'

const console = new Logger({ level: 'info' })

console.clear()
console.info(Logger.style(Logger.LOGO, { color: Logger.MAGENTA }))

const demoSequence = process.env.PLAY_DEMO_SEQUENCE?.split(',').map((s) => Number(s.trim())) ?? []
let demoCursor = 0

/**
 * Prompt the user to select a demo.
 *
 * @returns {Promise<string>} The selected demo value.
 */
async function chooseDemo() {
	const demos = [
		{ name: '1. Rule Engine Evaluation', value: 'rules' },
		{ name: '2. Delay Parsing Demo', value: 'delay' },
		{ name: '3. Adapter Publishing Dry-Run', value: 'publish' },
		{ name: '← Exit', value: 'exit' },
	]

	if (demoCursor < demoSequence.length) {
		const idx = demoSequence[demoCursor++] - 1
		const menuValues = demos.map((el) => el.value)
		if (menuValues[idx]) {
			return menuValues[idx]
		}
		throw new Error(
			`Incorrect PLAY_DEMO_SEQUENCE ${demoSequence[demoCursor]}, max: ${menuValues.length}`,
		)
	}

	const choice = await select({
		title: 'Select ShareApp demo to run:',
		prompt: '[me]: ',
		invalidPrompt: Logger.style('[me invalid]', { color: 'red' }) + ': ',
		options: demos.map((d) => d.name),
		console,
	})

	return demos[choice.index].value
}

/**
 * Runs the Rule Engine Evaluation demo.
 */
async function runRulesDemo() {
	console.clear()
	console.success('--- Rules Evaluation Playground ---')

	const dummy = new DummyAdapter({ account: 'sovereign-channel' })
	const adapters = new Map([['dummy', dummy]])

	const rules = [
		{
			name: 'Public Ukrainian Posts',
			if: { tags: ['public'], lang: 'uk' },
			publish: [{ adapter: 'dummy', delay: '15m' }],
		},
		{
			name: 'Article Publishing',
			if: { type: 'article' },
			publish: [{ adapter: 'dummy', delay: '1d 09:00' }],
		}
	]

	const content = {
		text: 'Новий реліз NaN•Web v3.1.0 вже доступний!',
		tags: ['public', 'tech'],
		type: 'post',
		lang: 'uk'
	}

	console.info('Evaluating Content:\n', JSON.stringify(content, null, 2))
	console.info('Against Rules:\n', JSON.stringify(rules, null, 2))

	const tasks = evaluateRules(content, rules, adapters)

	console.success(`\nGenerated ${tasks.length} Distribution Tasks:`)
	for (const task of tasks) {
		console.info(`- Rule: "${task.ruleName}"`)
		console.info(`  Target Adapter: ${task.adapter.id} (${task.adapter.config.account})`)
		console.info(`  Calculated Delay: ${task.delayMs}ms (~${Math.round(task.delayMs / 60000)}m)`)
	}
}

/**
 * Runs the Delay Parsing demo.
 */
async function runDelayDemo() {
	console.clear()
	console.success('--- Delay Parsing Playground ---')

	const examples = ['0', '30m', '2h', '1d 09:00', 'Mon 10:00']

	console.info('Parsing various декларативні часові інтервали:')
	for (const ex of examples) {
		try {
			const ms = parseDelay(ex)
			console.info(`- "${ex}" matches exactly: ${ms}ms (~${(ms / 3600000).toFixed(2)} hours)`)
		} catch (err) {
			console.error(`- "${ex}" parsing error: ${err.message}`)
		}
	}
}

/**
 * Runs the Adapter dry-run publishing demo.
 */
async function runPublishDemo() {
	console.clear()
	console.success('--- Adapter Publishing dry-run ---')

	const dummy = new DummyAdapter({ account: 'main-stream' })
	console.info(`✓ Initialized DummyAdapter for account: "${dummy.config.account}"`)

	const content = {
		text: 'Sovereign digital state publication.',
		tags: ['sovereign'],
		type: 'post',
		lang: 'en'
	}

	console.info('Validating content schema...')
	const validation = SocialAdapterContent.validate(content)
	if (!validation.valid) {
		console.error('Validation failed:', validation.errors.join(', '))
		return
	}
	console.success('✓ Content is 100% valid.')

	console.info('Verifying adapter connection...')
	const verified = await dummy.verify()
	if (verified) {
		console.success('✓ Adapter connection successfully verified!')
	}

	console.info('Publishing to Dummy distribution node...')
	const result = await dummy.publish(content)
	console.success(`✓ Successfully published! Post ID: ${result.id}`)
	console.info(`  Post URL: ${result.url}`)
}

async function showMenu() {
	console.info('\n' + '='.repeat(50))
	console.info('Demo completed. Returning to menu...')
	console.info('='.repeat(50) + '\n')
}

async function main() {
	while (true) {
		try {
			const demo = await chooseDemo()

			switch (demo) {
				case 'rules':
					await runRulesDemo()
					break
				case 'delay':
					await runDelayDemo()
					break
				case 'publish':
					await runPublishDemo()
					break
				case 'exit':
					process.exit(0)
			}

			await showMenu()
		} catch (error) {
			if (error.message && error.message.includes('cancel')) {
				console.warn('\nDemo selection cancelled. Returning to menu...')
				await showMenu()
			} else {
				console.error('Unexpected error:', error)
				process.exit(1)
			}
		}
	}
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})

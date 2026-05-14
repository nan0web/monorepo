#!/usr/bin/env node

import Logger from '@nan0web/log'
import MailDB from '../src/MailDB.js'

/**
 * Demonstrates transforming a raw record with MailDB.
 *
 * @param {Logger} console - Logger instance for output.
 */
export async function runMailDBDemo(console) {
	console.clear()
	console.success('🗄️ Mail Package – MailDB Demo')

	const db = new MailDB()

	// Mock source data
	const source = {
		name: 'Bob Example',
		gender: 1,
		mail: 'bob@example.com',
	}

	// Simple config using function arrays
	const config = {
		formattedName: [(item) => item.name.split(' ')[0]],
		genderText: [(item) => (item.gender === 1 ? 'male' : 'female')],
		email: { $ref: 'mail' },
		certificateNo: [() => '001'],
	}

	const result = await db.transform(source, config, {})
	console.info('🔧 Transformed result:', result)

	console.success('✅ MailDB demo complete')
}

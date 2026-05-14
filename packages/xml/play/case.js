#!/usr/bin/env node

/**
 * @param {import("@nan0web/log")} console
 */
export async function run(console) {
	console.clear()
	console.success('Case Transformations Demo')

	const { Case } = await import('../src/index.js')

	const examples = ['hello-world', 'helloWorld', 'hello_world', 'HelloWorld', 'my-string_value']

	const transforms = [
		{ fn: Case.toCamelCase, name: 'toCamelCase' },
		{ fn: Case.toKebabCase, name: 'toKebabCase' },
		{ fn: Case.toSnakeCase, name: 'toSnakeCase' },
		{ fn: Case.toPascalCase, name: 'toPascalCase' },
		{ fn: Case.toUpperCase, name: 'toUpperCase' },
		{ fn: Case.toLowerCase, name: 'toLowerCase' },
	]

	console.info('Case transformation examples:\n')

	for (const example of examples) {
		console.info(`Input: "${example}"`)
		for (const { fn, name } of transforms) {
			const result = fn(example)
			console.info(`  ${name.padEnd(15)} → "${result}"`)
		}
		console.info('')
	}

	// Using transform with constants
	console.info('Using Case.transform with constants:\n')
	const input = 'my_string-value'
	console.info(`Transform "${input}":`)
	console.info(`  CAMEL:  ${Case.transform(input, Case.CAMEL)}`)
	console.info(`  KEBAB:  ${Case.transform(input, Case.KEBAB)}`)
	console.info(`  SNAKE:  ${Case.transform(input, Case.SNAKE)}`)
	console.info(`  PASCAL: ${Case.transform(input, Case.PASCAL)}`)
	console.info(`  UPPER:  ${Case.transform(input, Case.UPPER)}`)
	console.info(`  LOWER:  ${Case.transform('MyVar', Case.LOWER)}`)

	console.success('\nCase transformations demo complete! 🔤')
}

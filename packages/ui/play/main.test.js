/**
 * Playground integration tests – verify that the interactive demos work as expected.
 *
 * @module play/main.test
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
// import { PlaygroundTest } from "@nan0web/ui-cli/test"
import { Readable } from 'node:stream'

const baseOutput = [
	'| \\  | |_____| | \\  |     |  |  | |______ |_____] ',
	'|  \\_| |     | |  \\_|  •  |__|__| |______ |_____] ',
]

/**
 * Створює stdin з автоматичним закриттям після останнього вводу.
 */
function createStdin(lines) {
	const stream = Readable.from(lines.map((line) => line + '\n'))
	// Закриваємо потік після всіх даних
	const originalPush = stream._read
	stream._read = function (size) {
		originalPush.call(this, size)
	}
	process.nextTick(() => {
		stream.push(null) // EOF
	})
	return stream
}

/**
 * @todo fix the tests
 * PlaygroundTest is not published yet.
 */
describe.skip('playground demo flow', () => {
	it('runs language selection then exits (sequence 1,uk,5)', async () => {
		const pt = new PlaygroundTest(process.env, { includeDebugger: false })
		pt.stdin = createStdin(['1', 'uk', '5'])
		const result = await pt.run(['play/main.js'])

		assert.strictEqual(result.exitCode, 0, `Process exited with ${result.exitCode}`)
		assert.equal(result.stderr, '', 'No stderr expected')

		const lines = result.stdout
			.split('\n')
			.slice(1)
			.filter((l) => !/\x1b\[.*?m/.test(l))
			.map((l) => l.trim())
			.filter((l) => l !== '')

		let i = 0
		assert.match(lines[i++], /^Select demo:$/)
		assert.match(lines[i++], /^ 1\) Select a language$/)
		assert.match(lines[i++], /^ 2\) Registration Form$/)
		assert.match(lines[i++], /^ 3\) Currency Exchange$/)
		assert.match(lines[i++], /^ 4\) Top‑up Telephone$/)
		assert.match(lines[i++], /^ 5\) ← Exit$/)

		assert.match(lines[i++], /^\[me\]: 1$/)
		assert.match(lines[i++], /^=== Language Selector ===$/)
		assert.match(lines[i++], /^ 1\) en$/)
		assert.match(lines[i++], /^ 2\) uk$/)

		assert.match(lines[i++], /^\[me\]: uk$/)
		assert.strictEqual(lines[i++], 'uk')

		// Back to menu – now in Ukrainian
		assert.match(lines[i++], /^Оберіть демонстрацію:$/)
		assert.match(lines[i++], /^ 1\) Оберіть демонстрацію:$/)
		assert.match(lines[i++], /^ 2\) Форма реєстрації$/)
		assert.match(lines[i++], /^ 3\) Обмін валют$/)
		assert.match(lines[i++], /^ 4\) Поповнення телефону$/)
		assert.match(lines[i++], /^ 5\) ← Exit$/)

		assert.match(lines[i++], /^\[me\]: 5$/)
		assert.strictEqual(lines[i++], 'До побачення.')
	})

	it('runs registration form then exits (sequence 1,John,pa$$w0rd,pa$$w0rd,email@example.com,0)', async () => {
		const pt = new PlaygroundTest(process.env, { includeDebugger: false })
		pt.stdin = createStdin(['1', 'John', 'pa$$w0rd', 'pa$$w0rd', 'email@example.com', '', '0'])
		const result = await pt.run(['play/main.js'])

		assert.strictEqual(result.exitCode, 0, `Process exited with ${result.exitCode}`)
		assert.equal(result.stderr, '', 'No stderr expected')

		const lines = result.stdout
			.split('\n')
			.slice(1)
			.filter((l) => !/\x1b/.test(l))
			.map((l) => l.trim())
			.filter((l) => l !== '')

		let i = 0
		assert.match(lines[i++], /^Select demo:$/)
		i += 5

		assert.match(lines[i++], /^\[me\]: 1$/)
		assert.match(lines[i++], /^=== Registration Form ===$/)
		assert.match(lines[i++], /^Username: John$/)
		assert.match(lines[i++], /^Password \(min 4 chars\): pa\$\$w0rd$/)
		assert.match(lines[i++], /^Confirm Password: pa\$\$w0rd$/)
		assert.match(lines[i++], /^Email or Telephone: email@example\.com$/)
		assert.match(lines[i++], /^Press ENTER to submit, type 0 to cancel: $/)

		assert.match(lines[i++], /^Form submitted successfully!$/)
		assert.match(lines[i++], /^\{/)
		assert.match(lines[i++], /^  "username": "John"$/)
		assert.match(lines[i++], /^  "password": "\*\*\*\*"$/)
		assert.match(lines[i++], /^  "emailOrTel": "email@example\.com"$/)
		assert.match(lines[i++], /^\}$/)

		// Back to menu
		assert.match(lines[i++], /^Select demo:$/)
		i += 5

		assert.match(lines[i++], /^\[me\]: 0$/)
		assert.match(lines[i++], /^Good‑bye.$/)
	})

	it('runs currency exchange with valid inputs then exits (sequence 2,USD,EUR,100,0)', async () => {
		const pt = new PlaygroundTest(process.env, { includeDebugger: false })
		pt.stdin = createStdin(['2', 'USD', 'EUR', '100', '0'])
		const result = await pt.run(['play/main.js'])

		assert.strictEqual(result.exitCode, 0, `Process exited with ${result.exitCode}`)
		assert.equal(result.stderr, '', 'No stderr expected')

		const lines = result.stdout
			.split('\n')
			.slice(1)
			.filter((l) => !/\x1b/.test(l))
			.map((l) => l.trim())
			.filter((l) => l !== '')

		let i = 0
		assert.match(lines[i++], /^Select demo:$/)
		i += 5

		assert.match(lines[i++], /^\[me\]: 2$/)
		assert.match(lines[i++], /^=== Currency Exchange ===$/)
		assert.match(lines[i++], /^From Currency: USD$/)
		assert.match(lines[i++], /^To Currency: EUR$/)
		assert.match(lines[i++], /^Amount: 100$/)

		const resultLine = lines[i++]
		assert.ok(
			/100 USD = 90\.00 EUR/.test(resultLine),
			`Expected exchange result, got: ${resultLine}`,
		)

		// Back to menu
		assert.match(lines[i++], /^Select demo:$/)
		i += 5

		assert.match(lines[i++], /^\[me\]: 0$/)
		assert.match(lines[i++], /^Good‑bye.$/)
	})
})

/**
 * @todo fix the tests
 */
describe.skip('playground cancel handling', () => {
	it('cancels registration form and returns to menu (sequence 1,0)', async () => {
		const pt = new PlaygroundTest(process.env, { includeDebugger: false })
		pt.stdin = createStdin(['1', '0'])
		const result = await pt.run(['play/main.js'])

		assert.strictEqual(result.exitCode, 0)
		assert.equal(result.stderr, '⨉ Cancelled.')

		const lines = result.stdout
			.split('\n')
			.slice(1)
			.filter((l) => !/\x1b/.test(l))
			.map((l) => l.trim())
			.filter((l) => l !== '')

		let i = 0
		assert.match(lines[i++], /^Select demo:$/)
		i += 5

		assert.match(lines[i++], /^\[me\]: 1$/)
		assert.match(lines[i++], /^=== Registration Form ===$/)
		assert.match(lines[i++], /^Username: 0$/)
	})
})

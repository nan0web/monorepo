import Intent from '../src/core/Intent.js'
import { CancelError } from '../src/core/Error/index.js'

/**
 * Example: User expresses intent to log in.
 * The system reacts, not by prompting, but by checking readiness.
 */

class LoginBody {
	static username = {
		required: true,
		help: 'Username',
		pattern: /^[a-z0-9_]{3,20}$/,
	}

	static password = {
		required: true,
		help: 'Password',
		validate: (value) => {
			if (value.length < 8) return 'too short (min 8)'
			if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return 'must include upper, lower, digit'
			return true
		},
	}
}

class LoginMessage {
	static Body = LoginBody

	/**
	 * @param {object} input
	 * @param {string} [input.username]
	 * @param {string} [input.password]
	 */
	constructor(input = {}) {
		const { username = '', password = '' } = input
		this.username = String(username)
		this.password = String(password)
	}
}

// --- Intent Creation ---
const intent = new Intent({
	target: LoginMessage,
	body: {
		username: 'al', // too short → error
		password: '123', // invalid → error
	},
	context: { ip: '192.168.1.1' },
})

console.log('Intent ready?', intent.isReady()) // false
console.log('Validation errors:', Object.fromEntries(intent.validateIntent()))

// --- Intent Handler ---
/**
 * Handles an Intent by fulfilling missing or invalid fields.
 *
 * @param {Intent} intent - the declared intent to handle
 * @param {object} inputAdapter - must have `.ask(prompt)`
 * @returns {Promise<Message>} resolved when intent is fulfilled
 * @throws {CancelError} if user cancels
 */
async function handleIntent(intent, inputAdapter) {
	if (intent.isReady()) {
		return intent.execute()
	}

	const schema = intent.target.Body
	const completedBody = { ...intent.body }
	const errors = intent.validateIntent()

	// Re-ask until all errors are fixed
	for (const field of Object.keys(errors)) {
		const schemaField = schema[field]
		const prompt = schemaField.help + ': '

		while (true) {
			const answer = await inputAdapter.ask(prompt)

			if (answer.cancelled) {
				throw new CancelError('User cancelled action')
			}

			completedBody[field] = answer.value

			// Rebuild intent to revalidate
			const tempIntent = new Intent({
				...intent,
				body: completedBody,
			})

			const newErrors = tempIntent.validateIntent()
			if (!newErrors.has(field)) break // valid → move to next

			const errorMsg = newErrors.get(field)
			console.error(`❌ Invalid ${field}: ${errorMsg}`)
		}
	}

	const finalIntent = new Intent({ ...intent, body: completedBody })
	return finalIntent.execute()
}

// --- Test Adapter ---
const mockInputAdapter = {
	async ask(prompt) {
		const fakeInput = {
			'Username: ': 'alice_wonder',
			'Password: ': 'Secret123',
		}
		const value = fakeInput[prompt] || ''

		return {
			value,
			cancelled: value === '',
		}
	},
}

// --- Run ---
handleIntent(intent, mockInputAdapter)
	.then((result) => {
		console.log('✅ Login successful as:', result.username)
	})
	.catch((err) => {
		if (err instanceof CancelError) {
			console.log('🚫 Action cancelled.')
		} else {
			console.error('💥 Error:', err)
		}
	})

/**
 * Simple registration form using stdin.
 *
 * Fields: username, password, confirm, emailOrTel
 *
 * Controls:
 *   - Input "0" -> cancel (onCancel)
 *   - Empty input on final prompt -> submit (onSubmit)
 */
import { CancelError } from '@nan0web/ui-cli'

/**
 * Main registration flow
 * @todo add proper jsdoc to make autocomplete work for input as result of ask, console, t.
 */
export async function runRegistration(t, ask, console) {
	console.info('\n=== ' + t('Registration Form') + ' ===')
	const data = {}

	// username
	{
		const input = await ask(t('Username') + ': ', true)
		if (input.cancelled) throw new CancelError()
		data.username = input.value
	}
	// password
	{
		const input = await ask(
			t('Password (min 4 chars)') + ': ',
			(input) => input.value.length < 4,
			t('! Password must be at least 4 characters') + ': ',
		)
		if (input.cancelled) throw new CancelError()
		data.password = input.value
	}
	// confirm password
	{
		await ask(t('Confirm Password') + ': ', (input) => {
			if (input.value !== data.password) {
				console.error(t('Passwords do not match. Try again.'))
				return true
			}
			return false
		})
	}
	// email or telephone
	{
		const input = await ask(t('Email or Telephone') + ': ', true)
		if (input.cancelled) throw new CancelError()
		data.emailOrTel = input.value
	}
	// final confirmation – empty line submits, "0" cancels
	{
		await ask(t('Press ENTER to submit, type 0 to cancel') + ': ', (i) => '' != i.value)
	}
	console.success('\n' + t('Form submitted successfully!'))
	console.info(JSON.stringify({ ...data, password: '****' }, null, 2))
}

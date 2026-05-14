import { UiForm as UIForm } from '@nan0web/ui'

/**
 * Семантична форма для реєстрації через AuthApp
 */
export default class AuthForm {
	constructor({ adapter, formId = 'auth-signup-form', fieldsConfig = {} }) {
		this.adapter = adapter
		this.formId = formId
		this.fieldsConfig = fieldsConfig
	}

	/**
	 * Створює форму для реєстрації
	 * @param {Object} config
	 */
	createSignUpForm({ title, validateValue, validate, setData }) {
		return UIForm.from({
			title,
			id: this.formId,
			fields: this._createFieldsConfig(),
			state: {},
			validateValue: validateValue || this._defaultValidateValue.bind(this),
			validate: validate || this._defaultValidateForm.bind(this),
			setData: setData || this._defaultSetData.bind(this),
		})
	}

	/**
	 * Створює конфігурацію полів форми
	 * @private
	 */
	_createFieldsConfig() {
		return [
			{
				name: 'email',
				label: 'Електронна пошта',
				placeholder: 'user@example.com',
				help: 'Адреса для підтвердження та сповіщень',
				type: 'email',
				required: true,
			},
			{
				name: 'password',
				label: 'Пароль',
				help: 'Щонайменше 8 символів',
				type: 'password',
				required: true,
			},
			{
				name: 'username',
				label: "Ім'я користувача",
				help: 'Показуватиметься в профілі',
				required: true,
			},
		]
	}

	/**
	 * Перевірка окремого поля
	 * @private
	 */
	_defaultValidateValue(name, value) {
		// Тут може бути детальна перевірка залежно від поля
		const isEmpty = value === ''
		const isEmail = name === 'email'
		const isPassword = name === 'password'
		const isUsername = name === 'username'

		if (isEmail) {
			const isValid = !isEmpty && /\S+@\S+\.\S+/.test(value)
			return {
				isValid,
				errors: isValid ? {} : { [name]: 'Некоректна електронна адреса' },
			}
		}

		if (isPassword) {
			const isValid = !isEmpty && value.length >= 8
			return {
				isValid,
				errors: isValid ? {} : { [name]: 'Пароль має містити щонайменше 8 символів' },
			}
		}

		if (isUsername) {
			const isValid = !isEmpty && value.length >= 3
			return {
				isValid,
				errors: isValid ? {} : { [name]: "Ім'я має містити щонайменше 3 символи" },
			}
		}

		return { isValid: true, errors: {} }
	}

	/**
	 * Повна валідація форми
	 * @private
	 */
	_defaultValidateForm(state) {
		// Проста валідація для прикладу
		const isValid = !!state.email && !!state.password && !!state.username
		return {
			isValid,
			errors: isValid ? {} : { general: 'Будь ласка, заповніть усі поля' },
		}
	}

	/**
	 * Оновлення стану форми
	 * @private
	 */
	_defaultSetData(state, newData) {
		return { ...state, ...newData }
	}
}

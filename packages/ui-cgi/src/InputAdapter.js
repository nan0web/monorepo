import blessed from 'blessed'
import BaseInputAdapter from '@nan0web/ui/core/InputAdapter.js'
import { InputMessage } from '@nan0web/ui/core/Message.js'

export default class CGIInputAdapter extends BaseInputAdapter {
	/**
	 * Запитує дані за допомогою інтерактивної форми
	 */
	async requestForm(form) {
		return new Promise((resolve) => {
			const screen = blessed.screen({
				smartCSR: true,
				title: form.title || 'Form',
				cursor: { artificial: true, blink: true },
			})

			const container = blessed.box({
				top: 'center',
				left: 'center',
				width: '60%',
				height: '80%',
				border: 'line',
				label: form.title,
				tags: true,
			})

			const inputFields = []

			// Створюємо поля
			form.fields.forEach((field, index) => {
				const top = index * 3 + 1

				const label = blessed.text({
					top,
					left: 2,
					content: `{bold}${field.label || field.name}{/bold}${field.required ? ' *' : ''}`,
				})

				let input
				if (field.type === 'password') {
					input = blessed.form({
						parent: container,
						top: top + 1,
						left: 2,
						width: '90%',
						height: 3,
						keys: true,
						vi: true,
					})

					const passwordField = blessed.textbox({
						parent: input,
						name: field.name,
						top: 0,
						left: 0,
						width: '100%',
						height: 1,
						type: 'password',
						style: { focus: { border: { fg: 'green' } } },
					})

					inputFields.push(passwordField)
				} else if (field.type === 'select' && field.options) {
					const list = blessed.list({
						parent: container,
						top: top + 1,
						left: 2,
						width: '90%',
						height: field.options.length + 2,
						items: field.options.map(
							(opt, i) =>
								`${form.state[field.name] === opt.value ? '(*)' : '( )'} ${opt.label || opt.value}`,
						),
						keys: true,
						mouse: true,
						style: {
							item: { hover: { bg: 'blue' } },
							selected: { bg: 'green', bold: true },
						},
					})

					list.on('select', (item, index) => {
						// Оновлюємо відображення вибору
						const items = field.options.map(
							(opt, i) => `${i === index ? '(*)' : '( )'} ${opt.label || opt.value}`,
						)
						list.setItems(items)

						// Зберігаємо значення
						form.state[field.name] = field.options[index].value
					})

					inputFields.push(list)
				} else {
					input = blessed.textbox({
						parent: container,
						name: field.name,
						top: top + 1,
						left: 2,
						width: '90%',
						height: 1,
						value: form.state[field.name] || '',
						style: { focus: { border: { fg: 'green' } } },
					})

					inputFields.push(input)
				}

				container.append(label)
				// Намальовання відбувається пізніше
			})

			// Кнопки
			const buttonContainer = blessed.box({ top: '80%', height: 3 })

			const submitButton = blessed.button({
				parent: buttonContainer,
				content: 'Submit',
				top: 0,
				left: 2,
				width: 12,
				height: 1,
				style: { bg: 'green', focus: { bg: 'cyan' } },
			})

			const cancelButton = blessed.button({
				parent: buttonContainer,
				content: 'Cancel',
				top: 0,
				left: 16,
				width: 12,
				height: 1,
				style: { bg: 'red', focus: { bg: 'cyan' } },
			})

			buttonContainer.append(submitButton)
			buttonContainer.append(cancelButton)
			container.append(buttonContainer)
			screen.append(container)
			screen.render()

			// Управління фокусом
			let currentFocus = 0
			this._setFocus(inputFields[currentFocus])

			const keyHandler = (ch, key) => {
				if (key.name === 'tab' || key.name === 'down') {
					currentFocus = (currentFocus + 1) % inputFields.length
					this._setFocus(inputFields[currentFocus])
				} else if (key.name === 'backtab' || key.name === 'up') {
					currentFocus = (currentFocus - 1 + inputFields.length) % inputFields.length
					this._setFocus(inputFields[currentFocus])
				} else if (key.name === 'enter') {
					if (currentFocus === inputFields.length) {
						// Перевірка валідації перед відправленням
						const { isValid, errors } = form.validate()

						if (!isValid) {
							const errorBox = blessed.box({
								top: 'center',
								left: 'center',
								width: '50%',
								height: 5,
								border: 'line',
								content:
									'Please correct the following errors:\n' + Object.values(errors).join('\n'),
								style: { bg: 'red' },
							})

							screen.append(errorBox)
							screen.render()

							setTimeout(() => {
								screen.remove(errorBox)
								screen.render()
							}, 3000)

							return
						}

						// Збираємо дані
						const formData = {}
						form.fields.forEach((field, index) => {
							if (field.type === 'select') {
								formData[field.name] = form.state[field.name]
							} else {
								formData[field.name] = inputFields[index].value
							}
						})

						screen.destroy()
						resolve(
							InputMessage.from({
								value: JSON.stringify(formData),
								action: 'form-submit',
								elementId: form.elementId,
								data: formData,
							}),
						)
					}
				} else if (key.name === 'escape') {
					screen.destroy()
					resolve(
						InputMessage.from({
							value: '',
							escaped: true,
							action: 'form-cancel',
							elementId: form.elementId,
						}),
					)
				}
			}

			screen.on('keypress', keyHandler)

			submitButton.on('press', () => {
				// Обробка Submit через клік
				const { isValid, errors } = form.validate()

				if (!isValid) {
					const errorBox = blessed.box({
						top: 'center',
						left: 'center',
						width: '50%',
						height: 5,
						border: 'line',
						content: 'Please correct the following errors:\n' + Object.values(errors).join('\n'),
						style: { bg: 'red' },
					})

					screen.append(errorBox)
					screen.render()

					setTimeout(() => {
						screen.remove(errorBox)
						screen.render()
					}, 3000)

					return
				}

				const formData = {}
				form.fields.forEach((field, index) => {
					if (field.type === 'select') {
						formData[field.name] = form.state[field.name]
					} else {
						formData[field.name] = inputFields[index].value
					}
				})

				screen.destroy()
				resolve(
					InputMessage.from({
						value: JSON.stringify(formData),
						action: 'form-submit',
						elementId: form.elementId,
						data: formData,
					}),
				)
			})

			cancelButton.on('press', () => {
				screen.destroy()
				resolve(
					InputMessage.from({
						value: '',
						escaped: true,
						action: 'form-cancel',
						elementId: form.elementId,
					}),
				)
			})
		})
	}

	_setFocus(element) {
		if (element.focus) element.focus()
	}
}

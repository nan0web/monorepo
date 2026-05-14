// @nan0web/ui-telegram/src/Adapter.js
import { InputMessage } from '@nan0web/ui/core/Message.js'
import { InputAdapter, OutputAdapter } from '@nan0web/ui/core/BaseAdapter.js'
import TelegramBot from 'node-telegram-bot-api'

/**
 * Адаптер для Telegram бота
 */
class TelegramAdapter {
	/**
	 * @param {string} token - Токен Telegram бота
	 */
	constructor(token) {
		this.bot = new TelegramBot(token, { polling: true })
		this.inputAdapter = new InputAdapter()
		this.outputAdapter = new OutputAdapter()

		this._setupHandlers()
	}

	_setupHandlers() {
		// Обробка текстових повідомлень
		this.bot.on('message', (msg) => {
			const chatId = msg.chat.id
			this.inputAdapter.emit(
				'input',
				InputMessage.from({
					value: msg.text,
					chatId,
					elementType: 'text',
				}),
			)
		})

		// Обробка кнопок
		this.bot.on('callback_query', (callbackQuery) => {
			const message = callbackQuery.message
			this.inputAdapter.emit(
				'input',
				InputMessage.from({
					value: callbackQuery.data,
					chatId: message.chat.id,
					messageId: message.message_id,
					elementType: 'button',
				}),
			)
		})
	}

	/**
	 * Надсилає повідомлення через Telegram
	 * @param {OutputMessage} message
	 * @param {object} options
	 */
	render(message, options = {}) {
		const { content, metadata, isError } = message
		const chatId = options.chatId || metadata.chatId

		if (metadata.elementType === 'keyboard') {
			const keyboard = {
				reply_markup: {
					inline_keyboard: metadata.buttons.map((buttons) =>
						buttons.map((b) => ({ text: b.text, callback_data: b.callbackData })),
					),
				},
			}

			this.bot.sendMessage(chatId, content.length > 0 ? content[0] : 'Select an option:', keyboard)
		} else if (metadata.elementType === 'progress') {
			// Відображаємо прогрес у вигляді тексту
			const progressText = `Progress: ${Math.round(metadata.progress * 100)}%`
			this.bot.sendMessage(chatId, progressText)
		} else {
			const text = content.join('\n')
			const options = {}

			if (isError) {
				options.parse_mode = 'Markdown'
				options.reply_markup = {
					inline_keyboard: [[{ text: 'Report bug', callback_data: 'report_bug' }]],
				}
			}

			this.bot.sendMessage(chatId, text, options)
		}
	}

	/**
	 * Створює інтерактивну клавіатуру
	 */
	createKeyboard(chatId, title, buttons) {
		this.outputAdapter.render(
			OutputMessage.from({
				content: [title],
				metadata: {
					elementType: 'keyboard',
					buttons,
				},
			}),
			{ chatId },
		)
	}

	/**
	 * Закриває клавіатуру
	 */
	closeKeyboard(chatId, messageId) {
		this.bot.editMessageReplyMarkup(
			{ inline_keyboard: [] },
			{ chat_id: chatId, message_id: messageId },
		)
	}

	/**
	 * Обробка довгих процесів через потоки
	 */
	startLongOperation(chatId, processFn) {
		let lastProgressUpdate = 0

		return new Promise(async (resolve, reject) => {
			try {
				const reader = {
					read: async () => {
						const result = await processFn()
						if (result.done) return { done: true, value: result.value }

						// Обмежуємо частоту оновлення прогресу
						const now = Date.now()
						if (now - lastProgressUpdate > 2000 || result.progress === 1) {
							this.render(
								OutputMessage.from({
									content: [],
									metadata: {
										progress: result.progress,
										elementType: 'progress',
									},
								}),
								{ chatId },
							)

							lastProgressUpdate = now
						}

						return { done: false, value: result.value }
					},
				}

				// Запускаємо потокову обробку
				let streamComplete = false
				while (!streamComplete) {
					const { done, value } = await reader.read()
					if (done) {
						streamComplete = true
						resolve(value)
					}
				}
			} catch (error) {
				this.render(
					OutputMessage.from({
						content: [error.message],
						isError: true,
					}),
					{ chatId },
				)

				reject(error)
			}
		})
	}
}

export default TelegramAdapter

import DB from '@nan0web/db-fs'
import { EditorModel } from '../../domain/EditorModel.js'
import { EditorCli } from './EditorCli.js'
import { resolve } from 'node:path'

// 1. Ініціалізуємо базу даних на базі файлової системи
const db = new DB({ root: resolve('data') })
await db.connect()

// 2. Створюємо модель редактора
const model = new EditorModel({}, { db })

// 3. Запускаємо CLI адаптер
const cli = new EditorCli(model)

console.log('\x1b[32m%s\x1b[0m', '🚀 Starting NaN•Web Editor CLI...')

// Запускаємо цикл через асинхронний ітератор
// Адаптер сам викликає логери, а ми лише повертаємо результати для ask()
const gen = cli.run()
let next = await gen.next()

while (!next.done) {
	const intent = next.value
	
	// В терміналі інтенти від @nan0web/ui-cli вже готові до виконання
	// Ми просто чекаємо на ввід користувача (якщо це ask)
	const result = await intent
	next = await gen.next(result)
}

#!/usr/bin/env node
/**
 * 🎯 Перевірка, що `clearLine` + наступний лог НЕ створює зайвих рядків.
 *
 * Запуск:
 *   pnpm flicker-check
 *   # або
 *   node play/flicker-check.example.js
 *
 * Очікуваний результат – зелений «✅ PASS».
 */

import Logger from '../src/index.js'
import NoConsole from '../src/NoConsole.js'

const noConsole = new NoConsole()
const logger = new Logger({
	level: 'debug',
	icons: false,
	chromo: false,
	console: noConsole,
})

// 1️⃣ Перший рядок
logger.info('first line')

// 2️⃣ Очищення поточної лінії (без тексту – просто стираємо)
logger.clearLine()

// 3️⃣ Другий «записаний» рядок (після стирання)
logger.info('third line')

// 4️⃣ Забираємо те, що записано у NoConsole
const out = noConsole.output() // [[method, text], …]
const rows = out.map(([, txt]) => txt) // лише текстові частини

// Очікування: два рядки – *first line* і *third line*.
// `clearLine` не залишає жодного нового рядка.
const expectedCount = 2
const hasNewlines = rows.some((l) => l.includes('\n'))

const ok = out.length === expectedCount && !hasNewlines

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

if (ok) {
	console.log(`${GREEN}✅ PASS${RESET} – clearLine works without extra line breaks.`)
} else {
	console.error(`${RED}❌ FAIL${RESET} – something went wrong.`)
	console.error('Captured lines:', rows)
	console.error('Count:', out.length, '| contains \\n ?', hasNewlines)
}

const format = new Intl.NumberFormat('en-US').format
const phrases = ['random text', 'is here', 'to show new lines']
const printer = new Logger()
printer.cursorHide()
printer.info('Start')
printer.info('..')
for (let i = 0; i < 99_000; i++) {
	printer.cursorUp(1)
	printer.info(printer.fill(`Step ${format(i)} ${phrases[i % phrases.length]}`))
}
printer.cursorShow()
printer.info('Complete')

process.exit(ok ? 0 : 1)

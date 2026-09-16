---
description: Стандарт роботи з даними через $db без використання node:fs та node:path
---

# 📦 Протокол доступу до даних: Zero-FS & $db Standard

> **Золоте правило:** Моделям, CLI-командам, сервісам та сідерам **СУВОРО ЗАБОРОНЕНО** імпортувати або використовувати `node:fs`, `node:fs/promises` та `node:path`.
> Уся робота з файлами, каталогами, читанням, записом і навігацією шляхів у моделях NaN•Web здійснюється **ВИКЛЮЧНО** через інжектований екземпляр бази даних (`this.$db` або `options.db`).

---

## 1. Таблиця заміни Node.js I/O на методи $db

| Операція Node.js (`fs` / `path`)        | Канонічний еквівалент у `$db`                     | Опис поведінки                                                             |
| :-------------------------------------- | :------------------------------------------------ | :------------------------------------------------------------------------- |
| `fs.readFileSync(p)` / `readFile`       | `await db.loadDocument(uri, defaultVal)`          | Завантажує документ (автоматично парсить `.yaml`, `.nan0`, `.json`, `.md`) |
| `fs.writeFileSync(p, data)`             | `await db.saveDocument(uri, data)`                | Зберігає документ (автоматично серіалізує за розширенням, оновлює індекси) |
| `fs.writeFileSync(p, rawStr)`           | `await db.saveFile(uri, rawBufferOrString)`       | Зберігає сирий файл без серіалізації                                       |
| `fs.existsSync(p)` / `fs.statSync`      | `await db.stat(uri)`                              | Повертає `DocumentStat` або `undefined` (не кидає помилок при відсутності) |
| `fs.unlinkSync(p)` / `rm`               | `await db.dropDocument(uri)`                      | Видаляє документ та інвалідує кеші                                         |
| `fs.renameSync(from, to)`               | `await db.moveDocument(from, to)`                 | Переміщує документ з оновленням індексів                                   |
| `fs.readdirSync(dir)`                   | `await db.listDir(uri)`                           | Повертає масив `DocumentEntry[]` для каталогу                              |
| Рекурсивний пошук файлів                | `for await (const entry of db.browse(uri, opts))` | Асинхронний генератор обходу каталогу (аналог `ls -r`)                     |
| Складне читання з $ref та успадкуванням | `await db.fetch(uri)`                             | Повне ієрархічне зшивання (папки `_`, `langs`, `t`, посилання `$ref`)      |
| `path.resolve(...)`                     | `db.resolveSync(cwd, root, ...args)`              | Безпечний резолв віртуальних та відносних шляхів                           |
| `path.join(...)` / `normalize`          | `db.normalize(...args)`                           | Нормалізація шляху (без зайвих слешів)                                     |
| `path.dirname(p)`                       | `db.dirname(uri)`                                 | Отримання батьківського каталогу                                           |
| `path.basename(p, ext)`                 | `db.basename(uri, removeSuffix)`                  | Базове ім'я (з опціональним відсіканням розширення)                        |
| `path.extname(p)`                       | `db.extname(uri)`                                 | Розширення файлу (з крапкою, напр. `.yaml`)                                |
| `path.relative(from, to)`               | `db.relative(from, to)`                           | Відносний шлях між двома URI                                               |

---

## 2. Як модель отримує `$db`

У парадигмі **Model-as-App** або **Model**:

1. База передається в опціях середовища: `new MyModel(data, { db })`.
2. Всередині класу доступ до бази йде через гетер `this.$db`:

```javascript
import { ModelAsApp, progress, show, result } from '@nan0web/ui'

export class SeedOfficesCommand extends ModelAsApp {
	/**
	 * Системний аліас команди починається з $ ($alias).
	 */
	static $alias = 'seed'

	/**
	 * Ключі та дефолтні фрази ОБОВ'ЯЗКОВО пишуться англійською.
	 * Локалізовані тексти завантажуються зі словників `[locale]/_/t.{yaml|nan0}`
	 * або перевизначаються у конкретному документі даних.
	 */
	static UI = {
		title: 'Bank offices synchronization',
		starting: 'Checking and loading {path}...',
		completed: 'Successfully processed {count} offices',
		errorNotFound: 'Document {path} not found in database',
		errorNoDb: 'Database instance ($db) is required for {alias}',
	}

	static path = {
		help: 'Path to the offices database document',
		default: 'offices',
		positional: true,
	}

	/**
	 * @param {Partial<SeedOfficesCommand>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Path to the offices database document */ this.path
	}

	/**
	 * Run the offices seeding command logic.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, unknown>}
	 */
	async *run() {
		const { t } = this._
		const db = this.$db

		// 1. Сповіщення інтерфейсу через Intent progress з автоматичним перекладом
		yield progress(t(SeedOfficesCommand.UI.starting, { path: this.path }))

		// 2. Безпечне читання БЕЗ обов'язкового розширення (auto fallback: .yaml, .nan0, .json, та інші DATA_EXTNAMES)
		// Усі глобальні змінні з батьківських _/ та посилання $ref резолвляться автоматично
		const offices = await db.loadDocument(this.path, null)
		if (!offices) {
			yield show(t(SeedOfficesCommand.UI.errorNotFound, { path: this.path }), 'error')
			// Повертаємо детермінований ключ помилки з моделі (Zero-Hardcode)
			return result({
				ok: false,
				count: 0,
				error: SeedOfficesCommand.UI.errorNotFound,
			})
		}

		// 3. Збереження результату назад
		const list = Array.isArray(offices) ? offices : [offices]
		const targetUri = db.extname(this.path) ? this.path : `${this.path}.yaml`
		await db.saveDocument(targetUri, list)

		// 4. Повідомлення про успіх через Intent show та фінальний Intent result
		yield show(t(SeedOfficesCommand.UI.completed, { count: list.length }), 'success')

		return result({
			ok: true,
			count: list.length,
			path: targetUri,
		})
	}
}
```

---

## 3. Рецепт: Пошук та фільтрація файлів без `fs.readdirSync`

Замість колупання в каталогах через `fs.readdirSync` та жорстких регулярних виразів:

```javascript
// ❌ ЗАБОРОНЕНО:
// const files = fs.readdirSync(path.join(rootDir, 'articles/data'))

// ✅ КАНОНІЧНИЙ ПІДХІД (через db.browse або db.listDir та db.isData):
async function getEntityFiles(db, dir = 'articles/data') {
	const items = []

	// Варіант A: Отримання списку одного каталогу через db.listDir
	const entries = await db.listDir(dir)
	for (const entry of entries) {
		// db.isData() автоматично перевіряє всі підтримувані розширення (DATA_EXTNAMES)
		if (entry.isFile && db.isData(entry.name)) {
			items.push(entry.uri)
		}
	}

	// Варіант B: Рекурсивний обхід з фільтрацією через db.browse
	for await (const entry of db.browse(dir, { depth: 5 })) {
		if (entry.isFile && db.isData(entry.name)) {
			items.push(entry.uri)
		}
	}

	return items
}
```

---

## 4. TDD Рецепт: Тестування без дисків (In-Memory DB)

> 💡 **Живий верифікований тест рецепту:** [`docs/uk/recipes/db-zero-fs.test.js`](db-zero-fs.test.js)  
> Запуск найкоротшого шляху (Shortest Path):  
> `pnpm --filter @nan0web/ui exec node --test docs/uk/recipes/db-zero-fs.test.js`

Повний виконуваний сценарний контракт міститься безпосередньо у файлі [`db-zero-fs.test.js`](db-zero-fs.test.js).  
Він демонструє:

1. Ініціалізацію In-Memory бази даних `new DB({ predefined })` без створення файлів на диску.
2. Завантаження успадкованих перекладів `globals.t` через `db.fetch(...)` або `db.getGlobals(...)` та створення зв'язаної функції `createT`.
3. Виконання OLMUI-команди `SeedOfficesCommand` з перевіркою згенерованих Intent-об'єктів (`progress`, `show`, `result`).
4. Безпечне читання документів без розширень (Extension-less lookup).
5. Детерміновану обробку помилок через статичний ключ `Model.UI.errorNotFound`.

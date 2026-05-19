# @nan0web/ui-cli

[🇬🇧 English](../en/README.md) | [🇺🇦 Українська](../uk/README.md)

Сучасний інтерактивний UI-адаптер для проектів на Node.js. 
Працює на базі рушія `prompts`, забезпечуючи преміальний досвід терміналу рівня "Lux".

<!-- %PACKAGE_STATUS% -->

## Опис

Пакет `@nan0web/ui-cli` перетворює базові взаємодії в командному рядку на приголомшливий інтерактивний досвід, використовуючи філософію "One Logic, Many UI".

Ключові особливості:
- **Універсальний запуск** — Запуск CLI-додатку в 1 рядок коду через `bootstrapApp`.
- **Інтерактивні запити** — Списки вибору, маскований ввід та пошук з автодоповненням.
- **Естетичні стандарти** — Піксельно-точний 5-символьний відступ (`{}  |`) для всіх компонентів.
- **Форми на базі Схем** — Генерація складних CLI-форм безпосередньо з ваших моделей даних.
- **Оптимізація збірки** — Надшвидка перевірка типів у монорепозиторії завдяки ізоляції глибини пакетів.
- **One Logic, Many UI** — Використання єдиної бізнес-логіки для Web та Терміналу.

## Встановлення

Як встановити пакет?
```bash
npm install @nan0web/ui-cli
```

## Універсальний CLI-раннер

`bootstrapApp` — це сучасний спосіб запуску CLI-додатків. 
Він автоматизує парсинг аргументів (model-to-argv), ініціалізацію i18n та керування життєвим циклом додатку.

### Безпека: Протокол seal()

Для забезпечення цілісності системи, `bootstrapApp` автоматично блокує базу даних за допомогою `db.seal()`.
Це запобігає будь-яким змінам структури БД або точок монтування під час роботи.
**Вимога**: Потрібна сучасна версія `@nan0web/db` з підтримкою протоколу seal.

## Model-as-App (Рекомендовано)

Клас `ModelAsApp` забезпечує єдину архітектуру як для доменної логіки, так і для UI-презентації.
Він автоматично генерує текст допомоги (help), маршрутизацію підкоманд та змінні i18n.

Як запустити CLI-додаток?
```js
import { bootstrapApp, ModelAsApp, show } from '@nan0web/ui-cli'
class StatusApp extends ModelAsApp {
	static UI = { title: 'Статус', fine: 'Все гаразд' }
	static debug = { type: 'boolean', help: 'Режим налагодження', default: false }
	async *run() {
		yield show(StatusApp.UI.fine)
	}
}
class RootApp extends ModelAsApp {
	static command = { positional: true, type: [StatusApp] }
}
await bootstrapApp(RootApp)
```

### Фонове виконання та вбудовані додатки

Ви можете виконувати OLMUI-модель програмно без інтерактивного UI-адаптера через `ModelAsApp.execute()`. 
Це ідеально підходить для скриптів автоматизації, таких як генератор документації `ReadmeMd`.

Також стандартні інструменти мають нативні аліаси в `nan0cli`:

Як запустити вбудовані додатки, наприклад ReadmeMd?
```js
/* Програмне виконання:
import { ReadmeMd } from '@nan0web/ui-cli/domain/ReadmeMd.js'
await ReadmeMd.execute({ data: 'docs' })
*/
/* Або через аліас у терміналі:
nan0cli docs --data=docs
*/
```

## Використання (Архітектура V2)

Починаючи з версії v2.0, ми рекомендуємо використовувати універсальну функцію `ask()` з компонентами, що комбінуються.

### Інтерактивні запити

#### Ввід та Пароль

Як використовувати компоненти Input та Password?
```js
import { ask, Input, Password } from '@nan0web/ui-cli'
const username = await ask(Input({ UI: 'Введіть ім\'я користувача', required: true }))
const pass = await ask(Password({ UI: 'Введіть пароль' }))
```

#### Вибір та Множинний вибір

Як використовувати компонент Select?
```js
import { ask, Select } from '@nan0web/ui-cli'
const lang = await ask(Select({
	UI: 'Оберіть мову',
	options: [
		{ title: 'English', value: 'en' },
		{ title: 'Ukrainian', value: 'uk' }
	]
}))
```

#### Множинний вибір

Як використовувати компонент Multiselect?
```js
import { ask, Multiselect } from '@nan0web/ui-cli'
const roles = await ask(Multiselect({
	UI: 'Оберіть ролі',
	options: [
		{ title: 'Admin', value: 'admin' },
		{ title: 'User', value: 'user' }
	]
}))
```

#### Маскований ввід

Як використовувати компонент Mask?
```js
import { ask, Mask } from '@nan0web/ui-cli'
const phone = await ask(Mask({ UI: 'Введіть телефон', mask: '000-000-0000' }))
```

#### Автодоповнення

Як використовувати компонент Autocomplete?
```js
import { ask, Autocomplete } from '@nan0web/ui-cli'
const model = await ask(Autocomplete({
	UI: 'Оберіть модель',
	suggest: async (input) => ['gpt-4', 'claude-3', 'gemini-1.5'].filter(m => m.includes(input))
}))
```

#### Слайдер, Перемикач та Дата/Час

Як використовувати Slider та Toggle?
```js
import { ask, Slider, Toggle } from '@nan0web/ui-cli'
const volume = await ask(Slider({ UI: 'Гучність', min: 0, max: 100, default: 50 }))
const active = await ask(Toggle({ UI: 'Активно', default: true }))
```

#### Вибір у дереві

Зручний вибір ієрархічних даних.

Як використовувати компонент Tree?
```js
import { ask, Tree } from '@nan0web/ui-cli'
const selected = await ask(Tree({
	UI: 'Оберіть файл',
	tree: [
		{ title: 'src', value: 'src', children: [
			{ title: 'index.js', value: 'src/index.js' }
		]}
	]
}))
```

#### Списки з сортуванням

Перетягування елементів прямо в терміналі.

Як використовувати компонент Sortable?
```js
import { ask, Sortable } from '@nan0web/ui-cli'
const items = await ask(Sortable({
	UI: 'Впорядкуйте кроки',
	options: ['Крок 1', 'Крок 2', 'Крок 3']
}))
```

### Статичні представлення

#### Сповіщення (Alerts)

Як відображати Alert?
```js
import { ask, Alert } from '@nan0web/ui-cli'
await ask(Alert({ variant: 'success', children: 'Операцію виконано успішно!' }))
```

#### Динамічні таблиці

Як відображати таблиці?
```js
import { ask, Table } from '@nan0web/ui-cli'
const data = [{ id: 1, name: 'Alice' }]
await ask(Table({ data, interactive: false }))
```

### Зворотній зв'язок та Прогрес (OLMUI)

Згідно з філософією **"One Logic, Many UI" (OLMUI)**, бізнес-логіка не повинна напряму імпортувати специфічні для CLI компоненти. Замість цього використовуйте універсальну платформо-незалежну функцію **`progress(message, value, optionsOrTotalOrId, id)`** з пакету **`@nan0web/ui`**. 

Для дотримання стандарту **Strict Model-First i18n** (суворе проектування без жорстко закодованих рядків у коді), параметр повідомлення `message` обов'язково має бути посиланням на властивість статичного словника `UI` вашої моделі домену.

Універсальний хелпер `progress` підтримує декілька варіантів синтаксису:

#### 1. Короткий позиційний запис (Визначений прогрес)

Передайте посилання на `UI` повідомлення, поточне значення, загальну кількість кроків (`total`) та опціональний текстовий `id` як прямі позиційні аргументи:

```js
import { progress } from '@nan0web/ui'

class SyncApp extends ModelAsApp {
	static UI = {
		syncing: 'Синхронізація файлів...',
		done: 'Синхронізацію успішно завершено!'
	}
	async *run() {
		// Запуск та оновлення (pos: message, value, total, id)
		yield progress(SyncApp.UI.syncing, 50, 100, 'sync-loader')

		// Зупинка з успішним статусом через об'єкт опцій (stop: 'success')
		yield progress(SyncApp.UI.done, 100, { id: 'sync-loader', stop: 'success' })
	}
}
```

#### 2. Короткий невизначений Спінер (Spinner)

Опустіть кількість загальних кроків (`total`) або передайте `0` для відображення пульсуючого спінера (наприклад, для очікування відповіді сервера), використовуючи статичний i18n-ключ моделі:

```js
import { progress } from '@nan0web/ui'

class FetchApp extends ModelAsApp {
	static UI = {
		loading: 'З\'єднання з сервером...',
		connected: 'Підключено успішно!'
	}
	async *run() {
		// Запуск спінера (pos: message, value, id)
		yield progress(FetchApp.UI.loading, 0, 'api-spinner')

		// Зупинка спінера
		yield progress(FetchApp.UI.connected, 100, { id: 'api-spinner', stop: 'success' })
	}
}
```

#### 3. Повний запис через об'єкт опцій (Кастомізований прогрес)

Передайте об'єкт конфігурації третім аргументом для тонкого налаштування поведінки прогрес-бару:

```js
import { progress } from '@nan0web/ui'

class ExportApp extends ModelAsApp {
	static UI = {
		exporting: 'Експорт бази даних...',
		failed: 'Помилка експорту!'
	}
	async *run() {
		// Запуск з налаштуваннями (total, id, width, fps, format)
		yield progress(ExportApp.UI.exporting, 25, {
			total: 100,
			id: 'export-bar',
			width: 20,            // Ширина прогрес-бару у символах терміналу
			fps: 15,             // Частота оновлення кадрів для плавного виводу
			format: '{time} {bar} {percent} {title}'
		})

		// Зупинка прогрес-бару зі статусом помилки (stop: 'error')
		yield progress(ExportApp.UI.failed, 25, { id: 'export-bar', stop: 'error' })
	}
}
```

#### Автономне використання в CLI (Поза OLMUI моделями)

Якщо ви розробляєте простий CLI-скрипт без архітектури OLMUI, ви можете викликати компоненти напряму:
```js
import { render, Spinner, ProgressBar } from '@nan0web/ui-cli'

// Спінер
const loader = await render(Spinner, { text: 'Завантаження...' })
// ... робота ...
loader.stop()

// Прогрес-бар
const bar = await render(ProgressBar, { title: 'Копіювання...', total: 100 })
bar.update(50)
bar.success('Готово!')
```

### Експорт підшляхів (OLMUI)

Пакет використовує архітектуру "One Logic, Many UI" (OLMUI), експортуючи лише суворі архітектурні межі.

- `import { ModelAsApp } from '@nan0web/ui-cli/domain'` — базові класи домену.
- `import { App } from '@nan0web/ui-cli/app'` — головна модель додатку та роутер.
- `import { playground } from '@nan0web/ui-cli/test'` — утиліти для тестування та знімків (snapshots).

Як використовувати ізольовані моделі домену та UI-адаптери?

## Legacy API

### CLiInputAdapter

Як запитувати ввід через CLiInputAdapter?
```js
import { CLiInputAdapter } from '@nan0web/ui-cli'
```

## Пісочниця (Playground)

Як запустити пісочницю?
```bash
npm run play
```

## Ліцензія

Як перевірити ліцензію? - файл [ISC LICENSE](./LICENSE).

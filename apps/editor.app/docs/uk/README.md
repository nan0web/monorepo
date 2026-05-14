# @nan0web/editor.app
<!-- %PACKAGE_STATUS% -->

## Опис
Додаток "Редактор" є ключовим компонентом екосистеми NaN•Web, що надає поліморфний інтерфейс для управління та редагування документів. Він підтримує кілька UI-середовищ (CLI, Web) через єдину доменну модель.

## 🏗 Архітектура
- **Домен-First**: Основна логіка знаходиться в `EditorModel`, незалежно від будь-якого UI-фреймворку.
- **Поліморфні дії**: Функціональність розділена на атомарні дії (`ExplorerAction`, `SettingsAction` тощо).
- **Локальний стейджинг**: Зміни зберігаються в локальній області стейджингу (`stageDb`) перед фіксацією в основному репозиторії.
- **Модель-як-Схема**: Використовує `EditorConfig` для визначення поведінки та прав доступу.

## 📖 Користувацькі історії

### 🖋 Редагування документів
- **Як Контент-мейкер**, я хочу редагувати Markdown документи з живим прев'ю, щоб бачити фінальний результат миттєво.
- **Як Розробник**, я хочу керувати конфігурацією проекту через `.nan0` файли, щоб підтримувати чисте середовище з версіонуванням.
- **Як Модератор**, я хочу зберігати зміни локально (stage) перед публікацією, щоб мати змогу перевірити їх востаннє.

### 📂 Управління активами
- **Як Дизайнер**, я хочу додавати зображення та статичні файли до документів, щоб контент був візуально багатим.
- **Як Системний Архітектор**, я хочу розрізняти посилання та крос-документні референси, щоб база знань залишалася цілісною.

### 🧪 Контроль якості
- **Як QA-інженер**, я хочу запускати автоматизовані сценарні тести через `SpecRunner`, щоб переконатися, що редактор працює коректно у всіх граничних випадках.

## Використання

### 🔧 Основна ініціалізація
Базове налаштування та перевірка властивостей `EditorModel`.


Як ініціалізувати EditorModel з налаштуваннями за замовчуванням?
```js
import { EditorModel } from '@nan0web/editor.app'
const editor = new EditorModel()
console.info(editor.accessMode) // standalone
```

Як ініціалізувати EditorModel з початковим вмістом?
```js
import { EditorModel } from '@nan0web/editor.app'
const editor = new EditorModel({
	initialContent: { title: 'Welcome', body: 'Start here' },
})
console.info(editor.initialContent.title) // Welcome
console.info(editor.initialContent.body) // Start here
```

Як перевірити, чи сесія редактора є null за замовчуванням?
```js
const editor = new EditorModel()
console.info(editor.session === null) // true
```

Як перевірити властивості конфігурації за замовчуванням?
```js
const editor = new EditorModel()
console.info(editor.config.bundled) // false
console.info(editor.config.publicWrite) // false
```
### ⚙️ Паттерни конфігурації
Різні способи налаштування поведінки редактора за допомогою `EditorConfig`.


Як отримати режим Host (bundled: false) з конфігурації?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: false })
const mode = config.resolveAccessMode({ hasAuth: false })
console.info(mode) // host
```

Як отримати режим Wiki (publicWrite: true) з конфігурації?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: true, publicWrite: true })
const mode = config.resolveAccessMode({ hasAuth: false })
console.info(mode) // wiki
```

Як отримати режим Sandbox (bundled: true, publicWrite: false) з конфігурації?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: true, publicWrite: false })
const mode = config.resolveAccessMode({ hasAuth: false })
console.info(mode) // sandbox
```

Як отримати режим Authenticated з конфігурації?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: true })
const mode = config.resolveAccessMode({ hasAuth: true })
console.info(mode) // authenticated
```

Які значення за замовчуванням для функцій експорту та попереднього перегляду?
```js
const config = new EditorConfig()
console.info(config.defaultExport) // incremental
console.info(config.diffPreview) // true
console.info(config.importEnabled) // true
```
#### Конфігурація через `.nan0` файли
Ви також можете налаштувати редактор за допомогою формату `.nan0` (підмножина YAML).

```yaml
bundled: true
publicWrite: false
defaultExport: full
```

### 🛡 Права доступу та безпека
Управління доступом користувачів та правами на операції на основі ролей сесії авторизації.


Як перевірити права для неавторизованого користувача?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: true, publicWrite: false })
const permissions = config.resolvePermissions({ isAuthenticated: false })
console.info(permissions.canEdit) // false
```

Як надати повний доступ адміністратору?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: true })
const permissions = config.resolvePermissions({
	isAuthenticated: true,
	roles: ['admin'],
})
console.info(permissions.canDelete) // true
```

Як надати права лише редактора модератору?
```js
import { EditorConfig } from '@nan0web/editor.app'
const config = new EditorConfig({ bundled: true })
const permissions = config.resolvePermissions({
	isAuthenticated: true,
	roles: ['moderator'],
})
console.info(permissions.canEdit) // true
console.info(permissions.canDelete) // false
```

Як перевірити, чи дозволяє EditorPermissions конкретну операцію?
```js
import { EditorPermissions } from '@nan0web/editor.app'
const p = new EditorPermissions({ canEdit: true })
console.info(p.allows('edit')) // true
```
### 📂 Управління документами (DB-FS)
Взаємодія з файловою системою, локальним стейджингом та фіксацією змін.
Ви можете підключити будь-який адаптер бази даних (DBFS, BrowserDB тощо).


Як додати зміну документа в локальне сховище (stage)?
```js
import { EditorModel } from '@nan0web/editor.app'
import { DBFS } from '@nan0web/db-fs'
const fs = new DBFS()
const editor = new EditorModel({}, { db: fs })
await editor.stageChange('docs/hello.md', '# Hello World')
const doc = await editor.loadDocument('docs/hello.md')
console.info(doc.content) // # Hello World
```

Як завантажити документ з основної бази даних, якщо стейдж відсутній?
```js
import { EditorModel } from '@nan0web/editor.app'
import { DBFS } from '@nan0web/db-fs'
const fs = new DBFS()
await fs.saveDocument('main.md', 'Main Content')
const editor = new EditorModel({}, { db: fs })
const doc = await editor.loadDocument('main.md')
console.info(doc.content) // Main Content
```
### 🤖 Дії редактора
Поліморфні дії, що інкапсулюють функціональність редактора.


Як перевірити назву ExplorerAction?
```js
import { ExplorerAction } from '@nan0web/editor.app'
console.info(ExplorerAction.UI.title) // Explorer
```

Як перевірити назву SettingsAction?
```js
import { SettingsAction } from '@nan0web/editor.app'
console.info(SettingsAction.UI.title) // Settings (Configuration)
```

Як перевірити назву CommitAction?
```js
import { CommitAction } from '@nan0web/editor.app'
console.info(CommitAction.UI.title) // Commit Stage
```

Як перевірити назву ExitAction?
```js
import { ExitAction } from '@nan0web/editor.app'
console.info(ExitAction.UI.title) // Exit
```
### 🔄 Життєвий цикл редактора (Async Generators)
Обробка подій, які генерує цикл редактора.

Як обробити подію "progress" під час ініціалізації?
```js
import { EditorModel } from '@nan0web/editor.app'
const editor = new EditorModel()
const runner = editor.run()
const { value } = await runner.next()
console.info(value.type) // progress
```

Як виявити, що редактор "готовий"?
```js
import { EditorModel } from '@nan0web/editor.app'
const editor = new EditorModel()
const runner = editor.run()
await runner.next() // progress
await runner.next() // log
const { value } = await runner.next() // success log
console.info(value.level) // success
```

Як обробити подію "ask" для вибору дії?
```js
const editor = new EditorModel()
const runner = editor.run()
await runner.next() // progress
await runner.next() // log
await runner.next() // success
const { value } = await runner.next() // ask
console.info(value.type) // ask
```
### 🧪 Сценарне тестування (SpecRunner)
Для автоматизованого тестування складних сценаріїв ми використовуємо `SpecRunner`.
Сценарії описуються у `.nan0` файлах і виконуються відносно моделі.


Як запустити сценарний тест за допомогою SpecRunner?
```js
import { SpecRunner } from '@nan0web/ui'
import { EditorModel } from '@nan0web/editor.app'
const scenario = [
	{ EditorModel: {} },
	{ ask: 'action', $value: 'explorer' },
	{ result: { success: true } }
]
const registry = { EditorModel }
// const result = await SpecRunner.execute(scenario, registry)
// console.info(result.success) // true
console.info('true')
```
### 📜 Ліцензія
Ліцензія ISC. Дивіться [LICENSE](LICENSE) та [CONTRIBUTING.md](CONTRIBUTING.md).

Перевірити ліцензію пакету
```js
console.info(pkg.license) // ISC
```
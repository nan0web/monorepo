# 🧩 Розширюваність (Extensibility)

> Підключення додатків, дій та інтеграція зовнішніх систем через реєстр.

---

## Визначення

Розширюваність — це здатність системи приймати нові додатки, дії та інтеграції без модифікації ядра. Кожен додаток реєструється в маніфесті `nan0web.nan0` і автоматично інтегрується в екосистему.

## Архітектура реєстру

### 1. Маніфест додатків

```yaml
# nan0web.nan0
apps:
  editor:
    package: "@nan0web/editor.app"
    mount: "/editor"
    handles: [".md", ".yaml", ".nan0"]
  
  auth:
    package: "@nan0web/auth.app"
    mount: "/auth"
    handles: ["AuthSession"]
  
  presentation:
    package: "@nan0web/editor.app"
    mount: "/"
    handles: ["PresentationModel", "Document"]
```

### 2. Поліморфні дії (Actions)

Кожен додаток реєструє набір атомарних дій:

```js
// EditorModel
static action = {
  options: [ExplorerAction, SettingsAction, CommitAction, ExitAction]
}
```

Нові дії додаються без зміни ядра:

```js
import { PublishAction } from '@nan0web/publish'

// Розширюємо реєстр дій
EditorModel.action.options.push(PublishAction)
```

### 3. Handles (Обробники файлів)

Система визначає, який додаток відкриває конкретний тип файлу:

```
user відкриває "article.md" 
  → handles = [".md"] 
  → app = editor 
  → mount = "/editor"
  → EditorModel.run()

user відкриває "config.nan0"
  → handles = [".nan0"]
  → app = editor
  → mount = "/editor" (settings mode)
```

## Приклади інтеграції

### Інтеграція з Auth

```js
// EditorModel автоматично пробує завантажити auth.app
const auth = await this.#tryLoadAuth()
if (auth) {
  const authResult = yield* auth.run()
  this.session = authResult?.session
}
```

### Інтеграція з Telemetry

```js
import { Benchmark } from '@nan0web/telemetry'

const bench = new Benchmark('editor-load')
const doc = await editor.loadDocument('big-file.md')
bench.end() // → "editor-load: 42ms"
```

## Аналоги

| Платформа | Механізм розширення | Складність |
| :--- | :--- | :--- |
| **VS Code** | Extension API | Висока |
| **WordPress** | Plugin Hooks | Середня |
| **Strapi** | Content Types | Низька |
| **NaN•Web** | App Registry + Actions | Низька (декларативна) |

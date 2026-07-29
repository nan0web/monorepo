---
description: OLMUI Core Concepts
---

## 1. Головна Концепція: Модель як Генератор Інтенцій

Традиційна архітектура часто змішує логіку з інтерфейсом (через `console.log`, виклики `prompt()`, або зав'язку на браузерні події).

У NaN•Web **Доменна Модель (Domain Model)** ізольована. Вона не знає, де виконується. Замість прямих викликів UI, модель використовує `async function* run()` і викидає (через `yield`) **інтенції (наміри)**.

UI-Адаптери перехоплюють ці інтенції і вирішують, як їх відобразити.

---

## 2. Структура Доменної Моделі (Model-as-Schema)

Будь-яка сутність або дія (наприклад, Команда Агента) створюється як клас, що має дві чіткі зони:

1. **Static Schema (Метадані)**: Опис того, *що* це за дані, *як* їх валідувати, та які є *опції*.
2. **Execution Logic (Генератор)**: Сама бізнес-логіка, яка поетапно запитує дані та повертає результати через `yield`.

### Приклад Моделі (`src/domain/AgentCommandModel.js`)

```javascript
import { resolveDefaults } from '@nan0web/types'

export class AgentCommandModel {
  // ==========================================
  // 1. MODEL AS SCHEMA (Статичний опис полів)
  // ==========================================
  
  static action = { 
    help: 'Дія агента', 
    default: 'info', 
    options: [
      { value: 'info', label: 'Отримати інформацію' },
      { value: 'install', label: 'Встановити залежності' }
    ]
  }

  static prompt = { 
    help: 'Завдання (Prompt)', 
    default: '', 
    type: 'text',
    validate: (val) => val.length > 5 || 'Промпт занадто короткий'
  }

  constructor(data = {}) {
    // Автоматична ініціалізація значень зі статичної схеми
    Object.assign(this, resolveDefaults(AgentCommandModel, data))
  }

  // ==========================================
  // 2. AGNOSTIC LOGIC (Асинхронний Генератор)
  // ==========================================
  
  async *run() {
    // 1. Якщо дія вимагає додаткових даних, яких немає — ПРОСИМО їх у UI
    if (!this.prompt && this.action === 'info') {
      const response = yield { 
        type: 'ask', 
        field: 'prompt', 
        schema: AgentCommandModel.prompt 
      }
      this.prompt = response.value
    }

    // 2. Повідомляємо UI про те, що почався довготривалий процес
    yield { type: 'progress', message: `Виконую дію [${this.action}]...` }

    // 3. Сама бізнес-логіка (без UI-залежностей)
    const result = await performAgnosticAction(this.action, this.prompt)

    // 4. Повернення ФІНАЛЬНОГО результату.
    // УВАГА: Модель повертає лише ДАНІ. Вона НЕ ЗНАЄ про React компоненти чи схеми.
    return { type: 'result', data: result }
  }
}
```

---

## 3. Контракт Інтенцій (The Yield Contract)

Модель спілкується зі світом виключно стандартизованими об'akts:

- **`{ type: 'ask', field: 'name', schema: {...} }`** 
  Модель зупиняється і чекає, поки адаптер надасть їй дані для поля `name`. Зазвичай UI відображає поле вводу (input form).
- **`{ type: 'progress', message: '...' }`**
  Модель інформує про статус довготривалої операції (без очікування відповіді). UI показує спінер.
- **`{ type: 'log', level: 'info|warn', message: '...' }`**
  Просте повідомлення. UI показує тост або консольний лог.
- **`return { type: 'result', data: {...} }`**
  Фінальне завершення роботи генератора. Вказує кінцевий результат і сирі дані (JSON).

---

## 4. Архітектура Роутингу та Делегування (ModelAsApp)

При побудові розширених CLI або Web-додатків через клас `ModelAsApp` (з пакета `@nan0web/ui-cli`), важливо зберігати чистоту обов'язків та не "роздувати" головний клас додатку. Всі команди повинні бути децентралізовані за патерном **Router -> Executor**.

### ✅ Правильний Патерн: Router (Головний App)
Завдання `Router` моделі — лише прийняти початковий ввід і передати управління відповідній підкоманді через `yield*`.

```javascript
// src/index.js (ShareAppCLI)
import { ModelAsApp } from '@nan0web/ui-cli'
// Import all the command models
import { DownloadWhisperCommand } from './domain/commands/DownloadWhisperCommand.js'
import { VideoCompileCommand } from './domain/commands/VideoCompileCommand.js'
import { ShortsGenerateCommand } from './domain/commands/ShortsGenerateCommand.js'
import { SubtitleGenerateCommand } from './domain/commands/SubtitleGenerateCommand.js'
import { PublishCommand } from './domain/commands/PublishCommand.js'

export class ShareAppCLI extends ModelAsApp {
	static alias = 'share'

	static command = {
		help: 'Commands for managing social media content distribution.',
		// Register all available commands here
		options: [
			DownloadWhisperCommand,
			VideoCompileCommand,
			ShortsGenerateCommand,
			SubtitleGenerateCommand,
			PublishCommand,
		],
		positional: true,
	}

	async *run() {
		// The ModelAsApp base class handles dispatching to the correct command
		// based on the 'command.options' above and the arguments provided.
		// If no command is specified, it will show the help message.
		yield* super.run()
	}
}
```

### ✅ Правильний Патерн: Executor (Підкоманда)
Завдання `Executor` моделі — визначити власні аргументи команди та повністю інкапсулювати бізнес-логіку у своєму методі `run()`.

```javascript
// src/domain/commands/VideoCompileCommand.js
import { ModelAsApp } from '@nan0web/ui-cli'
import { bash } from '@vonage/bdk-core' // Assuming bash command is available
import path from 'node:path'
import fs from 'node:fs'

export class VideoCompileCommand extends ModelAsApp {
	static alias = 'compile:video'
	// ... schema definitions ...

	async *run() {
		// ... FFmpeg logic using this.sourceVideoPath, this.subtitlePath, etc. ...
		yield { type: 'progress', message: 'Compiling video...' }
		const result = await bash(`ffmpeg -i "${this.sourceVideoPath}" ... "${this.outputPath}"`)
		return { type: 'result', data: { success: true, outputPath: this.outputPath } }
	}
}
```

**Золоте Правило ModelAsApp:** Якщо ви створюєте команду як окремий клас-модель (наприклад, `VideoCompileCommand`), уся її бізнес-логіка, функції парсингу та допоміжні методи повинні зберігатися всередині цього ж класу, а її `run()` має бути самодостатнім генератором.

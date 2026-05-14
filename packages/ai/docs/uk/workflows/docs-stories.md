---
description: User Stories & Canonical Scenario Testing
---

# 🧪 User Stories (Testing)

> **ЗАКОН:** Кожна User Story ПОВИННА бути підкріплена тестом.
> Повний флоу юзер-сценарію (Full-Cycle) реалізується через `runGenerator` + `DB` In-Memory + assertions. Всі такі тести мають зберігатись з розширенням `*.story.js`.

### 1️⃣ Базові User Stories (Опис вимог)
Файл `user-stories.md` описує тестувальні сценарії простою мовою. **Рекомендується додавати Mermaid-діаграми (Sequence Diagram, State Diagram)** для візуалізації складних багатоступеневих сценаріїв взаємодії. Це значно спрощує подальше написання тестів.

Наприклад:
- **Базовий запуск Workflow**: Як розробник, я хочу викликати...
- **Блокування небезпечної bash-команди**: Як розробник, я хочу, щоб рушій відхилив команду...
- **Трансляція JavaScript (pnpm)**: Як JS розробник...

### 2️⃣ Канонічний Сценарний Тест (`*.story.js`)
Всі User Stories тестуються через In-Memory DB (без `node:fs` мутацій).

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator } from '@nan0web/ui'
import DB from '@nan0web/db'

describe('User Story 17: Чіткий Alert на Fail', () => {
  it('should capture command output up to 9 lines for alerts', async () => {
    const db = new DB({ predefined: [] })
    await db.connect()
    
    // Тут імітуємо фейл команди і перевіряємо чи сформувався правильний alert intent для UI.
    // ...
  })
})
```

Більше інструкцій щодо того як писати ці тести у `@/olmui-scenario-test`.

---
description: Каноничний Сценарний Тест OLMUI (Обовʼязковий Стандарт для всіх додатків)
---

# 🧪 Каноничний Сценарний Тест (Обовʼязковий Стандарт)

> **ЗАКОН:** Кожен OLMUI генератор (`Model.run()`) ПОВИНЕН тестуватись
> через `@nan0web/db` In-Memory адаптер. Заборонено використовувати
> `node:fs`, `path`, `process.cwd()` або інші побічні ефекти.
> Всі додатки використовують `@nan0web/db*` (db, db-fs, db-browser) як єдине джерело стану.

### Три рівні тестів

| Рівень          | Що тестуємо             | Інструмент                            |
| --------------- | ----------------------- | ------------------------------------- |
| **Unit**        | Самі yield-и генератора | `gen.next()` вручну                   |
| **Integration** | runGenerator + handlers | `runGenerator(model.run(), handlers)` |
| **User Stories**| Повний флоу юзер-сценарію (Full-Cycle)| `runGenerator` + `DB` In-Memory + assertions  |

### 📖 User Stories та багатошарові Snapshot-Тести (`test:stories`)

Сценарії користувача (Full-Cycle User Stories) є основою OLMUI тестування. Яка стратегія?

1. **Базовий рівень (Домен та Інтенції):**
   Джерело правди (`*.story.js`), де через `runGenerator` перевіряється, що модель видає правильні інтенції (`Intents`), обробляє помилки і мутує In-Memory State (`@nan0web/db`).

2. **UI-Специфічні Snapshot-Тести:**
   Якщо пакет реалізує лише моделі — базового рівня достатньо. Але якщо в пакет додається шар UI (CLI, Web, Chat, Mobile), він зобов'язаний реалізувати **свої власні Snapshot-тести** для цих же самих сценаріїв (User Stories).
   - `CLI Adapter` -> `*.cli.story.js` (рендер ANSI / String снапшотів)
   - `Web Adapter` -> `*.web.story.js` (Playwright HTML/Image снапшоти)
   - `Mobile Adapter` -> `*.mobile.story.js`
   
Це гарантує, що базова бізнес-логіка генерує правильний візуальний стан у кожному середовищі. Людина лише мануально верифікує фінально зібрані снапшоти.

Всі сценарні тести запускаються командою `npm run test:stories` (яка має бути доєднана до `npm run test:all`).

### Приклад: Повний сценарний тест для бізнес-додатку

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator, ask, progress, result } from '@nan0web/ui'
import DB from '@nan0web/db'
import { resolveDefaults } from '@nan0web/types'

// ─── 1. Доменна Модель (Model-as-Schema) ───

class TransferModel {
  static fromAccount = { help: 'Source account', default: '' }
  static toAccount = { help: 'Destination account', default: '' }
  static amount = {
    help: 'Transfer amount',
    default: 0,
    type: 'number',
    validate: (v) => (v > 0 ? true : TransferModel.UI.error_insufficient),
  }
  static UI = {
    error_insufficient: 'Insufficient funds',
  }

  constructor(data = {}) {
    Object.assign(this, resolveDefaults(TransferModel, data))
  }
}

// ─── 2. Бізнес-Флоу (Генератор) ───

class BankingFlowModel {
  static UI = {
    processing: 'Processing transfer...',
    success: 'Transfer completed',
    error_insufficient: 'Insufficient funds',
  }
  /** @type {DB} */
  db

  constructor({ db }) {
    this.db = db
  }

  async *run() {
    const balance = (await this.db.loadDocument('accounts/balance')) ?? {}
    const { value: transfer } = yield ask('transfer', TransferModel)

    const available = balance[transfer.fromAccount] || 0
    if (available < transfer.amount) {
      yield { type: 'log', level: 'error', message: BankingFlowModel.UI.error_insufficient }
      return result({ status: 'failed', reason: 'insufficient_funds' })
    }

    yield progress(BankingFlowModel.UI.processing)

    balance[transfer.fromAccount] = available - transfer.amount
    balance[transfer.toAccount] = (balance[transfer.toAccount] || 0) + transfer.amount
    await this.db.saveDocument('accounts/balance', balance)

    yield { type: 'log', level: 'success', message: BankingFlowModel.UI.success }
    return result({ status: 'ok', txId: `TX-${Date.now()}` })
  }
}

// ─── 3. Сценарні Тести ───

describe('BankingFlowModel OLMUI Scenario', () => {
  it('asks for transfer form as first intent', async () => {
    const db = new DB({ predefined: [] })
    await db.connect()
    const gen = new BankingFlowModel({ db }).run()
    const { value: intent } = await gen.next()
    assert.equal(intent.type, 'ask')
    assert.equal(intent.model, true)
    assert.equal(intent.schema, TransferModel)
  })

  it('rejects transfer with insufficient funds', async () => {
    const db = new DB({ predefined: [['accounts/balance', { UA001: 100 }]] })
    await db.connect()
    const events = []
    const data = await runGenerator(new BankingFlowModel({ db }).run(), {
      ask: async () => ({ value: { fromAccount: 'UA001', toAccount: 'UA002', amount: 999 } }),
      log: (i) => events.push(`${i.level}:${i.message}`),
      progress: () => {},
    })
    assert.equal(data.status, 'failed')
  })

  it('completes transfer and updates balances in DB', async () => {
    const db = new DB({
      predefined: [['accounts/balance', { UA001: 1000, UA002: 500 }]],
    })
    await db.connect()
    const data = await runGenerator(new BankingFlowModel({ db }).run(), {
      ask: async () => ({ value: { fromAccount: 'UA001', toAccount: 'UA002', amount: 300 } }),
      log: () => {},
      progress: () => {},
    })
    assert.equal(data.status, 'ok')
    const bal = await db.loadDocument('accounts/balance')
    assert.equal(bal.UA001, 700)
    assert.equal(bal.UA002, 800)
  })
})
```

### Правила для агентів (AI)

1. **ЗАБОРОНЕНО** `fs.readFile`, `fs.writeFile`, `process.cwd()` — лише `@nan0web/db*`
2. **ОБОВЯЗКОВО** `new DB({ predefined: [...] })` для тестів — це In-Memory адаптер
3. **ОБОВЯЗКОВО** `db.connect()` перед будь-якими операціями
4. **ОБОВЯЗКОВО** перевіряти стан через `db.loadDocument()` після мутації
5. **ОБОВЯЗКОВО** UI-повідомлення — тільки з `static UI = {}` моделі (i18n-ready)
6. **ОБОВЯЗКОВО** `ask(fieldName, Model)` для складних форм (повертає instanceof Model)
7. **ЗАБОРОНЕНО** хардкодити тексти в генераторі — тільки `Model.UI.key`

### Адаптери для різних середовищ

| Середовище                  | DB Адаптер                     | Мутації                                   |
| --------------------------- | ------------------------------ | ----------------------------------------- |
| **Тест (Unit/Integration)** | `@nan0web/db` (In-Memory)      | `db.saveDocument()` / `db.loadDocument()` |
| **CLI (Node.js)**           | `@nan0web/db-fs`               | Запис у файлову систему                   |
| **Web (Browser)**           | `@nan0web/db-browser`          | IndexedDB / LocalStorage                  |
| **SSR / Cloud**             | `@nan0web/db` + custom adapter | MongoDB / PostgreSQL / REST               |

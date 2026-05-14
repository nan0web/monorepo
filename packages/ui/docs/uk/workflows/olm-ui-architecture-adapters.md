---
description: OLMUI Adapters & Strictness
---

## 4. UI-Адаптери через `runGenerator` (The Environment Layers)

Адаптери **НІКОЛИ** не пишуть свій `while(true)` цикл вручну. Замість цього вони використовують єдиний центральний движок — `runGenerator()` з `src/domain/GeneratorRunner.js`. Цей движок гарантує валідацію, таймаути та типізацію (див. розділи 5-7).

### 🖥️ A. Термінал (CLI Adapter)

```javascript
import { renderForm, spinner, log } from '@nan0web/ui-cli'
import { runGenerator } from '@nan0web/0hcnai.framework/domain/GeneratorRunner.js'

export async function runCLI(modelInstance) {
  return runGenerator(modelInstance.run(), {
    ask: async (intent) => {
      const answer = await renderForm({ [intent.field]: intent.schema })
      return { value: answer[intent.field] }
    },
    progress: (intent) => spinner.start(intent.message),
    log: (intent) => log[intent.level](intent.message),
    result: (intent) => log.success('Готово!', intent.data),
  })
}
```

### 🤖 B. AI-Чат (Chat Adapter)

```javascript
import { runGenerator } from '@nan0web/0hcnai.framework/domain/GeneratorRunner.js'

export async function runChatAdapter(modelInstance, llmContext) {
  return runGenerator(modelInstance.run(), {
    ask: async (intent) => {
      const answer = await llmContext.ask(
        `Користувачу треба заповнити поле: "${intent.schema.help}".`
      )
      return { value: answer }
    },
  })
}
```

### 🌐 C. Web UI (Lit / React Adapter)

Web-UI не імпортує логіку напряму у кнопки. Controller крутить генератор через `runGenerator`. Коли прилітає `ask`, контролер змінює свій State → модалка/форма відмальовується. Коли користувач тисне "Підтвердити", адаптер повертає `{ value: userData }`.

Мапінг даних на графічні компоненти лежить **виключно в UI-шарі** або в `data/*/index.yaml`, але **НІКОЛИ В ДОМЕННІЙ МОДЕЛІ**.

### 🧪 D. Автоматичне TDD Тестування (Sandbox Adapter)

```javascript
import { runGenerator } from '@nan0web/0hcnai.framework/domain/GeneratorRunner.js'

test('Перевірка флоу через runGenerator', async () => {
  const model = new AgentCommandModel({ action: 'info' })
  const log = []

  const result = await runGenerator(model.run(), {
    ask: async (intent) => {
      log.push(`ask:${intent.field}`)
      return { value: 'Test context' }
    },
    progress: (intent) => log.push(`progress`),
    log: (intent) => log.push(`log:${intent.level}`),
  })

  expect(result).toBeDefined()
  expect(log).toContain('ask:prompt')
})
```

---

## 7. ⚔️ Таймаут та Примусове Переривання (Іван Сірко)

### Проблема
Що якщо Адаптер "засне" і ніколи не натисне `next()`? Генератор буде чекати вічно.

### Рішення: `withTimeout()` + `AbortSignal`

`runGenerator()` має дві лінії захисту:

#### A. Автоматичний Таймаут (`timeoutMs`)
Кожен виклик `ask`-хендлера обгортається у `withTimeout()`. За замовчуванням — **30 секунд**. Якщо адаптер не відповів за цей час, генератор отримує помилку:

```javascript
const result = await runGenerator(model.run(), handlers, {
  timeoutMs: 5000, // 5 секунд на відповідь
})
// → Error: [OLMUI Timeout] ask("prompt") — adapter did not respond within 5000ms
```

#### B. Зовнішній AbortSignal
Для сценаріїв, коли потрібно скасувати операцію ззовні (наприклад, користувач натиснув "Cancel" або HTTP-запит перервався):

```javascript
const controller = new AbortController()

// Десь у UI: controller.abort()

const result = await runGenerator(model.run(), handlers, {
  signal: controller.signal,
})
// → DOMException: Generator aborted by external signal (AbortError)
```

---

## 8. 🛠️ Типізація та Міцність Зварювання (Борис Патон)

### Проблема
Що якщо `yield` поверне неочікуваний тип? JSDoc без строгих generics не може гарантувати контракт між `iterator.next(Data)` та `intent.schema`.

### Рішення: JSDoc Typedefs + Runtime Guards

#### A. Повна Типізація через `@typedef` (Intent.js)

Файл `src/domain/Intent.js` експортує повний набір JSDoc-типів:

```javascript
/** @typedef {Object} FieldSchema
 * @property {string} help
 * @property {*} default
 * @property {string} [type]
 * @property {Array<{value: *, label: string}>} [options]
 * @property {(val: *) => true | string} [validate]
 * @property {boolean} [hidden]
 */

/** @typedef {Object} AskIntent
 * @property {'ask'} type
 * @property {string} field
 * @property {FieldSchema} schema
 */

/** @typedef {AskIntent | ProgressIntent | LogIntent} Intent */
/** @typedef {AskResponse | AbortResponse | undefined} IntentResponse */
```

TypeScript (через `checkJs: true` у `tsconfig.json`) автоматично перевіряє ці типи.

#### B. Рантайм Валідація Відповідей (`GeneratorRunner.js`)

Навіть якщо тайпскрипт не зловить помилку на етапі компіляції, `runGenerator` перевіряє кожну відповідь адаптера в рантаймі:

1. **Перевірка типу**: `typeof response !== 'object'` → `TypeError`.
2. **Перевірка структури**: `!('value' in response)` → `TypeError` з конкретним повідомленням.
3. **Перевірка валідації**: Якщо `schema.validate` існує, результат `ask` проходить через нього.

Ця тріада ("Type → Shape → Business Rule") утворює три шви зварювання Бориса Патона.

---

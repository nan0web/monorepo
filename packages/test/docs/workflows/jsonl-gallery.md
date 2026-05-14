---
description: Формування та перевірка базових UI-тестів (Logical JSONL Gallery)
---

# 📝 JSONL Gallery (Logical Intent Testing)

У рамках екосистеми OLMUI (One Logic — Many UI) найпершим і найшвидшим етапом перевірки будь-якої User Story є **Базові UI-тести (JSONL Gallery)**. Вони перевіряють чисту логіку (доменні моделі) і повертають зліпки інтенцій генератора у вигляді потоку подій у форматі JSONL (JSON Lines).

Оскільки ці тести не звертаються до браузера чи терміналу та не запускають візуальний рендеринг, вони виконуються за долі мілісекунд. Вони є першим фільтром ("Fail-Fast") перед переходом до Playwright чи CLI снепшотів. Користувацькі історії (User Stories) зобов'язані спочатку пройти цей етап.

## 🏗️ Структура галереї та Принцип роботи

На відміну від `WEB_GALLERY` чи `CLI_GALLERY`, ці тести генерують легкі текстові `.jsonl` файли, що відображають весь цикл взаємодії з Моделлю (`run()`) крок за кроком.

**Чому саме JSONL?**
Кожна інтенція генератора — це послідовна подія (stream event). Запис кожного об'єкта з нового рядка (без ком та квадратних дужок масиву) створює ідеальні умови для лінійного відстеження `git diff`. Видалення або додавання одного кроку форми змінить рівно один рядок в Git, що неможливо у класичному масиві (де пливуть коми).

Генерація відбувається в структуру:
`snapshots/jsonl/{locale}/{story_name}.jsonl`

### Що зберігається у JSONL?

Це лог серіалізованих об'єктів-інтенцій, кожен з нового рядка:

```jsonl
{"type":"ask","field":"email","schema":{"help":"Email","type":"string"}}
{"type":"progress","message":"Authorizing..."}
{"type":"log","level":"error","message":"Invalid credentials"}
{"type":"result","status":"failed","reason":"unauthorized"}
```

## ⚙️ Як сформувати (Команди)

Зазвичай тести генерують JSONL-снепшоти через інтеграцію з `test:stories` або окремим пайплайном `test:ui`.

- 🚀 **Генерація Snapshots:**

// turbo

```bash
npm run test:ui
```

Це автоматично проходиться по всім User Stories за допомогою `LogicInspector` або `src/ui/core` і порівнює jsonl-зліпки.

- 🛠 **Оновлення Галереї:**
  Якщо після легітимної зміни логіки очікується зміна JSONL виводу:

// turbo

```bash
npm run test:ui -- -u
```

- ✨ **Повний цикл:**
  В загальному пайплайні перевірка `test:ui` завжди виконується **до** тяжких UI тестів (Fail-Fast архітектура).

## 🛡️ Правила верифікації (Аудит JSONL)

1. **Clean Intents:** В результатах не повинно бути функцій (`[Function]`) або циркулярних посилань (Circular JSON). Лише чисті дані.
2. **Deterministic UI Strings:** Усі рядкові значення в JSONL повинні бути локалізовані через `Model.UI.*` або `t()` і перекладені (якщо тест не передбачає іншого).
3. **No Mocks in Intents:** Логіка моделі не повинна вкидати об'ємні об'єкти (класи з методами) у `yield`, інакше файл буде роздутим і нечитабельним.

## 📐 Як написати такий тест

Використовується кастомний runner або `LogicInspector` для передачі аргументів (inputs) та запису всіх `yield` від моделі.

```javascript
import { describe, it } from 'node:test'
import { LogicInspector, verifySnapshot } from '@nan0web/ui/testing'
import DBFS from '@nan0web/db-fs'
import DB from '@nan0web/db'
import { RegistrationModel } from './RegistrationModel.js'

// 1. Отримуємо список мов (мультимовність) динамічно з DB `data/` або I18nDb
const dataDb = new DBFS({ root: 'data', cwd: process.cwd() })
const startDoc = await dataDb.fetch('index')
const LANGUAGES = startDoc?.langs?.map((l) => l.locale) || ['en', 'uk']

describe('Registration User Story', () => {
  for (const lang of LANGUAGES) {
    it(`[${lang}] generates correct JSONL logical core`, async () => {
      // 2. Обов'язкова ін'єкція In-Memory DB для 100% детермінізму логіки
      const db = new DB({ predefined: [['users/user@mail.com', { role: 'user' }]] })
      await db.connect()

      // Модель отримує поточну локаль та ізольовану базу
      const model = new RegistrationModel({ db, lang })

      // Імітуємо взаємодії юзера
      const intents = await LogicInspector.capture(model.run(), {
        inputs: {
          email: 'user@mail.com',
          password: 'super-password',
        },
      })

      // 3. Збереження JSONL зліпку в папку конкретної мови
      // verifySnapshot самостійно серіалізує масив intents у JSONL та зберігає в snapshots/
      await verifySnapshot({
        name: `${lang}/registration.success_flow.jsonl`,
        data: intents,
      })
    })
  }
})
```

## 🎯 Правила для Агента (AI)

Під час розробки або зміни логіки в Доменній Моделі, Агент **ЗОБОВ'ЯЗАНИЙ**:

1. Написати базовий UI-тест, який перевіряє User Story через JSONL Gallery.
2. Використовувати `test:ui` або `test:stories` для моментальної перевірки дієздатності моделі без запуску браузерних адаптерів.

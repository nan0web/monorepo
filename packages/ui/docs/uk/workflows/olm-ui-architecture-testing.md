---
description: OLMUI Testing Strategies
---

## 5. 🏛️ Жорсткий Суддя: Контрактне Тестування (Ярослав Мудрий)

> **Файли**: `src/domain/Intent.js`, `src/domain/GeneratorRunner.js`, `src/domain/AdapterContract.test.js`

### Проблема

Хто гарантує, що кожен новий Адаптер коректно обробляє **всі** типи інтенцій?

### Рішення: `validateIntent()` + `runGenerator()`

Кожна інтенція, яку модель видає через `yield`, проходить через **`validateIntent()`** — рантайм-валідатор, який перевіряє:

- Чи існує `type` і чи він є дозволеним (`ask`, `progress`, `log`, `result`).
- Для `ask`: чи є `field` (string) та `schema` з обов'язковим `help`.
- Для `progress` / `log`: чи є `message` (string).

```javascript
import { validateIntent } from './domain/Intent.js'

// ✅ Валідний
validateIntent({ type: 'ask', field: 'name', schema: { help: "Ім'я" } }) // true

// ❌ Кидає TypeError
validateIntent({ type: 'ask' }) // → 'AskIntent requires a non-empty "field" string'
validateIntent({ type: 'dance' }) // → 'Unknown intent type: "dance"'
```

Також `runGenerator()` перевіряє, що **Адаптер повертає правильну форму відповіді** для `ask`:

```javascript
// ❌ Adapter повернув рядок замість { value: ... }
ask: async () => 'just a string' // → TypeError: must return { value: ... }
```

### Контрактний Тест

Файл `src/domain/AdapterContract.test.js` містить повний набір тестів (13 кейсів), які перевіряють happy path, порушення контракту, таймаути та зовнішній abort.

---

## 6. 🎬 Сценарне Тестування та User Stories

### Проблема

У класичній розробці для перевірки повноцінних "user journeys" (життєвих циклів) створюють складні End-to-End (E2E) тести типу Playwright або Cypress. Вони завантажують браузер, довго клікають та часто є нестабільними (flaky).

### Рішення: Model = Entire Application (User Stories)

Оскільки в архітектурі OLMUI **Модель є цілим додатком**, ми можемо перевірити абсолютно всі сценарії (увесь User Journey) без підключення браузера чи Playwright. Модель нічого не знає про HTML чи DOM — вона лише жбурляє інтенції (`yield`), а отже, її можна повністю покрити сценарними тестами на етапі звичайних **ресурс-ефективних тестів**.

Замість того, щоб тестувати окремі маленькі функції, ми тестуємо поведінку цілого генератора як єдину User Story:

```javascript
test('Сценарій: Реєстрація з невірним email', async () => {
  const model = new RegistrationModel()
  const iterator = model.run()

  // 1. Модель просить email
  let intent = await iterator.next()
  assert.equal(intent.value.field, 'email')

  // 2. Користувач вводить порожній email (відправляємо симульовану відповідь)
  // Модель повинна відхилити це і попросити знову (або кинути помилку)
  intent = await iterator.next({ value: '' })
  assert.equal(intent.value.type, 'log')
  assert.equal(intent.value.level, 'error')
})
```

### 📖 Правило `test:stories`

Кожна розроблена (або згенерована) User Story має бути покрита подібним тестом і збережена у файлі `*.story.js`.
Вони запускаються окремою швидкою командою:

```bash
npm run test:stories
```

Ці тести працюють за долі мілісекунд, і вони обов'язково є частиною `test:all` pipeline. Завдяки цьому **E2E тести потрібні лише для того, щоб перевірити, чи правильно кнопка відмальована**, а не чи правильно працює логіка реєстрації.

---

## 7. 🏗️ Шестирівнева Архітектура Тестування (Fail-Fast Pipeline)

Оскільки `test:all` має перевіряти систему комплексно, він організований за принципом **Fail-Fast** — від найшвидших мілісекундних перевірок логіки до найдовших UI тестів (E2E / Screenshots).

Це гарантує максимальну ефективність розробки за допомогою **AI-агентів**: якщо агент порушив синтаксис чи бізнес-логіку, він дізнається про це моментально, не чекаючи завантаження браузерів.

### Послідовність 6 рівнів еталонного тестування (test:all):

1. **Статичний аналіз (Linting & TypeScript)**
   - ESLint, Knip, JSDoc. Швидкий синтаксичний фільтр (< 1 с).
2. **Абстрактна бізнес-логіка (Node.js)**
   - `test:js` (Native Node.js) та `test:stories` (Сценарні графи).
   - Мета: Перевірка моделей і генераторів без UI. Час: < 1 с.
3. **Статичні генерації (TXT, HTML)**
   - `test:gallery` (маркдаун) та `test:ssg-gallery` (статичний HTML).
   - Мета: Швидка перевірка цілісності шаблонів без запуску браузерів (~1 с).
4. **UI Компоненти та компіляція (JSDOM, Vite)**
   - `test:jsx` (React-тести) та `build` (Rollup/TypeScript chunking).
   - Мета: Відловити помилки імпортів і синтаксису JSX (~3-4 с).
5. **CLI-інтеграція (Golden Master Snapshots)**
   - `test:play` перевіряє ANSI-зліпки терміналів. Запускає повноцінні I/O процеси (~10 с).
6. **Візуальний та E2E Аудит (Playwright)**
   - Відмальовування компонентів `test:e2e` (роутинг) та `test:web-gallery` (100+ скріншотів).
   - Мета: Глибокий візуальний та регресійний аудит (30-90 с).

**ЗАКОН:** Будь-яка модифікація у проекті не вважається завершеною, поки вона не проходить всі 6 рівнів без жодної помилки. Це запорука інкрементального збереження поточного коду і роботи в форматі Zero-Hallucination.

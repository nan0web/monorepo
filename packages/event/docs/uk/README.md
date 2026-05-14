# @nan0web/event

| Назва пакета                                        | [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                                  | Покриття тестами | Можливості                         | Версія Npm |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| [@nan0web/event](https://github.com/nan0web/event/) | 🟢 `98.8%`                                                                            | 🧪 [Англійською 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/event/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/event/blob/main/docs/uk/README.md) | 🟢 `94.5%`       | ✅ d.ts 📜 system.md 🕹️ playground | —          |

Агностична та розширювана система подій для JavaScript середовищ.  
Надає чисті інтерфейси для виклику та обробки подій з підтримкою контексту.

Створено за [філософією nan0web](https://github.com/nan0web/monorepo/blob/main/system.md#nanweb-nan0web):  
де мінімальний код призводить до максимального результату, беручи до уваги CPU та пам’ять.

## Встановлення

Як встановити через npm?

```bash
npm install @nan0web/event
```

Як встановити через pnpm?

```bash
pnpm add @nan0web/event
```

Як встановити через yarn?

```bash
yarn add @nan0web/event
```

## Використання

### Базовий емітер подій

Створи екземпляр шини подій та слухай власні події.

Як створити базову шину подій та слухати повідомлення?

```js
import event from '@nan0web/event'
const bus = event()
let messageReceived = false

bus.on('message', (ctx) => {
  messageReceived = true
  console.info(`Отримано: ${ctx.data.text}`)
})

await bus.emit('message', { text: 'Привіт, світе!' })
```

### Запобігання стандартній поведінці

Скасуй подальше поширення події через `preventDefault`.

Як запобігти стандартній обробці події в слухачі?

```js
import event from '@nan0web/event'
const bus = event()
let callCount = 0

bus.on('stop', (ctx) => {
  callCount++
  ctx.preventDefault()
})

bus.on('stop', () => {
  callCount++
})

const result = await bus.emit('stop', {})
```

### Команди з пайплайном подій

Команди підтримують повний пайплайн виконання: `before`, `success` та `error`.  
Контекст не передається між ітераціями.

Як використовувати команди з пайплайном подій?

```js
import { createCommand } from '@nan0web/event/command'

const countCommand = createCommand('count', async (ctx) => {
  ctx.meta.totalCount = (ctx.meta.totalCount || 0) + 1
  console.info(`Прогрес ${ctx.data.iteration}: ${ctx.meta.totalCount} подій оброблено`)
})

countCommand.on('before', () => {
  console.info('Лічильник запущено')
})

for (let i = 0; i < 2; i++) {
  await countCommand.execute({ iteration: i })
}
```

### Власний клас подій (ООП стиль)

Розшир клас `Event`, щоб створити свою систему подій.

Як розширити клас Event для власної шини подій?

```js
import Event from '@nan0web/event/oop'

class TestEvent extends Event {
  async ping() {
    return await this.emit('ping', {})
  }
}

const instance = new TestEvent()
let received = false

instance.on('ping', () => {
  received = true
})

await instance.ping()
```

### Робота з контекстом події

`EventContext` надає багатий інтерфейс для представлення даних про подію.

Як маніпулювати та клонувати контексти подій?

```js
import { EventContext } from '@nan0web/event'

const ctx = EventContext.from({
  type: 'message',
  data: { text: 'ping' },
  meta: { id: 1 },
})

const clone = ctx.clone()
clone.data.ping = true
console.log(ctx.data) // { text: "ping" }
console.info(clone.data) // { text: "ping", ping: true }
```

## API

### `event()`

Створює новий емітер подій, використовуючи in-memory адаптер.

- **Методи**
  - `on(event, listener)` – зареєструвати слухача події
  - `off(event, listener)` – скасувати реєстрацію слухача
  - `emit(event, data)` – ініціювати подію з даними

### `createCommand(name, handler)`

- **Методи**
  - `on(event, listener)` – зареєструвати подію пайплайна
  - `off(event, listener)` – видалити подію пайплайна
  - `execute(data)` – виконати команду та запустити її пайплайн

### `EventContext`

Контекст, що передається кожному слухачу.

- **Властивості**
  - `type` – тип події
  - `name` – назва команди (якщо є)
  - `data` – дані події
  - `meta` – метадані події
  - `error` – контекст помилки (якщо є)
  - `defaultPrevented` – позначає, чи було викликано preventDefault

- **Методи**
  - `preventDefault()` – скасовує поширення події
  - `clone()` – створює копію контексту події
  - `static from(input)` – створює контекст з об’єкта чи іншого контексту

### `Event` (ООП клас)

Базовий клас для інкапсуляції поведінки подій.

- **Методи**
  - `on(event, listener)` – підписатися на подію
  - `off(event, listener)` – відписатися від події
  - `emit(event, data)` – ініціювати подію з даними

## Інтерактивний приклад

Як запустити playground скрипт?

```bash
# Клонуй репозиторій і запусти CLI-демо
git clone https://github.com/nan0web/event.git
cd event
npm install
npm run play
```

## Java•Script

Забезпечує повну підтримку автодоповнення через `.d.ts` типи.

## Допомога у розвитку

Як допомогти? – [дивись тут](./CONTRIBUTING.md)

## Ліцензія

Як ISC ліцензія? – [дивись тут](./LICENSE)

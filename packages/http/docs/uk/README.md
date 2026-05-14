# @nan0web/http

| [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                                | Покриття тестами | Функції                            | Версія Npm |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| 🟢 `99.2%`                                                                            | 🧪 [Англійською 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/http/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/http/blob/main/docs/uk/README.md) | 🟢 `95.7%`       | ✅ d.ts 📜 system.md 🕹️ playground | 1.0.0      |

HTTP класи для nan0web

## Встановлення

Як встановити з npm?

```bash
npm install @nan0web/http
```

Як встановити з pnpm?

```bash
pnpm add @nan0web/http
```

Як встановити з yarn?

```bash
yarn add @nan0web/http
```

## Використання

### HTTP Статус Коди

Словник HTTP статус кодів та їх описів.

Як отримати текст статусу HTTP за кодом?

```js
import { HTTPStatusCode } from '@nan0web/http'
console.info(HTTPStatusCode.get(200)) // OK
console.info(HTTPStatusCode.get(404)) // Not Found
console.info(HTTPStatusCode.get(418)) // I'm a teapot (RFC 2324)
```

### HTTP Помилки

Класи користувацьких помилок для HTTP-пов'язаних помилок.

Як створити екземпляр HTTPError?

```js
import { HTTPError } from '@nan0web/http'
try {
  throw new HTTPError('Неправильний запит', 400)
} catch (/** @type {any} */ error) {
  console.info(error.toString()) // HTTPError [400] Неправильний запит\n<stack trace>
}
```

Як створити екземпляр AbortError?

```js
import { AbortError } from '@nan0web/http'
try {
  throw new AbortError('Запит скасовано користувачем')
} catch (/** @type {any} */ error) {
  console.info(error.name) // AbortError
  console.info(error.message) // Запит скасовано користувачем
}
```

### HTTP Заголовки

Клас для управління HTTP заголовками, який підтримує кілька форматів вводу.

Як створити HTTPHeaders з об'єкта?

```js
import { HTTPHeaders } from '@nan0web/http'
const headers = new HTTPHeaders({
  'Content-Type': 'application/json',
  Authorization: 'Bearer secret-token',
  'User-Agent': 'nan0web-http-client/1.0',
})
console.info(headers.toString())
// Content-Type: application/json
// Authorization: Bearer secret-token
// User-Agent: nan0web-http-client/1.0
```

Як створити HTTPHeaders з масиву?

```js
import { HTTPHeaders } from '@nan0web/http'
const headers = new HTTPHeaders([
  ['accept', 'application/json'],
  ['x-api-key', 'key123'],
])
console.info(headers.toString()) // Accept: application/json\nX-Api-Key: key123
```

Як створити HTTPHeaders з рядка?

```js
import { HTTPHeaders } from '@nan0web/http'
const headers = new HTTPHeaders('Content-Type: text/html\nX-Request-ID: abc123')
console.info(headers.toString()) // Content-Type: text/html\nX-Request-ID: abc123
```

Як маніпулювати HTTPHeaders?

```js
import { HTTPHeaders } from '@nan0web/http'
const headers = new HTTPHeaders()
headers.set('Cache-Control', 'no-cache')
headers.set('Accept-Language', 'en-US,en;q=0.9')
console.info(headers.size) // 2
console.info(headers.has('Cache-Control')) // true
console.info(headers.get('Cache-Control')) // no-cache
console.info(JSON.stringify(headers.toObject(), null, 2))
// {
//   "Cache-Control": "no-cache",
//   "Accept-Language": "en-US,en;q=0.9"
// }
```

### HTTP Повідомлення

Базовий клас для HTTP повідомлень з URL, заголовками та необов'язковим тілом.

Як створити екземпляр HTTPMessage?

```js
import { HTTPMessage } from '@nan0web/http'
const message = new HTTPMessage({
  url: '/api/test',
  headers: {
    'Content-Type': 'application/json',
  },
  body: '{"test": true}',
})
console.info(message.toString())
// </api/test>
// Content-Type: application/json

// {"test": true}
```

### Вхідне HTTP Повідомлення

Розширює HTTPMessage для представлення клієнтських запитів з методами.

Як створити екземпляр HTTPIncomingMessage?

```js
import { HTTPIncomingMessage } from '@nan0web/http'
const getRequest = new HTTPIncomingMessage({
  method: 'GET',
  url: '/api/users',
  headers: {
    Accept: 'application/json',
    'User-Agent': 'nan0web-client/1.0',
  },
})
console.info(getRequest.toString())
// GET </api/users>
// Accept: application/json
// User-Agent: nan0web-client/1.0
```

Як перевірити HTTP методи?

```js
import { HTTPMethodValidator } from '@nan0web/http'
console.info(HTTPMethodValidator('GET')) // GET
console.info(HTTPMethodValidator('INVALID')) // кидає TypeError
```

### Вихідне HTTP Повідомлення

Розширює HTTPMessage для представлення відповідей сервера з інформацією про статус.

Як створити екземпляр HTTPResponseMessage?

```js
import { HTTPResponseMessage } from '@nan0web/http'
const successResponse = new HTTPResponseMessage({
  url: '/api/users',
  status: 200,
  statusText: 'OK',
  ok: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Response-Time': '45ms',
  },
  body: JSON.stringify([
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
  ]),
})
console.info(successResponse.status) // 200
console.info(successResponse.statusText) // OK
console.info(successResponse.ok) // true
console.info(await successResponse.text()) // [{"id":1,"name":"John"},{"id":2,"name":"Jane"}]
```

Як клонувати екземпляр HTTPResponseMessage?

```js
import { HTTPResponseMessage } from '@nan0web/http'
const original = new HTTPResponseMessage({
  url: '/api/data',
  status: 200,
  body: 'Hello world',
})
const cloned = original.clone()
console.info(original.url) // /api/data
console.info(cloned.url) // /api/data
console.info((await original.text()) === (await cloned.text())) // true
```

## API

### HTTPStatusCode

- **Методи**
  - `static get(code)` – Повертає текст статусу для заданого коду або "Unknown", якщо не знайдено.

### AbortError

Розширює `Error`.

- **Конструктор**
  - `new AbortError(message = "Request aborted")` – Створює AbortError з необов'язковим користувацьким повідомленням.

### HTTPError

Розширює `Error`.

- **Властивості**
  - `status` – Код статусу HTTP.

- **Конструктор**
  - `new HTTPError(message, status = 400)` – Створює HTTPError із повідомленням та кодом статусу.

- **Методи**
  - `toString()` – Повертає форматований рядок помилки зі статусом, повідомленням та стеком викликів.

### HTTPHeaders

- **Властивості**
  - `size` – Кількість заголовків.

- **Конструктор**
  - `new HTTPHeaders(input = {})` – Створює заголовки з об'єкта, масиву або рядка.

- **Методи**
  - `has(name)` – Повертає true, якщо заголовок існує.
  - `get(name)` – Повертає значення заголовка.
  - `set(name, value)` – Встановлює заголовок.
  - `delete(name)` – Видаляє заголовок.
  - `toArray()` – Повертає масив форматованих рядків заголовків.
  - `toString()` – Повертає рядкове представлення всіх заголовків.
  - `toObject()` – Повертає об'єкт з назвами та значеннями заголовків.
  - `static from(input)` – Повертає існуючий екземпляр або створює новий.

### HTTPMessage

- **Властивості**
  - `url` – URL запиту/відповіді.
  - `headers` – Екземпляр HTTPHeaders.
  - `body` – Необов'язкове тіло повідомлення.

- **Конструктор**
  - `new HTTPMessage(input = {})` – Створює повідомлення з URL, заголовками та необов'язковим тілом.

- **Методи**
  - `toString()` – Повертає рядкове представлення повідомлення.
  - `static from(input)` – Повертає існуючий екземпляр або створює новий.

### HTTPIncomingMessage

Розширює `HTTPMessage`.

- **Властивості**
  - `method` – Метод HTTP (GET, POST тощо).

- **Конструктор**
  - `new HTTPIncomingMessage(input = {})` – Створює вхідне повідомлення з методом.

- **Методи**
  - `toString()` – Повертає рядкове представлення, включаючи метод.
  - `static from(input)` – Повертає існуючий екземпляр або створює новий.

### HTTPMethods

Статичні константи для HTTP методів:

- `HTTPMethods.GET`
- `HTTPMethods.POST`
- `HTTPMethods.PATCH`
- `HTTPMethods.PUT`
- `HTTPMethods.DELETE`
- `HTTPMethods.HEAD`
- `HTTPMethods.OPTIONS`

### HTTPMethodValidator

Функція, яка перевіряє рядки методів HTTP на відповідність допустимим методам.

### HTTPResponseMessage

Розширює `HTTPMessage`.

- **Властивості**
  - `ok` – Булеве значення, яке вказує, чи є статус успішним (2xx).
  - `status` – Код статусу HTTP.
  - `statusText` – Опис тексту статусу.
  - `type` – Тип відповіді (basic, cors тощо).
  - `redirected` – Булеве значення, яке вказує, чи була відповідь перенаправлена.

- **Конструктор**
  - `new HTTPResponseMessage(input = {})` – Створює повідомлення відповіді з інформацією про статус.

- **Методи**
  - `clone()` – Повертає клоноване повідомлення відповіді.
  - `json()` – Повертає JSON-розпаршене тіло.
  - `text()` – Повертає тіло у вигляді рядка.

Усі експортовані класи мають пройти базовий тест для забезпечення роботи прикладів API

## Java•Script

Використовує `d.ts` файли для автозавершення

## CLI Playground

Як запустити скрипт playground?

```bash
# Клонуйте репозиторій і запустіть CLI playground
git clone https://github.com/nan0web/http.git
cd http
npm install
npm run play
```

## Внесок

Як зробити внесок? - [перевірте тут](./CONTRIBUTING.md)

## Ліцензія

Як ліцензувати ISC? - [перевірте тут](./LICENSE)

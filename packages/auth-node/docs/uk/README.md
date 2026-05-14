# @nan0web/auth-node

Цей документ доступний іншими мовами:

- [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](../../README.md)

Сервер авторизації для екосистеми nan0web.

<!-- %PACKAGE_STATUS% -->

## Опис

Окремий сервер авторизації без зовнішніх фреймворків з наступними можливостями:

- **Керування користувачами** — реєстрація, верифікація, скидання пароля, видалення акаунту
- **Система токенів** — access + refresh токени з реєстром ротації
- **Контроль доступу** — рольова модель дозволів для приватних ресурсів
- **Обмеження швидкості** — вбудований захист від brute-force атак
- **Пісочниця (Playground)** — інтерактивний CLI для тестування всіх потоків

## Встановлення

Як встановити за допомогою npm?

```bash
npm install @nan0web/auth-node
```

## Ініціалізація сервера

Створення та запуск сервера авторизації з налаштуваннями конфігурації.

Як створити та запустити AuthServer?

```js
import AuthServer from '@nan0web/auth-node'
import Logger from '@nan0web/log'

const server = new AuthServer({
  db: { cwd: './auth-data' },
  port: 4320,
  logger: new Logger(),
})

await server.start()
console.info('Server started on port:', server.port)
// Server started on port: 4320

// Graceful shutdown
await server.stop()
```

## API Довідник

Всі кінцеві точки (endpoints) мають префікс `/auth`. Приклади використовують `curl` з `localhost:3000`.

---

### POST /auth/signup — Реєстрація

Користувач повинен підтвердити свою електронну пошту перед входом.

Як створити новий акаунт користувача?

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'
```

**Відповідь** `200`:

```json
{ "message": "Verification code sent" }
```

| Статус | Значення                                          |
| ------ | ------------------------------------------------- |
| `200`  | Успішно — код верифікації надіслано (через email) |
| `400`  | Відсутні обов'язкові поля                         |
| `409`  | Користувач вже існує                              |

### PUT /auth/signup/:username — Верифікація акаунту

Підтверджує реєстрацію користувача за допомогою 6-значного коду.
У разі успіху повертає пару токенів.

Як верифікувати акаунт користувача?

```bash
curl -X PUT http://localhost:3000/auth/signup/alice \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
```

**Відповідь** `200`:

```json
{ "message": "Account verified", "accessToken": "...", "refreshToken": "..." }
```

| Статус | Значення                     |
| ------ | ---------------------------- |
| `200`  | Верифіковано — видано токени |
| `400`  | Вже верифіковано             |
| `401`  | Невірний код                 |
| `404`  | Користувач не знайдений      |

### POST /auth/signin/:username — Вхід (Login)

Автентифікація за іменем користувача та паролем. Акаунт має бути попередньо верифікований.

Як увійти за допомогою пароля?

```bash
curl -X POST http://localhost:3000/auth/signin/alice \
  -H "Content-Type: application/json" \
  -d '{"password":"secret123"}'
```

**Відповідь** `200`:

```json
{ "accessToken": "...", "refreshToken": "..." }
```

| Статус | Значення                |
| ------ | ----------------------- |
| `200`  | Успішно — видано токени |
| `401`  | Невірний пароль         |
| `403`  | Акаунт не верифіковано  |
| `404`  | Користувач не знайдений |

### PUT /auth/refresh/:token — Оновлення токенів (Refresh)

Обмін дійсного refresh токена на нову пару токенів.
Передайте `{ "replace": true }`, щоб скасувати старий refresh токен.

Як оновити access токени?

```bash
curl -X PUT http://localhost:3000/auth/refresh/YOUR_REFRESH_TOKEN \
  -H "Content-Type: application/json" \
  -d '{"replace":true}'
```

**Відповідь** `200`:

```json
{ "accessToken": "new_access", "refreshToken": "new_refresh" }
```

| Статус | Значення                                 |
| ------ | ---------------------------------------- |
| `200`  | Видано нові токени                       |
| `401`  | Недійсний або прострочений refresh токен |

---

### POST /auth/forgot/:username — Запит на скидання пароля

Надсилає 6-значний код скидання користувачеві (через email в production).

Як зробити запит на скидання пароля?

```bash
curl -X POST http://localhost:3000/auth/forgot/alice
```

**Відповідь** `200`:

```json
{ "message": "Reset code sent" }
```

| Статус | Значення                 |
| ------ | ------------------------ |
| `200`  | Код скидання згенеровано |
| `404`  | Користувач не знайдений  |

### PUT /auth/forgot/:username — Скидання пароля

Встановлює новий пароль за допомогою коду скидання.
Усі попередні токени визнаються недійсними.

Як скинути пароль за допомогою коду?

```bash
curl -X PUT http://localhost:3000/auth/forgot/alice \
  -H "Content-Type: application/json" \
  -d '{"code":"654321","password":"newSecret456"}'
```

**Відповідь** `200`:

```json
{ "message": "Password reset successful", "accessToken": "...", "refreshToken": "..." }
```

| Статус | Значення                            |
| ------ | ----------------------------------- |
| `200`  | Пароль змінено — видано нові токени |
| `401`  | Невірний код скидання               |
| `404`  | Користувач не знайдений             |

---

### GET /auth/signin/:username — Інформація про користувача

Повертає профіль користувача. Видимість залежить від ролі запитувача.
Вимагає заголовок `Authorization: Bearer <token>`.

Як отримати інформацію про профіль користувача?

```bash
curl http://localhost:3000/auth/signin/alice \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Відповідь** `200` (власний профіль або адміністратор):

```json
{ "name": "alice", "email": "alice@example.com", "verified": true, "roles": ["user"] }
```

| Рівень доступу   | Видимі поля               |
| ---------------- | ------------------------- |
| Власний профіль  | Всі, крім пароля та кодів |
| Адміністратор    | Всі, крім пароля та кодів |
| Інший користувач | name, email, createdAt    |

### GET /auth/info — Список користувачів (Admin)

Повертає список імен усіх зареєстрованих користувачів. Потрібна роль адміністратора.

Як отримати список усіх користувачів як адміністратор?

```bash
curl http://localhost:3000/auth/info \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Відповідь** `200`:

```json
{ "users": ["alice", "bob", "carol"] }
```

| Статус | Значення                      |
| ------ | ----------------------------- |
| `200`  | Список користувачів повернуто |
| `403`  | Ви не адміністратор           |

### GET /auth/access/info — Правила контролю доступу

Повертає дозволи поточного користувача: особисті правила, правила групи та глобальні правила.

Як отримати правила контролю доступу?

```bash
curl http://localhost:3000/auth/access/info \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Відповідь** `200`:

```json
{ "userAccess": [], "groupRules": [], "globalRules": [], "groups": [] }
```

| Статус | Значення                  |
| ------ | ------------------------- |
| `200`  | Правила доступу повернуто |
| `401`  | Не автентифіковано        |

---

## Приватні ресурси

Усі маршрути `/private/*` вимагають `Authorization: Bearer <token>`.
Доступ контролюється правилами `.access` (див. Контроль доступу).

### POST /private/:path — Створення/Оновлення ресурсу

Як записати у приватний ресурс?

```bash
curl -X POST http://localhost:3000/private/notes.json \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Note","content":"Hello World"}'
```

| Статус | Значення               |
| ------ | ---------------------- |
| `201`  | Створено               |
| `401`  | Не автентифіковано     |
| `403`  | Немає дозволу на запис |

### GET /private/:path — Читання ресурсу

Як прочитати приватний ресурс?

```bash
curl http://localhost:3000/private/notes.json \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

| Статус | Значення                 |
| ------ | ------------------------ |
| `200`  | Дані ресурсу повернуто   |
| `401`  | Не автентифіковано       |
| `403`  | Немає дозволу на читання |
| `404`  | Ресурс не знайдений      |

### HEAD /private/:path — Перевірка наявності ресурсу

Як перевірити чи існує приватний ресурс?

```bash
curl -I http://localhost:3000/private/notes.json \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

| Статус | Значення                 |
| ------ | ------------------------ |
| `200`  | Існує                    |
| `401`  | Не автентифіковано       |
| `403`  | Немає дозволу на читання |
| `404`  | Не знайдено              |

### DELETE /private/:path — Видалення ресурсу

Як видалити приватний ресурс?

```bash
curl -X DELETE http://localhost:3000/private/notes.json \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

| Статус | Значення                   |
| ------ | -------------------------- |
| `200`  | Видалено                   |
| `401`  | Не автентифіковано         |
| `403`  | Немає дозволу на видалення |
| `404`  | Ресурс не знайдений        |

### DELETE /auth/signin/:username — Вихід (Logout)

Прострочує (аннулює) всі токени для автентифікованого користувача.
Вимагає заголовок `Authorization: Bearer <token>`.

Як вийти користувачу (logout)?

```bash
curl -X DELETE http://localhost:3000/auth/signin/alice \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Відповідь** `200`:

```json
{ "message": "Logged out successfully" }
```

| Статус | Значення                                             |
| ------ | ---------------------------------------------------- |
| `200`  | Вихід виконано — всі токени очищено                  |
| `401`  | Не автентифіковано                                   |
| `403`  | Не авторизовано (спроба вийти за іншого користувача) |
| `404`  | Користувач не знайдений                              |

### DELETE /auth/signup/:username — Видалення акаунту

Назавжди видаляє акаунт користувача та всі пов'язані з ним токени.

Як видалити акаунт користувача?

```bash
curl -X DELETE http://localhost:3000/auth/signup/alice
```

**Відповідь** `200`:

```json
{ "message": "Account deleted" }
```

| Статус | Значення                |
| ------ | ----------------------- |
| `200`  | Акаунт видалено         |
| `404`  | Користувач не знайдений |

---

## Потік автентифікації

```
┌──────────┐     POST /auth/signup          ┌──────────┐
│  Client  │ ───────────────────────── >    │  Server  │
│          │ < ─ { message: "code sent" }   │          │
│          │                                │          │
│          │   PUT /auth/signup/:user       │          │
│          │ ──── { code: "123456" } ──── > │          │
│          │ < ── { accessToken, refresh }  │          │
│          │                                │          │
│          │   POST /auth/signin/:user      │          │
│          │ ──── { password } ──────── >   │          │
│          │ < ── { accessToken, refresh }  │          │
│          │                                │          │
│          │   GET /private/data.json       │          │
│          │ ── Bearer <accessToken> ── >   │          │
│          │ < ── { ... data ... }          │          │
│          │                                │          │
│          │   PUT /auth/refresh/:token     │          │
│          │ ──────────────────────────── > │          │
│          │ < ── { new accessToken }       │          │
│          │                                │          │
│          │   DELETE /auth/signin/:user    │          │
│          │ ── Bearer <accessToken> ── >   │          │
│          │ < ── { "Logged out" }          │          │
└──────────┘                                └──────────┘
```

## Java•Script API

Наступні класи експортуються для програмного використання:

- `AuthServer` — Основна реалізація HTTP-сервера
- `User` — Доменна модель
- `AuthDB` — Адаптер файлової бази даних
- `TokenManager` — Перевірка та видача токенів
- `TokenRotationRegistry` — Керування ланцюгом refresh токенів
- `AccessControl` — Перевірки доступу на основі ролей та шляхів

Як імпортувати експортовані класи?

```javascript
import {
  AuthServer,
  User,
  AuthDB,
  TokenManager,
  TokenRotationRegistry,
  AccessControl,
} from '@nan0web/auth-node'
```

## CLI

Запуск сервера авторизації напряму:

```bash
npx nan0auth
```

Як запустити сервер авторизації з CLI?

## Пісочниця (Playground - Interactive CLI)

Досліджуйте всі процеси автентифікації інтерактивно без написання коду.

```bash
npm run play
```

**Доступні сценарії:**

| Сценарій      | Що перевіряє                                                             |
| ------------- | ------------------------------------------------------------------------ |
| `demo`        | Повний потік: реєстрація → верифікація → вхід → приватні ресурси → вихід |
| `error-cases` | Дублювання реєстрації, неправильний пароль, неавторизований доступ       |
| `token-flow`  | Оновлення токенів, перевірки HEAD, життєвий цикл ресурсу                 |

У режимі пісочниці коди верифікації автоматично зчитуються з бази даних.

## Участь у проєкті

Як внести свій вклад? - [подивіться тут]($pkgURL/blob/main/CONTRIBUTING.md)

## Ліцензія

Як ліцензувати? - [ISC LICENSE]($pkgURL/blob/main/LICENSE) файл.

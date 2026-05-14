# 🏗️ Архітектура: @nan0web/catalog-watch

> Легковагий пакет підписки на зміни каталогів через HTTP HEAD + ETag.
> Принцип Zero-State Server: сервер генерує статику, клієнт опитує.

---

## 🧭 Фаза 1: Філософія та Абстракція (The Seed)

### 1.1 Місія

Дати будь-якому OLMUI-додатку (веб, CLI, PWA, AI-агент) можливість **дізнатися про зміни каталогу без бекенду** — лише через HTTP HEAD і SHA-256 хеш у plain-text індексному файлі. Нуль WebSocket-ів, нуль push-нотифікацій, нуль серверної логіки в рантаймі.

### 1.2 Абстракція

Пакет реалізує паттерн **Pull-based Catalog Subscription**:

```
[SSG Build] → .index.txt (plain text, SHA-256) → CDN/Static
                                                     ↓
[Client] → HTTP HEAD → ETag/Hash Compare → Updated? → ask(download) → mutate state
```

Це **не** real-time система. Це **poll-based** із мінімальним трафіком: один `HEAD`-запит (0 байтів тіла) кожну годину.

### 1.3 Термінологія (Глосарій)

| Термін | Визначення |
|--------|-----------|
| **Catalog** | Іменована колекція продуктів (cards, metals, credits, news) |
| **Index** | Plain-text `.index.txt` файл із метаданими та списком файлів |
| **Watcher** | Клієнтський підписник, що опитує Index через HTTP HEAD |
| **Hash** | SHA-256 (перші 12 символів) від конкатенації вмісту всіх файлів каталогу |
| **ETag** | HTTP-заголовок, який CDN автоматично генерує для статичного файлу |
| **Intent** | OLMUI yield-обʼєкт (`progress`, `log`, `ask`, `result`) |

---

## 📐 Фаза 2: Доменне Моделювання (Data-Driven Models)

### 2.1 CatalogIndexModel (`src/domain/CatalogIndexModel.js`)

**Призначення:** Серверна модель індексного файлу. Генерує та парсить `.index.txt`.

**Schema (static fields):**

| Поле | Тип | Default | Призначення |
|------|-----|---------|-------------|
| `catalog` | string | `''` | Ім'я каталогу |
| `locale` | string | `'en'` | Мовний код |
| `version` | number | `0` | Авто-інкремент білду |
| `hash` | string | `''` | SHA-256 (12 chars) |
| `itemCount` | number | `0` | Кількість елементів |
| `updatedAt` | string | `''` | ISO 8601 timestamp |

**Instance fields:**
- `files: string[]` — список файлів каталогу

**Серіалізація:**
- `toString()` → plain text із `#`-заголовками + по рядку на файл
- `CatalogIndexModel.parse(text)` → реконструкція з тексту

**Генератор:** `async *run(env)` — сканує директорію, хешує вміст, інкрементує версію, віддає результат.

### 2.2 CatalogWatcherModel (`src/domain/CatalogWatcherModel.js`)

**Призначення:** Клієнтська модель підписки. Агностична — працює скрізь.

**Schema (static fields):**

| Поле | Тип | Hint | Default | Призначення |
|------|-----|------|---------|-------------|
| `url` | string | url | `''` | URL індексу |
| `interval` | number | slider | `3600` | Інтервал (сек) |
| `lastHash` | string | hidden | `''` | Попередній хеш |
| `lastCheck` | string | hidden | `''` | Останній таймстемп |
| `status` | string | badge | `'idle'` | Стан (5 значень) |
| `autoConfirm` | boolean | toggle | `false` | Авто-підтвердження |

**Стани (Status enum):** `idle` → `checking` → `updated` | `unchanged` | `error`

**Генератори:**
- `async *check(env)` — одноразова перевірка: HEAD → ETag → GET → parse → compare → ask → mutate
- `async *watch(env)` — нескінченний цикл: `check()` → `sleep(interval)` → repeat

### 2.3 UI Projection (Zero Hardcode)

Обидві моделі мають `static UI = { ... }` з усіма текстовими повідомленнями. Жодного хардкоду в логіці. 27 ключів перекладу, що покривають:

- `label_*` — мітки стану та інформації
- `error_*` — повідомлення помилок
- `progress_*` — повідомлення прогресу
- `abort.*` — причини переривання (словник)

### 2.4 i18n

- `data/_/t.yaml` — базові переклади (EN)
- `data/uk/_/t.yaml` — українські переклади

Структура YAML: `ModelName.key: "value"` з підтримкою ICU-шаблонів (`{version}`, `{count}`, `{url}`).

---

## 🛠 Фаза 3: Верифікація Логіки (CLI-First)

### 3.1 Тестове покриття

**49 тестів / 10 блоків** (`node --test`):

| Блок | Тестів | Що покривається |
|------|--------|----------------|
| CatalogIndexModel: Serialization | 7 | toString ↔ parse roundtrip |
| CatalogIndexModel: Schema | 4 | Defaults, UI keys, field metadata |
| CatalogIndexModel: run() | 10 | Happy path, edge cases, intent контракт |
| CatalogWatcherModel: Schema | 7 | Defaults, Status enum, abort dict |
| CatalogWatcherModel: check() Happy | 8 | ETag, 304, hash compare, state mutation |
| CatalogWatcherModel: check() Reject | 2 | User declines download |
| CatalogWatcherModel: check() Errors | 3 | Missing URL, network error |
| CatalogWatcherModel: watch() Loop | 2 | Init, URL guard |
| CatalogWatcherModel: Intent Contract | 4 | Type validation, schema shape |
| OLMUI Scenario (E2E) | 1 | Full cycle + DB persistence |
| **Разом** | **49** | |

### 3.2 Сценарний тест (`scenario.test.js`)

Повний цикл OLMUI: створення `CatalogWatcherModel` → `check()` через `runGenerator` → верифікація Intent-ів → збереження стану в `@nan0web/db` In-Memory → читання та assertion мутацій.

### 3.3 Адаптери

Три адаптери забезпечують роботу моделей у реальному середовищі:

#### `CatalogWatcher` (EventBus — Browser/Node.js)
- `src/CatalogWatcher.js`
- Обгортка з `@nan0web/event` EventBus
- API: `.on(event, fn)`, `.off(event, fn)`, `.start()`, `.stop()`, `.checkNow()`
- Events: `'updated'`, `'unchanged'`, `'error'`

#### `buildCatalogIndex` (SSG Plugin — Node.js)
- `src/server/buildCatalogIndex.js`
- Dynamic imports: `node:fs/promises`, `node:crypto`, `node:path`
- `runGenerator` для виконання `CatalogIndexModel.run(env)`
- Вихід: `dist/@catalog/{locale}/{catalog}.index.txt`

#### Service Worker (`sw.js` — PWA)
- `src/sw.js`
- `registerCatalogSync(self, urls, options)` — реєстрація
- Cache API для offline-first стратегії
- `notifyCatalogCheck()` — клієнтський хелпер для `visibilitychange`

---

## 🪐 Фаза 4: Sovereign Workbench (The Master IDE)

> ⚠️ **Фаза не реалізована.** Sandbox/Playground для catalog-watch поки не створено. Планується інтеграція в загальний `blocks-sandbox` або окремий play-середовище для візуалізації стану watcher-а (status badge, last check, hash diff).

---

## 🎨 Фаза 5: Тематизація та Інтерфейс (Theming)

> ⚠️ **Фаза не реалізована.** Пакет є чисто логічним (Zero UI). Візуальне представлення делегується адаптерам (`ui-cli`, `ui-react`, `ui-lit`). CSS Custom Properties не застосовуються, оскільки пакет не має власного рендерінгу.

---

## 📦 Публічний API (package.json exports)

| Export path | Модуль | Призначення |
|-------------|--------|-------------|
| `.` | `src/index.js` | CatalogWatcher, CatalogWatcherModel, CatalogIndexModel |
| `./server` | `src/server/buildCatalogIndex.js` | SSG білд-плагін |
| `./sw` | `src/sw.js` | PWA Service Worker хелпери |
| `./domain` | `src/domain/CatalogIndexModel.js` | Модель індексу |

## 🔗 Залежності

| Пакет | Тип | Використання |
|-------|-----|-------------|
| `@nan0web/types` | workspace | `resolveDefaults` для конструкторів |
| `@nan0web/ui` | workspace | `ask`, `progress`, `log`, `result`, `runGenerator` |
| `@nan0web/event` | workspace | EventBus для CatalogWatcher adapter |
| `@nan0web/db` | workspace | In-Memory DB для тестів (dev) |

---

## 🏁 Чеклист готовності

- [x] Місія та абстракція визначені
- [x] Дві доменні моделі з Model-as-Schema
- [x] Три адаптери (EventBus, SSG, Service Worker)
- [x] 49 тестів, 100% pass
- [x] Zero-Hallucination i18n (27 ключів, EN + UK)
- [x] Канонічний сценарний тест з DB-persistence
- [x] Seed (ТЗ) записано у `docs/seed.md`
- [ ] Sandbox (Фаза 4) — планується
- [ ] Theming (Фаза 5) — N/A (чисто логічний пакет)
- [ ] npm release v0.1.0
- [ ] Інтеграція в Industrial Bank (Веб)
- [ ] Інтеграція в CLI

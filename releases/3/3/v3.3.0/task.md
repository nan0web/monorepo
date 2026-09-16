---
version: 3.3.0
type: feature
status: planning
locale: uk
models: ["DBServerModel", "SearchIndexModel"]
---

# 🗄️ Release Task: v3.3.0 @nan0web/db-server — In-Memory Document DB з REST API

## 🏁 Overview (Огляд)

Створення нового пакету `@nan0web/db-server` — HTTP-сервісу, який перетворює файлову систему на документну базу даних з in-memory кешем та REST API. Сервіс сканує каталог, будує індекс шляхів, завантажує документи ліниво і надає повний CRUD через HTTP.

Це **document-oriented in-memory database з file-system persistence** — як SQLite для контенту, але з семантикою Git-транзакцій (POST → memory, PATCH → disk).

## 👥 User Stories (Сценарії)

> Як розробник (Developer), я хочу запустити `$ nan0db` у корені проєкту, щоб отримати REST API до всіх моїх документів без написання коду.

> Як фронтенд-розробник (Frontend Dev), я хочу читати документи через GET `/uk/private` з автоматичним merge батьківських `_/*.json` та globals `_/*`, щоб не писати власну логіку об'єднання.

> Як CMS-адміністратор (CMS Admin), я хочу редагувати документи через POST/PUT в пам'яті та фіксувати зміни PATCH на диск, щоб працювати з контентом як з транзакційною БД.

> Як пошуковець (Searcher), я хочу шукати по всій базі через `GET /?q=term` або по конкретному URI `GET /path?q=term`, щоб знаходити потрібні документи швидко.

> Як архітектор (Architect), я хочу монтувати зовнішні БД через `--mount @mongo:...` або `--mount @pg:...`, щоб використовувати єдиний API до різних бекендів.

## 🏗 Data-Driven Architecture (Моделювання)

### Новий пакет: `@nan0web/db-server`

```
packages/db-server/
├── package.json
├── src/
│   ├── index.js          # export { serve }
│   ├── serve.js          # HTTP сервер + router
│   ├── search.js         # Inverted Index Search Engine
│   └── config.js         # CLI args parser + defaults
├── bin/
│   └── nan0db.js         # CLI entry point
└── README.md.js
```

### Моделі (Model-as-Schema)

```javascript
// src/config.js
class ServerConfig {
  static port = { help: 'HTTP server port', default: 2349, type: 'number' }
  static root = { help: 'Data directory root', default: '.', positional: true }
  static preload = { help: 'Preload strategy: lazy | index | all', default: 'lazy' }
  static maxMemory = { help: 'Max memory for preloaded docs (MB)', default: 0 }
  static noIndex = { help: 'Disable full-text search index', default: false }
}

// src/search.js
class SearchIndex {
  // Map<string, Set<string>> — token → URIs
  tokens = new Map()
  
  // Build index from all documents
  build(db, strategy?)
  
  // Search with BM25-like scoring
  search(query, limit?, offset?)
  
  // Add single document to index
  add(uri, content)
  
  // Remove document from index
  remove(uri)
  
  // Rebuild after changes
  rebuild(db)
}
```

### Mount Architecture

```javascript
const db = new DB()

// Default: filesystem-backed DBFS
db.mount('', new DBFS({ cwd: process.cwd(), root: config.root }))

// Optional external mounts via CLI
// --mount @mongo:mongodb://localhost/mydb
// --mount @pg:postgresql://localhost/mydb
// --mount ~:/Users/i/.app_name

db.seal()
await db.connect()
```

### HTTP Router Contract

| Method | Path | Query Params | Operation |
|--------|------|-------------|-----------|
| GET | `/<uri>` | `?mode=get` | `db.get(uri)` — raw, no merge |
| GET | `/<uri>` | `?mode=stat` | `db.stat(uri)` — metadata only |
| GET | `/<uri>` | `?mode=browse` | `db.browse(uri)` — paginated list |
| GET | `/<uri>` | `?q=<term>` | search inside uri context |
| GET | `/<uri>` | `?q=<term>&mode=browse` | browse + filter by query |
| GET | `/` | `?q=<term>` | global search across all mounts |
| HEAD | `/<uri>` | — | headers only (ETag, Content-Type) |
| POST | `/<uri>` | — | `db.set(uri, body)` — in memory |
| PUT | `/<uri>` | — | `db.replace(uri, body)` — in memory |
| PATCH | `/` | — | `db.push()` — commit all changes |
| PATCH | `/<uri>` | — | `db.saveDocument(uri)` — save one |
| DELETE | `/<uri>` | — | `db.dropDocument(uri)` |
| GET | `/_health` | — | `{ status, documents, uptime, memory }` |

### Search Strategies

1. **Inverted Index** (default, v1) — токенизація → стоп-слова → індекс `Map<token, Set<uri>>`. Швидкий O(1) по токену.
2. **Path Glob Filter** (built-in) — фільтрація результатів `browse()` за патерном `*post*`.
3. **Delegated Search** (future) — `?engine=@elastic` делегує зовнішньому драйверу.

## 🎯 Scope (Задачі)

- [ ] Створити пакет `packages/db-server/` з `package.json`, структурою папок, exports
- [ ] Реалізувати `src/config.js` — парсинг CLI аргументів (`--port`, `--root`, `--preload`, `--no-index`)
- [ ] Реалізувати `src/search.js` — Inverted Index Search Engine (токенізація, індексація, пошук)
- [ ] Реалізувати `src/serve.js` — HTTP сервер з маршрутизацією (mount resolution → intent detection → operation)
- [ ] Реалізувати `bin/nan0db.js` — CLI entry point (bootstrap + serve)
- [ ] Підключити до monorepo: `pnpm-workspace.yaml`, root `package.json` scripts
- [ ] Написати контрактні тести `releases/3/3/v3.3.0/task.spec.js`
- [ ] Протестувати: `npm run release:spec`

## ✅ Acceptance Criteria (DoD)

- [ ] **Контрактні тести** (`task.spec.js`) написані і успішно проходять (Green).
- [ ] **Model-as-Schema**: Жодного використання JS class fields. Лише JSDoc типізація всередині `constructor()` та метадані у `static`.
- [ ] **Data Architecture**: Немає жодних `fs.readFileSync` для бізнес-даних (лише DB-FS).
- [ ] **CLI**: `$ nan0db` запускається, сканує каталог, друкує статистику, слухає порт.
- [ ] **GET**: `curl http://localhost:2349/uk/index` повертає merged документ.
- [ ] **GET ?mode=get**: `curl "http://localhost:2349/uk/index?mode=get"` повертає raw документ без merge.
- [ ] **GET ?mode=browse**: `curl "http://localhost:2349/uk/blog?mode=browse&limit=10"` повертає список.
- [ ] **GET ?q=term**: `curl "http://localhost:2349/?q=привіт"` шукає усюди.
- [ ] **POST**: `curl -X POST -H "Content-Type: application/json" -d '{"title":"Hi"}' http://localhost:2349/test/doc` змінює в пам'яті.
- [ ] **PATCH /**: `curl -X PATCH http://localhost:2349/` зберігає всі зміни на диск.
- [ ] **DELETE**: `curl -X DELETE http://localhost:2349/test/doc` видаляє документ.
- [ ] **GET /_health**: `curl http://localhost:2349/_health` повертає статус.
- [ ] **Architecture Check**: Перевірено відсутність дублювання (прочитано `index.md`).
- [ ] **Zero extra deps**: `@nan0web/db-server` залежить тільки від `@nan0web/db-fs` та `node:http`.

## 🔮 Future Backlog (Наступні релізи)

### v3.4.0 — Vector Search Integration
- [ ] Інтеграція векторного пошуку через `@nan0web/ai`
- [ ] Embedding модель `nomic-embed` для локального індексування
- [ ] Cosine similarity ranking для результатів пошуку
- [ ] CLI: `--search-engine=vector --embedding-model=nomic`

### v3.5.0 — Semantic Search via LLM
- [ ] Реранжування результатів FTS/Vector через LLM prompt
- [ ] Delegated search: `?engine=@ai` → проксі до AI mount
- [ ] Natural language queries: "знайди документи про архітектуру монетизації"

### v3.6.0 — External Backend Drivers
- [ ] `PostgresDriver` — mount `@pg` для структурованих даних
- [ ] `MongoDriver` — mount `@mongo` для глибоко вкладених документів
- [ ] `RedisDriver` — mount `~` для сесій та кешу
- [ ] `ElasticDriver` — mount `@elastic` для production-scale пошуку

### v3.7.0 — Real-time Sync & WebSockets
- [ ] WebSocket endpoint `ws://localhost:2349/ws` для real-time оновлень
- [ ] Події `db.on('change')` → broadcast клієнтам
- [ ] Client SDK для підписки на зміни документів

### v3.8.0 — Authentication & Authorization
- [ ] API key authentication header `Authorization: Bearer <key>`
- [ ] Role-based access: read-only vs read-write mounts
- [ ] `@private/` mount з обов'язковою авторизацією
- [ ] Rate limiting per IP/key

### v3.9.0 — Backup & Snapshot
- [ ] `GET /_backup` — експорт усіх документів в JSONL
- [ ] `POST /_restore` — імпорт з JSONL файлу
- [ ] Snapshots: `PATCH /_snapshot` → збереження стану в пам'яті
- [ ] Rollback: `PATCH /_rollback/:snapshot_id`

### v4.0.0 — Multi-tenant & Clustering
- [ ] Multi-tenant mode: `--tenant <id>` ізоляція просторів імен
- [ ] Cluster mode: Redis-backed distributed cache
- [ ] Load balancing: health checks + sticky sessions
- [ ] Docker image + docker-compose template

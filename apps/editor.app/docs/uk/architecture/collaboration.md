# 🤝 Колаборація (Collaboration)

> Спільна робота над документами з контролем доступу та синхронізацією.

---

## Визначення

Колаборація — це здатність кількох користувачів працювати над одними й тими самими даними одночасно або асинхронно, з гарантією цілісності та відсутності конфліктів.

## Режими колаборації

### 1. Асинхронний (Staging + Review)
Основний режим для NaN•Web. Кожен користувач працює зі своїм стейджем:

```
User A → stageDb_A["_staged/doc.md"] → review → commit
User B → stageDb_B["_staged/doc.md"] → review → commit

Конфлікт? → Merge або Reject
```

### 2. Синхронний (Real-time Sync)
Для команд, що потребують миттєвої синхронізації (через `@nan0web/sync`):

```
User A types → CRDT event → Sync Server → User B sees changes
User B types → CRDT event → Sync Server → User A sees changes
```

### 3. Потоковий (Chat/Bot Integration)
Зміни надходять через чат-інтерфейс і автоматично стейджуються:

```
Bot: "User @moderator запропонував зміну до docs/faq.md"
Admin: "/approve"
Bot: "Зміну зафіксовано."
```

## Управління доступом

Доступ контролюється через `EditorConfig` та `EditorPermissions`:

```js
const config = new EditorConfig({ bundled: 1, publicWrite: 0 })
const permissions = config.resolvePermissions({
  isAuthenticated: true,
  roles: ['moderator']
})

permissions.canEdit    // true
permissions.canDelete  // false
permissions.canPublish // false (тільки admin)
```

## Аналоги

| Платформа | Режим | Синхронізація |
| :--- | :--- | :--- |
| **Google Docs** | Real-time | Серверна (OT) |
| **GitHub** | Async (PR) | Git-based |
| **Figma** | Real-time | CRDT |
| **NaN•Web** | Async + Sync + Chat | DB-FS + CRDT |

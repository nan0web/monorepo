# 📊 Матриця Можливостей (Capability Matrix)

> Порівняльний аналіз 12+ платформ та визначення цільових характеристик NaN•Web Editor.

---

## Повний порівняльний аналіз

| Система | Ключова можливість | Еквівалент NaN•Web | Категорія |
| :--- | :--- | :--- | :--- |
| **VS Code** | Extension API та Text Manipulation | Polymorphic Actions | Розширюваність |
| **Figma** | Multi-player та Design Graph | Recursive `ModalStack` | Колаборація |
| **WordPress** | Document Lifecycle та Metadata | `_.nan0` inheritance | Контент |
| **Odoo / ERP** | Model-as-Schema та Validation | `EditorModel` + `ModelAsApp` | Бізнес |
| **Antigravity** | Agentic Logic та Context | `SpecRunner` та Intent Parsing | AI |
| **GitHub** | Versioning та Staging | `Local Stage` (stageDb) | Версіонування |
| **Notion** | Block-based та Relational DB | Linked Documents (`$ref`) | Структура |
| **Airtable** | Relational Data as Spreadsheet | Model-as-App Forms | Дані |
| **Strapi** | Headless CMS та Content Types | DSN + DB-FS | API |
| **Webflow** | Visual Design to Code | UI-Lit Adapters | Дизайн |
| **Salesforce** | Object Management та CRM | Recursive Models + Alias | Корпоративне |
| **Google Docs** | Real-time Collaboration | Sync Protocol (CRDT) | Колаборація |

## Матриця режимів роботи

| Характеристика | Приватне | Публічне | Корпоративне | Спільне |
| :--- | :---: | :---: | :---: | :---: |
| **Авторизація** | Strict | Open | RBAC | Shared Token |
| **Зберігання** | Local FS | WebRoot | Cloud Storage | Sync DB |
| **Редагування** | Solo | Community | Workflow | Real-time |
| **Видимість** | Hidden | Searchable | Audit-only | Group |
| **Стейджинг** | Local only | PR-based | Approval chain | Live |
| **DSN** | `fs:./data` | `webroot:./public` | `s3:company-bucket/` | `sync:room-id` |

## Матриця інтерфейсів

| Інтерфейс | Контекст | Швидкість | Багатство UX | Автономність |
| :--- | :--- | :---: | :---: | :---: |
| **CLI** | Сервер, SSH, CI/CD | ⚡⚡⚡ | ⭐ | ⭐⭐⭐ |
| **Web** | Браузер, Десктоп | ⚡⚡ | ⭐⭐⭐ | ⭐⭐ |
| **Chat** | Telegram, Discord | ⚡⚡ | ⭐⭐ | ⭐⭐ |
| **Voice** | Телефон, IoT | ⚡⚡⚡ | ⭐ | ⭐⭐⭐ |
| **Robot** | Склад, Фабрика | ⚡⚡⚡ | — | ⭐⭐⭐ |
| **Mobile** | Смартфон, Планшет | ⚡ | ⭐⭐⭐ | ⭐⭐ |

## Цільова позиція NaN•Web

NaN•Web прагне зайняти унікальну нішу:
- **Суверенність Obsidian** (локальні файли, повний контроль).
- **Розширюваність VS Code** (реєстр додатків та дій).
- **Простота WordPress** (будь-хто може редагувати контент).
- **Валідація Odoo** (модель визначає правила).
- **Поліморфізм Salesforce** (одна логіка — будь-який UI).
- **Агентність Antigravity** (AI-driven сценарії через SpecRunner).

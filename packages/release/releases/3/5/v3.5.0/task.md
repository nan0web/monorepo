# PMaC (Project Management as Code) — Специфікація та Шаблон Завдання

> **Цільовий пакет:** `@nan0web/release`  
> **Контекст розробки:** Реалізація уніфікованої моделі `ReleaseModel`, дочірніх моделей та безшовного AST-парсера Markdown на базі `@nan0web/markdown` без коментарів-маркерів та без технічного сміття.

---

## 1. Архітектурні Контракти та Принципи

1. **Єдине Джерело Правди (Single Source of Truth):**
   - Версія (`version`) та Назва (`title`) зчитуються з заголовка `# H1`:  
     `# v0.1.0 — Назва релізу або задачі`
   - ID релізу = нормалізована версія (наприклад, `v0.1.0`). Жодних зайвих штучних ID у frontmatter.
2. **Розпізнавання Секцій (Clean Markdown without Comment Hacks):**
   - Жодних коментарів на кшталт `<!-- section:* -->`.
   - Розпізнавання відбувається через словник синонімів (`SECTIONS` у `ReleaseModel`), з підтримкою нормалізації (очищення емодзі, нижній регістр, trim) та можливістю розширення мов через `ReleaseModel.addLocaleSections(map)`.
3. **Зовнішні Трекери (Jira, Linear, GitHub Issues):**
   - Шаблон трекера задається у frontmatter або конфігурації:  
     `tracker: "https://github.com/nan0web/nan.web/issues/{id}"`
   - У задачах/заголовках використовується стислий ID: `[#142]`, `[142]`, `[PROJ-1042]`.
4. **Суворі Станданти Моделей (@nan0web/types):**
   - Статуси: `'todo' | 'work' | 'done' | 'fail'`.
   - Значення за замовчуванням: `default: []`, `default: {}` (без функціональних обгорток).
   - Присутнє поле `type`: `'major' | 'minor' | 'patch' | 'hotfix' | 'chore'`.

---

## 2. Еталонний Шаблон Markdown (`release.md` / `task.md`)

```markdown
---
status: work
type: minor
epic: EPIC-CORE-42
sprint: Sprint 42
tracker: https://github.com/nan0web/nan.web/issues/{id}
---

# v0.1.0 — Core Release Engine & Payload CMS Plugin Integration

## Опис та Мета
Плагін @nan0web/payload-release для Payload CMS 3.x, що забезпечує автоматичну фіксацію запусків релізів, контроль версій, вбудований журнал аудиту та перегляд специфікацій.

## Команда
- **Lead / Architect:** Олександр Снігірьов (@snigirev)
- **AI Lead Developer:** Agent Antigravity (@agy)
- **Auditor:** Security Bot (@sec-bot)

## Робочий План та Задачі

### 1. Архітектурна ізоляція моделей [#101]
- [x] [#101-1] Винести базову модель ReleaseModel у пакет @nan0web/release
- [x] [#101-2] Реалізувати уніфікований AST-парсер специфікацій на базі @nan0web/markdown
- [ ] [#101-3] Забезпечити 100% покриття контрактними тестами

### 2. Payload CMS Адаптер [#102]
- [x] [#102-1] Реалізувати колекцію releases з табами
- [x] [#102-2] Суворий Read-Only доступ для адмінки
- [ ] [#102-3] Перегляд вмісту специфікацій через модальне вікно

## Критерії Прийнятності
- [x] Колекція релізів монтується з zero-config: payloadRelease()
- [x] Заборонено редагування та створення релізів через форму CMS
- [ ] Тестовий люкс проходить успішно без регресій

## Аудит та Паритет Даних
| Колекція | Очікувано | Фактично | Статус | Коментар |
| :--- | :---: | :---: | :---: | :--- |
| `users` | 12 | 12 | ✅ OK | Синхронізовано |
| `releases` | 1 | 1 | ✅ OK | Вбудований реліз v0.1.0 присутній |
| `media` | 45 | 44 | ⚠️ Mismatch | Відсутній аватар для demo |

## Зауваження та Ризики
- **[WARN-001]** (Performance) Файли розміром > 2MB не повинні відкриватися у текстовому Markdown модалі без пагінації.
  - Джерело: `@nan0web/payload-release/admin.jsx:L85`
- **[INFO-002]** (Environment) Node.js v20.x є мінімально підтримуваною версією.

## Артефакти
| Файл | Розмір | SHA-256 | Тип |
| :--- | :---: | :--- | :--- |
| `task.md` | 6.0 KB | `e3b0c442...` | ТЗ / Специфікація |
| `user.md` | 5.7 KB | `5e884898...` | Метрики / Лог |
```

---

## 3. Схема Моделей (Model-as-Schema) для `@nan0web/release`

```javascript
import { Model } from '@nan0web/types'

export class ReleaseTaskModel extends Model {
  static id = { type: 'string', required: true }
  static title = { type: 'string', required: true }
  static status = { type: 'string', default: 'todo' } // 'todo' | 'work' | 'done' | 'fail'
  static assignee = { type: 'string' }
  static estimateHours = { type: 'number' }
  static spentHours = { type: 'number' }
  static notes = { type: 'string' }
}

export class ReleaseParityModel extends Model {
  static collection = { type: 'string', required: true }
  static expected = { type: 'number', required: true }
  static actual = { type: 'number', required: true }
  static synced = { type: 'boolean', default: true }
  static comment = { type: 'string' }
}

export class ReleaseIssueModel extends Model {
  static level = { type: 'string', default: 'warning' } // 'error' | 'warning' | 'info'
  static code = { type: 'string' }
  static message = { type: 'string', required: true }
  static source = { type: 'string' }
  static file = { type: 'string' }
}

export class ReleaseModel extends Model {
  static version = { type: 'string', required: true }
  static title = { type: 'string', required: true }
  static status = { type: 'string', default: 'todo' } // 'todo' | 'work' | 'done' | 'fail'
  static type = { type: 'string', default: 'minor' } // 'major' | 'minor' | 'patch' | 'hotfix' | 'chore'
  static summary = { type: 'string' }
  static epic = { type: 'string' }
  static sprint = { type: 'string' }
  static tracker = { type: 'string' }

  // Суб-колекції
  static tasks = { type: 'array', itemType: ReleaseTaskModel, default: [] }
  static parity = { type: 'array', itemType: ReleaseParityModel, default: [] }
  static issues = { type: 'array', itemType: ReleaseIssueModel, default: [] }
  static files = { type: 'array', default: [] }
  static meta = { type: 'object', default: {} }

  static SECTIONS = {
    summary: ['summary', 'objective', 'опис', 'мета', 'ціль', 'description'],
    team: ['team', 'команда', 'учасники', 'members', 'contributors'],
    tasks: ['tasks', 'scope', 'план', 'задачі', 'робочий план', 'wbs'],
    criteria: ['acceptance', 'dod', 'критерії', 'критерії прийнятності', 'вимоги'],
    parity: ['parity', 'паритет', 'аудит', 'data parity', 'верифікація'],
    issues: ['issues', 'risks', 'ризики', 'зауваження', 'блокери', 'проблеми'],
    artifacts: ['artifacts', 'артефакти', 'файли', 'files', 'provenance'],
  }

  static addLocaleSections(localeMap) {
    for (const [section, words] of Object.entries(localeMap)) {
      if (this.SECTIONS[section]) {
        this.SECTIONS[section].push(...words)
      }
    }
  }
}
```

---

## 4. План Виконання в `@nan0web/release` (Scope of Work)

- [x] **1. Моделі:** Створити `ReleaseModel.js`, `ReleaseTaskModel.js`, `ReleaseParityModel.js`, `ReleaseIssueModel.js` у `src/domain/models/`.
- [x] **2. AST Парсер (`PMaCParser`):** Реалізувати читання специфікації через `@nan0web/markdown` AST (H1 -> version + title, H2 -> секції за аліасами, H3/списки -> задачі).
- [x] **3. Трекери:** Автоматичне розгортання ID трекерів (`[#142]` -> URL) на основі шаблону `tracker`.
- [x] **4. Тести:** 100% покриття юніт- та контрактними тестами на реальних markdown-файлах з різними мовами (UK, EN).
- [x] **5. Експорт:** Оновити `src/index.js` та `package.json` exports.

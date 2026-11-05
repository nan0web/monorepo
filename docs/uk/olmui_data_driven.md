# Парадигма OLMUI (One Logic — Multiple User Interfaces) через Data-Driven

> **Статус:** Архітектурний стандарт платформи NaN0Web  
> **Область дії:** Всі UI-інтерфейси (CLI / Terminal, Web / React, Chat, REST / MCP)

---

## 1. Головний Принцип: Документ як Джерело Правди

Традиційна розробка створює окрему логіку роутингу для вебу (Next.js App Router, React Router) та окрему парсинг-логіку для CLI-аргументів (`yargs`, `commander`).  
У філософії **OLMUI (One Logic — Multiple User Interfaces)**:

1. **Єдина бізнес-модель:** Вся логіка зосереджена у `Model` / `ModelAsApp`.
2. **Data-Driven роутинг:** Будь-який екран або команда — це стан бізнес-документа у віртуальній базі даних `@nan0web/db`.
3. **URL / URI — це шлях до документа або проекція виклику:**
   - Веб-запит: `GET /releases/3/7/v3.7.0/task.md` (або `/releases/list/`)
   - Термінальний виклик: `nan0release 3.7.0` (або `nan0release list`)
   - Агентський виклик: `read_resource uri="db://releases/3/7/v3.7.0/task.md"`

---

## 2. Мапування URI у Команди Терміналу та Веб-Екрани

Сегменти URI автоматично розбиваються на ієрархію команд та ресурсів:

```text
URI / Шлях до Ресурсу           | Термінальна Команда (CLI)      | Веб / Чат Представлення (UI)
-------------------------------|--------------------------------|-----------------------------
releases/list                  | nan0release list               | Таблиця / Каталог релізів
releases/list.yaml             | nan0release list --json/--yaml | Схема списку / REST ендпоінт
releases/3/7/v3.7.0/task.md    | nan0release view 3.7.0         | Картка релізу з чеклистом
releases/check/rules           | nan0release check --rules      | Довідник правил валідатора
```

---

## 3. Варіанти Опису Компонентів (Data-Driven Component Manifest)

Якщо команда або екран списку описується через документ (наприклад, `releases/list.yaml` або декларативний `$content` вітрини `index.nan0`), як саме інтерфейси розуміють, що рендерити?

### Варіант А: Декларативний маніфест компонентів (Component Manifest)
У документі `list.yaml` (або `list.nan0`) описується тип представлення та джерело даних:

```yaml
# releases/list.yaml
type: collection
component: ReleaseTable
title: PM-as-Code Releases
source:
  model: ReleaseModel
  query:
    path: "releases/**/v*"
    sort: "semver:desc"
columns:
  - key: version
    label: Версія
    format: semver
  - key: status
    label: Статус
    badge: true
  - key: tasks
    label: Задачі
    format: "done/total"
actions:
  - name: view
    command: "nan0release view {version}"
    url: "/releases/{version}"
```

**Як це рендериться:**
- **У Терміналі (CLI):** OLMUI формує ASCII/ANSI таблицю через `@nan0web/ui-cli` з активними діями або швидким переходом.
- **У Вебі (React / Next.js):** Рендериться «дурний» UI-компонент `<ReleaseTable />`, який просто отримує цей JSON-маніфест і малює дизайн-систему без хардкоду бізнес-правил.
- **В Агентському чаті:** Генерується Markdown-таблиця зі статусами.

---

### Варіант Б: Model-as-App з динамічними проекціями (Intent-Driven)
Команда повертає потік генератора `Intent` (`show`, `progress`, `result`):

```javascript
export class ListCommand extends ModelAsApp {
  async *run() {
    // CLI отримує ANSI таблицю
    // Web отримує об'єкт проекції з метаданими стовпчиків
    return result({
      type: 'table',
      schema: ReleaseListSchema,
      data: releases
    })
  }
}
```

---

### Варіант В: Файлова конвенція та автоматична ієрархія (File-System Driven)
Будь-який файл чи каталог за адресою `<root>/releases/` автоматично мапиться у дерево команд:
- Каталог `releases/` -> субкоманда `release` або утиліта `nan0release`.
- Підкаталог `backlog/` -> субкоманда `nan0release backlog [task]`.
- Наявність `index.nan0` -> замовчуване представлення (Overview).
- Наявність `task.md` -> паспорт завдань.

Цей підхід усуває необхідність ручної реєстрації кожного нового екрану чи CLI команди: створення валідного markdown або YAML файлу в репозиторії автоматично створює новий інтерфейсний маршрут як у вебі, так і в консолі.

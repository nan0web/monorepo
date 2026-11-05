# Каскадна Конфігурація Платформи (Layered Configuration)

> **Статус:** Архітектурний стандарт монорепозиторію  
> **Область дії:** Усі CLI-інструменти, пакети та додатки платформи NaN0Web

---

## 1. Концепція та Філософія

У розподіленій монорепозиторії налаштування не можуть бути жорстко зашиті в коді або залежати лише від локальних файлів.  
За основу взято світовий досвід (Twelve-Factor App, ESLint Flat Config, Cargo, Viper, Git config) та стандартизовано **4-Рівневу Каскадну Модель Конфігурації (The 4-Tier Layered Configuration)**.

Кожен параметр дозволу (наприклад, `releasesDir`, `rules`, `dbUri`, тощо) обчислюється шляхом послідовного злиття шарів: від найширшого (дефолти) до найбільш специфічного (CLI-виклики інженера).

---

## 2. Ієрархія Пріоритетів (Cascade Hierarchy)

```text
 1. 🥇 CLI Аргументи та Прапорці (--releases-dir=..., --rules, --config=...)  [Пріоритет 9: Найвищий]
 2. 🥈 Змінні Оточення (RELEASE_DIR, NAN0_CONFIG, CI=true)                     [Пріоритет 6: Runtime / CI]
 3. 🥉 Конфігураційні Файли (Project -> Repo Root -> User Global)            [Пріоритет 3: Персистентний]
 4. 🏅 Канонічні Замовчувані Константи (в коді Model-as-Schema)                [Пріоритет 0: Базовий шар]
```

### Деталізація шарів:

### Шар 0: Замовчувані Константи (Defaults [Пріоритет 0])
- Визначаються у статичних схемах моделей на базі `@nan0web/types` (`Model-as-Schema`).
- Забезпечують принцип **Zero-Config First**: інструмент працює з коробки без жодного файлу налаштувань.
- Приклад: `releasesDir = 'releases'`, `rules.misplaced_backlog = 'warning'`.

### Шар 1: Глобальні Налаштування Інженера (Global User Config [Пріоритет 3.1])
- Розташування: `~/.nan0web/<tool>/config.{nan0,yaml,js,json}`
- Персональні вподобання інженера для всієї машини (наприклад, рівні суворості аудиту, персональні токени, локальні темплейти).

### Шар 2: Конфігурація Монорепозиторію (Repo Root Config [Пріоритет 3.2])
- Розташування: `<repo_root>/<tool>.config.{nan0,yaml,js,json}` або `<repo_root>/nan0web.config.{nan0,yaml}`
- Загальні корпоративні/архітектурні правила для всіх пакетів та застосунків проєкту.

### Шар 3: Локальна Конфігурація Пакета / Додатка (Package Config [Пріоритет 3.3])
- Розташування: `<target_dir>/<tool>.config.{nan0,yaml,js,json}` або секція `"<tool>"` у `<target_dir>/package.json`.
- Перевизначає правила репо-рівня для конкретного сервісу (наприклад, інший шлях до релізів для специфічного 3rdparty-проєкту).

### Шар 4: Змінні Оточення (Environment Variables [Пріоритет 6])
- Використовуються в CI/CD пайплайнах, Docker-контейнерах та хмарних раннерах.
- Приклад: `RELEASE_DIR=.custom_releases`, `NAN0_ENV=production`.

### Шар 5: Явні CLI Прапорці (CLI Flags [Пріоритет 9])
- Одноразовий ручний виклик користувача в терміналі. Перевизначає будь-які попередні шари.
- Приклад: `nan0release check --releases-dir=.releases --rules`.

---

## 3. Алгоритм зчитування через `@nan0web/db`

Для підтримки віртуалізації, In-Memory тестування та відмови від прямого процедурного `fs`, резолв конфігураційних файлів виконується через адаптер бази даних:

```javascript
// Злиття конфігурацій (глибокий merge)
let mergedConfig = {}
mergedConfig = merge(mergedConfig, defaults)
mergedConfig = merge(mergedConfig, await loadUserConfig(db))
mergedConfig = merge(mergedConfig, await loadRepoRootConfig(db))
mergedConfig = merge(mergedConfig, await loadPackageConfig(db, targetDir))
mergedConfig = merge(mergedConfig, readEnv())
mergedConfig = merge(mergedConfig, cliOverrides)
```

Такий підхід гарантує абсолютну передбачуваність та простоту дебагу поведінки інструментів.

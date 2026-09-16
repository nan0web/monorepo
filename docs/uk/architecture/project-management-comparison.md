# 📊 Архітектурний Порівняльний Аналіз: Jira/Enterprise PM vs @nan0web/release

> **Документ:** Аналіз відповідності функціоналу Project Management as Code (PM-as-Code)  
> **Статус:** 🟢 Діючий стандарт екосистеми NaN0Web

---

## 🏛 1. Порівняльна Таблиця за Розділами Project Management

| Розділ PM | Jira / Enterprise PM | `@nan0web/release` (PM-as-Code) | Реалізація та Статус у NaN0Web |
| :--- | :--- | :--- | :--- |
| **1. Управління Вимогами та Скоупом (Scope Management)** |
| • Загальний беклог ідей | Jira Backlog / Boards | `releases/backlog.md` | 🟢 Шаблон у `docs/uk/templates/backlog.md` |
| • Деталізація задачі | User Stories у Issue | User Stories з ролями (Admin/Client/Dev) у `release.md` | 🟢 Секція `User Stories & Ролі` |
| • Запобігання розмиттю скоупу (Scope Creep) | Ручний контроль ліда | **Zero-Trust Git Diff**: список `Target Files` звіряється з `git diff` | 🟢 Воркфлоу `git-reviewer.md` |
| **2. Трекінг Часу, Ітерацій та Ресурсів (Time & Resource Tracking)** |
| • Облік робочого часу | Worklog / Tempo Timesheets | `user.md` (поле `Витрачений час`) + `@nan0web/telemetry` | 🟡 Розширення CLI `nan0release time` |
| • Кількість ітерацій та спроб | Jira Sprint Burndown | Кількість запусків тестів `node:test` + лог комітів | 🟢 Фіксація в `user.md` |
| • Витрати на AI/LLM ресурси | Відсутнє в Jira | Підрахунок спожитих токенів та викликів моделей | 🟢 АрхіТехноМаг Meter Protocol |
| **3. Контроль Якості та Прийомка (Quality & DoD)** |
| • Критерії прийомки (Acceptance Criteria) | Текстові чек-листи | **Контрактні тести (`*.spec.js`)**: 100% математичний доказ | 🟢 TDD First / In-Memory DB |
| • Інтегральна готовність релізу | Суб'єктивна оцінка PM | **RRS (Release Readiness Score ≥ 324)** | 🟢 Вбудовано в `Release.js` / CLI |
| • Збереження досвіду від багів | Confluence Post-Mortem | **Append-only `user.md` / `retro.md`** | 🟢 Запечатування через `release seal` |
| • Регресійний контроль | Ручні регресійні плани | **Авто-конверсія:** закриті `spec.js` мігрують у `src/releases/*.test.js` | 🟢 Команда `release close` |
| **4. Крос-Проєктний Огляд та Дашборди (Portfolio Management)** |
| • Портфоліо проєктів / Executive View | Jira Portfolio / Advanced Roadmaps | **`release.app` Dashboard** або єдиний CLI-сканер (`ReleaseDB`) | 🟡 Підключення через OLMUI Web |
| • Стан релізів монорепо | Зовнішні плагіни | JSONL дашборд (`.datasets/releases.jsonl`) | 🟢 Готовий парсер `ReleaseDB.js` |
| **5. Інфраструктура та Командна Взаємодія (Infrastructure & Collaboration)** |
| • Хостинг репозиторіїв та ліміти | GitHub/GitLab (ліміти на безкоштовні місця) | **Автономний Git-сервер (Gitea / Forgejo / P2P)** | 🟡 Автономний self-hosted вузол |
| • Погодження та авторство | Кнопка "Approve" в UI | **Криптографічний підпис (GPG / `Person.js`)** | 🟢 Класи `Person`, `Team` |
| • CI/CD та публікація | Складні GitHub Actions | CLI команди: `validate` -> `seal` -> `publish` | 🟢 Вбудовано в `ReleaseManager.js` |

---

## 🛠 2. Нові Можливості для Беклогу `@nan0web/release`

1. **`nan0release track`**: Автоматичний таймер/лічильник часу виконання активної задачі на основі Git-сесій.
2. **`nan0release dashboard` (OLMUI Web)**: Єдине вікно для навігації по всіх додатках (`apps/*`) та пакетах (`packages/*`) монорепозиторію з відображенням:
   - Активних релізів
   - Кількість зелених/червоних контрактів
   - RRS балів кожного проєкту
3. **Автономний Git-стек**: Підтримка легковажного локального Gitea/Forgejo інстансу для роботи команд будь-якого розміру без прив'язки до платної підписки GitHub.

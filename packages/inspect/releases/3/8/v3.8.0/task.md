---
version: 3.8.0
type: feature
status: active
locale: uk
models:
  - packages/inspect/types/domain/app/js/JsDomainAuditor.d.ts
  - packages/inspect/types/domain/app/InspectorApp.d.ts
---

# 🚀 Mission: Model-as-Schema Field Validator & Auditors Catalog CLI (v3.8.0)

## 🏁 Overview (Огляд)

Підсилення інструментів контролю архітектурної якості монорепозиторію в `@nan0web/inspect`:

1. **Каталог Інспекторів у CLI (`list` / `ls` / `--help`)**:
   - Надання чіткої команди або підкоманди `nan0inspect list` (або `ls`), яка виводить таблицю/список усіх зареєстрованих аудиторів, їхні аліаси та призначення.
   - Відображення довідки з описом того, за який шар або аспект архітектури відповідає кожен аудитор (Domain, Architecture, Hygiene, Verification, Export, Phase тощо).

2. **Детермінована валідація полів у `Model-as-Schema` (`JsDomainAuditor`)**:
   - Перевірка відповідності між оголошеними статичними полями схеми моделі (`static field = { ... }`) та їх декларацією в `constructor` (`/** @type {...} */ this.field`).
   - **Суворий білий список винятків (Skip List)**:
     - Будь-які службові статичні поля, що починаються з префікса `$` (`$alias`, `$collection`, `$title`, `$description` тощо).
     - Будь-які статичні константи, словники чи підмоделі, названі з великої літери (UPPERCASE або PascalCase, наприклад `UI`, `SCHEMA`, `MESSAGES`, `SubModel` тощо).
     - Системний аліас `alias`.
   - Будь-яке інше статичне поле схеми (camelCase / snake_case) обов'язково має мати відповідний JSDoc-рядок `/** @type */ this.fieldName` всередині `constructor`.
   - Заборона полів класу поза конструктором (`class Field`).

3. **Захист від сирого Node.js для LLM-агентів**:
   - Детермінована перевірка виконується за мілісекунди без залучення сторонніх LLM.
   - Надає агенту чітку вказівку на файл, номер рядка та ім'я пропущеного поля для виправлення за один прохід.

---

## 👥 User Stories (Сценарії)

> **Як Архітектор платформи**, я хочу переглядати всі доступні аудитори командою `nan0inspect list` або в `--help`, щоб бачити повну картину архітектурного контролю і розуміти відповідальність кожного інспектора.  
> **Як ШІ-агент (АрхіТехноМаг)**, я хочу запустити `nan0inspect domain` і отримати точну вказівку на поля схеми, не задекларовані в конструкторі, щоб автоматично генерувати 100% чистий код Model-as-Schema v2 без звичайних процедурних звичок Node.js.  
> **Як Розробник**, я хочу, щоб системні поля (`$*`, `UI`, класи/словники) не вимагали фіктивної ініціалізації в конструкторі, зберігаючи семантичну чистоту моделей.

---

## 🏗 Data-Driven Architecture (Моделювання)

### Першочергові контракти:
- `packages/inspect/releases/3/8/v3.8.0/task.spec.js`
- `packages/inspect/src/domain/app/js/JsDomainAuditor.js`
- `packages/inspect/src/domain/app/InspectorApp.js`

### Цільові файли (Scope Boundary):
1. **Реліз та контракти:**
   - `packages/inspect/releases/3/8/v3.8.0/task.md`
   - `packages/inspect/releases/3/8/v3.8.0/user.md`
   - `packages/inspect/releases/3/8/v3.8.0/task.spec.js`
2. **Доменна логіка:**
   - `packages/inspect/src/domain/app/js/JsDomainAuditor.js`
   - `packages/inspect/src/domain/app/DomainAuditor.js`
   - `packages/inspect/src/domain/app/InspectorApp.js`
3. **Документація та воркфлоу:**
   - `docs/uk/workflows/inspect-models.md`

---

## 🎯 Scope (Задачі релізу)

- [x] **§1 Контрактне тестування (TDD Red):**
  - Створити `releases/3/8/v3.8.0/task.spec.js` з детальними тестами:
    - Валідація статичних полів проти `constructor` у `JsDomainAuditor`.
    - Коректне пропускання полів з `$` (`$alias`, `$collection`).
    - Коректне пропускання полів з великої літери (`UI`, `SCHEMA`, `CONST`).
    - Реєстрація та вивід списку аудиторів у `InspectorApp` (`nan0inspect list`).
- [x] **§2 Реалізація перевірки полів схеми в `JsDomainAuditor`:**
  - Збір `static [name] = { ... }`.
  - Відкидання винятків (`$*`, `[A-Z]*`, `alias`).
  - Перевірка наявності `/** @type */ this.[name]` в тілі `constructor`.
  - Формування помилки `missing_constructor_field` з файлом і рядком.
- [x] **§3 Реалізація команди `list` / `ls` у `InspectorApp`:**
  - Додавання підкоманди списку аудиторів з описом їх призначення та аліасів.
- [x] **§4 Оновлення документації та воркфлоу агента:**
  - Синхронізація `docs/uk/workflows/inspect-models.md` з новими правилами.

---

## ✅ Acceptance Criteria (Definition of Done)

1. **Повний TDD Green:** Усі контрактні тести в `releases/3/8/v3.8.0/task.spec.js` успішно проходять (`pass`).
2. **Нуль помилкових спрацьовувань:** Поля `$*` та `UI`/UPPERCASE ігноруються аудитором.
3. **Список аудиторів:** Команда `list` виводить повний каталог інспекторів з описами.
4. **Регресія збережена:** `pnpm test` та існуючі тести монорепозиторію проходять чисто.

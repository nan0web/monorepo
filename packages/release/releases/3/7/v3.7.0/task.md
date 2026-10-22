---
version: 3.7.0
type: minor
status: done
locale: uk
models:
  - ReleaseConfig
  - ReleaseAuditor
  - ListCommand
  - Scanner
---

# 🚀 Release v3.7.0: Layered ReleaseConfig, Backlog Integrity & Smart OLMUI List

## 🏁 Overview (Огляд)

Реліз фокусується на впровадженні багаторівневої каскадної конфігурації `ReleaseConfig`, захисту цілісності беклогу та модернізації списку релізів у CLI (`nan0release list`):

1. **Каскадна конфігурація `ReleaseConfig` (Layered Configuration)**:
   - Впровадження конфігураційної моделі за зразком `InspectConfig` з 4 рівнями пріоритету:
     1. CLI аргументи (`--releases-dir`, `--rules`) [Пріоритет 9]
     2. Змінні оточення (`RELEASE_DIR`, `RELEASE_CONFIG`) [Пріоритет 6]
     3. Файли налаштувань (`release.config.{nan0,yaml,js}`, `~/.nan0web/release/config`) [Пріоритет 3]
     4. Замовчувані константи (`releases/`) [Пріоритет 0]
   - Підтримка перевизначення директорії релізів `releasesDir`.

2. **Захист цілісності беклогу (`MISPLACED_BACKLOG`)**:
   - Правило: глобальний беклог дозволений виключно в корені каталогу релізів (`<releasesDir>/backlog.md`).
   - Будь-який `backlog.md` усередині версійного каталогу `releases/**/vX.Y.Z/backlog.md` реєструється аудитором як порушення `MISPLACED_BACKLOG`.
   - Рівень суворості налаштовується в конфігурації (`warning` за замовчуванням, або `error`).

3. **Модернізація `nan0release list` (OLMUI Smart Scanner)**:
   - Виявлення релізів не лише за наявністю `.spec.js`, а за повноцінною тріадою версій (`vX.Y.Z`, `task.md`, `release.md`, `user.md`).
   - Сортування за SemVer (найновіші зверху).
   - Інформативний вивід версій зі статусом (WIP / Closed / Planning).

4. **Інспекція правил (`--rules` / `rules`)**:
   - Можливість перегляду каталогу діагностичних правил `ReleaseAuditor.UI.Diagnostics` у зручному табличному форматі.

---

## 👥 User Stories (Сценарії)

- **US-1 (Каскадний конфіг):** Як розробник, я можу задати `releasesDir: .releases` у `release.config.nan0` або через прапорець `--releases-dir`, і всі команди `list`, `check`, `validate` працюють із цим каталогом.
- **US-2 (Захист беклогу):** Як архітектор, я хочу бачити чітке попередження або блокуючу помилку `MISPLACED_BACKLOG`, якщо агент чи розробник випадково поклав `backlog.md` усередину `v3.7.0/`, замість канонічного `task.md`.
- **US-3 (Зручний список у CLI):** Як користувач, коли я виконую `nan0release list` у корені монорепозиторію або в пакеті, я бачу всі існуючі версії, а не порожній екран.
- **US-4 (Каталог правил):** Як користувач, я можу виконати `nan0release check --rules` і побачити повний список перевірок та інструкцій щодо виправлення.

---

## 🎯 Target Files

- `packages/release/src/domain/config/ReleaseConfig.js`
- `packages/release/src/domain/inspect/ReleaseAuditor.js`
- `packages/release/src/domain/CheckCommand.js`
- `packages/release/src/domain/ListCommand.js`
- `packages/release/src/Release/Scanner.js`
- `packages/release/docs/uk/architecture.md`
- `docs/uk/config.md`
- `docs/uk/olmui_data_driven.md`
- `packages/release/releases/3/7/v3.7.0/task.spec.js`

---

## 📋 Завдання (Tasks)

- [x] [task-1] Реалізувати `ReleaseConfig.js` (модель налаштувань, каскадне зчитування з `db`, підтримка `releasesDir` та рівнів `rules`).
- [x] [task-2] Додати діагностичне правило `MISPLACED_BACKLOG` у `ReleaseAuditor.js` та синхронізувати з `CheckCommand.js`.
- [x] [task-3] Оновити `Scanner.js` та `ListCommand.js` для повноцінного виявлення релізів за директоріями версій та структурованого виводу.
- [x] [task-4] Додати підтримку перегляду списку правил `--rules` у `CheckCommand.js` / `ReleaseAuditor.js`.
- [x] [task-5] Написати TDD контрактні тести у `releases/3/7/v3.7.0/task.spec.js` та досягти 100% Green.
- [x] [task-6] Верифікувати повний набір тестів `pnpm test` та готовність до релізу.

---

## ⚖️ Acceptance Criteria (Критерії Прийнятності)

1. `ReleaseAuditor` повертає діагностику `MISPLACED_BACKLOG` (рівень `warning` або `error` за конфігом) при знаходженні `backlog.md` у каталозі версії.
2. Файл `releases/backlog.md` у корені каталогу релізів є 100% легітимним і не викликає зауважень.
3. `Scanner.status()` знаходить версії в проєктах незалежно від наявності тестових файлів, базуючись на версійних каталогах `vX.Y.Z`.
4. `ReleaseConfig.load(db, dir)` коректно об'єднує дефолти, конфігураційні файли та CLI параметри.
5. Усі контрактні тести в `releases/3/7/v3.7.0/task.spec.js` успішно проходять (`pass`).

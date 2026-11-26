---
version: 3.8.0
type: minor
status: planned
locale: uk
models: ["TaskModel", "SwiftBarAdapter", "TrayCommand"]
---

# 🚀 Mission: Wave 3 — Enterprise Parallel Telemetry & SwiftBar Control Center (v3.8.0)

## 🏁 Overview (Огляд)
Масштабувати існуючий `SwiftBarAdapter` + `TrayCommand` (`@nan0web/release`) та `apps/release.app` у центр керування паралельним пулом задач (10–20 одночасних агентів на день) із живим контролем прогресу `%`, витрачених токенів, вартості (`$`) та ізоляцією робочих дерев.

## 👥 User Stories (Сценарії)
- **Story 1:** Як техлід/архітектор, я запускаю пул із 20 денних задач паралельно і бачу в SwiftBar живий рядок `▶ 6/20 (30%) • $2.15 • 640k tok` та деталі по кожній задачі.
- **Story 2:** Як агент у паралельному воркфлоу, я оновлюю статус і телеметрію своєї задачі (крок `4/7`, токени, вартість, статус `gate`) у її ізольованому файлі стану без конфліктів із сусідніми агентами.
- **Story 3:** Як оператор, я клікаю в SwiftBar по задачі в роботі й миттєво відкриваю її лог, `task.md` або робочий проєкт в IDE.

## 🎯 Target Files
- `packages/release/src/domain/Task/TaskModel.js`
- `packages/release/src/adapters/SwiftBarAdapter.js`
- `packages/release/src/domain/TrayCommand.js`
- `packages/release/src/domain/BatchCommand.js` (`[NEW]`)
- `apps/release.app/src/domain/Dashboard/DashboardModel.js`

## 📋 Завдання (Tasks)
- [x] [wave3-telemetry-model] Розширити `TaskModel` та парсер метрик `user.md`/run-state полями `agent`, `model`, `tokensIn`, `tokensOut`, `costUsd`, `step`, `gate`.
- [x] [wave3-swiftbar-ui] Оновити `SwiftBarAdapter.renderHeader` і `renderTaskItem` для показу денного `%` виконання, сумарних токенів, вартості `$`, активної моделі та посилання на лог/IDE.
- [x] [wave3-parallel-lock] Додати перевірку конфліктів `targetFiles` та підтримку `git worktree` ізоляції у `BatchCommand` / `TrayCommand` для паралельного запуску до 10–20 задач.
- [x] [wave3-dashboard-sync] Синхронізувати агрегацію токенів та вартості в `apps/release.app` (`DashboardModel` + CLI/Web вивід).

## ⚖️ Критерії Прийнятності (Acceptance Criteria)
1. `TaskModel` валідує та зберігає телеметрію запуску (`tokensIn`, `tokensOut`, `costUsd`, `agent`, `step`, `gate`).
2. `SwiftBarAdapter.render()` відображає агрегований прогрес `%`, сумарні токени й `$` у заголовку та деталі кожної задачі в меню без ламання pipe-екранування.
3. Детектор конфліктів попереджає або блокує одночасний запуск двох задач із перетином `targetFiles` в одному worktree.
4. `DashboardModel` у `apps/release.app` включає денний зріз витрат токенів і `$`.
5. Усі юніт- та story-тести `@nan0web/release` і `apps/release.app` проходять.

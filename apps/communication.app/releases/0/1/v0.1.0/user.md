---
version: "0.1.0"
package: "@nan0web/communication.app"
locale: "uk"
status: "in-progress"
---

# Журнал виконання релізу v0.1.0

## Метрики Виконання

| Метрика | Значення |
| :--- | :--- |
| Ітерація | 4 (Фідбек Архітектора: Варіант А — Закон Однини `partner`/`service`, зовнішній конфіг кіл через `index`, тур Першого Дня `docs/uk/tour/01/` із `--dry-run`, бінарна Рада Мудреців `{0, 1}`) |
| Активні контракти | 13 pass / 0 fail, 2 `it.todo` (`task.spec.js`) |
| Статус перевірок | `release:spec` (Green: 10/10) |

## Журнал рішень та фідбеку (Append-Only)

- **2026-11-20 (Ітерація 1):** Старт реалізації `v0.1.0` з першого живого діалогу (`7i/` + `ChatRepoModel` + `crystallize`) за протоколом TDD Red → Green. Ініціалізовано `package.json`, `tsconfig.json` та базові контракти в `task.spec.js`.
- **2026-11-20 (Ітерація 1 — Green):** Реалізовано `DomainModel`, `FractalContactBookModel`, `ChatRepoModel`, `CrystallizeModel` та `src/index.js`. Контрактні тести `release:spec` (8/8), `tsc` та `nan0inspect domain` пройдено.
- **2026-11-20 (Ітерація 2 — Фідбек Архітектора):** Видалено зайвий `DomainModel.js` (усі моделі наслідують `ModelAsApp` з `@nan0web/ui`). Додано `PeerGitSyncModel`, `CommunicationApp`, CLI `bin/nan0com.js` (`@nan0web/db-fs`) та українську інструкцію `docs/uk/testing-with-friend.md` для тестування між двома людьми на відстані.
- **2026-11-20 (Ітерація 3 — Уточнення документації):** Оновлено `docs/uk/testing-with-friend.md`: спрощено встановлення (`pnpm add -g @nan0web/communication.app` -> `nan0com`), пояснено структуру `we/<circle>/<chat-name>` (`we/7i/family`) та чесно зафіксовано статус `--author` у `v0.1.0` (без криптопідпису до `v0.2.0`).
- **2026-11-21 (Ітерація 4 — Канон 7iOS у Код):** Затверджено Варіант А (Закон Однини: `partner`, `service`), зовнішній конфіг кіл через `index`, тур Першого Дня `docs/uk/tour/01/` з копіюванням дерева та `--dry-run` в `InitCommand`, а також бінарну формулу Ради Мудреців `{0, 1}` у `/Users/i/arch/formulas/council-of-sages.md`.

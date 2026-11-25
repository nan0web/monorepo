---
version: "0.1.0"
package: "@nan0web/communication.app"
locale: "uk"
status: "planned"
rrs_target: 340
target_files:
  - "package.json"
  - "src/index.js"
  - "src/domain/FractalContactBookModel.js"
  - "src/domain/FractalContactBookModel.story.js"
  - "src/domain/ChatRepoModel.js"
  - "src/domain/ChatRepoModel.story.js"
  - "src/domain/CrystallizeModel.js"
  - "src/domain/CrystallizeModel.story.js"
  - "src/domain/ChatSearchModel.js"
  - "src/domain/ChatSearchModel.story.js"
  - "src/domain/MediaPolicyModel.js"
  - "src/domain/MediaPolicyModel.story.js"
  - "src/domain/PeerGitSyncModel.js"
  - "src/domain/PeerGitSyncModel.story.js"
  - "src/domain/CommunicationApp.js"
  - "src/domain/CommunicationApp.story.js"
  - "releases/0/1/v0.1.0/task.spec.js"
  - "releases/0/1/v0.1.0/user.md"
---

# 🚀 Release v0.1.0 — Core Domain & In-Memory Scenarios (`@nan0web/communication.app`)

> **Місія релізу:** Створити детерміноване, повністю протестоване на In-Memory `@nan0web/db` доменне ядро децентралізованого Git-месенджера та простору спільних проєктів `7iOS.CoCreation` (`@nan0web/communication.app`) без прив'язки до ОС/FS (`Zero-Procedural Code`).

---

## 1. Декомпозиція Задач та Контракти (`task.spec.js`)

Кожна задача мапиться на відповідні тести `it()` у `releases/0/1/v0.1.0/task.spec.js` (Contract-First / TDD Red-Green-Refactor):

### Задача 1. Ініціалізація пакета та OLMUI-каркасу
- Створити `package.json` (`"type": "module"`, скрипти `test`, `test:all`, `release:spec`, `inspect`) та `src/index.js`.
- Підключити базові залежності: `@nan0web/co`, `@nan0web/db`, `@nan0web/vault`, `@nan0web/ui-cli`, `@nan0web/types`.
- **Контракт:** `package.json` валідний, експорти `src/index.js` резолвляться без помилок.

### Задача 2. Фрактальна адресна книга `7iOS` (`FractalContactBookModel`)
- Реалізувати розподіл контактів та чатів по 7 канонічних колах домену `we/` за Законом Однини (`7i`, `kinship`, `partner`, `law`, `community`, `service`, `inbox`) з можливістю перевизначення через зовнішній конфіг (`index`) або опції моделі.
- Додати підтримку `Master soulId` + `devices[]`, перевірку **Правила Тріади** ($N_{\text{core}} \ge 3$) для `we/partner/` та `bootstrapDayOneTree()` (копіювання туру `docs/uk/tour/01/` з підтримкою `--dry-run`).
- **Контракт:** Контакти валідуються через `Model-as-Schema`, невалідне коло або Тріада з $N < 3$ повертає структуровану помилку валідації; `bootstrapDayOneTree` ідемпотентно розгортає 4 стартові точки.

### Задача 3.1. Двомірний Git-чат та Markdown-проєкт (`ChatRepoModel`)
- Реалізувати запис повідомлень у часовому шардінгу `chat/YYYY/MM/DD/<ts>-<peer>.md`.
- Реалізувати генерацію індексу дня/місяця у `README.md` (а не в `_.nan0`).
- **Контракт:** Повідомлення записуються й читаються через `this.$db`, індекс `README.md` оновлюється детерміновано.

### Задача 3.2. `crystallize` та миттєвий пошук (`CrystallizeModel`, `ChatSearchModel`)
- Реалізувати детерміновану операцію `crystallize(msgUri, targetDocUri)` для перенесення повідомлення в `docs/*.md` або `todo.md` із посиланням на першоджерело та збереженням авторства.
- Реалізувати локальний інвертований індекс (`< 5 мс`) для миттєвого пошуку по чату та документах.
- **Контракт:** `crystallize` зберігає авторство та `$ref` на першоджерело; пошук по індексу повертає результати за `< 5 мс` на репрезентативному обсязі чату.

### Задача 4. Кастомізація стилів, Медіа та Volumes (`MediaPolicyModel`)
- Описати конфігурацію `_.nan0` чату:
  - `theme`: кастомні стилі чату (бекграунд, шрифт, палітра — як у Telegram, але версіоновано в Git);
  - `media`: стиснення `WebP` (рівні `60/75/90/100`), `Opus`, CAS `sha256` вказівники;
  - `volumes`: монтування зовнішніх дисків (R2/S3 або локальний SSD) зі статусом `ONLINE/OFFLINE`.
- **Контракт:** Невалідні рівні якості або невідомі формати відхиляються схемою моделі.

### Задача 5. Безконфліктна синхронізація (`PeerGitSyncModel`)
- Реалізувати модель формування гілок `refs/heads/peers/<soulId>` (ізольований запис для кожного учасника в 1-на-1 та групових чатах).
- Додати 3 режими батчингу комітів (`realtime`, `debounce`, `manual-close`) та політики злиття проєктних документів (`auto-ort`, `pr-in-chat`, `owner-only`).
- **Абстракція Git:** У v0.1.0 «гілки» — це чиста структура даних (`soulId → messages[]`) на In-Memory `@nan0web/db`, без викликів git-бінарника. Реальна git-інтеграція (isomorphic-git / git-CLI) — окремий порт, який підключається в наступному релізі без зміни контракту моделі.
- **Контракт:** Симуляція одночасного запису 2+ учасників у груповому чаті не створює конфліктів у потоці `chat/`.

### Задача 6. Головний диспатчер (`CommunicationApp`)
- Реалізувати `ModelAsApp` з підкомандами: `init`, `send`, `view`, `crystallize`, `sync`, `find`, `cert`.
- **Контракт:** Усі команди повертають типізовані `OutputMessage` потоки через `app.run()`.

---

## 2. Верифікація та RRS Gate

Перед запечатуванням релізу (`release seal`) обов'язково мають пройти:
1. `pnpm --filter @nan0web/communication.app run release:spec` (усі тести `task.spec.js` — Green).
2. `pnpm --filter @nan0web/communication.app run test:all` (юніт + `*.story.js` + `knip` + `tsc`).
3. `pnpm --filter @nan0web/communication.app run inspect` (аудит `nan0inspect`: відсутність `fs`, дотримання `Model-as-Schema` та `this.$db`).
4. **RRS (Release Readiness Score) $\ge 324$ бали.**

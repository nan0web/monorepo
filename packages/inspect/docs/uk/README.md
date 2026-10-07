# @nan0web/inspect — Інструкція користувача та розробника

`@nan0web/inspect` — це автономний двигун архітектурного аудиту та «самозцілення» (healing) кодової бази монорепозиторію NaN0Web відповідно до стандартів **Zero-Hallucination (0HCnAI)** та **Model-as-Schema**.

---

## 🚀 Як запускати інспектор

У монорепозиторії налаштовано глобальний бінарник `nan0inspect` (доступний через `pnpm` або `npx`).  
За правилами воркспейсу всі виклики виконуються через `pnpm` або `npx`.

### 1. Повний аудит директорії / пакета
Запускає всі спеціалізовані аудитори послідовно та формує звіт про здоров'я кодової бази:

```bash
# Перебуваючи всередині цільового пакета (наприклад, packages/ui-payload):
pnpm exec nan0inspect audit .

# Або запуск з кореня монорепозиторію для конкретного пакета:
pnpm --filter @nan0web/ui-payload inspect
# або:
pnpm exec nan0inspect audit packages/ui-payload
```

### 2. Запуск окремих аудиторів (Atomic Checks)
Можна викликати конкретний аудитор за його аліасом для швидкої перевірки однієї зони:

```bash
# 1. Фаза життєвого циклу (seed.md, project.md, релізи):
pnpm exec nan0inspect phase packages/ui-payload

# 2. Гігієна конфігів (package.json scripts, tsconfig.json, knip.json):
pnpm exec nan0inspect hygiene packages/ui-payload

# 3. Експорти та фасади (src/index.js, src/domain/index.js, типи в package.json):
pnpm exec nan0inspect exports packages/ui-payload

# 4. Ізоляція домену (Model-as-Schema, заборона Model поза src/domain):
pnpm exec nan0inspect domain packages/ui-payload

# 5. Верифікація (наявність unit-тестів, play пісочниці, ProvenDoc):
pnpm exec nan0inspect verification packages/ui-payload

# 6. Циклічні залежності (madge аудит у src/):
pnpm exec nan0inspect circular packages/ui-payload

# 7. Снепшоти та чистота лексики UI:
pnpm exec nan0inspect snapshots packages/ui-payload
```

### 3. Автоматичне зцілення (`--fix`)
Якщо в пакеті відсутні стандартні скрипти `package.json`, `tsconfig.json` чи `knip.json`, аудитор може створити їх автоматично:

```bash
pnpm exec nan0inspect hygiene packages/ui-payload --fix
```

### 4. Режим без інтерактивного UI (`--json`)
Для CI/CD або скриптів знімків:

```bash
pnpm exec nan0inspect audit packages/ui-payload --json
```

---

## 📋 Каталог аудиторів

| Аудитор | Команда | Що перевіряє |
| :--- | :--- | :--- |
| **PhaseAuditor** | `phase` | Фази розробки проекту за `seed.md`, `project.md`, наявність історії релізів (`releases/`). |
| **JsHygieneAuditor** | `hygiene` | Наявність обов'язкових скриптів у `package.json`, конфігураційних файлів (`tsconfig.json`, `knip.json`), ліцензії, devDependencies. |
| **JsExportAuditor** | `exports` | Цілісність шлюзу `src/index.js`, фасаду `src/domain/index.js`, експортів UI-адаптерів, підшляхів `types`, відсутність заборонених `export default`. |
| **JsDomainAuditor** | `domain` | Суворе дотримання `Model-as-Schema`: заборонено спадкування від `Model` поза папкою `src/domain/`, перевірка полів класів. |
| **JsVerificationAuditor**| `verification` | Наявність юніт-тестів `*.test.js`, пісочниці `play/` з `App.jsx` або `main.js`, та `ProvenDoc` (`src/README.md.js`). |
| **CircularDependencyAuditor** | `circular` | Пошук циклічних імпортів у графах модулів `src/` через ізольований воркер `madge`. |
| **SnapshotAuditor** | `snapshots` | Аудит знімків інтерфейсу `snapshots/core/*.nan0` та перевірка словників локалізації на витік чужомовних слів. |

---

## 🩹 Протокол Зцілення (`next.md`)

Якщо під час повного аудиту виявляються порушення:
1. Інспектор створює або оновлює файл `next.md` у робочій директорії.
2. У `next.md` генерується чекліст помилок, згрупований за межами модифікації (`boundary`) та контекстом (`context`).
3. Додаються рекомендації щодо виклику субагентів або команд для усунення дефектів.

---

## 💻 Використання в коді (JS API)

```js
import { ArchitectureAuditor } from '@nan0web/inspect'
import { DB } from '@nan0web/db'

const auditor = new ArchitectureAuditor({ dir: 'packages/ui-payload' })
const gen = auditor.run()

let step = await gen.next()
while (!step.done) {
  // Обробка прогресу та повідомлень OLMUI
  step = await gen.next()
}

const report = step.value.data
console.log(`Оцінка здоров'я: ${report.score}%`)
```

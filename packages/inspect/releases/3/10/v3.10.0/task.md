# Реліз v3.10.0 — Підкоманда `release` у `nan0inspect`

## Мета
Реалізувати підкоманду `nan0inspect release --non-interactive` для автоматичної валідації релізів у `test:all`.

## Задачі
1. Створити `ReleaseAuditor` (`alias: 'release'`) на базі `AuditorModel` та підключити його до `InspectorApp`.
2. Реалізувати логіку перевірки через `this._.db`:
   - Знайти всі `releases/**/task.md` у поточному пакеті (`this.dir`).
   - Для кожного `task.md`, де `status: in_progress` (або `status: done` без `retro.md` при потребі):
     - перевірити наявність обов'язкових файлів у тій самій директорії: `task.spec.js` та `user.md`;
     - якщо `task.spec.js` або `user.md` відсутні — зафіксувати помилку з описом відсутнього файлу.
   - Якщо все гаразд — вивести `release:validate ok`.
3. Інтегрувати `release:validate` у `packages/inspect/package.json` та додати `&& npm run release:validate` у `test:all`.

## Target Files
- `packages/inspect/src/domain/app/ReleaseAuditor.js`
- `packages/inspect/src/domain/app/InspectorApp.js`
- `packages/inspect/package.json`
- `packages/inspect/releases/3/10/v3.10.0/task.md`
- `packages/inspect/releases/3/10/v3.10.0/user.md`
- `packages/inspect/releases/3/10/v3.10.0/task.spec.js`

# 📝 Release Notes & Testing Guide: LLiMo v3.2.0

## 📦 Overview

Реліз `v3.2.0` закладає фундамент суверенної заміни Antigravity. Ми перейшли на OLMUI-інструменти (`ModelAsApp`) для взаємодії AI-агента з робочим середовищем та розширили `PipelineCommand` для розумного точкового злиття змін (Snippet Mode) через `applyBoundaries()`.

---

## 🧪 Як це тестувати (Testing Guide)

Ми підготували кілька сценаріїв тестування, від автоматичних до інтерактивних.

### 1. Автоматичні контрактні тести (Release Spec)
Цей набір перевіряє поведінку всіх 5 інструментів (`ViewFileTool`, `EditFileTool`, `RunCommandTool`, `ListDirTool`, `SearchCodeTool`) та стабільність TypeScript-збірки:
```bash
# Перебуваючи в apps/llimo.app
npm run release:spec

# Або з корня монорепозиторію
pnpm --filter @nan0web/llimo.app release:spec
```

### 2. Загальний Pipeline гігієни пакета (Test All)
Запуск повного циклу тестів, збірки, документації, демо-сценаріїв та Knip-аналізу невикористаного коду:
```bash
# Перебуваючи в apps/llimo.app
npm run test:all
```

### 3. Ручний запуск інтерактивного чату (Simulation Mode)
Ти можеш запустити LLiMo в ізольованому середовищі чату, щоб спробувати поспілкуватися з агентом і перевірити, як він обробляє твої файли:
```bash
# Запуск симуляції чату з тестовою директорією
npm run test:chat
```

### 4. Тестування Пайплайну (Pipeline Command)
Для перевірки автономного циклу розробки OLMUI:
```bash
# Крок 1: Seed (Генерація ТЗ)
npx llimo pipeline --step seed "Create a simple Counter app with clean aesthetics"

# Крок 2: Model (Генерація Доменної Моделі)
npx llimo pipeline --step model --task releases/3/v3.2.0/task.md
```

---

## 🐳 Контейнеризація: Поточний стан

### Де лежить логіка?
Ми маємо готову модель контейнеризації у файлі `src/domain/SandboxModel.js`. Вона реалізує наступні режими:
*   `none` — виконання команд безпосередньо в хост-системі.
*   `docker` — запуск ізольованого контейнера через `docker run --rm -v ${process.cwd()}:/workspace -w /workspace <image>`.
*   `orb` / `linux` — швидка віртуалізація через OrbStack Linux Machine (`orb -m alpine`).

### Чому вона зараз не активна за замовчуванням?
1. **Збереження гнучкості локальної розробки**: Усі поточні кроки пайплайнів (наприклад, `npm test` у `PipelineCommand.js:503`) запускаються локально через `execSync` для максимальної швидкості та прямого доступу до залежностей монорепозиторію.
2. **Параметр `--docker`**: У команді релізу (`src/Chat/commands/release.js`) прапорець `docker` (або `-d`) доданий на рівні схеми та конфігурації CLI-опцій (`ReleaseOptions.docker`), але виконання кроків у докері поки що не інтегровано в сам раннер.

### Як підключити контейнеризацію на ніч?
Якщо ти хочеш запустити розробку складного додатка на ніч і хочеш убезпечити хост-систему, нам потрібно:
1. Замінити локальний виклик `execSync` у `PipelineCommand.js` та раннері релізів на виклик через `SandboxModel`.
2. Наприклад:
   ```javascript
   import { SandboxModel } from '../../domain/SandboxModel.js'
   
   const sandbox = new SandboxModel({ sandbox: 'docker' })
   const result = await sandbox.exec('npm', ['test'], { cwd: process.cwd() })
   ```
3. Створити локальний `Dockerfile` в корні `llimo.app` для кешування `node_modules` монорепозиторію, щоб докер-контейнери не витрачали час на `pnpm install` при кожному запуску.

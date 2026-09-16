---
version: 3.2.0
type: feature
status: done
locale: uk
models:
  - ViewFileTool
  - EditFileTool
  - RunCommandTool
  - ListDirTool
  - SearchCodeTool
---

# 🚀 Mission: Agent Tools — Sovereign Antigravity Foundation

## 🏁 Overview

Створити 5 базових Agent Tools як `ModelAsApp` генератори для LLiMo pipeline.
Кожен tool — це автономна одиниця, яка приймає дані, виконує дію через OLMUI intents
(show/ask/progress/result), і повертає результат. Tools використовують boundary protocol
для file editing (`---boundary:path:startLine:lineCount---`).

Ціль: замінити Antigravity як консольний AI-асистент, використовуючи суверенну
інфраструктуру nan0web замість пропрієтарних API.

## 👥 User Stories

### US-1: View File (Перегляд файлу)

Як розробник, я хочу переглядати вміст файлу з нумерацією рядків через LLiMo tool,
щоб AI-агент міг читати код і приймати рішення.

### US-2: Edit File (Редагування файлу)

Як розробник, я хочу редагувати частину файлу через boundary protocol
(`---boundary:path:startLine:lineCount---`), щоб AI міг точково змінювати код
без перезапису всього файлу.

### US-3: Run Command (Виконання команди)

Як розробник, я хочу виконувати shell-команди через LLiMo tool з timeout та capture output,
щоб AI-агент міг запускати тести, збірки та інші команди.

### US-4: List Directory (Список файлів)

Як розробник, я хочу отримувати структуровану інформацію про файли і директорії,
щоб AI-агент міг орієнтуватися у workspace.

### US-5: Search Code (Пошук у коді)

Як розробник, я хочу шукати по коду через `nan0ai search` (semantic vector search),
щоб AI-агент міг знаходити релевантні файли за змістом запиту.

### US-6: tsc Build Stability

Як розробник, я хочу щоб `pnpm build` проходив без помилок,
щоб TypeScript декларації генерувались коректно і downstream пакети могли їх використовувати.

## 🏗 Data-Driven Architecture

Кожен tool — це `ModelAsApp` з:

- `static` полями для CLI-аргументів (Model-as-Schema)
- `async *run()` генератором з OLMUI intents
- Story test (`*.story.js`) з `runGenerator()` перевіркою

```
src/domain/tools/
├── ViewFileTool.js          # US-1
├── ViewFileTool.story.js
├── EditFileTool.js          # US-2
├── EditFileTool.story.js
├── RunCommandTool.js        # US-3
├── RunCommandTool.story.js
├── ListDirTool.js           # US-4
├── ListDirTool.story.js
├── SearchCodeTool.js        # US-5
├── SearchCodeTool.story.js
└── index.js
```

## 🎯 Scope

- [ ] US-1: `ViewFileTool` — read file with line numbers, startLine/endLine range
- [ ] US-2: `EditFileTool` — boundary-based edit with `applyBoundaries()`
- [ ] US-3: `RunCommandTool` — exec with timeout, stdout/stderr capture
- [ ] US-4: `ListDirTool` — structured directory listing with file sizes
- [ ] US-5: `SearchCodeTool` — `nan0ai search` wrapper as ModelAsApp
- [ ] US-6: Fix 34 `tsc build` errors in llimo.app

## ✅ Acceptance Criteria (DoD)

- [ ] **Контрактні тести** (`task.spec.js`) написані і успішно проходять (Green).
- [ ] **Model-as-Schema**: Жодного використання JS class fields. Лише JSDoc типізація всередині `constructor()` та метадані у `static`.
- [ ] **Story Tests**: Кожен tool має `*.story.js` з `runGenerator()` перевіркою intents.
- [ ] **Boundary Protocol**: `EditFileTool` використовує `parseBoundaries`/`applyBoundaries` з `@nan0web/ai`.
- [ ] **tsc Build**: `pnpm --filter @nan0web/llimo.app build` проходить без помилок.
- [ ] **Regression**: Всі 301 існуючих тестів продовжують проходити.

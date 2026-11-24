---
version: 3.7.1
type: patch
status: in_progress
locale: uk
models:
  - WhisperEngine
---

# 🎙️ Mission: WhisperEngine Progress Parsing, Model Catalog & Context Flags (v3.7.1)

## 🏁 Overview (Огляд)

Патч-реліз `v3.7.1` для `@nan0web/ai` розширює `WhisperEngine` та `MlxWhisperBackend`:
- Експортує `MLX_MODEL_MAP`, `MLX_MODEL_META`, `parseMlxProgressLine()` та `fetchMlxWhisperModels()`.
- Додає підтримку `--initial-prompt` (`options.initialPrompt`) та `--condition-on-previous-text` (`options.conditionOnPreviousText`, default `false`) у `MlxWhisperBackend`.
- Додає утиліту `buildMlxArgs(audioPath, options)` та `normalizeWhisperLanguage(lang)` для детермінованого тестування аргументів CLI і фіксації мови між чанками.

## 📂 Target Files

- `packages/ai/releases/3/7/v3.7.1/task.md` `[NEW]`
- `packages/ai/releases/3/7/v3.7.1/user.md` `[NEW]`
- `packages/ai/releases/3/7/v3.7.1/task.spec.js` `[NEW]`
- `packages/ai/src/domain/WhisperEngine.js` `[MODIFY]`
- `packages/ai/src/index.js` `[MODIFY]`

---
version: 3.3.0
type: feature
status: active
locale: uk
models: ["MarkdownBlockView", "MediaBlockView"]
---

# 🚀 Mission: Payload CMS UI Адаптери та Блок-Компоненти у @nan0web/ui-payload (v3.3.0)

## 🏁 Overview (Огляд)
Реалізація універсальних UI компонентів та адаптерів Payload CMS для `MarkdownBlock`, `MediaBlock` та надання поліморфного `uiPayloadRegistry`.

## 👥 User Stories (Сценарії)
- Як розробник, я хочу відображати блоки `MarkdownBlock` через готові React/Payload UI елементи з підтримкою вкладеного графіків/калькуляторів.
- Як розробник, я хочу реєструвати Payload UI блоки через `uiPayloadRegistry`, щоб OLMUI рендеринг працював без ручних процедурних розгалужень.

## 🏗 Data-Driven Architecture (Моделювання)
- `uiPayloadRegistry`:
  - `Map<ModelConstructor, PayloadBlockViewComponent>`
- `MarkdownBlockView`:
  - Компонент для `type: 'text/markdown'`
- `MediaBlockView`:
  - Компонент для `static $upload = true`

## 🎯 Scope (Задачі)
- [ ] Створити `uiPayloadRegistry` для прив'язки моделей до Payload/React UI View класів.
- [ ] Створити універсальний компонент `MarkdownBlockView`.
- [ ] Створити універсальний компонент `MediaBlockView`.

## ✅ Acceptance Criteria (DoD)
- [ ] Контрактні тести (`task.spec.js`) написані і успішно проходять (Green).
- [ ] OLMUI рендеринг: 0% процедурних `switch/case` в елементах рендерингу.

## 📌 Context Checkpoint (2026-08-07)

### Implemented
- Added `fromNan0Html()` and `inventoryNan0Html()` conversion helpers.
- Added Lexical custom nodes: `Nan0ElementNode`, `Nan0RawNode`, and `Nan0ComponentNode`.
- Added `Nan0HTMLFeature()` with server-side HTML converters and client import-map entry.
- Added Payload Lexical dependencies and public richtext exports.
- Added `ImageCell` preview with fixed `192x108` dimensions.
- Added Payload 3.86-compatible client feature provider in `src/richtext/client/index.js`.

### Verification
- `pnpm --prefix packages/ui-payload test` passes.
- Root commit hook passed 43 tests.
- Industrial Bank seed and Payload admin integration were exercised.

### Current State
- Changes are intentionally uncommitted after removing the last agent-created commit.
- They are staged in `packages/ui-payload` and must be committed by the user.
- Other repository changes are unrelated and must not be included.
- Industrial Bank CMS import map uses `@nan0web/ui-payload#ImageCell`.
- CMS image paths `/img/...` and `/images/...` are mounted from `bank/public`.

### Next Steps
1. Commit only the staged `packages/ui-payload` changes.
2. Run the Industrial Bank CMS build and fix remaining unrelated TypeScript blockers, starting with `src/test-read.ts` using obsolete `DB({ rootDir })`.
3. Verify `/admin/collections/cards/<id>` editing and `ImageCell` rendering.
4. Add focused contract tests for Nan0HTML/Lexical conversion and custom nodes.

### New Chat Bootstrap
Start from branch `feature/payload-cms`, base `070afe7`, with staged changes in `packages/ui-payload`. Do not reset, clean, commit, or push without explicit user instruction.

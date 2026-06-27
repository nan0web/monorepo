---
description: Advanced OLMUI LLM Agent & Session Orchestrator for NaN0Web
tags: [agent, chat, olmui, parser]
locale: en
---

# 🏗️ Architecture: llimo.v3

## Фаза 1: Philosophy & Abstraction (The Seed)
`llimo.v3` implements the concept of an autonomous developer (AI Agent) operating on **One Logic — Many UIs (OLMUI)** principles. The interaction logic with the user and AI models is fully encapsulated within JS generators and decoupled from any specific rendering layer (CLI, Web, VSCode, etc.).

### Core Abstractions:
- **Session (`ChatSessionModel`)**: Holds the state of the conversation.
- **Strategy (`AiStrategyModel`)**: A queue of LLMs defining fallback execution order during timeouts or API failures.
- **Boundary Format**: Specialized block protocol for file updates `---boundary:filepath---`.
- **Local Metrics**: Storing call metrics (speed, tokens, duration, cost, efficiency) in `~/.llimo/stats.jsonl`.

## Фаза 2: Domain Modeling (Data-Driven Models)
All domain models extend `ModelAsApp` or `AiModelAsApp` and declare schemas via static properties (Model-as-Schema).

1. **`ChatSessionModel`** (`src/domain/app/ChatSessionModel.js`):
   - Runs the generator loop `run()`.
   - Connects to database via `@nan0web/db`.
   - Parses LLM answers with `Strict Boundary Interpreter`.
2. **`AiStrategyModel`** (`src/domain/strategy/AiStrategyModel.js`):
   - Controls the queue of fallback models.
3. **`StatsReportModel`** (`src/domain/stats/StatsReportModel.js`):
   - Parses `stats.jsonl` and reports model performance.

## Фаза 3: CLI Integration (Scenarios & Commands)
Fallback/strategy queue operations:
- `strategy list` — view fallback models.
- `strategy remove [pattern]` — remove model by ID/wildcard.
- `strategy add [model]` — append/prepend/insert models with `--before`, `--after`, `--position`.
- `strategy edit` — interactive strategic editor.

## Фаза 4: Sovereign Workbench / The Master IDE
Playground sandbox runs in `play/main.js` utilizing In-Memory `@nan0web/db` for test assertions without modifying physical disks.

## Фаза 5: Theming
The core is 100% UI-blind. Terminal styling is provided by `@nan0web/ui-cli` utilizing NaN•Web design tokens.

## Фаза 6: Quality & Distribution
- Automated testing via Node.js Test Runner.
- Coverage: 30+ unit and integration tests.
- Static typing check via TypeScript & JSDoc.

## Фаза 7: Value & Economy
- Minimal API costs due to surgical line-range updates.
- Model cascades for optimized latency, quality, and API budget.

## Фаза 8: Sovereignty
- Zero lock-in, open protocols.
- Runs on abstract `@nan0web/db` and local file systems.

## Фаза 9: World Impact
- Empowering developers with open-source agent tooling.

## Definition of Done (DoD)
- [x] All unit and integration tests pass successfully.
- [x] No TypeScript compilation errors.
- [x] Commands and workflow pipeline fully localized.

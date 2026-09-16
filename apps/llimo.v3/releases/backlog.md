---
version: backlog
type: roadmap
status: draft
locale: uk
---

# Backlog: Інтеграція llimo.v3 з Mistral Vibe

## Контекст

`llimo.v3` має робочий 9-фазний OLMUI pipeline (`AppPipelineModel` з `detectCurrentPhase`,
data-driven конфігурацією, post-phase інспекторами). `Mistral Vibe` — зрілий CLI-агент
з інструментами, MCP, субагентами. Мета — об'єднати їх, щоб pipeline llimo.v3 був
доступний всередині Vibe.

---

## Варіант A: Custom Tool для Vibe (найпростіший)

Створити Python-інструмент `~/.vibe/tools/llimo_pipeline.py`, який викликає
`llimo3 pipeline run app <task>` і повертає результат.

**Плюси:** ~15 хв роботи, мінімум коду, одразу працює.
**Мінуси:** не справжній субагент, результат — текст без структури, немає JSON-схеми.

**Завдання:**
- [ ] Створити `~/.vibe/tools/llimo_pipeline.py` з інструментом `run_pipeline`
- [ ] Додати опис у `~/.vibe/tools/prompts/llimo_pipeline.md`
- [ ] Перевірити, що Vibe підбирає інструмент

---

## Варіант B: MCP Server (рекомендований)

Загорнути llimo.v3 в MCP-сервер, який експортує інструменти з JSON-схемами.
Vibe підтримує MCP нативно через `[[mcp_servers]]` у `config.toml`.

**Плюси:** стандартний протокол, JSON-схеми, Vibe підтримує нативно, незалежність
від версії Vibe.
**Мінуси:** треба написати MCP-обгортку (~100 рядків).

### Специфікація MCP-сервера

**Інструменти:**

| Інструмент | Опис | Вхід | Вихід |
|---|---|---|---|
| `run_pipeline` | Повний 9-фазний конвеєр | `task: string` | `{ ok, phase, savedFiles }` |
| `run_phase` | Одна фаза конвеєра | `phase: string, task: string` | `{ ok, savedFiles }` |
| `detect_phase` | Визначити поточну фазу проекту | `dir: string` | `{ phase: string }` |
| `run_inspector` | Запустити конкретний інспектор | `name: string, dir: string` | `{ ok, errors }` |

**Протокол:** subagent.md — JSON-контракт, stateless, score + errors.

**Завдання:**
- [ ] Створити `bin/mcp-server.js` — MCP-сервер на Node.js (використовує `@modelcontextprotocol/sdk` або ручний stdio JSON-RPC)
- [ ] Імпортувати `PipelineRunner`, `AppPipelineModel`, `InspectPipelineModel` з llimo.v3
- [ ] Експортувати 4 інструменти з JSON-схемами
- [ ] Додати `[[mcp_servers]]` у конфіг Vibe
- [ ] Перевірити: `/mcp` показує сервер, інструменти доступні

---

## Варіант C: Кастомний субагент Vibe (найглибший)

Домогтися, щоб Vibe підтримував реєстрацію кастомних субагентів через `agent_paths`
або новий тип конфігурації, і `task`-інструмент міг їх викликати.

**Плюси:** справжня інтеграція, модель делегує завдання як субагенту, підтримка
кешування, ізольований контекст.
**Мінуси:** залежить від апстріму Vibe (Mistral AI), терміни невідомі.

**Завдання:**
- [ ] Написати feature request у mistralai/mistral-vibe (issue на GitHub)
- [ ] Запропонувати формат конфігурації:

```toml
[[subagents]]
name = "llimo-pipeline"
command = "llimo3 mcp"
transport = "stdio"
```

- [ ] У llimo.v3: доробити `PipelineRunner` під протокол subagent.md (JSON-контракт,
      stateless, кешування за SHA-256)
- [ ] Підтримати `force: true` для обходу кешу

---

## Варіант D: LLMAgent Self-Healing Loop & Quality Gates Engine (Автономне самовідновлення)

Інтеграція доменного процесу `packages/ai/src/domain/process/logic.js` (`LLMAgent` на базі `ModelAsApp`) безпосередньо в ранер `llimo.v3`.

### Архітектура шлюзів якості (Quality Gates)
1. **Pre-flight Baseline Gate**: перевірка стану тестів проєкту до початку чату. Якщо репозиторій вже зламаний — агент сигналізує та зупиняється, уникаючи плутанини між існуючими багами та новими змінами.
2. **Fast Per-File Gates (Атомарні шлюзи)**:
   - `checkFile(file)`: перевірка валідності синтаксису (`node --check`).
   - `prettyFile(file)`: перевірка гігієни коду (`prettier --check`).
   - `testFile(file)`: вибірковий запуск відповідного unit-тесту (`node --test`).
   - `buildFile(file)`: валідація TypeScript/JSDoc сигнатур (`tsc --noEmit`).
3. **Context Integration Gate (`testContext`)**: запуск усіх пов'язаних тестів із контексту завдання (викликається лише якщо атомарні шлюзи зелені).
4. **Full Project Test Gate (`testProject`)**: повний прогін тестів проєкту (`pnpm test`), якщо не вимкнено конфігурацією (`skipProjectTests: false`).
5. **Architectural Inspection Gate (`inspectProject`)**: перевірка проєкту інспекторами `@nan0web/inspect` (Model-as-Schema v2, JSDoc, i18n, структура).
6. **Self-Healing Iteration Loop**:
   - Автоматичний повтор спроб через `chat.canContinue()`.
   - Запит дозволу користувача через OLMUI `yield ask('autoContinue')` у разі вичерпання ліміту (`maxRetries`).

**Завдання:**
- [ ] Підключити `LLMAgent` як ядро автономної кодогенерації для `llimo3`.
- [ ] Додати CLI та Web адаптери для OLMUI-подій (`yield show`, `yield ask`).
- [ ] Експортувати команду `llimo3 agent run <task>`.

---

## Пріоритет

1. **D (LLMAgent Self-Healing Gates)** — надійна автономна кодогенерація без галюцинацій.
2. **B (MCP)** — прямий шлях інтеграції з IDE та Vibe, мінімум залежностей.
3. **A (Custom Tool)** — швидкий fallback.
4. **C (Subagent)** — після того, як Mistral додасть API для кастомних субагентів.

---

## Посилання

- `packages/ai/src/domain/process/logic.js` — LLMAgent OLMUI Model
- `packages/ai/src/domain/ChatSession.js` — ChatSession з контекстом та збереженням помилок
- `src/domain/pipeline/PipelineRunner.js` — запуск pipeline
- `src/domain/pipeline/pipelines/AppPipelineModel.js` — 9-фазний конвеєр
- `src/domain/pipeline/PipelineApp.js` — CLI команда
- `docs/uk/workflows/subagent.md` — Zero-Hallucination протокол
- `docs/uk/workflows/agent-orchestration.md` — матрична оркестрація
- `releases/3/2/v3.2.0/task.md` — попередній план pipeline + inspectors
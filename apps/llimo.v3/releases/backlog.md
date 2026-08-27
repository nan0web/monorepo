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

## Пріоритет

1. **B (MCP)** — прямий шлях, мінімум залежностей
2. **A (Custom Tool)** — якщо MCP з якихось причин не підходить
3. **C (Subagent)** — після того, як Mistral додасть API для кастомних субагентів

---

## Посилання

- `src/domain/pipeline/PipelineRunner.js` — запуск pipeline
- `src/domain/pipeline/pipelines/AppPipelineModel.js` — 9-фазний конвеєр
- `src/domain/pipeline/PipelineApp.js` — CLI команда
- `docs/uk/workflows/subagent.md` — Zero-Hallucination протокол
- `docs/uk/workflows/agent-orchestration.md` — матрична оркестрація
- `releases/3/2/v3.2.0/task.md` — попередній план pipeline + inspectors
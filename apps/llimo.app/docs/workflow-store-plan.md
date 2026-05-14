# План Дій: Глобальний Доступ до Workflows в LLiMo

Проблема: наразі `MarkdownProtocol` у LLiMo розуміє лише відносні або абсолютні шляхи до файлів (наприклад, `../../packages/...`). Це незручно, крихко (ламається при переносі файлів) і не дозволяє масштабувати передачу контексту для 40+ воркфлоу. 

Як з цим справляються дорослі асистенти (Antigravity, Copilot, Continue):
1. **Global Prompt / Slash Commands**: Antigravity автоматично сканує директорію `.agents/workflows` і додає їх як команди `/slash-command`.
2. **MCP (Model Context Protocol)**: Агент отримує лише "список доступних воркфлоу", а коли йому потрібні деталі — він викликає tool (наприклад, `read_workflow("code-style.md")`).
3. **Alias Resolvers**: У Continue та Cursor використовуються символи `@` (наприклад, `@code-style` або `@Docs`), які автоматично підтягують файл з глобального реєстру.

Щоб LLiMo міг елегантно отримувати доступ до `0HCnAI.framework/templates/workflows`, пропонується наступне архітектурне рішення:

## 1. Механізм Аліасів (Символ `@`) у Markdown.js
Треба оновити наш метод парсингу чеклістів (`Markdown.extractPath`) та пакер (`pack.js`), щоб він розумів спеціальний префікс.
Замість:
`- [Архітектура](../../packages/0HCnAI.framework/templates/workflows/architecture.md)`
Ми писатимемо:
`- [@workflow/architecture.md]` або просто `- [@workflow/architecture]`

## 2. Глобальний Реєстр (Workflow Store)
У конфігурації додатка (`nan0web.nan0` або змінній середовища `LLIMO_WORKFLOWS_PATH`) ми вкажемо шлях до `templates/workflows`.
Коли `pac.js` бачить префікс `@workflow/`, він більше не здійснює вирішення відносно `process.cwd()`, а робить `path.resolve(LLIMO_WORKFLOWS_PATH, filename)`.

## 3. Автоматичний Індекс (RAG / Tool Calling) — Опціонально
Якщо ми хочемо, щоб модель *сама* вибирала, які воркфлоу читати (як це робить Antigravity):
Замість "додавання всього тексту в Prompt", ми можемо написати скрипт, який генерує один файл `workflows-index.md` (лише назви та `description:` з frontmatter). Субагент читає індекс, і якщо бачить потрібне, пише у відповідь команду:
`!include @workflow/pipeline-no7-ui-web`
Після цього LLiMo зупиняє генерацію, підтягує файл і робить повторний запит (або надає його як tool output).

## Етапи Впровадження (Implementation Steps)

**Етап 1: Розширення `pack.js` та `Markdown.js`**
- Додати підтримку префікса `@workflow/`.
- Додати опцію в CLI (`--workflows-dir=../../packages/0HCnAI.framework/templates/workflows`) або зчитувати її з `.env`.

**Етап 2: Оновлення існуючих `system.md`**
- Замінити будь-які хардкод шляхи на `@workflow/...`.
- Створити `indexator.js` для `templates/workflows`, який автоматично формуватиме `workflows-index.md` для LLiMo.

**Етап 3: Tool / "Ліниве" завантаження контексту**
- Впровадити обробку команди `!include` або `<tool_call>` у модулі обробки відповіді LLM (`src/llm/index.js`), щоб модель могла автономно "дочитувати" інструкції під час роботи.

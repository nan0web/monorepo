# LLiMo Application — Архітектурний план v2

## 1. Принципи

1. **OLMUI (One Logic Multiple UI)** — вся логіка виконується через моделі, без прив'язки до UI (CLI, Chat, VSCode — це лише адаптери).
2. **Декларативний контракт** — кожен пакет/додаток декларує свої workflows, inspectors та pipelines у `package.json`.
3. **Локальне vs глобальне** — спочатку шукаємо в `node_modules/<pkg>/`, потім у `~/.gemini/antigravity/global_workflows/`.

## 2. Контракт `package.json#exports.llimo`

```mermaid
classDiagram
    class PackageJSON {
        +string name
        +string version
        +Exports exports
    }
    class Exports {
        +LLiMoConfig llimo
        +WorkflowDef[] workflows
        +InspectorDef[] inspectors
        +PipelineDef[] pipelines
    }
    class LLiMoConfig {
        +string[] workflows
        +AuditorModel[] inspectors
        +AIPipeline[] pipelines
    }
    class AuditorModel {
        +string name
        +string description
        +string file
    }
    class AIPipeline {
        +string name
        +string description
        +string[] steps
    }
    PackageJSON --> Exports
    Exports --> LLiMoConfig : llimo
    Exports --> "0..*" WorkflowDef : workflows
    Exports --> "0..*" InspectorDef : inspectors
    Exports --> "0..*" PipelineDef : pipelines
    LLiMoConfig --> "0..*" AuditorModel : inspectors
    LLiMoConfig --> "0..*" AIPipeline : pipelines
```

**Приклад:**

```jsonc
// packages/ai/package.json
{
  "name": "@nan0web/ai",
  "exports": {
    ".": "./src/index.js",
    "./workflows": "./docs/uk/workflows/*.md",
    "./inspect": "./docs/uk/inspectors/*.md",
    "./llimo": {
      "workflows": [
        "packages/ai/docs/uk/workflows/indexator.md",
        "packages/ai/docs/uk/workflows/commit.md"
      ],
      "inspectors": [
        { "name": "inspect-i18n", "description": "Перевірка i18n", "file": "packages/ai/docs/uk/inspectors/inspect-i18n.md" },
        { "name": "inspect-models", "description": "Перевірка моделей", "file": "packages/ai/docs/uk/inspectors/inspect-models.md" }
      ],
      "pipelines": [
        { "name": "pipeline-no1-seed", "description": "Створення seed", "steps": ["seed", "model", "contract"] },
        { "name": "pipeline-full", "description": "Повний пайплайн додатка", "steps": ["seed","model","contract","adapter","cli","chat","web","mobile","qa"] }
      ]
    }
  }
}
```

## 3. Компонентна архітектура

```mermaid
graph TB
    subgraph CLI["CLI адаптер"]
        App["App.js"]
        Ui["Ui.js"]
        runCommand["runCommand.js"]
    end

    subgraph ChatCommands["Команди (Chat/commands/)"]
        Pipeline["pipeline<br/>PipelineCommand"]
        WorkflowRun["workflow run<br/>WorkflowRunCommand ❓"]
        Inspect["inspect<br/>InspectCommand ❓"]
        List["list"]
        Release["release"]
    end

    subgraph Domain["Моделі (UI-агностичні)"]
        WM["WorkflowModel"]
        WSM["WorkflowStepModel"]
        SGM["SecurityGateModel"]
        PM["PipelineModel"]
        SubM["SubagentModel"]
        LMM["LLiMoConfigModel ❓<br/>Завантажує package.json"]
    end

    subgraph LLM["LLM"]
        AI["AI.js"]
        Chat["Chat.js"]
        Pack["pack.js"]
        Unpack["unpack.js"]
        CommandsLLM["commands/"]
    end

    subgraph Providers["Джерела контенту"]
        PKG["package.json#exports.llimo"]
        GLOBAL["~/.gemini/antigravity/<br/>global_workflows/"]
    end

    subgraph Cache["Кеш реєстру"]
        WORKFLOW_REG["WorkflowRegistry ❓"]
        INSPECTOR_REG["InspectorRegistry ❓"]
        PIPELINE_REG["PipelineRegistry ❓"]
    end

    App --> ChatCommands
    App --> Domain
    ChatCommands --> Domain
    ChatCommands --> LLM

    Pipeline --> PM
    PM --> LMM
    WorkflowRun --> WM
    Inspect --> WM

    LMM --> PKG
    LMM --> GLOBAL
    LMM --> WORKFLOW_REG
    LMM --> INSPECTOR_REG
    LMM --> PIPELINE_REG
```

## 4. Реєстрація та резолвінг

```mermaid
sequenceDiagram
    participant Cmd as Команда (inspect / workflow)
    participant LMM as LLiMoConfigModel
    participant FS as FileSystem
    participant REG as Реєстр
    participant EXEC as WorkflowModel

    Cmd->>LMM: resolve("inspect-i18n")
    LMM->>FS: шукаємо package.json у node_modules/*/
    FS-->>LMM: список exports.llimo
    LMM->>LMM: збираємо всі inspectors
    LMM->>REG: реєструємо
    LMM-->>Cmd: знайдено: @nan0web/ai → docs/uk/inspectors/inspect-i18n.md
    Cmd->>FS: читаємо файл
    FS-->>Cmd: content
    Cmd->>EXEC: WorkflowModel.run({ filename, content })
```

## 5. Потік виконання WorkflowModel (оновлений)

```mermaid
flowchart LR
    A[.md workflow] --> B[WorkflowModel.run]
    B --> C{Джерело?}
    C -- локальний файл --> D1[Читаємо з FS]
    C -- package.json#exports --> D2[Читаємо з резолвнутого шляху]
    D1 --> E
    D2 --> E
    E --> F[_parseSteps]
    F --> G[Список кроків]
    G --> H{Для кожного кроку}
    H --> I[SecurityGateModel.validate]
    I -- violation --> J[Помилка безпеки]
    I -- ok --> K[Визначити registry]
    K --> L[Трансформувати @llimo→npm/pnpm]
    L --> M[Виконати через ask intent]
    M --> N{Успішно?}
    N -- так --> O[Лог success]
    N -- ні --> P[Лог fail]
    O --> Q[Наступний крок]
    P --> Q
    Q --> H
    H -- всі --> R[Зберегти usage.csv]
    R --> S[status:ok]
```

## 6. Команди llimo та їх контракти

```mermaid
flowchart TD
    subgraph Commands["llimo <command>"]
        C1["chat"]
        C2["release"]
        C3["pipeline &lt;step&gt;"]
        C4["workflow run &lt;name&gt;"]
        C5["inspect &lt;name&gt;"]
        C6["list [workflows|inspectors|pipelines]"]
    end

    C3 --> PL["LLiMoConfigModel.resolve('pipeline-<step>')"]
    C4 --> WF["LLiMoConfigModel.resolve('<name>')"]
    C5 --> IN["LLiMoConfigModel.resolve('inspect-<name>')"]
    C6 --> LS["LLiMoConfigModel.list()"]

    PL --> WM
    WF --> WM
    IN --> WM
    LS --> CMD["Вивести таблицю"]

    subgraph Resolve["LLiMoConfigModel.resolve"]
        R1["1. Перевірити реєстр"]
        R2["2. node_modules/*/package.json"]
        R3["3. ~/.gemini/antigravity/global_workflows/"]
        R4["4. Повернути { pkg, path, name }"]
    end
    Resolve --> R1 --> R2 --> R3 --> R4
```

## 7. Нова модель: LLiMoConfigModel

```javascript
// apps/llimo.app/src/domain/LLiMoConfigModel.js
/**
 * @typedef {Object} WorkflowDef
 * @property {string} name
 * @property {string} description
 * @property {string} file    - шлях відносно пакета
 * @property {string} pkgName - звідки взято
 */

/**
 * @typedef {Object} AuditorModel
 * @property {string} name
 * @property {string} description
 * @property {string} file
 * @property {string} pkgName
 */

/**
 * @typedef {Object} AIPipeline
 * @property {string} name
 * @property {string} description
 * @property {string[]} steps
 * @property {string} pkgName
 */

/**
 * LLiMoConfigModel — сканує package.json#exports.llimo
 * у всіх встановлених пакетах та глобальній директорії.
 * Кешує результати в реєстрі для швидкого резолвінгу.
 */
export class LLiMoConfigModel extends Model {
  // ... сканування, кешування, resolve(name), list()
}
```

## 8. Мапа пакетів та їхніх контрактів

```mermaid
mindmap
  root((LLiMo Config))
    @nan0web/ai
      workflows
        indexator
        commit
        mcp-knowledge-base
        release
      inspectors
        inspect-i18n
        inspect-models
        inspect-structure
        inspect-snapshot
        inspect-jsdoc
        inspect-anti-pattern
        inspect-web
        inspect-playground
      pipelines
        pipeline-no1-seed
        pipeline-no2-model
        pipeline-no3-contract
        pipeline-no4-adapter
        pipeline-no5-ui-cli
        pipeline-no6-ui-chat
        pipeline-no7-ui-web
        pipeline-no8-ui-mobile
        pipeline-no9-qa
    @nan0web/editor
      workflows
        editor-setup
    @nan0web/auth
      workflows
        auth-setup
    ~/.gemini/antigravity/global_workflows/
      (fallback)
        anti-haste-protocol
        check-all
        code-style
        commit
        docs-site
        fix
        init-project
        restore-project
        sandbox-template
        test-fast
        zero-tolerance-git
```

## 9. План реалізації

### 9.1. LLiMoConfigModel
- Сканує `node_modules/*/package.json` на `exports.llimo`
- Сканує `~/.gemini/antigravity/global_workflows/`
- Методи: `resolve(name)`, `list(type)`, `register(pkgDir)`

### 9.2. Команда `inspect <name>`
- Шукає через LLiMoConfigModel.resolve(`inspect-<name>`)
- Виконує через WorkflowModel

### 9.3. Команда `workflow run <name>`
- Шукає через LLiMoConfigModel.resolve(`<name>`)
- Виконує через WorkflowModel

### 9.4. Команда `list [workflows|inspectors|pipelines]`
- Виводить всі знайдені елементи через LLiMoConfigModel.list()

### 9.5. Розширення PipelineCommand
- Читає pipeline з exports.llimo.pipelines або з файлу pipeline-<step>.md
- Використовує AI для генерації коду за описаним пайплайном

### 9.6. Реєстрація в `Chat/commands/index.js`

## 10. Типовий маршрут виконання

```mermaid
sequenceDiagram
    actor User
    participant CLI as llimo
    participant CMD as InspectCommand
    participant LCM as LLiMoConfigModel
    participant FS as FileSystem
    participant WM as WorkflowModel
    participant SGM as SecurityGateModel

    User->>CLI: llimo inspect i18n
    CLI->>CMD: create
    CMD->>LCM: resolve("inspect-i18n")
    LCM->>FS: сканувати node_modules/*/package.json
    FS-->>LCM: знайдено @nan0web/ai → docs/uk/inspectors/inspect-i18n.md
    LCM-->>CMD: { pkg: "@nan0web/ai", path: "...", name: "inspect-i18n" }
    CMD->>FS: читати файл
    FS-->>CMD: content
    CMD->>WM: WorkflowModel.run({ filename, content })
    WM->>WM: _parseSteps
    WM->>SGM: validate
    SGM-->>WM: ok
    WM->>WM: виконання кроків
    WM-->>CMD: result
    CMD-->>User: результат
```

## 11. Залежності

| Файл | Залежить від | Призначення |
|------|-------------|-------------|
| `domain/LLiMoConfigModel.js` | `utils/FileSystem.js` | Сканування package.json |
| `domain/WorkflowModel.js` | `domain/WorkflowStepModel.js`, `domain/SecurityGateModel.js` | Виконання кроків |
| `domain/PipelineModel.js` | `domain/LLiMoConfigModel.js` | AI-пайплайн |
| `Chat/commands/inspect.js` | `domain/LLiMoConfigModel.js`, `domain/WorkflowModel.js` | Команда inspect |
| `Chat/commands/workflow-run.js` | `domain/LLiMoConfigModel.js`, `domain/WorkflowModel.js` | Команда workflow run |
| `Chat/commands/list.js` | `domain/LLiMoConfigModel.js` | Команда list |

---

_LLiMo — модельний AI-агент без прив'язки до UI._

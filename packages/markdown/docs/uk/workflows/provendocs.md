# 📄 Workflow: ProvenDocs Manifest & Integrity Check

> 🧠 Це не просто тест. Це сценарій життя твоего пакету, записаний як приклади, покриті асертом.

Цей воркфлоу забезпечує 100% консистентність документації, її автоматичну перевірку та переклад через ШІ.

## 🏗️ Стандартна Структура

Кожен пакет МАЄ містити наступну структуру в `docs/`:

- `docs/index.md` — Головний індекс (зазвичай англійською).
- `docs/README.md` — Короткий файл-покажчик з посиланнями на локалізовані README (напр. `docs/**/README.md`).
- `docs/[lang]/index.md` — Локалізований індекс.
- `docs/[lang]/README.md` — Локалізований README.
- `docs/_/langs.nan0` (або yaml/md) — Маніфест підтримуваних мов.

## 🛠️ Команди

1. **Аудит цілісності**:
   ```bash
   nan0ai inspect --auditor ProvenDocsAuditor
   ```
2. **Тестування прикладів**:
   ```bash
   pnpm test:docs
   ```
3. **Переклад через ШІ**:
   ```bash
   pnpm translate:docs
   ```

---

## 📄 Шаблон: `README.md.js` (ProvenDoc)

Локація: `src/docs/README.md.js`.
Це генератор, який створює `README.md` та датасети для ШІ.

```js
import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { NoConsole } from '@nan0web/log'
import { DocsParser, DatasetParser } from '@nan0web/test'
import { DBFS } from '@nan0web/db-fs'
import { Something } from '../index.js'

const fs = new DBFS()
let pkg

before(async () => {
  pkg = await fs.loadDocument('package.json')
})

function testRender() {
  /**
   * @docs
   * # @nan0web/package-name
   * ## Usage
   */

  /**
   * @docs
   * Питання у форматі "How to... ?" є обов'язковими для генерації датасетів.
   */
  it('How to use it?', () => {
    //import { Something } from '@nan0web/package-name'
    const result = 'work'
    assert.equal(result, 'work')
  })
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
  const parser = new DocsParser()
  const sourceCode = await fs.loadDocument('src/docs/README.md.js')
  const text = String(parser.decode(sourceCode))

  it('generates README.md and datasets', async () => {
    await fs.saveDocument('README.md', text)
    const dataset = DatasetParser.parse(text, pkg.name)
    await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)
  })
})
```

---

## 🧼 Гігієна Документації

1. **Об'єднання блоків**: Якщо два блоки `@docs` йдуть один за одним, їх слід об'єднати в один коментар для кращого парсингу.
2. **Баланс код-блоків**: Перевіряй закриття ```.
3. **Жодних артефактів**: Видаляй технічні мітки ШІ (`[artifact: ...]`) перед публікацією.

## 🌐 Переклад (Strict AI Workflow)

Ми використовуємо **Boundary Format** для надійної передачі контексту ШІ.

### Кроки:

1. Запусти `pnpm translate:docs`.
2. ШІ отримує контекст через `docs/index.md` та перекладає **абзац за абзацом**.
3. Результат зберігається у `docs/[lang]/index.md`.

### 🧩 Boundary Format (AI Input/Output)

Для великих файлів ми використовуємо **Boundary Format**, щоб ШІ не втрачав контекст.
Вхідний файл ділиться на блоки:

```markdown
Переклади блоки в файлі `docs/uk/README.md` англійською мовою.
Формат виводу: Тільки перекладений текст блоків, в яких вказані рядки або файл цілком, якщо рядки не вказані.

--- boundary:docs/uk/README.md

# Головний заголовок

Тут текст для перекладу...

## Використання

`nan0ai search "README how to write?"`

--- boundary:docs/uk/README.md:6:8

## Використання

`nan0ai search "README how to write?"`
```

Це дозволяє ШІ чітко розрізняти, що є джерелом і розуміння що потрібно перекласти.

### 🧠 Правила для ШІ:

- **Абзац за абзацом**: Не об'єднуй абзаци, перекладай їх 1:1.
- **Технічні терміни**: Зберігай зміст технічних термінів, що є частиною API.
- **Code-Style**: Не додавай `;` та використовуй таби у коді (згідно з `/code-style`).
- **Перевірка**: Буде застасована перевірка на віідповідну структуру Markdown документа.

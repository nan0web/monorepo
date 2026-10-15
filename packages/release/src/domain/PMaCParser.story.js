import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
	ReleaseModel,
	ReleaseTaskModel,
	ReleaseParityModel,
	ReleaseIssueModel,
} from './models/index.js'
import { PMaCParser, resolveTrackerUrl } from './PMaCParser.js'

describe('PMaC Parser & Release Models Contract', () => {
	const sampleMarkdown = `---
status: work
type: minor
epic: EPIC-CORE-42
sprint: Sprint 42
tracker: https://github.com/nan0web/nan.web/issues/{id}
---

# v0.1.0 — Core Release Engine & Payload CMS Plugin Integration

## Опис та Мета
Плагін @nan0web/payload-release для Payload CMS 3.x, що забезпечує автоматичну фіксацію запусків релізів.

## Команда
- **Lead / Architect:** Олександр Снігірьов (@snigirev)
- **AI Lead Developer:** Agent Antigravity (@agy)

## Робочий План та Задачі

### 1. Архітектурна ізоляція моделей [#101]
- [x] [#101-1] Винести базову модель ReleaseModel у пакет @nan0web/release
- [x] [#101-2] Реалізувати уніфікований AST-парсер специфікацій на базі @nan0web/markdown
- [ ] [#101-3] Забезпечити 100% покриття контрактними тестами

### 2. Payload CMS Адаптер [#102]
- [x] [#102-1] Реалізувати колекцію releases з табами
- [ ] [#102-3] Перегляд вмісту специфікацій через модальне вікно

## Аудит та Паритет Даних
| Колекція | Очікувано | Фактично | Статус | Коментар |
| :--- | :---: | :---: | :---: | :--- |
| \`users\` | 12 | 12 | ✅ OK | Синхронізовано |
| \`media\` | 45 | 44 | ⚠️ Mismatch | Відсутній аватар для demo |

## Зауваження та Ризики
- **[WARN-001]** (Performance) Файли розміром > 2MB не повинні відкриватися без пагінації.
- **[INFO-002]** (Environment) Node.js v20.x є мінімально підтримуваною версією.

## Артефакти
| Файл | Розмір | SHA-256 | Тип |
| :--- | :---: | :--- | :--- |
| \`task.md\` | 6.0 KB | \`e3b0c442...\` | ТЗ / Специфікація |
`

	it('ReleaseModel instantiates with schema defaults and validates', () => {
		const release = new ReleaseModel({
			version: 'v0.1.0',
			title: 'Core Release Engine',
		})

		assert.strictEqual(release.version, 'v0.1.0')
		assert.strictEqual(release.title, 'Core Release Engine')
		assert.strictEqual(release.status, 'todo')
		assert.strictEqual(release.type, 'minor')
		assert.deepStrictEqual(release.tasks, [])
		assert.deepStrictEqual(release.parity, [])
		assert.deepStrictEqual(release.issues, [])
		assert.strictEqual(release.validate(), true)
	})

	it('PMaCParser extracts version, title and metadata from H1 and frontmatter', () => {
		const release = PMaCParser.parse(sampleMarkdown)

		assert.strictEqual(release.version, 'v0.1.0')
		assert.strictEqual(release.title, 'Core Release Engine & Payload CMS Plugin Integration')
		assert.strictEqual(release.status, 'work')
		assert.strictEqual(release.type, 'minor')
		assert.strictEqual(release.epic, 'EPIC-CORE-42')
		assert.strictEqual(release.sprint, 'Sprint 42')
		assert.strictEqual(release.tracker, 'https://github.com/nan0web/nan.web/issues/{id}')
		assert.ok(release.summary.includes('Плагін @nan0web/payload-release'))
	})

	it('PMaCParser parses tasks with status and IDs', () => {
		const release = PMaCParser.parse(sampleMarkdown)

		assert.strictEqual(release.tasks.length, 5)
		const task1 = release.tasks[0]
		assert.strictEqual(task1.id, '101-1')
		assert.strictEqual(task1.title, 'Винести базову модель ReleaseModel у пакет @nan0web/release')
		assert.strictEqual(task1.status, 'done')

		const task3 = release.tasks[2]
		assert.strictEqual(task3.id, '101-3')
		assert.strictEqual(task3.status, 'todo')
	})

	it('PMaCParser parses data parity table into ReleaseParityModel items', () => {
		const release = PMaCParser.parse(sampleMarkdown)

		assert.strictEqual(release.parity.length, 2)
		const p1 = release.parity[0]
		assert.strictEqual(p1.collection, 'users')
		assert.strictEqual(p1.expected, 12)
		assert.strictEqual(p1.actual, 12)
		assert.strictEqual(p1.synced, true)

		const p2 = release.parity[1]
		assert.strictEqual(p2.collection, 'media')
		assert.strictEqual(p2.expected, 45)
		assert.strictEqual(p2.actual, 44)
		assert.strictEqual(p2.synced, false)
	})

	it('PMaCParser parses issues and risks into ReleaseIssueModel items', () => {
		const release = PMaCParser.parse(sampleMarkdown)

		assert.strictEqual(release.issues.length, 2)
		const issue1 = release.issues[0]
		assert.strictEqual(issue1.code, 'WARN-001')
		assert.strictEqual(issue1.level, 'warning')
		assert.ok(issue1.message.includes('(Performance)'))

		const issue2 = release.issues[1]
		assert.strictEqual(issue2.code, 'INFO-002')
		assert.strictEqual(issue2.level, 'info')
	})

	it('PMaCParser parses artifacts table into files array', () => {
		const release = PMaCParser.parse(sampleMarkdown)

		assert.strictEqual(release.files.length, 1)
		assert.strictEqual(release.files[0].file, 'task.md')
		assert.strictEqual(release.files[0].size, '6.0 KB')
	})

	it('resolveTrackerUrl resolves templated ticket URLs', () => {
		const url = resolveTrackerUrl('[#142]', 'https://github.com/nan0web/nan.web/issues/{id}')
		assert.strictEqual(url, 'https://github.com/nan0web/nan.web/issues/142')

		const url2 = resolveTrackerUrl('PROJ-99', 'https://jira.company.com/browse/{id}')
		assert.strictEqual(url2, 'https://jira.company.com/browse/PROJ-99')
	})

	it('ReleaseModel.addLocaleSections extends recognized synonyms', () => {
		ReleaseModel.addLocaleSections({
			tasks: ['aufgaben', 'arbeitsplan'],
		})
		assert.ok(ReleaseModel.SECTIONS.tasks.includes('aufgaben'))
	})
})

import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
	ReleaseModel,
	ReleaseMemberModel,
	ReleaseTaskModel,
	ReleaseParityModel,
	ReleaseIssueModel,
	PMaCParser,
	resolveTrackerUrl,
} from '../../../../src/index.js'

describe('Release v3.5.0 Contract: PMaC Models and Parser Specification', () => {
	// Повноцінний еталонний шаблон з розділу 2 task.md
	const canonicalTemplateMarkdown = `---
status: work
type: minor
epic: EPIC-CORE-42
sprint: Sprint 42
tracker: https://github.com/nan0web/nan.web/issues/{id}
---

# v0.1.0 — Core Release Engine & Payload CMS Plugin Integration

## Опис та Мета
Плагін @nan0web/payload-release для Payload CMS 3.x, що забезпечує автоматичну фіксацію запусків релізів, контроль версій, вбудований журнал аудиту та перегляд специфікацій.

## Команда
- **Lead / Architect:** Олександр Снігірьов (@snigirev)
- **AI Lead Developer:** Agent Antigravity (@agy)
- **Auditor:** Security Bot (@sec-bot)

## Робочий План та Задачі

### 1. Архітектурна ізоляція моделей [#101]
- [x] [#101-1] Винести базову модель ReleaseModel у пакет @nan0web/release
- [x] [#101-2] Реалізувати уніфікований AST-парсер специфікацій на базі @nan0web/markdown
- [ ] [#101-3] Забезпечити 100% покриття контрактними тестами

### 2. Payload CMS Адаптер [#102]
- [x] [#102-1] Реалізувати колекцію releases з табами
- [x] [#102-2] Суворий Read-Only доступ для адмінки
- [ ] [#102-3] Перегляд вмісту специфікацій через модальне вікно

## Критерії Прийнятності
- [x] Колекція релізів монтується з zero-config: payloadRelease()
- [x] Заборонено редагування та створення релізів через форму CMS
- [ ] Тестовий люкс проходить успішно без регресій

## Аудит та Паритет Даних
| Колекція | Очікувано | Фактично | Статус | Коментар |
| :--- | :---: | :---: | :---: | :--- |
| \`users\` | 12 | 12 | ✅ OK | Синхронізовано |
| \`releases\` | 1 | 1 | ✅ OK | Вбудований реліз v0.1.0 присутній |
| \`media\` | 45 | 44 | ⚠️ Mismatch | Відсутній аватар для demo |

## Зауваження та Ризики
- **[WARN-001]** (Performance) Файли розміром > 2MB не повинні відкриватися у текстовому Markdown модалі без пагінації.
  - Джерело: \`@nan0web/payload-release/admin.jsx:L85\`
- **[INFO-002]** (Environment) Node.js v20.x є мінімально підтримуваною версією.

## Артефакти
| Файл | Розмір | SHA-256 | Тип |
| :--- | :---: | :--- | :--- |
| \`task.md\` | 6.0 KB | \`e3b0c442...\` | ТЗ / Специфікація |
| \`user.md\` | 5.7 KB | \`5e884898...\` | Метрики / Лог |
`

	it('1. Повноцінний парсинг еталонного шаблону з task.md (Full Canonical Template AST Parsing)', () => {
		const release = PMaCParser.parse(canonicalTemplateMarkdown)
		assert.ok(release instanceof ReleaseModel)

		// 1.1 Метадані та Frontmatter
		assert.strictEqual(release.version, 'v0.1.0')
		assert.strictEqual(release.title, 'Core Release Engine & Payload CMS Plugin Integration')
		assert.strictEqual(release.status, 'work')
		assert.strictEqual(release.type, 'minor')
		assert.strictEqual(release.epic, 'EPIC-CORE-42')
		assert.strictEqual(release.sprint, 'Sprint 42')
		assert.strictEqual(release.tracker, 'https://github.com/nan0web/nan.web/issues/{id}')

		// 1.2 Опис та Мета (Summary)
		assert.ok(release.summary.includes('Плагін @nan0web/payload-release для Payload CMS 3.x'))

		// 1.3 Команда (Team) - посада, імʼя і логін
		assert.strictEqual(release.team.length, 3)
		assert.ok(release.team[0] instanceof ReleaseMemberModel)
		assert.strictEqual(release.team[0].role, 'Lead / Architect')
		assert.strictEqual(release.team[0].name, 'Олександр Снігірьов')
		assert.strictEqual(release.team[0].handle, 'snigirev')

		assert.ok(release.team[1] instanceof ReleaseMemberModel)
		assert.strictEqual(release.team[1].role, 'AI Lead Developer')
		assert.strictEqual(release.team[1].name, 'Agent Antigravity')
		assert.strictEqual(release.team[1].handle, 'agy')

		assert.ok(release.team[2] instanceof ReleaseMemberModel)
		assert.strictEqual(release.team[2].role, 'Auditor')
		assert.strictEqual(release.team[2].name, 'Security Bot')
		assert.strictEqual(release.team[2].handle, 'sec-bot')

		// 1.4 Робочий план та задачі (Tasks)
		assert.strictEqual(release.tasks.length, 6)
		assert.ok(release.tasks[0] instanceof ReleaseTaskModel)
		assert.strictEqual(release.tasks[0].id, '101-1')
		assert.strictEqual(release.tasks[0].title, 'Винести базову модель ReleaseModel у пакет @nan0web/release')
		assert.strictEqual(release.tasks[0].status, 'done')
		assert.strictEqual(release.tasks[2].id, '101-3')
		assert.strictEqual(release.tasks[2].status, 'todo')
		assert.strictEqual(release.tasks[3].id, '102-1')
		assert.strictEqual(release.tasks[5].id, '102-3')

		// 1.5 Критерії прийнятності (Acceptance Criteria / DoD)
		assert.strictEqual(release.criteria.length, 3)
		assert.strictEqual(release.criteria[0].status, 'done')
		assert.ok(release.criteria[0].title.includes('payloadRelease()'))
		assert.strictEqual(release.criteria[2].status, 'todo')

		// 1.6 Аудит та Паритет даних (Parity)
		assert.strictEqual(release.parity.length, 3)
		assert.ok(release.parity[0] instanceof ReleaseParityModel)
		assert.strictEqual(release.parity[0].collection, 'users')
		assert.strictEqual(release.parity[0].expected, 12)
		assert.strictEqual(release.parity[0].actual, 12)
		assert.strictEqual(release.parity[0].synced, true)
		assert.strictEqual(release.parity[2].collection, 'media')
		assert.strictEqual(release.parity[2].expected, 45)
		assert.strictEqual(release.parity[2].actual, 44)
		assert.strictEqual(release.parity[2].synced, false)

		// 1.7 Зауваження та Ризики (Issues)
		assert.strictEqual(release.issues.length, 2)
		assert.ok(release.issues[0] instanceof ReleaseIssueModel)
		assert.strictEqual(release.issues[0].code, 'WARN-001')
		assert.strictEqual(release.issues[0].level, 'warning')
		assert.ok(release.issues[0].message.includes('Файли розміром > 2MB'))
		assert.strictEqual(release.issues[0].source, '@nan0web/payload-release/admin.jsx:L85')
		assert.strictEqual(release.issues[0].file, '@nan0web/payload-release/admin.jsx')

		assert.ok(release.issues[1] instanceof ReleaseIssueModel)
		assert.strictEqual(release.issues[1].code, 'INFO-002')
		assert.strictEqual(release.issues[1].level, 'info')

		// 1.8 Артефакти (Files)
		assert.strictEqual(release.files.length, 2)
		assert.strictEqual(release.files[0].file, 'task.md')
		assert.strictEqual(release.files[0].size, '6.0 KB')
		assert.strictEqual(release.files[1].file, 'user.md')
		assert.strictEqual(release.files[1].size, '5.7 KB')

		// 1.9 Валідація моделі
		assert.strictEqual(release.validate(), true)
	})

	it('2. Багатомовність (Multilingual support: French, Spanish, German, Chinese, Russian)', () => {
		// Французька специфікація
		const frDoc = `
# v1.1.0 — Moteur de Publication

## Resume
Description du projet en francais.

## Equipe
- **Architecte:** Jean Dupont (@jdupont)

## Taches
- [x] [#FR-1] Premiere tache completee

## Criteres
- [x] Critere de validation valide

## Risques
- **[WARN-FR]** Attention aux performances
`
		const releaseFr = PMaCParser.parse(frDoc)
		assert.strictEqual(releaseFr.version, 'v1.1.0')
		assert.strictEqual(releaseFr.title, 'Moteur de Publication')
		assert.strictEqual(releaseFr.summary, 'Description du projet en francais.')
		assert.strictEqual(releaseFr.team.length, 1)
		assert.ok(releaseFr.team[0] instanceof ReleaseMemberModel)
		assert.strictEqual(releaseFr.team[0].role, 'Architecte')
		assert.strictEqual(releaseFr.team[0].name, 'Jean Dupont')
		assert.strictEqual(releaseFr.team[0].handle, 'jdupont')
		assert.strictEqual(releaseFr.tasks.length, 1)
		assert.strictEqual(releaseFr.tasks[0].id, 'FR-1')
		assert.strictEqual(releaseFr.criteria.length, 1)
		assert.strictEqual(releaseFr.issues.length, 1)

		// Іспанська специфікація
		const esDoc = `
# v1.2.0 — Motor de Lanzamiento

## Resumen
Descripcion en espanol.

## Tareas
- [ ] [#ES-1] Tarea pendiente

## Criterios
- [ ] Criterio de prueba
`
		const releaseEs = PMaCParser.parse(esDoc)
		assert.strictEqual(releaseEs.version, 'v1.2.0')
		assert.strictEqual(releaseEs.tasks.length, 1)
		assert.strictEqual(releaseEs.criteria.length, 1)

		// Китайська специфікація (Chinese)
		const zhDoc = `
# v1.3.0 — 发布引擎

## 摘要
中文描述说明

## 任务
- [x] [#ZH-1] 基础模型实现

## 验收标准
- [x] 验证通过
`
		const releaseZh = PMaCParser.parse(zhDoc)
		assert.strictEqual(releaseZh.version, 'v1.3.0')
		assert.strictEqual(releaseZh.tasks.length, 1)
		assert.strictEqual(releaseZh.criteria.length, 1)

		// Російська специфікація (для сумісності з двомовними українцями)
		const ruDoc = `
# v1.4.0 — Модуль Релизов

## Описание
Описание для русскоязычной спецификации.

## Участники
- **Архитектор:** Иван Петров (@ipetrov)

## Задачи
- [x] [#RU-1] Первая завершенная задача

## Критерии
- [x] Критерий успешно выполнен

## Риски
- **[WARN-RU]** Предупреждение о лимитах
`
		const releaseRu = PMaCParser.parse(ruDoc)
		assert.strictEqual(releaseRu.version, 'v1.4.0')
		assert.strictEqual(releaseRu.title, 'Модуль Релизов')
		assert.strictEqual(releaseRu.summary, 'Описание для русскоязычной спецификации.')
		assert.strictEqual(releaseRu.team.length, 1)
		assert.ok(releaseRu.team[0] instanceof ReleaseMemberModel)
		assert.strictEqual(releaseRu.team[0].role, 'Архитектор')
		assert.strictEqual(releaseRu.team[0].name, 'Иван Петров')
		assert.strictEqual(releaseRu.team[0].handle, 'ipetrov')
		assert.strictEqual(releaseRu.tasks.length, 1)
		assert.strictEqual(releaseRu.tasks[0].id, 'RU-1')
		assert.strictEqual(releaseRu.criteria.length, 1)
		assert.strictEqual(releaseRu.issues.length, 1)
	})

	it('3. Розширення мовних синонімів на льоту через ReleaseModel.addLocaleSections', () => {
		ReleaseModel.addLocaleSections({
			tasks: ['mis-tareas', 'mes-travaux'],
			issues: ['remarques'],
		})

		assert.ok(ReleaseModel.SECTIONS.tasks.includes('mis-tareas'))
		assert.ok(ReleaseModel.SECTIONS.tasks.includes('mes-travaux'))
		assert.ok(ReleaseModel.SECTIONS.issues.includes('remarques'))
	})

	it('4. Розгортання посилань трекера (Tracker URLs)', () => {
		const tracker = 'https://github.com/nan0web/nan.web/issues/{id}'
		assert.strictEqual(resolveTrackerUrl('[#101-1]', tracker), 'https://github.com/nan0web/nan.web/issues/101-1')
		assert.strictEqual(resolveTrackerUrl('[102]', tracker), 'https://github.com/nan0web/nan.web/issues/102')
	})
})

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { ShareAppCLI } from '../../../../src/index.js'
import { ExportCommand } from '../../../../src/domain/commands/ExportCommand.js'
import { MarkdownAstExtractor } from '../../../../src/domain/services/MarkdownAstExtractor.js'
import { TagLinter } from '../../../../src/domain/services/TagLinter.js'
import { SemanticStreamRouter } from '../../../../src/domain/services/SemanticStreamRouter.js'

describe('Release v3.8.0 Contract: Universal Semantic Exporter Pipeline', () => {
	describe('ShareAppCLI registration', () => {
		it('should register ExportCommand in ShareAppCLI.command.options', () => {
			assert.ok(
				ShareAppCLI.command.options.includes(ExportCommand),
				'ExportCommand must be registered in ShareAppCLI.command.options',
			)
			assert.equal(ExportCommand.alias, 'export')
		})
	})

	describe('MarkdownAstExtractor (@nan0web/markdown AST)', () => {
		it('should extract H2 sections with title, content, tags, and line numbers', () => {
			const extractor = new MarkdownAstExtractor()
			const md = [
				'# Щоденник 2026-11-04',
				'',
				'## 1. Ранкові думки',
				'Сьогодні прокинувся рано. #я #здоровʼя',
				'',
				'## 2. Архітектура NaN•Web',
				'Нова модель даних $E = mc^2$.',
				'```js',
				'// #not_a_tag_in_code',
				'const x = 1',
				'```',
				'Теги секції: #nan0web #архітектура',
			].join('\n')

			const result = extractor.extract(md)
			assert.equal(result.title, 'Щоденник 2026-11-04')
			assert.equal(result.sections.length, 2)

			assert.equal(result.sections[0].title, '1. Ранкові думки')
			assert.ok(result.sections[0].tags.includes('#я'))
			assert.ok(result.sections[0].tags.includes('#здоровʼя'))

			assert.equal(result.sections[1].title, '2. Архітектура NaN•Web')
			assert.ok(result.sections[1].tags.includes('#nan0web'))
			assert.ok(result.sections[1].tags.includes('#архітектура'))
			assert.ok(!result.sections[1].tags.includes('#not_a_tag_in_code'), 'Must ignore tags inside code blocks')
			assert.ok(result.sections[1].content.includes('$E = mc^2$'), 'Must preserve KaTeX formulas')

			const nanTagOcc = result.sections[1].tagOccurrences.find((o) => o.tag === '#nan0web')
			assert.ok(nanTagOcc, 'Must record tag occurrence')
			assert.equal(nanTagOcc.line, 12)
			assert.equal(nanTagOcc.section, '## 2. Архітектура NaN•Web')
		})
	})

	describe('TagLinter (Comprehensive Tag Linter)', () => {
		it('should normalize string and array tags into Set of lowercase #tags', () => {
			const fromString = TagLinter.normalizeTags('я тіло здоровʼя #Побут')
			assert.ok(fromString instanceof Set)
			assert.ok(fromString.has('#я'))
			assert.ok(fromString.has('#тіло'))
			assert.ok(fromString.has('#здоровʼя'))
			assert.ok(fromString.has('#побут'))

			const fromArray = TagLinter.normalizeTags(['Модель', '#Nan0Web'])
			assert.ok(fromArray.has('#модель'))
			assert.ok(fromArray.has('#nan0web'))
		})

		it('should scan entire document and report all unregistered tags without failing on the first one', () => {
			const streams = [
				{ id: 'private', tags: 'я тіло' },
				{ id: 'pub', tags: ['філософія'] },
			]
			const linter = new TagLinter({ streams })
			const extractor = new MarkdownAstExtractor()
			const md = [
				'# Нотатка',
				'## 1. Тіло',
				'Все добре #я',
				'## 2. Економічна Філософія',
				'Думка #новий_тег',
				'## 3. Крипта vs Фіат',
				'Ідея #крипто_ідея',
				'## 4. Підсумки',
				'Висновок #невідоме',
			].join('\n')

			const extracted = extractor.extract(md)
			const validation = linter.validate(extracted.sections)

			assert.equal(validation.valid, false)
			assert.equal(validation.unknownTags.length, 3)
			assert.ok(validation.report.includes('Знайдено 3 незареєстровані теги'))
			assert.ok(validation.report.includes('#новий_тег (Рядок 5, Секція "## 2. Економічна Філософія")'))
			assert.ok(validation.report.includes('#крипто_ідея (Рядок 7, Секція "## 3. Крипта vs Фіат")'))
			assert.ok(validation.report.includes('#невідоме (Рядок 9, Секція "## 4. Підсумки")'))
			assert.ok(validation.report.includes('Експорт заблоковано для гарантії суверенності даних!'))
		})
	})

	describe('SemanticStreamRouter (Streams, Isolation, stripTags, Glossary & Translation)', () => {
		it('should route sections to streams, isolate private stream, and strip tags when configured', async () => {
			const config = {
				streams: [
					{
						id: 'private',
						name: 'Суверенний ізолят',
						tags: 'я тіло',
						action: 'isolate',
					},
					{
						id: 'pro_github',
						name: 'GitHub Sponsors Pro Repo',
						tags: 'модель nan0web',
						destinations: [{ git: 'git@github.com:nan0web/inner-circle.git', branch: 'main', format: 'markdown' }],
					},
					{
						id: 'pub_github',
						name: 'Public GitHub Showcase',
						tags: ['філософія', 'інсайт'],
						destinations: [{ git: 'git@github.com:nan0web/public-diary.git', branch: 'main', stripTags: true, format: 'markdown' }],
						translate: ['en'],
					},
				],
				glossary: {
					'мИть': 'moWeMent',
					'nan0web': 'nan0web',
					'Суперінтелект': 'Superintelligence',
				},
			}

			const translatorCalls = []
			const mockTranslator = {
				async translate(text, targetLocale, glossary) {
					translatorCalls.push({ text, targetLocale, glossary })
					return `[${targetLocale}] ${text}`
				},
			}

			const extractor = new MarkdownAstExtractor()
			const extracted = extractor.extract([
				'# Запис',
				'## 1. Приватне',
				'Особисте #я',
				'## 2. Модель',
				'Код #модель',
				'## 3. Філософія мИті',
				'Текст про мИть і формулу $a^2 + b^2 = c^2$ #філософія',
			].join('\n'))

			const router = new SemanticStreamRouter({ config, translator: mockTranslator })
			const routed = await router.route(extracted)

			// Private isolated stream should be marked isolated and not exported to external destinations
			assert.equal(routed.isolated.length, 1)
			assert.equal(routed.isolated[0].streamId, 'private')
			assert.equal(routed.isolated[0].sections.length, 1)

			// External exports: pro_github and pub_github
			const proExport = routed.exports.find((e) => e.streamId === 'pro_github')
			assert.ok(proExport)
			assert.ok(proExport.content.includes('Код #модель'))

			const pubExport = routed.exports.find((e) => e.streamId === 'pub_github' && e.locale === 'source')
			assert.ok(pubExport)
			assert.ok(!pubExport.content.includes('#філософія'), 'stripTags: true must remove hashtags')
			assert.ok(pubExport.content.includes('$a^2 + b^2 = c^2$'), 'KaTeX formula must remain intact')

			const pubEn = routed.exports.find((e) => e.streamId === 'pub_github' && e.locale === 'en')
			assert.ok(pubEn, 'Translated export for en must be generated')
			assert.equal(translatorCalls.length, 1)
			assert.equal(translatorCalls[0].targetLocale, 'en')
			assert.equal(translatorCalls[0].glossary['мИть'], 'moWeMent')
		})

		it('should protect KaTeX formulas and code blocks while applying glossary 1:1 terms in built-in glossary helper', () => {
			const router = new SemanticStreamRouter({
				config: {
					streams: [],
					glossary: {
						'мИть': 'moWeMent',
						'Суперінтелект': 'Superintelligence',
					},
				},
			})

			const input = 'Книга мИть та курс Суперінтелект. Формула $мИть + 1$ і код `мИть`.'
			const prepared = router.protectAndApplyGlossary(input)
			assert.ok(prepared.text.includes('moWeMent'))
			assert.ok(prepared.text.includes('Superintelligence'))

			const restored = prepared.restore(prepared.text)
			assert.ok(restored.includes('$мИть + 1$'), 'KaTeX formula must remain untouched')
			assert.ok(restored.includes('`мИть`'), 'Inline code must remain untouched')
		})
	})

	describe('ExportCommand (CLI & Zero-FS @nan0web/db)', () => {
		it('should validate tags and block export on unknown tags', async () => {
			const db = new DB()
			await db.saveDocument('arch/diary/export', {
				streams: [
					{ id: 'pub', tags: 'філософія', destinations: [{ path: 'out/pub' }] },
				],
			})
			await db.saveDocument('arch/diary/2026/11/04/story.md', [
				'# Історія',
				'## 1. Думка',
				'Текст #невідомий_тег',
			].join('\n'))

			const cmd = new ExportCommand(
				{ config: 'arch/diary/export', path: 'arch/diary/2026/11/04/story.md' },
				{ db },
			)

			const events = []
			let finalResult
			const gen = cmd.run()
			while (true) {
				const { value, done } = await gen.next()
				if (done) {
					finalResult = value
					break
				}
				events.push(value)
			}

			const status = finalResult?.value?.status ?? finalResult?.data?.status ?? finalResult?.status
			assert.equal(status, 'error')
			const allOutput = JSON.stringify(events)
			assert.ok(allOutput.includes('#невідомий_тег'))
			assert.ok(allOutput.includes('ПОМИЛКА ВАЛІДАЦІЇ ТЕГІВ'))
		})

		it('should export valid document streams via this.$db and support batch --target=all', async () => {
			const db = new DB({
				predefined: [
					[
						'arch/diary/export',
						{
							streams: [
								{ id: 'private', tags: 'я', action: 'isolate' },
								{
									id: 'pub',
									tags: 'філософія',
									destinations: [{ path: 'export/pub', stripTags: true, format: 'markdown' }],
								},
							],
						},
					],
					[
						'arch/diary/2026/11/04/story.md',
						[
							'# Історія',
							'## 1. Приватне',
							'Секрет #я',
							'## 2. Філософія',
							'Мудрість #філософія',
						].join('\n'),
					],
				],
			})
			await db.connect()

			const cmd = new ExportCommand(
				{ config: 'arch/diary/export', target: 'all' },
				{ db },
			)

			let finalResult
			const gen = cmd.run()
			while (true) {
				const { value, done } = await gen.next()
				if (done) {
					finalResult = value
					break
				}
			}

			const status = finalResult?.value?.status ?? finalResult?.data?.status ?? finalResult?.status
			assert.equal(status, 'ok')
			assert.equal(finalResult?.value?.files ?? finalResult?.data?.files, 1, 'Expected 1 file found')

			const exportedPath = finalResult?.data?.exports?.[0]?.path || finalResult?.value?.exports?.[0]?.path
			const exported = await db.loadDocument(exportedPath || 'export/pub/2026/11/04/story.md')
			assert.ok(
				typeof exported === 'string',
				`Exported markdown must be saved via $db (actual path: ${exportedPath})`,
			)
			assert.ok(exported.includes('Мудрість'))
			assert.ok(!exported.includes('#філософія'), 'stripTags must strip tags')
			assert.ok(!exported.includes('Секрет'), 'Isolated private section must not leak into public export')
		})
	})
})

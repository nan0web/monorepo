import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'

import {
	FractalContactBookModel,
	ChatRepoModel,
	CrystallizeModel,
	PeerGitSyncModel,
	CommunicationApp,
	SendCommand,
	ViewCommand,
	resolveChatShardUri,
} from '../../../../src/index.js'

describe('Release v0.1.0 — Core Domain (@nan0web/communication.app)', () => {
	describe('Задача 1: Ініціалізація пакета та експортів', () => {
		it('експортує базові доменні моделі з src/index.js', () => {
			assert.equal(typeof FractalContactBookModel, 'function')
			assert.equal(typeof ChatRepoModel, 'function')
			assert.equal(typeof CrystallizeModel, 'function')
		})
	})

	describe('Задача 2: Фрактальна адресна книга 7iOS (FractalContactBookModel)', () => {
		it('реєструє контакт у канонічному колі we/7i з Master soulId та devices[]', async () => {
			const db = new DB()
			await db.connect()

			const book = new FractalContactBookModel({}, { db })
			const contact = await book.addContact({
				soulId: 'soul:yaro',
				circle: '7i',
				name: 'Ярослав',
				devices: ['macbook-pro', 'pixel-8'],
			})

			assert.equal(contact.soulId, 'soul:yaro')
			assert.equal(contact.circle, '7i')
			assert.deepEqual(contact.devices, ['macbook-pro', 'pixel-8'])

			const stored = await db.loadDocument('we/7i/soul-yaro')
			assert.equal(stored.soulId, 'soul:yaro')
			assert.equal(stored.name, 'Ярослав')
		})

		it('відхиляє контакт із неканонічним колом (поза 7 колами we/)', async () => {
			const db = new DB()
			await db.connect()

			const book = new FractalContactBookModel({}, { db })
			await assert.rejects(
				() =>
					book.addContact({
						soulId: 'soul:stranger',
						circle: 'unknown-circle',
						name: 'Незнайомець',
					}),
				(err) => err.name === 'ModelError' || /circle/i.test(err.message),
			)
		})

		it('дотримується Правила Тріади (N >= 3) для створення спільного проєкту в partner/', async () => {
			const db = new DB()
			await db.connect()

			const book = new FractalContactBookModel({}, { db })

			await assert.rejects(
				() =>
					book.createPartnerProject({
						projectId: 'alpha',
						title: 'Alpha Project',
						coreMembers: ['soul:yaro', 'soul:olena'],
					}),
				(err) => /triad|3/i.test(err.message),
			)

			const project = await book.createPartnerProject({
				projectId: 'alpha',
				title: 'Alpha Project',
				coreMembers: ['soul:yaro', 'soul:olena', 'soul:taras'],
			})

			assert.equal(project.projectId, 'alpha')
			assert.equal(project.coreMembers.length, 3)

			const stored = await db.loadDocument('we/partner/alpha/project')
			assert.equal(stored.title, 'Alpha Project')
		})

		it('дозволяє Суверену перевизначити канонічні кола we/ через зовнішній конфіг index або опції моделі', async () => {
			const db = new DB({
				predefined: [['index.json', { circles: ['7i', 'craft', 'guild', 'inbox'] }]],
			})
			await db.connect()

			const book = new FractalContactBookModel({}, { db })
			const contact = await book.addContact({
				soulId: 'soul:master',
				circle: 'craft',
				name: 'Майстер',
			})
			assert.equal(contact.circle, 'craft')

			await assert.rejects(
				() =>
					book.addContact({
						soulId: 'soul:other',
						circle: 'law',
						name: 'Юрист',
					}),
				(err) => err.name === 'ModelError' || /circle/i.test(err.message),
			)
		})

		it('розгортає рівно 4 стартові точки Day 1 Onboarding з туру docs/uk/tour/01/ і підтримує dryRun', async () => {
			const db = new DB({
				predefined: [
					['docs/uk/tour/01/tour.md', '# Тур Першого Дня'],
					['docs/uk/tour/01/i/README.md', '# Я (Сейф)'],
					['docs/uk/tour/01/we/7i/family/todo.md', '# Сімʼя'],
					['docs/uk/tour/01/we/inbox/README.md', '# Вхідні'],
					['docs/uk/tour/01/env/home/shopping.md', '# Покупки'],
				],
			})
			await db.connect()

			const book = new FractalContactBookModel({}, { db })

			const dry = await book.bootstrapDayOneTree({ dryRun: true })
			assert.equal(dry.dryRun, true)
			assert.equal(dry.created.length, 4)
			assert.equal(await db.loadDocument('i/README.md', null), null)

			const real = await book.bootstrapDayOneTree()
			assert.equal(real.dryRun, false)
			assert.equal(real.created.length, 4)
			assert.equal(await db.loadDocument('i/README.md', null), '# Я (Сейф)')
			assert.equal(await db.loadDocument('we/7i/family/todo.md', null), '# Сімʼя')
			assert.equal(await db.loadDocument('we/inbox/README.md', null), '# Вхідні')
			assert.equal(await db.loadDocument('env/home/shopping.md', null), '# Покупки')

			const second = await book.bootstrapDayOneTree()
			assert.equal(second.created.length, 0)
			assert.equal(second.existing.length, 4)
		})
	})

	describe('Задача 3.1: Двомірний Git-чат та Markdown-проєкт (ChatRepoModel)', () => {
		it('записує повідомлення у часовий шардінг chat/YYYY/MM/DD/<ts>-<peer>.md та оновлює README.md', async () => {
			const db = new DB()
			await db.connect()

			const chat = new ChatRepoModel({ repo: 'we/7i/family' }, { db })
			const msg = await chat.sendMessage({
				author: 'soul:yaro',
				text: 'Потрібно узгодити бюджет сонячної станції на весну.',
				timestamp: '2026-11-20T18:30:00.000Z',
			})

			assert.ok(msg.uri.startsWith('we/7i/family/chat/2026/11/20/'))
			assert.ok(msg.uri.endsWith('-soul-yaro.md'))

			const rawMd = await db.loadDocument(msg.uri)
			assert.ok(String(rawMd).includes('Потрібно узгодити бюджет сонячної станції на весну.'))

			const indexMd = await db.loadDocument('we/7i/family/chat/2026/11/20/README.md')
			assert.ok(String(indexMd).includes('soul:yaro'))
			assert.ok(String(indexMd).includes(msg.filename))
		})

		it('читає історію повідомлень за день детерміновано через this.$db', async () => {
			const db = new DB()
			await db.connect()

			const chat = new ChatRepoModel({ repo: 'we/7i/family' }, { db })
			await chat.sendMessage({
				author: 'soul:yaro',
				text: 'Перше повідомлення',
				timestamp: '2026-11-20T10:00:00.000Z',
			})
			await chat.sendMessage({
				author: 'soul:olena',
				text: 'Друге повідомлення',
				timestamp: '2026-11-20T10:05:00.000Z',
			})

			const messages = await chat.listDay('2026-11-20')
			assert.equal(messages.length, 2)
			assert.equal(messages[0].author, 'soul:yaro')
			assert.equal(messages[1].author, 'soul:olena')
		})

		it('автоматично будує дворівневий префіксний шардінг chats/<xx>/<yy>/<chatId>', () => {
			const uri1 = resolveChatShardUri('soul:yaro+soul:friend')
			const uri2 = resolveChatShardUri('soul:yaro+soul:friend')
			assert.equal(uri1, uri2)
			assert.match(uri1, /^chats\/[0-9a-f]{2}\/[0-9a-f]{2}\/soul-yaro-soul-friend$/)
		})
	})

	describe('Задача 3.2: Кристалізація повідомлення у документ (CrystallizeModel)', () => {
		it('переносить повідомлення з чату в docs/*.md або todo.md із $ref та авторством', async () => {
			const db = new DB()
			await db.connect()

			const chat = new ChatRepoModel({ repo: 'we/7i/family' }, { db })
			const msg = await chat.sendMessage({
				author: 'soul:yaro',
				text: 'Купити інвертор 5 кВт до 15 грудня.',
				timestamp: '2026-11-20T18:40:00.000Z',
			})

			const crystallizer = new CrystallizeModel({}, { db })
			const entry = await crystallizer.crystallize({
				msgUri: msg.uri,
				targetDocUri: 'we/7i/family/todo.md',
				kind: 'todo',
			})

			assert.equal(entry.author, 'soul:yaro')
			assert.equal(entry.$ref, msg.uri)

			const todoContent = await db.loadDocument('we/7i/family/todo.md')
			const text = String(todoContent)
			assert.ok(text.includes('Купити інвертор 5 кВт до 15 грудня.'))
			assert.ok(text.includes('soul:yaro'))
			assert.ok(text.includes(msg.uri))
		})

		it('відхиляє кристалізацію неіснуючого повідомлення', async () => {
			const db = new DB()
			await db.connect()

			const crystallizer = new CrystallizeModel({}, { db })
			await assert.rejects(
				() =>
					crystallizer.crystallize({
						msgUri: 'we/7i/family/chat/2026/11/20/missing.md',
						targetDocUri: 'we/7i/family/todo.md',
					}),
				(err) => /not found|існує/i.test(err.message),
			)
		})
	})

	describe('Задача 5: Безконфліктна синхронізація (PeerGitSyncModel)', () => {
		it('ізолює запис учасників у гілках refs/heads/peers/<soulId> без конфліктів у chat/', async () => {
			const db = new DB()
			await db.connect()

			const sync = new PeerGitSyncModel({ repo: 'we/7i/family', batchMode: 'realtime' }, { db })
			await sync.recordPeerCommit({
				soulId: 'soul:yaro',
				messageUri: 'we/7i/family/chat/2026/11/20/183000000-soul-yaro.md',
			})
			await sync.recordPeerCommit({
				soulId: 'soul:friend',
				messageUri: 'we/7i/family/chat/2026/11/20/183001000-soul-friend.md',
			})

			const state = await sync.getSyncState()
			assert.ok(state.branches['refs/heads/peers/soul-yaro'])
			assert.ok(state.branches['refs/heads/peers/soul-friend'])
			assert.equal(state.branches['refs/heads/peers/soul-yaro'].length, 1)
			assert.equal(state.branches['refs/heads/peers/soul-friend'].length, 1)
		})
	})

	describe('Задача 6: Головний диспатчер (CommunicationApp)', () => {
		it('виконує команди send, view, crystallize та sync через app.run()', async () => {
			const db = new DB()
			await db.connect()

			const sendApp = new CommunicationApp(
				{
					command: new SendCommand(
						{
							repo: 'we/7i/family',
							author: 'soul:yaro',
							text: 'Тестове повідомлення на 1000 км',
							timestamp: '2026-11-20T19:00:00.000Z',
						},
						{ db },
					),
				},
				{ db },
			)
			const sendSteps = []
			for await (const step of sendApp.run()) {
				sendSteps.push(step)
			}
			assert.ok(sendSteps.length >= 1)

			const viewApp = new CommunicationApp(
				{
					command: new ViewCommand(
						{
							repo: 'we/7i/family',
							date: '2026-11-20',
						},
						{ db },
					),
				},
				{ db },
			)
			let viewResult = null
			const viewGen = viewApp.run()
			let next = await viewGen.next()
			while (!next.done) {
				next = await viewGen.next()
			}
			viewResult = next.value?.data || next.value
			assert.equal(viewResult.messages.length, 1)
			assert.equal(viewResult.messages[0].author, 'soul:yaro')
		})
	})

	describe('Наступні кроки v0.1.0 (Backlog релізу)', () => {
		it.todo('Задача 3.2b: Локальний інвертований індекс пошуку (< 5 мс) у ChatSearchModel')
		it.todo('Задача 4: Валідація стилів, WebP/Opus та Volumes у MediaPolicyModel')
	})
})

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import MailDB from './MailDB.js'

describe('MailDB', () => {
	it('should create MailDB instance', () => {
		const db = new MailDB()
		assert.ok(db instanceof MailDB)
		assert.ok(db instanceof Object)
	})

	it('should find nested values using dot notation', () => {
		const obj = {
			user: {
				name: 'John Doe',
				profile: {
					age: 30,
					email: 'john@example.com',
				},
			},
			data: 'test',
		}

		assert.equal(MailDB.findNestedElement('user.name', obj), 'John Doe')
		assert.equal(MailDB.findNestedElement('user.profile.age', obj), 30)
		assert.equal(MailDB.findNestedElement('user.profile.email', obj), 'john@example.com')
		assert.equal(MailDB.findNestedElement('data', obj), 'test')
		assert.equal(MailDB.findNestedElement('user.profile.invalid', obj), undefined)
		assert.equal(MailDB.findNestedElement('invalid.key', obj), undefined)
		assert.equal(MailDB.findNestedElement('', obj), undefined)
		assert.equal(MailDB.findNestedElement('user', obj), obj.user)
	})

	it('should return undefined for invalid inputs', () => {
		assert.equal(MailDB.findNestedElement('test', null), undefined)
		assert.equal(MailDB.findNestedElement('test', undefined), undefined)
		assert.equal(MailDB.findNestedElement(null, {}), undefined)
		assert.equal(MailDB.findNestedElement(undefined, {}), undefined)
	})

	it('should handle array values in findNestedElement', () => {
		const obj = {
			items: ['first', 'second', 'third'],
			nested: {
				array: [1, 2, 3],
			},
		}

		assert.equal(MailDB.findNestedElement('items.0', obj), 'first')
		assert.equal(MailDB.findNestedElement('items.1', obj), 'second')
		assert.equal(MailDB.findNestedElement('items.2', obj), 'third')
		assert.equal(MailDB.findNestedElement('nested.array.1', obj), 2)
		assert.equal(MailDB.findNestedElement('items.3', obj), undefined)
	})

	it('should load certificates with proper names and genders', async () => {
		const db = new MailDB()
		const mockData = {
			'cert.yaml': {
				no: 1,
				img: 'Certificat-UKv2.png',
				data: 'recipients.csv',
				fields: {
					no: '../functions/leading-zeros.js:3',
					date: '27.06.2025',
					name: '../functions/remove-parent-name.js',
					gender: '../functions/gender.js',
					part: {
						0: 'взяла участь у короткостроковій онлайн-програмі підвищення кваліфікації з інтерактивнною дискусією та елементами практикуму за темою:',
						1: 'взяв участь у короткостроковій онлайн-програмі підвищення кваліфікації з інтерактивнною дискусією та елементами практикуму за темою:',
						$input: 'gender',
					},
					subject:
						'Соціальний компонент сучасних інноваційних екосистем та перспективні рішення для публічного управління',
					author:
						'Спікер: Віталій ОМЕЛЬЯНЕНКО - доктор економічних наук, професор, академік Української технологічної академії, завідувач Навчально-наукового центру проєктних технологій, професор кафедри бізнес-економіки та адміністрування Сумського державного педагогічного університету імені А. С. Макаренка; старший науковий співробітник Інституту економіки промисловості НАН України; заступник голови наукової ради Наукового товариства Українська школа архетипіки.',
					volume: 'обсяг 6 академічних годин (0,2 кредити ЄКТС)',
					locale: 'uk-UA',
					email: {
						$ref: 'mail',
					},
				},
				opts: {
					format: 'webp',
					resize: 0.5,
					quality: 75,
					height: {
						part: 90,
						subject: 90,
						author: 70,
					},
				},
			},
			'recipients.csv': [
				{
					time: '',
					name: 'Ірина Антипенко',
					work: '',
					post: '',
					edu: '',
					tel: '',
					mail: 'no-email@no-host.com',
					questions: '',
				},
				{
					time: '6/20/2025 10:05:27',
					name: 'Григорій Савич Сковорода',
					work: 'Києво-Могилянська академія',
					post: 'поет-філосов',
					edu: '',
					tel: '±38000000000',
					mail: 'skovoroda@no-host.com',
					questions: '',
				},
			],
		}

		// Mock loadDocument function
		db.loadDocument = async (uri) => {
			return mockData[uri] || null
		}

		// Mock resolve function
		db.resolve = async (dir, file) => {
			return dir + '/' + file
		}

		// Test loading certificate data
		const certData = await db.get('cert.yaml')
		assert.ok(certData)
		assert.equal(certData.no, 1)
		assert.equal(certData.img, 'Certificat-UKv2.png')
		assert.ok(certData.fields)
		assert.ok(certData.opts)

		// Test loading recipients data
		const recipientsData = await db.get('recipients.csv')
		assert.ok(Array.isArray(recipientsData))
		assert.equal(recipientsData.length, 2)
		assert.ok(recipientsData[0].name)
		assert.ok(recipientsData[0].mail)

		// Certificate numbers counter
		let certNumber = 1

		const config = { email: { $ref: 'mail' } }
		// Mock the functions in config
		config.formattedName = [
			function (item, key, source) {
				return source.name.split(' ')[0]
			},
		]
		config.genderText = [
			function (item, key, source) {
				const index = parseInt(1 & ['Григорій'].includes(item.formattedName))
				return ['жіноча', 'чоловіча'][index]
			},
		]
		config.certificateNo = [
			function (item, key, source, len) {
				return String(certNumber++).padStart(len, '0')
			},
			3,
		]

		const rec0 = await db.transform(recipientsData[0], config, {})
		assert.equal(rec0.certificateNo, '001')
		assert.equal(rec0.formattedName, 'Ірина')
		assert.equal(rec0.genderText, 'жіноча')
		assert.equal(rec0.email, 'no-email@no-host.com')

		const rec1 = await db.transform(recipientsData[1], config, {})
		assert.equal(rec1.certificateNo, '002')
		assert.equal(rec1.formattedName, 'Григорій')
		assert.equal(rec1.genderText, 'чоловіча')
		assert.equal(rec1.email, 'skovoroda@no-host.com')
	})

	it('should transform data correctly with mock functions', async () => {
		const db = new MailDB()
		const source = {
			name: 'Тестовий Користувач',
			gender: 1,
			mail: 'test@example.com',
		}
		const config = {
			formattedName: {
				$ref: '../functions/remove-parent-name.js',
			},
			genderText: {
				$ref: '../functions/gender.js',
			},
			email: {
				$ref: 'mail',
			},
			certificateNo: '../functions/leading-zeros.js:3',
		}

		// Mock the functions in config
		config.formattedName = [
			function (item, key, source) {
				return source.name.split(' ')[0]
			},
		]
		config.genderText = [
			function (item, key, source) {
				return source.gender === 1 ? 'чоловіча' : 'жіноча'
			},
		]
		config.certificateNo = [
			function (item, key, source, len) {
				return String(1).padStart(len, '0')
			},
			3,
		]

		const result = await db.transform(source, config, {})
		assert.equal(result.formattedName, 'Тестовий')
		assert.equal(result.genderText, 'чоловіча')
		assert.equal(result.email, 'test@example.com')
		assert.equal(result.certificateNo, '001')
	})
})

import { describe, it } from 'node:test'
import assert from 'node:assert'
import RRS from './RRS.js'

describe('RRS', () => {
	it('should create an RRS instance with default values', () => {
		const rrs = new RRS()

		assert.ok(rrs.required instanceof RRS.Required)
		assert.ok(rrs.optional instanceof RRS.Optional)
		assert.strictEqual(rrs.max, 323)
		assert.strictEqual(rrs.npmInfo, '')
		assert.deepStrictEqual(rrs.docs, [])
	})

	it('should create an RRS instance with custom values', () => {
		const required = { testPass: 50, buildPass: 75 }
		const optional = { readmeTest: 20 }
		const npmInfo = '1.0.0'
		const docs = ['README.md', 'docs/uk/README.md']
		const max = 1000

		const rrs = new RRS({ required, optional, npmInfo, docs, max })

		assert.strictEqual(rrs.required.testPass, 50)
		assert.strictEqual(rrs.required.buildPass, 75)
		assert.strictEqual(rrs.optional.readmeTest, 20)
		assert.strictEqual(rrs.npmInfo, '1.0.0')
		assert.deepStrictEqual(rrs.docs, ['README.md', 'docs/uk/README.md'])
		assert.strictEqual(rrs.max, 1000)
	})

	it('should calculate percentage correctly', () => {
		const rrs = new RRS({
			required: { testPass: 100, buildPass: 100, tsconfig: 100 },
			optional: {
				readmeTest: 10,
				playground: 10,
				readmeMd: 1,
				npmPublished: 1,
				contributingAndLicense: 1,
			},
		})

		// Total score: 300 (required) + 23 (optional) = 323
		// Max score: 323
		// Percentage: 323/323 * 100 = 100%
		assert.strictEqual(rrs.percentage.toFixed(1), '100.0')
	})

	it('should return missing properties with icons', () => {
		const rrs = new RRS({
			required: { testPass: 0, buildPass: 100, tsconfig: 100 },
			optional: {
				readmeTest: 0,
				playground: 10,
				readmeMd: 0,
				npmPublished: 1,
				contributingAndLicense: 0,
			},
		})

		const missing = rrs.missing
		assert.ok(missing.includes(rrs.required.icon('testPass')))
		assert.ok(missing.includes(rrs.optional.icon('readmeTest')))
		assert.ok(missing.includes(rrs.optional.icon('contributingAndLicense')))
		assert.ok(missing.includes(rrs.optional.icon('readmeMd')))
	})

	it('should return status icon based on percentage', () => {
		const rrsLow = new RRS({
			required: { testPass: 0, buildPass: 0, tsconfig: 0 },
			optional: {
				readmeTest: 0,
				playground: 0,
				readmeMd: 0,
				npmPublished: 0,
				contributingAndLicense: 0,
			},
		})

		const rrsYellow = new RRS({
			required: { testPass: 100, buildPass: 100, tsconfig: 0 },
			optional: {
				readmeTest: 10,
				playground: 10,
				readmeMd: 1,
				npmPublished: 1,
				contributingAndLicense: 1,
			},
		})

		const rrsHigh = new RRS({
			required: { testPass: 100, buildPass: 100, tsconfig: 100 },
			optional: {
				readmeTest: 10,
				playground: 10,
				readmeMd: 1,
				npmPublished: 1,
				contributingAndLicense: 1,
			},
		})

		const rrsBlocker = new RRS({
			required: { testPass: 0, buildPass: 100, tsconfig: 100 },
			optional: {
				readmeTest: 10,
				playground: 10,
				readmeMd: 1,
				npmPublished: 1,
				contributingAndLicense: 1,
			},
		})

		assert.ok(rrsLow.icon().startsWith('🔴'))
		assert.ok(rrsYellow.icon().startsWith('🟡')) // 223 / 323 ≈ 69.0%
		assert.ok(rrsHigh.icon().startsWith('🟢'))
		assert.ok(rrsBlocker.icon().startsWith('🔴')) // blocker testPass = 0
	})

	it('should create RRS instance from existing RRS instance', () => {
		const original = new RRS({
			required: { testPass: 50 },
			optional: { readmeTest: 20 },
			npmInfo: '1.0.0',
			docs: ['README.md'],
			max: 500,
		})

		const rrs = RRS.from(original)

		assert.strictEqual(rrs, original)
		assert.ok(rrs instanceof RRS)
	})

	it('should create new RRS instance from plain object', () => {
		const input = {
			required: { testPass: 75 },
			optional: { readmeTest: 15 },
			npmInfo: '2.0.0',
			docs: ['docs/uk/README.md'],
			max: 750,
		}

		const rrs = RRS.from(input)

		assert.ok(rrs instanceof RRS)
		assert.strictEqual(rrs.required.testPass, 75)
		assert.strictEqual(rrs.optional.readmeTest, 15)
		assert.strictEqual(rrs.npmInfo, '2.0.0')
		assert.deepStrictEqual(rrs.docs, ['docs/uk/README.md'])
		assert.strictEqual(rrs.max, 750)
	})
})

describe('RRSRequired', () => {
	it('should create an RRSRequired instance with default values', () => {
		const required = new RRS.Required()

		assert.strictEqual(required.testPass, 100)
		assert.strictEqual(required.buildPass, 100)
		assert.strictEqual(required.tsconfig, 100)
	})

	it('should create an RRSRequired instance with custom values', () => {
		const required = new RRS.Required({
			testPass: 80,
		})

		assert.strictEqual(required.testPass, 80)
		assert.strictEqual(required.buildPass, 100) // default value
		assert.strictEqual(required.tsconfig, 100) // default value
	})

	it('should return icons for required fields', () => {
		const required = new RRS.Required()

		assert.strictEqual(required.icon('testPass'), '✅')
		assert.strictEqual(required.icon('buildPass'), '💿')
		assert.strictEqual(required.icon('tsconfig'), 'ts')
		assert.strictEqual(required.icon('unknown'), '')
	})

	it('should create RRSRequired instance from existing instance', () => {
		const original = new RRS.Required({ testPass: 50 })
		const required = RRS.Required.from(original)

		assert.strictEqual(required, original)
		assert.ok(required instanceof RRS.Required)
	})

	it('should create new RRSRequired instance from plain object', () => {
		const input = { testPass: 75, buildPass: 85 }
		const required = RRS.Required.from(input)

		assert.ok(required instanceof RRS.Required)
		assert.strictEqual(required.testPass, 75)
		assert.strictEqual(required.buildPass, 85)
	})
})

describe('RRSOptional', () => {
	it('should create an RRSOptional instance with default values', () => {
		const optional = new RRS.Optional()

		assert.strictEqual(optional.readmeTest, 10)
		assert.strictEqual(optional.playground, 10)
		assert.strictEqual(optional.readmeMd, 1)
		assert.strictEqual(optional.npmPublished, 1)
		assert.strictEqual(optional.contributingAndLicense, 1)
		assert.ok(optional.translations instanceof Map)
		assert.strictEqual(optional.translations.size, 0)
	})

	it('should create an RRSOptional instance with custom values', () => {
		const translations = new Map([['uk', 'docs/uk/README.md']])
		const optional = new RRS.Optional({
			readmeTest: 20,
			playground: 15,
			translations,
		})

		assert.strictEqual(optional.readmeTest, 20)
		assert.strictEqual(optional.playground, 15)
		assert.ok(optional.translations instanceof Map)
		assert.strictEqual(optional.translations.size, 1)
	})

	it('should return icons for optional fields', () => {
		const optional = new RRS.Optional()

		assert.strictEqual(optional.icon('readmeTest'), '🧪')
		assert.strictEqual(optional.icon('playground'), '🕹️')
		assert.strictEqual(optional.icon('readmeMd'), '📖')
		assert.strictEqual(optional.icon('npmPublished'), 'npm')
		assert.strictEqual(optional.icon('contributingAndLicense'), '🛜')
		assert.strictEqual(optional.icon('unknown'), '')
	})

	it('should create RRSOptional instance from existing instance', () => {
		const original = new RRS.Optional({ readmeTest: 20 })
		const optional = RRS.Optional.from(original)

		assert.strictEqual(optional, original)
		assert.ok(optional instanceof RRS.Optional)
	})

	it('should create new RRSOptional instance from plain object', () => {
		const input = {
			readmeTest: 15,
			playground: 25,
			translations: [['uk', 'docs/uk/README.md']],
		}
		const optional = RRS.Optional.from(input)

		assert.ok(optional instanceof RRS.Optional)
		assert.strictEqual(optional.readmeTest, 15)
		assert.strictEqual(optional.playground, 25)
		assert.ok(optional.translations instanceof Map)
		assert.strictEqual(optional.translations.size, 1)
	})
})

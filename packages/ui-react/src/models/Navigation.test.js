import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Navigation from './Navigation.js'

describe("Navigation", () => {
	it('Navigation isActive returns true for exact match or parent folder', () => {
		const nav = new Navigation({ href: 'folder' })
		assert.strictEqual(nav.isActive('folder'), true)
		assert.strictEqual(nav.isActive('folder/sub'), true)
		assert.strictEqual(nav.isActive('other'), false)
	})

	it('Navigation get returns self if uri matches', () => {
		const nav = new Navigation({ href: 'folder' })
		assert.ok(nav.get('folder') === nav)
		assert.strictEqual(nav.get('other'), null)
	})

	it('Navigation map work on elements', () => {
		const nav = new Navigation({ children: [{ href: 'child1' }, { href: 'child2' }] })
		let count = 0
		nav.map(() => count++)
		assert.strictEqual(count, 2)
		const mapped = nav.map(e => e.href)
		assert.deepEqual(mapped, ['child1', 'child2'])
	})

	it('Navigation count return number of elements', () => {
		const nav = new Navigation({ children: [{ href: 'child1' }] })
		assert.strictEqual(nav.count, 1)
	})

	it('Navigation url returns href with leading slash', () => {
		const nav = new Navigation({ href: 'path' })
		assert.strictEqual(nav.url, '/path')
		const nav2 = new Navigation({ href: '/path' })
		assert.strictEqual(nav2.url, '/path')
	})

	it('Navigation toString returns formatted string', () => {
		const nav = new Navigation({ icon: 'icon', title: 'title', href: 'href', disabled: true })
		const str = nav.toString()
		assert.ok(str.includes('icon'))
		assert.ok(str.includes('title'))
		assert.ok(str.includes('<href>'))
		assert.ok(str.includes('(disabled)'))
	})

	it("get empty with new instance", () => {
		const value = new Navigation()
		assert.ok(value.empty)
	})

	it("get not empty with updated instance", () => {
		const value = new Navigation("https://yaro.page")
		assert.ok(!value.empty)
	})

	const testSet = [
		["https://yaro.page/", "https://yaro.page/about.html", false],
		["https://yaro.page/", "/about.html", false],
		["https://yaro.page/", "about.html", false],
		["https://yaro.page/", "#hash", false],
		["https://yaro.page/", "ftp://guest@yaro.page/about.pdf", false],
		["https://yaro.page/", "mailto:support@yaro.page", false],

		["https://yaro.page/", "https://www.youtube.com/@solution-n-social", true],
		["https://yaro.page/", "mailto:test@test.com", true],
		["https://yaro.page/", "data:image/png;base64,...", true],
		["https://yaro.page/", "file:///Users/i/index.html", true],
	]

	describe("Navigation isExternal()", () => {
		testSet.filter(a => a[2]).forEach(([src, url, expected]) => {
			it("should be an external link " + url, () => {
				const nav = new Navigation(src)
				assert.equal(nav.isExternal(url), expected)
			})
		})
		testSet.filter(a => !a[2]).forEach(([src, url, expected]) => {
			it("should not be an external link " + url, () => {
				const nav = new Navigation(src)
				assert.equal(nav.isExternal(url), expected)
			})
		})
	})

})


/**
 * Benchmark Script: NaN0 vs YAML vs JSON vs Markdown
 * Run manually: node src/domain/NaN0.benchmark.js
 */
import assert from 'node:assert/strict'
import yaml from 'yaml'
import NaN0 from './NaN0.js'

const iterations = 10000

// We make 'content' string large enough.
// In JSON/YAML/NaN0 it's just 'content' field.
// In Markdown format - it's 'body', and everything else is frontmatter.
const testData = {
	title: "App.Menu.Catalog",
	description: "The main catalog page with a very long description to test parser performance. It has multiple lines and complex structure.",
	tags: ["catalog", "store", "items", "ecommerce", "performance", "benchmark", "ui", "components"],
	meta: {
		views: 10420,
		active: true,
		rating: 4.8,
		categories: ["electronics", "books", "hardware", "software", "toys", "groceries"],
		flags: {
			isNew: false,
			isFeatured: true,
			hasDiscount: false,
			requiresAuth: true
		},
		location: {
			country: "Ukraine",
			city: "Kyiv",
			region: "Kyivska"
		}
	},
	settings: {
		theme: "dark",
		language: "uk",
		currency: "UAH",
		notifications: true,
		layout: {
			sidebar: "left",
			header: "sticky",
			footer: "minimal"
		}
	},
	features: Array.from({ length: 30 }, (_, i) => ({
		id: `feat_${i}`,
		name: `Feature ${i}`,
		enabled: i % 2 === 0,
		description: `Description for feature ${i}. This provides some additional text content for the JSON to parse over. We want to increase the size to about 5000 bytes.`.repeat(2)
	})),
	content: Array.from({ length: 15 }, (_, i) => `## Chapter ${i}
This is the content for chapter ${i}. It simulates a markdown body which is large enough to test raw string extraction over parsing.
We are adding multiple sections, paragraphs, and lists.
- Item A
- Item B
- Item C
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`).join('')
}

console.log(`\n--- Running benchmark with ${iterations} iterations ---\n`)

function measure(name, fn) {
	const start = performance.now()
	const res = fn()
	const end = performance.now()
	return { name, duration: end - start, result: res }
}

const metrics = {}

// ======================================
// 1. JSON
// ======================================
let jsonStr = ''
metrics.jsonStr = measure('JSON Stringify', () => {
	for (let i = 0; i < iterations; i++) {
		jsonStr = JSON.stringify(testData)
	}
	return jsonStr
}).duration

let jsonParsed
metrics.jsonParse = measure('JSON Parse', () => {
	for (let i = 0; i < iterations; i++) {
		jsonParsed = JSON.parse(jsonStr)
	}
	return jsonParsed
}).duration
assert.deepEqual(jsonParsed, testData, "JSON parse failed")

// ======================================
// 2. YAML
// ======================================
let yamlStr = ''
metrics.yamlStr = measure('YAML Stringify', () => {
	for (let i = 0; i < iterations; i++) {
		yamlStr = yaml.stringify(testData)
	}
	return yamlStr
}).duration

let yamlParsed
metrics.yamlParse = measure('YAML Parse', () => {
	for (let i = 0; i < iterations; i++) {
		yamlParsed = yaml.parse(yamlStr)
	}
	return yamlParsed
}).duration
assert.deepEqual(yamlParsed, testData, "YAML parse failed")

// ======================================
// 3. NaN0
// ======================================
let nan0Str = ''
metrics.nan0Str = measure('NaN0 Stringify', () => {
	for (let i = 0; i < iterations; i++) {
		nan0Str = NaN0.stringify(testData)
	}
	return nan0Str
}).duration

let nan0Parsed
metrics.nan0Parse = measure('NaN0 Parse', () => {
	for (let i = 0; i < iterations; i++) {
		nan0Parsed = NaN0.parse(nan0Str)
	}
	return nan0Parsed
}).duration
assert.deepEqual(nan0Parsed, testData, "NaN0 parse failed")

// ======================================
// 4. Markdown (Frontmatter + Body)
// ======================================
let mdStr = ''
metrics.mdStr = measure('Markdown Stringify', () => {
	for (let i = 0; i < iterations; i++) {
		const { content, ...fm } = testData
		mdStr = `---\n${yaml.stringify(fm)}---\n${content}`
	}
	return mdStr
}).duration

let mdParsed = {}
metrics.mdParse = measure('Markdown Parse', () => {
	const mdRegex = /^---\n([\s\S]+?)\n---\n([\s\S]*)$/
	for (let i = 0; i < iterations; i++) {
		const match = mdStr.match(mdRegex)
		if (match) {
			const fmParsed = yaml.parse(match[1])
			mdParsed = { ...fmParsed, content: match[2] }
		}
	}
	return mdParsed
}).duration
try {
	assert.deepEqual(mdParsed, testData)
} catch(e) {
	for(const k of Object.keys(testData)) {
		const expected = JSON.stringify((/** @type {any} */ (testData))[k])
		const actual = JSON.stringify((/** @type {any} */ (mdParsed))[k])
		if(actual !== expected) {
			console.log("MD Parse diff on key:", k)
			console.log("Expected length:", expected.length, "Actual:", actual.length)
		}
	}
	throw e
}

// ======================================
// 5. MD+NaN0 (NaN0 Frontmatter + Body)
// ======================================
let mdNan0Str = ''
metrics.mdNan0Str = measure('MD+NaN0 Stringify', () => {
	for (let i = 0; i < iterations; i++) {
		const { content, ...fm } = testData
		mdNan0Str = `---\n${NaN0.stringify(fm)}\n---\n${content}`
	}
	return mdNan0Str
}).duration

let mdNan0Parsed
metrics.mdNan0Parse = measure('MD+NaN0 Parse', () => {
	const mdRegex = /^---\n([\s\S]+?)\n---\n([\s\S]*)$/
	for (let i = 0; i < iterations; i++) {
		const match = mdNan0Str.match(mdRegex)
		if (match) {
			const fmParsed = NaN0.parse(match[1])
			mdNan0Parsed = { ...fmParsed, content: match[2] }
		}
	}
	return mdNan0Parsed
}).duration
assert.deepEqual(mdNan0Parsed, testData, "MD+NaN0 parse failed")

const f = (n) => n.toFixed(2) + 'ms'
const m = (n, base) => (n / base).toFixed(1) + 'x'
const pDiff = (val, base) => {
	if (val === base) return ''
	const p = Number(((val - base) / base * 100).toFixed(1))
	return `(${p > 0 ? '+' : ''}${p}%)`
}
const lFmt = (val, base) => `${val} ${pDiff(val, base)}`

const jsonLen = jsonStr.length

console.log(`| Format    | Stringify  | vs JSON | Parse      | vs JSON | Length |`)
console.log(`|-----------|------------|---------|------------|---------|--------|`)
console.log(`| **JSON**  | ${f(metrics.jsonStr).padEnd(10)} | 1.0x    | ${f(metrics.jsonParse).padEnd(10)} | 1.0x    | ${jsonLen} |`)
console.log(`| **NaN0**  | ${f(metrics.nan0Str).padEnd(10)} | ${m(metrics.nan0Str, metrics.jsonStr).padEnd(7)} | ${f(metrics.nan0Parse).padEnd(10)} | ${m(metrics.nan0Parse, metrics.jsonParse).padEnd(7)} | ${lFmt(nan0Str.length, jsonLen)} |`)
console.log(`| **YAML**  | ${f(metrics.yamlStr).padEnd(10)} | ${m(metrics.yamlStr, metrics.jsonStr).padEnd(7)} | ${f(metrics.yamlParse).padEnd(10)} | ${m(metrics.yamlParse, metrics.jsonParse).padEnd(7)} | ${lFmt(yamlStr.length, jsonLen)} |`)
console.log(`| **MD**    | ${f(metrics.mdStr).padEnd(10)} | ${m(metrics.mdStr, metrics.jsonStr).padEnd(7)} | ${f(metrics.mdParse).padEnd(10)} | ${m(metrics.mdParse, metrics.jsonParse).padEnd(7)} | ${lFmt(mdStr.length, jsonLen)} |`)
console.log(`| **MD+N0** | ${f(metrics.mdNan0Str).padEnd(10)} | ${m(metrics.mdNan0Str, metrics.jsonStr).padEnd(7)} | ${f(metrics.mdNan0Parse).padEnd(10)} | ${m(metrics.mdNan0Parse, metrics.jsonParse).padEnd(7)} | ${lFmt(mdNan0Str.length, jsonLen)} |`)

console.log(`\n✅ Всі парсери успішно зібрали ідентичний об'єкт!`)

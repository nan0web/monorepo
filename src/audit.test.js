import { describe, it } from "node:test"
import assert from "node:assert"
import { parseAuditBlock, parseAuditResult } from "./audit.js"
import AuditIssue from "./AuditIssue.js"

/**
 * Example audit output containing four vulnerability blocks.
 */
const example = `
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ critical            │ Happy DOM: VM Context Escape can lead to Remote Code   │
│                     │ Execution                                              │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ happy-dom                                              │
│ Vulnerable versions │ <20.0.0                                                │
│ Patched versions    │ >=20.0.0                                               │
│ Paths               │ packages__auth-core>@nan0web/test>happy-dom            │
│ More info           │ https://github.com/advisories/GHSA-37j7-fg3j-429f      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ high                │ glob CLI: Command injection via -c/--cmd executes      │
│                     │ matches with shell:true                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ glob                                                   │
│ Vulnerable versions │ >=10.2.0 <10.5.0                                       │
│ Patched versions    │ >=10.5.0                                               │
│ Paths               │ packages__ui>@vitest/coverage-v8>test-exclude>glob     │
│ More info           │ https://github.com/advisories/GHSA-5j98-mcp5-4vw2      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ esbuild enables any website to send any requests to    │
│                     │ the development server and read the response           │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ esbuild                                                │
│ Vulnerable versions │ <=0.24.2                                               │
│ Patched versions    │ >=0.25.0                                               │
│ Paths               │ apps__base.app>vite>esbuild                            │
│ More info           │ https://github.com/advisories/GHSA-67mh-4wv8-2f99      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ Nodemailer: Email to an unintended domain can occur    │
│                     │ due to Interpretation Conflict                         │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ nodemailer                                             │
│ Vulnerable versions │ <7.0.7                                                 │
│ Patched versions    │ >=7.0.7                                                │
│ Paths               │ packages__html>nodemailer                              │
│ More info           │ https://github.com/advisories/GHSA-mm7p-fcc7-pg87      │
└─────────────────────┴────────────────────────────────────────────────────────┘
4 vulnerabilities found
Severity: 2 moderate | 1 high | 1 critical
`

const expectedFirst = new AuditIssue({
	type: "critical",
	text: "Happy DOM: VM Context Escape can lead to Remote Code Execution",
	pkg: "happy-dom",
	vulnerable: "<20.0.0",
	patched: ">=20.0.0",
	paths: "packages__auth-core>@nan0web/test>happy-dom",
	info: "https://github.com/advisories/GHSA-37j7-fg3j-429f",
})

const expectedAll = [
	expectedFirst,
	new AuditIssue({
		type: "high",
		text: "glob CLI: Command injection via -c/--cmd executes matches with shell:true",
		pkg: "glob",
		vulnerable: ">=10.2.0 <10.5.0",
		patched: ">=10.5.0",
		paths: "packages__ui>@vitest/coverage-v8>test-exclude>glob",
		info: "https://github.com/advisories/GHSA-5j98-mcp5-4vw2",
	}),
	new AuditIssue({
		type: "moderate",
		text: "esbuild enables any website to send any requests to the development server and read the response",
		pkg: "esbuild",
		vulnerable: "<=0.24.2",
		patched: ">=0.25.0",
		paths: "apps__base.app>vite>esbuild",
		info: "https://github.com/advisories/GHSA-67mh-4wv8-2f99",
	}),
	new AuditIssue({
		type: "moderate",
		text: "Nodemailer: Email to an unintended domain can occur due to Interpretation Conflict",
		pkg: "nodemailer",
		vulnerable: "<7.0.7",
		patched: ">=7.0.7",
		paths: "packages__html>nodemailer",
		info: "https://github.com/advisories/GHSA-mm7p-fcc7-pg87",
	}),
]

describe("parseAuditBlock()", () => {
	it("parses a single block correctly", () => {
		const block = `
│ critical            │ Happy DOM: VM Context Escape can lead to Remote Code   │
│                     │ Execution                                              │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ happy-dom                                              │
│ Vulnerable versions │ <20.0.0                                                │
│ Patched versions    │ >=20.0.0                                               │
│ Paths               │ packages__auth-core>@nan0web/test>happy-dom            │
│ More info           │ https://github.com/advisories/GHSA-37j7-fg3j-429f      │
`.trim()

		const got = parseAuditBlock(block)
		assert.deepStrictEqual(got, expectedFirst)
	})
})

describe("parseAuditResult()", () => {
	it("extracts all audit blocks", () => {
		const got = parseAuditResult(example)
		assert.strictEqual(got.length, 4)
		assert.deepStrictEqual(got[0], expectedFirst)

		const types = got.map((o) => o.type).sort()
		assert.deepStrictEqual(types, ["critical", "high", "moderate", "moderate"])
	})

	it("returns objects that can be instantiated as AuditIssue", () => {
		const blocks = parseAuditResult(example)
		const issues = blocks.map((b) => new AuditIssue(b))

		const first = issues[0]
		assert.strictEqual(first.type, expectedFirst.type)
		assert.strictEqual(first.text, expectedFirst.text)
		assert.strictEqual(first.pkg, expectedFirst.pkg)
		assert.strictEqual(first.vulnerable, expectedFirst.vulnerable)
		assert.strictEqual(first.patched, expectedFirst.patched)
		assert.strictEqual(first.paths, expectedFirst.paths)
		assert.strictEqual(first.info, expectedFirst.info)
	})

	it("should parse all blocks properly", () => {
		const got = parseAuditResult(example)
		assert.deepStrictEqual(got, expectedAll)
	})
})

describe("AuditIssue class", () => {
	it("creates an empty instance when no arguments are given", () => {
		const issue = new AuditIssue()
		assert.deepStrictEqual(issue, new AuditIssue({
			type: "low",
			text: undefined,
			pkg: undefined,
			vulnerable: undefined,
			patched: undefined,
			paths: undefined,
			info: undefined,
		}))
	})

	it("preserves unknown properties without mutation", () => {
		const raw = { type: "low", foo: "bar", extra: 123 }
		const issue = new AuditIssue(raw)
		assert.strictEqual(issue.type, "low")
		// unknown properties are not part of the plain result
		assert.strictEqual(issue.foo, undefined)
		assert.strictEqual(issue.extra, undefined)
	})
})

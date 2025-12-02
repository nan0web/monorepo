import { describe, it, before, after } from "node:test"
import assert from "node:assert"
import fs from "node:fs/promises"
import path from "node:path"
import { tmpdir } from "node:os"

import { runCommandAsync } from "./runCommandAsync.js"
import { getDependencies } from "./getDependencies.js"
import { getBuildOrder } from "./getBuildOrder.js"
import { clonePackage } from "./clonePackage.js"
import { installDependencies } from "./installDependencies.js"
import { runTests } from "./runTests.js"
import { runPnpmAudit } from "./runPnpmAudit.js"
import { autoFixAudit } from "./autoFixAudit.js"
import { cleanup } from "./cleanup.js"

/* -------------------------------------------------------------------------- */
/* Helpers – ensure mock mode is enabled for the whole suite.                   */
/* -------------------------------------------------------------------------- */
before(() => {
	process.env.MOCK_RUN_COMMAND = "true"
	process.env.MOCK_CLONE = "true"
})

after(() => {
	delete process.env.MOCK_RUN_COMMAND
	delete process.env.MOCK_CLONE
})

describe("runCommandAsync – mock mode", () => {
	it("returns deterministic result when MOCK_RUN_COMMAND is true", async () => {
		const res = await runCommandAsync("echo", ["hello"])
		assert.strictEqual(res.code, 0)
		assert.strictEqual(res.output, "")
	})
})

describe("getDependencies – DB mock", () => {
	it("filters only @nan0web/ deps", async () => {
		const mockDb = {
			async loadDocument() {
				return {
					dependencies: { "@nan0web/foo": "1.0.0", other: "2.0.0" },
					devDependencies: { "@nan0web/bar": "1.2.3" },
					peerDependencies: { "@nan0web/baz": "^3.0.0", something: "4.5.6" },
				}
			},
			absolute: () => "package.json",
		}
		const deps = await getDependencies(mockDb)
		assert.deepStrictEqual(deps.sort(), ["@nan0web/bar", "@nan0web/baz", "@nan0web/foo"].sort())
	})
})

describe("clonePackage – mock mode", () => {
	it("creates a temporary package with test:all script", async () => {
		const pkgRoot = await clonePackage("ignored://url", "demo-pkg")
		const pjPath = path.join(pkgRoot, "package.json")
		const pj = JSON.parse(await fs.readFile(pjPath, "utf8"))
		assert.ok(pj.scripts?.["test:all"])
	})
})

describe("installDependencies & runTests – mock mode", () => {
	it("resolve without throwing", async () => {
		await installDependencies("/tmp")
		await runTests("/tmp")
	})
})

describe("runPnpmAudit – mock mode", () => {
	it("returns an empty array", async () => {
		const issues = await runPnpmAudit()
		assert.deepStrictEqual(issues, [])
	})
})

describe("autoFixAudit – mock mode", () => {
	it("returns a successful stubbed result", async () => {
		const res = await autoFixAudit()
		assert.strictEqual(res.code, 0)
	})
})

describe("cleanup – real file system", () => {
	it("removes a created temporary directory", async () => {
		const dir = path.join(tmpdir(), `tmp-${Date.now()}`)
		await fs.mkdir(dir)
		await cleanup(dir)
		const exists = await fs.stat(dir).then(() => true).catch(() => false)
		assert.strictEqual(exists, false)
	})
})

describe("getBuildOrder algorithm", () => {
	it("orders a simple DAG correctly", () => {
		const map = {
			A: ["B", "C"],
			B: ["C"],
			C: [],
			D: ["A"],
		}
		const order = getBuildOrder(map)
		const idx = (n) => order.indexOf(n)
		assert.ok(idx("C") < idx("B"))
		assert.ok(idx("B") < idx("A"))
		assert.ok(idx("A") < idx("D"))
	})
})

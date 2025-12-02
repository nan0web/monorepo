import { describe, it } from "node:test"
import assert from "node:assert"
import { runCommandAsync } from "./runCommandAsync.js"
import { getDependencies } from "./getDependencies.js"
import { getBuildOrder } from "./getBuildOrder.js"
import * as clonePkg from "./clonePackage.js"
import * as installDep from "./installDependencies.js"
import * as runTest from "./runTests.js"
import * as auditRun from "./runPnpmAudit.js"
import * as fixAudit from "./autoFixAudit.js"
import * as clean from "./cleanup.js"

describe("utility module exports", () => {
	it("runCommandAsync is a function", () => {
		assert.strictEqual(typeof runCommandAsync, "function")
	})
	it("getDependencies is a function", () => {
		assert.strictEqual(typeof getDependencies, "function")
	})
	it("getBuildOrder is a function", () => {
		assert.strictEqual(typeof getBuildOrder, "function")
	})
	it("clonePackage exports a function", () => {
		assert.strictEqual(typeof clonePkg.clonePackage, "function")
	})
	it("installDependencies exports a function", () => {
		assert.strictEqual(typeof installDep.installDependencies, "function")
	})
	it("runTests exports a function", () => {
		assert.strictEqual(typeof runTest.runTests, "function")
	})
	it("runPnpmAudit exports a function", () => {
		assert.strictEqual(typeof auditRun.runPnpmAudit, "function")
	})
	it("autoFixAudit exports a function", () => {
		assert.strictEqual(typeof fixAudit.autoFixAudit, "function")
	})
	it("cleanup exports a function", () => {
		assert.strictEqual(typeof clean.cleanup, "function")
	})
})

describe("getBuildOrder algorithm", () => {
	it("returns correct order for simple DAG", () => {
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

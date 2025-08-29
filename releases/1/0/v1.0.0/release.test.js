import { suite, describe, it, before } from "node:test"
import assert from "node:assert/strict"
import DBFS from "@nan0web/db-fs"
import Logger from "@nan0web/log"

console.info([
	Logger.style(Logger.LOGO, { bgColor: "cyan", color: "magenta" }),
	[
		Logger.style("v1.0.0", { bgColor: "magenta", color: "white" }),
		"Initial release of nan0web framework monorepo"
	].join(" "),
	"",
	"       0 is Not a Number = it is universe",
	"       1 = is the start of dividing universe into individiums",
	"",
	"       Let's begin a new [java]script meta[verse] nan0web",
	"",
].join("\n"))

describe("Release v1.0.0", () => {
	/** @type {DBFS} */
	let db
	/** @type {object} */
	let config
	before(async () => {
		db = new DBFS()
		config = await db.loadDocument("pnpm-workspace.yaml")
	})
	it("Every package must pass pnpm test", () => {
		// @todo
		console.log(config.packages)
	})
	it("Every package must have generated d.ts", () => {

	})
	it("Every package must have README.md", () => {

	})
	it("Every package must have translated documentation", () => {

	})
})

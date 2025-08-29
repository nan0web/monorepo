#!/usr/bin/env node
import { execSync } from 'node:child_process'
import process from 'node:process'
import { Command, CommandMessage, CommandOption } from "@nan0web/co"
import { FilterString } from "@nan0web/types"
import Logger from "@nan0web/log"
import DB from "@nan0web/db-fs"

class CatchyLogger extends Logger {
	/**
	 * @todo I want to have condition args
	 * logger.catch(fn, renderFn)
	 * logger.catch(fn, thisRef)
	 * logger.catch(fn, renderFn, thisRef)
	 * Is this possible?
	 */
	async catch(fn, renderFn, thisRef) {
		try {
			return await fn()
		} catch (err) {
			if (renderFn) {
				renderFn(err)
			} else {
				this.error(err.message)
				this.debug(err.stack)
			}
			return undefined
		}
	}
	catchSync(fn, renderFn, thisRef) {
		try {
			return fn()
		} catch (err) {
			if (renderFn) {
				renderFn(err)
			} else {
				this.error(err.message)
				this.debug(err.stack)
			}
			return undefined
		}
	}
	/**
	 * @param {object} input
	 * @returns {CatchyLogger}
	 */
	static from(input) {
		if (input instanceof CatchyLogger) return input
		return new CatchyLogger(input)
	}
}

class App extends Command {
	/** @type {CatchyLogger} */
	logger
	/** @type {DB} */
	db
	/** @type {object} */
	packageConfig
	constructor(config = {}) {
		super(config)
		const {
			logger = new CatchyLogger(),
			db = new DB()
		} = config
		this.addOption("debug", Boolean, false, "Show debug information")
		this.addOption("app", Boolean, false, "Check apps instead of packages")
		this.addArgument("help", String, false, "Show help")
		this.logger = CatchyLogger.from(logger)
		this.db = DB.from(db)
	}
	async requireVersion() {
		await this.logger.catch(async () => {
			this.packageConfig = await this.db.loadDocument("package.json", {})
		}, this)
	}
	showHelp() {
		const version = Logger.style(
			this.packageConfig.version, { bgColor: "red", color: "white" }
		)
		const usage = []
		if (this.options.size) {
			usage.push(["Options:"])
			this.options.forEach((o) => usage.push([o.prefix + o.name, o.info, o.help, o.defaultText]))
			usage.push([])
		}
		if (this.arguments.size) {
			usage.push(["Arguments:"])
			this.arguments.forEach((a) => usage.push([a.name, a.info, a.help, a.defaultText]))
			usage.push([])
		}
		this.logger.info([
			Logger.RESET, Logger.style(Logger.LOGO, { bgColor: "cyan", color: "magenta" }),
			`${version} @nan0web/monorepo/bin/release-status`,
			"Usage: release-status [command] [options]",
		].join("\n"))
	}
	/**
	 * @param {CommandMessage} cmd
	 */
	async renderStatus(cmd) {
		const stream = this.db.readDir(
			cmd.opts.app ? "apps" : "packages",
			{
				depth: 1,
				/**
				 * @param {FilterString} uri
				 * @returns {boolean}
				 */
				filter: (uri) => !uri.inIncludes("/.git/", "/node_modules/")
			}
		)
		const packages = []
		for await (const entry of stream) {
			if (entry.isDirectory) {
				packages.push(entry.path)
			}
		}
		const names = packages.filter(p => 2 == p.split("/").length).map(p => p.split("/").pop())
		const releases = packages.filter(p => {
			const words = p.split("/")
			return 3 == words.length && "releases" === words[2]
		})
		if (0 === releases.length) {
			this.logger.success("No releases found in the packages")
			return
		}
		console.info(releases)
	}
	static async run(argv = []) {
		const app = new App({
			logger: new Logger({ level: Logger.detectLevel(argv) })
		})
		const msg = app.parse(argv)

		await app.requireVersion()

		if (msg.args.includes("help") || msg.opts["help"]) {
			app.showHelp()
			return
		}

		await app.renderStatus(msg)
	}
}

App.run(process.argv.slice(2)).catch(err => {
	console.error(err)
	process.exit(1)
})

// const isAppMode = process.argv.includes('--app')
// const testCommand = isAppMode
// 	? 'node --test apps/*/test/*.test.js'
// 	: 'node --test packages/*/test/*.test.js'

// try {
// 	execSync(`${testCommand} 2>&1 | grep -i "#todo"`, { stdio: 'inherit' })
// } catch (error) {
// 	if (error.status === 1) {
// 		console.log('No TODO items found')
// 	} else {
// 		console.error('Error checking release status')
// 		process.exit(error.status)
// 	}
// }

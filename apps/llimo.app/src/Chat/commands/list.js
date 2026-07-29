import { GREEN, RED, RESET } from "../../cli/ANSI.js"
import { Alert, Table } from "../../cli/components/index.js"
import { Padding } from "../../cli/components/Table.js"
import { UiCommand } from "../../cli/Ui.js"
import { Chat } from "../../llm/Chat.js"
import { show, ask } from "@nan0web/ui"

/**
 * Options for the `list` command.
 */
export class ListOptions {
	/** @type {boolean} */
	fix
	static fix = {
		help: "Clear the empty chats",
		default: false
	}
	/** @type {string} */
	filter
	static filter = {
		alias: "f",
		help: "Filter chats by ID substring",
		default: ""
	}
	constructor(input = {}) {
		const {
			fix = false,
			filter = ""
		} = input
		this.fix = Boolean(fix)
		this.filter = String(filter || "")
	}
	/**
	 * @returns {(info: {id: string, msgCount: number, lastActivity: string}) => boolean}
	 */
	getFilterPredicate() {
		if (!this.filter) return () => true
		const query = this.filter.toLowerCase()
		return info => info.id.toLowerCase().includes(query)
	}
}

/**
 * `list` command – lists available chats with basic info.
 */
export class ListCommand extends UiCommand {
	static name = "list"
	static description = "List available chats with option to select one"

	static UI = {
		ERROR_DB: "Database is not initialized."
	}

	/** @type {ListOptions} */
	options

	/**
	 * @param {Partial<ListCommand> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		const opts = /** @type {any} */ (options)
		const d = /** @type {any} */ (data)
		this.options = d.options || opts.options || new ListOptions(d._positionals ? { filter: d._positionals[0] } : d)

		if (!this._.db) {
			throw new Error(this._.t(ListCommand.UI.ERROR_DB))
		}
	}
	async * run() {
		const db = this._.db
		if (!db) {
			throw new Error(this._.t(ListCommand.UI.ERROR_DB))
		}
		try {
			if (typeof db.connect === "function") {
				await db.connect()
			}
			yield show(RESET)
			const current = await db.loadDocument("@chat/current", "")
			const entries = await db.listDir("@chat")
			const candidates = entries.filter(
				e => e.isDirectory && !["cache/", "current"].includes(e.name)
			).map(e => e.name.replace(/\/$/, ""))
			const chatInfos = []
			for (const chatId of candidates) {
				const chat = new Chat({ id: chatId, cwd: ".", root: "chat" })
				await chat.init()
				await chat.load()
				const stat = await db.statDocument(`@chat/${chatId}`)
				const info = {
					id: chatId,
					msgCount: chat.messages.length,
					lastActivity: new Date(stat?.mtimeMs || Date.now()).toLocaleDateString()
				}
				chatInfos.push(info)
			}
			chatInfos.sort((a, b) => b.msgCount - a.msgCount || b.lastActivity.localeCompare(a.lastActivity))
			const predicate = this.options.getFilterPredicate()
			const filteredInfos = chatInfos.filter(predicate)
			const chats = filteredInfos.map(i => i.id)
			if (!chats.length) {
				yield new Alert({ text: "No chats found.", variant: "warn" })
				yield true
				return
			}
			const rows = []
			rows.push(["No", "Chat ID", "Messages", "Last Activity"])
			let i = 0
			for (const info of filteredInfos) {
				const color = info.id === current ? GREEN : 0 === info.msgCount ? RED : ""
				rows.push([
					color + String(++i),
					info.id,
					info.msgCount.toString(),
					String(info.lastActivity) + RESET
				])
			}
			const table = new Table({ rows, options: { padding: Padding.from(1) } })
			yield table
			const isNonInteractive = this.options.filter || !process.stdout.isTTY
			if (isNonInteractive || this.options.fix) {
				yield new Alert({ text: `Listed ${chats.length} chat${chats.length !== 1 ? 's' : ''}${this.options.filter ? ` matching "${this.options.filter}"` : ''}.`, variant: "info" })
				if (this.options.fix) {
					let removed = 0
					const arr = filteredInfos.filter(({ msgCount }) => 0 === msgCount)
					for (const { id } of arr) {
						await db.dropDocument(`@chat/${id}`)
						const check = await db.statDocument(`@chat/${id}`)
						if (!check || !check.exists) ++removed
					}
					yield new Alert({ text: `${removed} chats cleared.`, variant: "success" })
				}
				yield true
				return
			}
			const choiceRes = yield ask("choice", { help: "Select a chat (ID or number):" })
			const choice = choiceRes?.value || ""
			const selected = chats[parseInt(choice) - 1] || choice
			if (chats.includes(selected)) {
				await db.saveDocument("@chat/current", selected)
				yield new Alert({ text: `Switched to chat: ${selected}`, variant: "info" })
			} else {
				yield new Alert({ text: "Invalid selection.", variant: "error" })
			}
			yield true
		} catch (/** @type {any} */ err) {
			yield new Alert({ text: `Error listing chats: ${err.message}`, variant: "error" })
			yield false
		}
	}
	/**
	 * @param {Record<string, any>} [input={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 * @returns {ListCommand}
	 */
	static create(input = {}, options = {}) {
		const opts = input.options || new ListOptions()
		return new ListCommand({ options: opts }, options)
	}
}

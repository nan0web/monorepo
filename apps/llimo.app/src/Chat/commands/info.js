import { Alert, Table } from "../../cli/components/index.js"
import { Ui, UiCommand } from "../../cli/Ui.js"
import { parseArgv } from "../../cli/argvHelper.js"
import { Chat } from "../../llm/Chat.js"
import { FileProtocol } from "../../FileProtocol.js"
import { UiOutput } from "../../cli/UiOutput.js"
import { ModelInfo } from "../../llm/ModelInfo.js"
import { FileSystem } from "../../utils/FileSystem.js"

/**
 * Options for the `info` command.
 */
class InfoOptions {
	/** @type {string} */
	id
	static id = {
		help: "Chat ID (optional), if not provided current will be used",
		default: ""
	}
	constructor(input = {}) {
		const {
			id = InfoOptions.id.default,
		} = input
		this.id = String(id)
	}
}

/**
 * `info` command – shows a table with per‑message statistics,
 * cost and model/provider columns.
 */
export class InfoCommand extends UiCommand {
	static name = "info"
	static description = "Show information of the chat: messages count, files attached, tokens, bytes size, cost and model/provider"
	/** @type {InfoOptions} */
	options
	/** @type {Chat} */
	chat
	/** @type {Ui} */
	ui
	/** @type {FileSystem} */
	fs

	/**
	 * @param {Partial<InfoCommand> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		const opts = /** @type {any} */ (options)
		this.options = data.options || opts.options || new InfoOptions()
		const baseChat = data.chat || opts.chat || new Chat()
		this.chat = new Chat({ ...baseChat, id: this.options.id || baseChat.id })
		this.ui = data.ui || opts.ui || new Ui()
		this.fs = data.fs || opts.fs || new FileSystem()
	}
	/**
	 * @throws
	 * @returns {AsyncGenerator<UiOutput | boolean>}
	 */
	async * run() {
		await this.chat.init()
		if (!this.chat.id) {
			throw new Error("Provide Chat ID")
		}
		// Header
		yield new Alert(`Chat ID: ${this.chat.id}`)
		yield this.info()
		// Signal the caller to continue the chat loop.
		yield false
	}
	/**
	 * @returns {Promise<Table>}
	 */
	async info() {
		/** @type {Array<Array<any>>} rows for UI.table */
		const rows = [
			["No", "i", "Role", "Files", "Size", "Tokens", "Cost", "Provider/Model"],
			["--", "--", "---", "---", "---", "---", "---", "---"]
		]
		let totalFiles = 0
		let totalBytes = 0
		let totalTokens = 0
		let totalCost = 0
		let step = 1
		const modelData = await this.chat.load("model.json") // Load model from saved file
		const modelInfo = new ModelInfo(modelData || { id: "" })
		const providerName = modelInfo?.provider ?? ""

		for (let i = 0; i < this.chat.messages.length; ++i) {
			const msg = this.chat.messages[i]
			const role = msg.role
			const content = String(msg.content)
			const bytes = Buffer.byteLength(content)
			const tokens = await this.chat.calcTokens(content)

			// Count attached files (markdown checklist)
			const parsed = await FileProtocol.parseAdaptive(content)
			const files = parsed.files?.size ?? 0

			// Load usage.json if present next to the message file
			let usage = null
			try {
				usage = await this.chat.load("usage.json", step) ?? null
			} catch {
				// ignore – fallback to approximation
			}
			const inputTokens = usage?.inputTokens ?? (role === "user" || role === "assistant" ? tokens : 0)
			const reasonTokens = usage?.reasoningTokens ?? 0
			const outputTokens = usage?.outputTokens ?? (role === "assistant" ? tokens : 0)

			const stepCost = (
				(inputTokens * (modelInfo?.pricing?.prompt ?? 0)) +
				((reasonTokens + outputTokens) * (modelInfo?.pricing?.completion ?? 0))
			) / 1e6
			totalCost += stepCost

			totalFiles += files
			totalBytes += bytes
			totalTokens += tokens

			rows.push([
				`${i + 1}`,
				step,
				role,
				this.ui.formats.count(files),
				this.ui.formats.weight("b", bytes),
				this.ui.formats.weight("T", tokens),
				this.ui.formats.money(stepCost),
				providerName ? `${providerName}/${modelInfo?.id ?? ""}` : ""
			])
			if ("assistant" === role) ++step
		}

		// Append total line
		const totalCostStr = this.ui.formats.money(totalCost)
		const providerModel = providerName ? `${providerName}/${modelInfo?.id ?? ""}` : "<multiple models>"
		rows.push([
			"", "", "TOTAL",
			this.ui.formats.count(totalFiles),
			this.ui.formats.weight("b", totalBytes),
			this.ui.formats.weight("T", totalTokens),
			totalCostStr,
			providerModel
		])

		return new Table({
			rows,
			options: {
				divider: " | ",
				aligns: ["right", "right", "left", "right", "right", "right", "right", "left"]
			}
		})
	}
	/**
	 * @param {object} [input]
	 * @param {string[]} [input.argv=[]]
	 * @param {Chat} [input.chat]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 * @returns {InfoCommand}
	 */
	static create(input = {}, options = {}) {
		const {
			argv = [],
			chat = new Chat()
		} = input
		const opts = parseArgv(argv, InfoOptions)
		return new InfoCommand({ options: opts, chat }, options)
	}
}


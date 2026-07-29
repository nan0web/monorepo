import { result } from '@nan0web/ui'
import { UiCommand } from '../../cli/Ui.js'
import { 
	StrategyListModel, 
	StrategyAddModel, 
	StrategyRemoveModel, 
	StrategyMoveModel, 
	StrategyEditModel 
} from '../../domain/AiStrategyModel.js'

export class StrategyCommand extends UiCommand {
	static name = 'strategy'
	static description = 'Manage AI cascade strategy (list, edit, add, remove, move)'

	static subcommand = {
		help: 'Subcommand (edit | list | add | remove | move)',
		options: ['edit', 'list', 'add', 'remove', 'move'],
		positional: true,
		default: 'edit'
	}

	static model = {
		help: 'Model name or ID to add/remove/move',
		positional: true,
		default: ''
	}

	static position = {
		help: 'Position index for move subcommand',
		type: 'number',
		positional: true,
		default: 0
	}

	/** @type {string} */
	subcommand
	/** @type {string} */
	model
	/** @type {number} */
	position
	/** @type {import('../../llm/Chat.js').Chat|undefined} */
	chat

	/**
	 * @param {Partial<StrategyCommand> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this.subcommand = data.subcommand || 'edit'
		this.model = data.model || ''
		this.position = Number(data.position || 0)
		this.chat = data.chat
	}

	async *run() {
		let subModel
		const sub = this.subcommand || 'edit'

		switch (sub) {
			case 'list':
				subModel = new StrategyListModel({}, this._)
				break
			case 'add':
				subModel = new StrategyAddModel({ model: this.model }, this._)
				break
			case 'remove':
				subModel = new StrategyRemoveModel({ model: this.model }, this._)
				break
			case 'move':
				subModel = new StrategyMoveModel({ model: this.model, position: this.position }, this._)
				break
			case 'edit':
			default:
				subModel = new StrategyEditModel({}, this._)
				break
		}

		// Delegate execution directly
		const iter = subModel.run()
		let res = await iter.next()
		while (!res.done) {
			const val = res.value
			// Yield up any alerts or components so UI-CLI can render them
			yield val
			res = await iter.next()
		}

		if (this.chat) {
			yield false // do not enter chat loop
		}
		return result(false)
	}

	/**
	 * @param {{ argv?: string[], chat?: import('../../llm/Chat.js').Chat }} [input]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 * @returns {StrategyCommand}
	 */
	static create(input = {}, options = {}) {
		const { argv = [], chat } = input
		const subcommand = argv[0] || 'edit'
		const model = argv[1] || ''
		const position = Number(argv[2] || 0)
		return new StrategyCommand({ subcommand, model, position, chat }, options)
	}
}

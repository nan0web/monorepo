/**
 * @fileoverview Barrel export for Universal UI Component Contracts.
 * @module @nan0web/ui/Component/contracts
 */

export * from './Structure.js'
export * from './Content.js'
export * from './Interaction.js'
export * from './Form.js'
export * from './Dialog.js'

import { PageContract, NavContract, SidebarContract, FooterContract } from './Structure.js'
import { MarkdownContract, AlertContract, BadgeContract, TableContract } from './Content.js'
import { ActionContract, ButtonContract, InputContract, ChoiceContract, SelectContract } from './Interaction.js'
import { FormContract } from './Form.js'
import { DialogContract, ModalContract, ProgressContract } from './Dialog.js'

export const Contracts = Object.freeze({
	Page: PageContract,
	Nav: NavContract,
	Sidebar: SidebarContract,
	Footer: FooterContract,
	Markdown: MarkdownContract,
	Alert: AlertContract,
	Badge: BadgeContract,
	Table: TableContract,
	Action: ActionContract,
	Button: ButtonContract,
	Input: InputContract,
	Choice: ChoiceContract,
	Select: SelectContract,
	Form: FormContract,
	Dialog: DialogContract,
	Modal: ModalContract,
	Progress: ProgressContract,
})

export default Contracts

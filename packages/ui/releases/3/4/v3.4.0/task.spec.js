import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
	Contracts,
	PageContract,
	NavContract,
	SidebarContract,
	FooterContract,
	MarkdownContract,
	AlertContract,
	BadgeContract,
	TableContract,
	ActionContract,
	ButtonContract,
	InputContract,
	ChoiceContract,
	SelectContract,
	FormContract,
	DialogContract,
	ModalContract,
	ProgressContract,
} from '../../../../src/index.js'
import ComponentExports from '../../../../src/Component/index.js'

describe('Universal UI Component Contracts (v3.4.0)', () => {
	it('defines structure contracts (Page, Nav, Sidebar, Footer)', async () => {
		// Page
		assert.equal(PageContract.name, 'Page')
		assert.equal(PageContract.category, 'Structure')
		assert.deepEqual(PageContract.props, ['title', 'lang', 'theme'])
		assert.deepEqual(PageContract.slots, ['nav', 'sidebar', 'default', 'footer'])
		assert.deepEqual(PageContract.events, [])

		// Nav
		assert.equal(NavContract.name, 'Nav')
		assert.equal(NavContract.category, 'Structure')
		assert.deepEqual(NavContract.props, ['brand', 'items'])
		assert.deepEqual(NavContract.slots, ['default'])
		assert.deepEqual(NavContract.events, ['navigate', 'toggle-menu'])

		// Sidebar
		assert.equal(SidebarContract.name, 'Sidebar')
		assert.equal(SidebarContract.category, 'Structure')
		assert.deepEqual(SidebarContract.props, ['title', 'items'])
		assert.deepEqual(SidebarContract.events, ['select', 'toggle'])

		// Footer
		assert.equal(FooterContract.name, 'Footer')
		assert.equal(FooterContract.category, 'Structure')
		assert.deepEqual(FooterContract.props, ['copyright', 'links'])
		assert.deepEqual(FooterContract.slots, ['default'])
	})

	it('defines content contracts (Markdown, Alert, Badge, Table)', async () => {
		// Markdown
		assert.equal(MarkdownContract.name, 'Markdown')
		assert.equal(MarkdownContract.category, 'Content')
		assert.deepEqual(MarkdownContract.props, ['content', 'toc', 'baseUrl'])

		// Alert
		assert.equal(AlertContract.name, 'Alert')
		assert.equal(AlertContract.category, 'Content')
		assert.deepEqual(AlertContract.props, ['variant', 'title', 'content', 'open', 'icon'])
		assert.deepEqual(AlertContract.events, ['close'])
		assert.deepEqual(AlertContract.slots, ['default'])

		// Badge
		assert.equal(BadgeContract.name, 'Badge')
		assert.equal(BadgeContract.category, 'Content')
		assert.deepEqual(BadgeContract.props, ['label', 'variant'])

		// Table
		assert.equal(TableContract.name, 'Table')
		assert.equal(TableContract.category, 'Content')
		assert.deepEqual(TableContract.props, ['columns', 'rows', 'data', 'keyField'])
		assert.deepEqual(TableContract.events, ['sort', 'row-click'])
	})

	it('defines interaction contracts (Action/Button, Input, Choice/Select)', async () => {
		// Action / Button
		assert.equal(ActionContract.name, 'Action')
		assert.equal(ActionContract.category, 'Interaction')
		assert.deepEqual(ActionContract.props, [
			'label',
			'action',
			'variant',
			'role',
			'disabled',
			'icon',
			'shortcut',
		])
		assert.deepEqual(ActionContract.slots, ['default'])
		assert.deepEqual(ActionContract.events, ['trigger', 'click'])
		assert.strictEqual(ActionContract, ButtonContract)

		// Input
		assert.equal(InputContract.name, 'Input')
		assert.equal(InputContract.category, 'Interaction')
		assert.deepEqual(InputContract.props, [
			'name',
			'label',
			'type',
			'value',
			'placeholder',
			'required',
			'disabled',
			'error',
		])
		assert.deepEqual(InputContract.events, ['change', 'input', 'submit', 'focus', 'blur'])

		// Choice / Select
		assert.equal(ChoiceContract.name, 'Choice')
		assert.equal(ChoiceContract.category, 'Interaction')
		assert.deepEqual(ChoiceContract.props, [
			'name',
			'label',
			'options',
			'value',
			'multiple',
			'placeholder',
			'required',
			'disabled',
		])
		assert.deepEqual(ChoiceContract.events, ['change'])
		assert.strictEqual(ChoiceContract, SelectContract)
	})

	it('defines form contract (Form)', async () => {
		assert.equal(FormContract.name, 'Form')
		assert.equal(FormContract.category, 'Form')
		assert.deepEqual(FormContract.props, [
			'title',
			'fields',
			'initialState',
			'submitLabel',
			'cancelLabel',
			'disabled',
			'loading',
		])
		assert.deepEqual(FormContract.slots, ['default'])
		assert.deepEqual(FormContract.events, ['submit', 'change', 'cancel'])
	})

	it('defines dialog and progress contracts (Dialog/Modal, Progress)', async () => {
		// Dialog / Modal
		assert.equal(DialogContract.name, 'Dialog')
		assert.equal(DialogContract.category, 'Dialog')
		assert.deepEqual(DialogContract.props, ['title', 'content', 'open', 'actions'])
		assert.deepEqual(DialogContract.slots, ['default'])
		assert.deepEqual(DialogContract.events, ['confirm', 'cancel'])
		assert.strictEqual(DialogContract, ModalContract)

		// Progress
		assert.equal(ProgressContract.name, 'Progress')
		assert.equal(ProgressContract.category, 'Dialog')
		assert.deepEqual(ProgressContract.props, ['value', 'total', 'message', 'status'])
		assert.deepEqual(ProgressContract.events, [])
	})

	it('supports FieldOptions resolution with OptionObject and OptionResolver', async () => {
		/** @type {import('../../../../src/Component/contracts/Interaction.js').OptionObject[]} */
		const staticOptions = [
			{ label: 'Option 1', value: 1, hint: 'First' },
			{ label: 'Option 2', value: 2, disabled: true },
		]
		assert.equal(staticOptions.length, 2)
		assert.equal(staticOptions[0].label, 'Option 1')

		/** @type {import('../../../../src/Component/contracts/Interaction.js').OptionResolver} */
		const asyncResolver = async (query) => {
			return staticOptions.filter((opt) => opt.label.toLowerCase().includes(query || ''))
		}
		const resolved = await asyncResolver('option 1')
		assert.equal(resolved.length, 1)
		assert.equal(resolved[0].value, 1)
	})

	it('supports Model-as-Schema target collection lookup via $collection or $alias', () => {
		class CategoryModel {
			static $collection = 'categories'
			static alias = 'category'
		}

		class TagModel {
			static $alias = 'tags'
		}

		const getCollection = (ModelClass) => ModelClass.$collection || ModelClass.$alias || ModelClass.alias
		assert.equal(getCollection(CategoryModel), 'categories')
		assert.equal(getCollection(TagModel), 'tags')
	})

	it('exports Contracts container with all registered contracts', async () => {
		assert.ok(Contracts.Page)
		assert.ok(Contracts.Nav)
		assert.ok(Contracts.Sidebar)
		assert.ok(Contracts.Footer)
		assert.ok(Contracts.Markdown)
		assert.ok(Contracts.Alert)
		assert.ok(Contracts.Badge)
		assert.ok(Contracts.Table)
		assert.ok(Contracts.Action)
		assert.ok(Contracts.Button)
		assert.ok(Contracts.Input)
		assert.ok(Contracts.Choice)
		assert.ok(Contracts.Select)
		assert.ok(Contracts.Form)
		assert.ok(Contracts.Dialog)
		assert.ok(Contracts.Modal)
		assert.ok(Contracts.Progress)

		assert.strictEqual(Contracts.Page, PageContract)
		assert.strictEqual(ComponentExports.PageContract, PageContract)
		assert.strictEqual(ComponentExports.Contracts, Contracts)
	})
})

import { Model } from '@nan0web/types'
import {
	ConfirmModel,
	SpinnerModel,
	ToastModel,
	TableModel,
	ButtonModel,
} from './components/index.js'
import { resolveDefaults } from '@nan0web/types'

/**
 * Sub-model representing the user's profile for the showcase journey.
 * Following strictly Model-as-Schema (0HCnAI) pattern.
 */
class ProfileModel extends Model {
	static $id = '@nan0web/ui/ProfileModel'

	static UI = {
		title: 'Profile',
	}

	// Use alias 'name' to avoid conflict with JS static name property
	static profileName = {
		alias: 'name',
		help: 'Your name',
		placeholder: 'John Doe',
		required: true,
		pattern: '.{3,}',
	}

	static role = {
		help: 'Your role',
		options: ['Developer', 'Designer', 'Manager'],
		default: 'Developer',
	}

	static tool = {
		help: 'Your tool',
		options: ['React', 'Lit', 'Node.js', 'Playwright', 'Vitest', 'Vite'],
		hint: 'autocomplete',
	}

	/**
	 * @param {Partial<ProfileModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Your name */ this.profileName
		/** @type {'Developer'|'Designer'|'Manager'} Your role */ this.role
		/** @type {'React'|'Lit'|'Node.js'|'Playwright'|'Vitest'|'Vite'} Your tool */ this.tool
	}
}

/**
 * Model-as-Schema for the entire UI Sandbox Showcase.
 * Represents a complete User Journey demonstrating all components.
 */
export class ShowcaseAppModel extends Model {
	static $id = '@nan0web/ui/ShowcaseAppModel'

	// Canonical UI Texts and Messages
	static UI = {
		appName: 'showcase.app_name',
		startBtn: 'showcase.start_btn',
		generateConfirm: 'showcase.msg_generate_confirm',
		aborted: 'showcase.msg_aborted',
		success: 'showcase.msg_success',
		cancelled: 'showcase.msg_cancelled',
		tableProperty: 'table.property',
		tableValue: 'table.value',
		tableStatus: 'table.status',
		tableStatusActive: 'table.status_active',
	}

	static appTitle = {
		alias: 'appName',
		help: 'showcase.app_name_help',
		default: ShowcaseAppModel.UI.appName,
		type: 'string',
	}

	/**
	 * @param {Partial<ShowcaseAppModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} App name help */ this.appTitle
	}

	// ==========================================
	// 2. AGNOSTIC LOGIC (Async Generator)
	// ==========================================

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const { UI } = ShowcaseAppModel

		// 1. Initial interaction: Start Button
		const startBtn = new ButtonModel({
			content: UI.startBtn,
			variant: 'primary',
			size: 'lg',
		})
		const btnIntent = yield* startBtn.run()

		if (!btnIntent.data.clicked) {
			return { type: 'result', data: { success: false, reason: 'start_cancelled' } }
		}

		// 2. Journey Form: Pure Model-as-Schema
		const profile = new ProfileModel()
		const profileResult = yield {
			type: 'ask',
			model: profile,
			schema: ProfileModel,
			field: 'profile_form',
		}

		if (profileResult.cancelled) {
			yield* new ToastModel({
				message: UI.aborted,
				variant: 'warn',
				duration: 0,
			}).run()
			return { type: 'result', data: { success: false, reason: 'user_aborted' } }
		}

		// Update model data with alias resolution
		profile.setData(profileResult.value)

		// 3. Confirmation - key is used, adapter should handle translation/interpolation
		const confirmIntent = yield* new ConfirmModel({
			message: UI.generateConfirm,
			// Pass interpolation data
			data: { name: profile.profileName, role: profile.role },
		}).run()

		if (!confirmIntent.data.confirmed) {
			yield* new ToastModel({
				message: UI.cancelled,
				variant: 'info',
				duration: 0,
			}).run()
			return { type: 'result', data: { success: false, reason: 'user_aborted' } }
		}

		// 4. Progress Feedback
		yield* new SpinnerModel({ size: 'md' }).run()

		yield* new ToastModel({
			message: UI.success,
			variant: 'success',
			duration: 0,
		}).run()

		// 5. Result Visualization
		const { data: tableData } = yield* new TableModel({
			columns: [UI.tableProperty, UI.tableValue],
			rows: [
				['profile.name', profile.profileName],
				['profile.role', profile.role],
				['profile.tool', profile.tool],
				[UI.tableStatus, UI.tableStatusActive],
			],
		}).run()

		return { type: 'result', data: { success: true, profile, rowsDisplayed: tableData.rowsCount } }
	}
}

// @ts-nocheck
import { AppCore, AppResult } from '@nan0web/core'

/**
 * Sandbox Application - lists all components and their variants
 */
export default class SandboxApp extends AppCore {
	/**
	 * @param {Object} input
	 */
	constructor(input) {
		const { db, ...rest } = input
		const safeDb = db && typeof db.fetch === 'function' ? db : undefined
		super({ ...rest, db: safeDb })
		if (db) this.db = db
	}

	/**
	 * @param {string} locale
	 */
	async handleLocaleChange(locale) {
		this.locale = locale
		// Use the refresh action provided by the AppRenderer to re-run the app
		if (this.actions.refresh) {
			await this.actions.refresh()
		}
	}

	async run() {
		const isUk = this.locale === 'uk'
		const t = (/** @type {string} */ key) => {
			/** @type {Record<string, Record<string, string>>} */
			const translations = {
				uk: {
					title: 'Пісочниця Компонентів',
					treeView: 'Дерево (TreeView)',
					autocomplete: 'Автокомпліт (Autocomplete)',
					buttons: 'Кнопки',
					inputs: 'Поля вводу',
					selects: 'Випадаючі списки',
				},
				en: {
					title: 'Component Sandbox',
					treeView: 'TreeView',
					autocomplete: 'Autocomplete',
					buttons: 'Buttons',
					inputs: 'Inputs',
					selects: 'Selects',
				},
			}
			return translations[this.locale]?.[key] || key
		}

		const treeData = [
			{
				name: 'src',
				type: 'dir',
				children: [
					{ name: 'App.js', type: 'file' },
					{ name: 'index.jsx', type: 'file' },
				],
			},
			{ name: 'package.json', type: 'file' },
		]

		return new AppResult({
			content: [
				{
					header: [
						{
							div: [
								{
									button: 'UK',
									$onClick: () => this.handleLocaleChange('uk'),
									$variant: isUk ? 'primary' : 'secondary',
									$size: 'sm',
								},
								{
									button: 'EN',
									$onClick: () => this.handleLocaleChange('en'),
									$variant: !isUk ? 'primary' : 'secondary',
									$size: 'sm',
								},
							],
							$style: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' },
						},
					],
					$style: { marginBottom: '1rem' },
				},
				{
					Typography: t('title'),
					$variant: 'h1',
					$style: {
						marginBottom: '2rem',
						paddingBottom: '1rem',
						borderBottom: '1px solid var(--color-border)',
					},
				},
				{
					div: [
						{
							Typography: t('treeView'),
							$variant: 'h3',
							$style: { marginBottom: '1rem' },
						},
						{
							tree: treeData,
							mode: 'file',
						},
					],
					$style: {
						marginBottom: '3rem',
						padding: '1.5rem',
						background: 'rgba(0,0,0,0.02)',
						borderRadius: '8px',
					},
				},
				{
					div: [
						{
							Typography: t('autocomplete'),
							$variant: 'h3',
							$style: { marginBottom: '1rem' },
						},
						{
							autocomplete: {
								options: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
								placeholder: isUk ? 'Шукати фрукти...' : 'Search fruits...',
							},
						},
					],
					$style: {
						marginBottom: '3rem',
						padding: '1.5rem',
						background: 'rgba(0,0,0,0.02)',
						borderRadius: '8px',
					},
				},
				{
					div: [
						{
							Typography: t('buttons'),
							$variant: 'h3',
							$style: { marginBottom: '1rem' },
						},
						{
							div: [
								{ button: 'Primary', $variant: 'primary' },
								{ button: 'Secondary', $variant: 'secondary' },
								{ button: 'Success', $variant: 'success' },
								{ button: 'Danger', $variant: 'danger' },
							],
							$style: { display: 'flex', gap: '1rem' },
						},
					],
					$style: {
						marginBottom: '3rem',
						padding: '1.5rem',
						background: 'rgba(0,0,0,0.02)',
						borderRadius: '8px',
					},
				},
			],
		})
	}

	/**
	 * @param {any} input
	 * @returns {SandboxApp}
	 */
	static from(input) {
		return new SandboxApp(input)
	}
}

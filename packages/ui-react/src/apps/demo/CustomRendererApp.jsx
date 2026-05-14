import React, { useState } from 'react'
import { AppCore } from '@nan0web/core'

/**
 * Custom Renderer App: run() повертає { $content, Renderer }.
 * Renderer — React-компонент з хуками/станом, рендериться безпосередньо.
 * @example
 * new CustomRendererApp({ title, uri }).run() → { $content: [...], Renderer: (props) => <div>{props.result.$title} + state</div> }
 */
export default class CustomRendererApp extends AppCore {
	/**
	 * @param {Object} input
	 * @param {string} [input.title='Demo']
	 * @param {string} [input.uri='index.html']
	 * @param {string} [input.locale='en']
	 */
	constructor(input) {
		super(input)
		const { title = 'Demo', uri = 'index.html' } = input
		this.title = title
		this.uri = uri
	}

	/**
	 * @override
	 * @returns {Promise<Object>} — { $content: базовий контент, Renderer: компонент для динаміки }
	 */
	async run() {
		// Симулюємо довгий run() — наприклад, db.query() або await API
		// await new Promise(resolve => setTimeout(resolve, 2000))
		// const data = await this.db.get('some-data') — якщо є db

		// Базовий $content (опціональний, для fallback або частини)
		const baseContent = {
			$content: [
				{
					h3: [`Custom Renderer: ${this.title}`],
					$className: 'text-lg font-medium mb-2',
				},
				{
					p: [`URI: ${this.uri}. Це рендериться через кастомний Renderer з useState.`],
					$className: 'mb-4',
				},
			],
		}

		// Кастомний Renderer — React-компонент з динамікою
		const Renderer = ({ result, context }) => {
			const [count, setCount] = useState(0)
			const { theme } = context || {}

			return (
				<div style={{ padding: '1rem', border: '1px solid #ccc', margin: '1rem 0' }}>
					<h4 style={{ color: theme?.mode === 'dark' ? '#fff' : '#000' }}>
						{result.$title || 'Interactive'} — Клік counter: {count}
					</h4>
					<button
						onClick={() => setCount(count + 1)}
						style={{
							background: '#007bff',
							color: 'white',
							padding: '0.5rem',
							border: 'none',
							cursor: 'pointer',
						}}
					>
						Збільшити (React state)
					</button>
					{result.$content?.map((block, i) => (
						// Рекурсивно рендеримо $content всередині Renderer, якщо потрібно
						<React.Fragment key={i}>
							{ReactElement.render(block, `custom-${i}`, context)}
						</React.Fragment>
					))}
				</div>
			)
		}
		Renderer.displayName = 'CustomRendererAppRenderer'

		return {
			...baseContent,
			Renderer, // Експортуємо як частину result
		}
	}

	static from(input) {
		if (input instanceof CustomRendererApp) return input
		return new CustomRendererApp(input)
	}
}

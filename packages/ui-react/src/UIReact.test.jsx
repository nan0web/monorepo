/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { NoConsole } from '@nan0web/log'
import DB from '@nan0web/db'
import UIReact from './UIReact.jsx'
import React from 'react'

function MyComponent() {
	return <b data-testid="my-component">MyComponent</b>
}

function MyCustomRenderer({ element, context, ...props }) {
	const { t = (k) => k, lang = 'en' } = context || {}
	const data = props.$data || element.$data || {}
	return (
		<div data-testid="custom-render" data-type="custom-block" lang={lang}>
			<span data-testid="custom-label">{t('Custom block')}</span>: {JSON.stringify(data)}
			<br />
			<MyComponent />
		</div>
	)
}

describe('UIReact with Custom Renderer', () => {
	let db
	let customConsole

	beforeEach(async () => {
		db = new DB({
			predefined: new Map([
				['uk/error.json', { message: 'Failed to load document' }],
				[
					'uk/_/t.json',
					{
						'Custom block': 'Блок',
					},
				],
				[
					'uk/index.json',
					{
						$content: [{ CustomBlock: [], $data: { value: 42 } }, { MyComponent: [] }],
						$lang: 'uk',
						$meta: { title: 'Тестовий документ' },
					},
				],
			]),
			console: new NoConsole({ prefix: 'DB:' }),
		})

		customConsole = new NoConsole({ prefix: 'UIReact:' })
		await db.connect()
	})

	it.todo('renders custom block using registered renderer from context', async () => {
		const context = {
			console: customConsole,
			components: new Map([['MyComponent', MyComponent]]),
			renderers: new Map([['CustomBlock', MyCustomRenderer]]),
			actions: {},
		}

		render(<UIReact db={db} context={context} uri="uk/index" console={customConsole} />)

		await waitFor(
			() => {
				expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
			},
			{ timeout: 2000 },
		)

		const customEl = await screen.findByTestId('custom-render')
		expect(customEl).toBeInTheDocument()

		const label = screen.getByTestId('custom-label')
		expect(label).toHaveTextContent('Блок')

		const myComponents = screen.getAllByTestId('my-component')
		expect(myComponents).toHaveLength(2)
		expect(screen.getByText(/42/)).toBeInTheDocument()
		expect(customEl).toHaveAttribute('data-type', 'custom-block')
		expect(customConsole.output('error')).toEqual([])
	})
})

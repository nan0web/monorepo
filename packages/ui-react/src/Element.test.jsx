import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import Element from './Element.jsx'
import { UIProvider } from './context/UIContext.jsx'
import UIContextValue from './context/UIContextValue.jsx'
import MockRenderInteractive from './renderers/renderInteractive.jsx'

const mockConsole = console

// Simple mocks for components used in the test context
const MockTypography = ({ children }) => <span data-testid="typography">{children}</span>
const MockInput = (props) => <input {...props} />
const MockButton = ({ children, ...props }) => <button {...props}>{children}</button>

describe('ReactElement rendering with App and interactive renderer', () => {
	// Mock App class defined BEFORE usage to fix TDZ
	class TestAppClass {
		constructor(input) {
			this.input = input
		}
		async run() {
			return {
				requiresInput: {
					fields: [{ name: 'count', type: 'number', label: 'Count', defaultValue: 0, min: 0 }],
				},
				compute: vi.fn(async (input) => ({
					$title: `Result: ${parseInt(input.count || 0) * 2}`,
					message: `Computed from ${input.count}`,
					updatedContent: [{ p: ['Dynamic text'] }],
				})),
				$content: [{ Typography: ['Base Title'] }],
			}
		}
		static from(input) {
			return new TestAppClass(input)
		}
	}

	// Mock apps as lazy imports (async functions returning module)
	const mockApps = new Map([
		['TestApp1', async () => ({ default: TestAppClass })],
		['TestApp2', async () => ({ default: TestAppClass })],
	])

	const mockRenderers = new Map([['interactive', MockRenderInteractive]])
	const mockComponents = new Map([
		['Typography', MockTypography],
		['Input', MockInput],
		['Button', MockButton],
	])

	const ctx = new UIContextValue({
		console: mockConsole,
		apps: mockApps,
		renderers: mockRenderers,
		components: mockComponents,
		db: { extract: () => ({}) },
		theme: { mode: 'light' },
	})

	it('should handle mock app with requiresInput and compute', async () => {
		const mockAppResult = {
			requiresInput: { fields: [{ name: 'count', type: 'number', label: 'Count' }] },
			compute: vi.fn().mockResolvedValue({
				$title: 'Mock Result',
				message: 'Mock computed',
				updatedContent: [],
			}),
			$content: [{ Typography: ['Test'] }],
		}

		// Spy on the static from method to return a mock instance
		const fromSpy = vi.spyOn(TestAppClass, 'from').mockReturnValue({
			run: vi.fn().mockResolvedValue(mockAppResult),
		})

		render(
			<UIProvider value={ctx}>{Element.render({ App: 'TestApp1' }, 'test-app-1', ctx)}</UIProvider>,
		)

		await waitFor(
			() => {
				expect(fromSpy).toHaveBeenCalled()
			},
			{ timeout: 5000 },
		)

		fromSpy.mockRestore()
	})

	it('should render content from app run', async () => {
		const mockAppResult = {
			$content: [{ Typography: ['Base Content'] }],
		}

		const fromSpy = vi.spyOn(TestAppClass, 'from').mockReturnValue({
			run: vi.fn().mockResolvedValue(mockAppResult),
		})

		render(
			<UIProvider value={ctx}>{Element.render({ App: 'TestApp2' }, 'test-app-2', ctx)}</UIProvider>,
		)

		await waitFor(
			() => {
				expect(screen.getByTestId('typography')).toHaveTextContent('Base Content')
			},
			{ timeout: 3e3 },
		)

		fromSpy.mockRestore()
	})
})

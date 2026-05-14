/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import React from 'react'
import DB from '@nan0web/db-browser'
import DemoApp from '../src/apps/demo/App.js'

describe('DemoApp Lifecycle and Integration', () => {
	let mockDB

	beforeEach(() => {
		cleanup()

		mockDB = new DB({
			predefined: [
				['play/index.json', { $content: [] }],
				['apps/navigation/data/main.json', { $app: 'navigation', $content: [] }],
			],
			console: {
				debug: vi.fn(),
				log: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
			},
		})
	})

	it('should initialize DemoApp with all dependencies', () => {
		const navigateMock = vi.fn()
		const setThemeMock = vi.fn()

		const app = new DemoApp({
			db: mockDB,
			theme: { mode: 'light' },
			setTheme: setThemeMock,
			navigate: navigateMock,
			uri: '/play/index.json',
		})

		expect(app.db).toBe(mockDB)
		expect(app.theme).toEqual({ mode: 'light' })
		expect(app.setTheme).toBe(setThemeMock)
		expect(app.navigate).toBe(navigateMock)
		expect(app.uri).toBe('/play/index.json')
	})

	it('should handle missing optional parameters gracefully', () => {
		const app = new DemoApp({
			db: mockDB,
		})

		expect(app.uri).toBe('index.html')
		expect(app.locale).toBe('en')
		expect(app.theme).toBeDefined()
		expect(app.setTheme).toBeInstanceOf(Function)
		expect(app.navigate).toBeInstanceOf(Function)
	})

	it('should execute run() and return valid UI structure', async () => {
		const app = new DemoApp({
			db: mockDB,
			theme: { mode: 'light' },
			setTheme: () => {},
			navigate: () => {},
		})

		const result = await app.run()

		expect(result.$content).toBeDefined()
		expect(Array.isArray(result.$content)).toBe(true)

		const [container] = result.$content
		expect(container.div).toBeDefined()
		expect(Array.isArray(container.div)).toBe(true)

		const [simpleApp, customRenderer] = container.div
		expect(simpleApp.App).toBe('SimpleApp')
		expect(customRenderer.App).toBe('CustomRendererApp')
	})
})

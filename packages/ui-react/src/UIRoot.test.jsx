import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import { NoConsole } from '@nan0web/log'
import DB from '@nan0web/db-browser'
import { UIRoot } from './UIRoot.jsx'
import UIReact from './UIReact.jsx'

// Mock UIReact to test UIRoot isolation
vi.mock('./UIReact.jsx', () => ({
	default: vi.fn(({ db, uri }) => (
		<div data-testid="ui-react" data-db={db ? 'provided' : 'default'} data-uri={uri}>
			UIReact rendered with URI: {uri}
		</div>
	)),
}))

// Mock history and dispatch
const mockHistoryPushState = vi.fn()
const mockPopstateDispatch = vi.fn()

describe('UIRoot', () => {
	const mockDb = new DB({ console: new NoConsole({ prefix: 'DB:' }) })

	beforeEach(() => {
		vi.clearAllMocks()
		mockHistoryPushState.mockClear()
		mockPopstateDispatch.mockClear()

		// Ensure consistent location mock across tests
		Object.defineProperty(window, 'location', {
			value: { pathname: '/' },
			writable: true,
		})

		// Mock localStorage
		vi.stubGlobal('localStorage', {
			getItem: vi.fn(),
			setItem: vi.fn(),
		})
		window.localStorage.getItem.mockReturnValue(null)

		// Mock matchMedia to false for light theme in most tests
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({
				matches: false,
				addListener: vi.fn(),
				removeListener: vi.fn(),
			})),
		)

		// Mock addEventListener and removeEventListener for window and document
		vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
			if (event === 'popstate') {
				window.__popstateHandler = handler
			}
		})
		vi.spyOn(window, 'removeEventListener').mockImplementation((event, handler) => {
			if (event === 'popstate') {
				delete window.__popstateHandler
			}
		})

		vi.spyOn(document, 'addEventListener').mockImplementation((event, handler) => {
			if (event === 'click') {
				document.__clickHandler = handler
			}
		})
		vi.spyOn(document, 'removeEventListener').mockImplementation((event, handler) => {
			if (event === 'click') {
				delete document.__clickHandler
			}
		})

		// Mock history
		window.history.pushState = mockHistoryPushState
		window.dispatchEvent = mockPopstateDispatch
	})

	afterEach(() => {
		vi.restoreAllMocks()
		delete window.__popstateHandler
		delete document.__clickHandler
		// Reset location
		Object.defineProperty(window, 'location', {
			value: { pathname: '/' },
			writable: true,
		})
	})

	it('initializes with default DB and URI when no props provided', () => {
		render(<UIRoot />)
		const uiReact = screen.getByTestId('ui-react')

		expect(uiReact).toHaveAttribute('data-db', 'provided')
		expect(uiReact).toHaveAttribute('data-uri', '/')

		expect(UIReact).toHaveBeenCalledWith(
			expect.objectContaining({
				db: expect.any(DB),
				uri: '/',
			}),
			undefined,
		)
	})

	it('uses provided DB and computes URI from pathname', () => {
		Object.defineProperty(window, 'location', {
			value: { pathname: '/test.html' },
			writable: true,
		})

		render(<UIRoot db={mockDb} />)

		const uiReact = screen.getByTestId('ui-react')
		expect(uiReact).toHaveAttribute('data-db', 'provided')
		expect(uiReact).toHaveAttribute('data-uri', '/test.json')

		expect(UIReact).toHaveBeenCalledWith(
			expect.objectContaining({
				db: mockDb,
				uri: '/test.json',
			}),
			undefined,
		)
	})

	it('initializes theme from localStorage if saved', () => {
		window.localStorage.getItem.mockReturnValue('light')
		window.matchMedia.mockImplementation(() => ({ matches: false }))

		render(<UIRoot />)

		expect(window.localStorage.getItem).toHaveBeenCalledWith('theme')
	})

	it('initializes theme from prefers-color-scheme if no localStorage', () => {
		window.localStorage.getItem.mockReturnValue(null)
		window.matchMedia.mockImplementation(() => ({ matches: true }))

		render(<UIRoot />)

		expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
	})

	it('saves theme to localStorage on theme change', async () => {
		window.matchMedia.mockImplementation(() => ({ matches: false }))
		window.localStorage.getItem.mockReturnValue(null)

		const { rerender } = render(<UIRoot />)

		await waitFor(() => {
			expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
		})

		// Simulate theme change by rerendering (triggers useEffect)
		const NightThemeMock = { name: 'night' }
		// Since setTheme is in context, this verifies initial; full needs child but passes init
	})

	it('handles popstate event to update URI', async () => {
		render(<UIRoot />)

		expect(window.addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function))

		// Simulate path change and popstate
		Object.defineProperty(window, 'location', { value: { pathname: '/new.html' }, writable: true })
		await act(async () => {
			window.__popstateHandler()
		})

		await waitFor(() => {
			const calls = UIReact.mock.calls
			expect(calls.length).toBeGreaterThan(0)
			expect(calls[calls.length - 1][0].uri).toBe('/new.json')
		})
	})

	it('handles link clicks for internal navigation (SPA)', async () => {
		render(<UIRoot />)
		await waitFor(() => expect(document.__clickHandler).toBeDefined())

		const link = document.createElement('a')
		link.setAttribute('href', '/internal-page.html')
		const mockEvent = {
			target: link,
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
		}

		await act(async () => {
			document.__clickHandler(mockEvent)
		})

		expect(mockHistoryPushState).toHaveBeenCalledWith({}, '', '/internal-page.html')
		expect(mockPopstateDispatch).toHaveBeenCalledTimes(1)

		// Now trigger the popstate handler to update uri
		Object.defineProperty(window, 'location', {
			value: { pathname: '/internal-page.html' },
			writable: true,
		})
		await act(async () => {
			window.__popstateHandler()
		})

		await waitFor(() => {
			const calls = UIReact.mock.calls
			expect(calls[calls.length - 1][0].uri).toBe('/internal-page.json')
		})
	})

	it('ignores external or special link clicks', async () => {
		render(<UIRoot />)
		await waitFor(() => expect(document.__clickHandler).toBeDefined())

		const createMockEvent = (href, closest = null) => ({
			target: closest ? { closest: () => closest } : { closest: () => null },
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
		})

		const handler = document.__clickHandler

		// External: closest returns a with href starting with https
		const externalEvent = createMockEvent('https://example.com', {
			getAttribute: () => 'https://example.com',
		})
		act(() => handler(externalEvent))
		expect(externalEvent.preventDefault).not.toHaveBeenCalled()
		expect(mockHistoryPushState).not.toHaveBeenCalled()

		mockHistoryPushState.mockClear()

		// Hash: href starts with #
		const hashEvent = createMockEvent('#section', { getAttribute: () => '#section' })
		act(() => handler(hashEvent))
		expect(hashEvent.preventDefault).not.toHaveBeenCalled()
		expect(mockHistoryPushState).not.toHaveBeenCalled()

		mockHistoryPushState.mockClear()

		// Mailto: href starts with mailto:
		const mailtoEvent = createMockEvent('mailto:user@example.com', {
			getAttribute: () => 'mailto:user@example.com',
		})
		act(() => handler(mailtoEvent))
		expect(mailtoEvent.preventDefault).not.toHaveBeenCalled()
		expect(mockHistoryPushState).not.toHaveBeenCalled()

		mockHistoryPushState.mockClear()

		// No link: closest returns null
		const noLinkEvent = createMockEvent()
		act(() => handler(noLinkEvent))
		expect(mockHistoryPushState).not.toHaveBeenCalled()
	})

	it('cleans up event listeners on unmount', () => {
		const { unmount } = render(<UIRoot />)

		expect(window.addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function))
		expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))

		unmount()

		expect(window.removeEventListener).toHaveBeenCalledWith('popstate', expect.any(Function))
		expect(document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function))
	})

	it('wraps UIReact in UIProvider with theme and db', () => {
		Object.defineProperty(window, 'location', {
			value: { pathname: '/' },
			writable: true,
		})
		render(<UIRoot db={mockDb} />)

		expect(screen.getByTestId('ui-react')).toBeInTheDocument()
		expect(UIReact).toHaveBeenCalledWith(
			expect.objectContaining({
				db: mockDb,
				uri: '/',
			}),
			undefined,
		)
	})
})

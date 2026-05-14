// vitest.setup.js
import React from 'react'
import { vi } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

expect.extend(matchers)
import { NoConsole, Logger } from '@nan0web/log'

global.logger = new Logger({ console })
global.console = new NoConsole()
// Mock for React.createElement to support testing
global.React = React

// Mock window.location for routing tests
const originalLocation = window.location
const mockLocation = {
	...originalLocation,
	assign: vi.fn(),
	reload: vi.fn(),
	replace: vi.fn(),
	href: 'http://localhost/',
	origin: 'http://localhost',
	pathname: '/',
}

Object.defineProperty(window, 'location', {
	writable: true,
	value: mockLocation,
})

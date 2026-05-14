import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Footer from './Footer'
import { useUI } from '@nan0web/ui-react'

// Mock useUI
vi.mock('@nan0web/ui-react', () => ({
	useUI: vi.fn(),
}))

const mockSocial = {
	facebook: 'https://fb.com',
	telegram: 'https://t.me',
}

const mockApps = [
	{
		title: 'Industrial24',
		ios: 'https://apple.com',
		android: 'https://google.com',
	},
]

const mockContact = {
	tel: '0800123456',
	email: 'test@bank.ua',
	address: 'Test City',
}

const mockNav = {
	children: [
		{
			title: 'Info Section',
			children: [{ title: 'Link 1', href: '/link1' }],
		},
	],
}

describe('Footer Component', () => {
	it('renders all sections correctly', () => {
		useUI.mockReturnValue({
			t: (key) => key,
			document: {
				contact: mockContact,
				social: mockSocial,
				store_apps: mockApps,
				footer: mockNav,
			},
		})

		render(<Footer />)

		// 1. Check Contacts
		expect(screen.getByText('Центр підтримки клієнтів')).toBeDefined()
		expect(screen.getByText('0800123456')).toBeDefined()
		expect(screen.getByText('test@bank.ua')).toBeDefined()

		// 2. Check Social (title attributes)
		expect(screen.getByTitle('Telegram')).toBeDefined()
		expect(screen.getByTitle('Facebook')).toBeDefined()

		// 3. Check Apps
		expect(screen.getByText('Мобільні додатки')).toBeDefined()
		expect(screen.getByText('Industrial24')).toBeDefined()
		expect(screen.getByText('App Store')).toBeDefined()

		// 4. Check Navigation
		expect(screen.getByText('Info Section')).toBeDefined()
		expect(screen.getByText('Link 1')).toBeDefined()
	})
})

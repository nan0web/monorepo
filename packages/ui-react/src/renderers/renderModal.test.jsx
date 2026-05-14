/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RenderModal from './renderModal.jsx'
import React from 'react'
import { UIProvider } from '../context/UIContext.jsx'

// Mock ReactElement
vi.mock('../Element.jsx', () => ({
    default: {
        render: vi.fn((item, key) => (
            <div data-testid="mock-child" key={key}>
                {typeof item === 'string' ? item : JSON.stringify(item)}
            </div>
        )),
    },
}))

describe('renderModal', () => {
    it('renders trigger button with correct text', () => {
        const props = { element: {}, triggerText: 'Open Me' }
        render(<UIProvider><RenderModal {...props} /></UIProvider>)
        expect(screen.getByText('Open Me')).toBeInTheDocument()
    })

    it('defaults trigger text to "Open Modal Window"', () => {
        const props = { element: {} }
        render(<UIProvider><RenderModal {...props} /></UIProvider>)
        expect(screen.getByText('Open Modal Window')).toBeInTheDocument()
    })

    it('opens modal on trigger click and renders content', async () => {
        const props = {
            element: {},
            content: ['Modal Content 1', 'Modal Content 2'],
            triggerText: 'Open'
        }

        render(<UIProvider><RenderModal {...props} /></UIProvider>)

        const btn = screen.getByText('Open')
        fireEvent.click(btn)

        await waitFor(() => {
            expect(screen.getByText('Modal Content 1')).toBeInTheDocument()
        })
    })
})

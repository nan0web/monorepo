import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';
import { useUI } from '@nan0web/ui-react';

// Mock useUI
vi.mock('@nan0web/ui-react', () => ({
    useUI: vi.fn(),
}));

const mockNavData = {
    children: [
        {
            title: 'Level 1',
            href: '/l1',
            children: [
                {
                    title: 'Level 2 Item',
                    href: '/l2',
                    children: [
                        {
                            title: 'Level 3 Item',
                            href: '/l3'
                        }
                    ]
                }
            ]
        }
    ]
};

describe('Header Component Navigation', () => {
    it('renders multi-level dropdowns correctly', async () => {
        const user = userEvent.setup();
        useUI.mockReturnValue({
            t: (key) => key,
            uri: '/',
            document: { nav: mockNavData }
        });

        render(<Header />);

        // 1. Level 1
        const l1 = screen.getByText('Level 1');

        // 2. Click Level 1 to open Dropdown
        await user.click(l1);

        // 3. Level 2 should become visible
        const l2 = await screen.findByText('Level 2 Item');
        expect(l2).toBeDefined();

        // 4. Click Level 2 Item (Nested Dropdown Trigger)
        await user.click(l2);

        // 5. Level 3 should become visible
        const l3 = await screen.findByText('Level 3 Item');
        expect(l3).toBeDefined();
    });
});

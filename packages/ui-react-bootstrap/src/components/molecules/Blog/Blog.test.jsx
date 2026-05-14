import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Blog from './Blog';
import { useUI } from '@nan0web/ui-react';

// Mock useUI
vi.mock('@nan0web/ui-react', () => ({
    useUI: vi.fn(),
}));

const mockPosts = [
    { title: 'Post 1', date: '2024-01-01', href: '/p1', description: 'Desc 1' },
    { title: 'Post 2', date: '2024-01-02', href: '/p2', description: 'Desc 2' },
    { title: 'Post 3', date: '2024-01-03', href: '/p3', description: 'Desc 3' },
    { title: 'Post 4', date: '2024-01-04', href: '/p4', description: 'Desc 4' },
    { title: 'Post 5', date: '2024-01-05', href: '/p5', description: 'Desc 5' },
    { title: 'Post 6', date: '2024-01-06', href: '/p6', description: 'Desc 6' },
];

describe('Blog Component', () => {
    it('renders initial posts and loads more', () => {
        useUI.mockReturnValue({
            t: (key) => key,
            document: {
                blog: {}
            },
            db: null
        });

        render(<Blog posts={mockPosts} initialCount={2} perPage={2} />);

        // Check initial posts
        expect(screen.getByText('Post 1')).toBeDefined();
        expect(screen.getByText('Post 2')).toBeDefined();
        expect(screen.queryByText('Post 3')).toBeNull();

        // Click load more
        const loadMore = screen.getByText('Load more');
        fireEvent.click(loadMore);

        // Check more posts
        expect(screen.getByText('Post 3')).toBeDefined();
        expect(screen.getByText('Post 4')).toBeDefined();
        expect(screen.queryByText('Post 5')).toBeNull();
    });
});

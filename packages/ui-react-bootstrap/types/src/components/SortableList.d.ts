export function SortableList({ items: initialItems, renderItem, onReorder, persist, className, }: SortableListProps): import("react/jsx-runtime").JSX.Element;
export namespace SortableList {
    let displayName: string;
}
export type SortableListProps = {
    /**
     * - Items to sort
     */
    items: any[];
    /**
     * - Custom renderer per item
     */
    renderItem?: (item: any, index: number) => React.ReactNode;
    /**
     * - Callback when order changes
     */
    onReorder?: (newOrder: any[]) => void;
    /**
     * - localStorage key for auto-save
     */
    persist?: string;
    /**
     * - Additional CSS classes
     */
    className?: string;
};
import React from 'react';

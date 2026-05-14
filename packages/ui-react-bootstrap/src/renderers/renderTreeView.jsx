import React from 'react'
import TreeView from '../components/atoms/TreeView.jsx'

/**
 * Bootstrap-themed TreeView renderer.
 */
export default function renderTreeView({ element, context }) {
    const { tree: data, loader, mode, onSelect } = element

    const handleSelect = (item) => {
        if (context?.onAction) {
            context.onAction('Tree Selection', {
                selected: Array.isArray(item) ? item.map(i => i.name) : item.name,
                mode
            })
        }
        if (onSelect) onSelect(item)
    }

    return (
        <TreeView
            data={data}
            loader={loader}
            mode={mode}
            onSelect={handleSelect}
        />
    )
}

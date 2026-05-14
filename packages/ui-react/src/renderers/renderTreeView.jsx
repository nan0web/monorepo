import React from 'react'
import TreeView from '../components/atoms/TreeView.jsx'

/**
 * Renderer for TreeView component.
 *
 * @param {object} input
 * @param {object} input.element - Component block definition
 * @param {object} input.context - UI Context
 * @returns {React.ReactNode} Rendered tree view
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

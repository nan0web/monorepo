import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

/**
 * TreeView component - hierarchical data visualization.
 * Supports async loading, expansion, and selection.
 *
 * @param {Object} props
 * @param {Array} props.data - Tree nodes
 * @param {Function} [props.onSelect] - Selection handler
 * @param {Function} [props.loader] - Async children loader
 * @param {'file'|'dir'|'multi'} [props.mode='file'] - Selection mode
 */
export default function TreeView({ data = [], onSelect, loader, mode = 'file' }) {
	const { theme } = useUI()
	// @ts-ignore - TreeView theme config is dynamic
	const config = theme?.atoms?.TreeView || {
		indent: '1.5rem',
		selectedColor: 'var(--color-primary, #0d6efd)',
		hoverBackground: 'rgba(0, 0, 0, 0.05)',
	}

	const [expanded, setExpanded] = useState(new Set())
	const [loading, setLoading] = useState(new Set())
	const [checked, setChecked] = useState(new Set())
	const [selected, setSelected] = useState(null)

	const toggleExpand = async (item) => {
		if (item.type !== 'dir') return

		const newExpanded = new Set(expanded)
		if (expanded.has(item)) {
			newExpanded.delete(item)
		} else {
			newExpanded.add(item)
			if (!item.children && loader) {
				const newLoading = new Set(loading)
				newLoading.add(item)
				setLoading(newLoading)
				try {
					const children = await loader(item)
					item.children = children
				} finally {
					const nextLoading = new Set(loading)
					nextLoading.delete(item)
					setLoading(nextLoading)
				}
			}
		}
		setExpanded(newExpanded)
	}

	const handleClick = (item) => {
		if (mode === 'multi') {
			const newChecked = new Set(checked)
			if (checked.has(item)) newChecked.delete(item)
			else newChecked.add(item)
			setChecked(newChecked)
			if (onSelect) onSelect(Array.from(newChecked))
		} else {
			if (mode === 'dir' && item.type !== 'dir') return
			if (mode === 'file' && item.type !== 'file') {
				toggleExpand(item)
				return
			}
			setSelected(item)
			if (onSelect) onSelect(item)
		}
	}

	const renderNode = (item, depth = 0) => {
		const isExpanded = expanded.has(item)
		const isLoading = loading.has(item)
		const isChecked = checked.has(item)
		const isSelected = selected === item

		return (
			<div key={item.id || item.name + depth} style={{ display: 'flex', flexDirection: 'column' }}>
				<div
					onClick={(e) => {
						e.stopPropagation()
						handleClick(item)
					}}
					style={{
						display: 'flex',
						alignItems: 'center',
						padding: '4px 8px',
						cursor: 'pointer',
						backgroundColor: isSelected ? 'rgba(13, 110, 253, 0.1)' : 'transparent',
						borderRadius: '4px',
						transition: 'background 0.2s',
						marginLeft: `${depth * 20}px`,
					}}
					className="tree-node"
				>
					<span
						onClick={(e) => {
							e.stopPropagation()
							toggleExpand(item)
						}}
						style={{
							width: '20px',
							display: 'inline-flex',
							justifyContent: 'center',
							opacity: item.type === 'dir' ? 1 : 0,
						}}
					>
						{item.type === 'dir' ? (isExpanded ? '▼' : '▶') : ''}
					</span>

					{mode === 'multi' && (
						<input
							type="checkbox"
							checked={isChecked}
							onChange={() => {}}
							style={{ marginRight: '8px' }}
						/>
					)}

					<span style={{ marginRight: '8px' }}>{item.type === 'dir' ? '📁' : '📄'}</span>

					<span
						style={{
							color: isSelected ? config.selectedColor : 'inherit',
							fontWeight: isSelected ? 'bold' : 'normal',
						}}
					>
						{item.name}
					</span>

					{isLoading && (
						<span style={{ marginLeft: '8px', fontSize: '0.8em', opacity: 0.6 }}>Loading...</span>
					)}
				</div>

				{isExpanded && item.children && (
					<div className="tree-children">
						{item.children.map((child) => renderNode(child, depth + 1))}
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="tree-view" style={{ fontFamily: 'inherit' }}>
			{data.map((item) => renderNode(item))}
		</div>
	)
}

TreeView.propTypes = {
	data: PropTypes.array,
	onSelect: PropTypes.func,
	loader: PropTypes.func,
	mode: PropTypes.oneOf(['file', 'dir', 'multi']),
}

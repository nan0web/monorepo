import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { ListGroup, Spinner, Form } from 'react-bootstrap'
import { useUI } from '@nan0web/ui-react'
import { reactIcon } from '@nan0web/icons/adapters/react'
import {
	FaChevronRight as _FaChevronRight,
	FaChevronDown as _FaChevronDown,
	FaFolder as _FaFolder,
	FaFile as _FaFile,
} from '@nan0web/icons/fa'
const FaChevronRight = reactIcon(_FaChevronRight)
const FaChevronDown = reactIcon(_FaChevronDown)
const FaFolder = reactIcon(_FaFolder)
const FaFile = reactIcon(_FaFile)

/**
 * Bootstrap-themed TreeView component.
 */
export default function TreeView({ data = [], onSelect, loader, mode = 'file' }) {
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
			<div key={item.id || item.name + depth} className="tree-node-wrapper">
				<ListGroup.Item
					action
					active={isSelected}
					onClick={(e) => {
						e.stopPropagation()
						handleClick(item)
					}}
					style={{
						paddingLeft: `${depth * 1.5 + 0.75}rem`,
						border: 'none',
						display: 'flex',
						alignItems: 'center',
						cursor: 'pointer',
					}}
				>
					<span
						onClick={(e) => {
							e.stopPropagation()
							toggleExpand(item)
						}}
						className="me-2"
						style={{ width: '1rem', display: 'inline-flex', justifyContent: 'center' }}
					>
						{item.type === 'dir' &&
							(isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />)}
					</span>

					{mode === 'multi' && (
						<Form.Check
							type="checkbox"
							className="me-2 mb-0"
							checked={isChecked}
							onChange={() => {}}
						/>
					)}

					<span className="me-2 text-secondary">
						{item.type === 'dir' ? <FaFolder /> : <FaFile />}
					</span>

					<span className="flex-grow-1 text-truncate">{item.name}</span>

					{isLoading && <Spinner animation="border" size="sm" className="ms-2" />}
				</ListGroup.Item>

				{isExpanded && item.children && (
					<div className="tree-children">
						{item.children.map((child) => renderNode(child, depth + 1))}
					</div>
				)}
			</div>
		)
	}

	return (
		<ListGroup className="tree-view border-0 shadow-sm rounded">
			{data.map((item) => renderNode(item))}
		</ListGroup>
	)
}

TreeView.propTypes = {
	data: PropTypes.array,
	onSelect: PropTypes.func,
	loader: PropTypes.func,
	mode: PropTypes.oneOf(['file', 'dir', 'multi']),
}

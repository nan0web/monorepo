import React from 'react'
import { ListGroup, Button, Badge } from 'react-bootstrap'
import { reactIcon } from '@nan0web/icons/adapters/react'
import { FaArrowUp as _FaArrowUp, FaArrowDown as _FaArrowDown } from '@nan0web/icons/fa'
const FaArrowUp = reactIcon(_FaArrowUp)
const FaArrowDown = reactIcon(_FaArrowDown)
import { useSortableList } from '@nan0web/ui-react'

/**
 * @typedef {Object} SortableListProps
 * @property {any[]} items - Items to sort
 * @property {(item: any, index: number) => React.ReactNode} [renderItem] - Custom renderer per item
 * @property {(newOrder: any[]) => void} [onReorder] - Callback when order changes
 * @property {string} [persist] - localStorage key for auto-save
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Bootstrap-styled Sortable List component.
 * Uses `useSortableList()` from `@nan0web/ui-react` internally.
 *
 * @param {SortableListProps} props
 */
export const SortableList = ({
	items: initialItems = [],
	renderItem,
	onReorder,
	persist,
	className = '',
}) => {
	const { items, moveUp, moveDown } = useSortableList(initialItems, {
		persist,
		onChange: onReorder,
	})

	if (!items || items.length === 0) {
		return null
	}

	return (
		<ListGroup className={`sortable-list ${className}`} data-testid="sortable-list">
			{items.map((item, idx) => (
				<ListGroup.Item
					key={item.id ?? idx}
					className="d-flex align-items-center justify-content-between bg-body border rounded mb-2 px-3 py-2 animate-in"
					data-testid={`sortable-item-${idx}`}
				>
					<div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
						<Badge bg="secondary" pill className="flex-shrink-0">
							{idx + 1}
						</Badge>
						<div className="d-flex align-items-center gap-2 min-w-0">
							{renderItem ? (
								renderItem(item, idx)
							) : (
								<span className="font-monospace text-truncate">
									{item.label ?? item.id ?? String(item)}
								</span>
							)}
						</div>
					</div>

					<div className="d-flex gap-1 flex-shrink-0 ms-2">
						<Button
							variant="outline-secondary"
							size="sm"
							onClick={() => moveUp(idx)}
							disabled={idx === 0}
							aria-label={`Move item ${idx + 1} up`}
							className="d-flex align-items-center justify-content-center"
							style={{ width: '32px', height: '32px' }}
						>
							<FaArrowUp size="0.75em" />
						</Button>
						<Button
							variant="outline-secondary"
							size="sm"
							onClick={() => moveDown(idx)}
							disabled={idx === items.length - 1}
							aria-label={`Move item ${idx + 1} down`}
							className="d-flex align-items-center justify-content-center"
							style={{ width: '32px', height: '32px' }}
						>
							<FaArrowDown size="0.75em" />
						</Button>
					</div>
				</ListGroup.Item>
			))}
		</ListGroup>
	)
}

SortableList.displayName = 'SortableList'

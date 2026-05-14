/**
 * @nan0web/icons — React adapter
 *
 * Renders icon data as inline SVG React elements.
 * Zero dependency on react-icons at runtime.
 *
 * @example
 * import { Icon } from '@nan0web/icons/adapters/react'
 * import { BsBank2 } from '@nan0web/icons/bs'
 *
 * <Icon icon={BsBank2} size={20} className="me-1" />
 *
 * @example — drop-in replacement for react-icons components
 * import { reactIcon } from '@nan0web/icons/adapters/react'
 * import { BsBank2 } from '@nan0web/icons/bs'
 *
 * const BsBank2Icon = reactIcon(BsBank2)
 * <BsBank2Icon size={20} className="me-1" />
 */

import { createElement } from 'react'

/**
 * Recursively render icon children as React elements.
 * @param {Array} children
 * @returns {Array<React.ReactElement>}
 */
function renderChildren(children) {
	if (!children) return null
	return children.map((c, i) => {
		const props = { key: i }
		if (c.attr) {
			for (const [k, v] of Object.entries(c.attr)) {
				// Convert SVG attribute names to React camelCase
				const reactKey =
					k === 'class'
						? 'className'
						: k === 'fill-rule'
							? 'fillRule'
							: k === 'clip-rule'
								? 'clipRule'
								: k === 'clip-path'
									? 'clipPath'
									: k === 'fill-opacity'
										? 'fillOpacity'
										: k === 'stroke-width'
											? 'strokeWidth'
											: k === 'stroke-linecap'
												? 'strokeLinecap'
												: k === 'stroke-linejoin'
													? 'strokeLinejoin'
													: k === 'stroke-dasharray'
														? 'strokeDasharray'
														: k === 'stroke-dashoffset'
															? 'strokeDashoffset'
															: k
				props[reactKey] = v
			}
		}
		const inner = c.child ? renderChildren(c.child) : null
		return createElement(c.tag, props, inner)
	})
}

/**
 * React Icon component — renders icon data as inline SVG.
 *
 * Drop-in replacement for react-icons usage.
 *
 * @param {Object} props
 * @param {Object} props.icon - Icon data from @nan0web/icons sets
 * @param {number|string} [props.size=16] - Icon size (width & height)
 * @param {string} [props.className] - CSS class
 * @param {string} [props.color] - Override fill color
 * @param {Object} [props.style] - Additional inline styles
 * @returns {React.ReactElement}
 */
export function Icon({ icon: data, size = 16, className, color, style, ...rest }) {
	if (!data || !data.attr) return null

	const svgProps = {
		xmlns: 'http://www.w3.org/2000/svg',
		width: size,
		height: size,
		...data.attr,
		...rest,
	}

	if (className) svgProps.className = className
	if (color) svgProps.fill = color
	if (style) svgProps.style = { ...svgProps.style, ...style }

	// Convert hyphenated SVG attrs to React camelCase
	if (svgProps['fill-rule']) {
		svgProps.fillRule = svgProps['fill-rule']
		delete svgProps['fill-rule']
	}
	if (svgProps['clip-rule']) {
		svgProps.clipRule = svgProps['clip-rule']
		delete svgProps['clip-rule']
	}
	if (svgProps['stroke-width']) {
		svgProps.strokeWidth = svgProps['stroke-width']
		delete svgProps['stroke-width']
	}
	if (svgProps['stroke-linecap']) {
		svgProps.strokeLinecap = svgProps['stroke-linecap']
		delete svgProps['stroke-linecap']
	}
	if (svgProps['stroke-linejoin']) {
		svgProps.strokeLinejoin = svgProps['stroke-linejoin']
		delete svgProps['stroke-linejoin']
	}

	return createElement('svg', svgProps, renderChildren(data.child))
}

/**
 * Create a drop-in replacement component for a specific icon.
 * This returns a component with the same API as react-icons:
 *   <IconComponent size={20} className="..." />
 *
 * @param {Object} data - Icon data from @nan0web/icons sets
 * @returns {React.FC} React component
 */
export function reactIcon(data) {
	const component = ({ size, className, color, style, ...rest }) =>
		Icon({ icon: data, size, className, color, style, ...rest })
	component.displayName = 'NanoIcon'
	return component
}

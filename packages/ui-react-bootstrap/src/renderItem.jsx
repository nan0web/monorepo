import React, { Suspense, createElement } from 'react'
import { Blocks } from './Blocks/index.js'

/**
 * Shared layout/microwidget components should be passed through
 * a registry or explicitly matched here. We'll map string identifiers to
 * the abstract Blocks export.
 */
const getBlockMap = () => ({
	Description: Blocks.Description,
	Excerpt: Blocks.Excerpt,
	Features: Blocks.Features,
	Content: Blocks.Content,
	Accordion: Blocks.Accordion,
	Files: Blocks.Files,
	Price: Blocks.Price,
	Contract: Blocks.Contract,
	Nav: Blocks.Nav,
	Sidebar: Blocks.Sidebar,
	Callout: Blocks.Callout,
	Markdown: Blocks.Markdown,
})

/**
 * Converts a legacy `$layout` directive into a `$content` array.
 * This replaces the old EJS template system with data-driven rendering.
 * Each layout maps to a sequence of standard micro-components.
 */
export function layoutToContent(layout) {
	if (!layout) return null

	const l = String(layout).toLowerCase()

	// Standard page: promo → title → description → content → accordion → files → contacts
	if (l === 'standard') return ['Description', 'Excerpt', 'Content', 'Accordion', 'Files']

	// Product page: promo → description → excerpt → features → price → content → accordion → files
	if (l === 'product')
		return ['Description', 'Excerpt', 'Features', 'Price', 'Content', 'Accordion', 'Files']

	// Contract page (policies etc): description + contract sections
	if (l === 'contract') return ['Description', 'Contract']

	// Sections page: description + content
	if (l === 'sections') return ['Description', 'Sidebar', 'Content']

	// Posts listing / news archive
	if (l === 'posts') return [{ Blog: true }]

	// Single post
	if (l === 'post') return ['Content']

	// Product catalog (good/deposits, good/credits, good/landing)
	if (l.startsWith('good/'))
		return ['Description', 'Excerpt', 'Products.Showcase', 'Content', 'Files']

	// Products listing
	if (l === 'products') return ['Description', 'Products.Showcase', 'Content', 'Files']

	// People (management)
	if (l === 'people') return ['Content']

	// Terms & conditions
	if (l === 'terms') return ['Content', 'Files']

	// Careers
	if (l === 'careers') return ['Content']

	// Metals
	if (l === 'metaly') return ['Description', 'Content']

	// Providers (transfers)
	if (l === 'providers') return ['Description', 'Content']

	// Redirect
	if (l === 'redirect' || l === 'index') return null // handled separately

	// Fallback: show content
	return ['Content']
}

/**
 * renderItem - Recursive renderer for content nodes from JSON/YAML
 * Can render standard HTML tags, components from registry, and our universal Blocks.
 *
 * @param {any} item - The current node to render
 * @param {number|string} index - Key for React rendering
 * @param {Object} sharedProps - Properties containing config, state and functions available to all items
 * @param {Object} [registry={}] - App-specific mappings for complex components (like 'Promo', 'Apps.List', etc)
 */
export function renderItem(item, index, sharedProps, registry = {}) {
	if (typeof item === 'string') {
		// External specific Components pushed through registry
		if (registry[item]) {
			const RegistryComponent = registry[item]
			return (
				<RegistryComponent
					key={index}
					{...sharedProps}
					node={sharedProps.doc?.[item.toLowerCase()]}
				/>
			)
		}

		// Standard layout micro-components (string variants mapping to Blocks)
		const BlockComponent = getBlockMap()[item]
		if (BlockComponent) {
			return <BlockComponent key={index} {...sharedProps} />
		}

		// Render text with possible HTML entities (like &nbsp;)
		if (item.includes('&')) {
			return <p key={index} className="container py-2" dangerouslySetInnerHTML={{ __html: item }} />
		}
		return (
			<p key={index} className="container py-2">
				{item}
			</p>
		)
	}

	// Handle arrays inside content (recursive rendering)
	if (Array.isArray(item)) {
		return item.map((v, i) => renderItem(v, `${index}-${i}`, sharedProps, registry))
	}

	if (typeof item !== 'object' || item === null) return null

	const nonTokenKeys = Object.keys(item).filter((k) => !k.startsWith('$'))
	if (nonTokenKeys.length === 0) return null

	const key = nonTokenKeys[0]
	const value = item[key]

	if (key === 'Header.Header' || key === 'Footer.Footer') return null

	// HTML elements
	const htmlTags = [
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'p',
		'span',
		'div',
		'section',
		'article',
		'nav',
		'header',
		'footer',
		'main',
		'ul',
		'ol',
		'li',
		'a',
		'strong',
		'em',
		'b',
		'i',
		'u',
		's',
		'br',
		'img',
		'iframe',
		'table',
		'thead',
		'tbody',
		'tr',
		'th',
		'td',
	]
	// Void HTML elements — cannot have children in React
	const voidTags = [
		'br',
		'hr',
		'img',
		'input',
		'meta',
		'link',
		'col',
		'embed',
		'source',
		'track',
		'wbr',
	]

	if (voidTags.includes(key)) {
		const props = { key: index }
		if (item.$class) props.className = item.$class
		// Pass $-prefixed attributes (like $src, $alt, $type)
		Object.keys(item).forEach((k) => {
			if (k.startsWith('$') && k !== '$class' && k !== '$clear') {
				const propName = k.slice(1)
				if (propName === 'class') props.className = item[k]
				else props[propName] = item[k]
			}
		})
		// For img, pass src/alt from value
		if (key === 'img' && typeof value === 'string') {
			props.src = value
		}
		return createElement(key, props)
	}

	if (htmlTags.includes(key)) {
		let className = item.$class
		const oldTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div']
		if (!className && oldTags.includes(key)) {
			className = key.startsWith('h') ? 'container mt-4 mb-3 fw-bold' : 'container py-1'
		}
		if (!className && key === 'table') {
			className = 'table table-striped table-hover mt-3 w-100'
		}

		const props = { key: index }
		if (className) props.className = className

		Object.keys(item).forEach((k) => {
			if (k.startsWith('$') && k !== '$class' && k !== '$clear') {
				const propName = k.slice(1)
				if (propName === 'class') props.className = item[k]
				else if (propName === 'for') props.htmlFor = item[k]
				else props[propName] = item[k]
			}
		})

		if (key === 'a' && props.href && !props.href.startsWith('http')) {
			const originalHref = props.href
			props.onClick = (e) => sharedProps.onNavigate?.(e, originalHref)
		}

		if (Array.isArray(value)) {
			return createElement(
				key,
				props,
				value.map((v, i) => {
					// Handle string items explicitly inside tag children to avoid <p> wrapper
					if (typeof v === 'string') {
						if (getBlockMap()[v] || registry[v] || v.startsWith('App.')) {
							return renderItem(v, `${index}-${i}`, sharedProps, registry)
						}
						const processedString = v.includes('&')
							? createElement('span', {
									key: `${index}-${i}`,
									dangerouslySetInnerHTML: { __html: v },
								})
							: v

						if (key === 'ul' || key === 'ol') {
							return createElement('li', { key: `${index}-${i}` }, processedString)
						}

						if (key === 'tr') {
							return createElement('td', { key: `${index}-${i}` }, processedString)
						}

						return processedString
					}
					return renderItem(v, `${index}-${i}`, sharedProps, registry)
				}),
			)
		}
		// String value with HTML entities
		if (typeof value === 'string' && value.includes('&')) {
			return createElement(key, { ...props, dangerouslySetInnerHTML: { __html: value } })
		}
		// Object value — render recursively (e.g. { $class: "table", table: {thead: [], tbody: []} })
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			const childKeys = Object.keys(value).filter((k) => !k.startsWith('$'))
			if (childKeys.length > 1) {
				return createElement(
					key,
					props,
					childKeys.map((childKey, i) =>
						renderItem(
							{ [childKey]: value[childKey] },
							`${index}-child-${i}`,
							sharedProps,
							registry,
						),
					),
				)
			}
			return createElement(key, props, renderItem(value, `${index}-child`, sharedProps, registry))
		}
		return createElement(key, props, value)
	}

	if (key === 'hr')
		return (
			<div className="container" key={index}>
				<hr />
			</div>
		)

	// Custom Components mapped to Blocks
	const CustomBlockComponent = getBlockMap()[key]
	if (CustomBlockComponent) {
		return <CustomBlockComponent key={index} {...sharedProps} />
	}

	// External Registry Components (e.g. Blog, Promo, Apps.List)
	if (registry[key] && !key.startsWith('App.')) {
		const InternalComponent = registry[key]
		// When value is `true` and item has no extra non-$ keys, resolve node from doc
		const hasExtraKeys = Object.keys(item).filter((k) => !k.startsWith('$') && k !== key).length > 0
		const baseNode =
			value === true && !hasExtraKeys ? sharedProps.doc?.[key.toLowerCase()] || item : item

		// Always merge $-prefixed properties from the YAML item into node
		// so components receive config like $class, $value, $variant via node.$xxx
		const dollarProps = {}
		for (const [k, v] of Object.entries(item)) {
			if (k.startsWith('$') && k !== '$clear') dollarProps[k] = v
		}
		const nodeValue =
			Object.keys(dollarProps).length > 0 && typeof baseNode === 'object' && baseNode !== null
				? { ...baseNode, ...dollarProps }
				: baseNode

		return <InternalComponent key={index} node={nodeValue} {...sharedProps} />
	}

	// App Registry: App.X = full app, App.X.Y = widget
	if (key.startsWith('App.')) {
		const Component = registry[key]
		if (!Component)
			return (
				<div key={index} className="container my-2 text-danger small">
					Unknown: {key}
				</div>
			)

		const isWidget = key.split('.').length > 2 // App.Payments.TopupMobile

		if (isWidget) {
			// Merge YAML value as props + $-prefixed sibling directives
			const widgetProps = typeof value === 'object' && value !== null ? { ...value } : {}
			for (const [dk, dv] of Object.entries(item)) {
				if (dk.startsWith('$')) widgetProps[dk.slice(1)] = dv
			}
			return (
				<div key={index} className="container">
					<Suspense fallback={<div>Loading...</div>}>
						<Component {...sharedProps} {...widgetProps} />
					</Suspense>
				</div>
			)
		}

		const appProps = typeof value === 'object' && value !== null ? value : {}
		return (
			<div key={index}>
				<Suspense fallback={<div>Loading...</div>}>
					<Component {...sharedProps} mode="embedded" {...appProps} />
				</Suspense>
			</div>
		)
	}

	return (
		<div key={index} className="container my-2 small text-muted">
			Unknown item type: {key}
		</div>
	)
}

/**
 * Component version of the core Content Renderer
 */
export function Renderer({ doc, globals, locale, db, onNavigate, duty, registry = {} }) {
	if (!doc) return null

	// Content priority: explicit $content > layout-generated > doc.content > doc.doc.content
	let content = doc.$content || null
	if (!content) {
		const layout = doc.$layout
		if (layout) {
			content = layoutToContent(layout)
		}
	}
	if (!content) {
		content = doc.content || doc.doc?.content || []
	}
	const sharedProps = { locale, doc, globals, db, onNavigate, duty }

	if (doc.$redirect) {
		return (
			<div className="container py-5 text-center">
				<div className="spinner-border text-primary mb-3" />
				<p>
					Redirecting to{' '}
					<a href={doc.$redirect} onClick={(e) => onNavigate(e, doc.$redirect)}>
						{doc.$redirect}
					</a>
					...
				</p>
			</div>
		)
	}

	const hasContent = Array.isArray(content) && content.length > 0
	let promo = doc.promo || doc.doc?.promo
	const title = doc.doc?.title || doc.title
	const hideTitle = doc.$hideTitle ?? doc.doc?.$hideTitle ?? false
	let image = doc.doc?.image || doc.image || doc.doc?.imageUrl || doc.imageUrl

	// Якщо $content явно має 'Promo', не дублюємо його зверху
	if (
		hasContent &&
		content.some((item) => item === 'Promo' || (item && typeof item === 'object' && item.Promo))
	) {
		promo = null
		image = null
	}

	const PromoComponent = registry['Promo']

	return (
		<>
			{/* 1. Має бути Промо або банер із зображенням */}
			{promo ? (
				PromoComponent ? (
					<PromoComponent node={promo} onNavigate={onNavigate} />
				) : (
					<div>Promo Missing from Registry</div>
				)
			) : image ? (
				<section className="header-slider mb-5">
					<div className="carousel-inner h-100">
						<div className="carousel-item active">
							<img
								src={image}
								className="bg"
								alt={title}
								onError={(e) => {
									e.target.src = '/images/default/news.jpg'
								}}
							/>
							<div className="carousel-caption">
								<h1 className="display-4 fw-bold">{title}</h1>
							</div>
						</div>
					</div>
				</section>
			) : null}

			{/* 2. Має бути заголовок (якщо немає банера і не приховано явно) */}
			{hasContent ? (
				<>
					{title &&
						!hideTitle &&
						!doc.promo &&
						!doc.doc?.promo &&
						!doc.image &&
						!doc.doc?.image && (
							<section className="container text-center text-md-start pt-5 pb-4">
								<h1 className="fw-bold m-0">{title}</h1>
							</section>
						)}
					{content.map((item, i) => renderItem(item, i, sharedProps, registry))}
				</>
			) : (
				<div className="container py-5">
					<h1 className="display-4 fw-bold mb-3">{title}</h1>
					{image && <img src={image} className="img-fluid rounded shadow mb-4" alt={title} />}
					<div
						className="lead"
						dangerouslySetInnerHTML={{
							__html: doc.description || doc.doc?.description || doc.text || '',
						}}
					/>
				</div>
			)}
		</>
	)
}

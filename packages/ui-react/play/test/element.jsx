import React from 'react'
import { createRoot } from 'react-dom/client'
import { UIProvider } from '../../src/context/UIContext.jsx'
import UIContextValue from '../../src/context/UIContextValue.jsx'
import Element from '../../src/Element.jsx'
import { NightTheme } from '@nan0web/ui'

const MockTypography = ({ children }) => (
	<div
		data-testid="typography"
		style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#007bff' }}
	>
		[Typography]: {children}
	</div>
)

/**
 * Test Playground for Element App Rendering.
 */
class TestAppClass {
	constructor(props) {
		this.props = props
		console.log('🏗️ TestApp instantiated with props:', props)
	}

	async run() {
		console.log('🚀 TestApp.run() executing...')
		// Return standard app structure
		return {
			$content: [
				{ Typography: ['Hello from TestApp!'] },
				{ p: ['If you see the blue bold text above, rendering works.'] },
			],
		}
	}

	static from(input) {
		console.log('📦 TestApp.from() called')
		return new TestAppClass(input)
	}
}

// Register app manually.
// Note: Element.jsx now handles classes directly if they aren't loader functions.
const mockApps = new Map([['TestApp', TestAppClass]])

const mockComponents = new Map([['Typography', MockTypography]])

const context = new UIContextValue({
	theme: NightTheme,
	apps: mockApps,
	components: mockComponents,
	db: { extract: () => ({}) },
})

function TestPlayground() {
	console.log('🎨 TestPlayground rendering...')
	return (
		<UIProvider value={context}>
			<div
				style={{
					padding: '2rem',
					maxWidth: '800px',
					margin: '0 auto',
					fontFamily: 'sans-serif',
					color: '#333',
				}}
			>
				<header
					style={{ borderBottom: '1px solid #ddd', paddingBottom: '1rem', marginBottom: '2rem' }}
				>
					<h1>Element App Render Test</h1>
					<p>
						Rendering block: <code>{'{ App: "TestApp" }'}</code>
					</p>
				</header>

				<main
					style={{
						backgroundColor: '#fff',
						padding: '1.5rem',
						borderRadius: '8px',
						border: '1px solid #ddd',
						boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
					}}
				>
					<h3 style={{ marginTop: 0 }}>Rendered Output:</h3>
					{/* This is the point of interest */}
					{Element.render({ App: 'TestApp' }, 'browser-test-key', context)}
				</main>

				<footer
					style={{
						marginTop: '2rem',
						fontSize: '0.8rem',
						color: '#888',
						borderTop: '1px solid #eee',
						paddingTop: '1rem',
					}}
				>
					<p>Check the browser console for logs starting with 🏗️, 📦, and 🚀.</p>
				</footer>
			</div>
		</UIProvider>
	)
}

// Mount to DOM
const container = document.getElementById('root')
if (container) {
	const root = createRoot(container)
	root.render(<TestPlayground />)
} else {
	console.error('❌ No #root container found. Check play/test/element.html')
}

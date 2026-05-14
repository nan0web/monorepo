import React from 'react'
import DB from '@nan0web/db-browser'
import { UIRoot } from '../src/UIRoot.jsx'
import { UIProvider } from '../src/context/UIContext.jsx'
import UIContextValue from '../src/context/UIContextValue.jsx'
import components from '../src/components/index.jsx'
import renderers from '../src/renderers/index.jsx'

/* -------------------------------------------------
   Custom Component – HelloWorld (agnostic example)
   ------------------------------------------------- */
function HelloWorld({ name = 'World', style }) {
	const { theme } = useUI()
	const defaultStyle = {
		padding: '0.5rem 1rem',
		backgroundColor: theme?.atoms?.Button?.backgroundColor ?? '#0d6efd',
		color: '#fff',
		borderRadius: '0.25rem',
		...style,
	}
	return <div style={defaultStyle}>👋 Hello, {name}!</div>
}

/* -------------------------------------------------
   Playground – rendering with overrides
   ------------------------------------------------- */
export default function CustomExample() {
	const db = new DB({ host: window.location.origin })
	const customComponents = new Map([['HelloWorld', HelloWorld]])
	const customRenderers = new Map([...renderers]) // Already has interactive
	const customApps = new Map([
		['DemoApp', () => import('../src/apps/demo/App.js')],
		['SimpleApp', () => import('../src/apps/demo/SimpleApp.js')],
		[
			'CustomRendererApp',
			async () => {
				// Use the JS version for agnostic compute
				const { default: CustomRendererAppJS } =
					await import('../src/apps/demo/CustomRendererApp.js')
				return { default: CustomRendererAppJS }
			},
		],
		['NavigationApp', () => import('../src/apps/navigation/App.js')],
		['ThemeSwitcherApp', () => import('../src/apps/theme-switcher/App.js')],
	])

	return (
		<UIProvider
			value={UIContextValue.from({
				components: new Map([...components, ...customComponents]),
				renderers: new Map([...renderers, ...customRenderers]),
				apps: new Map([...customApps]),
				db,
			})}
		>
			<UIRoot
				db={db}
				components={customComponents}
				renderers={customRenderers}
				apps={customApps}
				actions={{}}
			/>
		</UIProvider>
	)
}

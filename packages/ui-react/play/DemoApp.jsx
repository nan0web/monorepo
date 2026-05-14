import React, { useState, useEffect } from 'react'
import DB from '@nan0web/db-browser'
import { NightTheme, Theme } from '@nan0web/ui'
import UIReact from '../src/UIReact.jsx'
import { useUI } from '../src/context/UIContext.jsx'

/**
 * @component
 * @param {Object} props
 * @param {DB} props.db
 */
export default function DemoApp({ db }) {
	const ui = useUI()
	const [currentPath, setCurrentPath] = useState('/play/index.json')
	const [sharedData, setSharedData] = useState({ theme: { current: 'light' } }) // Load from _.json

	// Convert URL pathname → JSON document path
	const getPathFromUrl = () => {
		const pathname = window.location.pathname
		// If root or index.html, load index.json from current directory logic (handled by data presumably)
		// But in playground, everything is flat in /play/ or /play/apps/
		// Let's try to keep it simple but flexible:
		if (pathname.endsWith('/')) return pathname + 'index.json'
		if (pathname.endsWith('.html')) return pathname.replace('.html', '.json')
		return pathname
	}

	// Load shared data (nav, theme) from _.json
	useEffect(() => {
		async function loadShared() {
			try {
				// Try to load _.json from the same level as index.html
				// Assuming we are in /play/ mostly.
				// A more robust way is to fetch relative './_.json' but fetch might need absolute if base is weird.
				// For playground, let's stick to '/play/_.json' if we know we are in play,
				// OR try to derive it.
				// BUT: The original request was to remove hardcode.
				// Let's assume the "shared data" is always at the root of the "mount point" which is /play/ here.
				// So maybe we leave it for now if we can't easily detect mount point?
				// Actually, let's try relative fetch first.
				const data = await db.fetch('/play/_.json')
				if (data) {
					setSharedData(data)
					// Set initial theme from data
					const initialTheme = data.theme?.current === 'night' ? NightTheme : Theme
					setCurrentTheme(initialTheme)
					// Also set in localStorage for persistence
					localStorage.setItem('theme', data.theme?.current || 'light')
				}
			} catch (err) {
				console.error('Failed to load shared data', err)
			}
		}
		loadShared()
	}, [db])

	const [currentTheme, setCurrentTheme] = useState(Theme)

	const setThemeFromData = (newThemeName) => {
		const newTheme = newThemeName === 'night' ? NightTheme : Theme
		setCurrentTheme(newTheme)
		// Update shared data
		setSharedData((prev) => ({ ...prev, theme: { current: newThemeName } }))
		// Save to localStorage
		localStorage.setItem('theme', newThemeName)
		// Optionally save to db for persistence across sessions (for demo, just state/local)
		db.saveDocument('/play/_.json', sharedData).catch(console.error)

		// PROPAGATE to root UI context so background changes
		if (ui?.setTheme) {
			ui.setTheme(newTheme)
		}
	}


	// Initialise path + listen to history changes
	useEffect(() => {
		setCurrentPath(getPathFromUrl())
		const handlePopState = () => {
			console.log('POPState', getPathFromUrl())
			setCurrentPath(getPathFromUrl())
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [])

	console.log('DemoApp')

	// Navigation handler
	const handleNavigation = (path) => (e) => {
		e.preventDefault()
		const htmlPath = path.replace('.json', '.html')
		window.history.pushState({}, '', htmlPath)
		setCurrentPath(path)
	}

	// Load nav from shared data
	const navLinks =
		sharedData.nav?.map((item) => ({
			path: item.href.replace('.html', '.json'),
			label: item.title,
		})) || []

	return (
		<div className="demo-app">
			<header style={{ padding: '1rem', background: '#f5f5f5', color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>
				<h1>DemoApp</h1>
				<nav>
					<ul
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							listStyle: 'none',
							gap: '0.5rem 1rem',
							padding: 0,
							margin: '0.5rem 0',
						}}
					>
						{navLinks.map((link) => (
							<li key={link.path}>
								<a
									href={link.path.replace('.json', '.html')}
									onClick={handleNavigation(link.path)}
									style={{
										textDecoration: currentPath === link.path ? 'underline' : 'none',
										fontWeight: currentPath === link.path ? 'bold' : 'normal',
										color: '#2563eb', // Explicit link color (blue-600)
										cursor: 'pointer',
									}}
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</nav>
				{/* Theme info from data */}
				<p>Current theme from data: {sharedData.theme?.current}</p>
			</header>
			<main>
				<UIReact
					db={db}
					documentPath={currentPath}
					context={{
						theme: currentTheme,
						setTheme: setThemeFromData, // Pass setter that updates data
						reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
					}}
				/>
			</main>
		</div>
	)
}

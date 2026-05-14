import React from 'react'
import { createRoot } from 'react-dom/client'
import { UIProvider, components, renderers } from '../src/index.jsx'
import Playground from './Playground.jsx'
import VisualGallery from './VisualGallery.jsx'
import DB from '@nan0web/db-browser'
import { WebCommentAdapter } from '@nan0web/comment'
import 'bootstrap/scss/bootstrap.scss'

class LocalCommentDB {
	async save(c) {
		const stored = await this.loadAll()
		stored.push(c)
		localStorage.setItem('nan0web-sandbox-comments', JSON.stringify(stored))
	}
	async loadAll() {
		const stored = localStorage.getItem('nan0web-sandbox-comments')
		return stored ? JSON.parse(stored) : []
	}
	async clear() {
		localStorage.removeItem('nan0web-sandbox-comments')
	}
	async remove(id) {
		const stored = await this.loadAll()
		localStorage.setItem('nan0web-sandbox-comments', JSON.stringify(stored.filter(x => x.id !== id)))
	}
}

const commentAdapter = new WebCommentAdapter({
	db: new LocalCommentDB(),
	t: (key) => key
})

const db = new DB({ host: window.location.origin, console })
const apps = new Map([
	['DemoApp', () => import('../src/apps/demo/App.js')],
	['NavigationApp', () => import('../src/apps/navigation/App.js')],
	['ThemeApp', () => import('../src/apps/theme-switcher/App.js')],
	['SandboxApp', () => import('../src/apps/sandbox/App.js')],
])

const container = document.getElementById('root') || document.getElementById('app')
const root = createRoot(container)

const App = () => {
	const [view, setView] = React.useState(window.location.search.includes('gallery') ? 'gallery' : 'playground')

	React.useEffect(() => {
		const handlePopState = () => {
			setView(window.location.search.includes('gallery') ? 'gallery' : 'playground')
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [])

	return (
		<UIProvider value={{ components, renderers, apps }}>
			{view === 'gallery' ? <VisualGallery /> : <Playground db={db} />}
			<div style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 9999, display: 'flex', gap: '8px' }}>
				<button 
					className="btn btn-warning btn-sm shadow text-dark fw-bold"
					onClick={() => commentAdapter.showCommentList()}
				>
					💬 Список 
				</button>
				<button 
					className="btn btn-primary btn-sm shadow fw-bold"
					onClick={() => commentAdapter.start()}
				>
					➕ Новий
				</button>
				<button 
					className="btn btn-dark btn-sm shadow"
					onClick={() => {
						const next = view === 'gallery' ? '?' : '?gallery'
						window.history.pushState({}, '', next)
						setView(view === 'gallery' ? 'playground' : 'gallery')
					}}
				>
					{view === 'gallery' ? '→ Playground' : '→ Visual Gallery'}
				</button>
			</div>
		</UIProvider>
	)
}

root.render(<App />)

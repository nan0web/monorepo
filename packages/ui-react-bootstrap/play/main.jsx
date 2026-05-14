import React from 'react'
import { createRoot } from 'react-dom/client'
import { UIProvider, BootstrapTheme, components, renderers } from '../src/index.jsx'
import { MemoryRouter } from 'react-router-dom'
import Playground from './Playground.jsx'
import DB from '@nan0web/db-browser'
import 'bootstrap/scss/bootstrap.scss'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const db = new DB({ host: window.location.origin, console })
const apps = new Map()

const root = createRoot(document.getElementById('app'))
root.render(
	<MemoryRouter>
		<UIProvider value={{ theme: BootstrapTheme, components, renderers, apps }}>
			<Playground db={db} />
		</UIProvider>
	</MemoryRouter>,
)

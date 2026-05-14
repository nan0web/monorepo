import {
	components as CoreComponents,
	renderers as CoreRenderers,
	UIReact,
	useUI,
	UIProvider,
	UIContextValue,
	tokens,
	Element,
	Theme,
} from '@nan0web/ui-react'
import { createTheme } from '@nan0web/ui'
import BootstrapComponents from './components/index.jsx'
import * as BootstrapRenderers from './renderers/index.jsx'
import BootstrapTheme from './theme/BootstrapTheme.js'

// Import individual components for named exports
import Button from './components/atoms/Button.jsx'
import Input from './components/atoms/Input.jsx'
import Typography from './components/atoms/Typography.jsx'
import Card from './components/molecules/Card.jsx'
import Modal from './components/organisms/Modal.jsx'
import TreeView from './components/atoms/TreeView.jsx'
import Autocomplete from './components/atoms/Autocomplete.jsx'
import Header from './components/organisms/Header/Header.jsx'
import Footer from './components/organisms/Footer/Footer.jsx'
import Promo from './components/organisms/Promo/Promo.jsx'
import Telephone from './components/atoms/Telephone/Telephone.jsx'
import Email from './components/atoms/Email/Email.jsx'
import Address from './components/atoms/Address/Address.jsx'
import Icon from './components/atoms/Icon/Icon.jsx'
import Loading from './components/molecules/Loading/Loading.jsx'
import Heading from './components/molecules/Heading/Heading.jsx'
import Accordion from './components/molecules/Accordion/Accordion.jsx'
import Blog from './components/molecules/Blog/Blog.jsx'
import Contacts from './components/molecules/Contacts/Contacts.jsx'
import { SortableList } from './components/SortableList.jsx'
import Sandbox from './components/organisms/Sandbox/Sandbox.jsx'

// Extend core components with Bootstrap
/** @type {Map<string, React.ComponentType<any>>} */
const components = new Map([...CoreComponents, ...BootstrapComponents])

// Extend renderers for Bootstrap-specific rendering
const renderers = new Map([
	...CoreRenderers,
	['tree', BootstrapRenderers.renderTreeView],
	['autocomplete', BootstrapRenderers.renderAutocomplete],
])

// Register Bootstrap theme (disables ui-core styles to rely on Bootstrap SCSS)
/**
 * @param {string | Object} themeNameOrConfig
 * @returns {any}
 */
const getUserTheme = (themeNameOrConfig) => {
	if (themeNameOrConfig === 'bootstrap') return BootstrapTheme
	if (typeof themeNameOrConfig === 'string') {
		// Fallback for named themes; could integrate with ui-react themes if available
		return themeNameOrConfig
	}
	// Assume config object and create theme
	return createTheme(themeNameOrConfig || {})
}

export {
	components,
	renderers,
	UIReact,
	useUI,
	UIProvider,
	UIContextValue,
	tokens,
	Element,
	Theme,
	getUserTheme,
	BootstrapTheme,
}

export { Blocks } from './Blocks/index.js'
export { Renderer, renderItem, layoutToContent } from './renderItem.jsx'

export { Button, Input, Typography, Card, Modal, TreeView, Autocomplete }
export {
	Header,
	Footer,
	Promo,
	Telephone,
	Email,
	Address,
	Icon,
	Loading,
	Heading,
	Accordion,
	Blog,
	Contacts,
	SortableList,
	Sandbox,
}
export { iconMap } from './components/atoms/Icon/Icon.jsx'

export default { components, renderers, UIReact }
export { OlmuiInspector } from '../play/components/OlmuiInspector.jsx'

import Button from './atoms/Button.jsx'
import Input from './atoms/Input.jsx'
import Typography from './atoms/Typography.jsx'
import TreeView from './atoms/TreeView.jsx'
import Autocomplete from './atoms/Autocomplete.jsx'
import Card from './molecules/Card.jsx'
import Modal from './organisms/Modal.jsx'

import Header from './organisms/Header/Header.jsx'
import Footer from './organisms/Footer/Footer.jsx'
import Promo from './organisms/Promo/Promo.jsx'

// Atoms
import Telephone from './atoms/Telephone/Telephone.jsx'
import Email from './atoms/Email/Email.jsx'
import Address from './atoms/Address/Address.jsx'
import Icon from './atoms/Icon/Icon.jsx'

// Molecules
import Loading from './molecules/Loading/Loading.jsx'
import Heading from './molecules/Heading/Heading.jsx'
import Accordion from './molecules/Accordion/Accordion.jsx'
import Blog from './molecules/Blog/Blog.jsx'
import Contacts from './molecules/Contacts/Contacts.jsx'
import Sandbox from './organisms/Sandbox/Sandbox.jsx'

/** @type {Map<string, React.ComponentType<any>>} */
const components = new Map([
	['Button', Button],
	['Input', Input],
	['Typography', Typography],
	['Card', Card],
	['Modal', Modal],
	['TreeView', TreeView],
	['Autocomplete', Autocomplete],
	// Organisms
	['Header.Header', Header],
	['Footer.Footer', Footer],
	['Promo', Promo],
	// Atoms
	['Telephone', Telephone],
	['Email', Email],
	['Address', Address],
	['Icon', Icon],
	// Molecules
	['Loading', Loading],
	['Heading', Heading],
	['Accordion', Accordion],
	['Blog', Blog],
	['Contacts', Contacts],
	['Sandbox', Sandbox],
])

export { Button, Input, Typography, Card, Modal, TreeView, Autocomplete }
export default components

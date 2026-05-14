import { createTheme } from '@nan0web/ui'

// Empty theme for Bootstrap to disable ui-core inline styles and avoid conflicts with SCSS
// All styling is handled by Bootstrap classes and custom SCSS variables
export default createTheme({
	name: 'bootstrap',
	atoms: {},
	molecules: {},
	organisms: {},
})

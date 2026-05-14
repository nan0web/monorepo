/**
 * @file UI Context for theme, db, language, and accessibility flags.
 */
import React, { createContext, useContext, useState } from 'react'
import Theme from '../Theme.js'
import UIContextValue from './UIContextValue.jsx'

export const UIContext = createContext(new UIContextValue())

/**
 * Hook to access UI context.
 * @returns {UIContextValue} context
 */
export const useUI = () => useContext(UIContext)

/**
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Partial<UIContextValue>} props.value - Additional context values (theme, reducedMotion, etc.)
 */
export function UIProvider({ children, value: initValue = {} }) {
	const [theme, setTheme] = useState(() => initValue.theme || Theme)
	const [lang, setLang] = useState(() => initValue.lang || 'en')
	const [db, setDb] = useState(() => initValue.db)
	const [reducedMotion, setReducedMotion] = useState(() => Boolean(initValue.reducedMotion))
	const [apps, setApps] = useState(() => initValue.apps || new Map())
	const [components, setComponents] = useState(() => initValue.components || new Map())
	const [renderers, setRenderers] = useState(() => initValue.renderers || new Map())
	const [actions, setActions] = useState(() => initValue.actions || {})
	const [data, setData] = useState(() => initValue.data || {})
	const [t, setT] = useState(() => initValue.t ?? ((k) => k))

	const value = UIContextValue.from({
		initValue,
		theme,
		setTheme,
		lang,
		setLang,
		db,
		setDb,
		reducedMotion,
		setReducedMotion,
		apps,
		setApps,
		components,
		setComponents,
		renderers,
		setRenderers,
		actions,
		setActions,
		data,
		setData,
		t,
		setT,
	})

	return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

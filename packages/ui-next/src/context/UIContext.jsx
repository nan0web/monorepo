"use client";
import { createContext, useContext } from 'react';

/**
 * @typedef {Object} UIContextValue
 * @property {Map<string, any>} components
 * @property {Map<string, any>} renderers
 * @property {Map<string, any>} apps
 * @property {Record<string, Function>} actions
 * @property {Console} console
 * @property {any} theme
 * @property {Function} setTheme
 * @property {Function} t
 * @property {string} uri
 * @property {any} db
 */

export const UIContext = createContext(/** @type {UIContextValue | null} */ (null));

export function useUIContext() {
    const ctx = useContext(UIContext);
    if (!ctx) {
        throw new Error('useUIContext must be used within a NextUiRoot (UIProvider)');
    }
    return ctx;
}

export const UIProvider = UIContext.Provider;

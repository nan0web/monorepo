"use client";
import React, { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UIProvider } from './context/UIContext.jsx';

/**
 * NextUiRoot - Next.js App Router Provider for OLMUI
 * 
 * Provides the global UI context required by Element/ServerElement/ClientElement.
 * This component acts as the bridge between Next.js routing and OLMUI.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Application tree
 * @param {Map<string, any>} [props.components] - Component registry
 * @param {Map<string, any>} [props.renderers] - Renderers registry
 * @param {Map<string, any>} [props.apps] - Apps registry
 * @param {Record<string, Function>} [props.actions] - Global actions
 * @param {Console} [props.console] - Logger
 * @param {any} [props.theme] - Current theme
 * @param {Function} [props.setTheme] - Theme setter
 * @param {Function} [props.t] - Localization function
 * @param {any} [props.db] - DBBrowser instance
 */
export function NextUiRoot({
    children,
    components = new Map(),
    renderers = new Map(),
    apps = new Map(),
    actions = {},
    console: logger = console,
    theme,
    setTheme = () => {},
    t = (v) => v,
    db
}) {
    // Next.js Navigation Hooks
    const router = useRouter();
    const pathname = usePathname();

    // Context memoization
    const contextValue = useMemo(() => {
        // [EXAMPLE 1] Programmatic Navigation via actions.navigate
        // Any ModelAsApp invoking this.context.actions.navigate('/path') 
        // will seamlessly trigger Next.js client-side navigation.
        const mergedActions = {
            ...actions,
            navigate: (path) => {
                logger.debug(`[NextUiRoot] Programmatic navigation to: ${path}`);
                router.push(path);
            }
        };

        return {
            components,
            renderers,
            apps,
            actions: mergedActions,
            console: logger,
            theme,
            setTheme,
            t,
            // [EXAMPLE 2] URI mapping via usePathname()
            // This ensures all models and components know the current route,
            // without needing window.location.
            uri: pathname,
            db
        };
    }, [components, renderers, apps, actions, logger, theme, setTheme, t, pathname, router, db]);

    return (
        <UIProvider value={contextValue}>
            {children}
        </UIProvider>
    );
}

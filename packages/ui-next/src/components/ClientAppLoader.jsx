"use client";

import React, { Suspense, lazy, useEffect, useState, useCallback } from 'react';
import { useUIContext } from '../context/UIContext.jsx';
import { Theme } from '@nan0web/ui';

// Simple Alert fallback if needed
const Alert = ({ variant = 'info', children = [] }) => (
    <div className={['alert', `alert-${variant}`].join(' ')}>{children}</div>
);

// Cache for lazy app loaders to prevent re-loading
const lazyAppLoaders = new Map();

/**
 * Helper to resolve async imports safely.
 * @param {Function} loadable
 */
async function resolveAsyncImport(loadable) {
    try {
        const module = await loadable();
        if (module.default && typeof module.default === 'function') {
            return { default: module.default };
        }
        if (typeof module === 'function') {
            return { default: module };
        }
        if (module) {
            return { default: () => React.createElement(module) };
        }
        throw new Error('Module does not contain a valid component');
    } catch (e) {
        return {
            default: () => (
                <Alert variant="danger">Error loading component: {e.message || String(e)}</Alert>
            ),
        };
    }
}

/**
 * ClientAppLoader
 * Handles loading and executing interactive ModelAsApp instances on the client side.
 */
export function ClientAppLoader({ name, input, renderKey, elementProps }) {
    const context = useUIContext();
    const { apps = new Map(), renderers = new Map() } = context;

    const importFn = apps.get(name);

    if (!importFn) {
        const keys = Array.from(apps.keys());
        return (
            <Alert variant="danger">
                <p>App not found <b>{name}</b>.</p>
                <p>Available apps ({keys.length}):</p>
                <ul>
                    {keys.map((app, i) => <li key={i}>{app}</li>)}
                </ul>
            </Alert>
        );
    }

    const cacheKey = `${name}|hasRenderer:true`;

    if (!lazyAppLoaders.has(cacheKey)) {
        lazyAppLoaders.set(
            cacheKey,
            lazy(async () => {
                try {
                    let module;
                    const isLoader = typeof importFn === 'function' && !importFn.prototype?.run && !importFn.toString().startsWith('class ');

                    if (isLoader) {
                        module = await importFn();
                    } else {
                        module = { default: importFn };
                    }

                    let AppComponent = null;

                    if (module.default && typeof module.default === 'function') {
                        AppComponent = module.default;
                    } else if (module.Renderer && typeof module.Renderer === 'function') {
                        AppComponent = module.Renderer;
                    } else if (typeof module === 'function') {
                        AppComponent = module;
                    } else if (module.defaultRenderer && typeof module.defaultRenderer === 'function') {
                        AppComponent = module.defaultRenderer;
                    }

                    let returnDefault = null;
                    if (AppComponent && typeof AppComponent === 'function' && AppComponent.prototype.run) {
                        // Create AppRenderer
                        const AppRenderer = (rendererProps) => {
                            const { context: rendererContext, input: appInput, ...otherProps } = rendererProps;

                            const appInstance = React.useMemo(() => {
                                const initProps = {
                                    db: rendererContext.db?.extract(`apps/${name}`),
                                    theme: rendererContext.theme || Theme,
                                    setTheme: rendererContext.setTheme || (() => {}),
                                    navigate: rendererContext.actions.navigate || (() => {}),
                                    locale: rendererContext.lang || 'en',
                                    uri: rendererContext.uri || '',
                                    element: appInput,
                                    context: rendererContext,
                                    ...otherProps
                                };

                                return AppComponent.from ? AppComponent.from(initProps) : new AppComponent(initProps);
                            }, [rendererContext, appInput, otherProps]);

                            const [appState, setAppState] = useState(null);
                            const [loading, setLoading] = useState(true);
                            const [error, setError] = useState('');

                            useEffect(() => {
                                const loadApp = async () => {
                                    try {
                                        const result = await appInstance.run();
                                        setAppState(result);
                                    } catch (err) {
                                        console.error(`App ${name} run error:`, err);
                                        setError(err);
                                    } finally {
                                        setLoading(false);
                                    }
                                };
                                loadApp();
                            }, [appInstance]);

                            const refresh = useCallback(async () => {
                                setLoading(true);
                                try {
                                    const newResult = await appInstance.run();
                                    setAppState(newResult);
                                } catch (err) {
                                    console.error('Error refreshing app:', err);
                                    setError(err);
                                } finally {
                                    setLoading(false);
                                }
                            }, [appInstance]);

                            useEffect(() => {
                                if (appInstance && appInstance.actions) {
                                    appInstance.actions.refresh = refresh;
                                }
                            }, [appInstance, refresh]);

                            if (loading) {
                                return (
                                    <span style={{ fontStyle: 'italic', opacity: 0.6 }} data-testid={`loading-${name}`}>
                                        Loading app: {name}...
                                    </span>
                                );
                            }

                            if (error || !appState) {
                                return (
                                    <Alert variant="danger">
                                        Failed to load/run app {name}: {error?.message || 'Unknown error'}
                                    </Alert>
                                );
                            }

                            const appData = {
                                ...appState,
                                actions: {
                                    ...appInstance.actions,
                                    refresh,
                                },
                            };

                            if (appData.requiresInput && typeof appData.compute === 'function' && renderers.has('interactive')) {
                                const InteractiveRenderer = renderers.get('interactive');
                                return <InteractiveRenderer element={appData} context={rendererContext} />;
                            } else if (appData.Renderer && (typeof appData.Renderer === 'function' || typeof appData.Renderer === 'object')) {
                                const RendererComp = appData.Renderer;
                                return <RendererComp result={appData} context={rendererContext} />;
                            } else {
                                // Important: We need a way to render internal $content.
                                // We can use a ClientElement component for this.
                                return (
                                    <div className="app-content" data-testid={`app-${name}`}>
                                        {/* TODO: Render $content via ClientElement */}
                                        {JSON.stringify(appData.$content || appData.content)}
                                    </div>
                                );
                            }
                        };
                        
                        AppRenderer.displayName = `AppRenderer(${name})`;
                        returnDefault = { default: AppRenderer };
                    } else {
                        returnDefault = { default: AppComponent };
                    }

                    if (!returnDefault) {
                        throw new Error(`App ${name} does not export a valid component or AppCore class`);
                    }

                    return returnDefault;
                } catch (err) {
                    console.error(`Failed to load/run app ${name}:`, err);
                    return {
                        default: () => (
                            <Alert variant="danger">
                                Failed to load/run app {name}: {err.message || String(err)}
                            </Alert>
                        ),
                    };
                }
            })
        );
    }

    const AppLoader = lazyAppLoaders.get(cacheKey);

    return (
        <Suspense fallback={
            <span style={{ fontStyle: 'italic', opacity: 0.6 }} data-testid={`loading-${name}`}>
                Loading app: {name}...
            </span>
        }>
            <AppLoader context={context} input={input} {...elementProps} />
        </Suspense>
    );
}

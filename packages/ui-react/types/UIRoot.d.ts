/**
 * UIRoot — root container for the @nan0web/ui-react system.
 * Manages:
 * - URI sync from browser location
 * - Theme state (localStorage + prefers-color-scheme)
 * - SPA navigation via pushState
 *
 * Accepts custom components, renderers, apps, and actions to fully override default behavior.
 *
 * @param {Object} props
 * @param {DB} [props.db] - Optional DB instance
 * @param {Map<string, React.Component>} [props.components] - Custom or override components
 * @param {Map<string, Function>} [props.renderers] - Custom or override renderers
 * @param {Map<string, Function>} [props.apps] - Lazy-loaded app modules
 * @param {Record<string, Function>} [props.actions] - Global action handlers
 * @param {Console} [props.console] - Logger instance
 * @param {boolean} [props.devMode=true] - Enable debug logging
 */
export function UIRoot({ db, components: overrideComponents, renderers: overrideRenderers, apps: overrideApps, actions: overrideActions, console: externalConsole, devMode, }: {
    db?: DB | undefined;
    components?: Map<string, React.Component<any, any, any>> | undefined;
    renderers?: Map<string, Function> | undefined;
    apps?: Map<string, Function> | undefined;
    actions?: Record<string, Function> | undefined;
    console?: Console | undefined;
    devMode?: boolean | undefined;
}): import("react/jsx-runtime").JSX.Element;
import DB from '@nan0web/db-browser';
import React from 'react';
import defaultComponents from './components/index.jsx';
import defaultRenderers from './renderers/index.jsx';
/**
 * Default registries for components, renderers, and apps.
 * @type {Map<string, () => Promise<any>>}
 */
declare const defaultAppsRegistry: Map<string, () => Promise<any>>;
export { defaultComponents as components, defaultRenderers as renderers, defaultAppsRegistry as apps };

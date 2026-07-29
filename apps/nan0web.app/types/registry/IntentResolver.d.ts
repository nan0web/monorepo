/**
 * @file IntentResolver — Resolves `nan0-sandbox` intents to sub-app flows.
 *
 * When the Renderer encounters a `<nan0-sandbox>` block, the IntentResolver:
 *   1. Looks up the app in AppRegistry
 *   2. Verifies the requested UI adapter is available
 *   3. Dynamically imports the adapter module via package.json#exports
 *   4. Delegates control via `yield*` to the sub-app's async generator
 *
 * Contract:
 *   intent = { src: 'auth.app', url: 'signup', ui: 'cli' }
 *   resolve(intent) → AsyncGenerator<OutputMessage>
 *
 * The sub-app's `./ui/{adapter}` export must provide either:
 *   - A default export that is an App instance with `run()` method
 *   - A default export that is a function returning an AsyncGenerator
 */
/**
 * @typedef {object} Intent
 * @property {string} src - App source identifier (e.g. 'auth.app', '@nan0web/auth.app')
 * @property {string} [url] - Target URL/action within the app (e.g. 'signup', 'login')
 * @property {string} [ui] - Preferred UI adapter (e.g. 'cli', 'api', 'chat', 'lit')
 */
export default class IntentResolver {
    /**
     * @param {import('../registry/AppRegistry.js').default} registry
     * @param {Map<string, object>} appDbs - Map of app name → DB instance
     */
    constructor(registry: import("../registry/AppRegistry.js").default, appDbs: Map<string, object>);
    /**
     * Resolve an intent to a sub-app flow.
     *
     * @param {Intent} intent
     * @returns {AsyncGenerator<any>}
     */
    resolve(intent: Intent): AsyncGenerator<any>;
    /**
     * Check if an intent can be resolved.
     * @param {Intent} intent
     * @returns {boolean}
     */
    canResolve(intent: Intent): boolean;
    #private;
}
export type Intent = {
    /**
     * - App source identifier (e.g. 'auth.app', '@nan0web/auth.app')
     */
    src: string;
    /**
     * - Target URL/action within the app (e.g. 'signup', 'login')
     */
    url?: string | undefined;
    /**
     * - Preferred UI adapter (e.g. 'cli', 'api', 'chat', 'lit')
     */
    ui?: string | undefined;
};

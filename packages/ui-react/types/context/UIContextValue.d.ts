export default UIContextValue;
export type SyncImport<T> = Function;
export type AsyncImport<T> = Function;
export type Loadable<T> = T | SyncImport<T> | AsyncImport<T>;
/**
 * @typedef {Function} SyncImport
 * @template T
 * @description () => T
 */
/**
 * @typedef {Function} AsyncImport
 * @template T
 * @description () => Promise<{ default: T } | T>
 */
/**
 * @typedef {T | SyncImport<T> | AsyncImport<T>} Loadable
 * @template T
 */
/**
 * Tiny context UI for all components.
 */
declare class UIContextValue {
    /**
     * @param {any} input
     * @returns {UIContextValue}
     */
    static from(input: any): UIContextValue;
    /**
     * @param {Object} [input]
     * @param {typeof Theme} [input.theme]
     * @param {string} [input.lang]
     * @param {DB} [input.db]
     * @param {boolean} [input.reducedMotion]
     * @param {object} [input.data]
     * @param {Function} [input.setTheme]
     * @param {import('@nan0web/types').TFunction} [input.t]
     * @param {Function} [input.renderFn]
     * @param {Console} [input.console]
     * @param {Map<string, Loadable<React.ComponentType>>} [input.components]
     * @param {Map<string, Loadable<Function>>} [input.renderers]
     * @param {Map<string, Loadable<typeof AppCore>>} [input.apps]
     * @param {Record<string, Function>} [input.actions] - UI actions
     * @param {any} [input.document] - The document object
     * @param {boolean} [input.debug] - Show debug logs
     */
    constructor(input?: {
        theme?: import("@nan0web/ui/types/theme/Theme").ThemeConfig | undefined;
        lang?: string | undefined;
        db?: DB | undefined;
        reducedMotion?: boolean | undefined;
        data?: object;
        setTheme?: Function | undefined;
        t?: import("@nan0web/types/types/utils/TFunction").TFunction | undefined;
        renderFn?: Function | undefined;
        console?: Console | undefined;
        components?: Map<string, Loadable<import("react").ComponentType<{}>>> | undefined;
        renderers?: Map<string, Function> | undefined;
        apps?: Map<string, Loadable<typeof AppCore>> | undefined;
        actions?: Record<string, Function> | undefined;
        document?: any;
        debug?: boolean | undefined;
    });
    theme: import("@nan0web/ui/types/theme/Theme").ThemeConfig;
    lang: string;
    db: DB;
    debug: boolean;
    document: any;
    reducedMotion: boolean;
    setTheme: (...args: any[]) => any;
    console: Console;
    t: any;
    renderFn: Function;
    components: Map<any, any>;
    renderers: Map<any, any>;
    apps: Map<any, any>;
    actions: Record<string, Function>;
    data: any;
    /**
     * Extend current context and returns new context value.
     * @param {Object} overrides
     * @returns {UIContextValue}
     */
    extend(overrides?: any): UIContextValue;
    #private;
}
import DB from '@nan0web/db-browser';
import AppCore from '@nan0web/core';

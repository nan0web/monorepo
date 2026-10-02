/**
 * FormatResolver - class responsible for resolving column formats,
 * supporting builtins, custom instances, and external imports via db/package specifiers.
 */
export class FormatResolver {
    /**
     * @param {object} [options]
     * @param {any} [options.db] Injected database instance
     * @param {Record<string, any>} [options.customFormats] Custom format registry
     */
    constructor(options?: {
        db?: any;
        customFormats?: Record<string, any> | undefined;
    });
    db: any;
    customFormats: Record<string, any>;
    /**
     * Resolves a format synchronously from builtins or custom registry.
     * @param {string | Function | object} type
     * @param {any} [options]
     * @returns {import('./Format.js').Format}
     */
    resolveSync(type: string | Function | object, options?: any): import("./Format.js").Format;
    /**
     * Resolves a format asynchronously, supporting dynamic external module imports or db schemas.
     * @param {string | Function | object} type
     * @param {any} [options]
     * @returns {Promise<import('./Format.js').Format>}
     */
    resolve(type: string | Function | object, options?: any): Promise<import("./Format.js").Format>;
}
export const defaultResolver: FormatResolver;

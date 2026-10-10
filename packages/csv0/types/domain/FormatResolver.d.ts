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
        customFormats?: Record<string, any>;
    });
    db: any;
    customFormats: Record<string, any>;
    /**
     * Resolves a model class and returns its schema or column definition map.
     * @param {string | Function} modelRef
     * @returns {Record<string, any> | null}
     */
    resolveModelSchema(modelRef: string | Function): Record<string, any> | null;
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

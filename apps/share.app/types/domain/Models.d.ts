/**
 * @param {Partial<SocialAdapterConfig>} raw
 * @returns {SocialAdapterConfig}
 */
export function createConfig(raw?: Partial<SocialAdapterConfig>): SocialAdapterConfig;
/**
 * @param {Partial<SocialAdapterLimits>} [overrides]
 * @returns {SocialAdapterLimits}
 */
export function createLimits(overrides?: Partial<SocialAdapterLimits>): SocialAdapterLimits;
/**
 * @typedef {Object} SocialAdapterContentOptions
 * @property {string} [parseMode]
 * @property {boolean} [disableNotification]
 * @property {boolean} [disablePreview]
 * @property {string} [threadId]
 */
/**
 * @param {Partial<SocialAdapterContent>} raw
 * @returns {SocialAdapterContent}
 */
export function createContent(raw?: Partial<SocialAdapterContent>): SocialAdapterContent;
/**
 * @param {Partial<SocialAdapterFeedback>} raw
 * @returns {SocialAdapterFeedback}
 */
export function createFeedback(raw?: Partial<SocialAdapterFeedback>): SocialAdapterFeedback;
/**
 * @param {Partial<SocialAdapterTarget>} raw
 * @returns {SocialAdapterTarget}
 */
export function createTarget(raw?: Partial<SocialAdapterTarget>): SocialAdapterTarget;
/**
 * @param {Partial<ResultIntent>} raw
 * @returns {ResultIntent}
 */
export function createResultIntent(raw?: Partial<ResultIntent>): ResultIntent;
/**
 * Typed models for the @nan0web/share.app Sovereign Social Distribution Protocol.
 * Every model is a real class: validates input, serializable, introspectable for auto-docs.
 */
/**
 * Base class for all share.app models.
 * Provides serialization and instantiation from inputs.
 */
export class Model {
    /**
     * Instantiates a model from raw data, parsing strings as JSON.
     * @param {any} data
     * @returns {any}
     */
    static from(data: any): any;
    /**
     * Returns auto-documentation for all declared static field definitions.
     * Walks up the prototype chain to include inherited fields.
     * @returns {Array<{ field: string, help: string, default: any }>}
     */
    static describe(): Array<{
        field: string;
        help: string;
        default: any;
    }>;
    /**
     * @param {any} [data]
     * @param {any} [options]
     */
    constructor(data?: any, options?: any);
    /**
     * Returns a plain object representation for serialization.
     * @returns {Record<string, any>}
     */
    toJSON(): Record<string, any>;
}
export class SocialAdapterConfig extends Model {
    static id: {
        help: string;
        default: any;
    };
    static account: {
        help: string;
        default: any;
    };
    static credentials: {
        help: string;
        default: {};
    };
    constructor(raw?: {});
    /** @type {string|undefined} */
    id: string | undefined;
    /** @type {string|undefined} */
    account: string | undefined;
    /** @type {Record<string, string>} */
    credentials: Record<string, string>;
}
export class SocialAdapterLimits extends Model {
    static maxLength: {
        help: string;
        default: number;
    };
    constructor(raw?: {});
    /** @type {number} */
    maxLength: number;
}
/**
 * Capabilities are a flat string array describing what a platform supports.
 * Standard tokens: 'media', 'delete', 'reply', 'threads', 'photo', 'video', 'document', 'audio'
 * @typedef {string[]} SocialAdapterCapabilities
 */
export class SocialAdapterContent extends Model {
    static text: {
        help: string;
        default: any;
    };
    static photo: {
        help: string;
        default: any;
    };
    static video: {
        help: string;
        default: any;
    };
    static document: {
        help: string;
        default: any;
    };
    static audio: {
        help: string;
        default: any;
    };
    static tags: {
        help: string;
        default: any[];
    };
    static type: {
        help: string;
        default: any;
    };
    static lang: {
        help: string;
        default: any;
    };
    static options: {
        help: string;
        default: {};
    };
    /**
     * Validates raw content before publishing.
     * Content must have at least text OR one media field.
     * @param {Partial<SocialAdapterContent>} raw
     * @returns {{ valid: boolean, errors: string[] }}
     */
    static validate(raw?: Partial<SocialAdapterContent>): {
        valid: boolean;
        errors: string[];
    };
    constructor(raw?: {});
    /** @type {string|undefined} */
    text: string | undefined;
    /** @type {string|undefined} */
    photo: string | undefined;
    /** @type {string|undefined} */
    video: string | undefined;
    /** @type {string|undefined} */
    document: string | undefined;
    /** @type {string|undefined} */
    audio: string | undefined;
    /** @type {string[]} */
    tags: string[];
    /** @type {string|undefined} */
    type: string | undefined;
    /** @type {string|undefined} */
    lang: string | undefined;
    /** @type {SocialAdapterContentOptions} */
    options: SocialAdapterContentOptions;
}
/**
 * Validation error thrown when content fails schema checks.
 */
export class SocialAdapterValidationError extends Error {
    /**
     * @param {string[]} errors
     */
    constructor(errors?: string[]);
    /** @type {string[]} */
    errors: string[];
}
export class SocialAdapterFeedback extends Model {
    static id: {
        help: string;
        default: string;
    };
    static author: {
        help: string;
        default: string;
    };
    static authorId: {
        help: string;
        default: any;
    };
    static authorAvatar: {
        help: string;
        default: any;
    };
    static text: {
        help: string;
        default: string;
    };
    static type: {
        help: string;
        default: string;
    };
    static createdAt: {
        help: string;
        default: () => Date;
    };
    static network: {
        help: string;
        default: string;
    };
    constructor(raw?: {});
    /** @type {string} */
    id: string;
    /** @type {string} */
    author: string;
    /** @type {string|undefined} */
    authorId: string | undefined;
    /** @type {string|undefined} */
    authorAvatar: string | undefined;
    /** @type {string} */
    text: string;
    /** @type {'comment'|'like'|'share'|'reaction'} */
    type: "comment" | "like" | "share" | "reaction";
    /** @type {Date|string} */
    createdAt: Date | string;
    /** @type {string} */
    network: string;
}
export class SocialAdapterTarget extends Model {
    static id: {
        help: string;
        default: string;
    };
    static network: {
        help: string;
        default: string;
    };
    static account: {
        help: string;
        default: any;
    };
    static postId: {
        help: string;
        default: any;
    };
    constructor(raw?: {});
    /** @type {string} */
    id: string;
    /** @type {string} */
    network: string;
    /** @type {string|undefined} */
    account: string | undefined;
    /** @type {string|undefined} */
    postId: string | undefined;
}
export class ResultIntent extends Model {
    static ok: {
        help: string;
        default: boolean;
    };
    static code: {
        help: string;
        default: number;
    };
    static errors: {
        help: string;
        default: any[];
    };
    constructor(raw?: {});
    /** @type {boolean} */
    ok: boolean;
    /** @type {number} */
    code: number;
    /** @type {string[]} */
    errors: string[];
}
export type SocialAdapterContentOptions = {
    parseMode?: string;
    disableNotification?: boolean;
    disablePreview?: boolean;
    threadId?: string;
};
/**
 * Capabilities are a flat string array describing what a platform supports.
 * Standard tokens: 'media', 'delete', 'reply', 'threads', 'photo', 'video', 'document', 'audio'
 */
export type SocialAdapterCapabilities = string[];

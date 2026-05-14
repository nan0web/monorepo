/**
 * @typedef {'jwt'|'session'|'apikey'} AuthStrategy
 */
/**
 * AuthPolicy — Model-as-Schema for access control policy.
 *
 * Defines how auth.app guards protected endpoints.
 * This model does NOT handle rendering — it only describes
 * the authorization rules that the API middleware enforces.
 *
 * Separation of concerns (#27-28):
 *   - AuthPolicy → returns 401/403 (knows nothing about UI)
 *   - UI Adapter → intercepts 401/403 and shows login/popup
 *
 * @see user-stories.md
 *
 * @property {boolean} enabled Whether auth enforcement is active
 * @property {string[]} protectedPaths URL patterns requiring authentication
 * @property {string[]} publicPaths URL patterns always accessible without auth
 * @property {string} loginRedirect Path to redirect on 401
 * @property {'jwt'|'session'|'apikey'} strategy Authentication strategy
 * @property {string} tokenHeader HTTP header name for token (default: Authorization)
 */
export class AuthPolicy extends Model {
    static UI: {
        title: string;
        description: string;
        icon: string;
    };
    static enabled: {
        help: string;
        type: string;
        default: boolean;
    };
    static protectedPaths: {
        help: string;
        type: string;
        default: string[];
    };
    static publicPaths: {
        help: string;
        type: string;
        default: string[];
    };
    static loginRedirect: {
        help: string;
        type: string;
        default: string;
    };
    static strategy: {
        help: string;
        type: string;
        /** @type {AuthStrategy[]} */
        options: AuthStrategy[];
        /** @type {AuthStrategy} */
        default: AuthStrategy;
    };
    static tokenHeader: {
        help: string;
        type: string;
        default: string;
        hidden: boolean;
    };
    /**
     * @param {Partial<AuthPolicy> | Record<string, any>} [data]
     * @param {object} [options]
     */
    constructor(data?: Partial<AuthPolicy> | Record<string, any>, options?: object);
    /** @type {boolean} Whether auth enforcement is active */ enabled: boolean;
    /** @type {string} Client-side redirect path on 401 (UI adapter responsibility) */ loginRedirect: string;
    /** @type {AuthStrategy} Authentication strategy to apply */ strategy: AuthStrategy;
    /** @type {string} HTTP header name for authentication token */ tokenHeader: string;
    /** @type {string[]} URL patterns requiring authentication (glob syntax) */ protectedPaths: string[];
    /** @type {string[]} URL patterns always accessible without auth (overrides protected) */ publicPaths: string[];
    /**
     * Check if a given URL path is protected by this policy.
     * Public paths override protected paths.
     *
     * @param {string} urlPath
     * @returns {boolean} true if path requires authentication
     */
    isProtected(urlPath: string): boolean;
    #private;
}
export type AuthStrategy = "jwt" | "session" | "apikey";
import { Model } from '@nan0web/types';

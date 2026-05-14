/**
 * @module AccessControl
 * @description Universal, pure access control resolver.
 *
 * Data-driven authorization based on plain-text rule files:
 *   .access — global rules (subject rights path)
 *   .group  — group membership (group user1 user2 ...)
 *
 * Three-level resolution: user-specific → group → global (*).
 * Zero I/O — accepts raw content strings, delegates file reading to consumers.
 *
 * @example
 * const ac = new AccessControl()
 * ac.load(
 *   '* r /public\nadmin rwd /admin',
 *   'admin sovr\nmembers sovr artem'
 * )
 * ac.check('sovr', '/admin', 'r')  // true
 * ac.check('artem', '/admin', 'r') // false
 * ac.check('guest', '/public', 'r') // true
 */
/**
 * @typedef {{ subject: string, access: string, target: string }} AccessRule
 */
/**
 * Pure access control resolver.
 * No I/O — accepts raw content strings via load().
 */
export default class AccessControl {
    static ANY: string;
    static READ: string;
    static WRITE: string;
    static DELETE: string;
    /**
     * Load rules and groups from raw content strings.
     * Call once before check/info/filterNav.
     *
     * @param {string} accessContent - raw .access file content
     * @param {string} groupContent  - raw .group file content
     */
    load(accessContent: string, groupContent: string): void;
    /**
     * Check if a user has access to a path at a given level.
     *
     * Resolution order:
     *   1. Group rules (user belongs to group → group has matching rule)
     *   2. Global rules (subject = *)
     *
     * @param {string} username - user identifier (e.g. email slug)
     * @param {string} path - URL path (e.g. "/admin")
     * @param {string} [level='r'] - 'r' | 'w' | 'd'
     * @returns {boolean}
     */
    check(username: string, path: string, level?: string): boolean;
    /**
     * Get access summary for a user: their effective rules and group memberships.
     *
     * @param {string} username
     * @returns {{ rules: AccessRule[], groups: string[] }}
     */
    info(username: string): {
        rules: AccessRule[];
        groups: string[];
    };
    /**
     * Filter navigation items to only those the user can access.
     *
     * Items with `guest: true` are shown only when username is null (not logged in).
     * All other items are filtered by access rules.
     *
     * @param {Array<{path: string, guest?: boolean}>} navItems
     * @param {string|null} username - null = guest (not logged in)
     * @returns {Array<{path: string, guest?: boolean}>}
     */
    filterNav(navItems: Array<{
        path: string;
        guest?: boolean;
    }>, username: string | null): Array<{
        path: string;
        guest?: boolean;
    }>;
    #private;
}
export type AccessRule = {
    subject: string;
    access: string;
    target: string;
};

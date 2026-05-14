/**
 * Class representing a user's group membership with role and permissions.
 *
 * @extends User
 */
export default class Membership extends User {
    /**
     * Create a Membership instance from raw data.
     *
     * @param {object|Membership} input - Membership data or existing instance.
     * @returns {Membership}
     */
    static from(input: object | Membership): Membership;
    /**
     * Create a Membership instance.
     *
     * @param {object} [input={}] - Initialization data.
     */
    constructor(input?: object);
    /**
     * Map of membership keys to role, permissions, and configuration.
     *
     * @type {Map<string, { role: Role, perms: Set<'r'|'w'|'d'|'*'>, config: Object }>}
     */
    memberships: Map<string, {
        role: Role;
        perms: Set<"r" | "w" | "d" | "*">;
        config: any;
    }>;
    /**
     * Check if the user has a specific permission within a membership.
     *
     * Admin role bypasses all permission checks.
     *
     * @param {string} key - Membership identifier.
     * @param {'r'|'w'|'d'|'*'} perm - Permission to verify.
     * @returns {boolean}
     */
    can(key: string, perm: "r" | "w" | "d" | "*"): boolean;
    /**
     * Add or join a membership group.
     *
     * @param {string} key - Membership identifier.
     * @param {string} [roleValue='user'] - Role name or value for the membership.
     * @param {Set<'r'|'w'|'d'|'*'>} [perms=new Set(['r'])] - Set of permissions.
     * @param {Object} [config={}] - Additional configuration for the membership.
     */
    join(key: string, roleValue?: string, perms?: Set<"r" | "w" | "d" | "*">, config?: any): void;
    /**
     * Mint daily coins for a membership based on its configuration.
     *
     * @param {string} key - Membership identifier.
     */
    mintDailyCoins(key: string): void;
}
import User from './User.js';
import Role from './Role.js';

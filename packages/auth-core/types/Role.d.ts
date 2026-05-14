export default Role;
/**
 * Class representing a user role.
 *
 * @class
 */
declare class Role {
    /**
     * Predefined role identifiers.
     *
     * @type {{ admin: string, author: string, moderator: string, user: string }}
     */
    static ROLES: {
        admin: string;
        author: string;
        moderator: string;
        user: string;
    };
    /**
     * Create a Role instance from a string or existing Role.
     *
     * @param {string|object} input - Role name, value, or an existing Role.
     * @returns {Role}
     */
    static from(input: string | object): Role;
    /**
     * Create a Role instance.
     *
     * @param {object} input - Role initialization data.
     * @param {string} input.value - Role value or name.
     */
    constructor(input: {
        value: string;
    });
    /** @type {string} */
    value: string;
    /**
     * Getter for static ROLES, allowing subclass overrides.
     *
     * @returns {{ admin: string, author: string, moderator: string, user: string }}
     */
    get ROLES(): {
        admin: string;
        author: string;
        moderator: string;
        user: string;
    };
    /**
     * Validate that predefined role values are unique and contain no commas.
     *
     * @throws {TypeError} If any role value includes a comma or duplicates exist.
     */
    validateRoles(): void;
    /**
     * Return the raw role value as a string.
     * @param {object} [input]
     * @param {boolean} [input.detailed=false]
     * @returns {string}
     */
    toString(input?: {
        detailed?: boolean | undefined;
    }): string;
}

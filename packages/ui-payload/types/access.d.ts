/**
 * Access control helpers for Payload CMS collections.
 */
/**
 * Creates a Payload access control function checking user presence and optional role(s).
 *
 * @example
 * // Requires any authenticated user
 * create: accessFor()
 *
 * // Requires specific role(s)
 * update: accessFor('admin', 'editor')
 * // or
 * delete: accessFor(['admin'])
 *
 * @param {...(string | string[])} roles - Allowed role(s). If none specified, checks for any authenticated user.
 * @returns {import('payload').Access} Payload Access control function
 */
export function accessFor(...roles: (string | string[])[]): import("payload").Access;
/**
 * Shortcut alias for public read access.
 * @type {() => boolean}
 */
export const publicAccess: () => boolean;

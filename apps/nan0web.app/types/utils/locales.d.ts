/**
 * Detects available structured locales from the DB by scanning the root directory for ISO format folders.
 *
 * @param {import('@nan0web/db').default} db
 * @returns {Promise<Record<string, any>>} detected locales object map
 */
export function detectLocales(db: import("@nan0web/db").default): Promise<Record<string, any>>;
/**
 * Built-in locale registry.
 * Provides metadata for supported languages.
 * @type {Record<string, { id: string, title: string, dir: 'ltr' | 'rtl' }>}
 */
export const LOCALE_REGISTRY: Record<string, {
    id: string;
    title: string;
    dir: "ltr" | "rtl";
}>;

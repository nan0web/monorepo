/**
 * @typedef {{ atoms?: object, molecules?: object, organisms?: object }} UserThemeConfig
 */
/**
 * Returns selected or custom user theme.
 * @param {string | UserThemeConfig} themeNameOrConfig
 * @returns {import('./Theme.js').ThemeConfig}
 */
export function getUserTheme(themeNameOrConfig: string | UserThemeConfig): import("./Theme.js").ThemeConfig;
/**
 * Custom user theme.
 * Extends the base Theme to allow passing configuration during instantiation.
 * @param {UserThemeConfig} config
 * @returns {import('./Theme.js').ThemeConfig}
 */
export default function CustomTheme(config: UserThemeConfig): import("./Theme.js").ThemeConfig;
export type UserThemeConfig = {
    atoms?: object;
    molecules?: object;
    organisms?: object;
};

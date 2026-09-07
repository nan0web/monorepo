declare const _default: {
    fontFamily: string;
    atoms: Partial<typeof import("./atoms/index.js")>;
    molecules: typeof import("./molecules/index.js");
    organisms: typeof import("./organisms/index.js");
};
export default _default;
/**
 * Base application theme.
 * Should be extended by app-specific themes.
 */
export type AppThemeConfig = import("./Theme.js").ThemeConfig & {
    fontFamily?: string;
};

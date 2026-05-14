declare const _default: {
    atoms: typeof atoms;
    molecules: typeof molecules;
    organisms: typeof organisms;
};
export default _default;
/**
 * Universal UI theme foundation.
 * Holds atoms, molecules, and organisms styling configs.
 */
export type ThemeConfig = {
    atoms: Partial<typeof atoms>;
    molecules: typeof molecules;
    organisms: typeof organisms;
};
import * as atoms from './atoms/index.js';
import * as molecules from './molecules/index.js';
import * as organisms from './organisms/index.js';

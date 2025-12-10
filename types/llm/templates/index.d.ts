/**
 * The proven docs template for README.md.js coding.
 *
 * Patterns used in the template:
 *
 * `$pkgDir` - Package directory name (basename), for instance "ui-cli", must be
 *             replaced for proper usage.
 * @returns {string}
 */
export function getProvenDocs(): string;
/**
 * The docs translation template for README.md to translate into docs/{code}/README.md.
 *
 * Patterns used in the template:
 *
 * `$pkgDir` - Package directory name (basename), for instance "ui-cli", must be
 *             replaced for proper usage.
 * @returns {string}
 */
export function getTranslateDocs(): string;
/**
 * The playground template for play/main.js coding.
 *
 * Patterns used in the template:
 *
 * `$pkgDir` - Package directory name (basename), for instance "ui-cli", must be
 *             replaced for proper usage.
 * @returns {string}
 */
export function getPlayground(): string;
/**
 * The system instructions template for system.md.
 *
 * Patterns used in the template:
 *
 * `$pkgName` - Package name, for instance "@nan0web/ui-cli", must be
 *             replaced for proper usage.
 * @returns {string}
 */
export function getSystem(): string;

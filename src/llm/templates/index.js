import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * The proven docs template for README.md.js coding.
 *
 * Patterns used in the template:
 *
 * `$pkgDir` - Package directory name (basename), for instance "ui-cli", must be
 *             replaced for proper usage.
 * @returns {string}
 */
export function getProvenDocs() {
	return readFileSync(resolve(__dirname, "provendocs.md"), { encoding: "utf-8" }) || ""
}

/**
 * The docs translation template for README.md to translate into docs/{code}/README.md.
 *
 * Patterns used in the template:
 *
 * `$pkgDir` - Package directory name (basename), for instance "ui-cli", must be
 *             replaced for proper usage.
 * @returns {string}
 */
export function getTranslateDocs() {
	return readFileSync(resolve(__dirname, "translate-readme.md"), { encoding: "utf-8" }) || ""
}

/**
 * The playground template for play/main.js coding.
 *
 * Patterns used in the template:
 *
 * `$pkgDir` - Package directory name (basename), for instance "ui-cli", must be
 *             replaced for proper usage.
 * @returns {string}
 */
export function getPlayground() {
	return readFileSync(resolve(__dirname, "playground.md"), { encoding: "utf-8" }) || ""
}

/**
 * The system instructions template for system.md.
 *
 * Patterns used in the template:
 *
 * `$pkgName` - Package name, for instance "@nan0web/ui-cli", must be
 *             replaced for proper usage.
 * @returns {string}
 */
export function getSystem() {
	return readFileSync(resolve(__dirname, "system.md"), { encoding: "utf-8" }) || ""
}


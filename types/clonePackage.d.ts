/**
 * Clone a single package via sparse checkout.
 *
 * In test mode (`MOCK_CLONE=true`) the function does **not** invoke `git`.
 * It creates a minimal temporary package directory containing a `package.json`
 * with a `test:all` script (added if missing) and returns its root path.
 *
 * @param {string} repoUrl – ignored when mock mode is active.
 * @param {string} pkg
 * @param {(data: string, error?: boolean) => void} [onChunk]
 * @returns {Promise<string>} absolute path to the package root inside the temp dir
 */
export function clonePackage(repoUrl: string, pkg: string, onChunk?: ((data: string, error?: boolean) => void) | undefined): Promise<string>;

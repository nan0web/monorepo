/**
 * Runs `pnpm install` inside the given directory.
 *
 * The mock mode (`MOCK_RUN_COMMAND=true`) makes this a no‑op.
 *
 * @param {string} cwd
 */
export function installDependencies(cwd: string): Promise<void>;

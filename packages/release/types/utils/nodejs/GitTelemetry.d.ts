/**
 * Reset internal Git caches (useful for testing or cache invalidation)
 */
export function resetGitCache(): void;
/**
 * Retrieve git branch and workspace status (clean / dirty)
 * @param {string} [projectDir]
 * @returns {{ branch: string, gitStatus: 'clean' | 'dirty' }}
 */
export function getGitInfo(projectDir?: string): {
    branch: string;
    gitStatus: "clean" | "dirty";
};
/**
 * Retrieve development hours and iterations from git commit log
 * @param {string} [projectDir]
 * @param {string} [releasePath]
 * @returns {{ hours: number, iterations: number }}
 */
export function getGitCommitTelemetry(projectDir?: string, releasePath?: string): {
    hours: number;
    iterations: number;
};

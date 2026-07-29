/**
 * @param {{ command: string, timeout?: number }} opts
 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
 */
export function bash(opts: {
    command: string;
    timeout?: number;
}): Promise<{
    code: number;
    stdout: string;
    stderr: string;
}>;

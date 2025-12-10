/**
 * Runs `pnpm audit fix` and returns the raw result.
 *
 * In mock mode (`MOCK_RUN_COMMAND=true`) this returns a successful stub.
 *
 * @returns {Promise<{code:number, output:string}>}
 */
export function autoFixAudit(): Promise<{
    code: number;
    output: string;
}>;

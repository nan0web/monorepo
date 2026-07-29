export function createLogger(): any;
/**
 * @param {DBFS} input
 * @param {DBFS} output
 * @param {import('vite').Logger} [logger]
 * @returns {Promise<{total: number, processed: number, ignored: number, updatedURIs: string[]}>}
 */
export function buildSite(input: DBFS, output: DBFS, logger?: any): Promise<{
    total: number;
    processed: number;
    ignored: number;
    updatedURIs: string[];
}>;
/**
 *
 * @param {Object} input
 * @param {DBFS} input.input
 * @param {DBFS} input.output
 * @param {import('vite').Logger} [input.logger]
 * @returns {object}
 */
export default function nan0webVitePlugin({ input, output, logger }: {
    input: DBFS;
    output: DBFS;
    logger?: any;
}): object;
import DBFS from '@nan0web/db-fs';

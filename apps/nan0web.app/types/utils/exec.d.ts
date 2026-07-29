/**
 * Standard OLMUI-compatible spawn wrapper.
 * Returns a promise that resolves to the exit code.
 *
 * @param {string} cmd
 * @param {string[]} args
 * @param {Object} [options={}]
 * @returns {Promise<number>}
 */
export function spawn(cmd: string, args?: string[], options?: any): Promise<number>;
export default spawn;

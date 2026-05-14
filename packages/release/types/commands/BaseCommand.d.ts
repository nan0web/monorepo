/** @typedef {import("@nan0web/test/types/exec/runSpawn").SpawnResult} SpawnResult */
/**
 * @extends {Command}
 */
export default class BaseCommand {
	/**
	 * @param {string} cmd
	 * @param {string[]} args
	 * @param {string} errorMsg
	 * @param {FS} fs
	 * @param {number[]} [okCodes=[0]]
	 * @returns {Promise<SpawnResult>}
	 */
	_run(
		cmd: string,
		args: string[],
		errorMsg: string,
		fs: FS,
		okCodes?: number[] | undefined,
	): Promise<SpawnResult>
}
export type SpawnResult = import('@nan0web/test/types/exec/runSpawn').SpawnResult
import FS from '@nan0web/db-fs'

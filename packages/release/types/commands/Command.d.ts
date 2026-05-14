/** @typedef {import("@nan0web/test/types/exec/runSpawn").SpawnResult} SpawnResult */
export default class Command extends UiMessage {
    /**
     * @param {Partial<UiMessage> & {  }} [input={}]
     */
    constructor(input?: Partial<UiMessage> & {});
    /** @type {DBFS} */
    fs: DBFS;
    /** @type {Logger} */
    logger: Logger;
    get Body(): new () => {};
    /**
     * Run the command.
     * @param {string} cmd
     * @param {string[]} [args=[]]
     * @param {string} [fail=""]
     * @returns {Promise<SpawnResult>}
     * @throws {Error}
     */
    _run(cmd: string, args?: string[], fail?: string): Promise<SpawnResult>;
    /** @returns {AsyncGenerator<OutputMessage>} */
    run(): AsyncGenerator<OutputMessage>;
}
export type SpawnResult = import("@nan0web/test/types/exec/runSpawn").SpawnResult;
import { UiMessage } from '@nan0web/ui';
import DBFS from '@nan0web/db-fs';
import Logger from '@nan0web/log';
import { OutputMessage } from '@nan0web/co';

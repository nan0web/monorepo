/** @typedef {import("@nan0web/test/types/exec/runSpawn").SpawnResult} SpawnResult */
export class CommandBody {
    static fs: {};
    static logger: {};
}
export default class Command extends UiMessage {
    static Body: typeof CommandBody;
    /**
     * @param {Partial<UiMessage> & {  }} [input={}]
     */
    constructor(input?: Partial<UiMessage> & {});
    /** @type {DBFS} */
    fs: DBFS;
    /** @type {Logger} */
    logger: Logger;
    get Body(): typeof CommandBody;
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

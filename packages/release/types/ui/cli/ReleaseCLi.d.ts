export default function createReleaseCLI(argv?: string[], logger?: Logger, fs?: {}): ReleaseCLi;
import Logger from '@nan0web/log';
declare class ReleaseCLi extends CLI {
    constructor(input: any);
    /** @type {DBFS} */
    fs: DBFS;
}
import { CLI } from '@nan0web/ui-cli';
import DBFS from '@nan0web/db-fs';
export {};

import DBFSBase from './DBFS.js';
export declare class DBFS extends DBFSBase {
    disconnect(): Promise<void>;
}
export default class TestDir {
    root: any;
    constructor(root: any);
    erase(): void;
    join(dir: any): string;
}

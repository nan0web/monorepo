export class DBwithFSDriver extends DB {
    static Driver: typeof FSDriver;
}
export default DBFS;
import DBFS from './DBFS.js';
import { DocumentEntry } from '@nan0web/db';
import { DocumentStat } from '@nan0web/db';
import FSDriver from './FSDriver.js';
import DB from '@nan0web/db';
export { DBFS, DocumentEntry, DocumentStat, FSDriver };
export { DBFSBase, DBFSPath, DBFSDoc, DBFSDir, DBFSStream } from "./DBFS/index.js";
export { load, save, loadCSV, saveCSV, loadJSON, saveJSON, loadTXT, saveTXT, loadNAN, saveNAN } from "./file-system/index.js";

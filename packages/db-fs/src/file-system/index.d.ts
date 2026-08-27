import { loadJSON, saveJSON, loadJSONAsync, saveJSONAsync } from './json.js';
import { loadCSV, saveCSV, loadCSVAsync, saveCSVAsync } from './csv.js';
import { loadTXT, saveTXT, loadTXTAsync, saveTXTAsync } from './txt.js';
import { loadYAML, saveYAML, loadYAMLAsync, saveYAMLAsync } from './yaml.js';
import { loadMD, saveMD, loadMDAsync, saveMDAsync } from './md.js';
import { loadNAN, saveNAN, loadNANAsync, saveNANAsync } from './nan.js';
/**
 * Loads file content based on extension.
 */
declare function load(file: any, opts?: {}): any;
/**
 * Loads file content asynchronously based on extension.
 */
declare function loadAsync(file: any, opts?: {}): Promise<any>;
/**
 * Saves data to file based on extension.
 */
declare function save(file: any, data: any, ...args: any[]): any;
/**
 * Saves data asynchronously to file based on extension.
 */
declare function saveAsync(file: any, data: any, ...args: any[]): Promise<any>;
export { save, load, saveAsync, loadAsync, saveCSV, loadCSV, loadCSVAsync, saveCSVAsync, saveJSON, loadJSON, loadJSONAsync, saveJSONAsync, saveTXT, loadTXT, loadTXTAsync, saveTXTAsync, saveYAML, loadYAML, loadYAMLAsync, saveYAMLAsync, loadMD, saveMD, loadMDAsync, saveMDAsync, loadNAN, saveNAN, loadNANAsync, saveNANAsync, };

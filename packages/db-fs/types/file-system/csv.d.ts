/**
 * Loads and parses CSV file into array of objects.
 */
export function loadCSV(filePath: any, delimiter?: string, quote?: string, softError?: boolean): Record<string, any>[];
/**
 * Saves data as CSV file.
 */
export function saveCSV(filePath: any, data: any, delimiter?: string, quote?: string, eol?: string): string;
import { parseCSV } from '@nan0web/csv0';
/**
 * Loads and parses CSV file asynchronously.
 */
export function loadCSVAsync(filePath: any, delimiter?: string, quote?: string, softError?: boolean): Promise<Record<string, any>[]>;
/**
 * Saves data as CSV file asynchronously.
 */
export function saveCSVAsync(filePath: any, data: any, delimiter?: string, quote?: string, eol?: string): Promise<string>;
export function parseToObjects(content: any, delimiter?: string, quote?: string): Record<string, any>[];
import { stringifyCSV } from '@nan0web/csv0';
export { parseCSV, stringifyCSV };

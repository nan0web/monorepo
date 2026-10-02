/**
 * Resolves a format instance by name or package specifier.
 * @param {string | Function | object} type
 * @param {any} [options]
 * @returns {import('../Format.js').Format}
 */
export function resolveFormat(type: string | Function | object, options?: any): import("../Format.js").Format;
export namespace BuiltinFormats {
    export { BooleanFormat as boolean };
    export { StringFormat as string };
    export { NumberFormat as number };
}
import { BooleanFormat } from './BooleanFormat.js';
import { StringFormat } from './StringFormat.js';
import { NumberFormat } from './NumberFormat.js';
import { FormatResolver } from '../FormatResolver.js';
import { defaultResolver } from '../FormatResolver.js';
export { FormatResolver, defaultResolver };

import { i18n } from './i18n.js';
import I18nDb from './I18nDb.js';
export type TFunction = import('@nan0web/types').TFunction;
/** @typedef {import('@nan0web/types').TFunction} TFunction */
export { I18nDb };
export { defaultVocab } from './i18n.js';
/** Marker for i18n extraction. Returns the key as-is. */
export declare const t: (/** @type {string} */ key: string) => string;
export { createT } from '@nan0web/types';
export { extract, extractFromModels, extractInfo, EXTRACT_FIELDS } from './extract.js';
export { Language } from './domain/Language.js';
export { I18nAtom } from './I18nAtom.js';
export { i18n };
export default i18n;

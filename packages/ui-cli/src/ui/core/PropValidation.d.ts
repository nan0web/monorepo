/**
 * Prop validation utilities for UI components.
 * @module core/PropValidation
 */
/**
 * Validates that a value is a valid Date object or a parseable date string.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @throws {TypeError} if validation fails
 */
export declare function validateDate(value: any, propName: string, componentName: string): void;
/**
 * Validates that a value is a string.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export declare function validateString(value: any, propName: string, componentName: string, required?: boolean): void;
/**
 * Validates that a value is a function.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export declare function validateFunction(value: any, propName: string, componentName: string, required?: boolean): void;
/**
 * Validates that a value is a boolean.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export declare function validateBoolean(value: any, propName: string, componentName: string, required?: boolean): void;
/**
 * Validates that a value is a number.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export declare function validateNumber(value: any, propName: string, componentName: string, required?: boolean): void;

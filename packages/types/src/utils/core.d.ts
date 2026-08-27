/**
 * Checks if a value is strictly one of the provided arguments.
 * @param {...any} args - Accepted values.
 * @returns {(value: any) => any|undefined}
 */
export declare function oneOf(...args: any[]): (value: any) => any | undefined;
/**
 * Applies a function if the value is not undefined.
 * @param {(value: any) => any} Fn - Function to apply.
 * @returns {(value: any) => any|undefined}
 */
export declare function undefinedOr(Fn: (value: any) => any): (value: any) => any | undefined;
/**
 * Applies a function if the value is not undefined, returns null otherwise.
 * @param {(value: any) => any} Fn - Function to apply.
 * @returns {(value: any) => any|null}
 */
export declare function nullOr(Fn: (value: any) => any): (value: any) => any | null;
/**
 * Applies a function (or .from) to all elements of the array.
 * @param {Function|{from: Function}} Fn - Function to apply or object with .from.
 * @returns {(value: any[]) => any[]}
 */
export declare function arrayOf(Fn: Function | {
    from: Function;
}): (value: any[]) => any[];
/**
 * Checks if value is of the given type.
 * Handles primitives like String, Number, Boolean.
 * @param {Function} Fn - Type constructor.
 * @returns {(value: any) => boolean}
 */
export declare function typeOf(Fn: Function): (value: any) => boolean;
/**
 * Attempts to return the constructor for a given value.
 * @param {any} value - Input value.
 * @returns {Function|undefined}
 */
export declare function functionOf(value: any): Function | undefined;
/**
 * Checks if value is empty.
 * Considers undefined, null, empty string, empty array, and empty object as empty.
 * @param {...any} values - Values to check for emptiness.
 * @returns {boolean}
 */
export declare function empty(...values: any[]): boolean;
/**
 * Checks if value is not empty.
 * @param {any} value - Value to check.
 * @returns {boolean}
 */
export declare function notEmpty(value: any): boolean;
/**
 * Returns the first value that is not empty after applying Fn to it.
 * @param {(value: any) => any} Fn - Function to apply.
 * @returns {(...args: any[]) => any|undefined}
 */
export declare function firstOf(Fn: (value: any) => any): (...args: any[]) => any | undefined;
/**
 * Compares pairs of arguments for strict equality.
 * Throws TypeError for mismatched argument count.
 * @param {...any} args - Arguments to compare in pairs.
 * @returns {boolean}
 * @throws {TypeError} If arguments are not paired correctly.
 */
export declare function equal(...args: any[]): boolean;
/**
 * Converts a value to the given type.
 * Nested for objects, arrays, maps, sets, etc.
 * @param {Function|Object} type - Type constructor or instance.
 * @returns {(value: any) => any}
 */
export declare function to(type: Function | any): (value: any) => any;
/**
 * Checks if any of the arguments match the test.
 * @param {string|RegExp} test
 * @param {Object} [options={}]
 * @param {boolean} [options.caseInsensitive=false]
 * @param {string} [options.stringFn=""]
 * @param {"some"|"every"} [options.method="some"]
 * @returns {(...args: string[]) => boolean}
 */
export declare function match(test: string | RegExp, options?: {
    caseInsensitive?: boolean;
    stringFn?: string;
    method?: "some" | "every";
}): (...args: string[]) => boolean;
/**
 * Validator for enumeration values.
 * Ensures that a value is one of the allowed values or passes custom validation functions.
 *
 * @param {...(string|number|boolean|Function)} args - Allowed values or validation functions.
 * @returns {(value: any) => any}
 */
export declare function Enum(...args: (string | number | boolean | Function)[]): (value: any) => any;
/**
 * Determine whether a function can be used as a constructor.
 * @param {Function} fn - Function to test.
 * @returns {boolean} True if callable with `new`, false otherwise.
 */
export declare function isConstructible(fn: Function): boolean;

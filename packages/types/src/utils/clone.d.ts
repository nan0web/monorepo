export default clone;
/**
 * Creates a deep clone of an object, array, or complex structure,
 * handling circular references and custom classes.
 *
 * @param {any} obj - The object, array, or structure to clone.
 * @param {WeakMap} [seen=new WeakMap()] - Tracks already cloned objects
 *        to handle circular references.
 * @returns {any} - The deep clone of the input object or structure.
 */
declare function clone(obj: any, seen?: WeakMap<any, any>): any;

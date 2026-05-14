export default Process;
/**
 * Renders a progress bar based on input configuration.
 * @this {View}
 * @param {ProcessInput|object} props - Process component properties
 * @returns {string[][]} Rendered progress bar as array of strings
 */
declare function Process(this: View, props?: ProcessInput | object): string[][];
declare namespace Process {
    export { ProcessInput as Input };
}
import ProcessInput from './Input.js';
import View from '../../View/View.js';

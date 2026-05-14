export default Welcome;
/**
 * Renders a welcome message for a user.
 * @param {WelcomeInput|object} props - Welcome component properties
 * @returns {string[][]} Rendered welcome message as array of strings
 * @throws {Error} If no user data is provided
 */
declare function Welcome(props?: WelcomeInput | object): string[][];
declare namespace Welcome {
    export { WelcomeInput as Input };
    export function ask(): Promise<string>;
}
import WelcomeInput from './Input.js';

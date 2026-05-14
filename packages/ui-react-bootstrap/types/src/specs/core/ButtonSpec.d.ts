/**
 * @class ButtonSpec
 * @extends Spec
 * @property {'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'} variant - Button color variant @default 'primary'
 * @property {'sm' | 'md' | 'lg'} size - Button size @default 'md'
 * @property {boolean} outline - Outline style @default false
 * @property {boolean} disabled - Disable button @default false
 */
export default class ButtonSpec extends Spec {
    /**
     * @param {Object} input - Input object
     * @returns {ButtonSpec}
     */
    static from(input: any): ButtonSpec;
    variant: string;
    size: string;
    outline: boolean;
    disabled: boolean;
}
import Spec from './Spec.js';

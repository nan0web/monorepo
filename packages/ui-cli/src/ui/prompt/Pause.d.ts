import { PauseModel } from '../../domain/prompt/PauseModel.js';
export { PauseModel };
/**
 * Halts execution passively for a specified duration.
 *
 * @param {PauseModel|Object|number} props - Configuration or milliseconds.
 */
export declare function Pause(props: PauseModel | any | number): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};

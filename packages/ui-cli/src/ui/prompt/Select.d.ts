import { SelectModel } from '../../domain/prompt/SelectModel.js';
export { SelectModel };
/**
 * Single-choice prompt from a list of options.
 * @param {Object|string} props - Configuration or message.
 */
export declare function Select(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};

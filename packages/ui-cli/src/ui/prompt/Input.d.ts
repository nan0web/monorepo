import { InputModel } from '../../domain/prompt/InputModel.js';
export { InputModel };
/**
 * Basic text input prompt.
 * @param {Object|string} props - Configuration or message.
 */
export declare function Input(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};

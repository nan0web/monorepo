import { NextModel } from '../../domain/prompt/NextModel.js';
export { NextModel };
/**
 * Prompts the user to press a key to continue.
 *
 * @param {NextModel|Object|string} props - Props or direct message.
 */
export declare function Next(props: NextModel | any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};

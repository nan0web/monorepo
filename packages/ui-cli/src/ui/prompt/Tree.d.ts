import { TreeModel } from '../../domain/prompt/TreeModel.js';
export { TreeModel };
/**
 * Tree navigation/selection prompt.
 * @param {Object|string} props - Configuration or message.
 */
export declare function Tree(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};

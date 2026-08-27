import { AutocompleteModel } from '../../domain/prompt/AutocompleteModel.js';
export { AutocompleteModel };
/**
 * Searchable input with suggestions.
 * @param {Object|string} props - Configuration or message.
 */
export declare function Autocomplete(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};

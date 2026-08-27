import { ToggleModel } from '../../domain/prompt/ToggleModel.js';
export { ToggleModel };
/**
 * Basic boolean toggle switch.
 * @param {Object|string} props - Configuration or message.
 */
export declare function Toggle(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};

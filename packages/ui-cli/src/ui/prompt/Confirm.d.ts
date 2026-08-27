import { ConfirmModel } from '../../domain/prompt/ConfirmModel.js';
export { ConfirmModel };
/**
 * Boolean confirmation prompt (Yes/No).
 * @param {Object|string} props - Configuration or message.
 */
export declare function Confirm(props: any | string): {
    $$typeof: symbol;
    type: string;
    props: any;
    model: any;
    execute: () => any;
};

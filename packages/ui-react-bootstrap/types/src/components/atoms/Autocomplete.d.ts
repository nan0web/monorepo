/**
 * Bootstrap-themed Autocomplete component.
 */
declare function Autocomplete({ options, onSelect, placeholder, value: initialValue }: {
    options?: any[];
    onSelect: any;
    placeholder: any;
    value?: string;
}): import("react/jsx-runtime").JSX.Element;
declare namespace Autocomplete {
    namespace propTypes {
        let options: PropTypes.Requireable<NonNullable<any[] | ((...args: any[]) => any) | Map<unknown, unknown>>>;
        let onSelect: PropTypes.Requireable<(...args: any[]) => any>;
        let placeholder: PropTypes.Requireable<string>;
        let value: PropTypes.Requireable<string>;
    }
}
export default Autocomplete;
import PropTypes from 'prop-types';

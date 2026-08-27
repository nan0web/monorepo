/**
 * Autocomplete component - searchable selection list.
 *
 * @param {Object} props
 * @param {Array|Function} props.options - List of options or fetcher
 * @param {Function} [props.onSelect] - Selection handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - Current value
 */
declare function Autocomplete({ options, onSelect, placeholder, value: initialValue, }: {
    options: any[] | Function;
    onSelect?: Function | undefined;
    placeholder?: string | undefined;
    value?: string | undefined;
}): import("react/jsx-runtime").JSX.Element;
declare namespace Autocomplete {
    namespace propTypes {
        let options: PropTypes.Requireable<NonNullable<any[] | ((...args: any[]) => any) | Map<unknown, unknown> | null | undefined>>;
        let onSelect: PropTypes.Requireable<(...args: any[]) => any>;
        let placeholder: PropTypes.Requireable<string>;
        let value: PropTypes.Requireable<string>;
    }
}
export default Autocomplete;
import PropTypes from 'prop-types';

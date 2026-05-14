/**
 * Bootstrap-themed TreeView component.
 */
declare function TreeView({ data, onSelect, loader, mode }: {
    data?: any[];
    onSelect: any;
    loader: any;
    mode?: string;
}): import("react/jsx-runtime").JSX.Element;
declare namespace TreeView {
    namespace propTypes {
        let data: PropTypes.Requireable<any[]>;
        let onSelect: PropTypes.Requireable<(...args: any[]) => any>;
        let loader: PropTypes.Requireable<(...args: any[]) => any>;
        let mode: PropTypes.Requireable<string>;
    }
}
export default TreeView;
import PropTypes from 'prop-types';

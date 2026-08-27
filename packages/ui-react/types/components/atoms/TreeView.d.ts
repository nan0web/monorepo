/**
 * TreeView component - hierarchical data visualization.
 * Supports async loading, expansion, and selection.
 *
 * @param {Object} props
 * @param {Array} props.data - Tree nodes
 * @param {Function} [props.onSelect] - Selection handler
 * @param {Function} [props.loader] - Async children loader
 * @param {'file'|'dir'|'multi'} [props.mode='file'] - Selection mode
 */
declare function TreeView({ data, onSelect, loader, mode }: {
    data: any[];
    onSelect?: Function | undefined;
    loader?: Function | undefined;
    mode?: "file" | "dir" | "multi" | undefined;
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

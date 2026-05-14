export function Search({ show, inline, onClose, results, index, query: initialQuery, onSearch, t, ...props }: {
    [x: string]: any;
    show?: boolean;
    inline?: boolean;
    onClose: any;
    results?: any[];
    index?: any;
    query?: string;
    onSearch: any;
    t?: (k: any) => any;
}): import("react/jsx-runtime").JSX.Element;
export namespace Search {
    let inlineRenderer: boolean;
    let displayName: string;
}

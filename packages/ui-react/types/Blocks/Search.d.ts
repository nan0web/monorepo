export function Search({ show, inline, onClose, results, index, query: initialQuery, onSearch, t, ...props }: {
    [x: string]: any;
    show?: boolean | undefined;
    inline?: boolean | undefined;
    onClose: any;
    results?: never[] | undefined;
    index?: null | undefined;
    query?: string | undefined;
    onSearch: any;
    t?: ((k: any) => any) | undefined;
}): import("react/jsx-runtime").JSX.Element | null;
export namespace Search {
    let inlineRenderer: boolean;
    let displayName: string;
}

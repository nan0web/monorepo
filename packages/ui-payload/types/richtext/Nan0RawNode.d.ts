export function $createNan0RawNode({ source }: {
    source: any;
}): Nan0RawNode;
export function $isNan0RawNode(node: any): node is Nan0RawNode;
export class Nan0RawNode extends ElementNode {
    static clone(node: any): Nan0RawNode;
    static importJSON(serializedNode: any): Nan0RawNode;
    constructor({ source, key }: {
        source: any;
        key: any;
    });
    /** @type {{ tag: string, attributes: Record<string, any>, children: any[] }} */ __source: {
        tag: string;
        attributes: Record<string, any>;
        children: any[];
    };
    exportJSON(): {
        type: string;
        version: number;
        source: {
            tag: string;
            attributes: Record<string, any>;
            children: any[];
        };
        $?: Record<string, unknown> | undefined;
        children: import("lexical").SerializedLexicalNode[];
        direction: "ltr" | "rtl" | null;
        format: import("lexical").ElementFormatType;
        indent: number;
        textFormat?: number;
        textStyle?: string;
    };
    getSource(): {
        tag: string;
        attributes: Record<string, any>;
        children: any[];
    };
    createDOM(config: any): HTMLDivElement;
    updateDOM(): boolean;
}
import { ElementNode } from 'lexical';

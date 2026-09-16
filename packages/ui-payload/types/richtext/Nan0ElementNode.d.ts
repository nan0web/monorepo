export function $createNan0ElementNode({ tag, attributes }: {
    tag: any;
    attributes?: {} | undefined;
}): Nan0ElementNode;
export function $isNan0ElementNode(node: any): node is Nan0ElementNode;
export class Nan0ElementNode extends ElementNode {
    static clone(node: any): Nan0ElementNode;
    static importJSON(serializedNode: any): Nan0ElementNode;
    constructor({ tag, attributes, key }: {
        tag: any;
        attributes?: {} | undefined;
        key: any;
    });
    /** @type {string} */ __tag: string;
    /** @type {Record<string, any>} */ __attributes: Record<string, any>;
    exportJSON(): {
        type: string;
        version: number;
        tag: string;
        attributes: Record<string, any>;
        $?: Record<string, unknown> | undefined;
        children: import("lexical").SerializedLexicalNode[];
        direction: "ltr" | "rtl" | null;
        format: import("lexical").ElementFormatType;
        indent: number;
        textFormat?: number;
        textStyle?: string;
    };
    getTag(): string;
    getAttributes(): Record<string, any>;
    createDOM(config: any): HTMLElement;
    updateDOM(): boolean;
}
import { ElementNode } from 'lexical';

export function $createNan0ComponentNode({ component, props }: {
    component: any;
    props?: {} | undefined;
}): Nan0ComponentNode;
export function $isNan0ComponentNode(node: any): node is Nan0ComponentNode;
export class Nan0ComponentNode extends DecoratorNode<any> {
    static clone(node: any): Nan0ComponentNode;
    static importJSON(serializedNode: any): Nan0ComponentNode;
    constructor({ component, props, key }: {
        component: any;
        props?: {} | undefined;
        key: any;
    });
    /** @type {string} */ __component: string;
    /** @type {Record<string, any>} */ __props: Record<string, any>;
    exportJSON(): {
        type: string;
        version: number;
        component: string;
        props: Record<string, any>;
        $?: Record<string, unknown>;
    };
    getComponent(): string;
    getProps(): Record<string, any>;
    createDOM(): HTMLDivElement;
    updateDOM(): boolean;
    decorate(): null;
}
import { DecoratorNode } from 'lexical';

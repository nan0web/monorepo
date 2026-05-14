export type Renderer = import("react").ComponentType<{
    element?: any;
    context: any;
    [key: string]: any;
}>;

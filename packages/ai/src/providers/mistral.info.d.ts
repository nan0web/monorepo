declare function getModels(): {
    models: [string, {
        context_length: number;
        prompt: number;
        completion: number;
    }][];
};
declare function makeFlat(models?: any[]): any[];
declare const _default: {
    getModels: typeof getModels;
    makeFlat: typeof makeFlat;
};
export default _default;

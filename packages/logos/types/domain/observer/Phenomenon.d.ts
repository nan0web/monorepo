export default Phenomenon;
/**
 * Quantum Phenomenon
 * @description Pre-observed quantum state
 */
declare class Phenomenon {
    constructor(state: any);
    initialState: any;
    probabilities: Map<any, number>;
    entangledPhenomena: Set<any>;
    addState(state: any, probability: any): void;
    normalizeProbabilities(): void;
    entangleWith(otherPhenomenon: any): void;
    collapse(observer: any): any;
    uniqueHash(str: any): number;
}

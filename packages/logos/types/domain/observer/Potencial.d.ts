export default Potential;
/**
 * Quantum Potential
 * @description Possible quantum state
 */
declare class Potential {
    constructor(state: any);
    state: any;
    probability: number;
    entangledWith: any[];
    entangleWith(other: any): void;
}

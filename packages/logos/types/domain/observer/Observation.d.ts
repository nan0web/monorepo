export default Observation;
/**
 * Quantum Observation
 * @description Collapsed state from superposition
 */
declare class Observation {
    constructor(state: any, observer: any);
    state: any;
    observer: any;
    timestamp: number;
}

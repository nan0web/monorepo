export default Observer;
/**
 * Quantum Observer
 * @description Consciousness that collapses wave function
 */
declare class Observer {
    constructor(id: any, consciousnessLevel?: number);
    id: any;
    consciousnessLevel: number;
    entangledObservers: Set<any>;
    entangleWith(otherObserver: any): void;
    toString(): string;
}

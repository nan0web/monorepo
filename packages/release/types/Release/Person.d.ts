import { HumanName, HumanContact, HumanGender } from '@nan0web/logos';
export default class Person {
    /** @type {HumanName} */
    name: HumanName;
    /** @type {HumanGender} */
    gender: HumanGender;
    /** @type {HumanContact[]} */
    contacts: HumanContact[];
    constructor(input?: {});
    /**
     * @param {*} input
     * @returns {Person}
     */
    static from(input: any): Person;
}

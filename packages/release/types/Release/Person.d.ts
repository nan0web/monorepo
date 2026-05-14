export default class Person {
    /**
     * @param {*} input
     * @returns {Person}
     */
    static from(input: any): Person;
    constructor(input?: {});
    /** @type {HumanName} */
    name: HumanName;
    /** @type {HumanGender} */
    gender: HumanGender;
    /** @type {HumanContact[]} */
    contacts: HumanContact[];
}
import { HumanName } from '@nan0web/verse';
import { HumanGender } from '@nan0web/verse';
import { HumanContact } from '@nan0web/verse';

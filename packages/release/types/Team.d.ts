export default Company;
declare class Company {
    static name: string;
    static c: typeof CLevelTeam;
    static ux: typeof UXTeam;
}
declare class CLevelTeam {
    static name: string;
    static ceo: Person;
    static cfo: Person;
}
declare class UXTeam {
    static name: string;
    static designer: Person;
}
declare class Person {
    constructor(name: any);
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

/**
 * Domain Data Model for a Project Configuration
 * Implements Model-as-Schema (Project-as-Data)
 *
 * Ця модель є дзеркалом `project.schema.yaml` та джерелом правди
 * для автоматичних інструментів валідації та генерації ТЗ.
 *
 * Instance field defaults come from static metadata via resolveDefaults()
 * in the parent Model constructor. Do NOT use class field initializers here
 * as they execute AFTER super() and would overwrite resolved values.
 *
 * @example
 * import { ProjectModel } from '@nan0web/core'
 * const project = new ProjectModel({ description: 'My App', tags: ['ui'] })
 */
export class ProjectModel extends Model {
    static UI: {
        title: string;
    };
    static description: {
        help: string;
        type: string;
        default: string;
        positional: boolean;
    };
    static tags: {
        help: string;
        type: string;
        default: never[];
    };
    static locale: {
        help: string;
        type: string;
        options: string[];
        default: string;
        errorInvalid: string;
        validate: (val: any) => string | true;
    };
    static i18n: {
        help: string;
        type: string;
        options: string[];
        default: never[];
        errorInvalid: string;
        validate: (val: any) => string | true;
    };
    static status: {
        help: string;
        type: string;
        default: string;
        options: string[];
        errorInvalid: string;
        validate: (val: any) => string | true;
    };
    /**
     * @param {Partial<ProjectModel>} data Data from YAML or Markdown frontmatter
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<ProjectModel>, options?: object);
    tags: string[] | undefined;
}
import { Model } from './Model.js';

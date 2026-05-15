import { ModelAsApp } from '@nan0web/ui'

export class AuditorModel extends ModelAsApp {
    dir: string;
    help: boolean;
    platform: string;
    fix: boolean;
    _: {
        t: (key: string, data?: any) => string;
        db: any;
        adapter: any;
        parentPath: string;
        [key: string]: any;
    };
    init(): Promise<void>;
    fileExists(rel: string): Promise<boolean>;
    dirExists(rel: string): Promise<boolean>;
}

export class ArchitectureAuditor extends AuditorModel {
    constructor(data: any, options: any);
    run(): AsyncGenerator<any, any, any>;
}

export class CircularDependencyAuditor extends AuditorModel {
    constructor(data: any);
    run(): AsyncGenerator<any, any, any>;
}

export class NoTypeScriptAuditor extends AuditorModel {
    constructor(data: any);
    run(): AsyncGenerator<any, any, any>;
}

export class StructureAuditor extends AuditorModel {
    constructor(data: any);
    run(): AsyncGenerator<any, any, any>;
}

export class StackDetector {
    constructor(data: any);
    run(): AsyncGenerator<any, any, any>;
    static detectPlatform(db: any, dir: string): Promise<string>;
}

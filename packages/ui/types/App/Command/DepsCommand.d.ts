export class DepsCommand extends UiMessage {
    static Body: typeof DepsCommandBody;
    constructor(input?: {});
}
export default DepsCommand;
import UiMessage from '../../core/Message/Message.js';
declare class DepsCommandBody {
    static fix: {
        help: string;
        defaultValue: boolean;
    };
    constructor(input?: {});
    fix: boolean;
}

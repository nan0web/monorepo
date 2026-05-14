export default class WorkflowCommand extends Command {
    static name: string;
    run(): AsyncGenerator<Alert, void, unknown>;
}
import Command from "./Command.js";
import { Alert } from "../../cli/components/index.js";

/**
 * Crystallizes ephemeral chat messages into structured project documents or todo.md.
 */
export class CrystallizeModel extends ModelAsApp {
    static UI: {
        errorNoDb: string;
        errorMsgNotFound: string;
    };
    /**
     * Moves/projects a chat message into targetDocUri preserving authorship and $ref.
     * @param {{ msgUri: string, targetDocUri: string, kind?: 'todo' | 'note' }} input
     * @returns {Promise<{ author: string, $ref: string, targetDocUri: string, kind: string, text: string }>}
     */
    crystallize(input: {
        msgUri: string;
        targetDocUri: string;
        kind?: "todo" | "note";
    }): Promise<{
        author: string;
        $ref: string;
        targetDocUri: string;
        kind: string;
        text: string;
    }>;
}
import { ModelAsApp } from '@nan0web/ui';

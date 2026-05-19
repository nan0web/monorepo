/**
 * Performs Subconscious filter logic using simple Regex.
 * Faster but less accurate than the LLM flow.
 */
export class LanguageIntentRegexAgent {
    /**
     * @param {import('../domain/LanguageIntentModel.js').LanguageIntentModel} params
     */
    static execute(params: import("../domain/LanguageIntentModel.js").LanguageIntentModel): Promise<{
        score: number;
        errors: {
            chunk: string;
            intent: string;
            reason: string;
        }[];
    }>;
}

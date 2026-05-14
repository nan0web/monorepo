/**
 * Zero-Hallucination Parser 
 * Removes markdown tags and JS-style comments from LLM-generated JSON strings.
 * 
 * @param {string} raw
 * @returns {any}
 * @throws {Error} if JSON parsing still fails after cleaning.
 */
export function cleanAndParseJSON(raw) {
	let cleanText = raw.trim()
	
	// Remove markdown code block tags if present
	cleanText = cleanText.replace(/^```(json)?\n?/i, '')
	cleanText = cleanText.replace(/```$/g, '')
	if (cleanText.startsWith('`')) cleanText = cleanText.substring(1)
	if (cleanText.endsWith('`')) cleanText = cleanText.substring(0, cleanText.length - 1)
	
	cleanText = cleanText.trim()
	
	// Remove C-style block comments /* ... */
	cleanText = cleanText.replace(/\/\*[\s\S]*?\*\//g, '')
	
	// Remove inline comments // ... (but be careful not to remove urls like http://)
	// We'll use a simple regex that matches // if it's preceded by whitespace or start of line
	cleanText = cleanText.replace(/(^|\s)\/\/.*/g, '')
	
	return JSON.parse(cleanText)
}

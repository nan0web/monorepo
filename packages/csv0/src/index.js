
/**
 * Parses a CSV0 string.
 * CSV0 is a CSV format with FrontMatter (YAML/nan0 format), separated by `---`.
 * 
 * @param {string} source - The raw string content of a .csv0 file
 * @returns {{ frontMatter: string, csvBody: string }}
 */
export function parseCSV0(source) {
	if (!source) return { frontMatter: '', csvBody: '' }

	// Look for typical FrontMatter delimiters
	const lines = source.split(/\r?\n/)
	
	if (lines[0] === '---') {
		const endOfFrontMatter = lines.indexOf('---', 1)
		
		if (endOfFrontMatter !== -1) {
			const frontMatter = lines.slice(1, endOfFrontMatter).join('\n')
			const csvBody = lines.slice(endOfFrontMatter + 1).join('\n')
			return { frontMatter, csvBody }
		}
	}
	
	return { frontMatter: '', csvBody: source }
}

export default parseCSV0

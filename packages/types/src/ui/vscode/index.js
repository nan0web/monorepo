import * as vscode from 'vscode'
import NaN0 from '../../domain/NaN0.js'

/**
 * Entry point for the VS Code plugin (extension)
 * @param {vscode.ExtensionContext} context
 */
export function activate(context) {
	// Register formatter for the "nan0" language (ensure this is added in your package.json)
	const formatter = vscode.languages.registerDocumentFormattingEditProvider('nan0', {
		/**
		 * @param {vscode.TextDocument} document
		 * @param {vscode.FormattingOptions} options
		 */
		provideDocumentFormattingEdits(document, options) {
			try {
				const text = document.getText()
				
				// 1. Create context to preserve comments during parsing
				const parseContext = { comments: [] }
				
				// 2. Parse the current text.
				// If there's a syntax error, it will throw an exception caught below.
				const data = NaN0.parse(text, parseContext)
				
				// 3. Format back to text.
				// NaN0.stringify currently preserves formatting based on NaN0.TAB ('  ' or '\t').
				const formattedText = NaN0.stringify(data, parseContext)

				// 4. Create a Range mapping the entire document and replace it with the formatted text
				const fullRange = new vscode.Range(
					document.positionAt(0),
					document.positionAt(text.length)
				)

				return [vscode.TextEdit.replace(fullRange, formattedText)]
			} catch (error) {
				// If a parsing error occurs (e.g., invalid indentation) — display it
				// and return an empty array to prevent breaking the user's code.
				vscode.window.showErrorMessage(`NaN0 Format Error: ${error.message}`)
				return []
			}
		}
	})

	context.subscriptions.push(formatter)
}

export function deactivate() {}

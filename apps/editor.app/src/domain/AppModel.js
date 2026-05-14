/**
 * AppModel.js (Domain)
 *
 * Defines the main application domain model with metadata for the Universal Renderer.
 */
export class AppModel {
	static title = {
		help: 'Document or page title',
		placeholder: 'Enter title...',
		default: 'New Document',
	}

	static description = {
		help: 'Detailed content description',
		placeholder: 'Markdown content...',
		default: '',
		type: 'text/markdown',
	}

	static author = {
		help: 'Link to author profile',
		placeholder: 'ref/AuthorModel...',
		default: '',
		type: 'ref/AuthorModel',
	}

	static tags = {
		help: 'List of categorization tags',
		placeholder: '#tag1, #tag2...',
		default: [],
		type: 'string[]',
	}

	// Instance properties
	/** @type {string} */
	title = AppModel.title.default
	/** @type {string} */
	description = AppModel.description.default
	/** @type {string} */
	author = AppModel.author.default
	/** @type {string[]} */
	tags = AppModel.tags.default
}

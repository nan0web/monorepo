import { Model } from '@nan0web/types'

/**
 * Universal Attachment model for uploaded files and documents.
 */
export class Attachment extends Model {
	static $collection = 'attachments'
	static $upload = true

	static title = {
		help: 'Attachment title',
		type: 'string',
		localized: true,
	}

	static url = {
		help: 'File URL path',
		type: 'string',
		required: true,
	}

	static filename = {
		help: 'Original filename',
		type: 'string',
		required: true,
	}

	static mimeType = {
		help: 'MIME Type',
		type: 'string',
		required: true,
	}

	static filesize = {
		help: 'File size in bytes',
		type: 'number',
	}

	static alt = {
		help: 'Alternative text',
		type: 'string',
		localized: true,
	}
}

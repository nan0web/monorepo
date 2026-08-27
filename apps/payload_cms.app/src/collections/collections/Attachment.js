/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'attachments'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "uk": "Attachment",
    "en": "Attachment"
  },
  "plural": {
    "uk": "Attachments",
    "en": "Attachments"
  }
}
/** @replace */

/**
 * @replace useAsTitle
 */
const useAsTitle = 'title'
/** @replace */

/**
 * @replace group
 */
const group = "Media & Files"
/** @replace */

/**
 * @replace fields
 */
const fields = [
  {
    "name": "title",
    "type": "text",
    "localized": true
  },
  {
    "name": "url",
    "type": "text",
    "required": true
  },
  {
    "name": "filename",
    "type": "text"
  },
  {
    "name": "mimeType",
    "type": "text"
  },
  {
    "name": "filesize",
    "type": "number"
  },
  {
    "name": "alt",
    "type": "text",
    "localized": true
  },
  {
    "name": "fileCreatedAt",
    "type": "text"
  }
]
/** @replace */

/** @type {import('payload').CollectionConfig} */
export const collectionConfig = {
	slug: collectionSlug,
	labels,
	admin: {
		useAsTitle,
		group,
	},
	access: {
		read: () => true,
		create: (/** @type {any} */ { req: { user } }) => Boolean(user),
		update: (/** @type {any} */ { req: { user } }) => Boolean(user),
		delete: (/** @type {any} */ { req: { user } }) => Boolean(user),
	},
	fields,
}

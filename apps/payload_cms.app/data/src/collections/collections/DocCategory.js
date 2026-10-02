/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'doc_categories'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "en": "Category",
    "uk": "Category"
  },
  "plural": {
    "en": "Categories",
    "uk": "Categories"
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
const group = 'Documentation'
/** @replace */

/**
 * @replace fields
 */
const fields = [
  {
    "name": "title",
    "type": "text",
    "label": {
      "uk": "Document category title",
      "en": "Document category title"
    },
    "localized": true,
    "required": true
  },
  {
    "name": "slug",
    "type": "text",
    "label": {
      "uk": "Document category slug",
      "en": "Document category slug"
    },
    "required": true
  }
]
/** @replace */

import { accessFor, publicAccess } from '@nan0web/ui-payload/access'

/** @type {import('payload').CollectionConfig} */
export const collectionConfig = {
	slug: 'doc_categories',
	labels,
	admin: {
		useAsTitle,
		group,
	},
	access: {
		read: publicAccess,
		create: accessFor('admin', 'editor'),
		update: accessFor('admin', 'editor'),
		delete: accessFor('admin'),
	},
	fields,
}

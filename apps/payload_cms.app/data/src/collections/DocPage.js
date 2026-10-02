/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'doc_pages'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "en": "Documentation Page",
    "uk": "Documentation Page"
  },
  "plural": {
    "en": "Documentation Pages",
    "uk": "Documentation Pages"
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
      "uk": "Documentation Page title",
      "en": "Documentation Page title"
    },
    "localized": true,
    "required": true
  },
  {
    "name": "slug",
    "type": "text",
    "label": {
      "uk": "Documentation Page slug",
      "en": "Documentation Page slug"
    },
    "required": true
  },
  {
    "name": "category",
    "relationTo": "doc_categories",
    "type": "relationship",
    "label": {
      "uk": "Documentation Page category",
      "en": "Documentation Page category"
    }
  },
  {
    "name": "content",
    "type": "textarea",
    "label": {
      "uk": "Documentation Page content",
      "en": "Documentation Page content"
    },
    "localized": true
  }
]
/** @replace */

import { accessFor, publicAccess } from '@nan0web/ui-payload/access'

/** @type {import('payload').CollectionConfig} */
export const collectionConfig = {
	versions: { drafts: true },
	slug: 'doc_pages',
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

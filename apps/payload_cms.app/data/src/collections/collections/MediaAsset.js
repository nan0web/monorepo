/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'media_assets'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "en": "Media Asset",
    "uk": "Media Asset"
  },
  "plural": {
    "en": "Media Assets",
    "uk": "Media Assets"
  }
}
/** @replace */

/**
 * @replace useAsTitle
 */
const useAsTitle = 'id'
/** @replace */

/**
 * @replace group
 */
const group = 'Assets'
/** @replace */

/**
 * @replace fields
 */
const fields = [
  {
    "name": "alt",
    "type": "text",
    "label": {
      "uk": "Media Asset alt text",
      "en": "Media Asset alt text"
    },
    "localized": true
  }
]
/** @replace */

import { accessFor, publicAccess } from '@nan0web/ui-payload/access'

/** @type {import('payload').CollectionConfig} */
export const collectionConfig = {
	upload: {"mimeTypes":["image/jpeg","image/png","image/webp","application/pdf"],"imageSizes":[{"name":"thumb","width":300}]},
	slug: 'media_assets',
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

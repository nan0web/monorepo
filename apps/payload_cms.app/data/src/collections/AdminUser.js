/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'admin_users'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "en": "Admin User",
    "uk": "Admin User"
  },
  "plural": {
    "en": "Admin Users",
    "uk": "Admin Users"
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
const group = 'System'
/** @replace */

/**
 * @replace fields
 */
const fields = [
  {
    "name": "role",
    "options": [
      "admin",
      "editor",
      "viewer"
    ],
    "type": "select",
    "label": {
      "uk": "Admin User role",
      "en": "Admin User role"
    },
    "required": true,
    "defaultValue": "viewer"
  }
]
/** @replace */

import { accessFor, publicAccess } from '@nan0web/ui-payload/access'

/** @type {import('payload').CollectionConfig} */
export const collectionConfig = {
	auth: true,
	slug: 'admin_users',
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

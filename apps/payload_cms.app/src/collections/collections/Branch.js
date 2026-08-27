/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'branches'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "uk": "Branch",
    "en": "Branch"
  },
  "plural": {
    "uk": "Branches",
    "en": "Branches"
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
const group = "Infrastructure"
/** @replace */

/**
 * @replace fields
 */
const fields = [
  {
    "name": "title",
    "type": "text",
    "label": {
      "uk": "Branch title",
      "en": "Branch title"
    },
    "defaultValue": ""
  },
  {
    "name": "city",
    "type": "text",
    "label": {
      "uk": "City",
      "en": "City"
    },
    "defaultValue": ""
  },
  {
    "name": "address",
    "type": "text",
    "label": {
      "uk": "Address",
      "en": "Address"
    },
    "defaultValue": ""
  },
  {
    "name": "type",
    "type": "text",
    "label": {
      "uk": "Type",
      "en": "Type"
    },
    "defaultValue": "office"
  },
  {
    "name": "TYPES",
    "type": "text"
  },
  {
    "name": "onDuty",
    "type": "text",
    "label": {
      "uk": "On duty",
      "en": "On duty"
    },
    "defaultValue": false
  },
  {
    "name": "hasSafe",
    "type": "text",
    "label": {
      "uk": "Has safe",
      "en": "Has safe"
    },
    "defaultValue": false
  },
  {
    "name": "inclusive",
    "type": "text",
    "label": {
      "uk": "Barrier-free",
      "en": "Barrier-free"
    },
    "defaultValue": false
  },
  {
    "name": "location",
    "type": "text",
    "label": {
      "uk": "Location",
      "en": "Location"
    },
    "defaultValue": ""
  },
  {
    "name": "lat",
    "type": "text",
    "label": {
      "uk": "Latitude",
      "en": "Latitude"
    },
    "defaultValue": 0
  },
  {
    "name": "lng",
    "type": "text",
    "label": {
      "uk": "Longitude",
      "en": "Longitude"
    },
    "defaultValue": 0
  },
  {
    "name": "monFriWork",
    "type": "text",
    "label": {
      "uk": "Mon-Fri work",
      "en": "Mon-Fri work"
    },
    "defaultValue": false
  },
  {
    "name": "monFriCashier",
    "type": "text",
    "label": {
      "uk": "Mon-Fri cashier",
      "en": "Mon-Fri cashier"
    },
    "defaultValue": false
  },
  {
    "name": "monFriLunch",
    "type": "text",
    "label": {
      "uk": "Mon-Fri lunch",
      "en": "Mon-Fri lunch"
    },
    "defaultValue": false
  },
  {
    "name": "satWork",
    "type": "text",
    "label": {
      "uk": "Sat work",
      "en": "Sat work"
    },
    "defaultValue": false
  },
  {
    "name": "satCashier",
    "type": "text",
    "label": {
      "uk": "Sat cashier",
      "en": "Sat cashier"
    },
    "defaultValue": false
  },
  {
    "name": "satSunWork",
    "type": "text",
    "label": {
      "uk": "Sat-Sun work",
      "en": "Sat-Sun work"
    },
    "defaultValue": false
  },
  {
    "name": "phone1",
    "type": "text",
    "label": {
      "uk": "Phone 1",
      "en": "Phone 1"
    },
    "defaultValue": ""
  },
  {
    "name": "phone2",
    "type": "text",
    "label": {
      "uk": "Phone 2",
      "en": "Phone 2"
    },
    "defaultValue": ""
  },
  {
    "name": "phoneCashier",
    "type": "text",
    "label": {
      "uk": "Phone cashier",
      "en": "Phone cashier"
    },
    "defaultValue": ""
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

import {
	ContainerObject,
	FilterString,
	FullObject,
	NonEmptyObject,
	ObjectWithAlias,
	UndefinedObject,
	NaN0,
	Parser,
	Node,
	ModelError,
} from './domain/index.js'

import clone from './utils/clone.js'
import merge from './utils/merge.js'
import resolveAliases from './utils/resolveAliases.js'
import resolveDefaults from './utils/resolveDefaults.js'
import resolveValidation from './utils/resolveValidation.js'
import getMetadata from './utils/getMetadata.js'
import { Model } from './domain/Model.js'
import { createT } from './utils/TFunction.js'

/** @typedef {import('./utils/TFunction.js').TFunction} TFunction */
/** @typedef {import('./domain/Model.js').ModelOptions} ModelOptions */

export * from './utils/core.js'

export {
	FilterString,
	FullObject,
	UndefinedObject,
	ObjectWithAlias,
	ContainerObject,
	NonEmptyObject,
	clone,
	merge,
	Parser,
	Node,
	NaN0,
	resolveAliases,
	resolveDefaults,
	resolveValidation,
	getMetadata,
	Model,
	ModelError,
	createT,
	createT as TFunction,
}

export default NaN0

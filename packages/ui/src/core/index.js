export { default as InputAdapter } from './InputAdapter.js'
export { default as OutputAdapter } from './OutputAdapter.js'

import UIStream from './Stream.js'
export { UIStream, UIStream as UiStream }
import StreamEntry from './StreamEntry.js'
export { StreamEntry, StreamEntry as UiStreamEntry }

export { default as FormInput } from './Form/Input.js'

import UIForm from './Form/Form.js'
export { UIForm, UIForm as UiForm }

export { default as UiMessage } from './Message/Message.js'
export { default as FormMessage } from './Form/Message.js'
export { default as OutputMessage } from './Message/OutputMessage.js'

export { default as Error, CancelError } from './Error/index.js'

// Flow — Yield-Based Universal UI Architecture
export {
	runFlow,
	flow,
	View,
	Prompt,
	Stream,
	Alert,
	Toast,
	Badge,
	Text,
	Table,
	Input,
	Select,
	Confirm,
	Multiselect,
	Mask,
	Password,
	Spinner,
	Progress,
} from './Flow.js'
export { default as Flow } from './Flow.js'

// OLMUI Generator Engine — Intent-based Model→Adapter contract
export {
	validateIntent,
	ask,
	show,
	progress,
	log,
	render,
	result,
	INTENT_TYPES,
	isModelSchema,
} from './Intent.js'
/** @typedef {import('./Intent.js').LogLevel} LogLevel */
/** @typedef {import('./Intent.js').ShowLevel} ShowLevel */
/** @typedef {import('./Intent.js').FieldSchema} FieldSchema */
/** @typedef {import('./Intent.js').FieldOptions} FieldOptions */
/** @typedef {import('./Intent.js').OptionObject} OptionObject */
/** @typedef {import('./Intent.js').OptionResolver} OptionResolver */
/** @typedef {import('./Intent.js').Intent} Intent */
/** @typedef {import('./Intent.js').IntentResponse} IntentResponse */
/** @typedef {import('./Intent.js').AskIntent} AskIntent */
/** @typedef {import('./Intent.js').ProgressIntent} ProgressIntent */
/** @typedef {import('./Intent.js').ProgressOptions} ProgressOptions */
/** @typedef {import('./Intent.js').LogIntent} LogIntent */
/** @typedef {import('./Intent.js').ShowIntent} ShowIntent */
/** @typedef {import('./Intent.js').RenderIntent} RenderIntent */
/** @typedef {import('./Intent.js').ResultData} ResultData */
/** @typedef {import('./Intent.js').ResultIntent} ResultIntent */
/** @typedef {import('./Intent.js').IntentType} IntentType */
/** @typedef {import('./Intent.js').AskResponse} AskResponse */
/** @typedef {import('./Intent.js').AbortResponse} AbortResponse */
/** @typedef {import('./Intent.js').ShowData} ShowData */
/** @typedef {import('./InputAdapter.js').AskOptions} AskOptions */
export { IntentErrorModel } from './IntentErrorModel.js'
export { runGenerator } from './GeneratorRunner.js'

export { MaskHandler } from './MaskHandler.js'
export { LayoutModel } from '../domain/LayoutModel.js'

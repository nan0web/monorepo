import Locale from './Locale.js'
import { Model } from '@nan0web/types'
import Models from './Model/index.js'
import Component from './Component/index.js'

export { Attachment } from './domain/Attachment.js'
export { Article } from './domain/Article.js'
export { BlockRegistry, blockRegistry } from './core/BlockRegistry.js'

export { Locale, Model, Models, Component }
export * from './Component/contracts/index.js'
export { default as Element } from './Model/Element.js'
export {
	default as Theme,
	getUserTheme,
	CustomTheme,
	DarkLightTheme,
	NightTheme,
	createTheme,
} from './Theme/index.js'
export { resolveContext } from './utils/resolveContext.js'
export { processI18n } from './utils/processI18n.js'
export { format } from './format.js'
export { default as Navigation } from './domain/Navigation.js'

// export default App
export { default as FormMessage } from './core/Form/Message.js'
export { default as FormInput } from './core/Form/Input.js'
export { default as InputAdapter } from './core/InputAdapter.js'
export { default as OutputAdapter } from './core/OutputAdapter.js'
export { default as OutputMessage } from './core/Message/OutputMessage.js'
export { default as UiForm } from './core/Form/Form.js'
export { default as UiMessage } from './core/Message/Message.js'
export { default as Error, CancelError } from './core/Error/index.js'
export { default as UiAdapter } from './core/UiAdapter.js'
export { resolvePositionalArgs } from './core/resolvePositionalArgs.js'
export { tokens } from './Theme/tokens.js'

// OLMUI Generator Engine
/** @typedef {import('./core/index.js').LogLevel} LogLevel */
/** @typedef {import('./core/index.js').ShowLevel} ShowLevel */
/** @typedef {import('./core/index.js').FieldSchema} FieldSchema */
/** @typedef {import('./core/index.js').FieldOptions} FieldOptions */
/** @typedef {import('./core/index.js').OptionObject} OptionObject */
/** @typedef {import('./core/index.js').OptionResolver} OptionResolver */
/** @typedef {import('./core/index.js').Intent} Intent */
/** @typedef {import('./core/index.js').IntentResponse} IntentResponse */
/** @typedef {import('./core/index.js').AskIntent} AskIntent */
/** @typedef {import('./core/index.js').ProgressIntent} ProgressIntent */
/** @typedef {import('./core/index.js').ProgressOptions} ProgressOptions */
/** @typedef {import('./core/index.js').LogIntent} LogIntent */
/** @typedef {import('./core/index.js').ShowIntent} ShowIntent */
/** @typedef {import('./core/index.js').RenderIntent} RenderIntent */
/** @typedef {import('./core/index.js').ResultIntent} ResultIntent */
/** @typedef {import('./core/index.js').ResultData} ResultData */
/** @typedef {import('./core/index.js').IntentType} IntentType */
/** @typedef {import('./core/index.js').AskResponse} AskResponse */
/** @typedef {import('./core/index.js').AbortResponse} AbortResponse */
/** @typedef {import('./core/index.js').ShowData} ShowData */
/** @typedef {import('./core/index.js').AskOptions} AskOptions */
export * from './core/Intent.js'

export { IntentErrorModel } from './core/IntentErrorModel.js'
export { runGenerator } from './core/GeneratorRunner.js'
export { buildNan0SpecFromTrace } from './testing/CrashReporter.js'

// Flow components
export {
	runFlow,
	flow,
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
} from './core/Flow.js'
export { default as Flow } from './core/Flow.js'

/** @typedef {import('./domain/index.js').ModelAsAppOptions} ModelAsAppOptions */
export * from './domain/index.js'

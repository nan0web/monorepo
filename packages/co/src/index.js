import App from './App.js'
import Chat from './Chat.js'
import Contact from './Contact.js'

import Message from './Message.js'
import I18nMessage from './I18nMessage.js'
import InputMessage from './InputMessage.js'
import OutputMessage from './OutputMessage.js'

import Language from './Language.js'

/** @typedef {import("./Message.js").MessageInput} MessageInput */
/** @typedef {import("./Message.js").MessageBodySchema} MessageBodySchema */
/** @typedef {import("./Message.js").ValidateFn} ValidateFn */

// Remove Command exports from index (move to ui-cli)
// Deprecated: Command, CommandError, CommandMessage, CommandOption, str2argv

export { App, Chat, Contact, Language, Message, InputMessage, OutputMessage, I18nMessage }

export default Message

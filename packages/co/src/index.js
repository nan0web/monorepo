import App from './App.js'
import Chat from './domain/Chat.js'
import Contact from './domain/Contact.js'

import Message from './domain/Message.js'
import I18nMessage from './I18nMessage.js'
import InputMessage from './InputMessage.js'
import OutputMessage from './OutputMessage.js'

import Language from './domain/Language.js'

// Verse Fundamentals & Domain Models
import Identity from './domain/Identity.js'
import Connection from './domain/Connection.js'
import Post from './domain/Post.js'
import Media from './domain/Media.js'
import Interaction from './domain/Interaction.js'
import Service from './domain/Service.js'
import Event from './domain/Event.js'

/** @typedef {import("./domain/Message.js").MessageInput} MessageInput */
/** @typedef {import("./domain/Message.js").MessageBodySchema} MessageBodySchema */
/** @typedef {import("./domain/Message.js").ValidateFn} ValidateFn */

export { 
	App, Chat, Contact, Language, Message, InputMessage, OutputMessage, I18nMessage,
	Identity, Connection, Post, Media, Interaction, Service, Event
}

export default Message

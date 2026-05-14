export default ChatCommand
/**
 * ChatCommand – writes a message to the release‑wide chat (chat/…/timestamp.username.md)
 *
 * Usage:
 *   release chat write "your message"
 *
 * Options:
 *   --user <string> – username to embed in the filename (defaults to "anonymous")
 */
declare class ChatCommand extends SubCommand {
	/**
	 * Run the chat command.
	 *
	 * @param {AppCommandMessage} ctx – command context (contains args and opts)
	 */
	run(ctx: AppCommandMessage): Promise<void>
}
import SubCommand from './SubCommand.js'
import AppCommandMessage from '../co/AppCommandMessage.js'

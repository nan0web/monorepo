import Message from '../../src/Message.js'
import Body from './Body.js'

/**
 * GlobalMessage – базове повідомлення з глобальною схемою
 */
export default class GlobalMessage extends Message {
	static Body = Body
}

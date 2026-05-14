import User from './User.js'
import TokenExpiryService from './TokenExpiryService.js'
import Membership from './Membership.js'
import Role from './Role.js'
import AccessControl from './AccessControl.js'
import Password from './Password.js'
import Session from './Session.js'
import Crypto from './Crypto.js'
import Token from './Token.js'

class Auth {
	static AccessControl = AccessControl
	static Membership = Membership
	static Password = Password
	static Role = Role
	static Session = Session
	static User = User
	static TokenExpiryService = TokenExpiryService
	static Crypto = Crypto
	static Token = Token
}

export {
	Auth,
	AccessControl,
	Membership,
	Password,
	Role,
	Session,
	User,
	TokenExpiryService,
	Crypto,
	Token,
}

export default Auth

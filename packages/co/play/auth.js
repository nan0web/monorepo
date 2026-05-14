#!/usr/bin/env node

import I18nMessage from '../src/I18nMessage.js'

/**
 * @typedef {Object} RegistrationBody
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {Object} AuthorizedHead
 * @property {string} authorization
 */

/**
 * @typedef {Object} UpdateInfoBody
 * @property {string} username
 */

class RegistrationMessage extends I18nMessage {
	/** @type {RegistrationBody} */
	body = {
		username: '',
		password: '',
	}

	constructor(input = {}) {
		super(input)
		const { body = this.body } = input
		const { username = this.username, password = this.password } = body ?? {}
		this.body = {
			username: String(username),
			password: String(password),
		}
	}

	/** @returns {string} */
	get usernameHelp() {
		return this.t(
			'User must have 3 characters minimum and name with only latin characters, numbers, dash -, underscore _, at @, period .',
		)
	}
	/** @returns {string} */
	get passwordHelp() {
		return this.t(
			'Password must have 6 characters minimum and must contain any symbols besides spaces',
		)
	}
	/** @returns {boolean} */
	get isUsernameValid() {
		return !!this.body.username.match(/^[a-z0-9\-_@\.]{3,}$/)
	}
	/** @returns {boolean} */
	get isPasswordValid() {
		return !!this.body.password.match(/^\S{6,}+$/)
	}
	get isUsernameRequired() {
		return true
	}
	get isPasswordRequired() {
		return true
	}

	/**
	 * Validates message and returns errors for every field (key).
	 * @returns {Record<string, null | Error | string>}
	 */
	get errors() {
		return {
			username: this.isUsernameValid ? null : new Error(this.usernameHelp),
			password: this.isPasswordValid ? null : new Error(this.passwordHelp),
		}
	}

	/**
	 * @param {any} input
	 * @return {RegistrationMessage}
	 */
	static from(input) {
		if (input instanceof RegistrationMessage) return input
		return new RegistrationMessage(input)
	}
}

class AuthorizedMessage extends I18nMessage {
	/** @type {AuthorizedHead} */
	head = {
		authorization: '',
	}
	constructor(input = {}) {
		super(input)
		const { head = this.head } = input
		const { authorization = '' } = head ?? {}
		this.head = {
			authorization: String(authorization),
		}
	}
	/**
	 * @param {any} input
	 * @return {AuthorizedMessage}
	 */
	static from(input) {
		if (input instanceof AuthorizedMessage) return input
		return new AuthorizedMessage(input)
	}
}

class UpdateInfoMessage extends AuthorizedMessage {
	/** @type {AuthorizedBody} */
	body = {
		username: '',
		firstName: '',
		lastName: '',
		gender: -1,
	}
	constructor(input = {}) {
		super(input)
		const { body = this.body } = input
		const { username = '', firstName = '', lastName = '', gender = -1 } = body ?? {}
		this.body = {
			username: String(username),
			firstName: String(firstName),
			lastName: String(lastName),
			gender: Number(gender),
		}
	}
	/**
	 * @param {any} input
	 * @return {UpdateInfoMessage}
	 */
	static from(input) {
		if (input instanceof UpdateInfoMessage) return input
		return new UpdateInfoMessage(input)
	}
}

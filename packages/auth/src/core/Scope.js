/**
 * @fileoverview Sovereign Scopes Definition.
 * Defines the granular permissions that apps can request from the Sovereign User.
 */

export const Scope = {
	// Identity
	IDENTITY_EMAIL: 'identity.email',
	IDENTITY_PHONE: 'identity.phone',
	IDENTITY_NAME: 'identity.name',

	// Finance
	PAYMENT_CHARGE: 'payment.charge',
	BANK_READ: 'bank.read',

	// Social
	SOCIAL_POST: 'social.post',
	SOCIAL_READ: 'social.read',

	// System
	SYSTEM_NOTIFY: 'system.notify',
}

export default Scope

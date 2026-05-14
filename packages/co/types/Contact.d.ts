/**
 * Contact handling class
 * Parses and formats contact information with specific URI schemes.
 *
 * @example
 * const email = new Contact({ type: Contact.EMAIL, value: "test@example.com" })
 * console.log(email.toString()) // "mailto:test@example.com"
 *
 * @class Contact
 */
export default class Contact {
    /** @type {string} */
    static ADDRESS: string;
    /** @type {string} */
    static EMAIL: string;
    /** @type {string} */
    static FACEBOOK: string;
    /** @type {string} */
    static INSTAGRAM: string;
    /** @type {string} */
    static LINKEDIN: string;
    /** @type {string} */
    static SIGNAL: string;
    /** @type {string} */
    static SKYPE: string;
    /** @type {string} */
    static TELEGRAM: string;
    /** @type {string} */
    static VIBER: string;
    /** @type {string} */
    static WHATSAPP: string;
    /** @type {string} */
    static X: string;
    /** @type {string} */
    static TELEPHONE: string;
    /** @type {string} */
    static URL: string;
    /**
     * Parse a raw string into a {@link Contact} instance.
     *
     * @param {string} input - Raw contact string (may include a known prefix or be a plain email/phone/url).
     * @returns {Contact} Parsed contact object.
     */
    static parse(input: string): Contact;
    /**
     * Factory helper – returns the argument unchanged if it is already a {@link Contact},
     * otherwise creates a new instance.
     *
     * @param {any} input - Contact instance or raw data suitable for the constructor.
     * @returns {Contact}
     */
    static from(input: any): Contact;
    /**
     * Create a Contact instance.
     *
     * @param {object} [input={}]
     * @param {string} [input.type=Contact.ADDRESS] - One of the static URI prefixes.
     * @param {string} [input.value=""] - The raw value without the prefix.
     */
    constructor(input?: {
        type?: string | undefined;
        value?: string | undefined;
    });
    /** @type {string} */
    type: string;
    /** @type {string} */
    value: string;
    /**
     * Convert the contact to its string representation.
     *
     * @returns {string} URI string (e.g. `mailto:test@example.com` or `address:123 Main St`).
     */
    toString(): string;
}

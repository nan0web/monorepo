export default Address
/**
 * Address model.
 * Stores the information about the address of sender or recipient.
 */
declare class Address {
	/**
	 * Decodes address from a string.
	 *
	 * @param {string} input - The input string.
	 * @returns {Address} The decoded Address instance.
	 */
	static '__#1@#fromString'(input: string): Address
	/**
	 * Decodes an address string in the format "Name <address>" or returns the input if already an Address instance.
	 *
	 * @param {string | object} input - The string containing the name and address or an object with address/name properties.
	 * @returns {Address} - An instance of Address.
	 */
	static from(input: string | object): Address
	/**
	 * Creates an instance of Address.
	 *
	 * @param {object} input - The input object.
	 * @param {string} input.address - The address string.
	 * @param {string} [input.name=""] - The name associated with the address.
	 */
	constructor(input: { address: string; name?: string | undefined })
	/** @type {string} */
	address: string
	/** @type {string} */
	name: string
	/**
	 * Gets the type of address based on its format.
	 *
	 * @returns {string} The type of address ("email", "facebook", "phone", "url", or "address").
	 */
	get type(): string
	/**
	 * Returns the string representation of the Address.
	 *
	 * @returns {string} The formatted string "<address>" or "Name <address>".
	 */
	toString(): string
	/**
	 * Converts the Address instance to an object.
	 *
	 * @param {string[]} [fields=[]] - Optional array of fields to include in the output object.
	 * @returns {object} An object representation of the Address instance.
	 */
	toObject(fields?: string[] | undefined): object
}

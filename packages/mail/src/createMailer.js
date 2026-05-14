import nodemailer from 'nodemailer'

/**
 * @link https://nodemailer.com/
 * @param {object} trasportConfig The nodemailer config
 * @returns nodemailer.transport.
 */
const createMailer = (trasportConfig) => {
	return nodemailer.createTransport(trasportConfig)
}

export default createMailer

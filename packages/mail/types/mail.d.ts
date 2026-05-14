export default mail
/**
 *
 * @param {Email} email
 * @param {object} data
 * @param {object} opts The options
 */
declare function mail(email: Email, data: object, opts?: object): Promise<any>
import Email from './Email.js'

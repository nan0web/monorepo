// import Release from "@nan0web/release"
import Release from '../../../../src/Release.js'
import company from './models/company.js'

export default new Release({
	version: 'v1.0.0',
	date: '2025-08-18',

	company,
	teams: company.teams,
	members: company.members,
})

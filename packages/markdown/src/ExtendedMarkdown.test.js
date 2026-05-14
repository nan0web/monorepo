import { describe, it } from 'node:test'
import assert from 'node:assert'
import ExtendedMarkdown, { Campaign, AdGroup } from './ExtendedMarkdown.js'

const example = `
## Non Payment Rent NYC 2025
### Collect Unpaid Rent NYC
#### Keywords
\`\`\`keywords
collect unpaid rent nyc
rent arrears attorney
rent arrears nyc
\`\`\`

#### Headlines
\`\`\`headlines
Struggling with Unpaid Rent? We Can Help NYC!
Collect Unpaid Rent Fast in NYC – Expert Legal Support
NYC Landlord? Recover Unpaid Rent Today!
\`\`\`

#### Descriptions
\`\`\`descriptions
Facing unpaid rent? Our NYC attorneys specialize in rent collection. Call now!
Recover your unpaid rent quickly with our NYC legal team. Contact us today!
Get legal support to collect unpaid rent in NYC. Trusted attorneys ready to assist.
\`\`\`
`

describe('ExtendedMarkdown parser', () => {
	it('should parse campaign and ad group with variables', () => {
		const parser = new ExtendedMarkdown()
		const allElements = parser.parse(example)
		// Filter out empty spaces to focus on logical elements
		const elements = allElements.filter(el => el.constructor.name !== 'MDSpace')

		assert.strictEqual(elements.length, 2) // Campaign, AdGroup
		const campaign = elements[0]
		assert.ok(campaign instanceof Campaign)
		assert.strictEqual(campaign.name, 'Non Payment Rent NYC 2025')
		assert.deepStrictEqual(campaign.keywords, [])

		const adGroup = elements[1]
		assert.ok(adGroup instanceof AdGroup)
		assert.strictEqual(adGroup.name, 'Collect Unpaid Rent NYC')
		assert.deepStrictEqual(adGroup.keywords, [
			'collect unpaid rent nyc',
			'rent arrears attorney',
			'rent arrears nyc',
		])
		assert.deepStrictEqual(adGroup.headlines, [
			'Struggling with Unpaid Rent? We Can Help NYC!',
			'Collect Unpaid Rent Fast in NYC – Expert Legal Support',
			'NYC Landlord? Recover Unpaid Rent Today!',
		])
		assert.deepStrictEqual(adGroup.descriptions, [
			'Facing unpaid rent? Our NYC attorneys specialize in rent collection. Call now!',
			'Recover your unpaid rent quickly with our NYC legal team. Contact us today!',
			'Get legal support to collect unpaid rent in NYC. Trusted attorneys ready to assist.',
		])
	})
})

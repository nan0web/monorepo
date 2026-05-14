import NaN0 from './NaN0.js'

const iterations = 50000

const testData = {
	title: "App.Menu.Catalog",
	description: "The main catalog page with a very long description to test parser performance. It has multiple lines and complex structure.",
	tags: ["catalog", "store", "items", "ecommerce"],
	meta: {
		views: 10420,
		active: true,
		rating: 4.8,
		categories: ["electronics", "books", "hardware"]
	},
	content: Array.from({ length: 20 }, (_, i) => `Item ${i} - metadata...`).join('\n')
}

console.log('Running NaN0 Stringify...')
let str = ''
for (let i = 0; i < iterations; i++) {
	str = NaN0.stringify(testData)
}

console.log('Running NaN0 Parse...')
for (let i = 0; i < iterations; i++) {
	NaN0.parse(str)
}
console.log('Done.')

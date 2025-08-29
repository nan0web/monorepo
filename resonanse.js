const resonanse = (...args) => args.reduce(
	(r, n, i) => 0 === r ? n : n % r === 0 ? n : n * r
, 0)

const exp = [
	[[2], 2],
	[[2, 3], 6],
	[[2, 3, 4], 12],
	[[2, 3, 4, 5], 60],
	[[2, 3, 4, 5, 6], 60]
]

for (const [a, r] of exp) {
	const result = resonanse(...a)
	if (result === r) {
		console.info(a.join(", ") + " == " + r)
	} else {
		console.error(a.join(", ") + " != " + r + " == " + result)
	}
}

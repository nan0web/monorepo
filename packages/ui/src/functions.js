import { empty } from '@nan0web/types'

export const spaces = (options = {}) => {
	const { cols = [], padding = 1, aligns = [] } = options
	return (row) =>
		row.map((str, i) => {
			const pad = ' '.repeat(cols[i] - str.length + padding)
			return aligns[i] === 'r' ? pad + str : str + pad
		})
}

export const weight = (arr) => {
	return (Fn = (v) => v) => {
		const cols = []
		arr.forEach((m) => {
			Fn(m).forEach((str, i) => {
				if (undefined === cols[i]) cols[i] = 0
				cols[i] = Math.max(str.length, cols[i])
			})
		})
		return cols
	}
}

export const table = (options = {}) => {
	const { Fn = (v) => v, cols = [], padding = 1, aligns = [] } = options
	return (arr) => {
		const options = { cols: empty(cols) ? weight(arr)(Fn) : cols, padding, aligns }
		return arr.map((row) => spaces(options)(row))
	}
}

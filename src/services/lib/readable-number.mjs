/**
 * @param {number} n 
 * @returns string
 */
export function readable (n) {
	if (n < 1000) {
		return `${n}`;
	}
	if (n < 1000000) {
		return `${(n/1000).toFixed(2)}k`
	}
	if (n < 1000000000) {
		return `${(n/1000000).toFixed(2)}M`
	}
	return `${(n/1000000000).toFixed(2)}G`
}
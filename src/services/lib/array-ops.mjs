/**
 * @param {any[]} arr 
 * @param {number} idx 
 */
export function moveToTop (arr, idx) {
	const [item] = arr.splice(idx,1);
	arr.unshift(item);
	return arr;
}
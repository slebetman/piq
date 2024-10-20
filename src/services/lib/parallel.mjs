/**
 * @template T
 * @param {T[]} items 
 * @param {number} limit 
 * @param {(item: T) => Promise<any>} executor 
 * @returns Promise of results
 */
export async function parallelMap (items, limit, executor) {
	let results = [];
	let tracker = 0;

	async function iterator () {
		const index = tracker;
		tracker++;
		
		if (items.length) {
			const item = items.shift();
			results[index] = await executor(item);
			return await iterator();
		}
	}

	let promises = [];	
	for (let i=0; i<limit; i++) {
		promises.push(iterator());
	}
	
	await Promise.all(promises);

	return results;
}

/**
 * @template T
 * @param {T[]} items 
 * @param {number} limit 
 * @param {(item: T) => Promise<void>} executor 
 * @returns Promise
 */
export async function parallelRun (items, limit, executor) {
	async function iterator () {
		if (items.length) {
			const item = items.shift();
			await executor(item);
			await iterator();
		}
	}

	let promises = [];	
	for (let i=0; i<limit; i++) {
		promises.push(iterator());
	}
	
	await Promise.all(promises);
}

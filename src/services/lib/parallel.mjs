export async function parallelMap (list, limit, executor) {
	let results = [];
	let tracker = 0;

	async function iterator () {
		const index = tracker;
		tracker++;
		
		if (list.length) {
			const item = list.shift();
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

export async function parallelRun (list, limit, executor) {
	async function iterator () {
		if (list.length) {
			const item = list.shift();
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

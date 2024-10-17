export function parallelMap (list, limit, executor) {
	let results = [];
	let tracker = 0;

	function iterator () {
		const index = tracker;
		tracker++;
		const count = list.length;
		const item = list.shift();
		
		if (count > 0) {
			return executor(item).then((val) => {
				results[index] = val;
				return iterator();
			});
		}
		return;
	}

	let promises = [];	
	for (let i=0; i<limit; i++) {
		promises.push(iterator());
	}
	
	return Promise.all(promises).then(() => results);
}

export function parallelRun (list, limit, executor) {
	function iterator () {
		const count = list.length;
		const item = list.shift();
		
		if (count > 0) {
			return executor(item).then((val) => iterator());
		}
		return;
	}

	let promises = [];	
	for (let i=0; i<limit; i++) {
		promises.push(iterator());
	}
	
	return Promise.all(promises);
}

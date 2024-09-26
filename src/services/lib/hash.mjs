import { createHash } from 'crypto';

export function hash (txt) {
	return createHash('SHA1')
		.update(txt)
		.digest('base64')
		.slice(0,-1);
}

import { thumbnailFile } from '../lib/image-util.mjs';
import fs from 'fs/promises';

/**
 * @typedef {Object} RequestMessage
 * @property {string} imgPath
 * @property {boolean} regenerate
 */

/**
 * @typedef {Object} ResponseMessage
 * @property {string} imgPath
 * @property {string} cachePath
 */

/**
 * @param {RequestMessage} data 
 */
async function thumbnailer (data) {
	let buf;
	let retries = 10;

	// retry if file is empty
	while (retries--) {
		buf = await thumbnailFile(data.imgPath, data.regenerate);
		const stat = await fs.stat(buf);
		if (stat.size) break;
		await fs.unlink(buf);
	}
	
	/** @type {ResponseMessage} */
	const response = {
		imgPath: data.imgPath,
		cachePath: buf,
	}

	process.send(response);
}

process.on('message', (data) => {
	switch (data.op) {
		case 'thumbnail': return thumbnailer(data);
		default:
			console.error('Unsupported op', data.op);
	}
});

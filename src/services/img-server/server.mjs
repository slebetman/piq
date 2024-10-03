import { thumbnailBuffer } from "../lib/image-util.mjs";

/**
 * @typedef {Object} RequestMessage
 * @property {string} imgPath
 */

/**
 * @typedef {Object} ResponseMessage
 * @property {string} imgPath
 * @property {string} cachePath
 */

/**
 * @param {RequestMessage} data 
 */
async function handler (data) {
	const buf = await thumbnailBuffer(data.imgPath);
	
	/** @type {ResponseMessage} */
	const response = {
		imgPath: data.imgPath,
		cachePath: 'data:image/webp;base64,' + buf.toString('base64'),
	}

	process.send(response);
}

process.on('message', handler);

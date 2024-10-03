import { thumbnailFile } from "../lib/image-util.mjs";

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
	const buf = await thumbnailFile(data.imgPath);
	
	/** @type {ResponseMessage} */
	const response = {
		imgPath: data.imgPath,
		cachePath: buf,
	}

	process.send(response);
}

process.on('message', handler);

import { imageInfo, thumbnailBuffer, thumbnailFile } from '../lib/image-util.mjs';
import fs from 'fs/promises';

/**
 * @typedef {'thumbnail-buffer' | 'thumbnail-file' | 'info'} OpType
 */

/**
 * @typedef {Object} RequestMessage
 * @property {string} imgPath
 * @property {boolean} regenerate
 * @property {OpType} op
 */

/**
 * @typedef {Object} ResponseMessage
 * @property {string} imgPath
 * @property {string} cachePath
 * @property {OpType} op
 */

/**
 * @param {RequestMessage} data 
 */
async function fileThumbnailer (data) {
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
		op: data.op,
	}

	process.send(response);
}

/**
 * @param {RequestMessage} data 
 */
async function bufferThumbnailer (data) {
	const buf = await thumbnailBuffer(data.imgPath);
	
	/** @type {ResponseMessage} */
	const response = {
		imgPath: data.imgPath,
		cachePath: 'data:image/webp;base64,' + buf.toString('base64'),
		op: data.op,
	}

	process.send(response);
}

async function info (data) {
	const imgInfo = await imageInfo(data.imgPath);

	const response = {
		imgPath: data.imgPath,
		info: imgInfo,
		op: data.op,
	}

	process.send(response);
}

process.on('message', (data) => {
	/** @type {OpType} */
	const op = data.op;
	switch (op) {
		case 'thumbnail-file': return fileThumbnailer(data);
		case 'thumbnail-buffer': return bufferThumbnailer(data);
		case 'info': return info(data);
		default:
			console.error('Unsupported op', data.op);
	}
});


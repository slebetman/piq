import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { hash } from './hash.mjs';
import { CACHE_DIR } from './config-paths.mjs';

/********************************************************************
 * WARNING: Only call these functions inside img-server/server.mjs. *
 *          Sharp is sometimes unstable on Linux.                   *
 *          Using this in an external thread allows us to avoid     *
 *          crashing the main thread.                               *
 ********************************************************************/

export async function imageInfo (imgPath) {
	return await sharp(imgPath).metadata();
}

function thumbnailer (imgPath) {
	return sharp(imgPath)
		.resize(512,512,{
			fit: 'inside'
		})
		.rotate()
		.webp({
			quality: 70,
			effort: 2,
		});
}

export async function thumbnailBuffer (imgPath) {
	return await thumbnailer(imgPath).toBuffer();
}

export async function thumbnailFile (imgPath, regenerate = false) {
	const normalPath = path.normalize(imgPath);
	const hashPath = hash(normalPath);

	const cachePath = path.join(CACHE_DIR, `${hashPath}.webp`);
	
	if (regenerate) {
		console.error('regenerate', imgPath);
		await thumbnailer(imgPath)
			.toFile(cachePath);
	}
	else {
		try {
			const now = new Date();
			await fs.stat(cachePath);
			await fs.utimes(cachePath, now, now);
		}
		catch (err) {
			await thumbnailer(imgPath)
				.toFile(cachePath);
		}
	}

	return cachePath;
}

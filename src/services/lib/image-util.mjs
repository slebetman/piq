import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { hash } from './hash.mjs';
import { CACHE_DIR } from './config-paths.mjs';

export async function imageInfo (imgPath) {
	return await sharp(imgPath).metadata();
}

export async function thumbnail (imgPath) {
	const normalPath = path.normalize(imgPath);
	const hashPath = hash(normalPath);

	const cachePath = path.join(CACHE_DIR, hashPath);
	
	try {
		await fs.stat(cachePath);
	}
	catch (err) {
		await sharp(imgPath).resize(256,256,{
			fit: 'inside'
		})
	}

	return cachePath;
}

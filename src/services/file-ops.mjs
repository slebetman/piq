import { ipcMain } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import { imageInfo } from './lib/image-util.mjs';

let watchAbort = null;

export async function init () {
	// sync code here:
	ipcMain.handle('dir-list', async (e, dirPath) => {
		const files = await fs.readdir(path.normalize(dirPath), {
			withFileTypes: true
		});

		return files.map(x => ({
			name: x.name,
			isDirectory: x.isDirectory(),
			parentPath: x.parentPath,
		}))
	});

	ipcMain.handle('path-normalize', async (e, dirPath) => {
		return path.normalize(dirPath);
	});

	ipcMain.handle('img-info', async (e, imgPath) => {
		return await imageInfo(imgPath);
	});

	ipcMain.handle('watch', async (e, dirPath) => {
		if (watchAbort) {
			watchAbort.abort();
		}

		watchAbort = new AbortController();

		const watchOptions = {
			persistent: false,
			signal: watchAbort.signal,
		}

		const result = fs.watch(dirPath, watchOptions);
		try {
			for await (const e of result) {
				watchAbort = null;
				return e;
			}
		}
		catch (err) {
			return;
		}
	});
}
import { BrowserWindow, ipcMain } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import { readable } from './lib/readable-number.mjs';

/** @type {Record<string,AbortController>} */
let watchAbort = {};

/** @type {Record<string,{ count: number, timeout?: any }>} */
let watchTimeout = {};

/**
 * @param {string} dirPath 
 */
function unwatch (dirPath) {
	const controller = watchAbort[dirPath];
	if (controller) {
		controller.abort();
		delete watchAbort[dirPath];
	}
}

export async function dirList (dirPath) {
	const files = await fs.readdir(path.normalize(dirPath), {
		withFileTypes: true
	});

	return files
		.map(x => ({
			name: x.name,
			isDirectory: x.isDirectory(),
			parentPath: x.parentPath,
		})).sort((a,b) => {
			return a.name.localeCompare(b.name, {
				sensitivity : 'base',
				numeric: true,
			})
		})
}

export async function init () {
	// sync code here:
	ipcMain.handle('dir-list', async (e, dirPath) => {
		return await dirList(dirPath);
	});

	ipcMain.handle('path-normalize', async (e, dirPath) => {
		return path.normalize(dirPath);
	});

	ipcMain.handle('file-stat', async (e, imgPath) => {
		const info = await fs.stat(imgPath);

		return {
			size: readable(info.size),
			dateModified: info.mtime.toDateString(),
		}
	});

	ipcMain.on('current-path', async (e, path) => {
		const sender = e.sender;
		const win = BrowserWindow.fromWebContents(sender);

		win.webContents.send(path);
	})

	ipcMain.handle('watch', async (e, dirPath) => {
		const controller = new AbortController();
		watchAbort[dirPath] = controller;

		const watchOptions = {
			persistent: false,
			signal: controller.signal,
		}

		const result = fs.watch(dirPath, watchOptions);
		try {
			for await (const e of result) {
				unwatch(dirPath);
				return e;
			}
		}
		catch (err) {
			return;
		}
	});

	ipcMain.handle('unwatch', async (e, dirPath) => {
		unwatch(dirPath);
	});
}
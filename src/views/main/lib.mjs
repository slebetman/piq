import { app, BrowserWindow } from 'electron';
import { addHistory, config } from '../../services/config.mjs';
import fs from 'fs/promises';
import path from 'path';
import { openViewerWindow } from '../image-viewer/lib.mjs';
import { setMainMenu } from '../../services/main-menu.mjs';
import { dirList } from '../../services/file-ops.mjs';

/**
 * @typedef {Object} MainWindowObject
 * @property {BrowserWindow} window
 * @property {readonly string} currentPath
 */

/** @type {MainWindowObject[]} */
export const mainWindows = [];

export function getMainWindowFromDirPath (path) {
	return mainWindows.find(x => x.currentPath === path);
}

/**
 * @param {string | undefined} dir 
 */
export async function openMainWindow (dirPath) {
	let dir = dirPath;

	if (dir) {
		for (const w of mainWindows) {
			if (!w.currentPath) {
				w.window.webContents.send('dir', dir);
				return;
			}
			if (w.currentPath === dir) {
				w.window.show();
				w.window.focus();
				return;
			}
		}

		const stat = await fs.stat(dir);

		if (!stat.isDirectory()) {
			const image  = path.basename(dirPath);
			dir = path.dirname(dirPath);

			const files = await dirList(dir);

			const index = files.findIndex(x => x.name === image);

			openViewerWindow(dirPath, files, index);

			if (getMainWindowFromDirPath(dir)) {
				return; // don't open duplicate window.
			}
		}
	}

	const win = new BrowserWindow({
		width: config.defaultBrowserWidth,
		height: config.defaultBrowserHeight,
		webPreferences: {
			preload: import.meta.dirname + '/preload.js',
		}
	});

	if (config.hideMenuBar) {
		win.setMenuBarVisibility(false);
		win.autoHideMenuBar = true;
	}
	else {
		win.setMenuBarVisibility(true);
	}
	
	win.loadFile(import.meta.dirname + '/index.html');

	win.webContents.once('did-finish-load', () => {
		if (dir) {
			win.webContents.send('dir', dir);
		}
	});

	win.webContents.ipc.on('current-path', async (e, currentPath) => {
		dir = currentPath;
		await addHistory(currentPath);
		await setMainMenu();
	})

	const winObj = {
		window: win,
		get currentPath() {
			return dir;
		}
	}

	mainWindows.push(winObj);

	win.on('close', () => {
		const idx = mainWindows.findIndex(x => x === winObj);
		if (idx !== -1) {
			mainWindows.splice(idx,1); // remove closed window
		}

		if (mainWindows.length === 0) {
			app.quit();
		}
	})

	win.on('focus', () => setMainMenu());
}
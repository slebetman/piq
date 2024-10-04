import { app, BrowserWindow } from 'electron';
import { config } from '../../services/config.mjs';
import fs from 'fs/promises';
import path from 'path';
import { openViewerWindow } from '../../services/open-viewer.mjs';

/**
 * @typedef {Object} MainWindowObject
 * @property {BrowserWindow} window
 * @property {readonly string} currentPath
 */

/** @type {MainWindowObject[]} */
export const mainWindows = [];

/**
 * @param {string | undefined} dir 
 */
export async function openMainWindow (dirPath) {
	let dir = dirPath;

	const stat = await fs.stat(dir);

	if (!stat.isDirectory()) {
		const image  = path.basename(dirPath);
		dir = path.dirname(dirPath);

		const files = (await fs.readdir(dir,{
			withFileTypes: true
		})).map(x => ({
			name: x.name,
			isDirectory: x.isDirectory(),
			parentPath: x.parentPath,
		}));

		const index = files.findIndex(x => x.name === image);

		openViewerWindow(dirPath, files, index);

		const alreadyOpenedWindow = mainWindows.find(x => x.currentPath === dir);

		if (alreadyOpenedWindow) {
			return; // don't open duplicate window.
		}
	}

	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: import.meta.dirname + '/preload.js',
		}
	});

	if (config.hideMenuBar) {
		win.setMenuBarVisibility(false);
		win.autoHideMenuBar = true;
	}
	
	win.loadFile(import.meta.dirname + '/index.html');

	win.webContents.once('did-finish-load', () => {
		if (dir) {
			win.webContents.send('dir', dir);
		}
	});

	win.webContents.ipc.on('current-path', (e, currentPath) => {
		dir = currentPath;
		app.addRecentDocument(currentPath);
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
}
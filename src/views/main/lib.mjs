import { app, BrowserWindow } from "electron";

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
export async function openMainWindow (path) {
	let dir = path;
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: import.meta.dirname + '/preload.js',
		}
	});

	win.setMenuBarVisibility(false);
	win.autoHideMenuBar = true;
	
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
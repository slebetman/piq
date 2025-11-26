import { app, BrowserWindow } from 'electron';
import { config } from '../../services/config.mjs';
import { mainWindows } from '../main/lib.mjs';
import { setCollectionMenu } from '../../services/main-menu.mjs';

/**
 * @param {string | undefined} col 
 */
export async function updateCollection (col) {
	if (col) {
		for (const w of mainWindows) {
			if (w.currentPath === col) {
				w.window.webContents.send('collection', col);
			}
		}
	}
}

/**
 * @param {string | undefined} col 
 */
export async function openCollection (col) {
	if (col) {
		for (const w of mainWindows) {
			if (w.currentPath === col) {
				w.window.show();
				w.window.focus();
				w.window.webContents.send('collection', col);
				return;
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

	win.setMenuBarVisibility(false);
	win.autoHideMenuBar = true;
	
	win.loadFile(import.meta.dirname + '/index.html');

	win.webContents.once('did-finish-load', () => {
		if (col) {
			win.webContents.send('collection', col);
		}
	});

	const winObj = {
		window: win,
		get currentPath() {
			return col;
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
	});

	win.on('focus', () => setCollectionMenu());
}
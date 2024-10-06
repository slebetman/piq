import { BrowserWindow, ipcMain } from 'electron';

let alreadyOpened = false;

/**
 * @param {string | undefined} dir 
 */
export async function openConfigWindow () {
	if (alreadyOpened) return;

	alreadyOpened = true;

	const win = new BrowserWindow({
		width: 540,
		height: 400,
		webPreferences: {
			preload: import.meta.dirname + '/preload.js',
		}
	});

	win.setMenuBarVisibility(false);
	win.autoHideMenuBar = false;
	
	win.loadFile(import.meta.dirname + '/index.html');

	win.on('close', () => {
		alreadyOpened = false;
	});
}
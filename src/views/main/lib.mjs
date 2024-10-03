import { BrowserWindow } from "electron";
/**
 * @param {string} path
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
	})

	return {
		window: win,
		get currentPath() {
			return dir;
		}
	}
}
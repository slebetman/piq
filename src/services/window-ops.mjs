import { BrowserWindow, ipcMain } from 'electron';
import { openViewerWindow, wrapWindowAroundImage } from '../views/image-viewer/lib.mjs';

export async function init () {
	ipcMain.handle('close-window', (e) => {
		const sender = e.sender;
		const win = BrowserWindow.fromWebContents(sender);
		win.close();
	});
}
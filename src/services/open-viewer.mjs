import { BrowserWindow, ipcMain } from 'electron';
import { openViewerWindow, wrapWindowAroundImage } from '../views/image-viewer/lib.mjs';

export async function init () {
	// sync code here:
	ipcMain.handle('viewer', async (e, imgPath, files, index) => {
		return await openViewerWindow(imgPath, files, index);
	});

	ipcMain.handle('wrap-window', async (e, width, height) => {
		const win = BrowserWindow.fromWebContents(e.sender);

		if (win) {
			wrapWindowAroundImage(win, width, height);
		}
	})

	ipcMain.handle('close-window', (e) => {
		const sender = e.sender;
		const win = BrowserWindow.fromWebContents(sender);
		win.close();
	});
}
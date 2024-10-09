import { BrowserWindow, ipcMain } from 'electron';

export async function init () {
	ipcMain.handle('close-window', (e) => {
		const sender = e.sender;
		const win = BrowserWindow.fromWebContents(sender);
		win.close();
	});
}
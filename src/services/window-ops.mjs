import { BrowserWindow, dialog, ipcMain } from 'electron';

export async function init () {
	ipcMain.handle('close-window', (e) => {
		const sender = e.sender;
		const win = BrowserWindow.fromWebContents(sender);
		win.close();
	});

	ipcMain.handle('dialog', (e, props) => {
		const sender = e.sender;
		const win = BrowserWindow.fromWebContents(sender);
		return dialog.showMessageBox(win, props);
	})
}
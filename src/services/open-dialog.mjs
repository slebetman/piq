import { dialog, ipcMain } from 'electron';

export async function showOpenDialog () {
	return await dialog.showOpenDialog({
		properties: ['openDirectory'],
		message: 'Open Folder'
	})
}

/**
 * @param {string} title
 * @param {string} message 
 * @param {string[]} buttons
 */
export async function showConfirmDialog (title, message, buttons) {
	return await dialog.showMessageBox({
		type: 'question',
		title,
		message,
		buttons,
	})
}

export async function init () {
	// sync code here:
	ipcMain.handle('open', async () => {
		return await showOpenDialog();
	});

	ipcMain.handle('show-confirm', async (e, title, message, buttons) => {
		return await showConfirmDialog(title, message, buttons);
	})
}
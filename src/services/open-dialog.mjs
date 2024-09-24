import { dialog, ipcMain } from "electron";


export async function init () {
	// sync code here:
	ipcMain.handle('open',async () => {
		return await dialog.showOpenDialog({
			properties: ['openDirectory'],
			message: 'Open Folder'
		})
	});
}
import { ipcMain } from 'electron';
import { openCollection } from '../views/collection/lib.mjs';

export async function init () {
	// sync code here:
	ipcMain.handle('open-collection', async (e, col) => {
		return await openCollection(col);
	});
}
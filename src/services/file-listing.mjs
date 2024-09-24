import { ipcMain } from 'electron'
import fs from 'fs/promises'
import path from 'path'


export async function init () {
	// sync code here:
	ipcMain.handle('dir-list', async (e, dirPath) => {
		const files = await fs.readdir(path.normalize(dirPath), {
			withFileTypes: true
		});

		return files.map(x => ({
			name: x.name,
			isDirectory: x.isDirectory(),
			parentPath: x.parentPath,
		}))
	});
}
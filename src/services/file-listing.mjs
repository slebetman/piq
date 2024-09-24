import { ipcMain } from "electron"
import fs from "fs/promises"


export async function init () {
	// sync code here:
	ipcMain.handle('dir-list', async (e, path) => {
		const files = await fs.readdir(path, {
			withFileTypes: true
		});

		return files.map(x => ({
			name: x.name,
			isDirectory: x.isDirectory(),
			parentPath: x.parentPath,
		}))
	});
}
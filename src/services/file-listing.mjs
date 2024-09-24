import { ipcMain } from "electron"
import fs from "fs/promises"


export async function init () {
	// sync code here:
    ipcMain.handle('dir-list', async (e, path) => {
        return await fs.readdir(path, {
            withFileTypes: true
        })
    });
}
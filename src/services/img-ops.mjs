import { ipcMain } from 'electron'
import { thumbnailBuffer } from './lib/image-util.mjs';


export async function init () {
	ipcMain.handle('thumbnail-buffer', async (e, imgPath) => {
		const buf = await thumbnailBuffer(imgPath);
		return 'data:image/webp;base64,' + buf.toString('base64');
	});
}

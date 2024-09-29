import { ipcMain, nativeImage } from 'electron'
import { thumbnailBuffer } from './lib/image-util.mjs';


export async function init () {
	ipcMain.handle('thumbnail-buffer', async (e, imgPath) => {
		const buf = await thumbnailBuffer(imgPath);
		const image = nativeImage.createFromBuffer(buf);
		return image.toDataURL();
	});
}

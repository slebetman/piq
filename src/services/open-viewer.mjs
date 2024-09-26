import { BrowserWindow, ipcMain, screen } from 'electron';
import { imageInfo } from './lib/image-util.mjs';
import { readable } from './lib/readable-number.mjs';
import path from 'path';

export async function init () {
	// sync code here:
	ipcMain.handle('viewer', async (e, imgPath) => {
		const primaryDisplay = screen.getPrimaryDisplay();
  		const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

		const stat = await imageInfo(imgPath);
		let { width, height } = stat;
		const aspect = width/height;

		if (height > (screenHeight - 50)) {
			height = (screenHeight - 50);
			width = Math.round(aspect * height);
		}

		const win = new BrowserWindow({
			width,
			height,
			webPreferences: {
				preload: path.join(import.meta.dirname, '../views/image-viewer/preload.js'),
			}
		});
		win.setMenuBarVisibility(false);
		win.setAspectRatio(aspect);
		win.loadFile(path.join(import.meta.dirname, '../views/image-viewer/index.html'));

		win.webContents.once('did-finish-load', () => {
			win.webContents.send('image', {
				image: imgPath,
				name: path.basename(imgPath),
				width,
				height,
				type: stat.format,
				size: readable(stat.size),
			});
		})
	});
}
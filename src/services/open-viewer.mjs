import { BrowserWindow, ipcMain, screen } from 'electron';
import { imageInfo } from './lib/image-util.mjs';
import { readable } from './lib/readable-number.mjs';
import path from 'path';

export async function init () {
	// sync code here:
	ipcMain.handle('viewer', async (e, imgPath, files, index) => {
		const primaryDisplay = screen.getPrimaryDisplay();
  		const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
		let cursor = screen.getCursorScreenPoint();
		let distScreen = screen.getDisplayNearestPoint({x: cursor.x, y: cursor.y});

		const stat = await imageInfo(imgPath);
		let { width, height } = stat;
		const aspect = width/height;

		if (height > (screenHeight - 50)) {
			height = (screenHeight - 50);
			width = Math.round(aspect * height);
		}

		if (width > (screenWidth - 20)) {
			width = (screenWidth - 20);
			height = Math.round(width / aspect);
		}

		const win = new BrowserWindow({
			webPreferences: {
				preload: path.join(import.meta.dirname, '../views/image-viewer/preload.js'),
			},
			x: Math.round(distScreen.bounds.x + ((distScreen.bounds.width - width) / 2)),
			y: Math.round(distScreen.bounds.y + ((distScreen.bounds.height - height) / 2)),
		});
		win.setMenuBarVisibility(false);
		win.setAspectRatio(aspect);
		win.loadFile(path.join(import.meta.dirname, '../views/image-viewer/index.html'));
		win.setContentSize(width, height);

		win.webContents.once('did-finish-load', () => {
			win.webContents.send('image', {
				image: imgPath,
				name: path.basename(imgPath),
				width,
				height,
				type: stat.format,
				size: readable(stat.size),
			}, files, index);
		})
	});
}
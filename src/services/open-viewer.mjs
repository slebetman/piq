import { BrowserWindow, ipcMain, screen } from 'electron';
import { imageInfo } from './lib/image-util.mjs';
import { readable } from './lib/readable-number.mjs';
import path from 'path';

/**
 * @param {BrowserWindow} win 
 * @param {number} width 
 * @param {number} height 
 */
function wrapWindowAroundImage (win, width, height, setCenter = false) {
	let w = width;
	let h = height;
	let recenter = setCenter;

	const bounds = win.getBounds();
	const center = {
		x: bounds.x + (bounds.width / 2),
		y: bounds.y + (bounds.height / 2),
	};

	const display = screen.getDisplayNearestPoint(center);
	const { width: screenWidth, height: screenHeight } = display.workAreaSize;

	const aspect = w/h;

	if (h > (screenHeight - 50)) {
		h = (screenHeight - 50);
		w = Math.round(aspect * h);
		recenter = true;
	}

	if (w > (screenWidth - 20)) {
		w = (screenWidth - 20);
		h = Math.round(w / aspect);
		recenter = true;
	}

	win.setAspectRatio(aspect);
	win.setContentSize(w, h);

	if (recenter) {
		win.setPosition(
			Math.round(display.bounds.x + ((display.bounds.width - w) / 2)),
			Math.round(display.bounds.y + ((display.bounds.height - h) / 2))
		)
	}
	else {
		win.setPosition(
			Math.round(center.x - (w / 2)),
			Math.round(center.y - (h / 2))
		)
	}

	return {
		width: w,
		height: h,
	}
}

export async function init () {
	// sync code here:
	ipcMain.handle('viewer', async (e, imgPath, files, index) => {
		const stat = await imageInfo(imgPath);
		const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());

		const win = new BrowserWindow({
			webPreferences: {
				preload: path.join(import.meta.dirname, '../views/image-viewer/preload.js'),
			},
			x: display.bounds.x + ((display.bounds.width - stat.width) / 2),
			y: display.bounds.y + ((display.bounds.height - stat.height) / 2),
		});
		win.hide();
		win.setMenuBarVisibility(false);
		win.loadFile(path.join(import.meta.dirname, '../views/image-viewer/index.html'));
		wrapWindowAroundImage(win, stat.width, stat.height, true);

		win.webContents.once('did-finish-load', () => {
			win.webContents.send('image', {
				image: imgPath,
				name: path.basename(imgPath),
				type: stat.format,
				size: readable(stat.size),
			}, files, index);
			win.show();
		})
	});

	ipcMain.handle('wrap-window', async (e, width, height) => {
		const win = BrowserWindow.fromWebContents(e.sender);

		if (win) {
			wrapWindowAroundImage(win, width, height);
		}
	})
}
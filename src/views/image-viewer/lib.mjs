import { BrowserWindow, screen } from 'electron';
import { imageInfo } from '../../services/lib/image-util.mjs';

/**
 * @param {BrowserWindow} win 
 * @param {number} width 
 * @param {number} height 
 */
export function wrapWindowAroundImage (win, width, height, setCenter = false) {
	let w = width;
	let h = height;
	let recenter = setCenter;

	const bounds = win.getBounds();
	const contentBounds = win.getContentBounds();
	const center = {
		x: bounds.x + (bounds.width / 2),
		y: bounds.y + (bounds.height / 2),
	};

	const yDiff = contentBounds.y - bounds.y;

	const display = screen.getDisplayNearestPoint(center);
	const { width: screenWidth, height: screenHeight } = display.workAreaSize;

	const aspect = w/h;

	if (h > (screenHeight - 20)) {
		h = (screenHeight - 20);
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
			Math.round(center.y - (h / 2) - (yDiff / 2))
		)
	}

	return {
		width: w,
		height: h,
	}
}

export async function openViewerWindow (imgPath, files, index) {
	const meta = await imageInfo(imgPath);
	const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());

	const win = new BrowserWindow({
		webPreferences: {
			preload: import.meta.dirname + '/preload.js',
		},
		x: display.bounds.x + ((display.bounds.width - meta.width) / 2),
		y: display.bounds.y + ((display.bounds.height - meta.height) / 2),
	});
	win.hide();
	win.setMenuBarVisibility(false);
	win.loadFile(import.meta.dirname + '/index.html');
	wrapWindowAroundImage(win, meta.width, meta.height, true);

	win.webContents.once('did-finish-load', () => {
		win.webContents.send('image', files, index);
		win.show();
	})
}

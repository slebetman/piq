import { BrowserWindow, screen } from 'electron';
import { imageInfo } from '../../services/lib/image-util.mjs';
import { setViewerMenu } from '../../services/main-menu.mjs';

/**
 * @typedef {Object} ViewWindowObject
 * @property {BrowserWindow} window
 * @property {readonly string} imagePath
 */

/** @type {ViewWindowObject[]} */
export const viewWindows = [];

export function getViewWindowFromImgPath (path) {
	return viewWindows.find(x => x.imagePath === path);
}

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
	let img = imgPath;

	const alreadyOpenedWindow = getViewWindowFromImgPath(img);

	if (alreadyOpenedWindow) {
		alreadyOpenedWindow.window.show();
		alreadyOpenedWindow.window.focus();
		return;  // don't open duplicate window.
	}

	const meta = await imageInfo(img);
	const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());

	const win = new BrowserWindow({
		webPreferences: {
			preload: import.meta.dirname + '/preload.js',
		},	
		x: display.bounds.x,
		y: display.bounds.y,
	});
	win.hide();
	win.setMenuBarVisibility(false);
	win.autoHideMenuBar = true;
	win.loadFile(import.meta.dirname + '/index.html');

	wrapWindowAroundImage(win, meta.width, meta.height, true);

	win.webContents.once('did-finish-load', () => {
		win.webContents.send('image', files, index);
		win.show();
	});

	win.webContents.ipc.on('current-path', (e, currentPath) => {
		img = currentPath;
	});

	win.webContents.ipc.on('resize', (e, divisor) => {
		wrapWindowAroundImage(
			win,
			Math.round(meta.width/divisor),
			Math.round(meta.height/divisor),
			true
		);
	});

	const winObj = {
		window: win,
		get imagePath() {
			return img;
		}
	}

	viewWindows.push(winObj);

	win.on('close', () => {
		const idx = viewWindows.findIndex(x => x === winObj);
		if (idx !== -1) {
			viewWindows.splice(idx,1); // remove closed window
		}
	});

	win.on('focus', () => setViewerMenu());
}

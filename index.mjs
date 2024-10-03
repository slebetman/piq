import { app, BrowserWindow } from 'electron';
import path from 'path';
import { openMainWindow } from './src/views/main/lib.mjs';

const services = [
	'config.mjs',
	'open-dialog.mjs',
	'file-ops.mjs',
	'open-viewer.mjs',
	'context-menu.mjs',
	'img-ops.mjs',
	'img-server/spawn.mjs',
];

/**
 * @typedef {Object} MainWindowObject
 * @property {BrowserWindow} window
 * @property {readonly string} currentPath
 */

/** @type {MainWindowObject[]} */
const mainWindows = [];

/**
 * @param {string | undefined} dir 
 */
async function makeMainWindow (dir) {
	const win = await openMainWindow(dir);

	mainWindows.push(win);

	win.window.on('close', () => {
		const idx = mainWindows.findIndex(x => x === win);
		if (idx !== -1) {
			mainWindows.splice(idx,1); // remove closed window
		}

		if (mainWindows.length === 0) {
			app.quit();
		}
	})
}

async function main (dir) {
	app.addListener('open-file', async (ev, path) => {
		for (const w of mainWindows) {
			if (!w.currentPath) {
				w.window.webContents.send('dir', path);
				return;
			}
		}

		await makeMainWindow(path);
	})

	await app.whenReady();

	for (const service of services) {
		await (await import(
			path.join(import.meta.dirname, 'src/services', service)
		)).init();
	}

	await makeMainWindow(dir);
}

app.on('window-all-closed', () => {
	app.quit();
});

if (app.isPackaged) {
	main(process.argv[1]);	
}
else {
	main(process.argv[2]);
}

import { app, BrowserWindow } from 'electron';
import path from 'path';

const services = [
	'config.mjs',
	'open-dialog.mjs',
	'file-ops.mjs',
	'open-viewer.mjs',
	'context-menu.mjs',
	'img-ops.mjs',
	'img-server/spawn.mjs',
];

async function main (argument0) {
	let dir = argument0;
	let win = null;
	app.addListener('open-file', (ev, path) => {
		dir = path;

		if (win) {
			win.webContents.send('dir', dir);
		}
	})
	await app.whenReady();

	for (const service of services) {
		await (await import(
			path.join(import.meta.dirname, 'src/services', service)
		)).init();
	}

	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(import.meta.dirname, 'src/views/main/preload.js'),
		}
	});

	win.setMenuBarVisibility(false);
	// win.autoHideMenuBar = true;
	
	win.loadFile(path.join(import.meta.dirname, 'src/views/main/index.html'));

	win.webContents.once('did-finish-load', () => {
		if (dir) {
			win.webContents.send('dir', dir);
		}
	});
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

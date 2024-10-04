import { app } from 'electron';
import path from 'path';
import { mainWindows, openMainWindow } from './src/views/main/lib.mjs';
import { setMainMenu } from './src/services/main-menu.mjs';

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

	setMainMenu();

	app.addListener('open-file', async (ev, path) => {
		dir = path;
		
		for (const w of mainWindows) {
			if (!w.currentPath) {
				w.window.webContents.send('dir', path);
				return;
			}
		}

		await openMainWindow(path);
	})

	await app.whenReady();

	for (const service of services) {
		await (await import(
			path.join(import.meta.dirname, 'src/services', service)
		)).init();
	}

	await openMainWindow(dir);
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

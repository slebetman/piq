import { app } from 'electron';
import path from 'path';
import { openMainWindow } from './views/main/lib.mjs';
import { setMainMenu } from './services/main-menu.mjs';

const services = [
	'config.mjs',
	'collections.mjs',
	'open-dialog.mjs',
	'file-ops.mjs',
	'open-viewer.mjs',
	'context-menu.mjs',
	'window-ops.mjs',
	'img-server/spawn.mjs',
];

async function main (argument0) {
	let dir = argument0;

	setMainMenu();

	// Handle Mac initial drag-and-drop:
	app.addListener('open-file', async (ev, path) => {
		dir = path;
	});

	await app.whenReady();

	for (const service of services) {
		await (await import(
			path.join(import.meta.dirname, 'services', service)
		)).init();
	}

	await openMainWindow(dir);

	// Replace initial handler with regular open event handler:
	app.removeAllListeners('open-file');
	app.addListener('open-file', async (ev, path) => {
		await openMainWindow(path);
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

import { app, BrowserWindow } from 'electron';
import path from 'path';

const services = [
	'config.mjs'
];

async function main () {
	await app.whenReady();

	for (const service of services) {
		await (await import(
			path.join(import.meta.dirname, 'src/services', service)
		)).init();
	}

	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(import.meta.dirname, 'src/views/main/preload.js'),
		}
	});
	
	win.loadFile(path.join(import.meta.dirname, 'src/views/main/index.html'));
}

app.on('window-all-closed', () => {
	app.quit();
});

main();

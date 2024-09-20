const { app, BrowserWindow } = require('electron');
const path = require('path');

const services = [
	'config'
];

app.whenReady().then(() => {
	for (const service of services) {
		require(path.join(__dirname, 'src/services', service)).init();
	}

	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'src/views/main/preload.js'),
		}
	});
	
	win.loadFile(path.join(__dirname, 'src/views/main/index.html'));
});

app.on('window-all-closed', () => {
	app.quit();
});

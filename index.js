const { app, BrowserWindow } = require('electron');
const configService = require('./src/services/config');
const path = require('path');

app.whenReady().then(() => {
	configService.init();

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

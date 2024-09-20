const { ipcMain } = require('electron');
const xdg = require('xdg-portable/cjs');
const path = require('path');

const APP_NAME = 'piq';

const CONFIG_DIR = path.join(xdg.config(), APP_NAME);
const CACHE_DIR = path.join(xdg.cache(), APP_NAME);

function init () {
	console.log('in config init');

	ipcMain.handle('config',async () => {
		console.log('in config');
		return {
			dir: {
				config: CONFIG_DIR,
				cache: CACHE_DIR,
			}
		}
	})
}

module.exports = {
	init,
	CONFIG_DIR,
	CACHE_DIR,
};

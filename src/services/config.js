const { ipcMain } = require('electron');
const xdg = require('xdg-portable/cjs');

function init () {
	console.log('in config init');

	ipcMain.handle('config',async () => {
		console.log('in config');
		return {
			dir: {
				config: xdg.config(),
				cache: xdg.cache(),
			}
		}
	})
}

module.exports = {
	init
};

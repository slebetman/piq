import { ipcMain } from 'electron';
import xdg from 'xdg-portable';
import path from 'path';

const APP_NAME = 'piq';

export const CONFIG_DIR = path.join(xdg.config(), APP_NAME);
export const CACHE_DIR = path.join(xdg.cache(), APP_NAME);

export function init () {
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

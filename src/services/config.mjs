import { ipcMain } from 'electron';
import xdg from 'xdg-portable';
import path from 'path';
import fs from 'fs/promises';

const APP_NAME = 'piq';

export const CONFIG_DIR = path.join(xdg.config(), APP_NAME);
export const CACHE_DIR = path.join(xdg.cache(), APP_NAME);

export async function init () {
	// sync code here:
	ipcMain.handle('config',async () => {
		return {
			dir: {
				config: CONFIG_DIR,
				cache: CACHE_DIR,
			}
		}
	});

	// async code below this:
	await fs.mkdir(CONFIG_DIR, {recursive: true});
	await fs.mkdir(CACHE_DIR, {recursive: true});
}

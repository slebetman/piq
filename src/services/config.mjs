import { ipcMain } from 'electron';
import fs from 'fs/promises';
import { CACHE_DIR, CONFIG_DIR } from './lib/config-paths.mjs';
import os from 'os';

export async function init () {
	// sync code here:
	ipcMain.handle('config',() => {
		return {
			dir: {
				config: CONFIG_DIR,
				cache: CACHE_DIR,
			},
			threads: os.cpus().length,
		}
	});

	// async code below this:
	await fs.mkdir(CONFIG_DIR, {recursive: true});
	await fs.mkdir(CACHE_DIR, {recursive: true});
}

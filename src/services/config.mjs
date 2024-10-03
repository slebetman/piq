import { dialog, ipcMain } from 'electron';
import fs from 'fs/promises';
import { CACHE_DIR, CONFIG_DIR } from './lib/config-paths.mjs';
import os from 'os';
import { join } from 'path';

/**
 * @typedef {Object} Config
 * @property {Record<string,string>} dir
 * @property {number} threads
 * @property {string[]} [editors]
 * @property {boolean} useFileCache
 */

/** @type {Config} */
export const config = {
	dir: {
		config: CONFIG_DIR,
		cache: CACHE_DIR,
	},
	threads: os.cpus().length,
	useFileCache: true,
};

export function stringifyConfig () {
	const val = {
		threads: config.threads === os.cpus().length ? 'cpu_cores' : config.threads,
		editors: config.editors,
		debug: config.debug ?? false,
	}

	return JSON.stringify(val, null, 2);
}

export async function init () {
	// sync code here:
	ipcMain.handle('config',() => {
		return config;
	});

	// async code below this:
	await fs.mkdir(CONFIG_DIR, {recursive: true});
	await fs.mkdir(CACHE_DIR, {recursive: true});

	try {
		const configFile = await fs.readFile(join(CONFIG_DIR, 'config.json'),'utf8');
		const configObj = JSON.parse(configFile);

		for (let [ key, val ]  of Object.entries(configObj)) {
			switch(key) {
				case 'threads':
					if (val === 'cpu_cores') {
						val = os.cpus().length;
					}
					// no break here
				case 'editors':
				case 'useFileCache':
				case 'debug':
					config[key] = val;
					break;
				default:
					dialog.showErrorBox('Config Error', `Invalid configuration ${key}`);
			}
		}
	}
	catch (err) {
		if (err.code === 'ENOENT') {
			config.editors = [ 'gimp' ];

			// Create default file
			await fs.writeFile(join(CONFIG_DIR, 'config.json'), stringifyConfig());
		}
	}
}

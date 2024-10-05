import { app, dialog, ipcMain } from 'electron';
import fs from 'fs/promises';
import { CACHE_DIR, CONFIG_DIR } from './lib/config-paths.mjs';
import os from 'os';
import { join } from 'path';

/**
 * @typedef {Object} EditorSpec
 * @property {string} name
 * @property {string} extensions
 */

/**
 * @typedef {Object} Config
 * @property {Record<string,string>} dir
 * @property {number} threads
 * @property {EditorSpec[]} [editors]
 * @property {boolean} useFileCache
 * @property {string} version
 * @property {boolean} hideMenuBar
 * @property {number} defaultBrowserWidth
 * @property {number} defaultBrowserHeight
 */

/** @type {Config} */
export const config = {
	version: app.getVersion(),
	dir: {
		config: CONFIG_DIR,
		cache: CACHE_DIR,
	},
	threads: os.cpus().length,
	useFileCache: true,
	hideMenuBar: true,
	defaultBrowserWidth: 800,
	defaultBrowserHeight: 600,
};

export function stringifyConfig () {
	const val = {
		threads: config.threads === os.cpus().length ? 'cpu_cores' : config.threads,
		editors: config.editors,
		debug: config.debug ?? false,
		useFileCache: config.useFileCache,
		hideMenuBar: config.hideMenuBar,
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
				case 'hideMenuBar':
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
			config.editors = [{
				name: 'gimp',
				extensions: '*',
			}];

			// Create default file
			await fs.writeFile(join(CONFIG_DIR, 'config.json'), stringifyConfig());
		}
	}
}

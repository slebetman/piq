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
 * @property {boolean} debug
 * @property {number} defaultBrowserWidth
 * @property {number} defaultBrowserHeight
 * @property {number} defaultThumbnailSize
 */

/**
 * @typedef {keyof Config} ConfigKeys
 * @typedef {Omit<ConfigKeys, version | dir>} SettableConfigKeys
 * */

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
	debug: false,
	defaultBrowserWidth: 800,
	defaultBrowserHeight: 600,
	defaultThumbnailSize: 150,
};

/**
 * @param {SettableConfigKeys} key 
 * @param {number|string|boolean} val 
 */
export function setConfig (key, val) {
	config[key] = val;
}

export function updateConfigFile () {
	return fs.writeFile(join(CONFIG_DIR, 'config.json'), stringifyConfig());
}

export function stringifyConfig () {
	const val = {
		version: config.version,
		threads: config.threads === os.cpus().length ? 'cpu_cores' : config.threads,
		editors: config.editors,
		debug: config.debug ?? false,
		useFileCache: config.useFileCache,
		hideMenuBar: config.hideMenuBar,
		defaultBrowserWidth: config.defaultBrowserWidth,
		defaultBrowserHeight: config.defaultBrowserHeight,
		defaultThumbnailSize: config.defaultThumbnailSize,
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
		let oldVersion;

		for (let [ key, val ]  of Object.entries(configObj)) {
			switch(key) {
				case 'threads':
					if (val === 'cpu_cores') {
						val = os.cpus().length;
					}
					config[key] = val;
					break;
				case 'version':
					oldVersion = config.version;
					config[key] = val;
					break;
				case 'editors':
				case 'useFileCache':
				case 'hideMenuBar':
				case 'defaultBrowserWidth':
				case 'defaultBrowserHeight':
				case 'defaultThumbnailSize':
				case 'debug':
					config[key] = val;
					break;
				default:
					dialog.showErrorBox(
						'Config Error',
						`Invalid configuration ${key}`
					);
			}
		}

		if (config.version !== oldVersion) {
			// update old config file
			await updateConfigFile();
		}
	}
	catch (err) {
		if (err.code === 'ENOENT') {
			config.editors = [{
				name: 'gimp',
				extensions: '*',
			}];

			// Create default file
			await updateConfigFile();
		}
	}
}

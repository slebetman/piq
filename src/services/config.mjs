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
 * @param {ConfigKeys} key 
 * @param {number|string|boolean} val 
 */
export function setConfig (key, val) {
	let value = val;
	if (key === 'threads' && value === 'cpu_cores') {
		value = os.cpus().length;
	}
	config[key] = value;
}

export async function updateConfigFile () {
	return await fs.writeFile(join(CONFIG_DIR, 'config.json'), stringifyConfig());
}

export function savedConfig () {
	return {
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
}

export function stringifyConfig () {
	return JSON.stringify(savedConfig(), null, 2);
}

export async function init () {
	// sync code here:
	ipcMain.handle('config',() => {
		return config;
	});

	ipcMain.handle('get-saved-config', () => {
		return savedConfig();
	});

	ipcMain.handle('set-config',(e, key, val) => {
		setConfig(key, val);
	});

	ipcMain.handle('update-config', async () => {
		return await updateConfigFile();
	})

	// async code below this:
	await fs.mkdir(CONFIG_DIR, {recursive: true});
	await fs.mkdir(CACHE_DIR, {recursive: true});

	try {
		const configFile = await fs.readFile(join(CONFIG_DIR, 'config.json'),'utf8');
		const configObj = JSON.parse(configFile);
		let oldVersion;

		for (let [ key, val ]  of Object.entries(configObj)) {
			switch(key) {
				case 'version':
					oldVersion = config.version;
					config[key] = val;
					break;
				case 'threads':
				case 'editors':
				case 'useFileCache':
				case 'hideMenuBar':
				case 'defaultBrowserWidth':
				case 'defaultBrowserHeight':
				case 'defaultThumbnailSize':
				case 'debug':
					setConfig(key, val);
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

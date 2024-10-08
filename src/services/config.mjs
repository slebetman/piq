import { app, dialog, ipcMain } from 'electron';
import fs from 'fs/promises';
import { CACHE_DIR, CONFIG_DIR } from './lib/config-paths.mjs';
import os from 'os';
import { join } from 'path';
import { moveToTop } from './lib/array-ops.mjs';
import { setMainMenu } from './main-menu.mjs';

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
 * @property {number} recentFolderHistory
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
	recentFolderHistory: 10,
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

/**
 * @returns History array
 */
export async function readHistory () {
	try {
		const historyFile = await fs.readFile(join(CONFIG_DIR, 'history.txt'),'utf8');
		return historyFile.split('\n').filter(x => x);
	}
	catch (err) {
		return [];
	}
}

/**
 * @param {string[]} history 
 */
export async function writeHistory (history) {
	return await fs.writeFile(
		join(CONFIG_DIR, 'history.txt'),
		history
			.slice(0,config.recentFolderHistory)
			.join('\n')
	);
}

/**
 * @param {string} path 
 */
export async function addHistory (path) {
	let history = await readHistory();

	const idx = history.findIndex(x => x === path);

	if (idx !== -1) {
		moveToTop(history, idx);
	}
	else {
		history.unshift(path);
	}

	app.addRecentDocument(path);

	return await writeHistory(history);
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
		recentFolderHistory: config.recentFolderHistory,
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
	});

	ipcMain.handle('get-history', () => readHistory());

	ipcMain.handle('add-history', (e, path) => addHistory(path));

	ipcMain.handle('clear-history', async () => {
		app.clearRecentDocuments();
		await writeHistory([]);
		await setMainMenu();
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
				case 'version':
					oldVersion = val;
					break;
				case 'threads':
				case 'editors':
				case 'useFileCache':
				case 'hideMenuBar':
				case 'defaultBrowserWidth':
				case 'defaultBrowserHeight':
				case 'defaultThumbnailSize':
				case 'recentFolderHistory':
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

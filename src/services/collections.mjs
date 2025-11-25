import { ipcMain } from 'electron';
import fs from 'fs/promises';
import { CONFIG_DIR } from './lib/config-paths.mjs';
import { join } from 'path';

/**
 * @typedef {Record<string,string[]>} Collections
 */

/**
 * @type {Collections}
 */
let collections = {};

async function readCollections () {
	try {
		const collectionsFile = await fs.readFile(join(CONFIG_DIR, 'collections.json'),'utf8');
		collections = JSON.parse(collectionsFile);
	}
	catch (err) {
		collections = {};
	}
}

async function writeCollections () {
	return await fs.writeFile(
		join(CONFIG_DIR, 'collections.json'),
		JSON.stringify(collections, null, 2)
	);
}

/**
 * @param {string} col Collection name
 * @param {string} image Image path
 */
async function add (col, image) {
	const collection = collections[col];

	if (!collection) {
		collection = [];
	}

	// skip duplicates:
	if (collection.indexOf(image) === -1) {
		collection.push(image);
	}

	collections[col] = collection;
}

/**
 * @param {string} col Collection name
 * @param {string} image Image path
 */
function del (col, image) {
	const collection = collections[col];

	if (!collection) {
		return;
	}

	const idx = collection.indexOf(image);
	if (idx !== -1) {
		collection.splice(idx, 1);
	}

	collections[col] = collection;
}

export async function getCollections () {
	await readCollections();
	return Object.keys(collections);
}

/**
 * @param {string} col 
 */
export async function getCollection (col) {
	await readCollections();
	return collections[col] ?? [];
}

/**
 * @param {string} col 
 * @param {string} image 
 */
export async function addToCollection (col, image) {
	await readCollections();
	add(col, image);
	await writeCollections();
}

/**
 * @param {string} col 
 * @param {string} image 
 */
export async function deleteFromCollection (col, image) {
	await readCollections();
	del(col, image);
	await writeCollections();
}

export async function init () {
	// sync code here:
	ipcMain.handle('collections', () => getCollections());

	ipcMain.handle('get-collection', async (e, col) => getCollection(col));

	ipcMain.handle('add-to-collection', async (e, col, image) => addToCollection(col, image));

	ipcMain.handle('delete-from-collection', async (e, col, image) => deleteFromCollection(col, image));
}
import { ChildProcess, fork } from 'child_process';
import { ipcMain } from 'electron';
import path from 'path';import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { sleep } from '../lib/sleep.mjs';
import { config } from '../config.mjs';
import fs from 'fs/promises';
import { CACHE_DIR } from '../lib/config-paths.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const threads = config.threads;

/**
 * @typedef {Object} RequestMessage
 * @property {string} imgPath
 */

/**
 * @typedef {Object} ResponseMessage
 * @property {string} imgPath
 * @property {string} cachePath
 */

/**
 * @typedef {Object} ImgServer
 * @property {ChildProcess} process
 * @property {Record<string,ResponseMessage>} buffer
 */

/** @type {ImgServer[]} */
const servers = [];

const imgCache = {};

function bufKey (data) {
	return [data.imgPath, data.op].join(':');
}

function spawnServer () {
	const process = fork(path.join(__dirname, 'server.mjs'),{
		stdio: ['pipe', 'pipe', 'pipe', 'ipc']
	});

	const serv = {
		process,
		buffer: {}
	};

	/**
	 * @param {ResponseMessage} data 
	 */
	function handler (data) {
		serv.buffer[bufKey(data)] = data;
	}

	servers.push(serv);
	process.on('spawn', () => {
		process.on('message', handler);
		process.stderr.on('data', (data) => {
			if (config.debug) {
				console.error(data.toString());
			}
		});
	});
	process.on('exit', () => {
		const i = servers.findIndex(x => x === serv);
		servers.splice(i,1); // remove dead server
		spawnServer(); // replace dead server
	})
	process.on('error', (err) => {
		console.error(err.message);
	})
}

let turn = threads;
function nextServer () {
	turn = (turn + 1) % threads;
	return turn;
}

async function genThumbnail (imgPath, regenerate) {
	const serv = servers[nextServer()];
	let retries = 1500;

	/** @type {import('./server.mjs').OpType} */
	const op = config.useFileCache ? 'thumbnail-file' : 'thumbnail-buffer';

	const data = { imgPath, regenerate, op };

	serv.process.send(data);

	while (retries--) {
		const reply = serv.buffer[bufKey(data)];
		if (reply) {
			delete serv.buffer[bufKey(data)];
			return reply.cachePath;
		}

		await sleep(1);
	}

	// Should not get here!
	serv.process.kill('SIGKILL');

	await sleep(100);

	// Keep retrying
	return await genThumbnail(imgPath);
}

export async function getImageInfo (imgPath) {
	const serv = servers[nextServer()];
	let retries = 1500;

	const data = { imgPath, op: 'info' };

	serv.process.send(data);

	while (retries--) {
		const reply = serv.buffer[bufKey(data)];
		if (reply) {
			delete serv.buffer[bufKey(data)];
			return reply.info;
		}

		await sleep(1);
	}

	// Should not get here!
	serv.process.kill('SIGKILL');

	await sleep(100);

	// Keep retrying
	return await getImageInfo(imgPath);
}

export async function init () {
	for (let i=0; i < threads; i++) {
		spawnServer();
	}

	ipcMain.handle('thumbnail-buffer-spawn', async (e, imgPath, regenerate = false) => {
		if (!imgCache[imgPath] || regenerate) {
			imgCache[imgPath] = await genThumbnail(imgPath, regenerate);
		}

		if (regenerate) {
			setTimeout(() => e.sender.reloadIgnoringCache(), 200);
		}

		return imgCache[imgPath];
	})

	ipcMain.handle('img-info', async (e, imgPath) => {
		return await getImageInfo(imgPath);
	});

	ipcMain.handle('clear-thumbnail-file-cache', async () => {
		for (const k of Object.keys(imgCache)) {
			delete imgCache[k];
		}

		const thumbnails = await fs.readdir(CACHE_DIR);

		while (thumbnails.length) {
			const batch = thumbnails.splice(0, 100);
			await batch.map(f => fs.unlink(path.join(CACHE_DIR,f)));
		}
	})
}


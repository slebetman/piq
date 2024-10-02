import { ChildProcess, fork } from 'child_process';
import { ipcMain } from 'electron';
import path from 'path';import { dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
    
const __dirname = dirname(fileURLToPath(import.meta.url));
const threads = os.cpus().length;

/**
 * @typedef {Object} ImgServer
 * @property {ChildProcess} process
 * @property {string} buffer
 */

/** @type {ImgServer[]} */
const servers = [];

const imgCache = {};

function sleep (ms) {
	return new Promise((ok) => setTimeout(ok, ms));
}

function spawnServer () {
	const process = fork(path.join(__dirname, 'server.mjs'),{
		stdio: ['pipe', 'pipe', 'pipe', 'ipc']
	});

	const serv = {
		process,
		buffer: ''
	};
	servers.push(serv);
	process.on('spawn', () => process.stdout.on('data', (data) => {
		serv.buffer += data;
	}));
	process.on('exit', () => {
		// console.error('Thumbnailer died..');
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

async function genThumbnail (imgPath) {
	const serv = servers[nextServer()];
	let retries = 1500;

	serv.process.stdin.write(`${Buffer.from(imgPath).toString('base64')}\n`);

	while (retries--) {
		const newline = serv.buffer.indexOf('\n');
	
		if (newline != -1) {
			const line = serv.buffer.substring(0, newline);
			serv.buffer = serv.buffer.substring(newline+1);

			return line;
		}

		await sleep(1);
	}

	// Should not get here!
	serv.process.kill('SIGKILL');

	await sleep(100);

	// Keep retrying
	return await genThumbnail(imgPath);
}

export async function init () {
	for (let i=0; i < threads; i++) {
		spawnServer()
	}

	ipcMain.handle('thumbnail-buffer-spawn', async (e, imgPath) => {
		if (!imgCache[imgPath]) {
			imgCache[imgPath] = await genThumbnail(imgPath);
		}
		return imgCache[imgPath];
	})
}


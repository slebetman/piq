import { ChildProcess, fork } from 'child_process';
import { ipcMain } from 'electron';
import path from 'path';import { dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
    
const __dirname = dirname(fileURLToPath(import.meta.url));

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
		console.error('Thumbnail process died!');
		const i = servers.findIndex(x => x === serv);
		servers.splice(i,1); // remove dead server
		spawnServer(); // replace dead server
	})
}

async function genThumbnail (imgPath) {
	const i = Math.floor(Math.random() * servers.length);
	let retries = 100;

	try {
		servers[i].process.stdin.write(`${Buffer.from(imgPath).toString('base64')}\n`);

		while (retries--) {
			const newline = servers[i].buffer.indexOf('\n');
		
			if (newline != -1) {
				const line = servers[i].buffer.substring(0, newline);
				servers[i].buffer = servers[i].buffer.substring(newline+1);

				return line;
			}

			await sleep(10);
		}
	}
	catch (err) {
		console.error(err.message);
	}

	// Should not get here!
	servers[i].process.kill('SIGKILL');

	// Keep retrying
	return await genThumbnail(imgPath);
}

export async function init () {
	for (let i=0; i < (os.cpus().length * 2); i++) {
		spawnServer()
	}

	ipcMain.handle('thumbnail-buffer-spawn', async (e, imgPath) => {
		if (!imgCache[imgPath]) {
			imgCache[imgPath] = await genThumbnail(imgPath);
		}
		return imgCache[imgPath];
	})
}


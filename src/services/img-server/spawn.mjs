import { fork } from 'child_process';
import { ipcMain } from 'electron';
import path from 'path';import { dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
    
const __dirname = dirname(fileURLToPath(import.meta.url));

const servers = [];

function sleep (ms) {
	return new Promise((ok) => setTimeout(ok, ms));
}

function spawnServer () {
	const process = fork(path.join(__dirname, 'server.mjs'),{
		stdio: ['pipe', 'pipe', 'pipe', 'ipc']
	});

	console.log(process);

	if (!process) {
		return;
	}

	const serv = {
		process,
		buffer: ''
	};
	servers.push(serv);
	process.on('spawn', () => process.stdout.on('data', (data) => {
		serv.buffer += data;
	}));
	process.on('exit', () => {
		const i = servers.findIndex(x => x === serv);
		servers.splice(i,1); // remove dead server
	})
}

export async function init () {
	for (let i=0; i<os.cpus().length; i++) {
		spawnServer()
	}

	ipcMain.handle('thumbnail-buffer-spawn', async (e, imgPath) => {
		const i = Math.floor(Math.random() * servers.length);

		servers[i].process.stdin.write(`${Buffer.from(imgPath).toString('base64')}\n`);

		while (1) {
			const newline = servers[i].buffer.indexOf('\n');
		
			if (newline != -1) {
				const line = servers[i].buffer.substring(0, newline);
				servers[i].buffer = servers[i].buffer.substring(newline+1);

				return line;
			}

			await sleep(1);
		}
	})
}


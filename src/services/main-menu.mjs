import { app, BrowserWindow, dialog, Menu, nativeImage } from 'electron';
import path from 'path';
import { showOpenDialog } from './open-dialog.mjs';
import { mainWindows, openMainWindow } from '../views/main/lib.mjs';
import { config, readHistory, setConfig } from './config.mjs';
import { openConfigWindow } from '../views/preferences/lib.mjs';
import { getCollections } from './collections.mjs';

const isMac = process.platform === 'darwin'

const icon = nativeImage.createFromPath(
	path.normalize(
		path.join(import.meta.dirname, '../../icons/icon128.png')
	)
);

let aboutBoxVisible = false;

function macMenu () {
	if (isMac) {
		return [{
			label: app.name,
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{
					label: 'Settings',
					accelerator: 'Command+,',
					click: () => {
						openConfigWindow();
					}
				},
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideOthers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' }
			]
		}];
	}

	return [];
}

async function fileMenu (isViewer = false) {
	const history = await readHistory();

	return [
		{
			label: 'Open Folder',
			accelerator: 'CommandOrControl+O',
			click: async () => {
				const dir = await showOpenDialog();

				if (!dir.canceled) {
					const path = dir.filePaths[0];
					for (const w of mainWindows) {
						if (!w.currentPath) {
							w.window.webContents.send('dir', path);
							return;
						}
					}
			
					await openMainWindow(path);
				}
			}
		},
		{
			label: 'Open Recent',
			submenu: history.map(dirPath => {
				const dirName = path.basename(dirPath);
				return {
					label: dirName,
					click: async () => {
						await openMainWindow(dirPath);
					}
				}
			})
		},
		...(isViewer ? [{
			label: 'Toggle Info',
			accelerator: 'CommandOrControl+I',
			click: () => {
				const win = BrowserWindow.getFocusedWindow();
				win.webContents.send('toggle-info');
			}
		}] : []),
		...(isMac ? [] :[
			{
				label: 'Settings',
				accelerator: 'Control+,',
				click: () => {
					openConfigWindow();
				}
			},
			{ type: 'separator' },
			{ role: 'quit' },
		]),
		{ role: 'close' },
	];
}

async function collectionsMenu () {
	const cols = await getCollections();

	return cols.map(x => ({
		label: x
	}));
}

function debugMenu () {
	if (app.isPackaged) return [];

	return [{
		label: 'Debug',
		submenu : [
			{ role: 'toggleDevTools' },
			{ role: 'reload' },
			{
				label: 'Debug mode',
				type: 'checkbox',
				checked: config.debug,
				click: () => {
					setConfig('debug', !config.debug);
				}
			}
		]
	}];
}

/**
 * @param {"main" | "viewer"} type 
 * @returns 
 */
async function windowMenu (type = 'main') {
	const menu = [
		{ role: 'minimize' },
		{
			label: 'Toggle Full Screen',
			accelerator: 'CommandOrControl+F',
			click: () => {
				BrowserWindow.getFocusedWindow().webContents.send('toggle-fullscreen');
			}
		},
		{ type: 'separator' }
	];

	if (type === 'viewer') {
		menu.push(
			{
				label: 'Full Size',
				accelerator: 'CommandOrControl+1',
				click: () => {
					const win = BrowserWindow.getFocusedWindow();
					if (win) {
						win.webContents.send('resize', 1);
					}
				}
			},
			{
				label: '1/2 Size',
				accelerator: 'CommandOrControl+2',
				click: () => {
					const win = BrowserWindow.getFocusedWindow();
					if (win) {
						win.webContents.send('resize', 2);
					}
				}
			},
			{
				label: '1/3 Size',
				accelerator: 'CommandOrControl+3',
				click: () => {
					const win = BrowserWindow.getFocusedWindow();
					if (win) {
						win.webContents.send('resize', 3);
					}
				}
			},
			{
				label: '1/4 Size',
				accelerator: 'CommandOrControl+4',
				click: () => {
					const win = BrowserWindow.getFocusedWindow();
					if (win) {
						win.webContents.send('resize', 4);
					}
				}
			}
		)
	}
	else {
		menu.push({
			label: 'Collections',
			submenu: await collectionsMenu(),
		})
	}

	return menu;
}

function aboutMenu () {
	if (isMac) return [];

	return [{
		role: 'help',
		submenu: [
			{
				label: 'About',
				click: async () => {
					if (aboutBoxVisible === false) {
						aboutBoxVisible = true;
						await dialog.showMessageBox({
							type: 'info',
							title: 'About Piq',
							icon,
							message: 
								'Piq: Simple image browser.\n' +
								`Version ${app.getVersion()}\n` +
								'Copyright © 2024 Adly Abdullah <slebetman@gmail.com>'
						})
						aboutBoxVisible = false;
					}
				}
			},
		]
	}];
}

export async function setMainMenu () {
	const mainMenu = Menu.buildFromTemplate([
		...macMenu(),
		{
			label: 'File',
			submenu: await fileMenu(),
		},
		{
			role: 'window',
			submenu: await windowMenu('main'),
		},
		...debugMenu(),
		...aboutMenu(),
	]);

	Menu.setApplicationMenu(mainMenu);
}

export async function setViewerMenu () {
	const mainMenu = Menu.buildFromTemplate([
		...macMenu(),
		{
			label: 'File',
			submenu: await fileMenu(true),
		},
		{
			role: 'window',
			submenu: await windowMenu('viewer'),
		},
		...debugMenu(),
		...aboutMenu(),
	]);

	Menu.setApplicationMenu(mainMenu);
}

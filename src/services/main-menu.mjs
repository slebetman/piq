import { app, dialog, Menu, nativeImage } from "electron";
import path from 'path';
import { showOpenDialog } from "./open-dialog.mjs";
import { mainWindows, openMainWindow } from "../views/main/lib.mjs";
import { config, readHistory, setConfig } from "./config.mjs";
import { openConfigWindow } from "../views/preferences/lib.mjs";

const isMac = process.platform === 'darwin'
const notMac = !isMac;

let aboutBoxVisible = false;

export async function setMainMenu () {
	const icon = nativeImage.createFromPath(
		path.normalize(
			path.join(import.meta.dirname, '../../icons/icon128.png')
		)
	);

	const history = await readHistory();

	const mainMenu = Menu.buildFromTemplate([
		...(isMac ? [{
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
		}] : []),
		{
			label: 'File',
			submenu: [
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
			]
		},
		{
			role: 'window',
			submenu: [
				{ role: 'minimize' },
				{ role: 'close' },
			]
		 },
		...(app.isPackaged ? [] : [{
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
		}]),
		...(notMac ? [{
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
		}] : [])
	]);

	Menu.setApplicationMenu(mainMenu);
}
import { BrowserWindow, clipboard, ipcMain, Menu, nativeImage } from 'electron';
import open from 'open';
import path from 'path';
import sharp from 'sharp';
import trash from 'trash';
import { config } from './config.mjs';

const fileManager = process.platform === 'darwin' ? 'Finder'
	: process.platform === 'win32' ? 'File Explorer'
	: 'File Manager';

function getOpenWithMenu (filePath) {
	const menu = config.editors
		.filter(editor => {
			const { extensions } = editor;
			const ext = extensions.replace(/\*/g,'.*');
			return filePath.match(new RegExp(`\\.(${ext})$`));
		})
		.map(editor => {
			const { name } = editor;

			return {
				label: `Open with ${name[0].toUpperCase() + name.slice(1)}`,
				click: () => {
					open(filePath, {app: {name}});
				}
			}
		});
	
	if (menu.length <= 3) {
		return menu;
	}
	else {
		return [
			{
				label: 'Open with',
				submenu: menu.map(x => {
					x.label = x.label.replace(/^Open with /,'');
					return x;
				})
			}
		]
	}
}

export async function init () {
	ipcMain.handle('context-menu-img', async (e, filePath, thumbnail = false) => {
		const sender = e.sender;

		const template = [
			{
				label: 'Open',
				click: () => {
					open(filePath);
				}
			},
			...getOpenWithMenu(filePath),
			{ type: 'separator'},
			{
				label: 'Copy file path',
				click: () => {
					clipboard.writeText(filePath);
				}
			},
			{
				label: 'Copy directory path',
				click: () => {
					clipboard.writeText(path.dirname(filePath));
				}
			},
			{
				label: 'Copy image',
				click: async () => {
					const imgBuffer = await sharp(filePath).png().toBuffer();
					const img = nativeImage.createFromBuffer(imgBuffer);
					clipboard.writeImage(img);
				}
			},
			{ type: 'separator'},
			... (thumbnail ? [{
				label: 'Regenerate thumbnail',
				click: () => {
					sender.send('thumbnail-regenerate', filePath);
				}
			}] : []),
			{
				label: 'Move to Trash',
				click: () => {
					trash(filePath,{
						glob: false
					})
				}
			},
		];

		const menu = Menu.buildFromTemplate(template);
		menu.popup();
	});

	ipcMain.handle('context-menu-dir', async (e, filePath) => {
		const template = [
			{
				label: `Open in ${fileManager}`,
				click: () => {
					open(filePath);
				}
			},
			{
				label: 'Copy folder path',
				click: () => {
					clipboard.writeText(filePath);
				}
			},
			{ type: 'separator'},
			{
				label: 'Move to Trash',
				click: () => {
					trash(filePath,{
						glob: false
					})
				}
			},
		];

		const menu = Menu.buildFromTemplate(template);
		menu.popup();
	});
}
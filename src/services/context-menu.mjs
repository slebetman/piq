import { BrowserWindow, clipboard, ipcMain, Menu, nativeImage, shell } from 'electron';
import open from 'open';
import path from 'path';
import sharp from 'sharp';
import trash from 'trash';
import { config, updateConfigFile } from './config.mjs';

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

/**
 * @param {BrowserWindow} win 
 */
function setAsDefaultMenu (win, thumbnailSize) {
	return {
		label: 'Settings',
		submenu: [{
			label: 'Set as default window size',
			click: () => {
				const {width, height} = win.getBounds();
				config.defaultBrowserWidth = width;
				config.defaultBrowserHeight = height;
				updateConfigFile();
			}
		},{
			label: 'Set as default thumbnail size',
			click: () => {
				config.defaultThumbnailSize = thumbnailSize;
				updateConfigFile();
			}
		}]
	}
}

export async function init () {
	ipcMain.handle('context-menu-img', async (e, filePath, thumbnailSize = 0) => {
		const sender = e.sender;
		const win = BrowserWindow.fromWebContents(sender);

		const template = [
			{
				label: 'Open',
				click: () => {
					open(filePath);
				}
			},
			{
				label: `Reveal in ${fileManager}`,
				click: () => {
					shell.showItemInFolder(filePath);
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
				label: 'Copy folder path',
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
			... (thumbnailSize ? [
				setAsDefaultMenu(win, thumbnailSize),
				{
					label: 'Regenerate thumbnail',
					click: () => {
						sender.send('thumbnail-regenerate', filePath);
					}
				}] : []
			),
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

	ipcMain.handle('context-menu-dir', async (e, filePath, thumbnailSize) => {
		const sender = e.sender;
		const win = BrowserWindow.fromWebContents(sender);
		
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
			setAsDefaultMenu(win, thumbnailSize),
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

	ipcMain.handle('context-menu-empty', async (e, filePath, thumbnailSize = 0) => {
		const sender = e.sender;
		const win = BrowserWindow.fromWebContents(sender);

		const template = [
			{
				label: `Open folder in ${fileManager}`,
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
			setAsDefaultMenu(win, thumbnailSize),
		];

		const menu = Menu.buildFromTemplate(template);
		menu.popup();
	});
}
import { clipboard, ipcMain, Menu, nativeImage } from 'electron';
import open from 'open';
import path from 'path';
import sharp from 'sharp';
import trash from 'trash';
import { config } from './config.mjs';

const fileManager = process.platform === 'darwin' ? 'Finder'
	: process.platform === 'win32' ? 'File Explorer'
	: 'File Manager';

export async function init () {
	ipcMain.handle('context-menu-img', async (e, filePath) => {
		const template = [
			{
				label: 'Open',
				click: () => {
					open(filePath);
				}
			},
			... config.editors.map(editor => ({
				label: `Open with ${editor[0].toUpperCase() + editor.slice(1)}`,
				click: () => {
					open(filePath, {app: {name: editor}});
				}
			})),
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
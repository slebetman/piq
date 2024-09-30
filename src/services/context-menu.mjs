import { clipboard, ipcMain, Menu, nativeImage } from 'electron';
import open from 'open';
import path from 'path';
import sharp from 'sharp';
import trash from 'trash';

export async function init () {
	ipcMain.handle('context-menu-img', async (e, filePath) => {
		const template = [
			{
				label: 'Open',
				click: () => {
					open(filePath);
				}
			},
			{
				label: 'Open with Gimp',
				click: () => {
					open(filePath, {app: {name: 'gimp'}});
				}
			},
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
}
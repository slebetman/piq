import { ipcMain, Menu } from "electron";
import open from "open";


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
			}
		];

		const menu = Menu.buildFromTemplate(template);
		menu.popup();
	});
}
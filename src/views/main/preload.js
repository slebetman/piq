const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	getConfig: () => {
		return ipcRenderer.invoke('config');
	},
	openDir: async () => {
		const dir = await ipcRenderer.invoke('open');

		if (!dir.canceled) {
			const path = dir.filePaths[0];

			const files = await ipcRenderer.invoke('dir-list', path);
			return { files, path };
		}

		return null;
	},
	listDir: async (path) => {
		return await ipcRenderer.invoke('dir-list', path);
	},
	normalizePath: async (path) => {
		return await ipcRenderer.invoke('path-normalize', path);
	},
	imgInfo: async (path) => {
		return await ipcRenderer.invoke('img-info', path);
	},
	viewImage: async (path) => {
		return await ipcRenderer.invoke('viewer', path);
	}
})
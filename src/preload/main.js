const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	getConfig: () => {
		return ipcRenderer.invoke('config');
	},
	openDir: async () => {
		const dir = await ipcRenderer.invoke('open');

		if (!dir.canceled) {
			const files = await ipcRenderer.invoke('dir-list', dir.filePaths[0]);
			return files;
		}

		return null;
	},
	listDir: async (path) => {
		return await ipcRenderer.invoke('dir-list', path);
	}
})
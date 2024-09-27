const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	imgListener: (callback) => {
		ipcRenderer.on('image', (e, stat) => {
			callback(stat);
		})
	},
	contextMenu: async (filePath) => {
		await ipcRenderer.invoke('context-menu-img', filePath);
	},
})
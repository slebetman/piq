const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	imgListener: (callback) => {
		ipcRenderer.on('image', (e, files, index) => {
			callback(files, index);
		})
	},
	contextMenuImg: async (filePath) => {
		await ipcRenderer.invoke('context-menu-img', filePath);
	},
	normalizePath: async (path) => {
		return await ipcRenderer.invoke('path-normalize', path);
	},
	imgInfo: async (path) => {
		return await ipcRenderer.invoke('img-info', path);
	},
	wrapWindow: async (width, height) => {
		return await ipcRenderer.invoke('wrap-window', width, height);
	},
	updateCurrentPath: (path) => {
		ipcRenderer.send('current-path', path);
	}
})
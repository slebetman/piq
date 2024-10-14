const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	getConfig: () => {
		return ipcRenderer.invoke('config');
	},
	imgListener: (callback) => {
		ipcRenderer.on('image', (e, files, index) => {
			callback(files, index);
		})
	},
	infoListener: (callback) => {
		ipcRenderer.on('toggle-info', () => callback());
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
	fileStat: async (path) => {
		return await ipcRenderer.invoke('file-stat', path);
	},
	wrapWindow: async (width, height) => {
		return await ipcRenderer.invoke('wrap-window', width, height);
	},
	updateCurrentPath: (path) => {
		ipcRenderer.send('current-path', path);
	},
	fullScreenToggleListener: (callback) => {
		ipcRenderer.on('toggle-fullscreen', callback);
	},
	resizeListener: (callback) => {
		ipcRenderer.on('resize', async (e, divisor) => {
			ipcRenderer.send('resize', await callback(divisor));
		})
	},
})